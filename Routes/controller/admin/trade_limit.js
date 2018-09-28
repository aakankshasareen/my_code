var config = require('../../../config/config');
var connection = require('../../../config/db');
var jwt = require('jsonwebtoken');
var cm_helper = require('./common_helper');
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

exports.getTradeLimitByCurrencyCode = function(req, res) {
    var currency_code = req.params.currency_code;
    var query = connection.query("SELECT id, operation, currency_code, min_amount, max_amount, daily_max_amount FROM trade_limit WHERE currency_code = ? AND status=1", [currency_code], function(error, data) {
        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else {

            res.json({ "success": true, "message": currency_code + " Currency Trade Limit", data });

        }
    });
};

exports.updateTradeLimit = function(req, res) {
    // console.log("old value",req.body.old_column_value)
    // console.log("call in update api")
    var currency_code = req.body.currency_code;
    var column_name = req.body.column_name;
    var column_value = req.body.column_value;
    var operation = req.body.operation;
    var old_column_value=req.body.old_column_value;

    let allowedColumns = ['min_amount', 'max_amount', 'daily_max_amount'];

    if (!allowedColumns.includes(column_name)) {
        res.status(400).send({ status: -2, message: 'invalid column' })
    } else {
        var query = connection.query("UPDATE trade_limit SET " + column_name + " = " + column_value + ", `updated_at` = '" + created_at + "', `updated_by` = " + req.decoded.id + "  WHERE currency_code ='" + currency_code + "' AND operation = '" + operation + "'", [currency_code], function(error, data) {
            if (error) {
                // console.log("error",error)
                res.json({ "success": false, "message": "error", error });
            } else {
                //console.log(old_column_value)
                cm_helper.log('','Update trade limit',operation,old_column_value,column_value,column_name,currency_code,req.decoded.id,req.decoded.email,'','').then(function(result) {
                    
                    res.json({ "success": true, "message": "Trade Limit Updated Successfully", data });
                }).catch(function(err) {
                    res.json({ "success": false, "message": "error", error });
                })
            }
        });
    }
};

// exports.getTradeLimits = function (req, res) {

//     var query = connection.query("SELECT tl.*, cm.symbol FROM currency_master cm LEFT JOIN trade_limit tl ON cm.currency_code = tl.currency_code WHERE cm.status=1", function (error, data) {
//         if (error) {
//             res.json({"success": false, "message": "error", error});
//         } else {
//             res.json({"success": true, "message": " Trade Limit List", data});
//         }
//     });
// };

exports.getTradeLimits = function(req, res) {

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var exportAs = req.body.exportAs;
    var currency_code = req.body.currency_code;
    var operation = req.body.operation;
    var min_amount = req.body.min_amount;
    var max_amount = req.body.max_amount;
    let daily_max_amount = req.body.daily_max_amount;
    var searchQuery = '';
    var LIMIT = '';
    if (typeof currency_code !== 'undefined' && currency_code) {
        searchQuery += " AND cm.currency_code LIKE '%" + currency_code + "%' ";
    }
    if (typeof operation !== '' && operation) {
        searchQuery += " AND tl.operation LIKE '%" + operation + "%' ";
    }
    if (typeof min_amount !== 'undefined' && min_amount !== null) {
        searchQuery += " AND tl.min_amount = " + min_amount;
    }
    if (typeof max_amount !== 'undefined' && max_amount !== null) {
        searchQuery += " AND tl.max_amount = " + max_amount;
    }
    if (typeof daily_max_amount !== 'undefined' && daily_max_amount !== null) {
        searchQuery += " AND tl.daily_max_amount = " + daily_max_amount;
    }
    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + offset + ", " + limit;
    }

    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
        //        searchQuery += " ORDER BY tl.id desc ";
    }

    var query = connection.query("SELECT  tl.*, cm.currency_icon, @count:=@count+1 AS serial_number FROM currency_master cm LEFT JOIN trade_limit tl ON cm.currency_code = tl.currency_code,(SELECT @count:=" + offset + ") AS count WHERE tl.id NOT IN ( SELECT tl2.id from commission tl2 left join currency_master cm2 on cm2.currency_code = tl2.currency_code where cm2.type=1 and tl2.operation = 'Deposit') AND cm.status=1  " + searchQuery + LIMIT, function(error, data) {
        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else {
            console.log(query.sql);
            var q1 = connection.query("SELECT count(*) as count  FROM  currency_master cm LEFT JOIN trade_limit tl ON cm.currency_code = tl.currency_code WHERE tl.id NOT IN ( SELECT tl2.id from commission tl2 left join currency_master cm2 on cm2.currency_code = tl2.currency_code where cm2.type=1 and tl2.operation = 'Deposit') AND cm.status=1 " + searchQuery, function(error, data1) {
                var result = { 'totalRecords': data1, 'records': data };
                res.json({ "success": true, "message": "Commissions List", result });
            });
        }
    })
}