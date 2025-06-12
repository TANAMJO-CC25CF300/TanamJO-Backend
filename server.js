require("dotenv").config();
const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");

const {
  AuthPlugin,
  PredictPlugin,
  UserPlugin,
  PlantPlugin,
  CheckinPlugin,
} = require("./src");

const PredictService = require("./src/services/predictService");
const AuthService = require("./src/services/authService");
const AuthHandler = require("./src/handlers/authHandler");
const predict = require("./src/index");

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: "localhost",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register(Jwt);

  server.auth.strategy("jwt", "jwt", {
    keys: process.env.JWT_SECRET,
    verify: { aud: false, iss: false, sub: false },
    validate: (artifacts, request, h) => {
      const userId = artifacts.decoded.payload.userId;
      if (!userId) return { isValid: false, credentials: {} };
      return { isValid: true, credentials: { userId } };
    },
  });

  server.auth.default("jwt");

  // Inisialisasi service
  const predictService = new PredictService();
  const authService = new AuthService();
  const authHandler = new AuthHandler(authService);

  await server.register([
    { plugin: AuthPlugin },
    { plugin: PlantPlugin },
    { plugin: PredictPlugin, options: { service: predictService } },
    { plugin: CheckinPlugin },
    { plugin: UserPlugin },
  ]);

  await server.start();
  console.log("✅ Server running on", server.info.uri);

  const cron = require('node-cron');
  const PlantService = require('./src/services/plantService');
  const plantService = new PlantService();

  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Menjalankan pembaruan usia tanaman...');
    await plantService.updatePlantAges();
  });

};

init();
