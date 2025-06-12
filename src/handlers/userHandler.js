const { pool } = require("../config/db");
const { userUpdateSchema } = require("../validations/userValidation");
const bcrypt = require("bcrypt");
const UserService = require("../services/userService");

class UserHandler {
  constructor() {
    this.userService = new UserService();
    this.getAllUsersHandler = this.getAllUsersHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
    this.updateUserHandler = this.updateUserHandler.bind(this);
    this.updatePasswordHandler = this.updatePasswordHandler.bind(this);
    this.updateUserLevelHandler = this.updateUserLevelHandler.bind(this);
    this.updateUserPointsHandler = this.updateUserPointsHandler.bind(this);
  }

  async getAllUsersHandler(request, h) {
    try {
      const result = await pool.query(
        'SELECT id, name, email, gender FROM "user"'
      );

      return h
        .response({
          status: "success",
          data: {
            users: result.rows,
          },
        })
        .code(200);
    } catch (error) {
      console.error("Error getting users:", error);
      return h
        .response({
          status: "fail",
          message: "Error retrieving users",
          error: error.message,
          detail: error.detail,
        })
        .code(500);
    }
  }

  async getUserByIdHandler(request, h) {
    try {
      const { id } = request.params;
      console.log("Fetching user with ID:", id);

      // First update the user's level based on their points
      await this.updateUserLevelHandler({ params: { id } }, h);

      const result = await pool.query(
        'SELECT u.id, u.name, u.email, u.gender, u.poin, u.user_level_id, ul.name as level_name, ul.minimum_poin FROM "user" u JOIN user_level ul ON u.user_level_id = ul.id WHERE u.id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return h
          .response({
            status: "fail",
            message: "User not found",
          })
          .code(404);
      }

      return h
        .response({
          status: "success",
          data: {
            user: result.rows[0],
          },
        })
        .code(200);
    } catch (error) {
      console.error("Error getting user:", error);
      return h
        .response({
          status: "fail",
          message: "Error retrieving user",
          error: error.message,
          detail: error.detail,
        })
        .code(500);
    }
  }

  async updateUserHandler(request, h) {
    try {
      const { id } = request.params;
      const { name, email, gender } = request.payload;

      // Validate input
      const { error } = userUpdateSchema.validate({ name, email, gender });
      if (error) {
        return h
          .response({
            status: "fail",
            message: "Validation error",
            error: error.details[0].message,
          })
          .code(400);
      }

      const result = await pool.query(
        'UPDATE "user" SET name = $1, email = $2, gender = $3 WHERE id = $4 RETURNING id, name, email, gender',
        [name, email, gender, id]
      );

      if (result.rows.length === 0) {
        return h
          .response({
            status: "fail",
            message: "User not found",
          })
          .code(404);
      }

      return h
        .response({
          status: "success",
          message: "User updated successfully",
          data: {
            user: result.rows[0],
          },
        })
        .code(200);
    } catch (error) {
      console.error("Error updating user:", error);
      return h
        .response({
          status: "fail",
          message: "Error updating user",
          error: error.message,
          detail: error.detail,
        })
        .code(500);
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
        return h
          .response({
            status: "fail",
            message: "User not found",
          })
          .code(404);
      }

      // Verify the old password - compare plain text with stored hash
      const isPasswordValid = await bcrypt.compare(
        oldPassword,
        user.rows[0].password
      );
      if (!isPasswordValid) {
        return h
          .response({
            status: "fail",
            message: "Current password is incorrect",
          })
          .code(400);
      }

      // Hash the new password and update
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE "user" SET password = $1 WHERE id = $2', [
        hashedNewPassword,
        id,
      ]);

      return h
        .response({
          status: "success",
          message: "Password updated successfully",
        })
        .code(200);
    } catch (error) {
      console.error("Error updating password:", error);
      return h
        .response({
          status: "fail",
          message: "Error updating password",
          error: error.message,
          detail: error.detail,
        })
        .code(500);
    }
  }

  async updateUserLevelHandler(request, h) {
    try {
      const { id } = request.params;

      // Get user's current points
      const userResult = await pool.query(
        'SELECT poin FROM "user" WHERE id = $1',
        [id]
      );

      if (userResult.rows.length === 0) {
        return h
          .response({
            status: "fail",
            message: "User not found",
          })
          .code(404);
      }

      const userPoints = userResult.rows[0].poin;

      // Find the appropriate level based on points
      const levelResult = await pool.query(
        "SELECT id, name, minimum_poin FROM user_level WHERE minimum_poin <= $1 ORDER BY minimum_poin DESC LIMIT 1",
        [userPoints]
      );

      if (levelResult.rows.length > 0) {
        const newLevel = levelResult.rows[0];

        // Update user's level
        await pool.query('UPDATE "user" SET user_level_id = $1 WHERE id = $2', [
          newLevel.id,
          id,
        ]);

        return h
          .response({
            status: "success",
            message: "User level updated successfully",
            data: {
              user_id: id,
              points: userPoints,
              new_level: {
                id: newLevel.id,
                name: newLevel.name,
                minimum_points: newLevel.minimum_poin,
              },
            },
          })
          .code(200);
      }

      return h
        .response({
          status: "fail",
          message: "No appropriate level found for the user's points",
        })
        .code(400);
    } catch (error) {
      console.error("Error updating user level:", error);
      return h
        .response({
          status: "fail",
          message: "Error updating user level",
          error: error.message,
          detail: error.detail,
        })
        .code(500);
    }
  }
  async updateUserPointsHandler(request, h) {
    try {
      const { id } = request.params;
      console.log(`[HAPI] Received request to update points for user: ${id}`);
      // Call the UserService method to recalculate and update points
      await this.userService.updateUserPoints(id);

      return h
        .response({
          status: "success",
          message: "User points recalculated and updated successfully",
        })
        .code(200);
    } catch (error) {
      console.error(
        "[ERROR] Failed to handle user points update request:",
        error
      );
      return h
        .response({
          status: "fail",
          message: "Failed to update user points",
          error: error.message,
          detail: error.detail,
        })
        .code(500);
    }
  }
}

module.exports = UserHandler;
