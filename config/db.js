const mysql = require("mysql");
const util = require("util");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.database,
  port: 3306,
  ssl: { ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem") },
});

db.getConnection((err, connection) => {
  if (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has too many connections.");
    }
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection was refused.");
    }
  }

  if (connection) connection.release();

  return;
});

db.query = util.promisify(db.query);

const queryDB = async (sql, params) => {
  return await db.query(sql, params);
};

// const queryDB = async (sql, params, doErr, doSucc) => {
//   db.query(sql, params, (err, result) => {
//     if (!err) {
//       doSucc(result);
//     } else {
//       doErr(err);
//     }
//   });
// };

module.exports = queryDB;
