// src/lib/db.js
import mysql from 'mysql2/promise';

// This is a check to see if we're in a production environment
const isProduction = process.env.NODE_ENV === 'production';

// We'll store our connection pool in a global variable to ensure it's a singleton.
let pool;

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    // ✅ CRITICAL FIXES FOR ECONNRESET:
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
};

if (isProduction) {
  pool = mysql.createPool(dbConfig);
} else {
  if (!global._mysqlPool) {
    global._mysqlPool = mysql.createPool({
      ...dbConfig,
      connectionLimit: 10,
    });
  }
  pool = global._mysqlPool;
}

export const db = pool;