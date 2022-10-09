const mysql = require("mysql");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.database,
  port: 3306,
  ssl: { ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem") },
});

const queryDB = async (sql, params, doErr, doSucc) => {
  db.query(sql, params, (err, result) => {
    if (!err) {
      doSucc(result);
    } else {
      doErr(err);
    }
  });
};
// function sqlQuery(sql, val) {
//   db.query(sql, val, (err, result) => {
//     if (!err) {
//       return result;
//       //res.send(200, "Deleted vehicle already");
//       //res.redirect(201, '/');
//     } else {
//       console.log(err);
//       //res.send(500, err);
//       return err;
//     }
//   })
// }

module.exports = queryDB;
