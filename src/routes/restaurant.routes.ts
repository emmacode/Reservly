import express from 'express';
import { validateData } from '../middleware/validation.middleware';
import {
  AddTableDto,
  CreateRestaurantDto,
  UpdateRestaurantDto,
  UpdateTableDto,
} from '../dtos/restaurant.dto';
import {
  addTable,
  deleteRestaurant,
  deleteTable,
  getRestaurants,
  getSingleRestaurant,
  getSingleTable,
  getTables,
  registerResturant,
  updateRestaurant,
  updateTable,
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
router.patch(
  '/:restaurantId/tables/:tableId',
  protect,
  validateData(UpdateTableDto),
  updateTable,
);

// delete routes
router.delete('/:restaurantId', protect, deleteRestaurant);
router.delete('/:restaurantId/tables/:tableId', protect, deleteTable);

export default router;
