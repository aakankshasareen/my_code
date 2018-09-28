var config = require('../../../config/config');
var connection = require('../../../config/db');
var jwt = require('jsonwebtoken');
var mysql = require('mysql');

exports.getTotalDepositAmount = function(req, res) {
    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;

    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var exportAs = req.body.exportAs;

    var searchQuery = '';
    var LIMIT = '';

    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
       searchQuery += " ORDER BY @count ASC";
    }

    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + offset + ", " + limit;
    }
    var query = connection.query("SELECT cd.currency_code, SUM(cd.amount) AS total_amount, (@count:=@count+1) AS serial_number FROM customer_deposite cd , (SELECT @count:="+offset+") AS X GROUP BY cd.currency_code" + searchQuery + LIMIT, function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            var q1 = connection.query("SELECT count(*) as count FROM ( SELECT count(*) FROM customer_deposite GROUP BY currency_code ) AS X " + searchQuery, function (error, data1) {
//                console.log(q1.sql);
                if(error){
                    res.json({"success": false, "message": "error", error});
                }else{
                   var result = {'totalRecords': data1, 'records': data};
                    res.json({"success": true, "result": result});
                }

            });
        }
    });
    // var query = connection.query("SELECT currency_code, SUM(amount) AS total_amount FROM customer_deposite GROUP BY currency_code ", function(error, data) {
    //     if (error) {
    //         res.json({ "success": false, "message": "error", error });
    //     } else {
    //         res.json({ "success": true, "data": data });
    //     }
    // });

};

exports.getTotalWithdrawAmount = function(req, res) {

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;

    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var exportAs = req.body.exportAs;

    var searchQuery = '';
    var LIMIT = '';


    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
        //searchQuery += " ORDER BY cd.id DESC";
    }

    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + offset + ", " + limit;
    }

    var query = connection.query("SELECT cw.currency_code, SUM(cw.amount) AS total_amount, @count:=@count+1 AS serial_number FROM customer_withdraw cw WHERE status = 1 GROUP BY currency_code" + searchQuery + LIMIT, function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
//            console.log(query.sql);
            var q1 = connection.query("SELECT count(*) as count FROM ( SELECT count(*) FROM customer_withdraw cw WHERE status = 1 GROUP BY currency_code ) AS X " + searchQuery, function (error, data1) {
                if(error){
                    res.json({"success": false, "message": "error", error});
                }else{
                   var result = {'totalRecords': data1, 'records': data};
                    res.json({"success": true, "result": result});
                }

            });
        }
    });

    // var query = connection.query("SELECT currency_code, SUM(amount) AS total_amount FROM customer_withdraw WHERE status = 1 GROUP BY currency_code ", function(error, data) {
    //     if (error) {
    //         res.json({ "success": false, "message": "error", error });
    //     } else {
    //         res.json({ "success": true, "data": data });
    //     }
    // });

};


exports.DepositeReport=(req, res)=>{
    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var searchQuery = '';
    var LIMIT = '';

    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + mysql.escape(offset) + ", " + mysql.escape(limit);
    }

    console.log("hey how are you");
        connection.query("SELECT cu.fullname, cu.email, des.amount, des.currency_code, des.created_at,(@count:=@count+1) AS serial_number FROM customer cu RIGHT JOIN customer_deposite des on cu.id=des.customer_id, (SELECT @count:="+offset+") AS X" +LIMIT, (err, data)=>{
            if(err){
                res.json({"success": false, "message": "error", error});
            } else{
                    connection.query("SELECT count(*) as count FROM customer_deposite WHERE status=1", (err, data1)=>{
                         if(err){
                                res.json({"success": false, "message": "error", error});
                            } else{

                                var result = {'totalRecords': data1, 'records': data};
                                res.json({"success": true, "result": result});
                            }
                    })
            }
         
        })

}

exports.withdrawalReport=(req, res)=>{
    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var searchQuery = '';
    var LIMIT = '';

    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + mysql.escape(offset) + ", " + mysql.escape(limit);
    }

    console.log("hey how are you");
        connection.query("SELECT cu.fullname, cu.email, des.amount, des.currency_code, des.created_at,(@count:=@count+1) AS serial_number FROM customer cu RIGHT JOIN customer_withdraw des on cu.id=des.customer_id, (SELECT @count:="+offset+") AS X" +LIMIT, (err, data)=>{
            if(err){
                res.json({"success": false, "message": "error", error});
            } else{
                    connection.query("SELECT count(*) as count FROM customer_deposite WHERE status=1", (err, data1)=>{
                         if(err){
                                res.json({"success": false, "message": "error", error});
                            } else{

                                var result = {'totalRecords': data1, 'records': data};
                                res.json({"success": true, "result": result});
                            }
                    })
            }
         
        })

}