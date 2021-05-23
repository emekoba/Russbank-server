import { Module } from '@nestjs/common';
import { AdminController } from './Admin.controller';
import AdminService from './Admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BankSchema } from 'src/Models/Bank';
import { AuthModule } from '../Auth/Auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: 'Bank', schema: BankSchema }]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
