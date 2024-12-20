const Joi = require('joi');
const { allowedMimeTypes, maxFileSize } = require('../config').file;

const fileSchema = Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
    mimetype: Joi.string()
        .valid(...allowedMimeTypes)
        .required()
        .messages({
            'any.only': 'Invalid file type. Only images and videos are allowed.',
        }),
    size: Joi.number()
        .max(maxFileSize) // 10 MB limit
        .required()
        .messages({
            'number.max': 'File size must not exceed 10 MB.',
        }),
}).required();


const schemas = {
    register: Joi.object({
        name: Joi.string().empty(''),
        email: Joi.string().email()
        .required()
        .messages({
            'string.base': '"email" must be a string',
            'string.email': '"email" must be a valid email',
            'any.required': '"email" is required',
        }),
        password: Joi.string().required().min(8).max(30).pattern(new RegExp(`(?=.*[!@#$%^&*(),.?":{}|<>])`))
        .messages({
            "string.pattern.base": `Password should contain at least one special character`,
        }),
    }),
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required().min(8).max(30),
    }),
    forgotPassword: Joi.object({
        email: Joi.string().email().required(),
    }),
    resetPassword: Joi.object({
        token: Joi.string().required(),
        email: Joi.string().email().required(),
        newPassword: Joi.string().required().min(8).max(30).pattern(new RegExp(`(?=.*[!@#$%^&*(),.?":{}|<>])`)).messages({
            "string.pattern.base": `Password should contain at least one special character`,
        }),
    }),
    upload:Joi.object({
        tags: Joi.array().items(Joi.string()).optional(),
        file: fileSchema,
    }),
    uploads:Joi.object({
        files: Joi.array().items(fileSchema).min(1).required(),
        tags: Joi.array().items(Joi.string()).optional()
    }),
};


module.exports = schemas