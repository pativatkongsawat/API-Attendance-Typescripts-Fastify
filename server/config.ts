import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.dev' });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || '3000',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/checkname',
  jwtSecret: process.env.JWT_SECRET || 'p@ssw0rd$ecur3!2024'
};

export default config;
