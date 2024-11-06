import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Response, Request } from 'express';

import User from '../models/userModel';
import { IUser } from '../types';
import CatchAsync from '../utils/catchAsync';
import AppError from '../utils/app-error';

interface ICookieOptions {
  expires: Date;
  httpOnly: boolean;
  secure?: boolean;
}

type RolesProps = string[];

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

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
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user: userResponse },
  });
};

export const signup = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.password !== req.body.confirmPassword) {
      return next(new AppError('Passwords do not match!', 400));
    }

    const newUser: IUser = await User.create(req.body);

    createSendToken(newUser, 201, res);
  },
);

export const login = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = (await User.findOne({ email }).select('+password')) as IUser;

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, res);
  },
);

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in, Please login to get access!', 401),
    );
  }

  const decoded = await new Promise<JwtPayload>((resolve, reject) =>
    jwt.verify(
      token as string,
      process.env.JWT_SECRET as string,
      (err, payload) => {
        if (err) {
          reject(err);
        } else if (payload) {
          resolve(payload as JwtPayload);
        } else {
          reject(new Error('Invalid token payload'));
        }
      },
    ),
  );

  const currentUser = (await User.findById(decoded.id)) as IUser;

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exist', 401),
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat as number)) {
    return next(
      new AppError('User recently changed password! Please login again', 401),
    );
  }

  req.user = currentUser;
  next();
};

export const restrictTo =
  (...roles: RolesProps) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action", 403),
      );
    }

    next();
  };

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser; // Add `user` property of type `IUser`
  }
}
