const express = require("express");
const bodyParser = require("body-parser");
const queryDB = require("../config/db");
const userMiddleware = require("../middleware/role");
const payment = require("../routes/payment");
var uuid = require("uuid");

router = express.Router();
router.use(express.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

router.get("/", userMiddleware.isLoggedIn, (req, res) => {
  queryDB(
    "SELECT * FROM insurance",
    undefined,
    (err) => {
      //console.log(err);
      throw (err, res.send(err, 500));
    },
    (result) => {
      res.send(result);
    }
  );
});

router.get("/admin", userMiddleware.isAdmin, (req, res) => {
  queryDB(
    "SELECT * FROM insurance",
    undefined,
    (err) => {
      //console.log(err);
      throw (err, res.send(err, 500));
    },
    (result) => {
      res.send(result);
    }
  );
});

module.exports = router;
