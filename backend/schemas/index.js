const Joi = require('joi');
const authService = require('../services/authService');

const emailUniqueValidator = async (email) => {
    const user = await authService.findUserByEmail(email);
    if (user) {
        return new Joi.ValidationError('Email is already in use', [
            {
              message: 'Email is already in use',
              path: ['email'],
              type: 'any.unique',
              context: { label: 'email', value: email },
            },
          ]);
      }
      return true;
  };

const schemas = {
    register: Joi.object({
        name: Joi.string().empty(),
        email: Joi.string().email().required().external(emailUniqueValidator),
        password: Joi.string().required(),
    }),
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
    
};


module.exports = schemas