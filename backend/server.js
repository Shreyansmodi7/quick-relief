import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

import Medicine from './models/Medicine.js';

// MongoDB Connection (Fallback to memory server if local fails)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quick-relief';

const seedData = async () => {
  const medicineCount = await Medicine.countDocuments();
  if (medicineCount === 0) {
    await Medicine.insertMany([
      // --- HOMEOPATHY ---
      { name: 'Diacardiac Drops', description: 'Cardiac Care Drops', price: 15.00, discount: 45, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80', category: 'Homeopathy', subCategory: 'Cardiac Care', inStock: true, manufacturer: 'SBL' },
      { name: 'SBL Diaboherb', description: 'Diabetes Care', price: 12.00, discount: 50, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80', category: 'Homeopathy', subCategory: 'Diabetes Care', inStock: true, manufacturer: 'SBL' },
      { name: 'Liv-T Liver Tonic', description: 'Liver Care', price: 8.50, discount: 45, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80', category: 'Homeopathy', subCategory: 'Liver Care', inStock: true, manufacturer: 'SBL' },
      { name: 'Nux Vomica 30CH', description: 'Digestive Care', price: 5.00, discount: 45, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80', category: 'Homeopathy', subCategory: 'Digestive Care', inStock: true, manufacturer: 'Dr. Reckeweg' },
      { name: 'Aesculus Ointment', description: 'Piles & Fissures Care', price: 6.50, discount: 50, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80', category: 'Homeopathy', subCategory: 'Piles & Fissures Care', inStock: true, manufacturer: 'SBL' },
      { name: 'BC 20 Tablets', description: 'Skin Care, Acne & Wound Healing', price: 7.00, discount: 50, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80', category: 'Homeopathy', subCategory: 'Skin Care', inStock: true, manufacturer: 'Dr. Willmar' },
      
      // --- PERSONAL CARE ---
      { name: 'Cetaphil Moisturizing Lotion', description: 'Skin Care Essentials', price: 18.00, discount: 53, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&q=80', category: 'Personal Care', subCategory: 'Skin Care Essentials', inStock: true, manufacturer: 'Cetaphil' },
      { name: 'Gillette Fusion 5 ProGlide', description: 'Men\'s Grooming', price: 22.00, discount: 20, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&q=80', category: 'Personal Care', subCategory: 'Men\'s Grooming', inStock: true, manufacturer: 'Gillette' },
      { name: 'Sebamed Anti-Dandruff Shampoo', description: 'Hair Care', price: 14.50, discount: 53, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&q=80', category: 'Personal Care', subCategory: 'Hair Care', inStock: true, manufacturer: 'Sebamed' },
      { name: 'Bioderma Atoderm Intensive Baume', description: 'Bath & Shower', price: 25.00, discount: 46, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&q=80', category: 'Personal Care', subCategory: 'Bath & Shower', inStock: true, manufacturer: 'Bioderma' },
      { name: 'Nivea Men Fresh Active Deodorant', description: 'Fragrance & Deodorants', price: 4.50, discount: 62, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&q=80', category: 'Personal Care', subCategory: 'Fragrance & Deodorants', inStock: true, manufacturer: 'Nivea' },
      { name: 'Vaseline Intensive Care Body Lotion', description: 'Body Care', price: 9.00, discount: 65, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&q=80', category: 'Personal Care', subCategory: 'Body Care', inStock: true, manufacturer: 'Vaseline' },
      
      // --- ESSENTIALS ---
      { name: 'Paracetamol 500mg', description: 'Pain Relief', price: 5.99, discount: 10, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80', category: 'General', subCategory: 'Pain Relief', inStock: true, manufacturer: 'HealthPharm', requiresPrescription: false },
      { name: 'Amoxicillin 250mg', description: 'Antibiotic', price: 12.50, discount: 5, image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&q=80', category: 'General', subCategory: 'Antibiotics', inStock: true, manufacturer: 'BioCare', requiresPrescription: true },
    ]);
    console.log('Mock medicines seeded successfully.');
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB connected at ${MONGO_URI}`);
    await seedData();
  } catch (err) {
    console.error('MongoDB connection error. Attempting Memory Server fallback...');
    import('mongodb-memory-server').then(async ({ MongoMemoryServer }) => {
       const mongoServer = await MongoMemoryServer.create();
       await mongoose.connect(mongoServer.getUri());
       console.log(`Fallback MongoDB Memory Server connected at ${mongoServer.getUri()}`);
       await seedData();
    });
  }
};

connectDB();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Quick Relief API is running' });
});

// Import routes
import authRoutes from './routes/authRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

// Make uploads folder static
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
