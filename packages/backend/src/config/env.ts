import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  databaseUrl: process.env.DATABASE_URL,
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  nodeEnv: process.env.NODE_ENV || 'development',
};
