const express = require("express");
const bodyParser = require("body-parser");
const db = require("../config/db");
const upload = require("../storage/multer");
const blob = require("../storage/blobPayment");
const userMiddleware = require("../middleware/user");
var uuid = require("uuid");

router = express.Router();
router.use(express.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

router.get("/admin", userMiddleware.isLoggedIn, (req, res) => {
  //let vehicle_id = req.query.vehicleId;
  //console.log(vehicle_id);
  var sql = "SELECT * FROM billing";
  db.query(sql, (err, result) => {
    if (err) throw (err, res.status(500).send(err));
    //console.log(rows);
    res.send(result);
  });

  // router.get("/vehicle/", cors(), function(req, res) {
  //     let vehicle_id = req.query.vehicleId;
  //     let name = req.query.name;

  //     var sql = "SELECT * FROM vehicles WHERE vehicle_id = ? AND name >= ?";
  //     db.query(sql, [ vehicle_id, name ], function(err, rows, fields) {
  //     if (err) throw err;
  //     //console.log(rows);
  //     res.send((result));
  //     });
  //   });
});

router.post(
  "/",
  userMiddleware.isLoggedIn,
  upload.single("file"),
  (req, res) => {
    res.send({ msg: "Test payment" });
  }
);

function createBill(cost, id_no) {
  console.log(cost);
  console.log(id_no);
  var id = uuid.v4();
  var tax_amount = cost * 0.07;
  var total_amount = cost + tax_amount;
  var sql =
    "INSERT INTO billing (bill_id, bill_status, amount_balance, total_amount, tax_amount) VALUES (?, ?, ?, ?, ?)";
  db.query(
    sql,
    [id, "pending", cost, total_amount, tax_amount],
    (err, result) => {
      if (!err) {
        return { message: "billed already" };
        //res.redirect(201, '/');
      } else {
        console.log(err);
        return { message: err };
      }
    }
  );

  var sql = "UPDATE customer \
    SET bill_id = ? \
    WHERE id_no = ?;";
  db.query(sql, [id, id_no], (err, result) => {
    if (!err) {
      console.log({ message: "update customer bill_id already" });
      //res.send(201, { message: "booked already" });
      //res.redirect(201, '/');
    } else {
      console.log(err);
      //res.send(500, err);
    }
  });
}

module.exports = {
  router,
  createBill,
};
