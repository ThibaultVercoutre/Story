// Types pour les stories
export enum Statut {
  BROUILLON = 'brouillon',
  EN_COURS = 'en_cours',
  TERMINEE = 'terminee',
  PUBLIEE = 'publiee'
}

export interface StoryInput {
  titre: string;
  description?: string;
  auteur: string;
  statut?: Statut;
  sagaId?: number;
  userId: number;
}

export interface UserOutput {
  id: number;
  nom: string;
  email: string;
}

export interface SagaOutput {
  id: number;
  titre: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface StoryOutput {
  id: string;
  uuid: string;
  titre: string;
  slug: string;
  description?: string;
  auteur: string;
  userId: number;
  user: UserOutput;
  statut: Statut;
  createdAt: string;
  updatedAt: string;
  sagaId?: number;
  saga?: SagaOutput;
} 