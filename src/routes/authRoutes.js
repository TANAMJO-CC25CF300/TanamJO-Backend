const routes = (handler) => [
  {
    method: 'POST',
    path: '/signup',
    handler: handler.signupHandler,
    options: {
      auth: false,
      description: 'Register akun baru',
      tags: ['api', 'auth'],
    },
  },
  {
    method: 'POST',
    path: '/login',
    handler: handler.loginHandler,
    options: {
      auth: false,
      description: 'Login untuk mendapatkan token JWT',
      tags: ['api', 'auth'],
    },
  },
];

module.exports = routes;
