class PredictHandler {
  constructor(service) {
    this._service = service;
    this.getPredictResult = this.getPredictResult.bind(this);
  }
  async getPredictResult(request, h) {
    const photo = request.payload;
    const predict = await this._service.predictImage(photo.file);
    const { diseaseLabel, confidenceScore } = predict;

    return h.response({
      status: "success",
      message: "Predict success",
      data: {
        disease: diseaseLabel,
        confidenceScore,
      },
    });
  }
}

module.exports = PredictHandler;
