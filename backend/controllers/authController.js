const { secure, auth_identifier } = require('../config/app');
const authService = require('../services/authService');
const storageManager = require('../utils/authStore');
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

      res.cookie('fs_token', token, {
        httpOnly: true,
        secure: secure, 
        sameSite: 'Strict', // Use 'None' for cross-origin requests
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.status(HttpStatus.OK).json({ user, fs_token: token });

    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({ error: error.message });
    }
  }

  logout(req, res){
  
    res.clearCookie('fs_token', {
      httpOnly: true,   
      secure: secure, 
      sameSite: 'Strict', 
      path: '/'  
    });
  
    storageManager.run(() => {
      storageManager.set(auth_identifier, null);
    });
  
    return res.status(HttpStatus.OK).json({ message: 'Successfully logged out' });
  };
}

module.exports = new AuthController();
