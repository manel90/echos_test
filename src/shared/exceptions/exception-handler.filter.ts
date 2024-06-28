import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { MESSAGES } from '@nestjs/core/constants';
import { Response } from 'express';

// Fonction utilitaire pour obtenir le statut HTTP de l'exception
export const getStatusCode = (exception: unknown): number => {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
};

// Décorateur `@Catch()` pour capturer toutes les exceptions dans l'application NestJS
@Catch()
export class GlobalExceptionFilter<T = any> implements ExceptionFilter<T> {

  // Méthode `catch()` requise par l'interface `ExceptionFilter`
  catch(exception: T | any, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // Obtenir le contexte HTTP à partir de `ArgumentsHost`
    const response = ctx.getResponse<Response>(); // Obtenir l'objet `Response` Express

    // Déterminer le code d'erreur HTTP en fonction du type d'exception
    const code = getStatusCode(exception);

    // Si l'exception n'est pas une instance de `HttpException`, gérer l'erreur inconnue
    if (!(exception instanceof HttpException)) {
      return this.handleUnknownError(host, exception);
    }

    // Récupérer la réponse de l'exception
    const res = <{ statusCode: string; message: string }>(
      exception.getResponse()
    );

    let message;

    // Si la réponse de l'exception est un objet
    if (isObject(res)) {
      message = {
        status: res.statusCode,
        success: false,
        message: res.message,
        error: exception.name,
      };
    } else {
      // Si la réponse de l'exception est une chaîne de caractères
      message = {
        status: exception.getStatus(),
        success: false,
        message: res,
        error: exception.name,
      };
    }

    // Envoyer la réponse JSON avec le code d'erreur approprié
    response.status(code).json(message);
  }

  /**
   * Gérer une erreur inconnue.
   * @param {ArgumentsHost} host - Contexte d'exécution
   * @param {any} exception - L'erreur inconnue
   */
  public handleUnknownError(host: ArgumentsHost, exception: any) {
    const ctx = host.switchToHttp(); // Obtenir le contexte HTTP à partir de `ArgumentsHost`
    const response = ctx.getResponse<Response>(); // Obtenir l'objet `Response` Express

    const code = HttpStatus.INTERNAL_SERVER_ERROR; // Code d'erreur HTTP par défaut

    const message = {
      status: code,
      success: false,
      message: MESSAGES.UNKNOWN_EXCEPTION_MESSAGE, // Message d'erreur par défaut
      error: exception,
    };


    console.log(exception);

    // Envoyer la réponse JSON avec le code d'erreur 500 (INTERNAL_SERVER_ERROR)
    response.status(code).json(message);
  }

  /**
   * Vérifie si l'erreur provient de la bibliothèque "http-errors".
   * @param err - Objet d'erreur
   */
  public isHttpError(err: any): err is { statusCode: number; message: string } {
    return err?.statusCode && err?.message; // Vérifie si `err` a `statusCode` et `message`
  }
}
