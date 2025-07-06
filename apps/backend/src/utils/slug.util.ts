/**
 * Utilitaire pour générer des slugs à partir de titres
 */
export class SlugUtil {
  /**
   * Génère un slug à partir d'un titre
   * @param titre - Le titre à convertir en slug
   * @returns Le slug généré
   */
  public static generateSlug(titre: string): string {
    if (!titre || typeof titre !== 'string') {
      throw new Error('Le titre doit être une chaîne de caractères non vide');
    }

    return titre
      .toLowerCase()
      .normalize('NFD') // Décompose les caractères accentués
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garde seulement lettres, chiffres, espaces et tirets
      .trim()
      .replace(/\s+/g, '-') // Remplace les espaces par des tirets
      .replace(/-+/g, '-') // Évite les tirets multiples
      .replace(/^-+|-+$/g, ''); // Supprime les tirets en début et fin
  }
} 