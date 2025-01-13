import express, { Request, Response } from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import AppError from './utils/app-error';
import { globalErrorHandler } from './controllers/error.controller';
// routes
import accountRouter from './routes/account.routes';
import restaurantRouter from './routes/restaurant.routes';
import reservationRouter from './routes/reservation.routes';
const swaggerDocument = YAML.load('./src/reservly.docs.yaml');

const app = express();

app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Data sanitization to prevent against NoSQL injection attacks
app.use(ExpressMongoSanitize());

app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30mins
  limit: 10,
  message: 'Too many request from this IP, Please try again in 30 minutes',
});

app.use('/api', limiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

app.use('/api/v1/accounts', accountRouter);
app.use('/api/v1/restaurants', restaurantRouter);
app.use('/api/v1/reservations', reservationRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
