import sequelize from '../models/index.js';
import { ChapitreService } from '../services/chapitre.service.js';
import { MorceauTexteService } from '../services/morceauTexte.service.js';
import { StoryService } from '../services/story.service.js';
import { TypeMorceauTexte } from '../models/morceauTexte.model.js';

// Histoire de test : "L'Aventure de Luna"
const histoireData = [
  {
    titre: "La Découverte Mystérieuse",
    numero: 1,
    morceaux: [
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Luna était une jeune exploratrice passionnée par les mystères anciens et les légendes oubliées. Depuis son enfance, elle collectionnait les cartes de territoires inexplorés, les récits d'aventuriers et les artefacts étranges que lui rapportaient les marchands de passage. Sa chambre ressemblait davantage à un musée qu'à celle d'une adolescente ordinaire.",
        ordre: 1
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Ce matin-là, elle se dirigeait vers la forêt interdite avec son sac à dos rempli d'outils d'exploration : une boussole héritée de son grand-père, un carnet de cuir pour ses croquis, une loupe, des cordes et quelques provisions. L'air était frais et chargé de rosée, et les premiers rayons du soleil perçaient à travers les branches.",
        ordre: 2
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "Maman, je pars explorer la forêt !",
        ordre: 3
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "Sois prudente, Luna ! Et ne rentre pas trop tard !",
        ordre: 4
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "En s'enfonçant dans les bois, Luna remarqua une lueur étrange qui provenait d'une clairière cachée derrière un rideau de lianes épaisses. Cette lumière n'était pas naturelle, elle pulsait avec un rythme régulier, comme un cœur qui battrait. Son cœur d'exploratrice s'emballa d'excitation.",
        ordre: 5
      },
      {
        type: TypeMorceauTexte.CITATION,
        contenu: "L'aventure commence toujours par un premier pas vers l'inconnu. - Proverbe des explorateurs",
        ordre: 6
      }
    ]
  },
  {
    titre: "Le Cristal Lumineux",
    numero: 2,
    morceaux: [
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Au centre de la clairière se dressait un cristal géant, d'au moins trois mètres de hauteur, pulsant d'une lumière bleu-vert hypnotique. Sa surface était parfaitement lisse, comme taillée par les mains d'un artisan divin, et des veines de lumière couraient le long de ses facettes. Luna n'avait jamais rien vu de tel, même dans les livres les plus anciens de la bibliothèque de son village.",
        ordre: 1
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "L'air autour du cristal semblait vibrer d'une énergie mystique. Des particules de lumière dansaient dans l'atmosphère, créant des motifs éphémères qui disparaissaient dès qu'on tentait de les fixer du regard. Le sol autour du cristal était recouvert d'une mousse argentée qui brillait faiblement, comme si elle absorbait et reflétait la magie du cristal.",
        ordre: 2
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "Incroyable... murmura-t-elle en s'approchant prudemment.",
        ordre: 3
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "Qu'est-ce que tu peux bien être ?",
        ordre: 4
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Soudain, le cristal réagit à sa présence. Des symboles anciens apparurent sur sa surface, gravés dans une lumière dorée qui contrastait avec le bleu-vert ambiant. Ces symboles semblaient bouger, se réorganiser, comme s'ils répondaient à ses questions silencieuses et tentaient de communiquer avec elle.",
        ordre: 5
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Luna sortit son carnet et commença à dessiner frénétiquement les symboles avant qu'ils ne disparaissent. Ses mains tremblaient légèrement d'excitation tandis qu'elle tentait de reproduire fidèlement chaque courbe, chaque trait de ces mystérieux caractères. Elle sentait qu'elle venait de découvrir quelque chose d'extraordinaire, quelque chose qui allait changer sa vie à jamais.",
        ordre: 6
      }
    ]
  },
  {
    titre: "Les Gardiens de la Forêt",
    numero: 3,
    morceaux: [
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Alors que Luna étudiait attentivement les symboles dans son carnet, des bruissements inquiétants résonnèrent autour d'elle. Ce n'était pas le bruit habituel des petits animaux de la forêt, mais quelque chose de plus grand, de plus imposant. Les branches au-dessus d'elle se mirent à bouger sans qu'aucun vent ne souffle.",
        ordre: 1
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Des créatures étranges et majestueuses émergèrent lentement des arbres, comme si elles faisaient partie intégrante de la forêt elle-même. Leurs corps semblaient être un mélange d'écorce, de mousse et de lumière vivante. Leurs yeux brillaient d'une sagesse millénaire, et leurs mouvements étaient d'une grâce hypnotique qui témoignait de leur nature magique.",
        ordre: 2
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "Qui ose troubler le repos du Cristal Éternel ?",
        ordre: 3
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "Je... je suis Luna, une exploratrice. Je ne voulais pas déranger ! Je suis juste curieuse de nature !",
        ordre: 4
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Les créatures, qui ressemblaient à des arbres vivants avec des yeux brillants comme des étoiles, l'encerclèrent sans hostilité apparente, mais avec une solennité impressionnante. Leur chef, un être particulièrement majestueux aux branches ornées de fleurs lumineuses qui changeaient de couleur selon ses émotions, s'avança vers elle d'un pas mesuré.",
        ordre: 5
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "Je suis Sylvain, gardien ancestral de cette forêt sacrée. Depuis des siècles, nous protégeons ce cristal et ses secrets.",
        ordre: 6
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "Pourquoi le cristal a-t-il réagi à ta présence, jeune humaine ? Cela n'était pas arrivé depuis très longtemps.",
        ordre: 7
      },
      {
        type: TypeMorceauTexte.CITATION,
        contenu: "Seuls les cœurs purs peuvent éveiller la magie ancienne. - Sagesse des Gardiens",
        ordre: 8
      }
    ]
  },
  {
    titre: "La Prophétie Révélée",
    numero: 4,
    morceaux: [
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Sylvain examina Luna avec une attention particulière, ses yeux anciens semblant lire dans les profondeurs de son âme comme dans un livre ouvert. Il pouvait percevoir sa sincérité, sa soif de connaissance, et cette flamme particulière qui brûlait en elle depuis l'enfance. Ses fleurs lumineuses passèrent du bleu au violet, signe de sa concentration profonde.",
        ordre: 1
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Après un long moment de silence contemplatif, durant lequel on n'entendait que le murmure du vent dans les feuilles et le pulsement régulier du cristal, Sylvain hocha lentement sa tête feuillue. Les autres gardiens se rapprochèrent, formant un cercle autour de Luna et de leur chef, leurs expressions mélange de surprise et de révérence.",
        ordre: 2
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "Tu es celle que nous attendions depuis si longtemps.",
        ordre: 3
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "La prophétie parlait d'une jeune exploratrice au cœur pur qui réveillerait le cristal et ouvrirait les portes fermées.",
        ordre: 4
      },
      {
        type: TypeMorceauTexte.CITATION,
        contenu: "Quand la lumière du cristal dansera pour une âme innocente, le chemin vers les mondes cachés s'ouvrira. - Prophétie Ancienne",
        ordre: 5
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Luna écarquilla les yeux, sentant le poids des paroles de Sylvain résonner dans tout son être. Elle réalisa soudain l'ampleur de sa découverte : le cristal n'était pas seulement un objet magique remarquable, mais une porte dimensionnelle, un passage vers d'autres mondes, d'autres réalités qu'elle n'avait jamais imaginées, même dans ses rêves les plus fous.",
        ordre: 6
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "Que dois-je faire ? Je ne comprends pas tout, mais je sens que c'est important.",
        ordre: 7
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "Tu dois choisir, brave Luna. Rester dans ton monde familier et oublier cette découverte...",
        ordre: 8
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "Ou accepter ton destin et découvrir ce qui t'attend au-delà de ce cristal.",
        ordre: 9
      }
    ]
  },
  {
    titre: "Le Grand Voyage",
    numero: 5,
    morceaux: [
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Luna regarda alternativement le cristal pulsant de sa lumière mystérieuse et ses nouveaux amis gardiens qui l'observaient avec bienveillance. Dans son cœur, elle sentait que toute sa vie l'avait menée vers ce moment précis. Chaque livre qu'elle avait lu, chaque carte qu'elle avait étudiée, chaque rêve d'aventure qu'elle avait caressé n'était qu'une préparation à cet instant décisif.",
        ordre: 1
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Son cœur d'exploratrice avait déjà pris sa décision avant même que son esprit rationnel ne puisse peser le pour et le contre. Elle était née pour découvrir, pour explorer, pour repousser les limites de l'inconnu. Comment pourrait-elle tourner le dos à la plus grande aventure de sa vie ?",
        ordre: 2
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "Je veux découvrir ces mondes cachés !",
        ordre: 3
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "C'est pour cela que je suis née exploratrice ! Je ne peux pas laisser passer cette chance !",
        ordre: 4
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Sylvain sourit, ses fleurs lumineuses brillant plus fort que jamais, passant du violet à un or éclatant qui témoignait de sa joie et de sa fierté. Il toucha délicatement le cristal de sa main-branche, et celui-ci réagit instantanément, s'ouvrant comme une porte scintillante vers l'infini. Un portail de lumière pure se matérialisa, révélant des glimpses d'autres mondes extraordinaires.",
        ordre: 5
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Luna prit une profonde inspiration, sentant l'air chargé de magie emplir ses poumons. Elle ajusta les sangles de son sac à dos, vérifia une dernière fois que son carnet était bien fermé, et fit un pas déterminé vers l'inconnu. Derrière elle, les gardiens entonnèrent une mélodie ancienne de bénédiction, leurs voix harmonieuses créant une symphonie magique qui accompagnerait son voyage.",
        ordre: 6
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "Merci, Sylvain. Merci à vous tous !",
        ordre: 7
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "Je reviendrai vous raconter mes aventures, je vous le promets !",
        ordre: 8
      },
      {
        type: TypeMorceauTexte.DIALOGUE,
        contenu: "Nous t'attendrons, brave Luna. Que la magie te guide et te protège !",
        ordre: 9
      },
      {
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: "Et ainsi commença la plus grande aventure de Luna, celle qui la mènerait à travers des mondes extraordinaires peuplés de créatures fantastiques et de mystères insondables. Portée par son courage inébranlable et sa soif insatiable de découverte, elle franchit le seuil du portail, laissant derrière elle son monde familier pour embrasser son destin d'exploratrice interdimensionnelle.",
        ordre: 10
      },
      {
        type: TypeMorceauTexte.CITATION,
        contenu: "Chaque fin n'est que le début d'une nouvelle aventure. - Luna, exploratrice des mondes",
        ordre: 11
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
    
    // Créer la story principale
    console.log('📚 Création de la story "L\'Aventure de Luna"');
    const story = await StoryService.createStory({
      titre: "L'Aventure de Luna",
      description: "Une jeune exploratrice découvre un cristal magique qui ouvre la porte vers des mondes extraordinaires. Accompagnée des gardiens de la forêt, Luna se lance dans une aventure qui changera sa vie à jamais.",
      auteur: "Narrateur Mystique",
      statut: "terminee"
    });
    console.log(`✅ Story créée avec l'ID: ${story.id}`);
    
    // Créer les chapitres et leurs morceaux de texte
    for (const chapitreData of histoireData) {
      console.log(`📖 Création du chapitre ${chapitreData.numero}: "${chapitreData.titre}"`);
      
      // Créer le chapitre
      const chapitre = await ChapitreService.createChapitre({
        titre: chapitreData.titre,
        numero: chapitreData.numero,
        storyId: story.id,
        storyUuid: story.uuid
      });
      
      // Créer les morceaux de texte
      for (const morceauData of chapitreData.morceaux) {
        await MorceauTexteService.createMorceauTexte({
          chapitreId: chapitre.id,
          chapitreUuid: chapitre.uuid,
          type: morceauData.type,
          contenu: morceauData.contenu,
          ordre: morceauData.ordre
        });
      }
      
      console.log(`✅ Chapitre ${chapitreData.numero} créé avec ${chapitreData.morceaux.length} morceaux de texte`);
      console.log(`🔗 Slug généré: "${chapitre.slug}"`);
    }
    
    console.log('🎉 Génération des données terminée avec succès !');
    console.log(`📚 Story "${story.titre}" créée avec 5 chapitres`);
    console.log(`🔗 Slug story: "${story.slug}"`);
    console.log(`👤 Auteur: ${story.auteur}`);
    console.log(`📖 Statut: ${story.statut}`);
    
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