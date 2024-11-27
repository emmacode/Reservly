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
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone: { type: Number, required: true },
  email: { type: String, required: true },
  additional_notes: { type: String, required: true },
  persons: { type: Number, required: true },
});

const Reservation = mongoose.model('Reservation', ReservationSchema);
export default Reservation;
