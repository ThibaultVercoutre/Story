import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response.util.js';

/**
 * Configuration du rate limiting pour les endpoints d'authentification
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limiter à 5 tentatives par IP toutes les 15 minutes
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
  },
  standardHeaders: true, // Retourner les informations de rate limit dans les headers `RateLimit-*`
  legacyHeaders: false, // Désactiver les headers `X-RateLimit-*`
  handler: (req: Request, res: Response) => {
    ResponseUtil.error(res, 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.', 429);
  },
  skip: (req: Request) => {
    // Optionnel : ignorer certaines IP (par exemple, localhost en développement)
    if (process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1') {
      return true;
    }
    return false;
  }
});

/**
 * Configuration du rate limiting strict pour les endpoints sensibles
 */
export const strictRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // Limiter à 3 tentatives par IP par minute
  message: {
    success: false,
    message: 'Trop de tentatives. Veuillez réessayer dans 1 minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    ResponseUtil.error(res, 'Trop de tentatives. Veuillez réessayer dans 1 minute.', 429);
  },
  skip: (req: Request) => {
    if (process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1') {
      return true;
    }
    return false;
  }
});

/**
 * Configuration du rate limiting général pour l'API
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limiter à 1000 requêtes par IP toutes les 15 minutes
  message: {
    success: false,
    message: 'Trop de requêtes. Veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    ResponseUtil.error(res, 'Trop de requêtes. Veuillez réessayer plus tard.', 429);
  }
}); 