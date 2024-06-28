import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from '@echos/app/users/users.service';
import { UserSchema } from '@echos/shared/schemas/user.schema';


const MongooseModels = MongooseModule.forFeature([
  { name: 'User', schema: UserSchema },


]);

@Module({
  imports: [
    MongooseModels,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt_secret'),
        userProperty: 'payload',
        algorithms: ['HS256'],
        signOptions: {
          expiresIn: '1d', // Access token expiration time
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  exports: [AuthService],
  providers: [JwtStrategy, ConfigService, UsersService, AuthService],
})
export class AuthModule {
}
