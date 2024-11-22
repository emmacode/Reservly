import { Request } from 'express';
import mongoose, { Document, Types } from 'mongoose';
import { DaysOfWeek } from '../dtos/restaurant.dto';

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
  message: string;
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

export interface IOperatingHours {
  day: DaysOfWeek;
  openTime: string;
  closingTime: string;
  isOpen: boolean;
}

export interface IReservationSlot {
  tableId: Types.ObjectId;
  tableNumber: string;
  availableUntil: Date;
  description?: string;
  capacity: number;
}

export interface IReservationRequest {
  restaurantName: string;
  reserveDate: {
    date: string;
    time: string;
  };
  persons: number;
}

export interface IReservationValidationResult {
  isValid: boolean;
  errorMessage?: string;
}