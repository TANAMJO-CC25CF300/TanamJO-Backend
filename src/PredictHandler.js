class PredictHandler {
  constructor(service) {
    this._service = service;
    this.getPredictResult = this.getPredictResult.bind(this);
  }

  async getPredictResult(request, h) {
    try {
      console.log(request.payload);
      const image = request.payload.image;

      if (!image) {
        return h
          .response({
            status: "fail",
            message: "Gambar tidak ditemukan",
          })
          .code(400);
      }

      const predict = await this._service.predictImage(image);
      const { diseaseLabel, confidenceScore } = predict;

      return h.response({
        status: "success",
        message: "Prediksi berhasil",
        data: {
          disease: diseaseLabel,
          confidenceScore,
        },
      });
    } catch (error) {
      return h
        .response({
          status: "error",
          message: error.message,
        })
        .code(500);
      console.log(error);
    }
  }
}

module.exports = PredictHandler;
