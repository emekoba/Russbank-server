import {
  Controller,
  Get,
  Delete,
  Req,
  Res,
  NotAcceptableException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Middleware, UseMiddleware } from 'src/Helpers/Middleware';
import { validator } from 'src/Helpers/Validator';
import AuthService from '../Auth/Auth.service';
import AdminService from './Admin.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
  ) {}

  @Middleware
  async userGuard(req, resp) {
    await this.authService.userAuthorization(req, resp);
  }

  @Middleware
  async adminGuard(req, resp) {
    await this.adminService.adminAuthorization(req, resp);
  }

  @Get('all-users')
  @UseMiddleware('userGuard')
  @UseMiddleware('adminGuard')
  async getAllUsers(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {
    const res = await this.adminService.getAllUsers();

    resp.json({
      users: res,
      description: 'success',
      code: 0,
    });
  }

  @Delete('delete-user')
  @UseMiddleware('userGuard')
  @UseMiddleware('adminGuard')
  async deleteUser(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {
    const { account_number } = req.body;

    const errorMsgs = validator([
      {
        name: 'first name',
        value: account_number,
        options: { required: true, isString: true },
      },
    ]);

    if (errorMsgs) {
      throw new NotAcceptableException(null, errorMsgs?.[0].msg?.[0]);
    }

    const res = await this.adminService.deleteUser(account_number);

    resp.json({
      users: res,
      description: 'success: user successfully deleted',
      code: 0,
    });
  }
}
