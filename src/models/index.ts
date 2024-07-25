const config = require('../config/config');
const dotenv = require('dotenv');
import { Sequelize } from 'sequelize';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

export const sequelize = new Sequelize(config[env].database, config[env].username, config[env].password, config[env]);
