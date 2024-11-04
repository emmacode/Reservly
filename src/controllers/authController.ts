import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { NextFunction, Response, Request } from 'express';

import User, { IUser } from '../models/userModel';
import CatchAsync from '../utils/catchAsync';
import AppError from '../utils/app-error';

interface ICookieOptions {
  expires: Date;
  httpOnly: boolean;
  secure?: boolean;
}

const signToken = (id: string) => {
  jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (
  user: IUser,
  statusCode: number,
  res: Response,
): void => {
  const token = signToken(user._id as string);

  const cookieOptions: ICookieOptions = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 30 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // New object without the password
  //   const userResponse = user.toObject();
  //   delete userResponse.password;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

export const signup = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser: IUser = await User.create(req.body);
    // const newUser = await User.create({
    //   email: req.body.email,
    //   password: req.body.password,
    //   role: req.body.role,
    // });

    res.status(201).json({
      status: 'success',
      data: { newUser },
    });

    // createSendToken(newUser, 201, res);
  },
);
