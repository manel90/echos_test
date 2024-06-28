import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDTO, SignupDTO, TokenDto } from '@echos/core/auth/dto/auth.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SuccessInterceptor } from '@echos/shared/interceptors/success.interceptor';

// Décorateur pour spécifier que ce contrôleur gère les routes commençant par 'auth'
@Controller('auth')
// Décorateur pour ajouter des tags dans la documentation Swagger
@ApiTags('Auth')
// Intercepteur pour uniformiser les réponses de succès
@UseInterceptors(SuccessInterceptor)

export class AuthController {
  // Injection de dépendance pour utiliser AuthService
  constructor(private authService: AuthService) {}

  /**
   * Route pour l'inscription des utilisateurs
   * @param {SignupDTO} body - Données d'inscription de l'utilisateur
   * @return {*} - Résultat de l'opération d'inscription
   */
  @Post('signup')
  @ApiBody({ type: SignupDTO }) // Documentation de la structure du corps de la requête pour Swagger
  async signup(@Body() body: SignupDTO) {
    return this.authService.signup(body);
  }

  /**
   * Route pour la connexion des utilisateurs
   * @param {SigninDTO} body - Données de connexion de l'utilisateur
   * @return {*} - Résultat de l'opération de connexion
   */
  @Post('signin')
  @ApiBody({ type: SigninDTO }) // Documentation de la structure du corps de la requête pour Swagger
  async signin(@Body() body: SigninDTO) {
    return this.authService.signin(body);
  }

  /**
   * Route pour rafraîchir le token d'accès
   * @param {TokenDto} tokenDto - Données contenant le refresh token
   * @return {*} - Nouveaux tokens d'accès et de rafraîchissement
   */
  @Post('refresh')
  async refresh(@Body() tokenDto: TokenDto) {
    return this.authService.refresh(tokenDto.refreshToken);
  }
}
