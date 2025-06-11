require("dotenv").config();
const Hapi = require("@hapi/hapi");

const { AuthPlugin, PredictPlugin, UserPlugin } = require("./src"); // Tambahkan UserPlugin
const PredictService = require("./src/services/predictService");

const AuthRoutes = require("./src/routes/authRoutes");
const AuthService = require("./src/services/authService");
const AuthHandler = require("./src/handlers/authHandler");
const predict = require("./src/index");

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

  // server.route(AuthRoutes(authHandler));

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
    {
      plugin: UserPlugin,
    },
  ]);

  await server.start();
  console.log("Server running on", server.info.uri);
};

init();
