import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';

import AppError from '../utils/app-error';
import CatchAsync from '../utils/catch-async';
import Restaurant from '../models/Restaurant';
import User from '../models/User';
import { UserRoles } from '../utils/constants';
import { sendEmail } from '../utils/email';

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

  try {
    if (filteredBody.email) {
      const verificationToken = crypto.randomBytes(32).toString('hex');

      const hashedToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

      const updatedUser = await User.findByIdAndUpdate(
        req.user?.id,
        {
          ...filteredBody,
          verified: false,
          emailVerificationToken: hashedToken,
          emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
        },
        {
          new: true,
          runValidators: true,
        },
      );

      const verifyEmailURL = `${req.protocol}://${req.get('host')}/api/v1/accounts/verify-email/${verificationToken}}`;
      const message = `Someone (hopefully you) has updated your account with this email. Please click the link below to verify your ownership of this email. ${verifyEmailURL}`;

      await sendEmail({
        email: filteredBody.email,
        subject: 'Please Confirm Your Email Address',
        message,
      });

      res.status(200).json({
        status: 'success',
        data: {
          user: updatedUser,
          message: 'Verification email sent to your new email address',
        },
      });
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        req.user?.id,
        filteredBody,
        {
          new: true,
          runValidators: true,
        },
      );

      res.status(200).json({ status: 'success', data: { user: updatedUser } });
    }
  } catch (err) {
    return next(new AppError('Error updating account', 500));
  }
};

export const deleteAccount = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== UserRoles.Owner) {
      return next(new AppError('Unauthorized access', 403));
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await User.deleteOne({ _id: req.user?.id }).session(session);
        await Restaurant.deleteMany({ ownerId: req.user?.id }).session(session);
      });
      res.status(204).json({ status: 'success', data: null });
    } finally {
      await session.endSession();
    }
  },
);
