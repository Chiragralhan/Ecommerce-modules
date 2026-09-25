import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp_ecommerce';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // In production or when DB is mandatory, we might exit, but we don't abruptly crash during dev setup
    console.warn('[MongoDB] Please ensure MongoDB is running or specify a valid MONGO_URI in server/.env');
  }
};
