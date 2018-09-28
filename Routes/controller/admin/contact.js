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
var email_helper=require("../../../config/email_helper");
var path = require('path');
var multer = require('multer');
var fs = require('file-system');
var moment = require('moment');
var mysql = require("mysql");
//var transporter = nodemailer.createTransport({
//   host: 'smtp.zoho.com',
//    port: 465,
//    secure: true, // secure:true for port 465, secure:false for port 587
//    auth: {
//        user: config.email,
//        pass: config.password
//    }
//});
var date = new Date();
var created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");

exports.getSupportListAdmin = function (req, res) {
    
    var limit = req.body.limit== undefined?10:req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var filter_value = req.body.filter_value;
    var issue = req.body.issue;
    var email = req.body.email;
    var subject = req.body.subject;
    var status = req.body.status;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var searchQuery = '';
    var orderBy = '';

    if (typeof issue !== 'undefined' && issue) {
        searchQuery += " AND su.issue LIKE '%" + issue + "%' ";
    }
    if (typeof email !== 'undefined' && email) {
        searchQuery += " AND su.email LIKE '%" + email + "%' ";
    }
    if (typeof subject !== 'undefined' && subject) {
        searchQuery += " AND su.subject LIKE '%" + subject + "%' ";
    }
    if (typeof query_type !== 'undefined' && query_type) {
        searchQuery += " AND su.email LIKE '%" + query_type + "%' ";
    }
    if (typeof status !== 'undefined' && status) {
        searchQuery += " AND fq.status = " + status;
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY su.id DESC";
    }

//    if (filter_value != '') {
//        searchQuery = " AND (cy.name LIKE '%" + filter_value + "%' )";
//    }
    var query = connection.query("SELECT SQL_CALC_FOUND_ROWS su.*, CONCAT('supportdoc/',created_by,'/',doc_name)as document_path, @count:=@count+1 AS serial_number FROM contact su , (SELECT @count:="+offset+") AS X WHERE su.status != 2 " + searchQuery + "  LIMIT " + offset + ", " + limit, function (error, data) {
        if (error) {
           
            res.json({"success": false, "message": "error", error});
        } else {
            
            connection.query('SELECT FOUND_ROWS() as count', function (error, data1) {
                var result = {'totalRecords': data1, 'records': data};
                res.json({"success": true, "message": "Support List", result});
            });
        }
    })
};



exports.repplySupportTeam = function (req, res) {
   
    var limit= req.body.limit !=undefined?req.body.limit:"";
    var offset = req.body.offset!=undefined?req.body.offset:"";
    var param_id =req.params.id;
    var query = connection.query("SELECT su.id, su.status, su.description, su.assign_to, su.created_by, sc.comment, sc.created_at, sc.sender_id, sc.receiver_id from contact as su LEFT JOIN support_comment as sc ON su.id=sc.support_id WHERE su.id="+ param_id +" ORDER BY sc.id DESC LIMIT "+offset+","+limit+"", function (error, data) {
       if (error) {
            res.json({"success": false, "message": "error", error});
        } else if(data=="" || data==null) {
              
              res.json({"success": false, "message": "No More Data Found" });
        } else{
              
              res.json({"success": true, "message": "Repply Support", data});
        }

    });
};


exports.addSupportCommentTeam = function(req, res){
    var date = new Date();
    var created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");

       
    var data = {
        "comment":req.body.comment,
        "support_id": req.body.support_id,
        "receiver_id":req.body.receiver_id,
        "sender_id":req.decoded.id,
        //"status":req.body.status,
        "created_at":created_at
    };

    let sql1 = "SELECT id, status from contact WHERE id=? AND status!=0";
    var value = [req.body.support_id];
    sql1 = mysql.format(sql1, value);
    var query1 = connection.query(sql1, function(error, ticketresult){
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else if(ticketresult[0] == null || ticketresult[0] == undefined){
            res.json({"success": false, "message": "Ticket has been closed"});
        }else{ 
            let sql3 = "SELECT id, email, user_type from user WHERE id=? AND user_type !='C'";
            var value3 = [req.decoded.id];
            sql3 = mysql.format(sql3, value3);
            var query3 = connection.query(sql3, function(error, custresult){
                if(error){
                    res.json({"success": false, "message": "error", error});
                } else if(custresult[0] == null || custresult[0] == undefined){
                     res.json({"success": false, "message": "You not authorized for reply"});
                } else {
                    let sql = "INSERT INTO support_comment SET ?";
                    sql = mysql.format(sql, data);
                    var query = connection.query(sql, function(error, result){
                        if (error) {
                            res.json({"success": false, "message": "error", error});
                        } else {
                            let sql2 = "SELECT id, email, mobileNumber from customer WHERE id=?";
                            let value = [req.body.receiver_id];
                            sql2 =  mysql.format(sql2, value);
                            let query = connection.query(sql2, function(error, userdata){
                                if (error) {
                                        res.json({"success": false, "message": "error", error});
                                } else { 
                                //console.log(userdata[0].email);
                                //return;
                                //let data=[{"{name}":"suneel Gupta"},{"{email}":"raj@gmaikl"} ,{"{address}":"I-110"}, {"Secon":"jjgghjh"}]
                                //email_helper.mail_template("we012", "suneel.gupta@sofocle.com", data, req, res)
                                    let data = [{"{message}":req.body.comment}, {"{name}":"test"}];
                                    let userEmail = userdata!=""?userdata[0].email:"";
                                    email_helper.mail_template("MT125", "suneel.gupta@sofocle.com, "+userEmail+"" , data, req, res)
                                    res.json({"success": true, "message": "comment added Successfully", result});
                                }

                            })
           
                        }
                    })

                }
            })

        }
    })
};

exports.changeStatus= function(req, res){
    var id = req.params.id;
    let sql = "SELECT description, status, id from contact WHERE id=? ";
    let value = [id];
    sql = mysql.format(sql, value);
    connection.query(sql, function(error, result){
        if(error){
           res.json({"success": false, "message": "error", error});  
       } else {
            res.json({"success": true, "message": "contact Details  Found", result});
       }

    })
}

exports.updateSupportStatus = function (req, res) {

    var param_id = req.params.id;
    var updateData = {
                        "updated_at": created_at,
                        "status": req.body.status,
                        "updated_by": req.decoded.id
                     }

    connection.query("UPDATE contact SET ? WHERE id = ?", [updateData, param_id], function (error, result) {
                if (error) {
                    res.json({"success": false, "message": "error", error});
                } else {

                    res.json({"success": true, "message": " Satatus Change Successfully"});
                }
    });
                              
}

exports.reOpenTicket = function(req, res){
    
    var param_id = req.params.id;
    var updateData = {
                        "updated_at": created_at,
                        "status": 1,
                        "updated_by": req.decoded.id
                     }

    connection.query("UPDATE support SET ? WHERE id = ?", [updateData, param_id], function (error, result) {
                if (error) {
                    res.json({"success": false, "message": "error", error});
                } else {

                    res.json({"success": true, "message": "Support Satatus Change Successfully"});
                }
    });
                              
}




exports.deleteSupport = function (req, res) {

    var id = req.params.id;
    var updateData = {
        "status": "2",
        "updated_at": created_at,
        "updated_by": req.decoded.id
    };
    var query = connection.query("UPDATE contact SET ? WHERE id = ?", [updateData, id], function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "contact Deleted Successfully", result});
        }
    });

//    console.log(query.sql);
};

