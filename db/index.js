const mysql = require("mysql2/promise");

async function initializeConnection() {
  const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
  });
  return connection;
};

module.exports = initializeConnection;