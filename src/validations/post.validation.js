import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createPost = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    media: Joi.array().items(
      Joi.object().keys({
        type: Joi.string().valid('image', 'video').required(),
        url: Joi.string().required(),
      })
    ).min(1).required(),
    postType: Joi.string().valid('vente', 'commande').required(),
    price: Joi.number().min(0).required(),
    paymentMethod: Joi.string().valid('main à main', 'en ligne').required(),
    delivery: Joi.string().valid('disponible', 'retrait sur place').required(),
    category: Joi.string().valid('couture', 'cuisine', 'peinture', 'électricité').required(),
  }),
};

const getPosts = {
  query: Joi.object().keys({
    title: Joi.string(),
    category: Joi.string(),
    postType: Joi.string(),
    price: Joi.number(),
    user: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

const updatePost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      description: Joi.string(),
      media: Joi.array().items(
        Joi.object().keys({
          type: Joi.string().valid('image', 'video').required(),
          url: Joi.string().required(),
        })
      ),
      postType: Joi.string().valid('vente', 'commande'),
      price: Joi.number().min(0),
      paymentMethod: Joi.string().valid('main à main', 'en ligne'),
      delivery: Joi.string().valid('disponible', 'retrait sur place'),
      category: Joi.string().valid('couture', 'cuisine', 'peinture', 'électricité'),
      isActive: Joi.boolean(),
    })
    .min(1),
};

const deletePost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

export default {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
};