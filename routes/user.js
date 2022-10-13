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

const doReturnProfile = (id, userProf, res) => {
  const today = new Date();
  const day = today.getDate() - 1;
  queryDB(
    "SELECT end_date FROM booking where id_no = ?",
    id,
    (err) => {
      //console.log(err);
      res.send(err, 500);
    },
    (result) => {
      if (result.length === 0) {
        userProf["daylefts"] = null;
        res.status(200).send(userProf);
      } else {
        var date = parseInt(
          JSON.stringify(result[0].end_date).split("-")[2].slice(0, 2),
          10
        );
        var summary = date - day;
        userProf["daylefts"] = summary;
        //console.log(result[0].daylefts);
        res.status(200).send(userProf);
      }
    }
  );
};

router.get("/profile", userMiddleware.isLoggedIn, (req, res) => {
  let id = req.userData.id;
  queryDB(
    "SELECT * FROM customer where id_no = ?",
    id,
    (err) => {
      //console.log(err);
      res.send(err, 500);
      throw err;
    },
    (result) => {
      if (result[0] === undefined) {
        res.send(
          {
            message: "No user found.",
          },
          400
        );
      }
      doReturnProfile(id, result[0], res);
      //res.send(result[0], 200);
    }
  );
});

router.get("/payment", userMiddleware.isLoggedIn, async (req, res) => {
  let id = req.userData.id;
  await queryDB(
    "SELECT bill_id FROM customer where id_no = ?",
    id,
    (err) => {
      //console.log(err);
      res.send(err, 500);
      throw err;
    },
    (result) => {
      var bill_id = result[0].bill_id;
      queryDB(
        "SELECT * FROM billing where bill_id = ?",
        bill_id,
        (err) => {
          //console.log(err);
          res.send(err, 500);
          throw err;
        },
        (result) => {
          res.send(result);
        }
      );
    }
  );
});

router.put("/edit", userMiddleware.isLoggedIn, async (req, res) => {
  let id = req.userData.id;
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
      res.send(err, 500);
      throw err;
    },
    () => {
      //res.redirect(201, "/");
      res.send({ message: "update profile already" });
    }
  );
});

module.exports = router;
