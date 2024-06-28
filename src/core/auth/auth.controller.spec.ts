import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SigninDTO, SignupDTO, TokenDto } from '@echos/core/auth/dto/auth.dto';


describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            signin: jest.fn(),
            refresh: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should call AuthService.signup with correct parameters', async () => {
      const signupDto: SignupDTO = { pseudonyme: 'testuser', password: 'password' };

      await authController.signup(signupDto);
      expect(authService.signup).toHaveBeenCalledWith(signupDto);
    });

  });

  describe('signin', () => {
    it('should call AuthService.signin with correct parameters', async () => {
      const signinDto: SigninDTO = { pseudonyme: 'testuser', password: 'password' };

      await authController.signin(signinDto);
      expect(authService.signin).toHaveBeenCalledWith(signinDto);
    });

  });

  describe('refresh', () => {
    it('should call AuthService.refresh with correct parameters', async () => {
      const tokenDto: TokenDto = {  refreshToken: 'valid_refresh_token' };

      await authController.refresh(tokenDto);
      expect(authService.refresh).toHaveBeenCalledWith(tokenDto.refreshToken);
    });

    it('should return the result from AuthService.refresh', async () => {
      const tokenDto: TokenDto = { refreshToken: 'valid_refresh_token' };
      const result = { accessToken: 'new_access_token', refreshToken: 'new_refresh_token' };

      jest.spyOn(authService, 'refresh').mockResolvedValue(result);
      expect(await authController.refresh(tokenDto)).toBe(result);
    });
  });
});
