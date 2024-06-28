import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '@echos/shared/shared.module';
import { CoreModule } from '@echos/core/core.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGO_URI } from '@echos/utils/constants/constant';
import config from './environments/environment';
import { UsersModule } from '@echos/app/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
    SharedModule,
    CoreModule,
    UsersModule,
    MongooseModule.forRoot(MONGO_URI, {
      connectTimeoutMS: 60000 * 2,
      socketTimeoutMS: 720000 * 2,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
