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
  {
    method: 'PUT',
    path: '/users/{id}',
    handler: handler.updateUserHandler,
  },
  {
    method: 'PUT',
    path: '/users/{id}/password',
    handler: handler.updatePasswordHandler,
  },
];

module.exports = routes; 