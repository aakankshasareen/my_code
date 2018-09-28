var config = require('../../../config/config');
var connection = require('../../../config/db');
var jwt = require('jsonwebtoken');
//var Hashids = require('hashids')
//var hashSalt = new Hashids('Fuleex forget password');
//var useragent = require('useragent');
//var device = require('express-device');
//var nodemailer = require('nodemailer');
//var speakeasy = require('speakeasy');
//var QRCode = require('qrcode');

var path = require('path');
var multer = require('multer');
var fs = require('file-system');

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




exports.getFaqList = function (req, res) {

       
    var limit =req.body.limit==undefined?10:req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var filter_value = req.body.filter_value;
    var question = req.body.question;
    var answer = req.body.answer;
    var status = req.body.status;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var searchQuery = '';
    var orderBy = '';

    if (typeof question !== 'undefined' && question) {
        searchQuery += " AND fq.question LIKE '%" + question + "%' ";
    }
    if (typeof answer !== 'undefined' && answer) {
        searchQuery += " AND fq.answer LIKE '%" + answer + "%' ";
    }
    
    if (typeof status !== 'undefined' && status) {
        searchQuery += " AND fq.status = " + status;
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY fq.id DESC";
    }

//    if (filter_value != '') {
//        searchQuery = " AND (cy.name LIKE '%" + filter_value + "%' )";
//    }
    var query = connection.query("SELECT SQL_CALC_FOUND_ROWS fq.*, @count:=@count+1 AS serial_number FROM faq fq , (SELECT @count:="+offset+") AS X WHERE fq.status != 2 " + searchQuery + "  LIMIT " + offset + ", " + limit, function (error, data) {
        if (error) {
           
            res.json({"success": false, "message": "error", error});
        } else {
            
            connection.query('SELECT FOUND_ROWS() as count', function (error, data1) {
                var result = {'totalRecords': data1, 'records': data};
               
               //console.log("result");
               //console.log(result);

                res.json({"success": true, "message": "Faq List", result});
            });
        }
    })
};

exports.addFaq = function (req, res) {

       
                var insertData = {
                        "question": req.body.question,
                        "answer": req.body.answer,
                        "category_id": req.body.category_id,
                        "created_at": created_at,
                        "status": req.body.status,
                        "created_by": req.decoded.id
                    }

                connection.query("INSERT INTO faq SET ?", insertData, function (error, result) {
                                if (error) {
                                    res.json({"success": false, "message": "error", error});
                                } else {
                                    res.json({"success": true, "message": "Faq Added Successfully"});
                                }
                });
    
}

exports.editFaq = function (req, res) {
    //console.log("my faq");
    var param_id = req.params.id;
    var query = connection.query("SELECT * FROM faq WHERE id =?",[param_id], function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Edit Faq", data});
        }
    });
};



exports.updateFaq = function (req, res) {

    var param_id = req.params.id;
    var updateData = {
                        "question": req.body.question,
                        "answer": req.body.answer,
                        'category_id':req.body.category_id,
                        "updated_at": created_at,
                        "status": req.body.status,
                        "updated_by": req.decoded.id
                     }

    var query = connection.query("UPDATE faq SET ? WHERE id = ? && status!=2", [updateData, param_id], function (error, result) {
                if (error) {
                    res.json({"success": false, "message": "error", error});
                } else if(result.changedRows!=0) {
                      res.json({"success": true, "message": "faq Updated Successfully"});
                } else{
                    res.json({"success": false, "message": "sorry some thing went wrong"});
                }
    });
   
                              
}

exports.deleteFaq = function (req, res) {

    var id = req.params.id;
    var updateData = {
        "status": "2",
        "updated_at": created_at,
        "updated_by": req.decoded.id
    };
    var query = connection.query("UPDATE faq SET ? WHERE id = ?", [updateData, id], function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Faq Deleted Successfully", result});
        }
    });

    //console.log(query.sql);
};

exports.getFaqCategoryList = function (req, res) {
    var query = connection.query("SELECT id, category_name, status FROM faq_category WHERE status = 1 ORDER BY category_name ASC", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            
            res.json({"success": true, "message": "Category List", data});
        }
    });
}