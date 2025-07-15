import { UserService, UserInput, LoginCredentials } from '../../services/user.service.js';
import { EncryptionService } from '../../services/encryption.service.js';
import User from '../../models/user.model.js';
import bcrypt from 'bcrypt';

// Mock des dépendances
jest.mock('../../models/user.model.js');
jest.mock('../../services/encryption.service.js');
jest.mock('bcrypt');

const MockedUser = User as jest.Mocked<typeof User>;
const MockedEncryptionService = EncryptionService as jest.Mocked<typeof EncryptionService>;
const MockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
  const mockUserData: UserInput = {
    email: 'test@example.com',
    nom: 'Test User',
    password: 'password123',
  };

  const mockEncryptedData = {
    encryptedData: {
      email: 'encrypted-email',
      nom: 'encrypted-nom',
    },
    iv: 'mock-iv',
    tag: 'mock-tag',
  };

  const mockUserModel = {
    id: 1,
    uuid: 'test-uuid-123',
    email: 'encrypted-email',
    nom: 'encrypted-nom',
    passwordHash: 'hashed-password',
    iv: 'mock-iv',
    tag: 'mock-tag',
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    update: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MASTER_KEY = 'test-master-key';
    
    // Setup des mocks par défaut
    MockedEncryptionService.encryptRowData.mockReturnValue(mockEncryptedData);
    MockedEncryptionService.decryptRowData.mockReturnValue({
      email: mockUserData.email,
      nom: mockUserData.nom,
    });
    MockedBcrypt.hash.mockResolvedValue('hashed-password' as never);
    MockedBcrypt.compare.mockResolvedValue(true as never);
  });

  describe('createUser', () => {
    beforeEach(() => {
      MockedUser.create.mockResolvedValue(mockUserModel as any);
    });

    it('devrait créer un utilisateur avec succès', async () => {
      const result = await UserService.createUser(mockUserData);

      expect(MockedBcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 12);
      expect(MockedEncryptionService.encryptRowData).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockUserData.email,
          nom: mockUserData.nom,
        }),
        expect.any(String)
      );
      expect(MockedUser.create).toHaveBeenCalledWith({
        uuid: expect.any(String),
        email: mockEncryptedData.encryptedData.email,
        nom: mockEncryptedData.encryptedData.nom,
        passwordHash: 'hashed-password',
        iv: mockEncryptedData.iv,
        tag: mockEncryptedData.tag,
        isActive: true,
      });

      expect(result).toEqual({
        id: mockUserModel.id,
        uuid: mockUserModel.uuid,
        email: mockUserData.email,
        nom: mockUserData.nom,
        isActive: mockUserModel.isActive,
        lastLoginAt: mockUserModel.lastLoginAt,
        createdAt: mockUserModel.createdAt,
        updatedAt: mockUserModel.updatedAt,
      });
    });

    it('devrait générer un UUID unique pour chaque utilisateur', async () => {
      await UserService.createUser(mockUserData);
      await UserService.createUser(mockUserData);

      expect(MockedUser.create).toHaveBeenCalledTimes(2);
      const firstCall = MockedUser.create.mock.calls[0]?.[0];
      const secondCall = MockedUser.create.mock.calls[1]?.[0];
      
      expect(firstCall?.uuid).not.toBe(secondCall?.uuid);
    });

    it('devrait propager les erreurs de hachage', async () => {
      const error = new Error('Erreur de hachage');
      MockedBcrypt.hash.mockRejectedValue(error as never);

      await expect(UserService.createUser(mockUserData)).rejects.toThrow(error);
    });

    it('devrait propager les erreurs de chiffrement', async () => {
      const error = new Error('Erreur de chiffrement');
      MockedEncryptionService.encryptRowData.mockImplementation(() => {
        throw error;
      });

      await expect(UserService.createUser(mockUserData)).rejects.toThrow(error);
    });

    it('devrait propager les erreurs de base de données', async () => {
      const error = new Error('Erreur de base de données');
      MockedUser.create.mockRejectedValue(error);

      await expect(UserService.createUser(mockUserData)).rejects.toThrow(error);
    });
  });

  describe('authenticateUser', () => {
    const loginCredentials: LoginCredentials = {
      email: mockUserData.email,
      password: mockUserData.password,
    };

    beforeEach(() => {
      MockedUser.findAll.mockResolvedValue([mockUserModel] as any);
      mockUserModel.update.mockResolvedValue(undefined);
    });

    it('devrait authentifier un utilisateur avec succès', async () => {
      const result = await UserService.authenticateUser(loginCredentials);

      expect(MockedUser.findAll).toHaveBeenCalledWith({ where: { isActive: true } });
      expect(MockedEncryptionService.decryptRowData).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockUserModel.email,
          nom: mockUserModel.nom,
        }),
        mockUserModel.uuid,
        mockUserModel.iv,
        mockUserModel.tag
      );
      expect(MockedBcrypt.compare).toHaveBeenCalledWith(
        loginCredentials.password,
        mockUserModel.passwordHash
      );
      expect(mockUserModel.update).toHaveBeenCalledWith({
        lastLoginAt: expect.any(Date),
      });

      expect(result).toEqual({
        id: mockUserModel.id,
        uuid: mockUserModel.uuid,
        email: mockUserData.email,
        nom: mockUserData.nom,
        isActive: mockUserModel.isActive,
        lastLoginAt: mockUserModel.lastLoginAt,
        createdAt: mockUserModel.createdAt,
        updatedAt: mockUserModel.updatedAt,
      });
    });

    it('devrait retourner null si l\'email n\'existe pas', async () => {
      MockedEncryptionService.decryptRowData.mockReturnValue({
        email: 'different@example.com',
        nom: 'Different User',
      });

      const result = await UserService.authenticateUser(loginCredentials);

      expect(result).toBeNull();
    });

    it('devrait retourner null si le mot de passe est incorrect', async () => {
      MockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await UserService.authenticateUser(loginCredentials);

      expect(result).toBeNull();
    });

    it('devrait retourner null si aucun utilisateur actif n\'est trouvé', async () => {
      MockedUser.findAll.mockResolvedValue([]);

      const result = await UserService.authenticateUser(loginCredentials);

      expect(result).toBeNull();
    });

    it('devrait ignorer les utilisateurs avec des données corrompues', async () => {
      const corruptedUser = { ...mockUserModel, uuid: 'corrupted-uuid' };
      MockedUser.findAll.mockResolvedValue([corruptedUser, mockUserModel] as any);
      
      MockedEncryptionService.decryptRowData
        .mockImplementationOnce(() => {
          throw new Error('Données corrompues');
        })
        .mockReturnValueOnce({
          email: mockUserData.email,
          nom: mockUserData.nom,
        });

      const result = await UserService.authenticateUser(loginCredentials);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockUserModel.id);
    });
  });

  describe('getUserById', () => {
    it('devrait retourner un utilisateur par ID', async () => {
      MockedUser.findByPk.mockResolvedValue(mockUserModel as any);

      const result = await UserService.getUserById(1);

      expect(MockedUser.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: mockUserModel.id,
        uuid: mockUserModel.uuid,
        email: mockUserData.email,
        nom: mockUserData.nom,
        isActive: mockUserModel.isActive,
        lastLoginAt: mockUserModel.lastLoginAt,
        createdAt: mockUserModel.createdAt,
        updatedAt: mockUserModel.updatedAt,
      });
    });

    it('devrait retourner null si l\'utilisateur n\'existe pas', async () => {
      MockedUser.findByPk.mockResolvedValue(null);

      const result = await UserService.getUserById(999);

      expect(result).toBeNull();
    });

    it('devrait retourner null si l\'utilisateur n\'est pas actif', async () => {
      const inactiveUser = { ...mockUserModel, isActive: false };
      MockedUser.findByPk.mockResolvedValue(inactiveUser as any);

      const result = await UserService.getUserById(1);

      expect(result).toBeNull();
    });
  });

  describe('getUserByUuid', () => {
    it('devrait retourner un utilisateur par UUID', async () => {
      MockedUser.findOne.mockResolvedValue(mockUserModel as any);

      const result = await UserService.getUserByUuid('test-uuid-123');

      expect(MockedUser.findOne).toHaveBeenCalledWith({
        where: { uuid: 'test-uuid-123', isActive: true },
      });
      expect(result).toEqual({
        id: mockUserModel.id,
        uuid: mockUserModel.uuid,
        email: mockUserData.email,
        nom: mockUserData.nom,
        isActive: mockUserModel.isActive,
        lastLoginAt: mockUserModel.lastLoginAt,
        createdAt: mockUserModel.createdAt,
        updatedAt: mockUserModel.updatedAt,
      });
    });

    it('devrait retourner null si l\'utilisateur n\'existe pas', async () => {
      MockedUser.findOne.mockResolvedValue(null);

      const result = await UserService.getUserByUuid('non-existent-uuid');

      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    beforeEach(() => {
      MockedUser.findAll.mockResolvedValue([mockUserModel] as any);
    });

    it('devrait retourner un utilisateur par email', async () => {
      const result = await UserService.getUserByEmail(mockUserData.email);

      expect(MockedUser.findAll).toHaveBeenCalledWith({ where: { isActive: true } });
      expect(MockedEncryptionService.decryptRowData).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockUserModel.email,
          nom: mockUserModel.nom,
        }),
        mockUserModel.uuid,
        mockUserModel.iv,
        mockUserModel.tag
      );
      expect(result).toEqual({
        id: mockUserModel.id,
        uuid: mockUserModel.uuid,
        email: mockUserData.email,
        nom: mockUserData.nom,
        isActive: mockUserModel.isActive,
        lastLoginAt: mockUserModel.lastLoginAt,
        createdAt: mockUserModel.createdAt,
        updatedAt: mockUserModel.updatedAt,
      });
    });

    it('devrait retourner null si l\'email n\'existe pas', async () => {
      MockedEncryptionService.decryptRowData.mockReturnValue({
        email: 'different@example.com',
        nom: 'Different User',
      });

      const result = await UserService.getUserByEmail(mockUserData.email);

      expect(result).toBeNull();
    });

    it('devrait ignorer les utilisateurs avec des données corrompues', async () => {
      const corruptedUser = { ...mockUserModel, uuid: 'corrupted-uuid' };
      MockedUser.findAll.mockResolvedValue([corruptedUser, mockUserModel] as any);
      
      MockedEncryptionService.decryptRowData
        .mockImplementationOnce(() => {
          throw new Error('Données corrompues');
        })
        .mockReturnValueOnce({
          email: mockUserData.email,
          nom: mockUserData.nom,
        });

      const result = await UserService.getUserByEmail(mockUserData.email);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockUserModel.id);
    });
  });

  describe('emailExists', () => {
    it('devrait retourner true si l\'email existe', async () => {
      MockedUser.findAll.mockResolvedValue([mockUserModel] as any);

      const result = await UserService.emailExists(mockUserData.email);

      expect(result).toBe(true);
    });

    it('devrait retourner false si l\'email n\'existe pas', async () => {
      MockedEncryptionService.decryptRowData.mockReturnValue({
        email: 'different@example.com',
        nom: 'Different User',
      });

      const result = await UserService.emailExists(mockUserData.email);

      expect(result).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('devrait mettre à jour un utilisateur avec succès', async () => {
      MockedUser.findByPk.mockResolvedValue(mockUserModel as any);
      
      const updateData = {
        nom: 'Updated User',
        email: 'updated@example.com',
      };

      const result = await UserService.updateUser(1, updateData);

      expect(MockedUser.findByPk).toHaveBeenCalledWith(1);
      expect(MockedEncryptionService.encryptRowData).toHaveBeenCalledWith(
        expect.objectContaining({
          email: updateData.email,
          nom: updateData.nom,
        }),
        mockUserModel.uuid
      );
      expect(result).not.toBeNull();
    });

    it('devrait retourner null si l\'utilisateur n\'existe pas', async () => {
      MockedUser.findByPk.mockResolvedValue(null);

      const result = await UserService.updateUser(999, { nom: 'Updated User' });

      expect(result).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    it('devrait désactiver un utilisateur avec succès', async () => {
      MockedUser.findByPk.mockResolvedValue(mockUserModel as any);
      mockUserModel.update.mockResolvedValue(undefined);

      const result = await UserService.deactivateUser(1);

      expect(MockedUser.findByPk).toHaveBeenCalledWith(1);
      expect(mockUserModel.update).toHaveBeenCalledWith({ isActive: false });
      expect(result).toBe(true);
    });

    it('devrait retourner false si l\'utilisateur n\'existe pas', async () => {
      MockedUser.findByPk.mockResolvedValue(null);

      const result = await UserService.deactivateUser(999);

      expect(result).toBe(false);
    });
  });
}); 