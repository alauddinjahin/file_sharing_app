const { auth_identifier } = require('../config/app');
const authService = require('../services/authService');
const storageManager = require('../utils/authStore');
const { removeCookie, setCookie } = require('../utils/jwtUtils');
const HttpStatus = require('../utils/statusCodes');

class AuthController {

  async register(req, res) {
    try {
      const { email, password, name, files = [] } = req._payload;
      const user = await authService.register(email, password, name, files);
      res.status(HttpStatus.CREATED).json(user);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  // Login method
  async login(req, res) {
    try {

      const { email, password } = req._payload;
      const { user, token } = await authService.login(email, password);

      setCookie(res, token);
      res.status(HttpStatus.OK).json({ user, fs_token: token });

    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: error.message });
    }
  }

  logout(req, res){
  
    const { auth_user } = req;
    if(!auth_user){
      return res.status(HttpStatus.FORBIDDEN).json({ message: 'You have already been logged out.' });
    }
    
    authService.removeRefreshTokenToMakeUserInvalid(auth_user?.id);

    removeCookie(res)
  
    storageManager.run(() => {
      storageManager.set(auth_identifier, null);
    });
  
    return res.status(HttpStatus.OK).json({ message: 'Successfully logged out' });
  };

  // re-generate access token
  async refreshToken(req, res) {

    const { refreshToken } = req._payload;

    try {
      const user = await authService.reGenerateAccessTokenwithPreviousRefreshToken(refreshToken);
      res.json(user);
    } catch (err) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: err.message });
    }

  }

  async forgotPassword(req, res) {
    try {
      const { email } = req._payload;
      const response = await authService.forgotPassword(email);
      res.status(HttpStatus.OK).json(response);
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: err.message });
    }
  }


  async resetPassword(req, res) {
    try {
      const { token, email, newPassword } = req._payload;
      const response = await authService.resetPassword(token, email, newPassword);
      res.status(HttpStatus.OK).json(response);
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: err.message });
    }
  }


}

module.exports = new AuthController();
