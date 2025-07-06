import { Response } from 'express';

/**
 * Interface pour les réponses API standardisées
 */
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

/**
 * Classe utilitaire pour standardiser les réponses API
 */
export class ResponseUtil {
  /**
   * Retourne une réponse de succès
   */
  static success<T>(res: Response, data?: T, message?: string, statusCode = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      ...(message && { message }),
      ...(data && { data }),
    };
    
    res.status(statusCode).json(response);
  }

  /**
   * Retourne une réponse d'erreur
   */
  static error(res: Response, message: string, statusCode = 500, error?: string): void {
    const response: ApiResponse = {
      success: false,
      message,
      ...(error && { error }),
    };
    
    res.status(statusCode).json(response);
  }

  /**
   * Retourne une réponse d'erreur de validation
   */
  static validationError(res: Response, errors: Record<string, string>, message = 'Erreurs de validation'): void {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
    };
    
    res.status(400).json(response);
  }

  /**
   * Retourne une réponse "non trouvé"
   */
  static notFound(res: Response, message = 'Ressource non trouvée'): void {
    ResponseUtil.error(res, message, 404);
  }

  /**
   * Retourne une réponse "non autorisé"
   */
  static unauthorized(res: Response, message = 'Accès non autorisé'): void {
    ResponseUtil.error(res, message, 401);
  }

  /**
   * Retourne une réponse "interdit"
   */
  static forbidden(res: Response, message = 'Accès interdit'): void {
    ResponseUtil.error(res, message, 403);
  }

  /**
   * Retourne une réponse "conflit"
   */
  static conflict(res: Response, message = 'Conflit avec la ressource existante'): void {
    ResponseUtil.error(res, message, 409);
  }

  /**
   * Retourne une réponse "créé"
   */
  static created<T>(res: Response, data?: T, message = 'Ressource créée avec succès'): void {
    ResponseUtil.success(res, data, message, 201);
  }

  /**
   * Gestion globale des erreurs
   */
  static handleError(res: Response, error: any, context = 'Opération'): void {
    console.error(`Erreur lors de ${context}:`, error);
    
    // Gestion des erreurs spécifiques
    if (error.name === 'ValidationError') {
      ResponseUtil.validationError(res, error.errors);
      return;
    }
    
    if (error.name === 'SequelizeValidationError') {
      const errors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        errors[err.path] = err.message;
      });
      ResponseUtil.validationError(res, errors);
      return;
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      ResponseUtil.conflict(res, 'Une ressource avec ces propriétés existe déjà');
      return;
    }
    
    // Erreur par défaut
    ResponseUtil.error(res, 'Erreur interne du serveur');
  }
} 