const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
require("dotenv").config();

const { AuthPlugin, PredictPlugin, PlantPlugin, CheckinPlugin } = require("./src");
const PredictService = require("./src/services/predictService");

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: "localhost",
    routes: { cors: { origin: ["*"] } },
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

  const predictService = new PredictService();

  await server.register([
    { plugin: AuthPlugin },
    { plugin: PlantPlugin },
    { plugin: PredictPlugin, options: { service: predictService } },
    { plugin: CheckinPlugin },
  ]);

  await server.start();
  console.log("✅ Server running on", server.info.uri);
};

init();