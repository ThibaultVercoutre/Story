import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.util.js';
import { ValidationUtil, ValidationResult } from '../utils/validation.util.js';

/**
 * Type pour les fonctions de validation
 */
type ValidationFunction = (data: any) => ValidationResult;

/**
 * Middleware de validation générique
 */
export const validate = (validationFn: ValidationFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validation = validationFn(req.body);
    
    if (!validation.isValid) {
      ResponseUtil.validationError(res, validation.errors);
      return;
    }
    
    next();
  };
};

/**
 * Middleware de validation pour les paramètres d'URL
 */
export const validateParams = (validationFn: ValidationFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validation = validationFn(req.params);
    
    if (!validation.isValid) {
      ResponseUtil.validationError(res, validation.errors);
      return;
    }
    
    next();
  };
};

/**
 * Middleware de validation pour les paramètres de requête
 */
export const validateQuery = (validationFn: ValidationFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validation = validationFn(req.query);
    
    if (!validation.isValid) {
      ResponseUtil.validationError(res, validation.errors);
      return;
    }
    
    next();
  };
};

/**
 * Middleware de validation pour l'inscription
 */
export const validateRegister = validate(ValidationUtil.validateRegisterData);

/**
 * Middleware de validation pour la connexion
 */
export const validateLogin = validate(ValidationUtil.validateLoginData);

/**
 * Middleware de validation pour les sagas
 */
export const validateSaga = validate(ValidationUtil.validateSagaData);

/**
 * Middleware de validation pour les stories
 */
export const validateStory = validate(ValidationUtil.validateStoryData);

/**
 * Middleware de validation pour les chapitres
 */
export const validateChapitre = validate(ValidationUtil.validateChapitreData);

/**
 * Middleware de validation pour les IDs
 */
export const validateId = validateParams((params: any) => {
  return ValidationUtil.validateId(params.id);
});

/**
 * Middleware de validation pour les UUID
 */
export const validateUUID = validateParams((params: any) => {
  const errors: Record<string, string> = {};
  
  if (!params.uuid) {
    errors.uuid = 'UUID requis';
  } else if (!ValidationUtil.validateUUID(params.uuid)) {
    errors.uuid = 'Format UUID invalide';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
});

/**
 * Middleware de validation pour les statuts
 */
export const validateStatut = validateParams((params: any) => {
  const errors: Record<string, string> = {};
  
  if (!params.statut) {
    errors.statut = 'Statut requis';
  } else if (!ValidationUtil.validateStatut(params.statut)) {
    errors.statut = 'Statut invalide. Valeurs acceptées: brouillon, en_cours, terminee, publiee';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
});

/**
 * Middleware de validation pour les mises à jour partielles
 */
export const validatePartialUpdate = <T>(validationFn: ValidationFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Pour les mises à jour partielles, on accepte les objets vides
    if (Object.keys(req.body).length === 0) {
      ResponseUtil.validationError(res, { update: 'Aucune donnée à mettre à jour' });
      return;
    }
    
    const validation = validationFn(req.body);
    
    if (!validation.isValid) {
      ResponseUtil.validationError(res, validation.errors);
      return;
    }
    
    next();
  };
}; 