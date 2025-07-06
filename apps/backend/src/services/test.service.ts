import User from '../models/user.model.js';
import Saga from '../models/saga.model.js';
import Story from '../models/story.model.js';
import Chapitre from '../models/chapitre.model.js';
import MorceauTexte from '../models/morceauTexte.model.js';
import { EncryptionService } from './encryption.service.js';

export class TestService {
  
  // Configurations pour les champs chiffrés basées sur les autres services
  private static readonly USER_ENCRYPTED_FIELDS_CONFIG = {
    email: {
      fromModel: (model: any) => model.email
    },
    nom: {
      fromModel: (model: any) => model.nom
    }
  } as const;

  private static readonly SAGA_ENCRYPTED_FIELDS_CONFIG = {
    titre: {
      fromModel: (model: any) => model.titre
    },
    slug: {
      fromModel: (model: any) => model.slug
    },
    description: {
      fromModel: (model: any) => model.description
    },
    auteur: {
      fromModel: (model: any) => model.auteur || 'Auteur Inconnu'
    }
  } as const;

  private static readonly STORY_ENCRYPTED_FIELDS_CONFIG = {
    titre: {
      fromModel: (model: any) => model.titre
    },
    slug: {
      fromModel: (model: any) => model.slug
    },
    description: {
      fromModel: (model: any) => model.description
    },
    auteur: {
      fromModel: (model: any) => model.auteur || 'Auteur Inconnu'
    }
  } as const;

  private static readonly CHAPITRE_ENCRYPTED_FIELDS_CONFIG = {
    titre: {
      fromModel: (model: any) => model.titre
    },
    slug: {
      fromModel: (model: any) => model.slug
    }
  } as const;

  private static readonly MORCEAU_ENCRYPTED_FIELDS_CONFIG = {
    contenu: {
      fromModel: (model: any) => model.contenu
    }
  } as const;

