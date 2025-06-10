const routes = (handler) => [
  {
    method: 'POST',
    path: '/signup',
    handler: handler.signupHandler,
  },
  {
    method: 'POST',
    path: '/login',
    handler: handler.loginHandler,
  },
];

module.exports = routes;
