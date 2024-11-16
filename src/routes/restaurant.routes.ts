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
  getSingleTable,
  getTables,
  registerResturant,
  updateRestaurant,
} from '../controllers/restaurant.controller';
import { protect } from '../controllers/auth.controller';

const router = express.Router();

// get routes
router.get('/', getRestaurants);
router.get('/:restaurantId', getSingleRestaurant);
router.get('/:restaurantId/tables', getTables);
router.get('/:restaurantId/tables/:tableId', getSingleTable);

// post routes
router.post(
  '/register',
  protect,
  validateData(CreateRestaurantDto),
  registerResturant,
);
router.post(
  '/:restaurantId/tables',
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
