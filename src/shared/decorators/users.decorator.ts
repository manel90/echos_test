import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Décorateur `User` pour récupérer l'utilisateur courant à partir de la requête HTTP.
 * @param {unknown} data - Données facultatives pour le décorateur (non utilisées dans cet exemple).
 * @param {ExecutionContext} ctx - Contexte d'exécution NestJS contenant la requête HTTP.
 * @returns {*} - L'objet représentant l'utilisateur courant extrait de la requête.
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // Accéder à la requête HTTP à partir du contexte d'exécution
    const request = ctx.switchToHttp().getRequest();
    // Retourner l'utilisateur extrait de la requête
    return request.user;
  },
);

