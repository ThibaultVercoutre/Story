import type { StoryInput, StoryOutput } from '~/types'

export class StoryService {
  private static readonly baseUrl = 'http://localhost:3001/api/stories';

  // Récupérer toutes les stories
  static async getStories(): Promise<StoryOutput[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des stories:', error);
      throw error;
    }
  }

  // Récupérer une story par ID
  static async getStoryById(id: string): Promise<StoryOutput> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Story non trouvée');
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la story:', error);
      throw error;
    }
  }

  // Récupérer une story par ID ou slug
  static async getStoryByIdOrSlug(identifier: string): Promise<StoryOutput> {
    try {
      const response = await fetch(`${this.baseUrl}/identifier/${identifier}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Story non trouvée');
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la story:', error);
      throw error;
    }
  }

  // Récupérer les stories par auteur
  static async getStoriesByAuteur(auteur: string): Promise<StoryOutput[]> {
    try {
      const response = await fetch(`${this.baseUrl}/auteur/${encodeURIComponent(auteur)}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des stories par auteur:', error);
      throw error;
    }
  }

  // Récupérer les stories par statut
  static async getStoriesByStatut(statut: 'brouillon' | 'en_cours' | 'terminee' | 'publiee'): Promise<StoryOutput[]> {
    try {
      const response = await fetch(`${this.baseUrl}/statut/${statut}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des stories par statut:', error);
      throw error;
    }
  }

  // Créer une nouvelle story
  static async createStory(data: StoryInput): Promise<StoryOutput> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Erreur lors de la création de la story:', error);
      throw error;
    }
  }

  // Mettre à jour une story
  static async updateStory(id: string, data: Partial<StoryInput>): Promise<StoryOutput> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Story non trouvée');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la story:', error);
      throw error;
    }
  }

  // Supprimer une story
  static async deleteStory(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Story non trouvée');
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la story:', error);
      throw error;
    }
  }
} 