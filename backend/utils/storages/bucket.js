const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const { maxFileSize, allowedMimeTypes, pathToUpload } = require('../../config/file');

// File type filter function
const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only images and videos are allowed.')); // Reject the file
    }
};


// --------------------------------------------------------------------------------------------------------------------------

// AWS S3 initialization
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// S3 Storage configuration
const s3Storage = multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read', // Adjust based on your access requirements
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${pathToUpload}/${uniqueSuffix}-${file.originalname}`);
    },
});

// Multer uploader with fileFilter
const s3Uploader = multer({
    storage: s3Storage,
    fileFilter: fileFilter,
    limits: { fileSize: maxFileSize }, // 10 MB
});




// --------------------------------------------------------------------------------------------------------------------------

// Initialize DigitalOcean Spaces
const spaces = new aws.S3({
    endpoint: new aws.Endpoint(process.env.DO_SPACES_ENDPOINT), // e.g., 'nyc3.digitaloceanspaces.com'
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY_ID,
    secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY,
});


const spacesStorage = multerS3({
    s3: spaces,
    bucket: process.env.DO_BUCKET_NAME,
    acl: 'public-read', // Adjust according to your access requirements
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${pathToUpload}/${uniqueSuffix}-${file.originalname}`);
    },
});

const spacesUploader = multer({
    storage: spacesStorage,
    fileFilter: fileFilter,
    limits: { fileSize: maxFileSize }, // 10 MB
});


module.exports = {
    s3Uploader,
    spacesUploader
};
