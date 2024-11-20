import mongoose from 'mongoose';
import { TableStatus } from '../types';

const TableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    tableNumber: {
      // A unique identifier for the table within the restaurant e.g. A1, B2, etc.
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    location: {
      // A description of the table's location within the restaurant e.g Window, Corner, etc.
      type: String,
    },
    description: {
      // Any additional information about the table, such as special features or notes
      type: String,
    },
    status: {
      type: String,
      enum: TableStatus,
      default: TableStatus.Available,
    },
    adjacentTables: [{ type: String }], // An array of table numbers
  },
  { timestamps: true },
);

TableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

const Table = mongoose.model('Table', TableSchema);
export default Table;
