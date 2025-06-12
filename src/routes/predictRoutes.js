const routes = (handler) => [
  {
    method: "POST",
    path: "/predicts",
    handler: handler.getPredictResult,
    options: {
      auth: false,
      payload: {
        maxBytes: 5242880, // 5MB
        output: "stream",
        parse: true,
        multipart: true,
      },
      description: "Predict plant disease from image",
      tags: ["api", "predict"],
    },
  },
];

module.exports = routes;
