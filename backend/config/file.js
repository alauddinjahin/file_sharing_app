module.exports={
    maxFileSize : 10 * 1024 * 1024,
    maxTries: 5,
    allowedMimeTypes : ['image/jpeg', 'image/png', 'video/mp4', 'video/mpeg'],
    disk : process.env.FILE_DISK || 'local',
    pathToUpload: process.env.UPLOAD_PATH || "uploads"
}