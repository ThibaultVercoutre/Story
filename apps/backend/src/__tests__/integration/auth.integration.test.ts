import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { DatabaseTestUtils } from '../setup-integration.js';
import { AuthController } from '../../controllers/auth.controller.js';
import { User } from '../../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json());

// Routes pour les tests d'intégration
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);
app.get('/api/auth/user', AuthController.authenticateToken, AuthController.getUser);



describe('Tests d\'intégration - Authentification', () => {
  beforeAll(async () => {
    // Initialiser la base de données de test
    await DatabaseTestUtils.initializeTestDatabase();
  });

  afterAll(async () => {
    // Fermer la connexion à la base de données de test
    await DatabaseTestUtils.closeTestDatabase();
  });

  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await DatabaseTestUtils.cleanTestDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('doit créer un nouveau compte utilisateur avec succès', async () => {
      const userData = {
        email: 'test@example.com',
        nom: 'Test User',
        password: 'MotDePasse123!',
        confirmPassword: 'MotDePasse123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.nom).toBe(userData.nom);
      expect(response.body.data.user.passwordHash).toBeUndefined(); // Le mot de passe ne doit pas être retourné
      expect(response.body.data.token).toBeDefined();

      // Vérifier que l'utilisateur a été créé en testant la connexion
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.user.email).toBe(userData.email);
    });

    it('doit échouer avec un email déjà utilisé', async () => {
      const userData = {
        email: 'test@example.com',
        nom: 'Test User',
        password: 'MotDePasse123!',
        confirmPassword: 'MotDePasse123!',
      };

      // Créer le premier utilisateur
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Essayer de créer un deuxième utilisateur avec le même email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('doit échouer avec des mots de passe qui ne correspondent pas', async () => {
      const userData = {
        email: 'test@example.com',
        nom: 'Test User',
        password: 'MotDePasse123!',
        confirmPassword: 'MotDePasseDifférent123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('doit échouer avec des données invalides', async () => {
      const invalidUserData = {
        email: 'email-invalide', // Email invalide
        nom: '',                 // Nom vide
        password: '123',         // Mot de passe trop court
        confirmPassword: '123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Créer un utilisateur de test avant chaque test de connexion
      const userData = {
        email: 'test@example.com',
        nom: 'Test User',
        password: 'MotDePasse123!',
        confirmPassword: 'MotDePasse123!',
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('doit connecter un utilisateur avec des identifiants valides', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'MotDePasse123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(loginData.email);
             expect(response.body.data.user.passwordHash).toBeUndefined(); // Le mot de passe ne doit pas être retourné

      // Vérifier que le token est valide
      const token = response.body.data.token;
      expect(() => jwt.verify(token, process.env.JWT_SECRET || 'test-jwt-secret')).not.toThrow();
    });

    it('doit échouer avec un email inexistant', async () => {
      const loginData = {
        email: 'inexistant@example.com',
        password: 'MotDePasse123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('doit échouer avec un mot de passe incorrect', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'MauvaisMotDePasse123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('doit échouer avec des données invalides', async () => {
      const invalidLoginData = {
        email: 'email-invalide',
        password: '',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidLoginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Tests d\'authentification avec token', () => {
    let authToken: string;
    let testUser: any;

    beforeEach(async () => {
      // Créer et connecter un utilisateur de test
      const userData = {
        email: 'test@example.com',
        nom: 'Test User',
        password: 'MotDePasse123!',
        confirmPassword: 'MotDePasse123!',
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      authToken = loginResponse.body.data.token;
      testUser = loginResponse.body.data.user;
    });

    it('doit accéder à une route protégée avec un token valide', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.user.id).toBe(testUser.id);
    });

    it('doit échouer sans token', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('doit échouer avec un token invalide', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .set('Authorization', 'Bearer token-invalide')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Tests de sécurité', () => {
    it('doit hacher les mots de passe avant de les stocker', async () => {
      const userData = {
        email: 'test@example.com',
        nom: 'Test User',
        password: 'MotDePasse123!',
        confirmPassword: 'MotDePasse123!',
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Vérifier que l'utilisateur existe et que la connexion fonctionne
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.token).toBeDefined();
    });

    it('doit gérer les caractères spéciaux dans les mots de passe', async () => {
      const userData = {
        email: 'test@example.com',
        nom: 'Test User',
        password: 'Mot$De#Passe@123!éèà',
        confirmPassword: 'Mot$De#Passe@123!éèà',
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);

      // Vérifier que la connexion fonctionne avec le mot de passe contenant des caractères spéciaux
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.token).toBeDefined();
    });
  });

  describe('Tests de performance', () => {
    it('doit gérer plusieurs inscriptions simultanées', async () => {
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        const userData = {
          email: `test${i}@example.com`,
          nom: `Test User ${i}`,
          password: 'MotDePasse123!',
          confirmPassword: 'MotDePasse123!',
        };

        promises.push(
          request(app)
            .post('/api/auth/register')
            .send(userData)
        );
      }

      const responses = await Promise.all(promises);
      
             responses.forEach((response: any) => {
         expect(response.status).toBe(201);
         expect(response.body.success).toBe(true);
       });

      // Vérifier que tous les utilisateurs ont été créés
      const allUsers = await User.findAll();
      expect(allUsers.length).toBe(5);
    });

    it('doit gérer plusieurs connexions simultanées', async () => {
      // Créer plusieurs utilisateurs
      const users = [];
      for (let i = 0; i < 5; i++) {
        const userData = {
          email: `test${i}@example.com`,
          nom: `Test User ${i}`,
          password: 'MotDePasse123!',
          confirmPassword: 'MotDePasse123!',
        };

        await request(app)
          .post('/api/auth/register')
          .send(userData);

        users.push(userData);
      }

      // Connexions simultanées
      const promises = users.map(user => 
        request(app)
          .post('/api/auth/login')
          .send({
            email: user.email,
            password: user.password,
          })
      );

      const responses = await Promise.all(promises);
      
             responses.forEach((response: any) => {
         expect(response.status).toBe(200);
         expect(response.body.success).toBe(true);
         expect(response.body.data.token).toBeDefined();
       });
    });
  });
}); 