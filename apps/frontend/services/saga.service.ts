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
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des sagas:', error);
      throw error;
    }
  }

  // Récupérer une saga par ID
  static async getSagaById(id: string): Promise<SagaOutput | null> {
    if (!id) return null;
    
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return await response.json();
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
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des sagas par auteur:', error);
      return []; // Retourner un tableau vide en cas d'erreur
    }
  }

  // Supprimer une saga
  static async deleteSaga(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Erreur lors de la suppression de la saga:', error);
      throw error;
    }
  }
} 