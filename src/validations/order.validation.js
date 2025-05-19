import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createOrder = {
  body: Joi.object().keys({
    post: Joi.string().custom(objectId).required(),
    description: Joi.string(),
    requestedDeliveryDate: Joi.date(),
    deliveryMethod: Joi.string().valid('delivery', 'pickup').required(),
    deliveryAddress: Joi.object().keys({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required(),
      coordinates: Joi.object().keys({
        latitude: Joi.number(),
        longitude: Joi.number(),
      }).allow(null),
    }).when('deliveryMethod', {
      is: 'delivery',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),
};

const getOrders = {
  query: Joi.object().keys({
    status: Joi.string().valid('pending', 'accepted', 'rejected', 'completed', 'cancelled'),
    paymentStatus: Joi.string().valid('pending', 'paid', 'refunded'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

const updateOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      status: Joi.string().valid('pending', 'accepted', 'rejected', 'completed', 'cancelled'),
      paymentStatus: Joi.string().valid('pending', 'paid', 'refunded'),
    })
    .min(1),
};

const deleteOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

export default {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
};