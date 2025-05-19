import Joi from 'joi';
import { password } from './custom.validation.js';

const register = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required().email(),
    phoneNumber: Joi.string().allow('', null),
    password: Joi.string().required().custom(password),
    dateOfBirth: Joi.date().required(),
    address: Joi.object().keys({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required(),
      coordinates: Joi.object().keys({
        latitude: Joi.number().allow(null),
        longitude: Joi.number().allow(null),
      }).allow(null),
    }).required(),
    role: Joi.string().valid('client', 'artisan').required(),
    category: Joi.string().valid('couture', 'cuisine', 'peinture', 'électricité')
      .when('role', {
        is: 'artisan',
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

export default {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
};