const express = require('express');
const bodyParser = require("body-parser");
const db = require('../config/db');
const upload = require('../storage/multer');
const blob = require('../storage/blob');
const userMiddleware = require('../middleware/user');
var uuid = require('uuid');

router = express.Router()
router.use(express.json());
router.use(bodyParser.urlencoded({
    extended: true
 }));

router.post('/book', (req, res) => {
    let vehicle_id = req.body.carId;
    let period = req.body.period;
    let insurance = req.body.insuranceId;
    let id_no = req.body.id;
    var id = uuid.v4()

    var sql = "INSERT INTO booking (book_id, vehicle_id, id_no, in_id, period) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [id, vehicle_id, id_no, insurance, period], (err, result) => {
        if (!err) {
        res.send(201,'booked already');
        //res.redirect(201, '/');
        } else {
        console.log(err);
        res.send(500, err)}})
});

router.post('/return', (req, res) => {
    //console.log(uuid.v4());
    var id = uuid.v4()
    res.send(id);
});

module.exports = router;