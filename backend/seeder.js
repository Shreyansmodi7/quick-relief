import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Medicine from './models/Medicine.js';
import Pharmacy from './models/Pharmacy.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quick-relief';

const medicines = [
  {
    name: 'Paracetamol 500mg',
    description: 'Used to treat mild to moderate pain and fever.',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    category: 'Fever',
    inStock: true,
    manufacturer: 'HealthPharm',
    requiresPrescription: false
  },
  {
    name: 'Amoxicillin 250mg',
    description: 'Antibiotic used to treat a number of bacterial infections.',
    price: 12.50,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    category: 'Antibiotics',
    inStock: true,
    manufacturer: 'BioCare',
    requiresPrescription: true
  },
  {
    name: 'Vitamin C 1000mg',
    description: 'Immunity booster dietary supplement.',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    category: 'Supplements',
    inStock: true,
    manufacturer: 'Naturals',
    requiresPrescription: false
  },
  {
    name: 'Ibuprofen 400mg',
    description: 'Nonsteroidal anti-inflammatory drug (NSAID) used for pain relief.',
    price: 6.50,
    image: 'https://images.unsplash.com/photo-1550572017-edbfa010b957?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    category: 'Pain Relief',
    inStock: true,
    manufacturer: 'ReliefMed',
    requiresPrescription: false
  }
];

const importData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    
    await Medicine.deleteMany();
    await User.deleteMany();
    await Pharmacy.deleteMany();

    const createdMedicines = await Medicine.insertMany(medicines);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
