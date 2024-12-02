import { Types } from 'mongoose';

import {
  IExistingReservation,
  IOperatingHours,
  IReservationTimeSlot,
  IReservationWindow,
  IRestaurant,
} from '../types';
import Reservation from '../models/Reservation';

export class ReservationService {
  private static readonly TIME_SLOT_INTERVAL = 15;
  private static readonly DEFAULT_DINING_DURATION = 120;
  private static readonly MIN_ADVANCE_TIME = 60;
  private static readonly SUGGESTED_TIMESLOTS_RANGE = 120;

  static createReservationWindows(
    reservations: IExistingReservation[],
  ): IReservationWindow[] {
    return reservations.map((reservation) => ({
      startTime: new Date(reservation.time),
      endTime: new Date(
        reservation.time.getTime() + this.DEFAULT_DINING_DURATION * 60000,
      ),
    }));
  }

  static async getAvailableTimeSlots(
    restaurantId: Types.ObjectId,
    targetDate: Date,
    restaurant: IRestaurant,
    dayOperatingHours: IOperatingHours,
    desiredTime?: string,
  ): Promise<IReservationTimeSlot[]> {
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const existingReservations = await Reservation.find({
      restaurantId,
      date: {
        $gte: targetDate,
        $lt: nextDate,
      },
    }).select('time persons');
    // console.log(existingReservations, 'existingReservations');

    const reservationWindows =
      this.createReservationWindows(existingReservations);
    // console.log(reservationWindows, 'reservationWindows');

    const dateString = targetDate.toISOString().split('T')[0];

    return this.generateTimeSlots(
      dayOperatingHours,
      dateString,
      restaurant.capacity,
      reservationWindows,
      desiredTime,
    );
  }

  static generateTimeSlots(
    operatingHours: IOperatingHours,
    date: string,
    restaurantCapacity: number,
    existingReservations: IReservationWindow[],
    desiredTime?: string,
  ): IReservationTimeSlot[] {
    const slots: IReservationTimeSlot[] = [];
    const [openHour, openMinute] = operatingHours.openTime
      .split(':')
      .map(Number);
    const [closeHour, closeMinute] = operatingHours.closeTime
      .split(':')
      .map(Number);

    // convert opening time to minutes
    let currentMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    let startMinutes = currentMinutes;
    let endMinutes = closeMinutes;

    if (desiredTime) {
      const [desiredHour, desiredMinute] = desiredTime.split(':').map(Number);
      const desiredTimeInMinutes = desiredHour * 60 + desiredMinute;

      startMinutes = Math.max(
        currentMinutes,
        desiredTimeInMinutes - this.SUGGESTED_TIMESLOTS_RANGE / 2,
      );
      endMinutes = Math.min(
        closeMinutes,
        desiredTimeInMinutes + this.SUGGESTED_TIMESLOTS_RANGE / 2,
      );
    }

    currentMinutes = startMinutes;

    // generate slots until closing time
    while (currentMinutes + this.TIME_SLOT_INTERVAL <= closeMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      const slotDateTime = new Date(`${date}T${timeString}`);

      const isTimeSlotAvailable = this.isEntireTimeSlotAvailable(
        slotDateTime,
        restaurantCapacity,
        existingReservations,
      );

      if (isTimeSlotAvailable) {
        slots.push({
          time: timeString,
          // available: availableCapacity > 0,
          // capacity: availableCapacity,
        });
      }

      currentMinutes += this.TIME_SLOT_INTERVAL;
    }

    if (slots.length === 0 && desiredTime) {
      return this.generateTimeSlots(
        operatingHours,
        date,
        restaurantCapacity,
        existingReservations,
      );
    }

    return slots;
  }

  private static isEntireTimeSlotAvailable(
    slotDateTime: Date,
    totalCapacity: number,
    existingReservations: IReservationWindow[],
  ): boolean {
    const slotStart = slotDateTime;
    const slotEnd = new Date(
      slotStart.getTime() + this.DEFAULT_DINING_DURATION * 60000,
    );

    const overlappingReservations = existingReservations.filter(
      (reservation) => {
        return !(
          reservation.endTime <= slotStart || reservation.startTime >= slotEnd
        );
      },
    );

    return overlappingReservations.length === 0;
  }

  static isValidReservationDate(requestDate: Date): boolean {
    const currentDate = new Date();
    
    return requestDate.getTime() >= currentDate.getTime();
  }

  static isValidReservationTime(requestDateTime: Date): boolean {
    const currentTime = new Date();
    const minAllowedTime = new Date(
      currentTime.getTime() + this.MIN_ADVANCE_TIME * 60000,
    );
    return requestDateTime >= minAllowedTime;
  }
}
