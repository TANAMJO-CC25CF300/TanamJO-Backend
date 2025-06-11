const { pool } = require('../config/db');

class PlantService {
  // Konversi umur tanaman dari format '2 DSS' / '15 DAP' menjadi integer plant_age
  convertPlantAge(input) {
    if (typeof input !== 'string') {
    throw new Error('ageInput harus berupa string, misal "2 DAP"');
    }

    const [valueStr, unit] = input.split(' ');
    const value = parseInt(valueStr);

    if (unit === 'DSS') return value - 8; // 2 DSS = -6
    if (unit === 'DAP') return value;     // 15 DAP = 15
    return null;
  }

  // Menentukan fase berdasarkan umur tanaman
  determinePhase(age) {
    if (age >= -7 && age <= 0) return 'preparation';
    if (age >= 1 && age <= 21) return 'seeding';
    if (age >= 22 && age <= 24) return 'transplanting';
    if (age >= 25 && age <= 55) return 'vegetative';
    if (age >= 56 && age <= 90) return 'generative';
    return null;
  }

  // POST: Tambah tanaman baru + description awal
  async postPlant(userId, name, ageInput, descriptionText) {
    const plantAge = this.convertPlantAge(ageInput);
    const phase = this.determinePhase(plantAge);

    try {
      const plantRes = await pool.query(
        `INSERT INTO plant (user_id, name, phase, plant_age, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`,
        [userId, name, phase, plantAge]
      );

      const plantId = plantRes.rows[0].id;

      await pool.query(
        `INSERT INTO description (plant_id, phase, plant_age, content, source, created_at)
         VALUES ($1, $2, $3, $4, 'user', NOW())`,
        [plantId, phase, plantAge, descriptionText]
      );

      return { plantId };
    } catch (err) {
      console.error('Error postPlant:', err);
      throw new Error('FAILED_TO_POST_PLANT');
    }
  }

  // GET: Ambil semua tanaman milik user + deskripsi sesuai usia tanaman terakhir
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
          description: descRes.rows[0]?.content || null
        });
      }

      return results;
    } catch (err) {
      console.error('Error getUserPlants:', err);
      throw new Error('FAILED_TO_GET_PLANTS');
    }
  }
}

module.exports = PlantService;
