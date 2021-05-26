import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { jwt_expire_time } from 'src/Helpers/Constants';
import { IToken, UserRoles } from 'src/Interfaces/Globals';
import { Bank } from '../../Models/Bank';

@Injectable()
export default class AuthService {
  constructor(
    @InjectModel('Bank') private readonly bankModel: Model<Bank>,
    private readonly jwtService: JwtService,
  ) {}

  BCRYPT_SALT = 10;

  async userAuthorization(req, resp, options?: { noTimeout: boolean }) {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new UnauthorizedException(
        'Unauthorized request',
        'This is an unauthorized request',
      );
    }

    const token = (authorization as string).match(/(?<=([b|B]earer )).*/g)?.[0];

    const unTokenized: IToken = this.jwtService.decode(token) as IToken;

    let bank;

    try {
      bank = await this.bankModel.findOne({
        accountNumber: unTokenized.accountNumber.toString(),
      });
    } catch (e) {
      if (e.name === 'EntityNotFound') {
        throw new UnauthorizedException(
          'Unauthorized request',
          'This is an unauthorized request',
        );
      } else {
        throw new InternalServerErrorException('Internal server error', e);
      }
    }

    if (!options?.noTimeout) {
      if (
        bank.token &&
        new Date().getTime() - unTokenized.time <= jwt_expire_time * 1000
      ) {
        bank.token = this.jwtService.sign({
          accountNumber: bank.accountNumber,
          date: new Date().getTime(),
        });

        bank.save();
      } else {
        throw new UnauthorizedException(null, 'Session timeout');
      }
    }

    req.account_number = bank.accountNumber;
  }

  async signUp(signUpDto) {
    let {
      first_name,
      last_name,
      password,
      phone_number,
      address,
      email,
      user_role,
    } = signUpDto;

    let userExists;

    try {
      userExists = await this.bankModel.findOne({
        accountNumber: phone_number,
      });
    } catch (e) {
      Logger.error(e);

      throw new InternalServerErrorException(null, 'error checking db');
    }

    if (userExists) {
      throw new NotAcceptableException(
        null,
        'bank account already exists....try changing your phone number',
      );
    }

    try {
      password = await bcrypt.hash(password, this.BCRYPT_SALT);

      let bankAccount = {
        user: {
          firstName: first_name,
          lastName: last_name,
          phoneNumber: phone_number,
          address,
          email,
          role: user_role ?? UserRoles.NORMAL,
        },
        password,
        accountNumber: phone_number,
      };

      await new this.bankModel(bankAccount).save();

      return {
        accountNumber: bankAccount.accountNumber,
        owner: {
          firstName: bankAccount.user.firstName,
          lastName: bankAccount.user.lastName,
          phoneNumber: bankAccount.user.phoneNumber,
          address: bankAccount.user.address,
          email: bankAccount.user.email,
          role: bankAccount.user.role,
        },
      };
    } catch (e) {
      Logger.error(e);

      throw new InternalServerErrorException(null, e);
    }
  }

  async signIn(signInDto) {
    const { account_number, password } = signInDto;

    let foundAccount;

    try {
      foundAccount = await this.bankModel.findOne({
        accountNumber: account_number,
      });
    } catch (e) {
      Logger.error(e);

      throw new NotFoundException(
        null,
        'incorrect credentials. Check your account number and try again',
      );
    }

    if (!foundAccount) {
      throw new NotAcceptableException(null, 'bank account does not exist');
    }

    if (!(await bcrypt.compare(password, foundAccount.password))) {
      throw new InternalServerErrorException(null, 'incorrect password');
    }

    let token = await this.jwtService.signAsync({
      accountNumber: foundAccount.accountNumber,
      time: new Date().getTime(),
    });

    try {
      foundAccount.token = token.toString();

      foundAccount = await foundAccount.save();

      return {
        account_number: foundAccount.accountNumber,
        balance: foundAccount.balance,
        userRole: foundAccount.user.role,
        owner: {
          first_name: foundAccount.user.firstName,
          last_name: foundAccount.user.lastName,
          phone_number: foundAccount.user.accountNumber,
        },
        token: foundAccount.token,
      };
    } catch (e) {
      Logger.error(e);

      throw new InternalServerErrorException(null, 'login failed');
    }
  }
}
