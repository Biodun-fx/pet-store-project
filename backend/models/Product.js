const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, enum: ['Food', 'Toys', 'Care', 'Accessories'] },
    petType: { type: String, default: '', trim: true, maxlength: 40 },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 4.8 },
    image: { type: String, default: '', trim: true },
    tag: { type: String, default: 'Shop', trim: true, maxlength: 50 },
    description: { type: String, default: '', trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
