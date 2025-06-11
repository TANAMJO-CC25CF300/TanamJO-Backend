const routes = (handler) => [
  {
    method: 'POST',
    path: '/plants',
    handler: handler.postPlantHandler,
    options: {
      auth: 'jwt',
      tags: ['api'],
      description: 'Menambahkan data tanaman baru',
      notes: 'Mengirimkan name, ageInput, description, dan phase. Token JWT wajib.',
    },
  },
  {
    method: 'GET',
    path: '/plants',
    handler: handler.getUserPlantsHandler,
    options: {
      auth: 'jwt',
      tags: ['api'],
      description: 'Mengambil data semua tanaman user',
      notes: 'Mengembalikan data tanaman dan deskripsi terbaru berdasarkan plant_age.',
    },
  },
];

module.exports = routes;