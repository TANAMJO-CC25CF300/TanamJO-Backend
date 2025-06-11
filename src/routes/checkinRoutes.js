const routes = (handler) => [
  {
    method: 'GET',
    path: '/checkin',
    handler: handler.getCheckinDataHandler,
    options: {
      auth: 'jwt',
      tags: ['api'],
      description: 'Get task dan tips berdasarkan umur tanaman aktif user',
      notes: 'Mengembalikan daftar title task dan content tips sesuai usia tanaman.',
    },
  },
  {
    method: 'POST',
    path: '/checkin',
    handler: handler.submitCheckinHandler,
    options: {
      auth: 'jwt',
      tags: ['api'],
      description: 'Submit check-in task dan deskripsi user',
      notes: 'Menyimpan semua task yang telah dicentang dan deskripsi harian ke tabel masing-masing.',
    },
  },
];

module.exports = routes;