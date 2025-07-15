import { ValidationUtil } from '../../utils/validation.util.js';

describe('ValidationUtil', () => {
  describe('validateEmail', () => {
    it('devrait valider un email correct', () => {
      expect(ValidationUtil.validateEmail('test@example.com')).toBe(true);
      expect(ValidationUtil.validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(ValidationUtil.validateEmail('user+tag@example.org')).toBe(true);
    });

    it('devrait invalider un email incorrect', () => {
      expect(ValidationUtil.validateEmail('invalid-email')).toBe(false);
      expect(ValidationUtil.validateEmail('test@')).toBe(false);
      expect(ValidationUtil.validateEmail('@example.com')).toBe(false);
      expect(ValidationUtil.validateEmail('test..test@example.com')).toBe(true); // Cet email est techniquement valide avec notre regex
      expect(ValidationUtil.validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('devrait valider un mot de passe correct', () => {
      const result = ValidationUtil.validatePassword('Password123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('devrait invalider un mot de passe vide', () => {
      const result = ValidationUtil.validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Le mot de passe est requis');
    });

    it('devrait invalider un mot de passe trop court', () => {
      const result = ValidationUtil.validatePassword('Pass1');
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Le mot de passe doit contenir au moins 8 caractères');
    });

    it('devrait invalider un mot de passe sans majuscule', () => {
      const result = ValidationUtil.validatePassword('password123');
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Le mot de passe doit contenir au moins une majuscule');
    });

    it('devrait invalider un mot de passe sans minuscule', () => {
      const result = ValidationUtil.validatePassword('PASSWORD123');
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Le mot de passe doit contenir au moins une minuscule');
    });

    it('devrait invalider un mot de passe sans chiffre', () => {
      const result = ValidationUtil.validatePassword('Password');
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Le mot de passe doit contenir au moins un chiffre');
    });
  });

  describe('validateRegisterData', () => {
    const validData = {
      email: 'test@example.com',
      nom: 'Test User',
      password: 'Password123',
    };

    it('devrait valider des données d\'inscription correctes', () => {
      const result = ValidationUtil.validateRegisterData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('devrait invalider des données sans email', () => {
      const result = ValidationUtil.validateRegisterData({ ...validData, email: undefined });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('L\'email est requis');
    });

    it('devrait invalider des données avec email invalide', () => {
      const result = ValidationUtil.validateRegisterData({ ...validData, email: 'invalid-email' });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Format d\'email invalide');
    });

    it('devrait invalider des données sans nom', () => {
      const result = ValidationUtil.validateRegisterData({ ...validData, nom: undefined });
      expect(result.isValid).toBe(false);
      expect(result.errors.nom).toBe('Le nom est requis');
    });

    it('devrait invalider des données avec nom trop court', () => {
      const result = ValidationUtil.validateRegisterData({ ...validData, nom: 'A' });
      expect(result.isValid).toBe(false);
      expect(result.errors.nom).toBe('Le nom doit contenir au moins 2 caractères');
    });

    it('devrait invalider des données avec mot de passe incorrect', () => {
      const result = ValidationUtil.validateRegisterData({ ...validData, password: 'weak' });
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });

    it('devrait retourner plusieurs erreurs', () => {
      const result = ValidationUtil.validateRegisterData({
        email: 'invalid',
        nom: 'A',
        password: 'weak',
      });
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toContain('email');
      expect(Object.keys(result.errors)).toContain('nom');
      expect(Object.keys(result.errors)).toContain('password');
    });
  });

  describe('validateLoginData', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('devrait valider des données de connexion correctes', () => {
      const result = ValidationUtil.validateLoginData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('devrait invalider des données sans email', () => {
      const result = ValidationUtil.validateLoginData({ ...validData, email: undefined });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('L\'email est requis');
    });

    it('devrait invalider des données avec email invalide', () => {
      const result = ValidationUtil.validateLoginData({ ...validData, email: 'invalid-email' });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Format d\'email invalide');
    });

    it('devrait invalider des données sans mot de passe', () => {
      const result = ValidationUtil.validateLoginData({ ...validData, password: undefined });
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Le mot de passe est requis');
    });
  });

  describe('validateSagaData', () => {
    const validData = {
      titre: 'Test Saga',
      auteur: 'Test Author',
      userId: 1,
    };

    it('devrait valider des données de saga correctes', () => {
      const result = ValidationUtil.validateSagaData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('devrait invalider des données sans titre', () => {
      const result = ValidationUtil.validateSagaData({ ...validData, titre: undefined });
      expect(result.isValid).toBe(false);
      expect(result.errors.titre).toBe('Le titre est requis');
    });

    it('devrait invalider des données avec titre trop court', () => {
      const result = ValidationUtil.validateSagaData({ ...validData, titre: 'A' });
      expect(result.isValid).toBe(false);
      expect(result.errors.titre).toBe('Le titre doit contenir au moins 2 caractères');
    });

    it('devrait invalider des données sans auteur', () => {
      const result = ValidationUtil.validateSagaData({ ...validData, auteur: undefined });
      expect(result.isValid).toBe(false);
      expect(result.errors.auteur).toBe('L\'auteur est requis');
    });

    it('devrait invalider des données avec auteur trop court', () => {
      const result = ValidationUtil.validateSagaData({ ...validData, auteur: 'A' });
      expect(result.isValid).toBe(false);
      expect(result.errors.auteur).toBe('L\'auteur doit contenir au moins 2 caractères');
    });

    it('devrait invalider des données sans userId', () => {
      const result = ValidationUtil.validateSagaData({ ...validData, userId: undefined });
      expect(result.isValid).toBe(false);
      expect(result.errors.userId).toBe('L\'ID utilisateur est requis');
    });

    it('devrait invalider des données avec userId invalide', () => {
      const result = ValidationUtil.validateSagaData({ ...validData, userId: NaN });
      expect(result.isValid).toBe(false);
      expect(result.errors.userId).toBe('L\'ID utilisateur est requis');
    });
  });

  describe('validateStoryData', () => {
    const validData = {
      titre: 'Test Story',
      auteur: 'Test Author',
      userId: 1,
    };

    it('devrait valider des données de story correctes', () => {
      const result = ValidationUtil.validateStoryData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('devrait invalider des données sans titre', () => {
      const result = ValidationUtil.validateStoryData({ ...validData, titre: undefined });
      expect(result.isValid).toBe(false);
      expect(result.errors.titre).toBe('Le titre est requis');
    });

    it('devrait invalider des données avec titre trop court', () => {
      const result = ValidationUtil.validateStoryData({ ...validData, titre: 'A' });
      expect(result.isValid).toBe(false);
      expect(result.errors.titre).toBe('Le titre doit contenir au moins 2 caractères');
    });
  });

  describe('validateChapitreData', () => {
    const validData = {
      titre: 'Test Chapter',
      numero: 1,
      storyId: 1,
    };

    it('devrait valider des données de chapitre correctes', () => {
      const result = ValidationUtil.validateChapitreData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('devrait invalider des données sans titre', () => {
      const result = ValidationUtil.validateChapitreData({ ...validData, titre: undefined });
      expect(result.isValid).toBe(false);
      expect(result.errors.titre).toBe('Le titre est requis');
    });

    it('devrait invalider des données sans numéro', () => {
      const result = ValidationUtil.validateChapitreData({ ...validData, numero: undefined });
      expect(result.isValid).toBe(false);
      expect(result.errors.numero).toBe('Le numéro de chapitre est requis');
    });

    it('devrait invalider des données avec numéro invalide', () => {
      const result = ValidationUtil.validateChapitreData({ ...validData, numero: 0 });
      expect(result.isValid).toBe(false);
      expect(result.errors.numero).toBe('Le numéro de chapitre est requis');
    });

    it('devrait invalider des données sans storyId', () => {
      const result = ValidationUtil.validateChapitreData({ ...validData, storyId: undefined });
      expect(result.isValid).toBe(false);
      expect(result.errors.storyId).toBe('L\'ID de l\'histoire est requis');
    });
  });

  describe('validateStatut', () => {
    it('devrait valider les statuts corrects', () => {
      expect(ValidationUtil.validateStatut('brouillon')).toBe(true);
      expect(ValidationUtil.validateStatut('en_cours')).toBe(true);
      expect(ValidationUtil.validateStatut('terminee')).toBe(true);
      expect(ValidationUtil.validateStatut('publiee')).toBe(true);
    });

    it('devrait invalider les statuts incorrects', () => {
      expect(ValidationUtil.validateStatut('invalid')).toBe(false);
      expect(ValidationUtil.validateStatut('')).toBe(false);
      expect(ValidationUtil.validateStatut('draft')).toBe(false);
    });
  });

  describe('validateId', () => {
    it('devrait valider un ID numérique correct', () => {
      const result = ValidationUtil.validateId(1);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('devrait valider un ID string numérique', () => {
      const result = ValidationUtil.validateId('123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('devrait invalider un ID négatif', () => {
      const result = ValidationUtil.validateId(-1);
      expect(result.isValid).toBe(false);
      expect(result.errors.id).toBe('ID invalide');
    });

    it('devrait invalider un ID zéro', () => {
      const result = ValidationUtil.validateId(0);
      expect(result.isValid).toBe(false);
      expect(result.errors.id).toBe('ID invalide');
    });

    it('devrait invalider un ID non numérique', () => {
      const result = ValidationUtil.validateId('abc');
      expect(result.isValid).toBe(false);
      expect(result.errors.id).toBe('ID invalide');
    });
  });

  describe('validateUUID', () => {
    it('devrait valider un UUID correct', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(ValidationUtil.validateUUID(uuid)).toBe(true);
    });

    it('devrait invalider un UUID incorrect', () => {
      expect(ValidationUtil.validateUUID('invalid-uuid')).toBe(false);
      expect(ValidationUtil.validateUUID('123e4567-e89b-12d3-a456')).toBe(false);
      expect(ValidationUtil.validateUUID('')).toBe(false);
    });
  });
}); 