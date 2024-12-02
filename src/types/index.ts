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

export interface IRestaurant extends Document {
  name: string;
  address: string;
  email: string;
  capacity: number;
  ownerId: mongoose.Types.ObjectId;
  operatingHours: IOperatingHours[];
  createdAt: Date;
  updatedAt: Date;
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

export interface IReservation extends Document {
  restaurantId: mongoose.Types.ObjectId;
  date: Date;
  time: Date;
  persons: number;
  firstName: string;
  lastName: string;
  phone: number;
  additionalNotes?: string | null;
}

export interface IOperatingHours {
  day: DaysOfWeek;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface IReservationTimeSlot {
  time: string;
  available?: boolean;
  capacity?: number;
}

export interface IReservationWindow {
  startTime: Date;
  endTime: Date;
}

export interface IExistingReservation {
  time: Date;
  persons: number;
}
