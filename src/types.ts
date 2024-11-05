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
  changedPasswordAfter(arg: number): boolean
}
