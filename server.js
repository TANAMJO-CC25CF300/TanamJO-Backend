const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
require("dotenv").config();

const { AuthPlugin, PredictPlugin, PlantPlugin } = require("./src");
const PredictService = require("./src/services/predictService");
const AuthService = require("./src/services/authService");

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: "localhost",
    routes: {
      cors: { origin: ["*"] },
    },
  });

  await server.register(Jwt); // ✅ Daftar plugin jwt

  // ✅ Strategi auth jwt
  server.auth.strategy('jwt', 'jwt', {
    keys: process.env.JWT_SECRET,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      // maxAgeSec: 86400,
    },
    validate: (artifacts, request, h) => {
      return {
        isValid: true,
        credentials: { userId: artifacts.decoded.payload.userId },
      };
    },
  });

  // Tidak wajib default, tapi bisa:
  // server.auth.default('jwt');

  const predictService = new PredictService();

  await server.register([
    {
      plugin: PredictPlugin,
      options: { service: predictService },
    },
    { plugin: AuthPlugin },
    { plugin: PlantPlugin },
  ]);

  await server.start();
  console.log("✅ Server running on", server.info.uri);
};

init();
