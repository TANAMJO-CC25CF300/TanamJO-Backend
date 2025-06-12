const { pool } = require('../config/db');

class UserService {
  // Fungsi ini menghitung ulang poin user berdasarkan task yang sudah dikerjakan
  async updateUserPoints(userId) {
    try {
      const result = await pool.query(
        `
        SELECT SUM(task.point) as total_point
        FROM user_task
        JOIN task ON task.id = user_task.task_id
        WHERE user_task.user_id = $1
        `,
        [userId]
      );

      const totalPoint = result.rows[0].total_point || 0;

      await pool.query(
        `UPDATE "user" SET point = $1 WHERE id = $2`,
        [totalPoint, userId]
      );

      console.log(`[POIN] User ${userId} diupdate ke ${totalPoint}`);
    } catch (err) {
      console.error('[ERROR UPDATE POIN USER]', err);
      throw err;
    }
  }
}

module.exports = UserService;
