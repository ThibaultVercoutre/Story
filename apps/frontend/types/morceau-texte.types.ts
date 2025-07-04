// Types pour les morceaux de texte
export type TypeMorceauTexte = 'paragraphe' | 'citation' | 'dialogue'

// Interface pour les morceaux de texte
export interface MorceauTexte {
  id: string
  uuid: string
  chapitreId: string
  type: TypeMorceauTexte
  contenu: string
  ordre: number
  createdAt: string
  updatedAt: string
}

// Interface pour la sortie des morceaux de texte
export interface MorceauTexteOutput {
  id: string
  uuid: string
  chapitreId: string
  type: TypeMorceauTexte
  contenu: string
  ordre: number
  createdAt: string
  updatedAt: string
} 