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

router.get("/", userMiddleware.isLoggedIn, async (req, res) => {
  var sql = "SELECT * FROM insurance ORDER BY class";
  try {
    var result = await queryDB(sql, undefined);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }
});

router.get("/admin", userMiddleware.isAdmin, async (req, res) => {
  var sql = "SELECT * FROM insurance ORDER BY class";
  try {
    var result = await queryDB(sql, undefined);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }
});

router.post("/admin/add", userMiddleware.isAdmin, async (req, res) => {
  //console.log(req.body);
  let name = req.body.insurance_name;
  let info = req.body.insurance_info;
  let insu_class = req.body.insurance_class;
  let cost = parseInt(req.body.insurance_price, 10);
  var id = uuid.v4();
  //let booking_status = req.booking_status;
  if (name == null || insu_class == null || cost == null) {
    res.send(
      {
        status: "incompleted",
        message: "You have some fields unfilled.",
      },
      400
    );
    return;
  }
  var sql =
    "INSERT INTO insurance (in_id, name,  info, class, cost) \
  VALUES(?, ?, ?, ?, ?)";
  try {
    var result = await queryDB(sql, [id, name, info, insu_class, cost]);
    res.send(201, { response: "Created insurance already" });
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }
});

router.put("/admin/edit", userMiddleware.isAdmin, async (req, res) => {
  let id = req.body.insurance_id;
  let name = req.body.insurance_name;
  let info = req.body.insurance_info;
  let insu_class = req.body.insurance_class;
  let cost = parseInt(req.body.insurance_price, 10);

  if (id == null) {
    res.send(
      {
        status: "incompleted",
        message: "You have id unfilled.",
      },
      400
    );
    return;
  }
  var sql =
    "UPDATE insurance SET name = ? info = ? class = ? cost = ? where in_id = ?";
  try {
    var result = await queryDB(sql, [name, info, insu_class, cost, id]);
    res.send(200, { message: "update insurance already" });
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }
});

router.delete("/admin/delete", userMiddleware.isAdmin, async (req, res) => {
  let id = req.body.insurance_id;
  if (id == null) {
    res.send(
      {
        status: "incompleted",
        message: "You must have insurance ID.",
      },
      400
    );
    return;
  }
  var sql = "DELETE FROM insurance WHERE in_id = ?";
  try {
    var result = await queryDB(sql, id);
    res.send({ message: "Deleted insurance already" }, 200);
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }
});

module.exports = router;
