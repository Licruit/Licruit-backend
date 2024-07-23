const Sequelize = require('sequelize');
const config = require('../config/config');
const dotenv = require("dotenv");
const Sector = require('./sectors.model');
const User = require('./users.model');
const Wholesaler = require('./wholesalers.model');

dotenv.config();

const env = process.env.NODE_ENV || 'development';
const db = {};

const sequelize = new Sequelize(config[env].database, config[env].username, config[env].password, config[env]);

Sector.initiate(sequelize);
User.initiate(sequelize);
Wholesaler.initiate(sequelize);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;