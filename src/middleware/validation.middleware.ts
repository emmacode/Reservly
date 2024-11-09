import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RequestHandler } from 'express';
import AppError from '../utils/app-error';

export function validateData<T extends object>(
  type: new () => T,
  value: 'body' | 'query' | 'params' = 'body',
): RequestHandler {
  return async (req, res, next) => {
    try {
      const dtoObj = plainToInstance(type, req[value] || {});

      const errors = await validate(dtoObj, { whitelist: true });
      if (errors.length > 0) {
        const messages = errors
          .map((error) => Object.values(error.constraints || {}))
          .flat();
        throw new AppError(messages[0], 400);
      }
      req[value] = dtoObj;
      next();
    } catch (error) {
      next(error);
    }
  };
}
