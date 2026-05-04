import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, default: 'General' },
  discount: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  manufacturer: { type: String },
  requiresPrescription: { type: Boolean, default: false }
}, { timestamps: true });

// Text index for smart search
medicineSchema.index({ name: 'text', description: 'text', category: 'text' });

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;
