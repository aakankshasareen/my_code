var request = require('request')
var mysql = require('mysql');
var connection = require('../../../config/db');
var config = require('../../../config/config');
var path = require('path')
var nodemailer = require('nodemailer');
var async = require('async');

exports.getAllCustomerNotification = function (req, res) {
    var customer_id = req.decoded.customer_id;    
    var query = connection.query("SELECT * FROM customer_notifications where customer_id = "+customer_id+" order by id desc limit 100", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            var sql = "SELECT notification_count FROM customer where id = "+customer_id;            
            var query = connection.query(sql, function (error, count) {
            if (error) {                
                res.json({"success": false, "message": "error", error});
            } else {
                console.log(count);
                //data.push({notify_data:}) ;
                res.json({"success": true, "message": "Notifications", data, "notify_data": count[0].notification_count});
            }
            });
            
        }
    });
}


exports.getAllCustomerNotificationList = function (req, res) {
    var customer_id = req.decoded.customer_id;    
    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var name = req.body.name;
    var title = req.body.title;    
    var is_read = req.body.is_read;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var order_column_alias = req.body.order_column_alias == null ? '' : req.body.order_column_alias;
    var searchQuery = '';

    if (typeof title !== 'undefined' && title) {
        searchQuery += " AND cy.title LIKE '%" + title + "%' ";
    }
    
    if (typeof is_read !== 'undefined' && is_read !== null) {
        searchQuery += " AND cy.is_read = " + is_read;
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column_alias + order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY cy.id DESC";
    }

//    if (filter_value != '') {
//        searchQuery = " AND (cy.name LIKE '%" + filter_value + "%' )";
//    }
    // var query = connection.query("SELECT cy.*, @count:=@count+1 AS serial_number FROM customer_notifications cy, (SELECT @count:="+offset+") AS X where 1 AND customer_id = " +customer_id + ""+ searchQuery + "  LIMIT " + offset + ", " + limit, function (error, data) {
    var query = connection.query("SELECT cy.*, @count:=@count+1 AS serial_number FROM customer_notifications cy, (SELECT @count:="+offset+") AS X where 1 AND customer_id = " +customer_id + " "+ searchQuery , function (error, data) {
        
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            // console.log(query.sql);
            connection.query("SELECT count(*) as count FROM customer_notifications cy  where 1 AND customer_id = "+ customer_id + " " + searchQuery, function (error, data1) {
                var result = {'totalRecords': data1, 'records': data};
                res.json({"success": true, "message": "Notification List", result});
            });
        }
    })
}


exports.resetCustomerNotification = function (req, res) {
    var customer_id = req.decoded.customer_id;
    var query = connection.query("update customer set notification_count =0 where id = ?", [customer_id], function (error, data) {
    if (error) {
        res.json({"success": false, "message": "error", error});
    } else {            
            res.json({"success": true, "message": "Reset Success" });
        }    
    });
}

exports.markNotificationRead = function (req, res) {
    var notify_id = req.body.notify_id;
    var query = connection.query("update customer_notifications set is_read = 1 where id = ?", [notify_id], function (error, data) {
    if (error) {
        res.json({"success": false, "message": "error", error});
    } else {            
            res.json({"success": true, "message": "Reset Success" });
        }    
    });
}

const io = require('../../../socket.js').io()

exports.getLiveCustomers = (req, res)=>{
  res.json({success: true, liveUsers: io.totalLiveUsers?io.totalLiveUsers:0})
}