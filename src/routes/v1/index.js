import express from 'express';
import authRoute from './auth.route.js';
import userRoute from './user.route.js';
import postRoute from './post.route.js';
import orderRoute from './order.route.js';
import config from '../../config/config.js';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/posts',
    route: postRoute,
  },
  {
    path: '/orders',
    route: orderRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  /**
   * Additional routes that should be accessible only in development mode
   * (e.g. documentation, testing routes)
   */
}

export default router;