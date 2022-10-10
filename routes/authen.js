const express = require("express");
const bodyParser = require("body-parser");
const queryDB = require("../config/db");
const userMiddleware = require("../middleware/role");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router = express.Router();
router.use(express.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const doSignUp = (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let id = req.body.id;
  let fname = req.body.firstName;
  let lname = req.body.lastName;
  let phone = req.body.phone;

  // username is available
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).send({
        msg: err,
      });
    } else {
      // has hashed pw => add to database

      queryDB(
        "INSERT INTO customer (id_no, fname, lname, email, password, phone ) VALUES (?, ?, ?, ?, ?, ?)",
        [id, fname, lname, email, hash, phone],
        (err) => {
          return res.status(400).send({
            msg: err,
          });
        },
        () => {
          return res.status(201).send({
            msg: "Registered!",
          });
        }
      );
    }
  });
};
// routes/router.js

function verify(result, password, res) {
  var id = result[0].id_no;
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
          id: id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: 3600,
        }
      );

      return res.status(200).send({
        msg: "Logged in!",
        token,
        user: id,
      });
    }
    return res.status(401).send({
      msg: "Username or password is incorrect!",
    });
  });
}

router.post("/sign-up", userMiddleware.validateRegister, (req, res, next) => {
  let email = req.body.email;

  queryDB(
    "SELECT * FROM customer WHERE LOWER(email) = ?",
    email,
    (err) => {
      return res.status(500).send({
        msg: "Interval server error",
      });
    },
    (result) => {
      if (result.length) {
        return res.status(409).send({
          msg: "This email is already in use!",
        });
      } else {
        doSignUp(req, res);
      }
    }
  );
});

// routes/router.js

router.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  queryDB(
    "SELECT password,id_no FROM customer WHERE LOWER(email) = ?",
    email,
    (err) => {
      return res.status(400).send({
        msg: err,
      });
    },
    (result) => {
      if (!result.length) {
        return res.status(401).send({
          msg: "Username or password is incorrect!",
        });
      }
      // check password
      verify(result, password, res);
    }
  );
});

router.post("/admin/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  queryDB(
    "SELECT password,id_no FROM admin WHERE LOWER(email) = ?",
    email,
    (err) => {
      return res.status(400).send({
        msg: err,
      });
    },
    (result) => {
      if (!result.length) {
        return res.status(401).send({
          msg: "Username or password is incorrect!",
        });
      }
      // check password
      verify(result, password, res);
    }
  );
});

module.exports = router;
