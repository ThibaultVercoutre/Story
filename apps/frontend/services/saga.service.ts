import type { SagaOutput } from '~/types/story.types'

export class SagaService {
  private static readonly baseUrl = 'http://localhost:3001/api/sagas';

  // Récupérer toutes les sagas
  static async getSagas(): Promise<SagaOutput[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des sagas:', error);
      throw error;
    }
  }

  // Récupérer une saga par ID
  static async getSagaById(id: string): Promise<SagaOutput | null> {
    if (!id) return null;
    
    try {
      const response = await fetch(`${this.baseUrl}/id/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la saga:', error);
      return null;
    }
  }

  // Récupérer les sagas par auteur
  static async getSagasByAuteur(auteur: string): Promise<SagaOutput[]> {
    try {
      const response = await fetch(`${this.baseUrl}/auteur/${encodeURIComponent(auteur)}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des sagas par auteur:', error);
      return []; // Retourner un tableau vide en cas d'erreur
    }
  }

  // Récupérer les sagas par userId
  static async getSagasByUserId(userId: number): Promise<SagaOutput[]> {
    try {
      const response = await fetch(`${this.baseUrl}/userId/${userId}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des sagas par userId:', error);
      return []; // Retourner un tableau vide en cas d'erreur
    }
  }

  // Créer une nouvelle saga
  static async createSaga(data: { titre: string; description?: string; auteur: string; userId: number }): Promise<SagaOutput> {
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
      console.error('Erreur lors de la création de la saga:', error);
      throw error;
    }
  }

  // Supprimer une saga
  static async deleteSaga(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Saga non trouvée');
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la saga:', error);
      throw error;
    }
  }
} 