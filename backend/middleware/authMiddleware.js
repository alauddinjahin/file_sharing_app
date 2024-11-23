const jwt = require('jsonwebtoken');
const HttpStatus = require('../utils/statusCodes');
const storageManager = require('../utils/authStore');
const { auth_identifier } = require('../config/app');
const userService = require('../services/userService');
const config = require('../config').app;


const authMiddleware = async(req, res, next) => {

  const token = req.cookies?.fs_token || null;
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }

  try {

    const decoded = jwt.verify(token, config.secret);
    
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
    console.log(err)
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid token' });
  }
  
};

module.exports = authMiddleware;
