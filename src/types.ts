import { Request } from 'express';
import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  photo?: String;
  password: string;
  correctPassword(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean>;
  role: 'admin' | 'owner';
  restaurantId?: { type: mongoose.Schema.Types.ObjectId; ref: 'Restaurant' };
  createdAt: Date;
  updatedAt: Date;
  passwordChangedAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  changedPasswordAfter(arg: number): boolean;
  createPasswordResetToken: () => string;
  //   active: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  verified: boolean;
}

export interface IEmailVerificationOptions {
  email: string;
  subject: string;
  message: string,
  verificationToken: string;
  req: Request;
}

export interface ITable extends Document {
  restaurantId: mongoose.Schema.Types.ObjectId;
  tableNumber: string;
  capacity: number;
  location?: string;
  description?: string;
  status: TableStatus;
  adjacentTables?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TableStatus {
  Available = 'Available',
  Reserved = 'Reserved',
  Occupied = 'Occupied',
}
