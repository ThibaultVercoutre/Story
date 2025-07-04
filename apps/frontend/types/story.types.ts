// Types pour les stories
export interface StoryInput {
  titre: string;
  description?: string;
  auteur: string;
  statut?: 'brouillon' | 'en_cours' | 'terminee' | 'publiee';
}

export interface StoryOutput {
  id: string;
  uuid: string;
  titre: string;
  slug: string;
  description?: string;
  auteur: string;
  statut: 'brouillon' | 'en_cours' | 'terminee' | 'publiee';
  createdAt: string;
  updatedAt: string;
} 