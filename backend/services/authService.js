const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const HttpStatus = require('../utils/statusCodes');
const userService = require('./userService');
const config = require('./../config').app;

class AuthService {

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

    const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: '1d' });
    if (user?.password) delete user.password;

    return { user, token };
  }


  async forgotPassword() { }

}

module.exports = new AuthService();
