const { maxTries, disk } = require("../config").file;
const storages = require("../utils/storages");
const upload = storages[disk] || null;


// console.log(maxTries, upload,'uploadupload')
  const uploadFields = upload.fields([
    { name: `files[]`, maxCount: maxTries },  // Accept files[] with up to 5 files
  ]);

const uploadSingle = upload.single("file");
const uploadMultiple = upload.array('files[]', maxTries); // Maximum 5 files per request

module.exports = { uploadSingle, uploadMultiple, uploadFields };

