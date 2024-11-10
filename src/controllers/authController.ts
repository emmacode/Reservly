import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Response, Request } from 'express';

import User from '../models/userModel';
import { IUser } from '../types';
import CatchAsync from '../utils/catchAsync';
import AppError from '../utils/app-error';
import { promisify } from 'util';
import { sendEmail } from '../utils/email';

interface ICookieOptions {
  expires: Date;
  httpOnly: boolean;
  secure?: boolean;
}

type RolesProps = string[];

type IDecoded = {
  id: string;
  iat: number;
  exp: number;
};

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
  let token: string | undefined;
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
          return next(err);
        } else if (payload) {
          resolve(payload as JwtPayload);
        } else {
          return next(new AppError('Invalid token payload', 401));
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

export const forgotPassword = CatchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('There is no user with that email address', 401));
  }

  // Generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send to email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/accounts/reset-password/${resetToken}}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and confirm password to ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token valid for 10 minutes',
      message,
    });

    res
      .status(200)
      .json({ status: 'success', message: 'Password reset token sent!' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email, try again!', 500),
    );
  }
});

export const resetPassword = CatchAsync(async (req, res, next) => {});

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}
