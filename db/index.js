const mysql = require("mysql2/promise");

async function initializeConnection() {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    dataStrings : true
  });
  return connection;
};

module.exports = initializeConnection;