import dotenv from 'dotenv';
import { Options, Sequelize } from 'sequelize';
import { dbConfig } from '../config/config';

dotenv.config();

type EnvType = 'development' | 'test' | 'production';

const env = (process.env.NODE_ENV || 'development') as EnvType;

export const sequelize = new Sequelize(
  dbConfig[env].database!,
  dbConfig[env].username!,
  dbConfig[env].password,
  dbConfig[env] as Options,
);
