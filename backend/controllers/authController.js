const { secure, auth_identifier, jwtExpiration, jwtRefreshExpiration } = require('../config/app');
const authService = require('../services/authService');
const storageManager = require('../utils/authStore');
const { parseExpiration, setCookieFromResponse } = require('../utils/jwtUtils');
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

      setCookieFromResponse(res, token);
      res.status(HttpStatus.OK).json({ user, fs_token: token });

    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({ error: error.message });
    }
  }

  logout(req, res){
  
    const { auth_user } = req;
    if(!auth_user){
      return res.status(HttpStatus.FORBIDDEN).json({ message: 'You are already logged out' });
    }
    
    authService.removeRefreshTokenToMakeUserInvalid(auth_user?.id);

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

  // re-generate access token
  async refreshToken(req, res) {

    const { refreshToken } = req._payload;

    try {
      const user = await authService.reGenerateAccessTokenwithPreviousRefreshToken(refreshToken);
      res.json(user);
    } catch (err) {
      res.status(401).json({ message: err.message });
    }

  }


}

module.exports = new AuthController();
