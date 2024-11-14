import express from 'express';
import morgan from 'morgan';

import AppError from './utils/app-error';
import { globalErrorHandler } from './controllers/error.controller';
// routes
import accountRouter from './routes/account.routes';
import restaurantRouter from './routes/restaurant.routes';

const app = express();

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/accounts', accountRouter);
app.use('/api/v1/restaurants', restaurantRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
