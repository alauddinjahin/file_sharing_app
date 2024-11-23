const userService = require('../services/userService');
const { authUser } = require('../utils/authStore');
const HttpStatus = require('../utils/statusCodes');

class UsersController {

  async getUsers(req, res) {
    try {
    // console.log(authUser(), '----- auth user')
    // console.log(req.auth_user, '----- req user')
      const users = await userService.getUsers();
      res.status(HttpStatus.OK).json(users);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({ error: error.message });
    }
  }

}

module.exports = new UsersController();
