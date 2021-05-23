import * as mongoose from 'mongoose';

export const AdminSchema = new mongoose.Schema(
  {
    email: String,
    password: { type: String, required: true },
    token: String,
  },
  { timestamps: true },
);

export interface Admin {
  email: string;
  password: string;
  token: string;
}
