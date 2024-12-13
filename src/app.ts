import express, { Request, Response } from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import AppError from './utils/app-error';
import { globalErrorHandler } from './controllers/error.controller';
// routes
import accountRouter from './routes/account.routes';
import restaurantRouter from './routes/restaurant.routes';
import reservationRouter from './routes/reservation.routes';
const swaggerDocument = YAML.load('./src/reservly.docs.yaml');

const app = express();

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({ extended: true }));

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
