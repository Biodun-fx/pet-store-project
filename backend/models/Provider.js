const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    duration: { type: String, default: '30 mins' },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const providerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    bio: { type: String, default: '' },
    image: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    services: { type: [serviceSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Provider', providerSchema);
