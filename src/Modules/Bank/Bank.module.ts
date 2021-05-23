import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BankSchema } from 'src/Models/Bank';
import { AuthModule } from '../Auth/Auth.module';
import { BankController } from './Bank.controller';
import BankService from './Bank.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Bank', schema: BankSchema }]),
    AuthModule,
  ],
  controllers: [BankController],
  providers: [BankService],
})
export class BankModule {}
