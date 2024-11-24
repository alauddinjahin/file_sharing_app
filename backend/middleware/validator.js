const schemas = require('../schemas');
const HttpStatus = require('../utils/statusCodes');

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
        // console.log(schema[func], schema, 'schema[func]')
        console.log(req._payload, 'joi')
        const { value , error} = schema[func](req._payload);
        if (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: error.details[0]?.message ?? "Something wents wrong!"
            });
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