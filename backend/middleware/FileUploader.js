const { maxTries } = require("../config/file");
const upload = require("../utils/multerUtils");

const uploadSingle = upload.single("file");
const uploadMultiple = upload.array('files', maxTries); // Maximum 5 files per request

module.exports = { uploadSingle, uploadMultiple };

