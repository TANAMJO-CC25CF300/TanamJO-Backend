const { pool } = require('../config/db');
const { userUpdateSchema } = require('../validations/userValidation');
const bcrypt = require('bcrypt');

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
        'SELECT u.id, u.name, u.email, u.gender, u.poin, u.user_level_id, ul.name as level_name, ul.minimum_poin FROM "user" u JOIN user_level ul ON u.user_level_id = ul.id WHERE u.id = $1',
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

  async updateUserHandler(request, h) {
    try {
      const { id } = request.params;
      const { name, email, gender } = request.payload;

      // Validate input
      const { error } = userUpdateSchema.validate({ name, email, gender });
      if (error) {
        return h.response({
          status: 'fail',
          message: 'Validation error',
          error: error.details[0].message
        }).code(400);
      }

      const result = await pool.query(
        'UPDATE "user" SET name = $1, email = $2, gender = $3 WHERE id = $4 RETURNING id, name, email, gender',
        [name, email, gender, id]
      );

      if (result.rows.length === 0) {
        return h.response({
          status: 'fail',
          message: 'User not found',
        }).code(404);
      }

      return h.response({
        status: 'success',
        message: 'User updated successfully',
        data: {
          user: result.rows[0],
        },
      }).code(200);
    } catch (error) {
      console.error('Error updating user:', error);
      return h.response({
        status: 'fail',
        message: 'Error updating user',
        error: error.message,
        detail: error.detail,
      }).code(500);
    }
  }

  async updatePasswordHandler(request, h) {
    try {
      const { id } = request.params;
      const { oldPassword, newPassword } = request.payload;

      // First verify the old password
      const user = await pool.query(
        'SELECT password FROM "user" WHERE id = $1',
        [id]
      );

      if (user.rows.length === 0) {
        return h.response({
          status: 'fail',
          message: 'User not found',
        }).code(404);
      }

      // Verify the old password - compare plain text with stored hash
      const isPasswordValid = await bcrypt.compare(oldPassword, user.rows[0].password);
      if (!isPasswordValid) {
        return h.response({
          status: 'fail',
          message: 'Current password is incorrect',
        }).code(400);
      }

      // Hash the new password and update
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await pool.query(
        'UPDATE "user" SET password = $1 WHERE id = $2',
        [hashedNewPassword, id]
      );

      return h.response({
        status: 'success',
        message: 'Password updated successfully',
      }).code(200);
    } catch (error) {
      console.error('Error updating password:', error);
      return h.response({
        status: 'fail',
        message: 'Error updating password',
        error: error.message,
        detail: error.detail,
      }).code(500);
    }
  }
}

module.exports = UserHandler; 