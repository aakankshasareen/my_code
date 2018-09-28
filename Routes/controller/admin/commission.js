var config = require('../../../config/config');
var connection = require('../../../config/db');
var jwt = require('jsonwebtoken');
var cm_helper = require('./common_helper');
//var Hashids = require('hashids')
//var hashSalt = new Hashids('TECHCOIN forget password');
//var useragent = require('useragent');
//var device = require('express-device');
//var nodemailer = require('nodemailer');
//var speakeasy = require('speakeasy');
//var QRCode = require('qrcode');
var moment = require('moment');
var mysql = require('mysql');
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
exports.getCommissionByCurrencyCode = function (req, res) {
    var currency_code = req.params.currency_code;
    var query = connection.query("SELECT id, operation, currency_code, min_percentage, max_percentage, min_amount FROM commission WHERE currency_code = ? AND status=1", [currency_code], function (error, data) {
       console.log(query)
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": currency_code + " Currency Commission", data});
        }
    });
};
exports.updateCommission = function (req, res) {
    var currency_code = req.body.currency_code;
    var column_name = req.body.column_name;
    var column_value = req.body.column_value;
    var operation = req.body.operation;
     var old_column_value=req.body.old_column_value;

    let allowedColumns = ['min_percentage', 'max_percentage', 'min_amount']
    if(!allowedColumns.includes(column_name)){
      res.status(400).send({status: -2, message: 'invalid column'})
    } else {
      var query = connection.query("UPDATE commission SET " + column_name + " = " + column_value + ", `updated_at` = '" + created_at + "', `updated_by` = " + req.decoded.id + "  WHERE currency_code ='" + currency_code + "' AND operation = '" + operation + "'", [currency_code], function (error, data) {
          if (error) {
              res.json({"success": false, "message": "error", error});
          } else {
            cm_helper.log('','Update trade commission',operation,old_column_value,column_value,column_name,currency_code,req.decoded.id,req.decoded.email,'','').then(function(result) {
                    
              res.json({"success": true, "message": "Commission Updated Successfully", data});
              }).catch(function(err) {
                    res.json({ "success": false, "message": "error", error });
                })
          }
      });
    }
};
//exports.getCommissions = function (req, res) {
//    var query = connection.query("SELECT c.*, cm.symbol FROM currency_master cm LEFT JOIN commission c ON c.currency_code = cm.currency_code WHERE cm.status=1", function (error, data) {
//        if (error) {
//            res.json({"success": false, "message": "error", error});
//        } else {
//            res.json({"success": true, "message": " Commissions List", data});
//        }
//    });
//};

exports.getCommissions = function (req, res) {

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var exportAs = req.body.exportAs;
    var currency_code = req.body.currency_code;
    var operation = req.body.operation;
    var min_percentage = req.body.min_percentage;
    var max_percentage = req.body.max_percentage;
    var min_amount = req.body.min_amount;
    var searchQuery = '';
    var LIMIT = '';

    if (isNaN(offset) && isNaN(limit)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (min_amount && isNaN(min_amount)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (min_percentage && isNaN(min_percentage)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (max_percentage && isNaN(max_percentage)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (typeof currency_code !== 'undefined' && currency_code) {
        searchQuery += " AND c.currency_code LIKE " + mysql.escape('%' + currency_code + '%') + "";
    }
    if (typeof operation !== '' && operation) {
        searchQuery += " AND c.operation LIKE " + mysql.escape('%' + operation + '%') + "";
    }
    if (typeof min_percentage !== 'undefined' && min_percentage) {
        searchQuery += " AND c.min_percentage LIKE " + mysql.escape('%' + min_percentage + '%') + "";
    }
    if (typeof max_percentage !== 'undefined' && max_percentage !== null) {
        searchQuery += " AND c.max_percentage LIKE " + mysql.escape('%' + max_percentage + '%') + "";
    }
    if (typeof min_amount !== 'undefined' && min_amount !== null) {
        searchQuery += " AND c.min_amount = " + mysql.escape(min_amount);
    }

    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = "LIMIT " + mysql.escape(offset) + ", " + mysql.escape(limit);
    }

    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
//        searchQuery += " ORDER BY c.id desc ";
    }
    console.log("checking query for commission", "SELECT  c.*, cm.currency_icon, @count:=@count+1 AS serial_number FROM commission c  LEFT JOIN currency_master cm ON c.currency_code = cm.currency_code ,(SELECT @count:=" + offset + ") AS count  WHERE c.id NOT IN ( SELECT c2.id from commission c2 left join currency_master cm2 on cm2.currency_code = c2.currency_code where cm2.type=1 and c2.operation = 'Deposit') AND c.status=1 AND cm.status = 1  " + searchQuery + LIMIT);
    
    var query = connection.query("SELECT  c.*, cm.currency_icon, @count:=@count+1 AS serial_number FROM commission c  LEFT JOIN currency_master cm ON c.currency_code = cm.currency_code ,(SELECT @count:=" + offset + ") AS count  WHERE c.id NOT IN ( SELECT c2.id from commission c2 left join currency_master cm2 on cm2.currency_code = c2.currency_code where cm2.type=1 and c2.operation = 'Deposit') AND c.status=1 AND cm.status = 1  " + searchQuery + LIMIT, function (error, data) {
        //console.log("result of query 1", data);
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
//            console.log(query.sql);
            var q1 = connection.query("SELECT count(*) as count  FROM currency_master cm LEFT JOIN commission c ON c.currency_code = cm.currency_code WHERE c.status=1 AND cm.status=1 AND c.id NOT IN ( SELECT c2.id from commission c2 left join currency_master cm2 on cm2.currency_code = c2.currency_code where cm2.type=1 and c2.operation = 'Deposit')" + searchQuery, function (error, data1) {
                //console.log("result of query 2", "SELECT count(*) as count  FROM currency_master cm LEFT JOIN commission c ON c.currency_code = cm.currency_code WHERE c.status=1 AND cm.status=1 AND c.id NOT IN ( SELECT c2.id from commission c2 left join currency_master cm2 on cm2.currency_code = c2.currency_code where cm2.type=1 and c2.operation = 'Deposit')" + searchQuery);
                //console.log("result of query 2", data1);
                var result = {'totalRecords': data1, 'records': data};
                res.json({"success": true, "message": "Commissions List", result});
            });

        }
    })
}

