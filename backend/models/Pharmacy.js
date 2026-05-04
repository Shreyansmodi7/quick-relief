import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema({
  pharmacist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  inventory: [{
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    stock: { type: Number, default: 0 }
  }],
  isApproved: { type: Boolean, default: false } // Admin needs to approve
}, { timestamps: true });

// 2dsphere index for geospatial queries (if we want to use MongoDB native $near instead of Haversine)
pharmacySchema.index({ 'location.lng': 1, 'location.lat': 1 });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
export default Pharmacy;
