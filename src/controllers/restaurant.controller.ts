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
  UpdateTableDto,
} from '../dtos/restaurant.dto';
import { TypedRequestHandler } from '../types/express';
import { UserRoles } from '../utils/constants';
import { ITable } from '../types';

export const registerResturant: TypedRequestHandler<
  CreateRestaurantDto
> = async (req, res, next) => {
  try {
    const { name, email, address, capacity, operatingHours } = req.body;

    let restaurant = await Restaurant.findOne({
      email,
    });

    if (restaurant) {
      throw new AppError('Restaurant already exists', 400);
    }

    if (operatingHours) {
      if (
        !Array.isArray(req.body.operatingHours) ||
        req.body.operatingHours.length === 0
      ) {
        return next(new AppError('Operating Hours cannot be empty', 400));
      }

      const days = operatingHours.map((hour) => hour.day);
      const uniqueDays = new Set(days);
      if (uniqueDays.size !== days.length) {
        throw new AppError(
          'Duplicate day in a week is not allowed',
          400,
        );
      }
    }

    restaurant = new Restaurant({
      name,
      email,
      capacity,
      address,
      ownerId: req.user?.id,
      operatingHours: operatingHours,
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
  const { restaurantId } = req.params;

  try {
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

    if (req.body.operatingHours) {
      if (
        !Array.isArray(req.body.operatingHours) ||
        req.body.operatingHours.length === 0
      ) {
        return next(new AppError('Operating Hours cannot be empty', 400));
      }

      const days = req.body.operatingHours.map((hour) => hour.day);
      const uniqueDays = new Set(days);
      if (uniqueDays.size !== days.length) {
        return next(
          new AppError(
            'Duplicate days in operating hours are not allowed',
            400,
          ),
        );
      }
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
> = async (req, res, next) => {
  try {
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
            tableNumber: { $in: adjacentTables }, // this fetches table with the specified numbers in adjacentTables
          });

          if (tables.length !== adjacentTables.length) {
            throw new AppError('Invalid adjacent tables', 400);
          }

          await Table.updateMany(
            { restaurantId, tableNumber: { $in: adjacentTables } },
            { $addToSet: { adjacentTables: tableNumber } },
            { session },
          );
        }

        await table?.save({ session });
      });
    } finally {
      await session.endSession();
    }

    res.status(201).json({ status: 'success', data: table });
  } catch (error: any) {
    next(error);
  }
};

export const getTables: RequestHandler<{
  restaurantId: string;
}> = CatchAsync(async (req, res, next) => {
  const tables = await Table.find({ restaurantId: req.params.restaurantId });
  res.status(200).json({ status: 'success', data: tables });
});

export const getSingleTable: RequestHandler<{
  restaurantId: string;
  tableId: string;
}> = CatchAsync(async (req, res, next) => {
  const table = await Table.findOne({
    restaurantId: req.params.restaurantId,
    _id: req.params.tableId,
  });

  if (!table) {
    throw new AppError('Table not found', 404);
  }

  res.status(200).json({ status: 'success', data: table });
});

export const updateTable: TypedRequestHandler<
  UpdateTableDto,
  any,
  { restaurantId: string; tableId: string }
> = async (req, res, next) => {
  try {
    const { restaurantId, tableId } = req.params;
    const { tableNumber: newTableNumber, ...updateData } = req.body;

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

    const existingTable = await Table.findById(tableId);
    if (!existingTable) {
      throw new AppError('Table not found', 404);
    }

    const oldTableNumber = existingTable.tableNumber;
    const tableNumber = newTableNumber ?? oldTableNumber;
    const session = await mongoose.startSession();
    let table: ITable | null = null;

    try {
      await session.withTransaction(async () => {
        // if table number is being changed, remove old table number from adjacent tables
        if (newTableNumber && newTableNumber !== oldTableNumber) {
          await Table.updateMany(
            { restaurantId, adjacentTables: oldTableNumber },
            { $pull: { adjacentTables: oldTableNumber } },
            { session },
          );
        }

        // if adjacentTables is being updated, remove this table's number from tables that are no longer adjacent
        if (updateData.adjacentTables) {
          const removedAdjacentTables =
            existingTable.adjacentTables?.filter(
              (t) => !updateData.adjacentTables?.includes(t),
            ) || [];

          if (removedAdjacentTables.length > 0) {
            await Table.updateMany(
              { restaurantId, tableNumber: { $in: removedAdjacentTables } },
              { $pull: { adjacentTables: oldTableNumber } },
              { session },
            );
          }
        }

        await Table.findOneAndUpdate(
          { _id: tableId, restaurantId },
          { ...updateData, tableNumber },
          { new: true, runValidators: true, session },
        );

        if (updateData.adjacentTables && updateData.adjacentTables.length > 0) {
          const tables = await Table.find({
            restaurantId,
            tableNumber: { $in: updateData.adjacentTables },
          });

          if (tables.length !== updateData.adjacentTables.length) {
            throw new AppError('Invalid adjacent tables', 400);
          }

          await Table.updateMany(
            { restaurantId, tableNumber: { $in: updateData.adjacentTables } },
            { $addToSet: { adjacentTables: tableNumber } },
            { session },
          );
        }
      });
    } finally {
      await session.endSession();
    }

    res.status(200).json({ status: 'success', data: table });
  } catch (error: any) {
    next(error);
  }
};

export const deleteTable: TypedRequestHandler<
  any,
  any,
  { restaurantId: string; tableId: string }
> = async (req, res, next) => {
  try {
    const { restaurantId, tableId } = req.params;

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

    const existingTable = await Table.findById(tableId);
    if (!existingTable) {
      throw new AppError('Table not found', 404);
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // Remove this table's number from all adjacent tables
        await Table.updateMany(
          { restaurantId, adjacentTables: existingTable.tableNumber },
          { $pull: { adjacentTables: existingTable.tableNumber } },
          { session },
        );

        // Delete the table
        await Table.findByIdAndDelete(tableId).session(session);
      });
    } finally {
      await session.endSession();
    }

    res.status(204).json({ status: 'success', data: null });
  } catch (error: any) {
    next(error);
  }
};
