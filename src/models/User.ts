import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

import { IUser } from '../types';
import { generateToken } from '../utils/generate.token';

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  //   photo: String,
  role: {
    type: String,
    enum: ['admin', 'owner'],
    default: 'owner',
  },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  //   active: {
  //     type: Boolean,
  //     default: true,
  //     select: false,
  //   },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  verified: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // saving to the DB can be slower than issuing JWT
  // making changedPasswordAfter is set after the the JWT has been created so user will not be able to login with the new JWT
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// userSchema.pre(/^find/, function (this: Query<any, any>, next) {
//   this.find({ active: { $ne: false } }); // this filters out account that have active set to false
//   next();
// });

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      (this.passwordChangedAt.getTime() / 1000).toString(),
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const { token, hashedToken } = generateToken();

  // The hashed token is assigned to passwordResetToken and stored in the DB
  this.passwordResetToken = hashedToken;

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expires in 10mins

  return token;
};

// userSchema.methods.createEmailVerificationToken = function () {
//   const { token, hashedToken } = generateToken();
//   this.emailVerificationToken = hashedToken;
//   this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

//   return token;
// };

const User = mongoose.model('User', userSchema);
export default User;
