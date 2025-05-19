import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.js';
import paginate from './plugins/paginate.js';

const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    media: [
      {
        type: {
          type: String,
          enum: ['image', 'video'],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    postType: {
      type: String,
      enum: ['vente', 'commande'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['main à main', 'en ligne'],
      required: true,
    },
    delivery: {
      type: String,
      enum: ['disponible', 'retrait sur place'],
      required: true,
    },
    category: {
      type: String,
      enum: ['couture', 'cuisine', 'peinture', 'électricité'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
postSchema.plugin(toJSON);
postSchema.plugin(paginate);

const Post = mongoose.model('Post', postSchema);

export default Post;