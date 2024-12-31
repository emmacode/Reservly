import { DaysOfWeek } from '../src/dtos/restaurant.dto';
import { ReservationService } from '../src/service/reservation.service';
import { IOperatingHours, IReservationWindow } from '../src/types';

describe('Reservation service', () => {
  let date: string;
  let time: string;
  let reservationDateTime: Date;
  let operatingHours: IOperatingHours;
  let restaurantCapacity: number;
  let existingReservations: IReservationWindow[];

  beforeEach(() => {
    date = '2025-01-31';
    time = '14:30';
    reservationDateTime = new Date(`${date}T${time}`);
    operatingHours = {
      day: DaysOfWeek.WEDNESDAY,
      openTime: '10:00',
      closeTime: '22:00',
      isOpen: true,
    };
    restaurantCapacity = 50;
    existingReservations = [];
  });

  describe('Valid reservation date and time', () => {
    it('Return true if reservation date is greater or equal to current date', () => {
      const isValid =
        ReservationService.isValidReservationDate(reservationDateTime);

      expect(isValid).toBe(true);
    });

    it('Return true if reservation time is greater or equal to minimum time', () => {
      const isValid =
        ReservationService.isValidReservationTime(reservationDateTime);

      expect(isValid).toBe(true);
    });
  });

  describe('generateTimeSlots', () => {
    it('Generate time slots around desired time', () => {
      const desiredTime = '15:00';

      const timeslots = ReservationService.generateTimeSlots(
        operatingHours,
        date,
        restaurantCapacity,
        existingReservations,
        desiredTime,
      );

      const times = timeslots.map((slot) => slot.time);
      expect(times).toContain('14:00');
      expect(times).toContain('15:00');
      expect(times).toContain('16:00');

      expect(timeslots.length).toBe(32);
    });

    it('Operating hours boundaries', () => {
      const timeslots = ReservationService.generateTimeSlots(
        operatingHours,
        date,
        restaurantCapacity,
        existingReservations,
        '09:00',
      );

      expect(timeslots[0].time).toBe('10:00');
    });

    it('Generate time slots within operating hours and exclude unavailable slots', () => {
      existingReservations = [
        {
          startTime: new Date(`${date}T10:00`),
          endTime: new Date(`${date}T14:00`),
        },
      ];

      const timeSlots = ReservationService.generateTimeSlots(
        operatingHours,
        date,
        restaurantCapacity,
        existingReservations,
      );

      const overlappingSlots = timeSlots.filter((slot) => {
        const hour = parseInt(slot.time.split(':')[0]);
        return hour >= 10 && hour < 14;
      });

      expect(overlappingSlots.length).toBe(0);
    });
  });
});
