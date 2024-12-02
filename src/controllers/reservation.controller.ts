import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import CatchAsync from '../utils/catch-async';
import { TypedRequestHandler } from '../types/express';
import {
  CheckAvailabilityDto,
  CreateReservationDto,
} from '../dtos/reservation.dto';
import Restaurant from '../models/Restaurant';
import AppError from '../utils/app-error';
import { formatTime } from '../utils/date-time.format';
import { ReservationService } from '../service/reservation.service';
import { RestaurantService } from '../service/restaurant.service';
import { IOperatingHours, IReservation } from '../types';
import Reservation from '../models/Reservation';

export const checkAvailability: TypedRequestHandler<
  CheckAvailabilityDto,
  any,
  { restaurantId: string }
> = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { restaurantId } = req.params;
  const {
    reserveDate: { date, time },
  } = req.body;
  const reservationDateTime = new Date(`${date}T${time}`);

  // Check for the restaurant to see if its exist
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    return next(new AppError('Restaurant not found', 404));
  }

  // we want to check the openTime and closeTime of the restaurant for the particular day user is reserving for
  const requestedDay = new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toUpperCase();

  const dayOperatingHours: IOperatingHours | undefined =
    restaurant.operatingHours.find(
      (day) => day.day === requestedDay && day.isOpen,
    );

  if (!dayOperatingHours) {
    return next(
      new AppError(`The restaurant is closed on ${requestedDay}`, 400),
    );
  }

  if (!ReservationService.isValidReservationDate(reservationDateTime)) {
    return next(new AppError('Reservation date cannot be in the past', 400));
  }

  const { openTime, closeTime } = dayOperatingHours;

  const openTimeFormatted = formatTime(openTime);
  const closeTimeFormatted = formatTime(closeTime);

  if (
    RestaurantService.invalidRestaurantOperatingHours(dayOperatingHours, time)
  ) {
    return next(
      new AppError(
        `${restaurant.name} is open from ${openTimeFormatted} to ${closeTimeFormatted}`,
        400,
      ),
    );
  }

  // Check if reservation time is valid
  if (!ReservationService.isValidReservationTime(reservationDateTime)) {
    return next(
      new AppError(
        'The restaurant take reservations up to 1 hour before dining time',
        400,
      ),
    );
  }

  const targetDate = new Date(`${date}T00:00:00.000Z`);

  const timeslots = await ReservationService.getAvailableTimeSlots(
    new Types.ObjectId(restaurantId),
    targetDate,
    restaurant,
    dayOperatingHours,
    time,
  );

  res.status(200).json({
    status: 'success',
    data: {
      timeslots,
    },
  });

  next();
});

export const createReservation: TypedRequestHandler<
  CreateReservationDto,
  any,
  { restaurantId: string }
> = CatchAsync(async (req, res, next) => {
  const { restaurantId } = req.params;
  const {
    restaurantName,
    date,
    time,
    persons,
    first_name,
    last_name,
    phone,
    email,
    additional_notes,
  } = req.body;
  const reservationDateTime = new Date(`${date}T${time}`);

  const restaurant = await Restaurant.findById(restaurantId);
  console.log(restaurant, 'restaurant');

  if (restaurant?.name !== restaurantName) {
    return next(new AppError('Restaurant name does not match', 400));
  }

  const newReservation: IReservation = await Reservation.create({
    restaurantId,
    restaurantName,
    date,
    time: reservationDateTime,
    persons,
    first_name,
    last_name,
    phone,
    email,
    additional_notes,
  });

  res.status(201).json({ status: 'success', message: 'oti lorr!' });
  console.log(newReservation, 'newReservation');
});
