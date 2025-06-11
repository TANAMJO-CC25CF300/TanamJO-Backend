class AuthHandler {
  constructor(service) {
    this._service = service;

    this.signupHandler = this.signupHandler.bind(this);
    this.loginHandler = this.loginHandler.bind(this);
  }

  async signupHandler(request, h) {
    const { email, password } = request.payload;

    try {
      const newUser = await this._service.register(email, password);

      return h.response({
        status: 'success',
        message: 'User berhasil terdaftar.',
        data: {
          user: newUser,
        },
      }).code(201);
    } catch (err) {
      if (err.message === 'EMAIL_EXISTS') {
        return h.response({
          status: 'fail',
          message: 'Email sudah terdaftar.',
        }).code(400);
      }

      console.error('[Signup Error]', err);
      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server.',
      }).code(500);
    }
  }

  async loginHandler(request, h) {
    const { email, password } = request.payload;

    try {
      const result = await this._service.login(email, password);

      return h.response({
        status: 'success',
        message: 'Login berhasil.',
        data: {
          token: result.token,
          user: result.user,
        },
      }).code(200);
    } catch (err) {
      if (err.message === 'EMAIL_NOT_FOUND') {
        return h.response({
          status: 'fail',
          message: 'Email tidak ditemukan.',
        }).code(404);
      }

      if (err.message === 'INVALID_PASSWORD') {
        return h.response({
          status: 'fail',
          message: 'Password salah.',
        }).code(401);
      }

      console.error('[Login Error]', err);
      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan saat login.',
      }).code(500);
    }
  }
}

module.exports = AuthHandler;
