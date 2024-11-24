import {
  IOperatingHours,
  IReservationTimeSlot,
  IReservationWindow,
} from '../types';

export class ReservationService {
  private static readonly TIME_SLOT_INTERVAL = 15;
  private static readonly DEFAULT_DINING_DURATION = 120;
  private static readonly MIN_ADVANCE_TIME = 60;

  static generateTimeSlots(
    operatingHours: IOperatingHours,
    date: string,
    restaurantCapacity: number,
    existingReservations: IReservationWindow[],
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

    // generate slots until closing time
    while (currentMinutes + this.TIME_SLOT_INTERVAL <= closeMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      const slotDateTime = new Date(`${date}T${timeString}`);
      const availableCapacity = this.calculateAvailableCapacity(
        slotDateTime,
        restaurantCapacity,
        existingReservations,
      );

      slots.push({
        time: timeString,
        available: availableCapacity > 0,
        capacity: availableCapacity,
      });

      currentMinutes += this.TIME_SLOT_INTERVAL;
    }

    return slots;
  }

  private static calculateAvailableCapacity(
    slotDateTime: Date,
    totalCapacity: number,
    existingReservations: IReservationWindow[],
  ): number {
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

    const reservedCapacity = overlappingReservations.length;
    return Math.max(0, totalCapacity - reservedCapacity);
  }

  static isValidReservationTime(requestDateTime: Date): boolean {
    const currentTime = new Date();
    const minAllowedTime = new Date(
      currentTime.getTime() + this.MIN_ADVANCE_TIME * 60000,
    );
    return requestDateTime >= minAllowedTime;
  }
}
