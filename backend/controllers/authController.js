const authService = require('../services/authService');
const HttpStatus = require('../utils/statusCodes');

class AuthController {

  async register(req, res) {
    try {
      const { email, password, name, files = [] } = req._payload;
      const user = await authService.register(email, password, name, files);
      res.status(HttpStatus.CREATED).json(user);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }

  // Login method
  async login(req, res) {
    try {
      const { email, password } = req._payload;
      const { user, token } = await authService.login(email, password);
      res.status(HttpStatus.OK).json({ user, token });
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
