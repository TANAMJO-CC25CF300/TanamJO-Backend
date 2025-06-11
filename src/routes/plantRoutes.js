const routes = (handler) => [
  {
    method: 'POST',
    path: '/plants',
    handler: handler.postPlantHandler,
    options: {
      auth: 'jwt', // Sesuaikan jika kamu memakai strategi autentikasi bernama lain
    },
  },
  {
    method: 'GET',
    path: '/plants',
    handler: handler.getUserPlantsHandler,
    options: {
      auth: 'jwt',
    },
  },
];

module.exports = routes;
