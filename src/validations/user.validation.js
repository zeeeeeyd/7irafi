import Joi from 'joi';
import { password, objectId } from './custom.validation.js';

const createUser = {
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
    role: Joi.string().valid('client', 'artisan', 'admin').required(),
    category: Joi.string().valid('couture', 'cuisine', 'peinture', 'électricité')
      .when('role', {
        is: 'artisan',
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    isEmailVerified: Joi.boolean(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      firstName: Joi.string(),
      lastName: Joi.string(),
      email: Joi.string().email(),
      phoneNumber: Joi.string().allow('', null),
      password: Joi.string().custom(password),
      dateOfBirth: Joi.date(),
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
      }),
      category: Joi.string().valid('couture', 'cuisine', 'peinture', 'électricité'),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

export default {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};