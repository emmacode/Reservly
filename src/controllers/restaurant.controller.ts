import { RequestHandler } from 'express';
import mongoose from 'mongoose';

import AppError from '../utils/app-error';
import CatchAsync from '../utils/catch-async';
import Restaurant from '../models/Restaurant';
import Table from '../models/Table';
import {
  AddTableDto,
  CreateRestaurantDto,
  UpdateRestaurantDto,
} from '../dtos/restaurant.dto';
import { TypedRequestHandler } from '../types/express';
import { UserRoles } from '../utils/constants';

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

export const getSingleRestaurant: RequestHandler<{
  restaurantId: string;
}> = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }
    res.status(200).json({ status: 'success', data: restaurant });
  } catch (error: any) {
    next(error);
  }
};

export const updateRestaurant: TypedRequestHandler<
  UpdateRestaurantDto,
  any,
  { restaurantId: string }
> = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    if (
      restaurant.ownerId.toString() !== req.user?._id?.toString() &&
      req.user?.role !== UserRoles.Admin
    ) {
      throw new AppError('Unauthorized access', 403);
    }

    Object.assign(restaurant, req.body);
    await restaurant.save();
    res.status(200).json({ status: 'success', data: restaurant });
  } catch (error: any) {
    next(error);
  }
};

export const deleteRestaurant: RequestHandler<{
  restaurantId: string;
}> = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    if (
      restaurant.ownerId.toString() !== req.user?._id?.toString() &&
      req.user?.role !== UserRoles.Admin
    ) {
      throw new AppError('Unauthorized access', 403);
    }

    await Restaurant.deleteOne({ _id: req.params.restaurantId });
    res.status(204).json({ status: 'success', data: null });
  } catch (error: any) {
    next(error);
  }
};

export const addTable: TypedRequestHandler<
  AddTableDto,
  any,
  { restaurantId: string }
> = CatchAsync(async (req, res, next) => {
  const { restaurantId } = req.params;
  const { tableNumber, capacity, location, description, adjacentTables } =
    req.body;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new AppError('Restaurant not found', 404);
  }

  if (
    restaurant.ownerId.toString() !== req.user?._id?.toString() &&
    req.user?.role !== UserRoles.Admin
  ) {
    throw new AppError('Unauthorized access', 403);
  }

  let table = await Table.findOne({ restaurantId, tableNumber });

  if (table) {
    throw new AppError('Table already exists', 400);
  }

  table = new Table({
    restaurantId,
    tableNumber,
    capacity,
    location,
    description,
    adjacentTables,
  });

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      if (adjacentTables && adjacentTables.length > 0) {
        const tables = await Table.find({
          restaurantId,
          tableNumber: { $in: adjacentTables },
        });

        if (tables.length !== adjacentTables.length) {
          throw new AppError('Invalid adjacent tables', 400);
        }

        await Table.updateMany(
          { restaurantId, tableNumber: { $in: adjacentTables } },
          { $push: { adjacentTables: tableNumber } },
          { session },
        );
      }

      await table?.save({ session });
    });

    res.status(201).json({ status: 'success', data: table });
  } finally {
    await session.endSession();
  }
});
