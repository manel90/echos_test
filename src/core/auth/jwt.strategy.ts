import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "./auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  /**
   * Crée une instance de JwtStrategy.
   * @param {ConfigService} configService - Service pour accéder à la configuration de l'application
   * @param {AuthService} authService - Service pour la gestion de l'authentification
   * @memberof JwtStrategy
   */
  constructor(
    protected readonly configService: ConfigService,
    private authService: AuthService
  ) {
    // Appel du constructeur de la classe mère avec les options de la stratégie JWT
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Récupère le JWT depuis le header Authorization Bearer
      ignoreExpiration: false, // Ne pas ignorer l'expiration du JWT
      secretOrKey: configService.get('jwt_secret'), // Clé secrète utilisée pour signer et vérifier le JWT
      passReqToCallback: true, // Transmettre l'objet Request à la fonction callback
    });
  }

  /**
   * Fonction de validation du token JWT
   *
   * @param {*} req - Objet Request de l'API
   * @param {*} payload - Payload extrait du token JWT
   * @return {*} - Objet utilisateur validé
   * @memberof JwtStrategy
   */
  async validate(req: Request, payload: any) {
    // Valide l'utilisateur à partir du service d'authentification en utilisant l'ID utilisateur du payload JWT
    const user = await this.authService.validateUser(payload.userId);

    // Si aucun utilisateur n'est trouvé, lance une exception UnauthorizedException
    if (!user) {
      throw new UnauthorizedException('The token is invalid');
    }

    // Retourne un objet combinant le payload du JWT et les informations utilisateur validées
    return { ...payload, ...user };
  }
}
