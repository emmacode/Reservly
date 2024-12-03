import { IOperatingHours } from '../types';

export class RestaurantService {
  static invalidRestaurantOperatingHours(
    dayOperatingHours: IOperatingHours,
    time: string,
  ) {
    const { openTime, closeTime } = dayOperatingHours;
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);

    const restaurantOpenTime = openHour + openMinute / 60;
    const restaurantCloseTime = closeHour + closeMinute / 60;

    const [userRequestHour, userRequestMinutes] = time.split(':').map(Number);
    const userRequestTime = userRequestHour + userRequestMinutes / 60;

    return (
      userRequestTime < restaurantOpenTime ||
      userRequestTime > restaurantCloseTime
    );
  }
}
