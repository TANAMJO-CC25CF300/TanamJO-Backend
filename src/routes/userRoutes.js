const routes = (handler) => [
  {
    method: 'GET',
    path: '/users',
    handler: handler.getAllUsersHandler,
  },
  {
    method: 'GET',
    path: '/users/{id}',
    handler: handler.getUserByIdHandler,
  },
];

module.exports = routes; 