import mongoose from 'mongoose';

const ReservationSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  restaurantName: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: Date, required: true },
  persons: { type: String, required: true },
});

const Reservation = mongoose.model('Reservation', ReservationSchema);
export default Reservation;
