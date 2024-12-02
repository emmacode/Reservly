import express from 'express';
import { validateData } from '../middleware/validation.middleware';
import { protect } from '../controllers/auth.controller';
import {
  CheckAvailabilityDto,
  CreateReservationDto,
} from '../dtos/reservation.dto';
import {
  checkAvailability,
  createReservation,
  validateReservation,
} from '../controllers/reservation.controller';

const router = express.Router();

router.post(
  '/:restaurantId/check-availability',
  protect,
  validateData(CheckAvailabilityDto),
  validateReservation,
  checkAvailability,
);
router.post(
  '/:restaurantId/create-reservation',
  protect,
  validateData(CreateReservationDto),
  validateReservation,
  createReservation,
);

export default router;
