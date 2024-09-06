// src/db.ts
import mongoose from 'mongoose';
import config from './config';

const connectToDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri, {
     
    });
    console.log('Connected to MongoDB');
  } catch (err: any) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectToDB;
