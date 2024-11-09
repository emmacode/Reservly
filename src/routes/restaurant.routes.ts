import express from 'express';
import { validateData } from '../middleware/validation.middleware';
import { CreateRestaurantDto } from '../dtos/restaurant.dto';
import { registerResturant } from '../controllers/restaurantController';
import { protect } from '../controllers/authController';

const router = express.Router();

router.post(
  '/register',
  protect,
  validateData(CreateRestaurantDto),
  registerResturant,
);

export default router;
