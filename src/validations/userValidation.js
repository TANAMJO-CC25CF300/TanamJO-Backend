const Joi = require('@hapi/joi');

const userUpdateSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name should have at least {#limit} characters',
      'string.max': 'Name should not exceed {#limit} characters',
      'any.required': 'Name is required'
    }),
    
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email cannot be empty',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    
  gender: Joi.string()
    .valid('male', 'female')
    .required()
    .messages({
      'any.only': 'Gender must be either male or female',
      'any.required': 'Gender is required'
    })
});

module.exports = {
  userUpdateSchema,
}; 