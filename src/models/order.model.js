import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.js';
import paginate from './plugins/paginate.js';

const orderSchema = mongoose.Schema(
  {
    client: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    artisan: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Post',
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    requestedDeliveryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
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
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    deliveryMethod: {
      type: String,
      enum: ['delivery', 'pickup'],
      required: true,
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);

const Order = mongoose.model('Order', orderSchema);

export default Order;