import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './Modules/Admin/Admin.module';
import { AuthModule } from './Modules/Auth/Auth.module';
import { BankModule } from './Modules/Bank/Bank.module';
import { MongooseModule } from '@nestjs/mongoose';

const { DB_NAME, DB_USERNAME, DB_PASSWORD } = process.env;

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.syc3a.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
    ),
    AuthModule,
    BankModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  onApplicationBootstrap() {}
}