  /**
   * Récupère tous les users avec toutes leurs données imbriquées
   * Route de test de performance pour le déchiffrement
   */
  public static async getAllUsersWithFullData(options: {
    limit?: number;
    offset?: number;
    maxSagas?: number;
    maxStories?: number;
    maxChapitres?: number;
    maxMorceaux?: number;
  } = {}) {
    const startTime = Date.now();
    
    // Valeurs par défaut pour éviter le dépassement mémoire
    const {
      limit = 5,           // Par défaut: seulement 5 users
      offset = 0,
      maxSagas = 3,        // Max 3 sagas par user
      maxStories = 2,      // Max 2 stories par saga/user
      maxChapitres = 38,    // Max 38 chapitres par story
      maxMorceaux = 50     // Max 20 morceaux par chapitre
    } = options;
    
    try {
      console.log(`📊 Requête avec limites: ${limit} users, ${maxSagas} sagas, ${maxStories} stories, ${maxChapitres} chapitres, ${maxMorceaux} morceaux`);
      
      const users = await User.findAll({
        limit,
        offset,
        include: [
          {
            model: Saga,
            as: 'sagas',
            limit: maxSagas,
            separate: true,
            include: [
              {
                model: Story,
                as: 'stories',
                limit: maxStories,
                separate: true,
                include: [
                  {
                    model: Chapitre,
                    as: 'chapitres',
                    limit: maxChapitres,
                    separate: true,
                    include: [
                      {
                        model: MorceauTexte,
                        as: 'morceauxTexte',
                        limit: maxMorceaux,
                        separate: true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            model: Story,
            as: 'stories',
            limit: maxStories,
            separate: true,
            include: [
              {
                model: Chapitre,
                as: 'chapitres',
                limit: maxChapitres,
                separate: true,
                include: [
                  {
                    model: MorceauTexte,
                    as: 'morceauxTexte',
                    limit: maxMorceaux,
                    separate: true
                  }
                ]
              }
            ]
          }
        ]
      });

      const queryEndTime = Date.now();
      const queryTime = queryEndTime - startTime;

      console.log(`✅ Requête SQL terminée en ${queryTime}ms - ${users.length} utilisateurs récupérés`);

      // Nettoyer les données AVANT le déchiffrement pour éviter les références circulaires
      const cleanUsers = JSON.parse(JSON.stringify(users));

      // ÉTAPE CRUCIALE : Déchiffrement explicite de toutes les données
      const { decryptedUsers, decryptionStats } = await this.decryptAllData(cleanUsers);

      const totalEndTime = Date.now();
      const totalExecutionTime = totalEndTime - startTime;

      // Calculer les statistiques
      const stats = {
        totalUsers: users.length,
        totalSagas: users.reduce((sum: number, user: any) => sum + (user.sagas?.length || 0), 0),
        totalStories: users.reduce((sum: number, user: any) => {
          const sagaStories = user.sagas?.reduce((sagaSum: number, saga: any) => sagaSum + (saga.stories?.length || 0), 0) || 0;
          const directStories = user.stories?.length || 0;
          return sum + sagaStories + directStories;
        }, 0),
        totalChapitres: users.reduce((sum: number, user: any) => {
          const sagaChapitres = user.sagas?.reduce((sagaSum: number, saga: any) => 
            sagaSum + (saga.stories?.reduce((storySum: number, story: any) => 
              storySum + (story.chapitres?.length || 0), 0) || 0), 0) || 0;
          const directChapitres = user.stories?.reduce((storySum: number, story: any) => 
            storySum + (story.chapitres?.length || 0), 0) || 0;
          return sum + sagaChapitres + directChapitres;
        }, 0),
        totalMorceauxTexte: users.reduce((sum: number, user: any) => {
          const sagaMorceaux = user.sagas?.reduce((sagaSum: number, saga: any) => 
            sagaSum + (saga.stories?.reduce((storySum: number, story: any) => 
              storySum + (story.chapitres?.reduce((chapSum: number, chapitre: any) => 
                chapSum + (chapitre.morceauxTexte?.length || 0), 0) || 0), 0) || 0), 0) || 0;
          const directMorceaux = user.stories?.reduce((storySum: number, story: any) => 
            storySum + (story.chapitres?.reduce((chapSum: number, chapitre: any) => 
              chapSum + (chapitre.morceauxTexte?.length || 0), 0) || 0), 0) || 0;
          return sum + sagaMorceaux + directMorceaux;
        }, 0),
        executionTimeMs: totalExecutionTime,
        executionTimeSeconds: (totalExecutionTime / 1000).toFixed(2),
        limits: { limit, offset, maxSagas, maxStories, maxChapitres, maxMorceaux }
      };

      // Nettoyer les données déchiffrées pour éviter les références circulaires de Sequelize
      const cleanDecryptedUsers = JSON.parse(JSON.stringify(decryptedUsers));

      return {
        data: cleanDecryptedUsers, // Retourner les données déchiffrées nettoyées
        rawData: cleanUsers,       // Données brutes nettoyées pour comparaison si besoin
        stats,
        decryption: decryptionStats, // Statistiques de déchiffrement détaillées
        performance: {
          totalTime: totalExecutionTime,
          queryTime: queryTime,
          decryptionTime: decryptionStats.decryptionTimeMs,
          decryptionOperationsActual: decryptionStats.usersDecrypted + decryptionStats.sagasDecrypted + decryptionStats.storiesDecrypted + decryptionStats.chapitresDecrypted + decryptionStats.morceauxDecrypted,
          decryptionErrors: decryptionStats.errors,
          averageTimePerRecord: stats.totalUsers > 0 ? (totalExecutionTime / stats.totalUsers).toFixed(2) : 0,
          averageDecryptionPerRecord: stats.totalUsers > 0 ? (decryptionStats.decryptionTimeMs / stats.totalUsers).toFixed(2) : 0
        },
        pagination: {
          current: { limit, offset },
          next: { limit, offset: offset + limit },
          hasMore: users.length === limit
        }
      };
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      throw new Error(`Erreur lors de la récupération des données de test: ${(error as any).message} (Temps d'exécution: ${executionTime}ms)`);
    }
  }

  /**
   * Version sécurisée pour de vraies données complètes - TRÈS LIMITÉE
   */
  public static async getAllUsersFullDataDangerous() {
    console.log('⚠️  ATTENTION: Récupération de TOUTES les données sans limite!');
    
    return this.getAllUsersWithFullData({
      limit: 999999,    // Pas de limite sur les users
      maxSagas: 999999,
      maxStories: 999999,
      maxChapitres: 999999,
      maxMorceaux: 999999
    });
  }

  /**
   * Récupère uniquement les statistiques sans les données
   * Pour un aperçu rapide des performances
   */
  public static async getPerformanceStats() {
    const startTime = Date.now();
    
    try {
      const [userCount, sagaCount, storyCount, chapitreCount, morceauCount] = await Promise.all([
        User.count(),
        Saga.count(),
        Story.count(),
        Chapitre.count(),
        MorceauTexte.count()
      ]);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      return {
        stats: {
          totalUsers: userCount,
          totalSagas: sagaCount,
          totalStories: storyCount,
          totalChapitres: chapitreCount,
          totalMorceauxTexte: morceauCount,
          totalRecords: userCount + sagaCount + storyCount + chapitreCount + morceauCount,
          executionTimeMs: executionTime,
          executionTimeSeconds: (executionTime / 1000).toFixed(2)
        },
        performance: {
          queryTime: executionTime,
          countOperations: 5,
          averageTimePerCount: (executionTime / 5).toFixed(2)
        }
      };
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      throw new Error(`Erreur lors de la récupération des statistiques: ${(error as any).message} (Temps d'exécution: ${executionTime}ms)`);
    }
  }

  /**
   * Test de déchiffrement sur un échantillon limité
   * Pour tester les performances sans surcharger le système
   */
  public static async getTestSample(limit: number = 10) {
    const startTime = Date.now();
    
    try {
      const users = await User.findAll({
        limit,
        include: [
          {
            model: Saga,
            as: 'sagas',
            limit: 5,
            include: [
              {
                model: Story,
                as: 'stories',
                limit: 3,
                include: [
                  {
                    model: Chapitre,
                    as: 'chapitres',
                    limit: 2,
                    include: [
                      {
                        model: MorceauTexte,
                        as: 'morceauxTexte',
                        limit: 10
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            model: Story,
            as: 'stories',
            limit: 3,
            include: [
              {
                model: Chapitre,
                as: 'chapitres',
                limit: 2,
                include: [
                  {
                    model: MorceauTexte,
                    as: 'morceauxTexte',
                    limit: 10
                  }
                ]
              }
            ]
          }
        ]
      });

      const queryEndTime = Date.now();
      const queryTime = queryEndTime - startTime;

      console.log(`✅ Requête échantillon terminée en ${queryTime}ms - ${users.length} utilisateurs récupérés`);

      // Nettoyer les données AVANT le déchiffrement pour éviter les références circulaires
      const cleanUsers = JSON.parse(JSON.stringify(users));

      // Déchiffrement explicite de l'échantillon
      const { decryptedUsers, decryptionStats } = await this.decryptAllData(cleanUsers);

      const totalEndTime = Date.now();
      const totalExecutionTime = totalEndTime - startTime;

      // Nettoyer les données déchiffrées pour éviter les références circulaires de Sequelize
      const cleanDecryptedUsers = JSON.parse(JSON.stringify(decryptedUsers));

      return {
        data: cleanDecryptedUsers,
        rawData: cleanUsers,
        sampleSize: limit,
        decryption: decryptionStats,
        performance: {
          totalTime: totalExecutionTime,
          queryTime: queryTime,
          decryptionTime: decryptionStats.decryptionTimeMs,
          recordsRetrieved: users.length,
          decryptionOperationsActual: decryptionStats.usersDecrypted + decryptionStats.sagasDecrypted + decryptionStats.storiesDecrypted + decryptionStats.chapitresDecrypted + decryptionStats.morceauxDecrypted,
          decryptionErrors: decryptionStats.errors,
          averageTimePerUser: users.length > 0 ? (totalExecutionTime / users.length).toFixed(2) : 0,
          averageDecryptionPerUser: users.length > 0 ? (decryptionStats.decryptionTimeMs / users.length).toFixed(2) : 0
        }
      };
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      throw new Error(`Erreur lors de la récupération de l'échantillon de test: ${(error as any).message} (Temps d'exécution: ${executionTime}ms)`);
    }
  }

  /**
   * Déchiffre toutes les données en utilisant le pattern des autres services
   */
  private static async decryptAllData(users: any[]): Promise<{
    decryptedUsers: any[];
    decryptionStats: {
      usersDecrypted: number;
      sagasDecrypted: number;
      storiesDecrypted: number;
      chapitresDecrypted: number;
      morceauxDecrypted: number;
      decryptionTimeMs: number;
      errors: number;
    };
  }> {
    const decryptStartTime = Date.now();
    let stats = {
      usersDecrypted: 0,
      sagasDecrypted: 0,
      storiesDecrypted: 0,
      chapitresDecrypted: 0,
      morceauxDecrypted: 0,
      decryptionTimeMs: 0,
      errors: 0
    };

    console.log('🔓 Début du déchiffrement explicite des données...');

    // Log de debug pour voir les données disponibles
    users.forEach((user, index) => {
      console.log(`👤 User ${index + 1} (${user.uuid}):`, {
        sagas: user.sagas?.length || 0,
        stories: user.stories?.length || 0
      });
      
      (user.sagas || []).forEach((saga: any, sagaIndex: number) => {
        console.log(`  📚 Saga ${sagaIndex + 1} (${saga.uuid}):`, {
          stories: saga.stories?.length || 0
        });
      });

      (user.stories || []).forEach((story: any, storyIndex: number) => {
        console.log(`  📖 Story directe ${storyIndex + 1} (${story.uuid}):`, {
          chapitres: story.chapitres?.length || 0
        });
      });
    });

    const decryptedUsers = users.map((user) => {
      try {
        // Formatter l'utilisateur (déchiffrement automatique)
        const formattedUser = this.formatUserOutput(user);
        stats.usersDecrypted++;

        // Formatter les sagas
        const formattedSagas = (user.sagas || []).map((saga: any) => {
          try {
            const formattedSaga = this.formatSagaOutput(saga);
            stats.sagasDecrypted++;

            // Formatter les stories de la saga
            const formattedStories = (saga.stories || []).map((story: any) => {
              try {
                const formattedStory = this.formatStoryOutput(story);
                stats.storiesDecrypted++;

                // Formatter les chapitres
                const formattedChapitres = (story.chapitres || []).map((chapitre: any) => {
                  try {
                    const formattedChapitre = this.formatChapitreOutput(chapitre);
                    stats.chapitresDecrypted++;

                    // Formatter les morceaux
                    const formattedMorceaux = (chapitre.morceauxTexte || []).map((morceau: any) => {
                      try {
                        const formattedMorceau = this.formatMorceauOutput(morceau);
                        stats.morceauxDecrypted++;
                        return formattedMorceau;
                      } catch (error) {
                        stats.errors++;
                        return { ...morceau, error: 'Échec déchiffrement morceau' };
                      }
                    });

                    return { ...formattedChapitre, morceauxTexte: formattedMorceaux };
                  } catch (error) {
                    stats.errors++;
                    return { ...chapitre, error: 'Échec déchiffrement chapitre' };
                  }
                });

                return { ...formattedStory, chapitres: formattedChapitres };
              } catch (error) {
                stats.errors++;
                return { ...story, error: 'Échec déchiffrement story' };
              }
            });

            return { ...formattedSaga, stories: formattedStories };
          } catch (error) {
            stats.errors++;
            return { ...saga, error: 'Échec déchiffrement saga' };
          }
        });

        // Formatter les stories directes
        const formattedDirectStories = (user.stories || []).map((story: any) => {
          try {
            const formattedStory = this.formatStoryOutput(story);
            stats.storiesDecrypted++;

            // Formatter les chapitres
            const formattedChapitres = (story.chapitres || []).map((chapitre: any) => {
              try {
                const formattedChapitre = this.formatChapitreOutput(chapitre);
                stats.chapitresDecrypted++;

                // Formatter les morceaux
                const formattedMorceaux = (chapitre.morceauxTexte || []).map((morceau: any) => {
                  try {
                    const formattedMorceau = this.formatMorceauOutput(morceau);
                    stats.morceauxDecrypted++;
                    return formattedMorceau;
                  } catch (error) {
                    stats.errors++;
                    return { ...morceau, error: 'Échec déchiffrement morceau' };
                  }
                });

                return { ...formattedChapitre, morceauxTexte: formattedMorceaux };
              } catch (error) {
                stats.errors++;
                return { ...chapitre, error: 'Échec déchiffrement chapitre' };
              }
            });

            return { ...formattedStory, chapitres: formattedChapitres };
          } catch (error) {
            stats.errors++;
            return { ...story, error: 'Échec déchiffrement story' };
          }
        });

        return { ...formattedUser, sagas: formattedSagas, stories: formattedDirectStories };
      } catch (error) {
        stats.errors++;
        return { ...user, error: 'Échec déchiffrement utilisateur' };
      }
    });

    const decryptEndTime = Date.now();
    stats.decryptionTimeMs = decryptEndTime - decryptStartTime;

    console.log('✅ Déchiffrement terminé:', {
      temps: `${stats.decryptionTimeMs}ms`,
      users: stats.usersDecrypted,
      sagas: stats.sagasDecrypted,
      stories: stats.storiesDecrypted,
      chapitres: stats.chapitresDecrypted,
      morceaux: stats.morceauxDecrypted,
      erreurs: stats.errors
    });

    return {
      decryptedUsers,
      decryptionStats: stats
    };
  }

  // Méthodes helper pour les champs chiffrés (basées sur les autres services)
  private static getUserFieldsToDecrypt(user: any): Record<string, string> {
    const fields: Record<string, string> = {};
    for (const [key, config] of Object.entries(this.USER_ENCRYPTED_FIELDS_CONFIG)) {
      const value = config.fromModel(user);
      if (value !== undefined) {
        fields[key] = value;
      }
    }
    return fields;
  }

  private static getSagaFieldsToDecrypt(saga: any): Record<string, string> {
    const fields: Record<string, string> = {};
    for (const [key, config] of Object.entries(this.SAGA_ENCRYPTED_FIELDS_CONFIG)) {
      const value = config.fromModel(saga);
      if (value !== undefined) {
        fields[key] = value;
      }
    }
    return fields;
  }

  private static getStoryFieldsToDecrypt(story: any): Record<string, string> {
    const fields: Record<string, string> = {};
    for (const [key, config] of Object.entries(this.STORY_ENCRYPTED_FIELDS_CONFIG)) {
      const value = config.fromModel(story);
      if (value !== undefined) {
        fields[key] = value;
      }
    }
    return fields;
  }

  private static getChapitreFieldsToDecrypt(chapitre: any): Record<string, string> {
    const fields: Record<string, string> = {};
    // Déchiffrer le titre
    if (chapitre.titre) {
      fields.titre = chapitre.titre;
    }
    // Déchiffrer le slug
    if (chapitre.slug) {
      fields.slug = chapitre.slug;
    }
    return fields;
  }

  private static getMorceauFieldsToDecrypt(morceau: any): Record<string, string> {
    const fields: Record<string, string> = {};
    for (const [key, config] of Object.entries(this.MORCEAU_ENCRYPTED_FIELDS_CONFIG)) {
      const value = config.fromModel(morceau);
      if (value !== undefined) {
        fields[key] = value;
      }
    }
    return fields;
  }

  /**
   * Méthodes de formatage pour déchiffrer les données
   * Basées sur le pattern des autres services
   */
  private static formatUserOutput(user: any): any {
    try {
      const fieldsToDecrypt = this.getUserFieldsToDecrypt(user);
      const decryptedData = EncryptionService.decryptRowData(
        fieldsToDecrypt,
        user.uuid,
        user.iv,
        user.tag
      );

      return {
        id: user.id,
        uuid: user.uuid,
        email: decryptedData.email,
        nom: decryptedData.nom,
        passwordHash: user.passwordHash,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      throw new Error(`Erreur déchiffrement utilisateur: ${(error as any).message}`);
    }
  }

  private static formatSagaOutput(saga: any): any {
    try {
      console.log(`🔍 Déchiffrement saga ${saga.uuid}:`, {
        titre: saga.titre ? 'présent' : 'manquant',
        description: saga.description ? 'présent' : 'manquant',
        auteur: saga.auteur ? 'présent' : 'manquant',
        iv: saga.iv ? 'présent' : 'manquant',
        tag: saga.tag ? 'présent' : 'manquant'
      });

      const fieldsToDecrypt = this.getSagaFieldsToDecrypt(saga);
      
      const decryptedData = EncryptionService.decryptRowData(
        fieldsToDecrypt,
        saga.uuid,
        saga.iv,
        saga.tag
      );

      console.log(`✅ Saga ${saga.uuid} déchiffrée:`, {
        titre: decryptedData.titre,
        description: decryptedData.description,
        auteur: decryptedData.auteur
      });

      return {
        id: saga.id,
        uuid: saga.uuid,
        titre: decryptedData.titre,
        slug: decryptedData.slug,
        description: decryptedData.description,
        auteur: decryptedData.auteur,
        userId: saga.userId,
        statut: saga.statut,
        createdAt: saga.createdAt,
        updatedAt: saga.updatedAt
      };
    } catch (error) {
      console.error(`❌ Erreur déchiffrement saga ${saga.uuid}:`, (error as any).message);
      throw new Error(`Erreur déchiffrement saga: ${(error as any).message}`);
    }
  }

  private static formatStoryOutput(story: any): any {
    try {
      console.log(`📖 Déchiffrement story ${story.uuid}:`, {
        titre: story.titre ? 'présent' : 'manquant',
        description: story.description ? 'présent' : 'manquant',
        auteur: story.auteur ? 'présent' : 'manquant'
      });

      const fieldsToDecrypt = this.getStoryFieldsToDecrypt(story);
      
      const decryptedData = EncryptionService.decryptRowData(
        fieldsToDecrypt,
        story.uuid,
        story.iv,
        story.tag
      );

      console.log(`✅ Story ${story.uuid} déchiffrée:`, {
        titre: decryptedData.titre,
        description: decryptedData.description,
        auteur: decryptedData.auteur
      });

      return {
        id: story.id,
        uuid: story.uuid,
        titre: decryptedData.titre,
        slug: decryptedData.slug,
        description: decryptedData.description,
        auteur: decryptedData.auteur,
        statut: story.statut,
        userId: story.userId,
        sagaId: story.sagaId,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt
      };
    } catch (error) {
      console.error(`❌ Erreur déchiffrement story ${story.uuid}:`, (error as any).message);
      throw new Error(`Erreur déchiffrement story: ${(error as any).message}`);
    }
  }

  private static formatChapitreOutput(chapitre: any): any {
    try {
      console.log(`📄 Déchiffrement chapitre ${chapitre.uuid}:`, {
        titre: chapitre.titre ? 'présent' : 'manquant',
        slug: chapitre.slug ? 'présent' : 'manquant'
      });

      const fieldsToDecrypt = this.getChapitreFieldsToDecrypt(chapitre);
      const decryptedData = EncryptionService.decryptRowData(
        fieldsToDecrypt,
        chapitre.uuid,
        chapitre.iv,
        chapitre.tag
      );

      console.log(`✅ Chapitre ${chapitre.uuid} déchiffré:`, {
        titre: decryptedData.titre,
        slug: decryptedData.slug
      });

      return {
        id: chapitre.id,
        uuid: chapitre.uuid,
        titre: decryptedData.titre,
        slug: decryptedData.slug,
        numero: chapitre.numero,
        storyId: chapitre.storyId,
        createdAt: chapitre.createdAt,
        updatedAt: chapitre.updatedAt
      };
    } catch (error) {
      console.error(`❌ Erreur déchiffrement chapitre ${chapitre.uuid}:`, (error as any).message);
      throw new Error(`Erreur déchiffrement chapitre: ${(error as any).message}`);
    }
  }

  private static formatMorceauOutput(morceau: any): any {
    try {
      console.log(`📝 Déchiffrement morceau ${morceau.uuid}:`, {
        contenu: morceau.contenu ? `présent (${morceau.contenu.length} chars)` : 'manquant'
      });

      const fieldsToDecrypt = this.getMorceauFieldsToDecrypt(morceau);
      const decryptedData = EncryptionService.decryptRowData(
        fieldsToDecrypt,
        morceau.uuid,
        morceau.iv,
        morceau.tag
      );

      console.log(`✅ Morceau ${morceau.uuid} déchiffré:`, {
        contenu: decryptedData.contenu ? `${decryptedData.contenu.substring(0, 50)}...` : 'vide'
      });

      return {
        id: morceau.id,
        uuid: morceau.uuid,
        chapitreId: morceau.chapitreId,
        type: morceau.type,
        contenu: decryptedData.contenu,
        ordre: morceau.ordre,
        createdAt: morceau.createdAt,
        updatedAt: morceau.updatedAt
      };
    } catch (error) {
      console.error(`❌ Erreur déchiffrement morceau ${morceau.uuid}:`, (error as any).message);
      throw new Error(`Erreur déchiffrement morceau: ${(error as any).message}`);
    }
  }
} 