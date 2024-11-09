import express from 'express';
import { validateData } from '../middleware/validation.middleware';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
} from '../dtos/restaurant.dto';
import {
  deleteRestaurant,
  getRestaurants,
  getSingleRestaurant,
  registerResturant,
  updateRestaurant,
} from '../controllers/restaurant.controller';
import { protect } from '../controllers/authController';

const router = express.Router();

// get routes
router.get('/', getRestaurants);
router.get('/:id', getSingleRestaurant);

// post routes
router.post(
  '/register',
  protect,
  validateData(CreateRestaurantDto),
  registerResturant,
);

// patch routes
router.patch(
  '/:id',
  protect,
  validateData(UpdateRestaurantDto),
  updateRestaurant,
);

// delete routes
router.delete('/:id', protect, deleteRestaurant);

export default router;
