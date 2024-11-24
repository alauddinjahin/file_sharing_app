const multer = require('multer');
const path = require('path');
const { maxFileSize, allowedMimeTypes, pathToUpload } = require('../../config').file;

const localDiskStorage = multer.diskStorage({

    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, `./../../public/${pathToUpload}`);
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file?.originalname}`);
    },

});


const fileFilter = (req, file, cb) => {
    // console.log(file,'file')
    if (allowedMimeTypes.includes(file?.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and videos are allowed.')); // Reject the file
    }
};

const localUploader = multer({
    storage: localDiskStorage,
    fileFilter,
    limits: { fileSize: maxFileSize }, // 10 MB
});

module.exports = localUploader;
