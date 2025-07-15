import sequelize from '../config/database.js';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement de test
dotenv.config({ path: '.env.test' });

// Utiliser l'instance Sequelize principale configurée pour SQLite en mode test
const sequelizeTest = sequelize;

export default sequelizeTest;

// Utilitaires pour les tests d'intégration
export class DatabaseTestUtils {
  /**
   * Initialise la base de données de test avec les modèles
   */
  static async initializeTestDatabase(): Promise<void> {
    try {
      // Importer les modèles avec leurs associations
      await import('../models/index.js');
      
      // Vérifier la connexion
      await sequelizeTest.authenticate();
      
      // Synchroniser les modèles (créer les tables)
      await sequelizeTest.sync({ force: true });
      
      console.log('Base de données de test initialisée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données de test:', error);
      throw error;
    }
  }

  /**
   * Nettoie la base de données de test
   */
  static async cleanTestDatabase(): Promise<void> {
    try {
      // Supprimer toutes les données
      await sequelizeTest.truncate({ cascade: true, restartIdentity: true });
      console.log('Base de données de test nettoyée');
    } catch (error) {
      console.error('Erreur lors du nettoyage de la base de données de test:', error);
      throw error;
    }
  }

  /**
   * Ferme la connexion à la base de données de test
   */
  static async closeTestDatabase(): Promise<void> {
    try {
      await sequelizeTest.close();
      console.log('Connexion à la base de données de test fermée');
    } catch (error) {
      console.error('Erreur lors de la fermeture de la base de données de test:', error);
      throw error;
    }
  }

  /**
   * Crée des données de test pour les tests d'intégration
   */
  static async createTestData(): Promise<{
    testUser: any;
    testSaga: any;
    testStory: any;
    testChapitre: any;
    testMorceauTexte: any;
  }> {
    // Import des modèles avec la configuration de test
    const { User, Saga, Story, Chapitre, MorceauTexte } = await import('../models/index.js');
    const { TypeMorceauTexte } = await import('../models/morceauTexte.model.js');

    // Créer un utilisateur de test
    const testUser = await User.create({
      uuid: 'test-user-uuid',
      email: 'test@example.com',
      nom: 'Test User',
      passwordHash: 'hashedPassword123',
      iv: 'test-iv',
      tag: 'test-tag',
      isActive: true,
    });

    // Créer une saga de test
    const testSaga = await Saga.create({
      uuid: 'test-saga-uuid',
      titre: 'Saga de Test',
      slug: 'saga-de-test',
      auteur: 'Auteur Test',
      statut: 'brouillon',
      userId: testUser.id,
      iv: 'test-iv',
      tag: 'test-tag',
    });

    // Créer une story de test
    const testStory = await Story.create({
      uuid: 'test-story-uuid',
      titre: 'Story de Test',
      slug: 'story-de-test',
      auteur: 'Auteur Test',
      statut: 'brouillon',
      userId: testUser.id,
      sagaId: testSaga.id,
      iv: 'test-iv',
      tag: 'test-tag',
    });

    // Créer un chapitre de test
    const testChapitre = await Chapitre.create({
      uuid: 'test-chapitre-uuid',
      titre: 'Chapitre de Test',
      slug: 'chapitre-de-test',
      numero: 1,
      storyId: testStory.id,
      iv: 'test-iv',
      tag: 'test-tag',
    });

    // Créer un morceau de texte de test
    const testMorceauTexte = await MorceauTexte.create({
      uuid: 'test-morceau-uuid',
      contenu: 'Contenu de test pour le morceau de texte',
      type: TypeMorceauTexte.PARAGRAPHE,
      ordre: 1,
      chapitreId: testChapitre.id,
      iv: 'test-iv',
      tag: 'test-tag',
    });

    return {
      testUser,
      testSaga,
      testStory,
      testChapitre,
      testMorceauTexte,
    };
  }
} 