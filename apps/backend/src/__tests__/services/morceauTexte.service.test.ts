import { describe, it, expect, beforeEach, jest, beforeAll } from '@jest/globals';
import { MorceauTexteService, MorceauTexteInput, MorceauTexteOutput } from '../../services/morceauTexte.service.js';
import { MorceauTexte } from '../../models/index.js';
import { TypeMorceauTexte } from '../../models/morceauTexte.model.js';
import { EncryptionService } from '../../services/encryption.service.js';

// Mock des dépendances
jest.mock('../../models/index.js');
jest.mock('../../services/encryption.service.js');

const mockMorceauTexte = MorceauTexte as any;
const mockEncryptionService = EncryptionService as any;

describe('MorceauTexteService', () => {
  const mockMorceauTexteData = {
    id: 1,
    uuid: 'test-uuid-123',
    chapitreId: 1,
    type: TypeMorceauTexte.PARAGRAPHE,
    contenu: 'contenu_chiffré',
    ordre: 1,
    iv: 'test-iv',
    tag: 'test-tag',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDecryptedData = {
    contenu: 'C\'était une nuit sombre et orageuse...'
  };

  const mockEncryptedData = {
    encryptedData: {
      contenu: 'contenu_chiffré'
    },
    iv: 'test-iv',
    tag: 'test-tag'
  };

  beforeAll(() => {
    mockEncryptionService.decryptRowData = (jest.fn() as any).mockReturnValue(mockDecryptedData);
    mockEncryptionService.encryptRowData = (jest.fn() as any).mockReturnValue(mockEncryptedData);
    
    // Mock des transactions Sequelize
    const mockTransaction = {
      commit: (jest.fn() as any).mockResolvedValue(undefined),
      rollback: (jest.fn() as any).mockResolvedValue(undefined),
    };
    
    mockMorceauTexte.sequelize = {
      transaction: (jest.fn() as any).mockResolvedValue(mockTransaction)
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMorceauxTexteByChapitreId', () => {
    it('doit récupérer tous les morceaux de texte d\'un chapitre', async () => {
      mockMorceauTexte.findAll = (jest.fn() as any).mockResolvedValue([mockMorceauTexteData]);

      const result = await MorceauTexteService.getMorceauxTexteByChapitreId(1);

      expect(mockMorceauTexte.findAll).toHaveBeenCalledWith({
        where: { chapitreId: 1 },
        order: [['ordre', 'ASC']],
      });
      expect(mockEncryptionService.decryptRowData).toHaveBeenCalledWith(
        { contenu: 'contenu_chiffré' },
        'test-uuid-123',
        'test-iv',
        'test-tag'
      );
      expect(result).toEqual([
        expect.objectContaining({
          id: 1,
          chapitreId: 1,
          type: TypeMorceauTexte.PARAGRAPHE,
          contenu: 'C\'était une nuit sombre et orageuse...',
          ordre: 1,
        })
      ]);
    });

    it('doit retourner un tableau vide si aucun morceau', async () => {
      mockMorceauTexte.findAll = (jest.fn() as any).mockResolvedValue([]);

      const result = await MorceauTexteService.getMorceauxTexteByChapitreId(999);

      expect(result).toEqual([]);
    });
  });

  describe('getMorceauTexteById', () => {
    it('doit récupérer un morceau de texte par ID', async () => {
      mockMorceauTexte.findByPk = (jest.fn() as any).mockResolvedValue(mockMorceauTexteData);

      const result = await MorceauTexteService.getMorceauTexteById(1);

      expect(mockMorceauTexte.findByPk).toHaveBeenCalledWith(1);
      expect(mockEncryptionService.decryptRowData).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          contenu: 'C\'était une nuit sombre et orageuse...',
        })
      );
    });

    it('doit retourner null si morceau non trouvé', async () => {
      mockMorceauTexte.findByPk = (jest.fn() as any).mockResolvedValue(null);

      const result = await MorceauTexteService.getMorceauTexteById(999);

      expect(result).toBeNull();
      expect(mockEncryptionService.decryptRowData).not.toHaveBeenCalled();
    });
  });

  describe('getMorceauTexteByUuid', () => {
    it('doit récupérer un morceau de texte par UUID', async () => {
      mockMorceauTexte.findOne = (jest.fn() as any).mockResolvedValue(mockMorceauTexteData);

      const result = await MorceauTexteService.getMorceauTexteByUuid('test-uuid-123');

      expect(mockMorceauTexte.findOne).toHaveBeenCalledWith({ where: { uuid: 'test-uuid-123' } });
      expect(result).toEqual(
        expect.objectContaining({
          uuid: 'test-uuid-123',
          contenu: 'C\'était une nuit sombre et orageuse...',
        })
      );
    });

    it('doit retourner null si UUID non trouvé', async () => {
      mockMorceauTexte.findOne = (jest.fn() as any).mockResolvedValue(null);

      const result = await MorceauTexteService.getMorceauTexteByUuid('inexistant');

      expect(result).toBeNull();
    });
  });

  describe('createMorceauTexte', () => {
    it('doit créer un nouveau morceau de texte avec données chiffrées', async () => {
      const inputData: MorceauTexteInput = {
        chapitreId: 1,
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: 'C\'était une nuit sombre et orageuse...',
        ordre: 1,
      };

      const mockCreatedMorceau = {
        ...mockMorceauTexteData,
        update: (jest.fn() as any).mockResolvedValue(mockMorceauTexteData),
      };

      mockMorceauTexte.create = (jest.fn() as any).mockResolvedValue(mockCreatedMorceau);

      const result = await MorceauTexteService.createMorceauTexte(inputData);

      expect(mockEncryptionService.encryptRowData).toHaveBeenCalledWith(
        { contenu: 'C\'était une nuit sombre et orageuse...' },
        expect.any(String)
      );
      expect(mockMorceauTexte.create).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          chapitreId: 1,
          type: TypeMorceauTexte.PARAGRAPHE,
          contenu: 'C\'était une nuit sombre et orageuse...',
          ordre: 1,
        })
      );
    });

    it('doit gérer les erreurs de création', async () => {
      const inputData: MorceauTexteInput = {
        chapitreId: 1,
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: 'Test',
        ordre: 1,
      };

      mockMorceauTexte.create = (jest.fn() as any).mockRejectedValue(new Error('Erreur DB'));

      await expect(MorceauTexteService.createMorceauTexte(inputData)).rejects.toThrow('Erreur DB');
    });
  });

  describe('updateMorceauTexte', () => {
    it('doit mettre à jour un morceau de texte existant', async () => {
      const updateData = { contenu: 'Contenu modifié' };
      
      const mockUpdatedMorceau = {
        ...mockMorceauTexteData,
        update: (jest.fn() as any).mockResolvedValue(mockMorceauTexteData),
      };

      mockMorceauTexte.findByPk = (jest.fn() as any).mockResolvedValue(mockUpdatedMorceau);

      const result = await MorceauTexteService.updateMorceauTexte(1, updateData);

      expect(mockMorceauTexte.findByPk).toHaveBeenCalledWith(1);
      expect(mockEncryptionService.encryptRowData).toHaveBeenCalledWith(
        { contenu: 'Contenu modifié' },
        'test-uuid-123'
      );
      expect(mockUpdatedMorceau.update).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          contenu: 'Contenu modifié',
        })
      );
    });

    it('doit retourner null si morceau à modifier non trouvé', async () => {
      mockMorceauTexte.findByPk = (jest.fn() as any).mockResolvedValue(null);

      const result = await MorceauTexteService.updateMorceauTexte(999, { contenu: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('deleteMorceauTexte', () => {
    it('doit supprimer un morceau de texte existant', async () => {
      const mockMorceauToDelete = {
        ...mockMorceauTexteData,
        destroy: (jest.fn() as any).mockResolvedValue(true),
      };

      mockMorceauTexte.findByPk = (jest.fn() as any).mockResolvedValue(mockMorceauToDelete);

      const result = await MorceauTexteService.deleteMorceauTexte(1);

      expect(mockMorceauTexte.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(mockMorceauToDelete.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('doit retourner false si morceau à supprimer non trouvé', async () => {
      mockMorceauTexte.findByPk = (jest.fn() as any).mockResolvedValue(null);

      const result = await MorceauTexteService.deleteMorceauTexte(999);

      expect(result).toBe(false);
    });
  });

  describe('Tests des différents types de morceaux', () => {
    it('doit gérer les morceaux de type CITATION', async () => {
      const citationData = {
        ...mockMorceauTexteData,
        type: TypeMorceauTexte.CITATION,
        contenu: 'Citation importante',
      };

      mockMorceauTexte.findByPk = (jest.fn() as any).mockResolvedValue(citationData);
      mockEncryptionService.decryptRowData = (jest.fn() as any).mockReturnValue({
        contenu: 'Citation importante'
      });

      const result = await MorceauTexteService.getMorceauTexteById(1);

      expect(result).toEqual(
        expect.objectContaining({
          type: TypeMorceauTexte.CITATION,
          contenu: 'Citation importante',
        })
      );
    });

    it('doit gérer les morceaux de type DIALOGUE', async () => {
      const dialogueData = {
        ...mockMorceauTexteData,
        type: TypeMorceauTexte.DIALOGUE,
        contenu: '- Bonjour ! dit-il.',
      };

      mockMorceauTexte.findByPk = (jest.fn() as any).mockResolvedValue(dialogueData);
      mockEncryptionService.decryptRowData = (jest.fn() as any).mockReturnValue({
        contenu: '- Bonjour ! dit-il.'
      });

      const result = await MorceauTexteService.getMorceauTexteById(1);

      expect(result).toEqual(
        expect.objectContaining({
          type: TypeMorceauTexte.DIALOGUE,
          contenu: '- Bonjour ! dit-il.',
        })
      );
    });

    it('doit gérer les morceaux de type PARAGRAPHE', async () => {
      const paragrapheData = {
        ...mockMorceauTexteData,
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: 'Un paragraphe normal.',
      };

      mockMorceauTexte.findByPk = (jest.fn() as any).mockResolvedValue(paragrapheData);
      mockEncryptionService.decryptRowData = (jest.fn() as any).mockReturnValue({
        contenu: 'Un paragraphe normal.'
      });

      const result = await MorceauTexteService.getMorceauTexteById(1);

      expect(result).toEqual(
        expect.objectContaining({
          type: TypeMorceauTexte.PARAGRAPHE,
          contenu: 'Un paragraphe normal.',
        })
      );
    });
  });

  describe('Tests de gestion des ordres', () => {
    it('doit créer un morceau avec ordre automatique', async () => {
      const inputData: MorceauTexteInput = {
        chapitreId: 1,
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: 'Test',
        ordre: 1,
      };

      const mockCreatedMorceau = {
        ...mockMorceauTexteData,
        update: (jest.fn() as any).mockResolvedValue(mockMorceauTexteData),
      };

      mockMorceauTexte.create = (jest.fn() as any).mockResolvedValue(mockCreatedMorceau);

      const result = await MorceauTexteService.createMorceauTexte(inputData);

      expect(result).toEqual(
        expect.objectContaining({
          ordre: 1,
        })
      );
    });

    it('doit respecter l\'ordre des morceaux lors de la récupération', async () => {
      const morceaux = [
        { ...mockMorceauTexteData, id: 1, ordre: 1 },
        { ...mockMorceauTexteData, id: 2, ordre: 2 },
        { ...mockMorceauTexteData, id: 3, ordre: 3 },
      ];

      mockMorceauTexte.findAll = (jest.fn() as any).mockResolvedValue(morceaux);

      const result = await MorceauTexteService.getMorceauxTexteByChapitreId(1);

      expect(mockMorceauTexte.findAll).toHaveBeenCalledWith({
        where: { chapitreId: 1 },
        order: [['ordre', 'ASC']],
      });
      expect(result).toHaveLength(3);
    });
  });

  describe('Tests de chiffrement', () => {
    it('doit gérer les erreurs de déchiffrement', async () => {
      mockMorceauTexte.findByPk = (jest.fn() as any).mockResolvedValue(mockMorceauTexteData);
      mockEncryptionService.decryptRowData = (jest.fn() as any).mockImplementation(() => {
        throw new Error('Erreur de déchiffrement');
      });

      await expect(MorceauTexteService.getMorceauTexteById(1)).rejects.toThrow('Erreur de déchiffrement');
    });

    it('doit gérer les erreurs de chiffrement lors de la création', async () => {
      const inputData: MorceauTexteInput = {
        chapitreId: 1,
        type: TypeMorceauTexte.PARAGRAPHE,
        contenu: 'Test',
        ordre: 1,
      };

      // Mock des morceaux existants avec méthode update
      const mockExistingMorceaux = [
        { ...mockMorceauTexteData, ordre: 1, update: (jest.fn() as any).mockResolvedValue(true) }
      ];
      mockMorceauTexte.findAll = (jest.fn() as any).mockResolvedValue(mockExistingMorceaux);

      mockEncryptionService.encryptRowData = (jest.fn() as any).mockImplementation(() => {
        throw new Error('Erreur de chiffrement');
      });

      await expect(MorceauTexteService.createMorceauTexte(inputData)).rejects.toThrow('Erreur de chiffrement');
    });
  });
}); 