const PredictHandler = require('./handlers/predictHandler');
const predictRoutes = require('./routes/PredictRoutes');

const AuthRoutes = require('./routes/authRoutes');
const AuthService = require('./services/authService');
const AuthHandler = require('./handlers/authHandler');

const UserRoutes = require('./routes/userRoutes');
const UserHandler = require('./handlers/userHandler');

const AuthPlugin = {
  name: 'auth',
  version: '1.0.0',
  register: async (server) => {
    const authService = new AuthService();
    const authHandler = new AuthHandler(authService);
    server.route(AuthRoutes(authHandler));
  },
};

const UserPlugin = {
  name: 'users',
  version: '1.0.0',
  register: async (server) => {
    const userHandler = new UserHandler();
    server.route(UserRoutes(userHandler));
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

module.exports = { AuthPlugin, PredictPlugin, UserPlugin };
