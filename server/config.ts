import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || '3000',
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET || 'defaultsecret'
};

export default config;
