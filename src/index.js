const PredictHandler = require('./handlers/predictHandler');
const predictRoutes = require('./routes/predictRoutes');
const PredictService = require('./services/predictService');

const AuthRoutes = require('./routes/authRoutes');
const AuthService = require('./services/authService');
const AuthHandler = require('./handlers/authHandler');

const PlantRoutes = require('./routes/plantRoutes');
const PlantService = require('./services/plantService');
const PlantHandler = require('./handlers/plantHandler');

const CheckinRoutes = require('./routes/checkinRoutes');
const CheckinService = require('./services/checkinService');
const CheckinHandler = require('./handlers/checkinHandler');

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

const CheckinPlugin = {
  name: 'checkin',
  version: '1.0.0',
  register: async (server) => {
    const checkinService = new CheckinService();
    const checkinHandler = new CheckinHandler(checkinService);
    server.route(CheckinRoutes(checkinHandler));
  },
};

module.exports = {
  AuthPlugin,
  PredictPlugin,
  PlantPlugin,
  CheckinPlugin,
};