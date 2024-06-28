import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES } from '@echos/utils/constants/roles.constant';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Méthode requise par l'interface CanActivate pour déterminer si l'accès est autorisé.
   * @param context Contexte d'exécution de la requête
   * @returns true si l'accès est autorisé, sinon lance une UnauthorizedException
   */
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler()) || [];
    const classRoles = this.reflector.get<string[]>('roles', context.getClass()) || [];

    // Si ni la méthode ni la classe n'ont de décorateur @Roles, autorise l'accès
    if (!roles.length && !classRoles.length) {
      return true;
    }

    // Combine les rôles spécifiés au niveau de la méthode et de la classe
    const allRoles = [...roles, ...classRoles];

    // Obtient l'utilisateur à partir de la requête HTTP
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Vérifie si l'utilisateur possède au moins l'un des rôles requis
    if (!this.checkRoles(allRoles, user?.role)) {
      throw new UnauthorizedException(
        `You do not have permission to perform this action. This action requires one of the following roles: ${allRoles.join(' | ')}`,
      );
    }

    return true;
  }

  /**
   * Vérifie si l'utilisateur possède au moins l'un des rôles spécifiés.
   * @param roles Liste des rôles requis
   * @param userRoles Rôles de l'utilisateur
   * @returns true si l'utilisateur possède au moins l'un des rôles spécifiés, sinon false
   */
  private checkRoles(roles: string[], userRoles: string): boolean {
    if (roles.includes(ROLES.ALL)) {
      return true; // Si le rôle requis est 'all', autorise l'accès
    }

    return roles.includes(userRoles); // Vérifie si l'utilisateur a l'un des rôles requis
  }
}
