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

router.get("/profile", userMiddleware.isLoggedIn, (req, res) => {
  let email = req.body.email;
  queryDB(
    "SELECT * FROM customer where email = ?",
    email,
    (err) => {
      //console.log(err);
      res.send(err, 500);
    },
    (result) => {
      res.send(result, 200);
    }
  );
});

router.get("/payment", userMiddleware.isLoggedIn, async (req, res) => {
  let email = req.body.email;
  await queryDB(
    "SELECT bill_id FROM customer where email = ?",
    email.toLowerCase(),
    (err) => {
      //console.log(err);
      throw (err, res.send(err, 500));
    },
    (result) => {
      var bill_id = result[0].bill_id;
      queryDB(
        "SELECT * FROM billing where bill_id = ?",
        bill_id,
        (err) => {
          //console.log(err);
          throw (err, res.send(err, 500));
        },
        (result) => {
          res.send(result);
        }
      );
    }
  );
});

router.put("/edit", userMiddleware.isLoggedIn, async (req, res) => {
  let id = req.body.customerId;
  let fname = req.body.customerFname;
  let lname = req.body.customerLname;
  let phone = req.body.phone;

  if (id == null || fname == null || lname == null || phone == null) {
    res.send(
      {
        status: "incompleted",
        message: "You have some fields unfilled.",
      },
      400
    );
    return 0;
  }

  //mysql store url
  queryDB(
    "UPDATE customer SET fname = ?, lname = ?, phone = ? where id_no = ?",
    [fname, lname, phone, id],
    (err) => {
      //console.log(err);
      throw (err, res.send(err, 500));
    },
    () => {
      //res.redirect(201, "/");
      res.send({ message: "update profile already" });
    }
  );
});

module.exports = router;
