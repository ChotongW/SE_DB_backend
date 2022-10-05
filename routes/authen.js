const express = require("express");
const bodyParser = require("body-parser");
const db = require("../config/db");
const upload = require("../storage/multer");
const blob = require("../storage/blobCar");
const userMiddleware = require("../middleware/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router = express.Router();
router.use(express.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// routes/router.js

router.post("/sign-up", userMiddleware.validateRegister, (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;
  let id = req.body.id;
  let fname = req.body.firstName;
  let lname = req.body.lastName;
  let phone = req.body.phone;

  var sql = "SELECT * FROM customer WHERE LOWER(email) = ?";
  db.query(sql, email.toLowerCase(), (err, result) => {
    if (err) {
      return res.status(500).send({
        msg: "Interval server error",
      });
    }
    if (result.length) {
      return res.status(409).send({
        msg: "This email is already in use!",
      });
    } else {
      // username is available
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return res.status(500).send({
            msg: err,
          });
        } else {
          // has hashed pw => add to database
          var sql =
            "INSERT INTO customer (id_no, fname, lname, email, password, phone ) VALUES (?, ?, ?, ?, ?, ?)";
          db.query(
            sql,
            [id, fname, lname, email, hash, phone],
            (err, result) => {
              if (err) {
                return res.status(400).send({
                  msg: err,
                });
              }
              return res.status(201).send({
                msg: "Registered!",
              });
            }
          );
        }
      });
    }
  });
});

// routes/router.js

router.post("/login", (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  var sql = "SELECT password FROM customer WHERE LOWER(email) = ?";
  db.query(sql, email, (err, result) => {
    // user does not exists
    if (err) {
      return res.status(400).send({
        msg: err,
      });
    }

    if (!result.length) {
      return res.status(401).send({
        msg: "Username or password is incorrect!",
      });
    }

    // check password
    passFromDB = JSON.parse(JSON.stringify(result))[0].password;
    bcrypt.compare(password, passFromDB, (bErr, bResult) => {
      // wrong password
      // console.log(password);
      // console.log(JSON.parse(JSON.stringify(result))[0].password);
      if (bErr) {
        //console.log("in bcrypt.compare");
        console.log(bErr);
        return res.status(401).send({
          msg: "Username or password is incorrect!",
        });
      }

      if (bResult) {
        const token = jwt.sign(
          {
            email: email.toLowerCase(),
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: 3600,
          }
        );

        return res.status(200).send({
          msg: "Logged in!",
          token,
          user: email.toLowerCase(),
        });
      }
      return res.status(401).send({
        msg: "Username or password is incorrect!",
      });
    });
  });
});

router.post("/admin/login", (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  var sql = "SELECT password FROM admin WHERE LOWER(email) = ?";
  db.query(sql, email, (err, result) => {
    // user does not exists
    if (err) {
      return res.status(400).send({
        msg: err,
      });
    }

    if (!result.length) {
      return res.status(401).send({
        msg: "Username or password is incorrect!",
      });
    }

    // check password
    passFromDB = JSON.parse(JSON.stringify(result))[0].password;
    bcrypt.compare(password, passFromDB, (bErr, bResult) => {
      // wrong password
      // console.log(password);
      // console.log(JSON.parse(JSON.stringify(result))[0].password);
      if (bErr) {
        //console.log("in bcrypt.compare");
        console.log(bErr);
        return res.status(401).send({
          msg: "Username or password is incorrect!",
        });
      }

      if (bResult) {
        const token = jwt.sign(
          {
            email: email.toLowerCase(),
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: 3600,
          }
        );

        return res.status(200).send({
          msg: "Logged in!",
          token,
          user: email.toLowerCase(),
        });
      }
      return res.status(401).send({
        msg: "Username or password is incorrect!",
      });
    });
  });
});

module.exports = router;
