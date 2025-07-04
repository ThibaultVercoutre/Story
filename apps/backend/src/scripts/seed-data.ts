import sequelize from '../models/index.js';
import { ChapitreService } from '../services/chapitre.service.js';
import { MorceauTexteService } from '../services/morceauTexte.service.js';
import { TypeMorceauTexte } from '../models/morceauTexte.model.js';

// Histoire de test : "L'Aventure de Luna"
const histoireData = [
  {
    titre: "La Découverte Mystérieuse",
    numero: 1,
    morceaux: [
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Luna était une jeune exploratrice passionnée par les mystères anciens. Ce matin-là, elle se dirigeait vers la forêt interdite avec son sac à dos rempli d'outils d'exploration.",
        ordre: 1
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "- Maman, je pars explorer la forêt ! cria-t-elle depuis la porte.\n- Sois prudente, Luna ! répondit sa mère depuis la cuisine.",
        ordre: 2
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "En s'enfonçant dans les bois, Luna remarqua une lueur étrange qui provenait d'une clairière cachée. Son cœur s'emballa d'excitation.",
        ordre: 3
      },
      {
        type: TypeMorceauTexte.CITATION,
        contenu: "« L'aventure commence toujours par un premier pas vers l'inconnu. » - Proverbe des explorateurs",
        ordre: 4
      }
    ]
  },
  {
    titre: "Le Cristal Lumineux",
    numero: 2,
    morceaux: [
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Au centre de la clairière se dressait un cristal géant, pulsant d'une lumière bleu-vert hypnotique. Luna n'avait jamais rien vu de tel.",
        ordre: 1
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "- Incroyable... murmura-t-elle en s'approchant prudemment.\n- Qu'est-ce que tu peux bien être ?",
        ordre: 2
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Soudain, le cristal réagit à sa présence. Des symboles anciens apparurent sur sa surface, comme s'ils répondaient à ses questions silencieuses.",
        ordre: 3
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Luna sortit son carnet et commença à dessiner frénétiquement les symboles avant qu'ils ne disparaissent. Elle sentait qu'elle venait de découvrir quelque chose d'extraordinaire.",
        ordre: 4
      }
    ]
  },
  {
    titre: "Les Gardiens de la Forêt",
    numero: 3,
    morceaux: [
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Alors que Luna étudiait les symboles, des bruissements inquiétants résonnèrent autour d'elle. Des créatures étranges émergèrent des arbres.",
        ordre: 1
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "- Qui ose troubler le repos du Cristal Éternel ? gronda une voix grave.\n- Je... je suis Luna, une exploratrice. Je ne voulais pas déranger ! balbutia-t-elle.",
        ordre: 2
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Les créatures, qui ressemblaient à des arbres vivants avec des yeux brillants, l'encerclèrent. Leur chef, un être majestueux aux branches ornées de fleurs lumineuses, s'avança.",
        ordre: 3
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "- Je suis Sylvain, gardien de cette forêt. Depuis des siècles, nous protégeons ce cristal. Pourquoi le cristal a-t-il réagi à ta présence, jeune humaine ?",
        ordre: 4
      },
      {
        type: TypeMorceauTexte.CITATION,
        contenu: "« Seuls les cœurs purs peuvent éveiller la magie ancienne. » - Sagesse des Gardiens",
        ordre: 5
      }
    ]
  },
  {
    titre: "La Prophétie Révélée",
    numero: 4,
    morceaux: [
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Sylvain examina Luna avec attention, ses yeux anciens semblant lire dans son âme. Après un long moment, il hocha lentement sa tête feuillue.",
        ordre: 1
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "- Tu es celle que nous attendions, déclara-t-il solennellement. La prophétie parlait d'une jeune exploratrice au cœur pur qui réveillerait le cristal.",
        ordre: 2
      },
      {
        type: TypeMorceauTexte.CITATION,
        contenu: "« Quand la lumière du cristal dansera pour une âme innocente, le chemin vers les mondes cachés s'ouvrira. » - Prophétie Ancienne",
        ordre: 3
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Luna écarquilla les yeux, réalisant l'ampleur de sa découverte. Le cristal n'était pas seulement un objet magique, mais une porte vers d'autres dimensions.",
        ordre: 4
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "- Que dois-je faire ? demanda Luna, mélange d'excitation et d'appréhension dans la voix.\n- Tu dois choisir, répondit Sylvain. Rester dans ton monde... ou découvrir ce qui t'attend au-delà.",
        ordre: 5
      }
    ]
  },
  {
    titre: "Le Grand Voyage",
    numero: 5,
    morceaux: [
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Luna regarda le cristal pulsant, puis ses nouveaux amis gardiens. Son cœur d'exploratrice avait déjà pris sa décision.",
        ordre: 1
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "- Je veux découvrir ces mondes cachés, déclara-t-elle avec détermination. C'est pour cela que je suis née exploratrice !",
        ordre: 2
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Sylvain sourit, ses fleurs lumineuses brillant plus fort. Il toucha le cristal de sa main-branche, et celui-ci s'ouvrit comme une porte scintillante.",
        ordre: 3
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Luna prit une profonde inspiration, serra son sac à dos et fit un pas vers l'inconnu. Derrière elle, les gardiens chantaient une mélodie ancienne de bénédiction.",
        ordre: 4
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "- Merci, Sylvain. Merci à tous ! Je reviendrai vous raconter mes aventures !\n- Nous t'attendrons, brave Luna. Que la magie te guide !",
        ordre: 5
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Et ainsi commença la plus grande aventure de Luna, celle qui la mènerait à travers des mondes extraordinaires, portée par son courage et sa soif de découverte.",
        ordre: 6
      },
      {
        type: TypeMorceauTexte.CITATION,
        contenu: "« Chaque fin n'est que le début d'une nouvelle aventure. » - Luna, exploratrice des mondes",
        ordre: 7
      }
    ]
  }
];

export async function seedData() {
  try {
    console.log('🌱 Début de la génération des données de test...');
    
    // Synchroniser la base de données
    await sequelize.sync({ force: true });
    console.log('📦 Base de données synchronisée');
    
    // Créer les chapitres et leurs morceaux de texte
    for (const chapitreData of histoireData) {
      console.log(`📖 Création du chapitre ${chapitreData.numero}: "${chapitreData.titre}"`);
      
      // Créer le chapitre
      const chapitre = await ChapitreService.createChapitre({
        titre: chapitreData.titre,
        numero: chapitreData.numero
      });
      
      // Créer les morceaux de texte
      for (const morceauData of chapitreData.morceaux) {
        await MorceauTexteService.createMorceauTexte({
          chapitreId: chapitre.id,
          type: morceauData.type,
          contenu: morceauData.contenu,
          ordre: morceauData.ordre
        });
      }
      
      console.log(`✅ Chapitre ${chapitreData.numero} créé avec ${chapitreData.morceaux.length} morceaux de texte`);
    }
    
    console.log('🎉 Génération des données terminée avec succès !');
    console.log('📚 Histoire "L\'Aventure de Luna" créée avec 5 chapitres');
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération des données:', error);
    throw error;
  }
}

// Exécuter le script si appelé directement
seedData()
  .then(() => {
    console.log('✨ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  }); 