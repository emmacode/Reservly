import mongoose from 'mongoose';

const ReservationSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  date: { type: Date, required: true },
  time: { type: Date, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: Number, required: true },
  email: { type: String, required: true },
  additionalNotes: String,
  persons: { type: Number, required: true },
});

const Reservation = mongoose.model('Reservation', ReservationSchema);
export default Reservation;
