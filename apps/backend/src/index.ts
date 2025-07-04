import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import routes from './routes/index.js';
import sequelize from './models/index.js';

// Configuration des variables d'environnement
dotenv.config()

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

// Connexion à la base de données et démarrage du serveur
sequelize.authenticate()
  .then(() => {
    console.log('📦 Connexion à la base de données établie avec succès.');
    app.listen(port, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
    });
  })
  .catch((err: Error) => {
    console.error('❌ Impossible de se connecter à la base de données:', err);
  }); 