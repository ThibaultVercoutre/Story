/**
 * Résultat de validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Classe utilitaire pour la validation des données
 */
export class ValidationUtil {
  /**
   * Valide un email
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valide un mot de passe
   */
  static validatePassword(password: string): ValidationResult {
    const errors: Record<string, string> = {};
    
    if (!password) {
      errors.password = 'Le mot de passe est requis';
    } else {
      if (password.length < 8) {
        errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      } else if (!/[A-Z]/.test(password)) {
        errors.password = 'Le mot de passe doit contenir au moins une majuscule';
      } else if (!/[a-z]/.test(password)) {
        errors.password = 'Le mot de passe doit contenir au moins une minuscule';
      } else if (!/[0-9]/.test(password)) {
        errors.password = 'Le mot de passe doit contenir au moins un chiffre';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Valide les données d'inscription
   */
  static validateRegisterData(data: { email?: string; nom?: string; password?: string }): ValidationResult {
    const errors: Record<string, string> = {};
    
    if (!data.email) {
      errors.email = 'L\'email est requis';
    } else if (!ValidationUtil.validateEmail(data.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (!data.nom) {
      errors.nom = 'Le nom est requis';
    } else if (data.nom.length < 2) {
      errors.nom = 'Le nom doit contenir au moins 2 caractères';
    }
    
    const passwordValidation = ValidationUtil.validatePassword(data.password || '');
    if (!passwordValidation.isValid) {
      Object.assign(errors, passwordValidation.errors);
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Valide les données de connexion
   */
  static validateLoginData(data: { email?: string; password?: string }): ValidationResult {
    const errors: Record<string, string> = {};
    
    if (!data.email) {
      errors.email = 'L\'email est requis';
    } else if (!ValidationUtil.validateEmail(data.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (!data.password) {
      errors.password = 'Le mot de passe est requis';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Valide les données de saga
   */
  static validateSagaData(data: { titre?: string; auteur?: string; userId?: number }): ValidationResult {
    const errors: Record<string, string> = {};
    
    if (!data.titre) {
      errors.titre = 'Le titre est requis';
    } else if (data.titre.length < 2) {
      errors.titre = 'Le titre doit contenir au moins 2 caractères';
    }
    
    if (!data.auteur) {
      errors.auteur = 'L\'auteur est requis';
    } else if (data.auteur.length < 2) {
      errors.auteur = 'L\'auteur doit contenir au moins 2 caractères';
    }
    
    if (!data.userId) {
      errors.userId = 'L\'ID utilisateur est requis';
    } else if (isNaN(data.userId)) {
      errors.userId = 'L\'ID utilisateur doit être un nombre';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Valide les données de story
   */
  static validateStoryData(data: { titre?: string; auteur?: string; userId?: number }): ValidationResult {
    const errors: Record<string, string> = {};
    
    if (!data.titre) {
      errors.titre = 'Le titre est requis';
    } else if (data.titre.length < 2) {
      errors.titre = 'Le titre doit contenir au moins 2 caractères';
    }
    
    if (!data.auteur) {
      errors.auteur = 'L\'auteur est requis';
    } else if (data.auteur.length < 2) {
      errors.auteur = 'L\'auteur doit contenir au moins 2 caractères';
    }
    
    if (!data.userId) {
      errors.userId = 'L\'ID utilisateur est requis';
    } else if (isNaN(data.userId)) {
      errors.userId = 'L\'ID utilisateur doit être un nombre';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Valide les données de chapitre
   */
  static validateChapitreData(data: { titre?: string; numero?: number; storyId?: number }): ValidationResult {
    const errors: Record<string, string> = {};
    
    if (!data.titre) {
      errors.titre = 'Le titre est requis';
    } else if (data.titre.length < 2) {
      errors.titre = 'Le titre doit contenir au moins 2 caractères';
    }
    
    if (!data.numero) {
      errors.numero = 'Le numéro de chapitre est requis';
    } else if (isNaN(data.numero) || data.numero < 1) {
      errors.numero = 'Le numéro de chapitre doit être un nombre positif';
    }
    
    if (!data.storyId) {
      errors.storyId = 'L\'ID de l\'histoire est requis';
    } else if (isNaN(data.storyId)) {
      errors.storyId = 'L\'ID de l\'histoire doit être un nombre';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Valide un statut
   */
  static validateStatut(statut: string): boolean {
    const validStatuts = ['brouillon', 'en_cours', 'terminee', 'publiee'];
    return validStatuts.includes(statut);
  }

  /**
   * Valide un ID numérique
   */
  static validateId(id: string | number): ValidationResult {
    const errors: Record<string, string> = {};
    
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    if (isNaN(numericId) || numericId < 1) {
      errors.id = 'ID invalide';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Valide un UUID
   */
  static validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
} 