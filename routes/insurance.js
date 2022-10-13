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

router.post("/add", userMiddleware.isAdmin, async (req, res) => {
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
    return 0;
  }
  queryDB(
    "INSERT INTO insurance (in_id, name,  info, class, cost) \
        VALUES(?, ?, ?, ?, ?)",
    [id, name, info, insu_class, cost],
    (err) => {
      console.log(err);
      res.send(500, { response: err });
    },
    () => {
      res.send(201, { response: "Created insurance already" });
      //res.redirect(201, '/');
    }
  );
});

router.put("/edit", userMiddleware.isAdmin, (req, res) => {
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
    return 0;
  }
  queryDB(
    "UPDATE insurance SET name = ? info = ? class = ? cost = ? where in_id = ?",
    [name, info, insu_class, cost, id],
    (err) => {
      res.send(500, { message: err });
    },
    () => {
      res.send(200, { message: "update insurance already" });
    }
  );
});

module.exports = router;
