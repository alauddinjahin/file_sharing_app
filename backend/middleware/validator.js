const schemas = require('../schemas');

const validateRequest = (schemaKey) => {

    let key = schemaKey;
    let func =  "validate";
    const arrayOfKeys = schemaKey.split("|");
    if(arrayOfKeys?.length && arrayOfKeys.length > 1){
        key     =   arrayOfKeys[0]
        func    =  "validateAsync";
    }

    const schema = schemas[key] || {};
    return (req, res, next) => {
        const { value , error} = schema[func](req._payload);
        if (error) {
            return res.status(400).json(error.details);
        }

        if (!req.value) {
            req.value = {};
        }

        req.value['body'] = value;
        next();
    };
};

module.exports = {
    validateRequest
}