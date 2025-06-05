const PredictHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "predicts",
  version: "1.0.0",
  register: async (server, { service }) => {
    const handler = new PredictHandler(service);
    server.route(routes(handler));
  },
};
