import express from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import passport from 'passport';
import httpStatus from 'http-status';
import config from './config/config.js';
import morgan from './config/morgan.js';
import { jwtStrategy } from './config/passport.js';
import { errorConverter, errorHandler } from './middlewares/error.js';
import rateLimiter from './middlewares/rateLimiter.js';
import routes from './routes/v1/index.js';
import ApiError from './utils/ApiError.js';

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Set security HTTP headers
app.use(helmet());

// Parse json request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Sanitize request data
app.use(xss());
app.use(mongoSanitize());

// Enable gzip compression
app.use(compression());

// Enable cors
app.use(cors());
app.options('*', cors());

// Initialize passport and jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// Rate limiting
if (config.env === 'production') {
  app.use('/v1/auth', rateLimiter.authLimiter);
}

// API routes
app.use('/v1', routes);

// Send back a 404 error for any unknown API request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Convert error to ApiError, if needed
app.use(errorConverter);

// Handle error
app.use(errorHandler);

export default app;