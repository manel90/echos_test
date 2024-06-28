import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  request: Request;

  constructor() {
    super();
  }

  /**
   * Méthode canActivate du cycle de vie du middleware.
   *
   * @param {ExecutionContext} context - Contexte de l'exécution de la requête
   * @return {boolean} - Renvoie true si l'accès est autorisé, sinon false
   * @memberof JwtAuthGuard
   */
  canActivate(context: ExecutionContext) {
    // Récupère la requête à partir du contexte HTTP
    this.request = context.switchToHttp().getRequest();
    return super.canActivate(context); // Appelle la méthode canActivate de la classe mère
  }

  /**
   * Méthode handleRequest pour gérer la requête après l'authentification.
   *
   * @param {*} err - Erreur d'authentification
   * @param {*} payload - Payload du JWT décodé
   * @param {*} info - Informations supplémentaires sur l'authentification
   * @param {ExecutionContext} context - Contexte de l'exécution de la requête
   * @return {*} - Renvoie le payload du JWT s'il est valide
   * @throws {UnauthorizedException} - Lance une exception si l'authentification échoue
   * @memberof JwtAuthGuard
   */
  handleRequest(err, payload, info, context) {
    // Récupère à nouveau la requête à partir du contexte HTTP
    this.request = context.switchToHttp().getRequest();

    // Vérifie s'il y a une erreur ou si le payload n'est pas défini
    if (err || !payload) {
      throw err || new UnauthorizedException(); // Lance une UnauthorizedException si l'authentification échoue
    }

    // Vérification optionnelle du user-agent pour renforcer la sécurité
    if (payload.userAgent) {
      const currentUserAgent = this.request.headers['user-agent'];
      if (currentUserAgent && currentUserAgent.toString() !== payload.userAgent) {
        throw new UnauthorizedException('User agent not allowed');
      }
    }

    return payload; // Retourne le payload du JWT s'il est valide
  }
}
