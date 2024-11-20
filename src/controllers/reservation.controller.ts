import { NextFunction, Request, Response } from 'express';

import CatchAsync from '../utils/catch-async';
import { TypedRequestHandler } from '../types/express';
import { CreateReservationDto } from '../dtos/reservation.dto';
import Restaurant from '../models/Restaurant';
import AppError from '../utils/app-error';
import { formatTime } from '../utils/date-time.format';

export const checkAvailability: TypedRequestHandler<
  CreateReservationDto,
  any,
  { restaurantId: string }
> = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { restaurantId } = req.params;
  const {
    reserveDate: { date, time },
  } = req.body;
  const reservationDateTime = new Date(`${date}T${time}`);
  const currentDateTime = new Date();

  // Check for the restaurant to see if its exist
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    return next(new AppError('Restaurant not found', 404));
  }

  // we want to check the openTime and closeTime of the restaurant for the particular day user is reserving for
  const currentDay = new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toUpperCase();

  const currentDayOperatingHours = restaurant.operatingHours.find(
    (day) => day.day === currentDay && day.isOpen,
  );

  if (!currentDayOperatingHours) {
    return next(new AppError(`The restaurant is closed on ${currentDay}`, 400));
  }

  if (reservationDateTime < currentDateTime) {
    return next(new AppError('Rservation date cannot be in the past', 400));
  }

  const { openTime, closeTime } = currentDayOperatingHours;
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  const restaurantOpenTime = openHour + openMinute / 60;
  const restaurantCloseTime = closeHour + closeMinute / 60;

  const [userRequestHour, userRequestMinutes] = time.split(':').map(Number);
  const userRequestTime = userRequestHour + userRequestMinutes / 60;

  const openTimeFormatted = formatTime(openTime);
  const closeTimeFormatted = formatTime(closeTime);

  if (
    userRequestTime < restaurantOpenTime ||
    userRequestTime > restaurantCloseTime
  ) {
    return next(
      new AppError(
        `${restaurant.name} is open from ${openTimeFormatted} to ${closeTimeFormatted}`,
        400,
      ),
    );
  }

  res.status(200).json({
    isValid: true,
    message: 'Available for reservation',
  });
});
