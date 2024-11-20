import mongoose from 'mongoose';
import { DaysOfWeek } from '../dtos/restaurant.dto';
import { IOperatingHours } from '../types';

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is needed'],
      unique: true,
      validate: {
        validator: function (v: string) {
          return v.trim() !== '';
        },
        message: 'Restaurant name cannot be empty',
      },
    },
    address: {
      type: String,
      required: [true, 'Restaurant address is needed'],
      validate: {
        validator: function (v: string) {
          return v.trim() !== '';
        },
        message: 'Restaurant address cannot be empty',
      },
    },
    email: {
      type: String,
      required: [true, 'Please provide a valid restaurant email'],
      unique: true,
      validate: {
        validator: function (v: string) {
          return v.trim() !== '';
        },
        message: 'Restaurant email cannot be empty',
      },
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    operatingHours: {
      type: [
        {
          day: {
            type: String,
            enum: Object.values(DaysOfWeek),
            required: true,
          },
          openTime: {
            type: String,
            required: true,
            match: /^([01]\d|2[0-3]):([0-5]\d)$/,
          },
          closeTime: {
            type: String,
            required: true,
            match: /^([01]\d|2[0-3]):([0-5]\d)$/,
          },
          isOpen: {
            type: Boolean,
            default: true,
          },
        },
      ],
      required: [true, 'Please provide restaurant operating hours'],
      validate: [
        {
          validator: function (v: IOperatingHours[]) {
            return Array.isArray(v) && v.length > 0;
          },
          message: 'Operating hours cannot be empty',
        },
        {
          validator: function (v: IOperatingHours[]) {
            const days = v.map((hour) => hour.day);
            return new Set(days).size === days.length;
          },
          message: 'Duplicate days in operating hours are not allowed',
        },
      ],
    },
  },
  { timestamps: true },
);

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
export default Restaurant;
