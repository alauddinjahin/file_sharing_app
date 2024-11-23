const fileService = require('../services/FileService');
const HttpStatus = require('../utils/statusCodes');

class FileController {

  async uploadFile(req, res) {
    try {
      const { file=null, files = [] } = req._payload;

    //   userId, file, tags
      console.log(req._payload, 'req._payload')
      return ;
      const user = await fileService.uploadFile(email, password, name, files);
      res.status(HttpStatus.CREATED).json(user);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }

}

module.exports = new FileController();
