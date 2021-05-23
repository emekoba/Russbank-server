import * as mongoose from 'mongoose';
import { TransactionTypes, UserRoles } from 'src/Interfaces/Globals';
import { BankSchema } from './Bank';

export const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    address: {},
    email: {},
    role: { type: String, enum: UserRoles, default: UserRoles.NORMAL },
  },
  { timestamps: true },
);

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: number;
  email: string;
  address: string;
  role: UserRoles;
}
