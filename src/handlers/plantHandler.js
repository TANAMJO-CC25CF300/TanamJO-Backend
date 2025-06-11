class PlantHandler {
  constructor(service) {
    this._service = service;

    this.postPlantHandler = this.postPlantHandler.bind(this);
    this.getUserPlantsHandler = this.getUserPlantsHandler.bind(this);
  }

  async postPlantHandler(request, h) {
    const { name, ageInput, description } = request.payload;
    const { userId } = request.auth.credentials;

    if (!name || !ageInput || !description) {
      return h
        .response({ status: 'fail', message: 'Missing required fields.' })
        .code(400);
    }

    try {
      const result = await this._service.postPlant(userId, name, ageInput, description);

      return h
        .response({
          status: 'success',
          message: 'Plant successfully added.',
          data: { plantId: result.plantId },
        })
        .code(201);
    } catch (err) {
      console.error(err);

      return h
        .response({ status: 'error', message: err.message || 'Internal server error.' })
        .code(500);
    }
  }

  async getUserPlantsHandler(request, h) {
    const { userId } = request.auth.credentials;

    try {
      const plants = await this._service.getUserPlants(userId);

      return h
        .response({
          status: 'success',
          data: plants,
        })
        .code(200);
    } catch (err) {
      console.error(err);

      return h
        .response({ status: 'error', message: err.message || 'Internal server error.' })
        .code(500);
    }
  }
}

module.exports = PlantHandler;
