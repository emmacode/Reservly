import mongoose, { Document } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  photo?: String;
  password: string;
  confirm_password?: string;
  role: 'admin' | 'owner';
  restaurantId?: { type: mongoose.Schema.Types.ObjectId; ref: 'Restaurant' };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  //   photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  confirm_password: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (this: IUser, val: string): boolean {
        return val === this.password;
      },
      message: 'Passwords do not match!',
    },
  },
  role: {
    type: String,
    enum: ['admin', 'owner'],
    default: 'owner',
  },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.confirm_password = undefined;
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
