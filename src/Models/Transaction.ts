import * as mongoose from 'mongoose';
import { TransactionTypes } from 'src/Interfaces/Globals';

export const TransactionSchema = new mongoose.Schema(
  {
    amount: String,
    type: { type: String, enum: TransactionTypes, required: true },
    sender: String,
    recipient: String,
  },
  { timestamps: true },
);

export interface Transaction {
  amount: string;
  type: TransactionTypes;
  sender: string;
  recipient: string;
}
