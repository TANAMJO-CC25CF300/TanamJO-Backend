require("dotenv").config();
const Hapi = require("@hapi/hapi");

const { AuthPlugin, PredictPlugin } = require("./src"); // Ambil dua plugin
const PredictService = require("./src/services/predictService");

const AuthRoutes = require("./src/routes/authRoutes");
const AuthService = require("./src/services/authService");
const AuthHandler = require("./src/handlers/authHandler");

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: "localhost",
    routes: {
      cors: {
        origin: ["*"], // sesuaikan jika perlu
      },
    },
  });

  // Inisialisasi service
  const predictService = new PredictService();
  const authService = new AuthService();
  const authHandler = new AuthHandler(authService);

  // Register plugin predicts (model image prediction)
  await server.register([
  {
    plugin: PredictPlugin,
    options: {
      service: predictService,
    },
  },
  {
    plugin: AuthPlugin,
  },
]);


  await server.start();
  console.log("Server running on", server.info.uri);
};

init();
