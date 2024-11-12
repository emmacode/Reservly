import { NextFunction, Request, Response } from 'express';
import User from '../models/userModel';
import AppError from '../utils/app-error';
import CatchAsync from '../utils/catchAsync';

export const getAllUsers = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      result: users.length,
      data: { users },
    });
  },
);
