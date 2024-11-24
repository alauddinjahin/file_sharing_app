const express = require('express');
const { sanitize } = require('../../middleware/sanitizer');
const { validateRequest } = require('../../middleware/validator');
const fileController = require('../../controllers/fileController');
const { uploadSingle, uploadMultiple, uploadFields } = require('../../middleware/FileUploader');
const multer = require('multer');
const fileRouter = express.Router();


fileRouter.route('/upload')
.post( 
    uploadSingle, 
    sanitize(), 
    validateRequest("upload"), 
    fileController.uploadFile
);

fileRouter.route('/uploads')
.post( 
    uploadMultiple, 
    sanitize(), 
    validateRequest("uploads"), 
    fileController.uploadMultiFile
);

// fileRouter.post('/uploads', uploadMultiple, validateRequest("uploads"), (req, res) => {
//     console.log(req.files,'dsffsfs');  // Should log an array of uploaded files
//     res.send('Files uploaded');
// });


// Catch multer-specific errors
// fileRouter.use((err, req, res, next) => {
//     console.log(err)
//     if (err instanceof multer.MulterError) {
//       // Multer-specific error
//       return res.status(500).send(err.message);
//     }
//     next(err);
// });




module.exports = fileRouter