import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    host: process.env.DB_HOST,
    port: 3306,
    dialect: 'mysql',
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    host: process.env.DB_HOST,
    port: 3306,
    dialect: 'mysql',
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    host: process.env.DB_HOST,
    port: 3306,
    dialect: 'mysql',
  },
};
