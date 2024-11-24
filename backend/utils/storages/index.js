// const { s3Uploader, spacesUploader } = require("./bucket");
const localUploader = require("./local");


module.exports={
    local: localUploader,
    // aws: s3Uploader,
    // digitalocean: spacesUploader,
}