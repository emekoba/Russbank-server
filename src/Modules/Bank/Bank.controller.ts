import {
  Controller,
  Get,
  NotAcceptableException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Middleware, UseMiddleware } from 'src/Helpers/Middleware';
import { validator } from 'src/Helpers/Validator';
import AuthService from '../Auth/Auth.service';
import BankService from './Bank.service';

@Controller('bank')
export class BankController {
  constructor(
    private readonly bankService: BankService,
    private readonly authService: AuthService,
  ) {}

  @Middleware
  async userGuard(req, resp) {
    await this.authService.userAuthorization(req, resp);
  }

  @Post('transfer')
  @UseMiddleware('userGuard')
  async transfer(@Req() req, @Res({ passthrough: true }) resp: Response) {
    const reqBody = {
      amount: req.body.amount,
      recipient: req.body.recipient,
      sender: req.account_number,
    };

    const errorMsgs = validator([
      {
        name: 'amount',
        value: +reqBody.amount,
        options: { required: true, isNumber: true },
      },
      {
        name: 'recipient',
        value: reqBody.recipient,
        options: { required: true, isString: true },
      },
      {
        name: 'sender',
        value: reqBody.sender,
        options: { required: true, isString: true },
      },
    ]);

    if (errorMsgs) {
      throw new NotAcceptableException(null, errorMsgs?.[0].msg?.[0]);
    }

    const res = await this.bankService.transfer(reqBody);

    resp.json({
      account: res,
      description: 'transfer successful',
      code: 0,
    });
  }

  @Post('withdraw')
  @UseMiddleware('userGuard')
  async withdraw(@Req() req, @Res({ passthrough: true }) resp: Response) {
    const reqBody = {
      amount: req.body.amount,
      account_number: req.account_number,
    };

    const errorMsgs = validator([
      {
        name: 'amount',
        value: +reqBody.amount,
        options: { required: true, isNumber: true },
      },
      {
        name: 'account number',
        value: reqBody.account_number,
        options: { required: true, isString: true },
      },
    ]);

    if (errorMsgs) {
      throw new NotAcceptableException(null, errorMsgs?.[0].msg?.[0]);
    }

    const res = await this.bankService.withdraw(reqBody);

    resp.json({
      account: res,
      description: 'withdrawal successful',
      code: 0,
    });
  }

  @Post('deposit')
  @UseMiddleware('userGuard')
  async deposit(@Req() req, @Res({ passthrough: true }) resp: Response) {
    const reqBody = {
      amount: req.body.amount,
      account_number: req.account_number,
    };

    console.log(req.account_number);

    const errorMsgs = validator([
      {
        name: 'amount',
        value: +reqBody.amount,
        options: { required: true, isNumber: true },
      },
      {
        name: 'account number',
        value: reqBody.account_number,
        options: { required: true, isString: true },
      },
    ]);

    if (errorMsgs) {
      throw new NotAcceptableException(null, errorMsgs?.[0].msg?.[0]);
    }

    const res = await this.bankService.deposit(reqBody);

    resp.json({
      account: res,
      description: 'deposit successful',
      code: 0,
    });
  }

  @Get('transactions')
  @UseMiddleware('userGuard')
  async getAllTransactions(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {
    const res = await this.bankService.getAllTransactions('08076607130');

    resp.json({
      transactions: res,
      description: 'deposit successful',
      code: 0,
    });
  }
}
