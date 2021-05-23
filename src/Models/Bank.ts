import * as mongoose from 'mongoose';
import { CurrencyTypes } from 'src/Interfaces/Globals';
import { TransactionSchema } from './Transaction';
import { UserSchema } from './User';

export const BankSchema = new mongoose.Schema(
  {
    user: UserSchema,
    accountNumber: String,
    password: { type: String, required: true },
    transactions: [TransactionSchema],
    balance: { type: Number, default: 100 },
    currency: {
      type: String,
      enum: CurrencyTypes,
      default: CurrencyTypes.NAIRA,
    },
    token: String,
  },
  { timestamps: true },
);

export interface Bank {
  accountNumber: string;
  balance: number;
  currency: CurrencyTypes;
  password: string;
  token: string;
}
