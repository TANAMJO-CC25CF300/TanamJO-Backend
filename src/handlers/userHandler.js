const { pool } = require('../config/db');

class UserHandler {
  async getAllUsersHandler(request, h) {
    try {
      const result = await pool.query(
        'SELECT id, name, email, gender FROM "user"'
      );
      
      return h.response({
        status: 'success',
        data: {
          users: result.rows,
        },
      }).code(200);
    } catch (error) {
      console.error('Error getting users:', error);
      return h.response({
        status: 'fail',
        message: 'Error retrieving users',
        error: error.message,
        detail: error.detail,
      }).code(500);
    }
  }

  async getUserByIdHandler(request, h) {
    try {
      const { id } = request.params;
      console.log('Fetching user with ID:', id);
      
      const result = await pool.query(
        'SELECT id, name, email, gender FROM "user" WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return h.response({
          status: 'fail',
          message: 'User not found',
        }).code(404);
      }

      return h.response({
        status: 'success',
        data: {
          user: result.rows[0],
        },
      }).code(200);
    } catch (error) {
      console.error('Error getting user:', error);
      return h.response({
        status: 'fail',
        message: 'Error retrieving user',
        error: error.message,
        detail: error.detail,
      }).code(500);
    }
  }
}

module.exports = UserHandler; 