import mongoose from 'mongoose';

const RestaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
export default Restaurant;
