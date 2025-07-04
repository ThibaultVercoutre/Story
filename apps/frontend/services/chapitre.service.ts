import type { Chapitre } from '~/types'

export class ChapitreService {
  private static readonly BASE_URL = 'http://localhost:3001/api';

  // Récupérer tous les chapitres d'une story
  static async getChapitresByStoryId(storyId: string): Promise<Chapitre[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/stories/${storyId}/chapitres`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des chapitres:', error);
      throw error;
    }
  }

  // Récupérer un chapitre par ID
  static async getChapitreById(chapitreId: string): Promise<Chapitre> {
    try {
      const response = await fetch(`${this.BASE_URL}/chapitres/${chapitreId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération du chapitre:', error);
      throw error;
    }
  }

  // Récupérer un chapitre par ID ou slug
  static async getChapitreByIdOrSlug(identifier: string): Promise<Chapitre> {
    try {
      const response = await fetch(`${this.BASE_URL}/chapitres/identifier/${identifier}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération du chapitre:', error);
      throw error;
    }
  }

  // Créer un nouveau chapitre
  static async createChapitre(chapitre: Omit<Chapitre, 'id' | 'uuid' | 'slug' | 'createdAt' | 'updatedAt'>): Promise<Chapitre> {
    try {
      const response = await fetch(`${this.BASE_URL}/chapitres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chapitre),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création du chapitre:', error);
      throw error;
    }
  }

  // Mettre à jour un chapitre
  static async updateChapitre(chapitreId: string, updates: Partial<Omit<Chapitre, 'id' | 'uuid' | 'slug' | 'createdAt' | 'updatedAt'>>): Promise<Chapitre> {
    try {
      const response = await fetch(`${this.BASE_URL}/chapitres/${chapitreId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du chapitre:', error);
      throw error;
    }
  }

  // Supprimer un chapitre
  static async deleteChapitre(chapitreId: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/chapitres/${chapitreId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du chapitre:', error);
      throw error;
    }
  }
} 