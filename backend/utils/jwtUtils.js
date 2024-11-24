const { secure, jwtRefreshExpiration } = require("../config/app");

const parseExpiration = (expiration) => {
    if (!expiration) return null;
  
    const match = expiration.match(/^(\d+)(s|m|h|d)$/); // Regex to parse the format
    if (!match) {
      throw new Error("Invalid JWT_EXPIRATION format. Use '10s', '5m', '1h', etc.");
    }
  
    const value = parseInt(match[1], 10);
    const unit = match[2];
  
    switch (unit) {
      case 's': return value * 1000; // Convert seconds to milliseconds
      case 'm': return value * 60 * 1000; // Convert minutes to milliseconds
      case 'h': return value * 60 * 60 * 1000; // Convert hours to milliseconds
      case 'd': return value * 24 * 60 * 60 * 1000; // Convert days to milliseconds
      default: throw new Error("Invalid time unit in JWT_EXPIRATION.");
    }
  };

  const setCookieFromResponse=(res, token, )=>{
        res.cookie('fs_token', token, {
        httpOnly: true,
        secure: secure, 
        sameSite: 'Strict', // Use 'None' for cross-origin requests
        maxAge: parseExpiration(jwtRefreshExpiration), // 1 day
    });

  }

  const removeCookie =(res)=>{
    res.clearCookie('fs_token', {
        httpOnly: true,   
        secure: secure, 
        sameSite: 'Strict', 
        path: '/'  
    });
  }




  module.exports = {
    parseExpiration,
    setCookieFromResponse,
    removeCookie
  }

  