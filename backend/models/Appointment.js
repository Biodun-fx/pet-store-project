const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
    petName: { type: String, required: true, trim: true },
    serviceName: { type: String, required: true, trim: true },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
