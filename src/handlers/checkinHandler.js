class CheckinHandler {
  constructor(service) {
    this._service = service;
    this.getCheckinDataHandler = this.getCheckinDataHandler.bind(this);
    this.submitCheckinHandler = this.submitCheckinHandler.bind(this);
  }

  async getCheckinDataHandler(request, h) {
    const { userId } = request.auth.credentials;
    try {
      const data = await this._service.getTasksAndTips(userId);
      return h.response({
        status: 'success',
        data,
      }).code(200);
    } catch (err) {
      return h.response({
        status: 'fail',
        message: err.message,
      }).code(400);
    }
  }

  async submitCheckinHandler(request, h) {
    const { userId } = request.auth.credentials;
    const { taskIds, description } = request.payload;

    try {
      await this._service.submitCheckin(userId, taskIds, description);
      return h.response({
        status: 'success',
        message: 'Check-in berhasil disimpan.',
      }).code(200);
    } catch (err) {
      return h.response({
        status: 'fail',
        message: err.message,
      }).code(400);
    }
  }
}

module.exports = CheckinHandler;