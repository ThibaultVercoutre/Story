import mammoth from 'mammoth';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize, { Story } from '../models/index.js';
import { ChapitreService } from '../services/chapitre.service.js';
import { MorceauTexteService } from '../services/morceauTexte.service.js';
import { StoryService } from '../services/story.service.js';
import { TypeMorceauTexte } from '../models/morceauTexte.model.js';
import fs from 'fs';

console.log('🚀 Script import-book démarré');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📍 __filename:', __filename);
console.log('📍 __dirname:', __dirname);

interface ChapitreData {
  titre: string;
  numero: number;
  contenu: string[];
}

function detectContentType(contenu: string): TypeMorceauTexte {
  // Nettoyer le contenu de tous les espaces cachés
  const contenuTrim = contenu.trim().replace(/^\s+/, '');
  
  // Détecter les dialogues uniquement par les tirets cadratins
  // Pattern 1: Commence par un tiret cadratin (—) - le pattern principal
  if (contenuTrim.startsWith('—') || contenuTrim.match(/^—\s/)) {
    return TypeMorceauTexte.DIALOGUE;
  }
  
  // Par défaut, c'est un paragraphe
  return TypeMorceauTexte.PARAGRAPHE;
}

function parseChapitres(text: string): ChapitreData[] {
  const chapitres: ChapitreData[] = [];
  const lignes = text.split('\n');

  let chapitreActuel: ChapitreData | null = null;

  for (let i = 0; i < lignes.length; i++) {
    const ligne = lignes[i].trim();

    // Début d'un nouveau chapitre
    const matchChapitre = ligne.match(/^Chapitre\s+(\d+)/i);
    if (matchChapitre) {
      // Sauvegarder le chapitre précédent le cas échéant
      if (chapitreActuel) {
        chapitres.push(chapitreActuel);
      }

      const numero = parseInt(matchChapitre[1], 10);

      // Récupérer le titre sur la ligne suivante non vide
      let titre = '';
      let j = i + 1;
      while (j < lignes.length && !lignes[j].trim()) {
        j++;
      }
      if (j < lignes.length) {
        titre = lignes[j].trim();
        i = j; // sauter jusqu'à la ligne du titre
      }

      chapitreActuel = {
        numero,
        titre,
        contenu: []
      };
      continue;
    }

    // Ajouter le contenu aux chapitres existants
    if (chapitreActuel && ligne) {
      chapitreActuel.contenu.push(ligne);
    }
  }

  // Ajouter le dernier chapitre
  if (chapitreActuel) {
    chapitres.push(chapitreActuel);
  }

  console.log(`📚 ${chapitres.length} chapitres trouvés`);
  return chapitres;
}

export async function importBook() {
  try {
    console.log('📖 Début de l\'importation du livre...');
    
    // Chemin vers le fichier texte
    const textPath = path.join(__dirname, 'text.txt');

    console.log('🔍 Lecture du fichier texte...');
    const rawText = fs.readFileSync(textPath, 'utf8');

    console.log(`📝 Taille du texte brut: ${rawText.length} caractères`);

    // Parser les chapitres depuis le texte brut
    const chapitres = parseChapitres(rawText);
    console.log(`📚 ${chapitres.length} chapitres identifiés`);
    
    if (chapitres.length === 0) {
      console.log('❌ Aucun chapitre trouvé. Vérifiez le format du document.');
      return;
    }
    
    // Synchroniser la base de données
    await sequelize.sync({ force: false });
    
    // supprimer toutes les stories (en cascade)
    await Story.destroy({ where: {} });
    
    console.log('📦 Base de données synchronisée');
    
    // Créer la story
    console.log('📚 Création de la story "La Bête de Beauxbâtons"');
    const story = await StoryService.createStory({
      titre: 'La Bête de Beauxbâtons',
      description: 'Premier tome de la série',
      auteur: 'Auteur Importé',
      userId: 1,
      statut: 'terminee'
    });
    
    console.log(`✅ Story créée avec l'ID: ${story.id}`);
    
    // Créer les chapitres et leurs morceaux de texte
    for (const chapitreData of chapitres) {
      console.log(`📖 Création du chapitre ${chapitreData.numero}: "${chapitreData.titre}"`);
      
      // Afficher le contenu brut du chapitre
      console.log(`\n📝 CONTENU BRUT DU CHAPITRE ${chapitreData.numero}:`);
      console.log('=' .repeat(50));
      for (let i = 0; i < chapitreData.contenu.length; i++) {
        const type = detectContentType(chapitreData.contenu[i]);
        const typeIcon = type === TypeMorceauTexte.DIALOGUE ? '💬' : '📄';
        const premierCaractere = chapitreData.contenu[i].charCodeAt(0);
        const premierCaractereStr = chapitreData.contenu[i].charAt(0);
        console.log(`${i + 1}: ${typeIcon} [${type.toUpperCase()}] 1er char: '${premierCaractereStr}' (${premierCaractere}) "${chapitreData.contenu[i]}"`);
      }
      console.log('=' .repeat(50));
      console.log(`Fin du chapitre ${chapitreData.numero}\n`);

      // Créer le chapitre
      const chapitre = await ChapitreService.createChapitre({
        titre: chapitreData.titre,
        numero: chapitreData.numero,
        storyId: story.id,
      });
      
      // Créer les morceaux de texte
      for (let i = 0; i < chapitreData.contenu.length; i++) {
        let contenu = chapitreData.contenu[i];
        const type = detectContentType(contenu);

        if (type === TypeMorceauTexte.DIALOGUE) {
          contenu = contenu.slice(2);
        }
        
        await MorceauTexteService.createMorceauTexte({
          contenu: contenu,
          type,
          ordre: i + 1,
          chapitreId: chapitre.id,
        });
      }
      
      console.log(`✅ Chapitre ${chapitreData.numero} créé avec ${chapitreData.contenu.length} morceaux de texte`);
    }
    
    console.log('🎉 Import terminé avec succès !');
    console.log(`📊 Résultat: ${chapitres.length} chapitres importés`);
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'import:', error);
    throw error;
  }
}

// Exécuter le script si appelé directement
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.endsWith('import-book.ts');

if (isMainModule) {
  importBook()
    .then(() => {
      console.log('✨ Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
} 