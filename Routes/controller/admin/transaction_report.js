var config = require('../../../config/config');
var connection = require('../../../config/db');
var jwt = require('jsonwebtoken');
var mysql =  require("mysql");
//var Hashids = require('hashids')
//var hashSalt = new Hashids('Fuleex forget password');
//var useragent = require('useragent');
//var device = require('express-device');
//var nodemailer = require('nodemailer');
//var speakeasy = require('speakeasy');
//var QRCode = require('qrcode');
var moment = require('moment');
//var transporter = nodemailer.createTransport({
//    host: 'smtp.zoho.com',
//    port: 465,
//    secure: true, // secure:true for port 465, secure:false for port 587
//    auth: {
//        user: config.email,
//        pass: config.password
//    }
//});
var date = new Date();

var created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");


exports.transactionReportAdmin = function (req, res) {
   
    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var exportAs = req.body.exportAs;
    var type = req.body.type;
    var trade_type = req.body.trade_type;
    var customer_id = req.body.customer_id;
    var status = req.body.status;
    var pair_id = req.body.pair_id;
    var fromDate = req.body.date_from;
    var toDate = req.body.date_to;
    var searchQuery = '';
    var LIMIT = '';
    if (typeof type !== 'undefined' && type) {
        searchQuery += " AND tm.type LIKE '%" + type + "%' ";
    }
    if (typeof trade_type !== '' && trade_type) {
        searchQuery += " AND tm.trade_type LIKE '%" + trade_type + "%' ";
    }   
    if (typeof customer_id !== 'undefined' && customer_id !== null && customer_id) {
        searchQuery += " AND tm.customer_id = " + customer_id;
    }
    if (typeof status !== 'undefined' && status !== null && status) {
        searchQuery += " AND tm.status LIKE '%" + status + "%' ";
    }

    if (typeof pair_id !== 'undefined' && pair_id !== null && pair_id) {
        searchQuery += " AND tm.pair_id=" + pair_id + "";
    }

    if (typeof fromDate !== 'undefined' && fromDate !== null && fromDate && typeof toDate !== 'undefined' && toDate !== null && toDate) {
        searchQuery += " AND tm.created_at >= '"+ fromDate + "' AND  tm.created_at <= '" + toDate + "'";
    }
    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + offset + ", " + limit;
    }

    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
       searchQuery += " ORDER BY tm.id desc ";
    }
// SELECT IF(cm.type='0', FORMAT(tm.quantity*tm.price, 2), FORMAT(tm.quantity*tm.price, 8)) as total_price, tm.*, cu.fullname, cu.email, CONCAT(pm.from, '/', pm.to)AS currency, @count:=@count+1 AS serial_number FROM customer as cu RIGHT JOIN transaction tm ON cu.id = tm.customer_id LEFT JOIN pair_master pm ON pm.id = tm.pair_id LEFT JOIN currency_master cm ON cm.currency_code=pm.to, (SELECT @count:=0) AS count WHERE cu.status!=2 LIMIT 0, 25

// "SELECT IF(cm.type='0', FORMAT(tm.quantity*tm.price, 2), FORMAT(tm.quantity*tm.price, 8)) as total_price, tm.*, cu.fullname, cu.email, CONCAT(pm.from, '/', pm.to)AS currency, @count:=@count+1 AS serial_number FROM customer as cu RIGHT JOIN transaction tm ON cu.id = tm.customer_id LEFT JOIN pair_master pm ON pm.id = tm.pair_id LEFT JOIN currency_master cm ON cm.currency_code=pm.to, (SELECT @count:=" + offset + ") AS count WHERE cu.status!=2" + searchQuery + LIMIT 

    // var query = connection.query("SELECT  tm.*, cu.fullname, cu.email, CONCAT(pm.from, ' / ', pm.to)AS currency, @count:=@count+1 AS serial_number FROM customer as cu RIGHT JOIN transaction_master tm ON cu.id = tm.customer_id LEFT JOIN pair_master pm ON pm.id = tm.pair_id, (SELECT @count:=" + offset + ") AS count  WHERE  cu.status!=2 " + searchQuery + LIMIT, function (error, data) {
    var query = connection.query("SELECT @count:=@count+1 AS serial_number, IF(cm.type='0', FORMAT(tm.quantity*tm.price, 4), FORMAT(tm.quantity*tm.price, 8)) as total_amount, tm.*, cu.fullname, cu.email, CONCAT(pm.from, '/', pm.to)AS currency FROM customer as cu RIGHT JOIN transaction tm ON cu.id = tm.customer_id LEFT JOIN pair_master pm ON pm.id = tm.pair_id LEFT JOIN currency_master cm ON cm.currency_code=pm.to, (SELECT @count:=" + offset + ") AS count WHERE cu.status!=2" + searchQuery + LIMIT, function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
//            console.log(query.sql);
            var q1 = connection.query("SELECT count(*) as count  FROM  customer cu RIGHT JOIN transaction_master tm ON cu.id = tm.customer_id WHERE cu.status!=2 " + searchQuery, function (error, data1) {
                var result = {'totalRecords': data1, 'records': data};


                res.json({"success": true, "message": "Transation List", result});
            });
        }
    })
  
}

exports.transactionReportCustomerAdmin = function (req, res){

   var sql = "SELECT cu.fullname, cu.email, cu.id FROM customer as cu RIGHT JOIN transaction_master as tm ON cu.id=tm.customer_id WHERE cu.status!=2 GROUP BY cu.id";
   var value = mysql.format(sql);
   var query =  connection.query(sql, function(error, result){

        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {

            res.json({"success": true, "message": "Customer List", result});
        }

    });
   
}

exports.marketCurrencypairadmin = function(req, res){

    // console.log("this is a pair");

    var sql = "SELECT CONCAT(pm.from, '/', pm.to) AS pair, pm.id from pair_master as pm RIGHT JOIN transaction_master tm on tm.pair_id = pm.id WHERE pm.status!=2 GROUP BY tm.pair_id";
    var value = mysql.format(sql);
    var query = connection.query(sql, function(error, result){
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {

            res.json({"success": true, "message": "Pair List", result});
        }

    })

}