#!/usr/bin/env node

import * as dotenv from 'dotenv';
import sequelize from '../config/database.js';
import { User, Saga, Story, Chapitre, MorceauTexte } from '../models/index.js';
import { UserService } from '../services/user.service.js';

// Charger les variables d'environnement
dotenv.config();

/**
 * Script pour créer/recréer la base de données avec tous les modèles
 * Ce script va :
 * 1. Se connecter à la base de données
 * 2. Supprimer toutes les tables existantes
 * 3. Recréer toutes les tables avec les modèles Sequelize
 * 4. Configurer les associations
 */

async function createDatabase() {
  try {
    console.log('🔄 Connexion à la base de données...');
    
    // Tester la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie.');
    
    console.log('🗑️  Suppression de toutes les tables existantes...');
    
    // Supprimer toutes les tables (force: true pour DROP TABLE)
    await sequelize.drop({ cascade: true });
    console.log('✅ Toutes les tables ont été supprimées.');
    
    console.log('🏗️  Création des tables...');
    
    // Créer toutes les tables avec les associations
    // L'ordre est important à cause des clés étrangères
    await User.sync({ force: true });
    console.log('✅ Table "users" créée.');
    
    await Saga.sync({ force: true });
    console.log('✅ Table "sagas" créée.');
    
    await Story.sync({ force: true });
    console.log('✅ Table "stories" créée.');
    
    await Chapitre.sync({ force: true });
    console.log('✅ Table "chapitres" créée.');
    
    await MorceauTexte.sync({ force: true });
    console.log('✅ Table "morceaux_texte" créée.');
    
    // Vérifier que les associations sont bien configurées
    console.log('🔗 Vérification des associations...');
    
    // Les associations sont déjà définies dans models/index.ts
    // Elles sont automatiquement appliquées lors de l'import
    
    console.log('✅ Base de données créée avec succès !');
    console.log('📊 Résumé des tables créées :');
    console.log('  - users (utilisateurs)');
    console.log('  - sagas (sagas)');
    console.log('  - stories (histoires)');
    console.log('  - chapitres (chapitres)');
    console.log('  - morceaux_texte (morceaux de texte)');

    // créer un utilisateur avec le service user.service.ts
    await UserService.createUser({
      email: 'sirhyus.jeux@gmail.com',
      nom: 'Thibault',
      password: 'Tv21082002'
    });

    console.log('✅ Utilisateur créé avec succès !');
    console.log('📊 Résumé des tables créées :');
    console.log('  - users (utilisateurs)');
    console.log('  - sagas (sagas)');
    console.log('  - stories (histoires)');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la base de données :', error);
    process.exit(1);
  } finally {
    // Fermer la connexion
    await sequelize.close();
    console.log('🔌 Connexion fermée.');
  }
}

// Fonction pour afficher les informations de connexion (sans le mot de passe)
function displayConnectionInfo() {
  console.log('📋 Informations de connexion :');
  console.log(`  - Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  - Port: ${process.env.DB_PORT || '5432'}`);
  console.log(`  - Database: ${process.env.DB_NAME || 'story_db'}`);
  console.log(`  - User: ${process.env.DB_USER || 'admin_super'}`);
  console.log('');
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage du script de création de base de données...');
  console.log('');
  
  displayConnectionInfo();
  
  // Demander confirmation en mode interactif
  const args = process.argv.slice(2);
  const forceMode = args.includes('--force') || args.includes('-f');
  
  if (!forceMode) {
    console.log('⚠️  ATTENTION : Ce script va supprimer toutes les données existantes !');
    console.log('   Utilisez --force ou -f pour bypasser cette confirmation.');
    console.log('   Exemple: npm run create-db -- --force');
    console.log('');
    
    // En mode non-interactif, on arrête ici
    if (process.env.NODE_ENV === 'production') {
      console.log('❌ Mode production détecté. Utilisez --force pour confirmer.');
      process.exit(1);
    }
    
    // Simulation d'une confirmation (en réalité, on force en mode dev)
    console.log('🔄 Mode développement détecté, continuation automatique...');
  }
  
  await createDatabase();
}

// Exécuter le script
main().catch((error) => {
  console.error('❌ Erreur fatale :', error);
  process.exit(1);
});

export default createDatabase;
