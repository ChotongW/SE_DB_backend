const express = require("express");
const bodyParser = require("body-parser");
const queryDB = require("../config/db");
const upload = require("../storage/multer");
const blob = require("../storage/blobPayment");
const userMiddleware = require("../middleware/role");
const fs = require("fs");
var uuid = require("uuid");

router = express.Router();
router.use(express.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

router.get("/admin", userMiddleware.isAdmin, async (req, res) => {
  //let vehicle_id = req.query.vehicleId;
  //console.log(vehicle_id);
  var sql = "SELECT * FROM billing WHERE bill_status = ?";
  try {
    var result = await queryDB(sql, "verification");
    res.send(result);
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }
});

router.put(
  "/",
  userMiddleware.isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    let slip = req.file;
    let id = req.userData.id;

    var sql = "SELECT book_id FROM customer WHERE id_no = ?;";
    try {
      var result = await queryDB(sql, id);
    } catch (err) {
      console.log(err);
      res.send(err, 500);
      return;
    }
    let book_id = result[0].book_id;
    //let booking_status = req.booking_status;
    if (slip == null) {
      res.send(
        {
          status: "incompleted",
          message: "You should upload payment slip.",
        },
        400
      );
      return;
    }
    try {
      var callback = await blob.payment_upload(slip);
      console.log(callback);
      //res.send('File uploaded successfully');
      console.log("File uploaded successfully");
    } catch (error) {
      console.log(error);
      res.status(500).send("Failure uploading");
      return;
    }
    fs.unlink(slip.path, (err) => {
      if (err) throw err;
      // if no error, file has been deleted successfully
      console.log("Local file deleted!");
    });
    var sql = "UPDATE billing SET slip = ?, bill_status = ? WHERE book_id = ?;";
    try {
      var result = await queryDB(sql, [callback, "verification", book_id]);
      res.send(201, { response: "upload slip already" });
    } catch (err) {
      console.log(err);
      res.send(500, { message: err });
      return;
    }
  }
);

router.put("/admin/approve", userMiddleware.isAdmin, async (req, res) => {
  let bill_id = req.body.bill_id;
  //let booking_status = req.booking_status;
  if (bill_id == null) {
    res.send(
      {
        status: "incompleted",
        message: "No bill found or bill id is null.",
      },
      400
    );
    return;
  }
  var sql = "UPDATE billing SET bill_status = ? WHERE bill_id = ?;";
  try {
    var result = await queryDB(sql, ["complete", bill_id]);
    res.send(201, { response: "bill update already" });
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }
});

async function createBill(
  amount_balance,
  tax_amount,
  total_amount,
  id_no,
  book_id
) {
  var id = uuid.v4();

  if (
    id_no == null ||
    amount_balance == null ||
    tax_amount == null ||
    total_amount == null ||
    book_id == null
  ) {
    console.log({ message: "parameters is undefine, create bill failed." });
    return { message: "parameters is undefine, create bill failed." };
  }

  var sql =
    "INSERT INTO billing (bill_id, bill_status, book_id, amount_balance, total_amount, tax_amount) VALUES (?, ?, ?, ?, ?, ?)";
  try {
    var result = await queryDB(sql, [
      id,
      "pending",
      book_id,
      amount_balance,
      total_amount,
      tax_amount,
    ]);
    //console.log({ message: "billed already" });
    return { message: "billed already" };
  } catch (err) {
    //console.log(err);
    return err;
  }
}

module.exports = {
  router,
  createBill,
};
