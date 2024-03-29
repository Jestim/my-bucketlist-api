import mongoose, { Schema } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      id: mongoose.Types.ObjectId;
    }
  }
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      PORT: string;
      MONGODB_URI: string;
      JWT_SECRET: string;
    }
  }
}
