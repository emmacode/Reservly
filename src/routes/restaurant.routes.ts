import express from 'express';
import { validateData } from '../middleware/validation.middleware';
import {
  AddTableDto,
  CreateRestaurantDto,
  UpdateRestaurantDto,
} from '../dtos/restaurant.dto';
import {
  addTable,
  deleteRestaurant,
  getRestaurants,
  getSingleRestaurant,
  registerResturant,
  updateRestaurant,
} from '../controllers/restaurant.controller';
import { protect } from '../controllers/auth.controller';

const router = express.Router();

// get routes
router.get('/', getRestaurants);
router.get('/:restaurantId', getSingleRestaurant);

// post routes
router.post(
  '/register',
  protect,
  validateData(CreateRestaurantDto),
  registerResturant,
);
router.post(
  '/:restaurantId/add-table',
  validateData(AddTableDto),
  protect,
  addTable,
);

// patch routes
router.patch(
  '/:restaurantId',
  protect,
  validateData(UpdateRestaurantDto),
  updateRestaurant,
);

// delete routes
router.delete('/:restaurantId', protect, deleteRestaurant);

export default router;
