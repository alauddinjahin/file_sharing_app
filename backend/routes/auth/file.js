const express = require('express');
const { sanitize } = require('../../middleware/sanitizer');
const { validateRequest } = require('../../middleware/validator');
const fileController = require('../../controllers/fileController');
const { uploadSingle, uploadMultiple } = require('../../middleware/FileUploader');
const router = express.Router();

router.route('/upload')
.post( 
    sanitize(), 
    validateRequest("file"), 
    uploadSingle, 
    fileController.uploadFile
);

router.route('/uploads')
.post( 
    sanitize(), 
    validateRequest("files"), 
    uploadMultiple, 
    fileController.uploadFile
);

module.exports = router