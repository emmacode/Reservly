// import { IReservationRequest, IReservationValidationResult } from '../types';

// export class ReservationValidationService {
//   private static TIME_INTERVAL_MINUTES = 15;
//   private static RESERVATION_BUFFER_MINUTES = 30;

//   static validateReservationRequest(
//     request: IReservationRequest,
//   ): IReservationValidationResult {
//     const {
//       reserveDate: { date, time },
//     } = request;
//     const reservationDateTime = new Date(`${date}T${time}`);
//     const currentTime = new Date();

//     if (reservationDateTime < currentTime) {
//       return {
//         isValid: false,
//         errorMessage: 'Reservation date cannot be in the past',
//       };
//     }

//     const hours = reservationDateTime.getHours();
//     const minutes = reservationDateTime.getMinutes();

//     if(hours < )
//   }
// }
