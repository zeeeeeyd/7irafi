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


app.use(helmet());


app.use(express.json());


app.use(express.urlencoded({ extended: true }));


app.use(xss());
app.use(mongoSanitize());
app.use(compression());


app.use(cors());
app.options('*', cors());

app.use(passport.initialize());
passport.use('jwt', jwtStrategy);


if (config.env === 'production') {
  app.use('/v1/auth', rateLimiter.authLimiter);
}


app.use('/v1', routes);


app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});


app.use(errorConverter);
app.use(errorHandler);

export default app;