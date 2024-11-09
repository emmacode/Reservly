import Restaurant from '../models/Restaurant';
import AppError from '../utils/app-error';
import { CreateRestaurantDto } from '../dtos/restaurant.dto';
import { TypedRequestHandler } from '../types/express';

export const registerResturant: TypedRequestHandler<
  CreateRestaurantDto
> = async (req, res, next) => {
  try {
    const { name, email, address } = req.body;

    let restaurant = await Restaurant.findOne({
      email,
    });

    if (restaurant) {
      throw new AppError('Restaurant already exists', 400);
    }

    restaurant = new Restaurant({
      name,
      email,
      address,
      ownerId: req.user?.id,
    });
    await restaurant.save();
    res.status(201).json({ status: 'success', data: restaurant });
  } catch (error) {
    next(error);
  }
};
