const PredictHandler = require('./handlers/predictHandler');
const predictRoutes = require('./routes/predictRoutes');

const AuthRoutes = require('./routes/authRoutes');
const AuthService = require('./services/authService');
const AuthHandler = require('./handlers/authHandler');

const PlantRoutes = require('./routes/plantRoutes');
const PlantService = require('./services/plantService');
const PlantHandler = require('./handlers/plantHandler');

const AuthPlugin = {
  name: 'auth',
  version: '1.0.0',
  register: async (server) => {
    const authService = new AuthService();
    const authHandler = new AuthHandler(authService);
    server.route(AuthRoutes(authHandler));
  },
};

const PredictPlugin = {
  name: 'predicts',
  version: '1.0.0',
  register: async (server, { service }) => {
    const predictHandler = new PredictHandler(service);
    server.route(predictRoutes(predictHandler));
  },
};

const PlantPlugin = {
  name: 'plants',
  version: '1.0.0',
  register: async (server) => {
    const plantService = new PlantService();
    const plantHandler = new PlantHandler(plantService);
    server.route(PlantRoutes(plantHandler));
  },
};

module.exports = {
  AuthPlugin,
  PredictPlugin,
  PlantPlugin,
};
