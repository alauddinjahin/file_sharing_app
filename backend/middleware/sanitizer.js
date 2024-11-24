var sanitize = function (ignore = []) {
    return (req, res, next) => {

        const sanitizeFields = (dataObj) => {
            if (!dataObj) return;
            Object.keys(dataObj).forEach((key) => {
                if (ignore.indexOf(key) === -1 && typeof dataObj[key] === 'string') {
                    dataObj[key] = req.sanitize(dataObj[key])?.trim() || null;
                }
            });
        };

        // Sanitize the body, params, and query
        sanitizeFields(req.body);  // Sanitize the request body
        sanitizeFields(req.params);  // Sanitize the route params
        sanitizeFields(req.query);  // Sanitize the query string

         req._payload = {
            ...req.body,    // Add body data
            ...req.params,  // Add params data
            ...req.query,    // Add query data
            ...(req?.file ? { file: req.file } : {}),
            ...(req?.files ? { files: req.files } : {}),
        };

        // Continue to the next middleware
        next();
    };
};

module.exports = {
    sanitize
};
