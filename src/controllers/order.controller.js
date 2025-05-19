import httpStatus from 'http-status';
import pick from '../utils/pick.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { orderService, postService } from '../services/index.js';

const createOrder = catchAsync(async (req, res) => {
  // Verify the post exists
  const post = await postService.getPostById(req.body.post);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  
  // Create the order with client and artisan information
  const orderData = {
    ...req.body,
    client: req.user.id,
    artisan: post.user,
    price: post.price,
  };
  
  const order = await orderService.createOrder(orderData);
  res.status(httpStatus.CREATED).send(order);
});

const getOrders = catchAsync(async (req, res) => {
  let filter = pick(req.query, ['status', 'paymentStatus']);
  
  // If user is client, show only their orders
  if (req.user.role === 'client') {
    filter.client = req.user.id;
  }
  
  // If user is artisan, show only orders for their posts
  if (req.user.role === 'artisan') {
    filter.artisan = req.user.id;
  }
  
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await orderService.queryOrders(filter, options);
  res.send(result);
});

const getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  
  // Check if the user is authorized to access this order
  if (
    req.user.role !== 'admin' && 
    order.client.toString() !== req.user.id && 
    order.artisan.toString() !== req.user.id
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to access this order');
  }
  
  res.send(order);
});

const updateOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  
  // Check if the user is authorized to update this order
  // Only allow artisans to update their own orders' status
  if (
    req.user.role !== 'admin' && 
    !(req.user.role === 'artisan' && order.artisan.toString() === req.user.id)
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to update this order');
  }
  
  // Artisans can only update status
  let updateBody = req.body;
  if (req.user.role === 'artisan') {
    updateBody = pick(req.body, ['status']);
  }
  
  const updatedOrder = await orderService.updateOrderById(req.params.orderId, updateBody);
  res.send(updatedOrder);
});

const deleteOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  
  // Check if the user is authorized to delete this order
  // Only allow clients to cancel their pending orders
  if (
    req.user.role !== 'admin' && 
    !(req.user.role === 'client' && 
      order.client.toString() === req.user.id && 
      order.status === 'pending')
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to delete this order');
  }
  
  await orderService.deleteOrderById(req.params.orderId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
};