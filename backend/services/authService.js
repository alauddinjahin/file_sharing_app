const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const HttpStatus = require('../utils/statusCodes');
const userService = require('./userService');
const prismaService = require('./prismaService');
const config = require('./../config').app;

class AuthService {

  #getTable() {
    const table = "user";
    return prismaService.getClient()[table];
  }


  async #hashCompare(password, newPassword) {
    return await bcrypt.compare(password, newPassword);
  }


  async register(email, password, name, files) {

    let payload = { email, password, name, ...(files?.length && { files }) };
    return userService.createUser(payload)

  }


  // Login method
  async login(email, password) {

    const user = await userService.getUserByEmail(email, { password: true });
    if (!user || !(await this.#hashCompare(password, user.password))) {
      throw new RequestError('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const accessToken = this.#createAccessToken(user.id);
    const refreshToken = this.#createRefreshToken(user.id);

    // store in the db or refresh token put in a cookie with httpOnly
    await this.saveRefreshTokenToMakeUserValid(user.id, refreshToken);

    if (user?.password) delete user.password;

    return { user, token: accessToken, refreshToken };

  }

  #createAccessToken(userId) {
    return jwt.sign({ id: userId }, config.secret, { expiresIn: config.jwtExpiration });
  };
  
  #createRefreshToken(userId) {
    return jwt.sign({ id: userId }, config.refreshTokenSecret, { expiresIn: config.jwtRefreshExpiration });
  };

  #verifyAndDecodeRefreshToken(refreshToken) {
    return jwt.verify(refreshToken, config.refreshTokenSecret);
  };

  
  // Save refresh token to user record in DB
  async saveRefreshTokenToMakeUserValid(userId, refreshToken) {
    const user = await this.#getTable().update({
      where: { id: userId },
      data: { refreshToken },
    });
    return user;
  }

  async removeRefreshTokenToMakeUserInvalid(userId) {
    const user = await this.#getTable().update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return user;
  }


  
  // Refresh the access token using refresh token
  async reGenerateAccessTokenwithPreviousRefreshToken(refreshToken, tokenService=null) {
    try {

      // Verify refresh token
      const decoded= this.#verifyAndDecodeRefreshToken(refreshToken);

      // Check if refresh token is still valid (i.e., exists in the database)
      const user = await userService.getUserById(decoded?.id, { refreshToken: true });
      if (!user || user.refreshToken !== refreshToken) {
        throw new RequestError('Invalid refresh token.', HttpStatus.UNAUTHORIZED);
      }

      // Generate new access token
      const newAccessToken = this.#createAccessToken(user.id);

      // Optionally rotate the refresh token
      const newRefreshToken = this.#createRefreshToken(user.id);
      await this.saveRefreshTokenToMakeUserValid(user.id, newRefreshToken);


      return { token: newAccessToken };

    } catch (error) {
      throw new RequestError('Invalid or expired refresh token.', HttpStatus.UNAUTHORIZED);
    }
  }


  async reGenerateAccessToken(accessToken, tokenService) {
    try {
      // Extract and validate the access token
      const decodedAccessToken = tokenService.decodeToken(accessToken);
      const userId = decodedAccessToken?.id ?? null;
      if (!userId) {
        throw new RequestError('Invalid token.' + userId, HttpStatus.UNAUTHORIZED);
      }
  
      // Fetch refresh token from the database
      const user = await userService.getUserById(userId, { refreshToken: true });
      if (!user || !user.refreshToken) {
        throw new RequestError('No token found for the user.', HttpStatus.UNAUTHORIZED);
      }
  
      // Verify the refresh token
      const decodedRefreshToken = this.#verifyAndDecodeRefreshToken(user.refreshToken);
      if (decodedRefreshToken.id !== userId) {
        throw new RequestError('Invalid refresh token.', HttpStatus.UNAUTHORIZED);
      }
  
      // Generate a new access token
      const newAccessToken = this.#createAccessToken(userId);
  
      // Optionally rotate the refresh token
      const newRefreshToken = this.#createRefreshToken(userId);

      await this.saveRefreshTokenToMakeUserValid(userId, newRefreshToken);

      return { accessToken: newAccessToken };

    } catch (error) {
      console.error(error.message, '----------------error----');
      res.status(HttpStatus.UNAUTHORIZED).json({ message: error.message });
    }
  }
  



  async forgotPassword() { }

}

module.exports = new AuthService();
