const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const swaggerDocs = require('./config/swagger');
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./adapters/errorAdapter');
const { getRedisClient } = require('./config/redis');

// Initialize Redis client early (fails open if unavailable)
getRedisClient();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// General Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/', routes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(NotFoundError('The requested resource was not found'));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
