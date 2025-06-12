const { pool } = require("../config/db");
const UserService = require("./userService");

class CheckinService {
  async getTasksAndTips(userId) {
    const plant = await pool.query(
      `SELECT id, plant_age FROM plant WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1`,
      [userId]
    );

    if (plant.rows.length === 0) {
      throw new Error("USER_HAS_NO_PLANT");
    }

    const { plant_age } = plant.rows[0];

    const tasksRes = await pool.query(
      `SELECT t.id, t.title,
          COALESCE(ut.completed, FALSE) AS done,
          ut.completed_at
       FROM task t
       LEFT JOIN user_task ut ON ut.task_id = t.id AND ut.user_id = $1
       WHERE t.plant_age = $2`,
      [userId, plant_age]
    );

    const tipsRes = await pool.query(
      `SELECT content FROM tips WHERE plant_age = $1`,
      [plant_age]
    );

    return {
      plant_age,
      tasks: tasksRes.rows,
      tips: tipsRes.rows.map((t) => t.content),
    };
  }

  async submitCheckin(userId, taskIds = [], descriptionContent) {
    const plant = await pool.query(
      `SELECT id, plant_age, phase FROM plant WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1`,
      [userId]
    );

    if (plant.rows.length === 0) throw new Error("USER_HAS_NO_PLANT");

    const { id: plantId, plant_age, phase } = plant.rows[0];

    for (const taskId of taskIds) {
      await pool.query(
        `INSERT INTO user_task (user_id, task_id, completed, completed_at)
       VALUES ($1, $2, TRUE, NOW())
       ON CONFLICT (user_id, task_id) DO NOTHING`,
        [userId, taskId]
      );
    }

    if (descriptionContent && descriptionContent.trim() !== "") {
      await pool.query(
        `INSERT INTO description (plant_id, phase, plant_age, content, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
        [plantId, phase, plant_age, descriptionContent]
      );
    }

    const userService = new UserService();
    await userService.updateUserPoints(userId);

    return { status: "checkin recorded" };
  }
}

module.exports = CheckinService;
