import express from 'express';
import morgan from 'morgan';

import AppError from './utils/app-error';
import { globalErrorHandler } from './controllers/errorController';
import accountRouter from './routes/accounts';

const app = express();

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/accounts', accountRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
