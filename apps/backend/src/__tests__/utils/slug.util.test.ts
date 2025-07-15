import { SlugUtil } from '../../utils/slug.util.js';

describe('SlugUtil', () => {
  describe('generateSlug', () => {
    it('devrait générer un slug basique', () => {
      const result = SlugUtil.generateSlug('Mon Titre de Test');
      expect(result).toBe('mon-titre-de-test');
    });

    it('devrait supprimer les accents', () => {
      const result = SlugUtil.generateSlug('Éléphant à éléphant');
      expect(result).toBe('elephant-a-elephant');
    });

    it('devrait supprimer les caractères spéciaux', () => {
      const result = SlugUtil.generateSlug('Test@#$%^&*()!');
      expect(result).toBe('test');
    });

    it('devrait remplacer les espaces par des tirets', () => {
      const result = SlugUtil.generateSlug('Plusieurs    espaces   consécutifs');
      expect(result).toBe('plusieurs-espaces-consecutifs');
    });

    it('devrait éviter les tirets multiples', () => {
      const result = SlugUtil.generateSlug('Test---avec---tirets');
      expect(result).toBe('test-avec-tirets');
    });

    it('devrait supprimer les tirets en début et fin', () => {
      const result = SlugUtil.generateSlug('   -Test- avec espaces-   ');
      expect(result).toBe('test-avec-espaces');
    });

    it('devrait préserver les chiffres', () => {
      const result = SlugUtil.generateSlug('Chapitre 123 Version 2.0');
      expect(result).toBe('chapitre-123-version-20');
    });

    it('devrait gérer les caractères unicode complexes', () => {
      const result = SlugUtil.generateSlug('Café & Thé ñoño');
      expect(result).toBe('cafe-the-nono');
    });

    it('devrait gérer les emoji et caractères spéciaux', () => {
      const result = SlugUtil.generateSlug('Test 🎉 avec emoji & symboles');
      expect(result).toBe('test-avec-emoji-symboles');
    });

    it('devrait retourner une chaîne vide pour un titre vide après nettoyage', () => {
      const result = SlugUtil.generateSlug('   @#$%^&*()   ');
      expect(result).toBe('');
    });

    it('devrait lever une erreur pour un titre null ou undefined', () => {
      expect(() => SlugUtil.generateSlug(null as any)).toThrow('Le titre doit être une chaîne de caractères non vide');
      expect(() => SlugUtil.generateSlug(undefined as any)).toThrow('Le titre doit être une chaîne de caractères non vide');
    });

    it('devrait lever une erreur pour un titre qui n\'est pas une chaîne', () => {
      expect(() => SlugUtil.generateSlug(123 as any)).toThrow('Le titre doit être une chaîne de caractères non vide');
      expect(() => SlugUtil.generateSlug({} as any)).toThrow('Le titre doit être une chaîne de caractères non vide');
    });

    it('devrait lever une erreur pour une chaîne vide', () => {
      expect(() => SlugUtil.generateSlug('')).toThrow('Le titre doit être une chaîne de caractères non vide');
    });

    it('devrait gérer les titres très longs', () => {
      const longTitle = 'A'.repeat(200) + ' ' + 'B'.repeat(200);
      const result = SlugUtil.generateSlug(longTitle);
      expect(result).toBe('a'.repeat(200) + '-' + 'b'.repeat(200));
    });

    it('devrait gérer les caractères cyrilliques', () => {
      const result = SlugUtil.generateSlug('Привет мир');
      expect(result).toBe('');
    });

    it('devrait gérer les caractères chinois', () => {
      const result = SlugUtil.generateSlug('你好世界');
      expect(result).toBe('');
    });

    it('devrait préserver les tirets existants', () => {
      const result = SlugUtil.generateSlug('Test-avec-tirets-existants');
      expect(result).toBe('test-avec-tirets-existants');
    });
  });
}); 