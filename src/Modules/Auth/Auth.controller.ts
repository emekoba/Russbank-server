import {
  Controller,
  NotAcceptableException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { validator } from 'src/Helpers/Validator';
import AuthService from './Auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {
    const {
      first_name,
      last_name,
      phone_number,
      address,
      email,
      password,
      confirm_password,
      user_role,
    } = req.body;

    const errorMsgs = validator([
      {
        name: 'first name',
        value: first_name,
        options: { required: true, isString: true },
      },
      {
        name: 'last name',
        value: last_name,
        options: { required: true, isString: true },
      },
      {
        name: 'user role',
        value: user_role,
        options: { isString: true },
      },
      {
        name: 'email',
        value: email,
        options: { required: true, isEmail: true },
      },
      {
        name: 'address',
        value: address,
        options: { required: true, isString: true },
      },
      {
        name: 'phone number',
        value: phone_number,
        options: { required: true, isPhoneNumber: true },
      },
      {
        name: 'password',
        value: password,
        options: {
          required: true,
          isString: true,
          lengthGreatherThan: 8,
          lengthLesserThan: 20,
          isPassword: true,
        },
      },
      {
        name: 'confirm password',
        value: confirm_password,
        options: { required: true, isString: true, equalTo: password },
      },
    ]);

    if (errorMsgs) {
      throw new NotAcceptableException(null, errorMsgs?.[0].msg?.[0]);
    }

    const res = await this.authService.signUp(req.body);

    resp.json({
      account: res,
      description: 'success: user created',
      code: 0,
    });
  }

  @Post('signin') async signIn(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {
    const { account_number, password } = req.body;

    const errorMsgs = validator([
      {
        name: 'account number',
        value: account_number,
        options: { required: true, isString: true },
      },

      {
        name: 'password',
        value: password,
        options: {
          required: true,
          isString: true,
          lengthGreatherThan: 8,
          lengthLesserThan: 20,
          isPassword: true,
        },
      },
    ]);

    if (errorMsgs) {
      throw new NotAcceptableException(null, errorMsgs?.[0].msg?.[0]);
    }

    const res = await this.authService.signIn(req.body);

    resp.json({
      account: res,
      description: 'success: user logged in',
      code: 0,
    });
  }
}
