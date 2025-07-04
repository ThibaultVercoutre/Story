import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'admin_super',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'story_db',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

export default sequelize; 