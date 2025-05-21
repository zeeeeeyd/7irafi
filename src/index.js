import mongoose from 'mongoose';
import app from './App.js';
import config from './config/config.js';
import logger from './config/logger.js';

let server;

// Connect to MongoDB
mongoose.connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info('Connected to MongoDB');
    server = app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Swagger documentation available at http://localhost:${config.port}/v1/api-docs`);
    });
  })
  .catch((error) => {
    logger.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });

// Handle unexpected errors
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});