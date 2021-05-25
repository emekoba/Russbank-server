import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Bank } from 'src/Models/Bank';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export default class AdminService {
  constructor(@InjectModel('Bank') private readonly bankModel: Model<Bank>) {}

  async adminAuthorization(req, resp) {
    const account_number = req.account_number;

    let isAdmin;

    try {
      isAdmin = await this.bankModel.findOne({
        accountNumber: account_number,
        'user.role': 'ADMIN',
      });
    } catch (e) {
      Logger.error(e);

      throw new InternalServerErrorException(
        null,
        'error checking user privileges',
      );
    }

    if (!isAdmin) {
      throw new InternalServerErrorException(
        null,
        'operation restricted to admins only',
      );
    }
  }

  async getAllUsers() {
    try {
      let reformat = [];

      const allBanks = await this.bankModel.find({});

      allBanks.map((e) => {
        // reformat.push({
        //   user: e.user,
        // });
      });

      return allBanks;
    } catch (e) {
      Logger.error(e);

      new InternalServerErrorException(null, 'could not get all users');
    }
  }

  async deleteUser(account_number) {
    let foundAcct;

    try {
      foundAcct = await this.bankModel.findOne({
        accountNumber: account_number,
      });
    } catch (e) {
      Logger.error(e);

      new InternalServerErrorException(null, 'could not find user account');
    }

    try {
      foundAcct.remove();
    } catch (e) {
      Logger.error(e);

      new InternalServerErrorException(null, 'could not delete users');
    }
  }
}
