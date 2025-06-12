const { pool } = require("../config/db");

class PlantService {
  convertPlantAge(input) {
    if (typeof input !== "string" || !input.includes(" ")) {
      throw new Error(
        'ageInput harus berupa string, misalnya: "2 DAP" atau "3 DSS".'
      );
    }

    const [valueStr, unit] = input.trim().split(" ");
    const value = parseInt(valueStr);

    if (isNaN(value)) {
      throw new Error("Nilai umur tidak valid, harus berupa angka.");
    }

    if (unit === "DSS") return value - 8;
    if (unit === "DAP") return value;

    throw new Error('Unit umur tanaman tidak valid. Gunakan "DSS" atau "DAP".');
  }

  determinePhase(age) {
    if (age >= -7 && age <= 0) return "preparation";
    if (age >= 1 && age <= 21) return "seeding";
    if (age >= 22 && age <= 24) return "transplanting";
    if (age >= 25 && age <= 55) return "vegetative";
    if (age >= 56 && age <= 90) return "generative";
    throw new Error(
      "Umur tanaman di luar rentang yang diizinkan (-7 s/d 90 hari)."
    );
  }

  async postPlant(userId, name, ageInput, descriptionText, userPhase) {
    const plantAge = this.convertPlantAge(ageInput);
    const phase = userPhase || this.determinePhase(plantAge);

    if (!userId) {
      throw new Error("User ID tidak ditemukan dari token.");
    }

    if (!descriptionText || descriptionText.trim() === "") {
      throw new Error("Deskripsi tanaman tidak boleh kosong.");
    }

    try {
      const plantRes = await pool.query(
        `INSERT INTO plant (user_id, name, phase, plant_age, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`,
        [userId, name, phase, plantAge]
      );

      const plantId = plantRes.rows[0].id;

      await pool.query(
        `INSERT INTO description (plant_id, phase, plant_age, content, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [plantId, phase, plantAge, descriptionText]
      );

      return { plantId };
    } catch (err) {
      console.error("[POST Plant Error]", err);
      throw new Error("FAILED_TO_POST_PLANT");
    }
  }

  async getUserPlants(userId) {
    try {
      const plantRes = await pool.query(
        `SELECT id, name, phase, plant_age FROM plant WHERE user_id = $1`,
        [userId]
      );

      const results = [];

      for (const plant of plantRes.rows) {
        const descRes = await pool.query(
          `SELECT content FROM description
           WHERE plant_id = $1 AND plant_age = $2
           ORDER BY created_at DESC LIMIT 1`,
          [plant.id, plant.plant_age]
        );

        results.push({
          ...plant,
          description: descRes.rows[0]?.content || null,
        });
      }

      return results;
    } catch (err) {
      console.error("[GET Plant Error]", err);
      throw new Error("FAILED_TO_GET_PLANTS");
    }
  }

  async updatePlantAges() {
    try {
      const { rows: plants } = await pool.query(
        "SELECT id, plant_age FROM plant"
      );

      for (const plant of plants) {
        const newAge = plant.plant_age + 1;
        const newPhase = this.determinePhase(newAge);

        await pool.query(
          `UPDATE plant
           SET plant_age = $1, phase = $2, updated_at = NOW()
           WHERE id = $3`,
          [newAge, newPhase, plant.id]
        );
      }

      console.log(`[AUTO UPDATE] plant_age semua tanaman berhasil diperbarui.`);
    } catch (err) {
      console.error("[AUTO UPDATE ERROR]", err);
      throw new Error("FAILED_TO_AUTO_UPDATE_PLANTS");
    }
  }
}

module.exports = PlantService;
