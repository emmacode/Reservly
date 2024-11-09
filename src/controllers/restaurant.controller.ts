import { RequestHandler } from 'express';
import Restaurant from '../models/Restaurant';
import AppError from '../utils/app-error';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
} from '../dtos/restaurant.dto';
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

export const getRestaurants: TypedRequestHandler = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json({ status: 'success', data: restaurants });
  } catch (error) {
    next(error);
  }
};

export const getSingleRestaurant: RequestHandler<{ id: string }> = async (
  req,
  res,
  next,
) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }
    res.status(200).json({ status: 'success', data: restaurant });
  } catch (error: any) {
    if (error.name === 'CastError') {
      return next(new AppError('Invalid restaurant id', 400));
    }
    next(error);
  }
};

export const updateRestaurant: TypedRequestHandler<
  UpdateRestaurantDto,
  any,
  { id: string }
> = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    Object.assign(restaurant, req.body);
    await restaurant.save();
    res.status(200).json({ status: 'success', data: restaurant });
  } catch (error: any) {
    if (error.name === 'CastError') {
      return next(new AppError('Invalid restaurant id', 400));
    }
    next(error);
  }
};
