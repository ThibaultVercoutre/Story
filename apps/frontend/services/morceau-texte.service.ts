import type { TypeMorceauTexte, MorceauTexte, MorceauTexteOutput } from '~/types'

// Service pour les morceaux de texte
export class MorceauTexteService {
  private static readonly baseUrl = 'http://localhost:3001/api/morceaux-texte'

  /**
   * Récupère tous les morceaux de texte d'un chapitre
   */
  static async getMorceauxTexteByChapitreId(chapitreId: string): Promise<MorceauTexteOutput[]> {
    try {
      const response = await fetch(`http://localhost:3001/api/chapitres/${chapitreId}/morceaux-texte`)
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des morceaux de texte:', error)
      throw error
    }
  }

  /**
   * Récupère un morceau de texte par son ID
   */
  static async getMorceauTexteById(id: string): Promise<MorceauTexteOutput> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`)
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Erreur lors de la récupération du morceau de texte:', error)
      throw error
    }
  }

  /**
   * Crée un nouveau morceau de texte
   */
  static async createMorceauTexte(data: Omit<MorceauTexte, 'id' | 'uuid' | 'createdAt' | 'updatedAt'>): Promise<MorceauTexteOutput> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Erreur lors de la création du morceau de texte:', error)
      throw error
    }
  }

  /**
   * Met à jour un morceau de texte
   */
  static async updateMorceauTexte(id: string, data: Partial<Omit<MorceauTexte, 'id' | 'uuid' | 'createdAt' | 'updatedAt'>>): Promise<MorceauTexteOutput> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Erreur lors de la mise à jour du morceau de texte:', error)
      throw error
    }
  }

  /**
   * Supprime un morceau de texte
   */
  static async deleteMorceauTexte(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du morceau de texte:', error)
      throw error
    }
  }
} 