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
        searchQuery += " AND id = " + customer_id;
    }
    if (typeof req.body.fullname !== 'undefined' && req.body.fullname !== null && req.body.fullname) {
        searchQuery += " AND fullname LIKE '%" + req.body.fullname + "%'";
    }
    if (typeof req.body.email !== 'undefined' && req.body.email !== null && req.body.email) {
        searchQuery += " AND email LIKE '%" + req.body.email + "%'";
    }
    if (typeof req.body.emailVerify !== 'undefined' && req.body.emailVerify !== null && req.body.emailVerify) {
         searchQuery += " AND emailVerify = " + req.body.emailVerify;
     }
    if (typeof kyc_status !== 'undefined' && kyc_status !== null && kyc_status==0) {
        
        searchQuery += " AND kyc_status=" + kyc_status ;
    }

    if (typeof fromDate !== 'undefined' && fromDate !== null && fromDate && typeof toDate !== 'undefined' && toDate !== null && toDate) {
        searchQuery += " AND created_at >= '"+ fromDate + "' AND  created_at <= '" + toDate + "'";
    }
    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + offset + ", " + limit;
    }

    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
//        searchQuery += " ORDER BY tl.id desc ";
    }

   var query = connection.query("SELECT id, created_at, fullname, email, emailVerify, kyc_status, status, @count:=@count+1 AS serial_number FROM customer , (SELECT @count:=" + offset + ") AS count  WHERE  status!=2 " + searchQuery + LIMIT, function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
//            console.log(query.sql);
            var q1 = connection.query("SELECT count(*) as count  FROM  customer  WHERE status!=2 " + searchQuery + LIMIT, function (error, data1) {
                var result = {'totalRecords': data1, 'records': data};
                res.json({"success": true, "message": "Transation List", result});
            });
        }
    })
    //console.log("queryquery");
    //console.log(query); 
}



