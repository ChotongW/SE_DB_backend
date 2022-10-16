const express = require("express");
const bodyParser = require("body-parser");
const queryDB = require("../config/db");
const userMiddleware = require("../middleware/role");
const payment = require("../routes/payment");
const mongo = require("../config/mongo");
var uuid = require("uuid");

router = express.Router();
router.use(express.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

router.get("/summary", async (req, res) => {
  await redis.connect();
  try {
    let id = await redis.get("id");
    let vehicle_id = await redis.get("vehicle_id");
    let start_date = await redis.get("start_date");
    let end_date = await redis.get("end_date");
    let in_id = await redis.get("in_id");

    result = {
      id: id,
      carId: vehicle_id,
      bookDate: start_date,
      returnDate: end_date,
      in_id: in_id,
    };
    console.log(result);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.send({ message: error });
  }
  await redis.disconnect();
});

router.post("/summary/add", async (req, res) => {
  let id = req.userData.id;
  let vehicle_id = req.body.carId;
  let start_date = req.body.bookDate;
  let end_date = req.body.returnDate;
  let in_id = req.body.insuranceId;
  await redis.connect();

  try {
    await redis.set("id", id);
    await redis.set("vehicle_id", vehicle_id);
    await redis.set("start_date", start_date);
    await redis.set("end_date", end_date);
    await redis.set("in_id", in_id);

    res.send({ message: "post already" });
  } catch (error) {
    console.log(error);
    res.send({ message: error });
  }
  await redis.disconnect();
});

const doInsertBooking = async (req, res) => {
  let vehicle_id = req.body.carId;
  let start_date = req.body.bookDate;
  let end_date = req.body.returnDate;
  let insurance = req.body.insuranceId;
  let id_no = req.userData.id;
  var id = uuid.v4();

  if (insurance === "") {
    insurance = null;
  }

  var sql =
    "INSERT INTO booking (book_id, vehicle_id, id_no, in_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
  try {
    var result = await queryDB(sql, [
      id,
      vehicle_id,
      id_no,
      insurance,
      start_date,
      end_date,
      "current",
    ]);
    res.send(201, { message: "booked already" });
  } catch (err) {
    console.log(err);
    res.send(err, 500);
    return;
  }

  var sql = "UPDATE vehicles SET availability = ? where vehicle_id = ?";
  try {
    var result = await queryDB(sql, [0, vehicle_id]);
    console.log({ message: "update vehicles availability already" });
  } catch (err) {
    console.log(err);
    return;
  }

  var sql = "SELECT cost from insurance where in_id = ?";
  try {
    var result = await queryDB(sql, [0, vehicle_id]);
    console.log({ message: "update vehicles availability already" });
  } catch (err) {
    console.log(err);
    return;
  }

  var sql = "SELECT cost FROM vehicles WHERE vehicle_id = ?";
  try {
    var result = await queryDB(sql, vehicle_id);
    var cost = result[0].cost;
    var diffDays =
      parseInt(end_date.split("-")[2], 10) -
      parseInt(start_date.split("-")[2], 10);
    var total_amount = diffDays * cost;
    //console.log(total_amount);
    const response = payment.createBill(total_amount, id_no, id);
    console.log(response);
  } catch (err) {
    console.log(err);
    return;
  }

  var sql = "UPDATE customer SET book_id = ? WHERE id_no = ?;";
  try {
    var result = await queryDB(sql, [id, id_no]);
    console.log({ message: "update customer book_id already" });
  } catch (err) {
    console.log(err);
    return;
  }
};

router.post("/book", userMiddleware.isLoggedIn, async (req, res) => {
  let vehicle_id = req.body.carId;

  var sql = "SELECT availability FROM vehicles WHERE vehicle_id = ?";
  try {
    var result = await queryDB(sql, vehicle_id);
    // if success does below
    let availability = result[0].availability;
    if (availability === 0) {
      res.send({ message: "this car is booked already" }, 400);
    } else {
      doInsertBooking(req, res);
    }
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
  }
});

const doReturn = async (vehicle_id, res) => {
  var sql = "UPDATE vehicles SET availability = ? where vehicle_id = ?";
  try {
    var result = await queryDB(sql, [1, vehicle_id]);
    res.send(200, { message: "return car already" });
    // if success does below
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }

  var sql = "UPDATE booking SET status = ? where vehicle_id = ?";
  try {
    var result2 = await queryDB(sql, ["finished", vehicle_id]);
    console.log({ message: "update status finished booking already" });
    // if success does below
  } catch (err) {
    console.log(err);
    //res.send(500, { message: err });
    return;
  }
};

router.put("/return", userMiddleware.isLoggedIn, async (req, res) => {
  let book_id = req.body.bookId;

  var sql = "SELECT bill_status from billing where book_id = ?";
  try {
    var result = await queryDB(sql, book_id);
    // if success does below
    let bill_status = result[0].bill_status;
    if (
      bill_status == "pending" ||
      bill_status == "verification" ||
      bill_status == null
    ) {
      res.send(400, { message: "please pay bill before returning car." });
      return;
    }
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }

  var sql = "SELECT vehicle_id from booking where book_id = ?";
  try {
    var result = await queryDB(sql, book_id);
    // if success does below
    doReturn(result[0].vehicle_id, res);
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }
});

module.exports = router;
