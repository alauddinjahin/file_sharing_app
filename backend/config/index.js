const fs = require("fs");
const path = require("path");

var normalizedPath = __dirname;
var data = {};

fs.readdirSync(normalizedPath).forEach(function(file) {
    if (file !== 'index.js') {
        data[path.basename(file, '.js')] = require(path.join(__dirname, file));
    }
});

module.exports = data;
