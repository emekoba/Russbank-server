import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import { BankSchema } from 'src/Models/Bank';
import { AuthController } from './Auth.controller';
import AuthService from './Auth.service';
import { jwt_expire_time, jwt_secret } from 'src/Helpers/Constants';

config();

const jwtConfig = JwtModule.register({
  secret: jwt_secret,
  signOptions: { expiresIn: `${jwt_expire_time}s` },
});

@Module({
  imports: [
    jwtConfig,
    MongooseModule.forFeature([{ name: 'Bank', schema: BankSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
