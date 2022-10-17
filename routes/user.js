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

const doReturnProfile = async (id, userProf, res) => {
  const today = new Date();
  const day = today.getDate() - 1;

  var sql = "SELECT end_date FROM booking where id_no = ?";
  try {
    var result = await queryDB(sql, id);
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
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }
};

router.get("/profile", userMiddleware.isLoggedIn, async (req, res) => {
  let id = req.userData.id;

  var sql = "SELECT * FROM customer where id_no = ?";
  try {
    var result = await queryDB(sql, id);
    if (result[0] === undefined) {
      res.send(
        {
          message: "No user found.",
        },
        400
      );
      return;
    }
    doReturnProfile(id, result[0], res);
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }
});

router.get("/payment", userMiddleware.isLoggedIn, async (req, res) => {
  let id = req.userData.id;

  var sql = "SELECT book_id FROM customer where id_no = ?";
  try {
    var result = await queryDB(sql, id);
    if (result.length == 0) {
      res.send({ message: "No book found." }, 400);
      return;
    }
    var book_id = result[0].book_id;
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }

  var sql = "SELECT vehicle_id FROM booking where id_no = ?";
  try {
    var result2 = await queryDB(sql, id);
    var vehicle_id = result2[0].vehicle_id;
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }

  var sql = "SELECT * FROM billing where book_id = ?";
  try {
    var result3 = await queryDB(sql, book_id);
    result3[0]["vehicle_id"] = vehicle_id;
    res.send(result3);
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }
});

router.get("/booking", userMiddleware.isLoggedIn, async (req, res) => {
  let id = req.userData.id;

  var sql = "SELECT book_id FROM customer where id_no = ?";
  try {
    var result = await queryDB(sql, id);
    if (result.length == 0 || result[0].book_id == null) {
      res.send(200, { message: "No book found." });
      return;
    }
    var book_id = result[0].book_id;
    //console.log(book_id);
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }

  var sql =
    "SELECT book_id, vehicle_id, in_id, status FROM booking where book_id = ?";
  try {
    var booking = await queryDB(sql, book_id);
    //res.send(result2);
    var vehicle_id = booking[0].vehicle_id;
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }

  var sql =
    "SELECT name, brand, vehicle_img, cost FROM vehicles where vehicle_id = ?";
  try {
    var carDetail = await queryDB(sql, vehicle_id);
    booking[0]["vehicle_img"] = carDetail[0].vehicle_img;
    booking[0]["model_name"] = carDetail[0].name;
    booking[0]["brand"] = carDetail[0].brand;
    booking[0]["cost"] = carDetail[0].cost;

    res.send(booking);
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }
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

  var sql =
    "UPDATE customer SET fname = ?, lname = ?, phone = ? where id_no = ?";
  try {
    var result2 = await queryDB(sql, [fname, lname, phone, id]);
    res.send({ message: "update profile already" });
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }
});

module.exports = router;
