import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  apiPublicUrl: (process.env.API_PUBLIC_URL || 'http://localhost:4000').replace(/\/$/, ''),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
};
