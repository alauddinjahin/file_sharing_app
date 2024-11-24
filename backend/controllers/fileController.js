const fileService = require('../services/FileService');
const HttpStatus = require('../utils/statusCodes');

class FileController {

  async uploadFile(req, res) {
    try {
      const { file, tags } = req._payload;
      const {id:userId} = req?.auth_user;
      const fileData = await fileService.uploadFile({userId, file, tags});
      res.status(HttpStatus.CREATED).json(fileData);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }


  async uploadMultiFile(req, res) {
    try {

      const { files, tags } = req._payload;
      const {id:userId} = req?.auth_user;

      const fileData = await fileService.uploadMultiFile({userId, files, tags});
      res.status(HttpStatus.CREATED).json(fileData);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

}

module.exports = new FileController();
