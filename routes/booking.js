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
    let start_date = req.body.bookDate;
    let end_date = req.body.returnDate;
    let insurance = req.body.insuranceId;
    let id_no = req.body.id;
    var id = uuid.v4()

    var sql = "SELECT availability FROM vehicles WHERE vehicle_id = ?";
    db.query(sql, vehicle_id, (err, result) => {
        if (!err) {
        var availability = result[0].availability;
        
            if (availability === 0) {
                res.send({message: 'this car is booked already'});

                } else {
                    var sql = "INSERT INTO booking (book_id, vehicle_id, id_no, in_id, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)";
                    db.query(sql, [id, vehicle_id, id_no, insurance, start_date, end_date], (err, result) => {
                        if (!err) {
                        res.send(201,{message: 'booked already'});
                        //res.redirect(201, '/');
                        } else {
                        console.log(err);
                        res.send(500, err)}})
                    
                    var sql = "UPDATE vehicles SET availability = ? where vehicle_id = ?";
                    db.query(sql, [0, vehicle_id], (err, result) => {
                        if (!err) {
                            console.log({message: 'update already'});
                        } else {
                        console.log(err);}})
                    }
        } else {
            console.log(err);
            res.send(500, {message: err})}})
});

router.put('/return', (req, res) => {
    let vehicle_id = req.body.carId;

    var sql = "UPDATE vehicles SET availability = ? where vehicle_id = ?";
    db.query(sql, [1, vehicle_id], (err, result) => {
        if (!err) {
            var sql = "DELETE FROM booking WHERE vehicle_id = ?;";
            db.query(sql, [vehicle_id], (err, result) => {
                if (!err) {
                    console.log({message: 'delete booking already'});
                } else {
                    console.log(err);}})
            res.send(200,{message: 'return car already'});
        } else {
            res.send(500,{message: err})}});
});

module.exports = router;