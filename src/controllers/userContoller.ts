import { NextFunction, Request, Response } from 'express';
import User from '../models/userModel';
import AppError from '../utils/app-error';
import CatchAsync from '../utils/catchAsync';
import { IUser } from '../types';
import { UserRoles } from '../utils/constants';

const filterObj = (obj: Record<string, any>, ...allowedFields: string[]) => {
  const newObj: Record<string, any> = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

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

export const updateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'This route is not for password update. Please use updatePassword',
        400,
      ),
    );
  }

  const filteredBody = filterObj(req.body, 'name', 'email');

  const updatedUser = await User.findByIdAndUpdate(req.user?.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { user: updatedUser } });
};

export const deleteAccount = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== UserRoles.Owner) {
      return next(new AppError('Unauthorized access', 403));
    }

    await User.deleteOne({_id: req.user?.id});
    res.status(204).json({ status: 'success', data: null });
  },
);
