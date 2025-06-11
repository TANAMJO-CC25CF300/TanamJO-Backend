const routes = (handler) => [
  {
    method: "POST",
    path: "/predicts",
    handler: handler.getPredictResult,
    options: {
      payload: {
        maxBytes: 5242880, // 5MB
        output: "stream",
        parse: true,
        multipart: true,
      },
    },
  },
];

module.exports = routes;
