import {  Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSchema } from '@echos/shared/schemas/user.schema';


const MongooseModels = MongooseModule.forFeature([
  { name: 'User', schema: UserSchema },
]);

@Module({
  imports: [MongooseModels],
  providers: [UsersService],
  exports: [UsersService,MongooseModels],
  controllers: [UsersController],
})
export class UsersModule {
}
