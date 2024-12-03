import express from 'express';
import { validateData } from '../middleware/validation.middleware';
import { protect } from '../controllers/auth.controller';
import {
  CheckAvailabilityDto,
  CreateReservationDto,
  UpdateReservationDto,
} from '../dtos/reservation.dto';
import {
  checkAvailability,
  createReservation,
  deleteReservation,
  getAllReservations,
  getSingleReservation,
  updateReservation,
  validateReservation,
} from '../controllers/reservation.controller';

const router = express.Router();

router.get('/', protect, getAllReservations);
router.get('/:reservationId', protect, getSingleReservation);

router.post(
  '/:restaurantId/check-availability',
  protect,
  validateData(CheckAvailabilityDto),
  validateReservation,
  checkAvailability,
);
router.post(
  '/:restaurantId/create-reservation',
  validateData(CreateReservationDto),
  validateReservation,
  createReservation,
);

router.patch(
  '/:restaurantId/reservation/:reservationId',
  protect,
  validateData(UpdateReservationDto),
  validateReservation,
  updateReservation,
);

router.delete(
  '/:restaurantId/reservation/:reservationId',
  protect,
  deleteReservation,
);

export default router;
