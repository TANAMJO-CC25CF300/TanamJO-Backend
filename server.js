const Hapi = require("@hapi/hapi");
require("dotenv").config();

const predict = require("./src");
const PredictService = require("./src/service");

const init = async () => {
  const predictService = new PredictService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: "localhost",
  });

  await server.register([
    {
      plugin: predict,
      options: {
        service: predictService,
      },
    },
  ]);

  await server.start();
  console.log("Server running on", server.info.uri);
};

init();
