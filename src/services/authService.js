const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
require('dotenv').config();

class AuthService {
  async register(email, password) {
    // Perbaikan: pakai "user" dengan tanda kutip
    const checkUser = await pool.query(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    );

    if (checkUser.rows.length > 0) {
      throw new Error('EMAIL_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO "user" (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    return result.rows[0]; // return { id, email }
  }

  async login(email, password) {
    // Perbaikan: pakai "user" dengan tanda kutip
    const result = await pool.query(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      throw new Error('EMAIL_NOT_FOUND');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('INVALID_PASSWORD');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return {
      token,
      user: { id: user.id, email: user.email }
    };
  }
}

module.exports = AuthService;
