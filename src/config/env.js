require("dotenv").config();

const env = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  HOST: process.env.HOST || "localhost",

  // Database Configuration (jika diperlukan)
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT Configuration (jika diperlukan)
  JWT_SECRET: process.env.JWT_SECRET,

  // API Keys (jika diperlukan)
  API_KEY: process.env.API_KEY,
};

module.exports = env;
