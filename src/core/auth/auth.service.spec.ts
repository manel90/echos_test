import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@echos/app/users/users.service';
import { SigninDTO, SignupDTO } from '@echos/core/auth/dto/auth.dto';


describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let configService: ConfigService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'jwt_refresh_secret') return 'refresh_secret';
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user data if found', async () => {
      const user:any = { _id: '1', pseudonyme: 'testuser', toJSON: () => ({ _id: '1', pseudonyme: 'testuser' }) };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      const result = await authService.validateUser('1');
      expect(result).toEqual({ _id: '1', pseudonyme: 'testuser' });
    });

    it('should return undefined if user not found', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

      const result = await authService.validateUser('1');
      expect(result).toBeUndefined();
    });
  });

  describe('signup', () => {
    it('should throw ForbiddenException if user already exists', async () => {
      const signupDto: SignupDTO = { pseudonyme: 'testuser', password: 'password' };
     // jest.spyOn(usersService, 'findOne').mockResolvedValue({ pseudonyme: 'testuser' });

      await expect(authService.signup(signupDto)).rejects.toThrow(ForbiddenException);
    });

    it('should create a new user and return tokens', async () => {
      const signupDto: SignupDTO = { pseudonyme: 'testuser', password: 'password' };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
     // jest.spyOn(usersService, 'create').mockResolvedValue({  pseudonyme: 'testuser', role: 'user', name: 'Test User' });
      jest.spyOn(jwtService, 'sign').mockReturnValue('test_token');

      const result = await authService.signup(signupDto);
      expect(result).toEqual({
        token: 'test_token',
        refreshToken: 'test_token',
        user: { userId: '1', role: 'user', name: 'Test User' },
      });
    });
  });

  describe('signin', () => {
    it('should throw NotFoundException if user is not found', async () => {
      const signinDto: SigninDTO = { pseudonyme: 'testuser', password: 'password' };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

      await expect(authService.signin(signinDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if password is incorrect', async () => {
      const signinDto: SigninDTO = { pseudonyme: 'testuser', password: 'wrongpassword' };
      const user:any = {  pseudonyme: 'testuser', password: bcrypt.hashSync('password', 8) };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      await expect(authService.signin(signinDto)).rejects.toThrow(ForbiddenException);
    });

    it('should return tokens if credentials are valid', async () => {
      const signinDto: SigninDTO = { pseudonyme: 'testuser', password: 'password' };
      const user:any = {  pseudonyme: 'testuser', password: bcrypt.hashSync('password', 8), role: 'user', name: 'Test User' };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      jest.spyOn(usersService, 'update').mockResolvedValue(null);
      jest.spyOn(jwtService, 'sign').mockReturnValue('test_token');

      const result = await authService.signin(signinDto);
      expect(result).toEqual({
        token: 'test_token',
        refreshToken: 'test_token',
        user: { userId: '1', role: 'user', name: 'Test User' },
      });
    });
  });

  describe('refresh', () => {
    it('should return new tokens if refresh token is valid', async () => {
      const refreshToken = 'valid_refresh_token';
      const payload = { _id: '1', role: 'user', name: 'Test User' };
      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);
      jest.spyOn(jwtService, 'sign').mockReturnValue('new_test_token');

      const result = await authService.refresh(refreshToken);
      expect(result).toEqual({
        accessToken: 'new_test_token',
        refreshToken: 'new_test_token',
      });
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refresh('invalid_token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
