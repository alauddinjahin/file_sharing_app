const jwt = require('jsonwebtoken');
const HttpStatus = require('../utils/statusCodes');
const storageManager = require('../utils/authStore');
const { auth_identifier } = require('../config/app');
const userService = require('../services/userService');
const tokenService = require('../services/tokenService');
const authService = require('../services/authService');
const { setCookieFromResponse } = require('../utils/jwtUtils');
const config = require('../config').app;


const authMiddleware = async(req, res, next) => {

  let token = req.cookies?.fs_token || null;
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }

  try {

    let decoded = tokenService.decodeToken(token);
    if (!decoded || !decoded?.exp) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid token' });
    }

    const expired = tokenService.isTokenExpired(decoded);
    // console.log(expired,'expiredexpired')
    if(expired){
        const {accessToken} = await authService.reGenerateAccessToken(
            token,
            tokenService
        );

        if(!accessToken){
            return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
        }

        token = accessToken;

        setCookieFromResponse(res, token);
    }else{
        decoded =  jwt.verify(token, config.secret);
    }

    if(decoded){
        storageManager.run(async () => {
            const user = await userService.getUserById(decoded?.id);
            storageManager.set(auth_identifier, user);
            req.auth_user = user; 
            next(); 
        });
    }
    else {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid token' });
    }

  } catch (err) {
    console.error("Auth Middleware->", err)
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid token' });
  }
  
};

module.exports = authMiddleware;
