// catchAsync takes an asynchronous function (fn) as an argument
// returns a function that accepts the usual express.js route parameters req, res, next
// then execute the passed in asynchronous fn with arguments req, res, next inside the returned function.

import { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;

const CatchAsync =
  (fn: AsyncRequestHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };

export default CatchAsync;
