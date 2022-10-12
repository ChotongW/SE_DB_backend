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

// const queryDB = (sql, params, doErr, doSucc) => {
//   db.query(sql, params, (err, result) => {
//     if (!err) {
//       doSucc(result);
//     } else {
//       doErr(err);
//     }
//   });
// };

const doInsertBooking = (req) => {
  let vehicle_id = req.body.carId;
  let start_date = req.body.bookDate;
  let end_date = req.body.returnDate;
  let insurance = req.body.insuranceId;
  let id_no = req.body.id;
  var id = uuid.v4();

  queryDB(
    "INSERT INTO booking (book_id, vehicle_id, id_no, in_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, vehicle_id, id_no, insurance, start_date, end_date, "current"],
    (err) => {
      console.log(err);
      res.send(500, err);
    },
    () => {
      res.send(201, { message: "booked already" });
      //res.redirect(201, '/');
    }
  );

  queryDB(
    "UPDATE vehicles SET availability = ? where vehicle_id = ?",
    [0, vehicle_id],
    (err) => {
      console.log(err);
    },
    () => {
      console.log({ message: "update already" });
    }
  );

  queryDB(
    "SELECT cost FROM vehicles WHERE vehicle_id = ?",
    vehicle_id,
    (err) => {
      console.log(err);
    },
    (result) => {
      var cost = result[0].cost;
      var diffDays =
        parseInt(end_date.split("-")[2], 10) -
        parseInt(start_date.split("-")[2], 10);
      var total_amount = diffDays * cost;
      //console.log(total_amount);
      const response = payment.createBill(total_amount, id_no);
      //console.log("complete");
    }
  );
};

router.post("/book", userMiddleware.isLoggedIn, (req, res) => {
  let vehicle_id = req.body.carId;

  queryDB(
    "SELECT availability FROM vehicles WHERE vehicle_id = ?",
    vehicle_id,
    (err) => {
      // if error does below
      console.log(err);
      res.send(500, { message: err });
    },
    (result) => {
      // if success does below
      let availability = result[0].availability;
      if (availability === 0) {
        res.send({ message: "this car is booked already" });
      } else {
        doInsertBooking(req);
      }
    }
  );
});

router.put("/return", userMiddleware.isLoggedIn, (req, res) => {
  let vehicle_id = req.body.carId;

  queryDB(
    "UPDATE vehicles SET availability = ? where vehicle_id = ?",
    [1, vehicle_id],
    (err) => {
      res.send(500, { message: err });
    },
    () => {
      queryDB(
        "UPDATE booking SET status = ? where vehicle_id = ?",
        ["finished", vehicle_id],
        (err) => {
          // if error does below
          console.log(err);
        },
        () => {
          console.log({ message: "update status finished booking already" });
        }
      );
      res.send(200, { message: "return car already" });
    }
  );
});

module.exports = router;
