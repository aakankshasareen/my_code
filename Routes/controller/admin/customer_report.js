var config = require('../../../config/config');
var connection = require('../../../config/db');
var jwt = require('jsonwebtoken');
var mysql =  require("mysql");
//var Hashids = require('hashids')
//var hashSalt = new Hashids('Exchange forget password');
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

exports.customerReportAdmin = function (req, res) {

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var exportAs = req.body.exportAs;
    var kyc_status = req.body.kyc_status;
    var customer_id = req.body.customer_id;
    var fromDate = req.body.date_from;
    var toDate = req.body.date_to;
    var searchQuery = '';
    var LIMIT = '';

    if (typeof customer_id !== 'undefined' && customer_id !== null && customer_id) {
        searchQuery += " AND c.id = " + customer_id;
    }
    if (typeof kyc_status !== 'undefined' && kyc_status !== null) {
        searchQuery += " AND c.kyc_status=" + kyc_status ;
        console.log('kyc status is .......',req.body.kyc_status)
    }
    else
    {
        console.log('not printed kyc status.......',req.body.kyc_status)
    }

    if (typeof pair_id !== 'undefined' && pair_id !== null && pair_id) {
        searchQuery += " AND tm.pair_id=" + pair_id + "";
    }

    if (typeof fromDate !== 'undefined' && fromDate !== null && typeof toDate !== 'undefined' && toDate !== null ) {
        searchQuery += " AND c.created_at >= '"+ fromDate + "' AND  c.created_at <= '" + toDate + "'";
        console.log('dates are ',fromDate, toDate)
    }
    else
    {
        console.log('hawwwwwwwwwww.dates are ',fromDate, toDate)
    }
    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + offset + ", " + limit;
    }
    if (typeof req.body.email !== 'undefined' && req.body.email !== null && req.body.email) {
        searchQuery += " AND c.email LIKE '%" +req.body.email+"%'";
    }

    if (typeof req.body.fullname !== 'undefined' && req.body.fullname !== null && req.body.fullname) {
        searchQuery += " AND c.fullname LIKE '%" +req.body.fullname +"%'";
    }

    

    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY c." + order_column + " " + order_direction
    } else {
//        searchQuery += " ORDER BY tl.id desc ";
    }

    var query = connection.query("SELECT  c.*, ck.verified_at, uca.crypto_address as btc_address, @count:=@count+1 AS serial_number FROM customer c JOIN user u on c.id = u.type_id AND u.user_type = 'C' LEFT JOIN user_crypto_address uca ON uca.user_id = u.id AND uca.crypto_type = 'BTC' LEFT JOIN customer_kyc ck ON c.id = ck.customer_id, (SELECT @count:=" + offset + ") AS count  WHERE  c.status!=2 " + searchQuery + LIMIT, function (error, data) {
        if (error) {
           console.log(query.sql);
            res.json({"success": false, "message": "error", error});
        } else {
           console.log(query.sql);
            var q1 = connection.query("SELECT count(*) as count  FROM  customer c JOIN user u on c.id = u.type_id AND u.user_type = 'C' LEFT JOIN user_crypto_address uca ON uca.user_id = u.id AND uca.crypto_type = 'BTC' WHERE c.status!=2 " + searchQuery, function (error, data1) {
                if(error){
                     res.json({"success": false, "message": "error", error});
                } else {
               // console.log(q1.sql);
                    var result = {'totalRecords': data1, 'records': data};
                    res.json({"success": true, "message": "Transation List", result});
                }
            });
        }
    })
   
}
