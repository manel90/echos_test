import { SetMetadata } from '@nestjs/common';

/**
 * Décorateur `Roles` pour définir les rôles autorisés sur les routes
 * @param {string[]} roles - Tableau des rôles autorisés.
 * @returns {*} - Métadonnées spécifiant les rôles autorisés pour la route
 */
export const Roles = (roles: string[]) => SetMetadata('roles', roles);
