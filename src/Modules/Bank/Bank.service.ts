import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/Models/User';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TransactionTypes } from 'src/Interfaces/Globals';
import { Bank } from 'src/Models/Bank';

@Injectable()
export default class BankService {
  constructor(@InjectModel('Bank') private readonly bankModel: Model<Bank>) {}

  async transfer(details) {
    const { amount, recipient, sender } = details;

    let recipientBank;
    let senderBank;

    try {
      senderBank = await this.bankModel.findOne({
        accountNumber: sender,
      });
    } catch (e) {
      Logger.error(e);
      throw new InternalServerErrorException(
        null,
        'could not verify your bank details',
      );
    }

    if (senderBank.balance < amount) {
      throw new InternalServerErrorException(
        null,
        'you do not have sufficent balance to perform this operation',
      );
    }

    try {
      recipientBank = await this.bankModel.findOne({
        accountNumber: recipient,
      });
    } catch (e) {
      Logger.error(e);

      throw new InternalServerErrorException(
        null,
        'recipient account does not exist',
      );
    }

    try {
      recipientBank.balance += amount;

      senderBank.balance -= amount;

      await this.bankModel.updateOne(
        { accountNumber: senderBank.accountNumber },
        {
          $push: {
            transactions: {
              amount: amount,
              type: TransactionTypes.TRANSFER,
              sender: senderBank.accountNumber,
              recipient: recipientBank.accountNumber,
            },
          },
        },
      );

      await this.bankModel.updateOne(
        { accountNumber: recipientBank.accountNumber },
        {
          $push: {
            transactions: {
              amount: amount,
              type: TransactionTypes.DEPOSIT,
              sender: senderBank.accountNumber,
              recipient: recipientBank.accountNumber,
            },
          },
        },
      );
    } catch (e) {
      Logger.error(e);

      new InternalServerErrorException(
        null,
        'could not update transaction logs',
      );
    }

    try {
      recipientBank.save();

      senderBank.save();

      return {
        account_number: senderBank.accountNumber,
        balance: senderBank.balance,
        summary: {
          amount: amount,
          type: TransactionTypes.TRANSFER,
          sender: senderBank.accountNumber,
          recipient: recipientBank.accountNumber,
          timestamp: new Date(),
        },
      };
    } catch (e) {
      Logger.error(e);

      new InternalServerErrorException(null, 'could not transfer funds');
    }
  }

  async withdraw(details) {
    const { amount, account_number } = details;

    let foundAccount;

    try {
      foundAccount = await this.bankModel.findOne({
        accountNumber: account_number,
      });
    } catch (e) {
      Logger.error(e);
      throw new InternalServerErrorException(
        null,
        'could not verify your bank details',
      );
    }

    if (foundAccount.balance < amount) {
      throw new InternalServerErrorException(
        null,
        'you do not have sufficent balance to perform this operation',
      );
    }

    try {
      foundAccount.balance -= amount;

      await this.bankModel.updateOne(
        { accountNumber: foundAccount.accountNumber },
        {
          $push: {
            transactions: {
              amount,
              type: TransactionTypes.WITHDRAWAL,
            },
          },
        },
      );
    } catch (e) {
      Logger.error(e);

      new InternalServerErrorException(
        null,
        'could not update transaction logs',
      );
    }

    try {
      foundAccount.save();

      return {
        account_number: foundAccount.accountNumber,
        balance: foundAccount.balance,
        summary: {
          amount: amount,
          type: TransactionTypes.WITHDRAWAL,
          timestamp: new Date(),
        },
      };
    } catch (e) {
      Logger.error(e);

      new InternalServerErrorException(null, 'could not withdraw funds');
    }
  }

  async deposit(details) {
    const { amount, account_number } = details;

    let foundAccount;

    try {
      foundAccount = await this.bankModel.findOne({
        accountNumber: account_number,
      });
    } catch (e) {
      Logger.error(e);
      throw new InternalServerErrorException(
        null,
        'could not verify your bank details',
      );
    }

    if (!foundAccount) {
      throw new InternalServerErrorException(
        null,
        'this account does not exist',
      );
    }

    try {
      foundAccount.balance = parseInt(foundAccount.balance) + amount;

      console.log(foundAccount.balance, amount);

      await this.bankModel.updateOne(
        { accountNumber: foundAccount.accountNumber },
        {
          $push: {
            transactions: {
              amount,
              type: TransactionTypes.DEPOSIT,
            },
          },
        },
      );
    } catch (e) {
      Logger.error(e);

      new InternalServerErrorException(
        null,
        'could not update transaction logs',
      );
    }

    try {
      foundAccount.save();

      return {
        account_number: foundAccount.accountNumber,
        balance: foundAccount.balance,
        summary: {
          amount: amount,
          type: TransactionTypes.DEPOSIT,
          timestamp: new Date(),
        },
      };
    } catch (e) {
      Logger.error(e);

      new InternalServerErrorException(null, 'could not deposit funds');
    }
  }

  async getAllTransactions(account_number) {
    let foundAccount;

    try {
      foundAccount = await this.bankModel.findOne({
        accountNumber: account_number,
      });

      return foundAccount.transactions;
    } catch (e) {
      Logger.error(e);

      throw new InternalServerErrorException(
        null,
        'could not get transactions',
      );
    }
  }
}
