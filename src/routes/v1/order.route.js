import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import orderValidation from '../../validations/order.validation.js';
import orderController from '../../controllers/order.controller.js';

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(orderValidation.createOrder), orderController.createOrder)
  .get(auth(), validate(orderValidation.getOrders), orderController.getOrders);

router
  .route('/:orderId')
  .get(auth(), validate(orderValidation.getOrder), orderController.getOrder)
  .put(auth(), validate(orderValidation.updateOrder), orderController.updateOrder)
  .delete(auth(), validate(orderValidation.deleteOrder), orderController.deleteOrder);

export default router;