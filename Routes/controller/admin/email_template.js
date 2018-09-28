var config = require('../../../config/config');
var connection = require('../../../config/db');
var jwt = require('jsonwebtoken');
var mysql=require("mysql");
//var Hashids = require('hashids')
//var hashSalt = new Hashids('Fuleex forget password');
//var useragent = require('useragent');
//var device = require('express-device');
//var nodemailer = require('nodemailer');
//var speakeasy = require('speakeasy');
//var QRCode = require('qrcode');
var request=require("request");
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

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './frontend/public/images/EmailTemplateDoc')
//        cb(null, './images/currencyimage')
    },
    filename: function (req, file, cb) {
        //cb(null, file.fieldname + '-' + Date.now())
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
})

var upload = multer({storage: storage}).single('file')



exports.getEmailTemplateList = function (req, res) {

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var filter_value = req.body.filter_value;
    var template_name = req.body.template_name;
    var template_code = req.body.template_code;
    var status = req.body.status;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var searchQuery = '';
    var orderBy = '';

    if (typeof template_name !== 'undefined' && template_name) {
        searchQuery += " AND et.template_name LIKE '%" + template_name + "%' ";
    }
    if (typeof template_code !== 'undefined' && template_code) {
        searchQuery += " AND et.template_code LIKE '%" + template_code + "%' ";
    }
    
    if (typeof status !== 'undefined' && status) {
        searchQuery += " AND et.status = " + status;
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY et.id DESC";
    }

//    if (filter_value != '') {
//        searchQuery = " AND (cy.name LIKE '%" + filter_value + "%' )";
//    }
    var query = connection.query("SELECT SQL_CALC_FOUND_ROWS et.*, @count:=@count+1 AS serial_number FROM email_template et , (SELECT @count:="+offset+") AS X WHERE et.status != 2 " + searchQuery + "  LIMIT " + offset + ", " + limit, function (error, data) {
        if (error) {
           
            res.json({"success": false, "message": "error", error});
        } else {
            
            connection.query('SELECT FOUND_ROWS() as count', function (error, data1) {

                var result = {'totalRecords': data1, 'records': data};
               
                res.json({"success": true, "message": "Faq List", result});
            });
        }
    })
};

exports.uploadEmailTemplateDoc = function (req, res) {
    
    fs.mkdir("./frontend/public/images/EmailTemplateDoc/", function (err) {
     upload(req, res, function (error, result) {
          var ext = req.file.originalname.substr(req.file.originalname.lastIndexOf('.') + 1);
                         console.log(ext)
             if (ext == 'jpg' || ext == 'jpeg' || ext == 'png' || ext == 'pdf') { 
                     if (error) {
                         res.json({success: false, message: "error in file upload", error: error})
                     } else {
                     var result = {'filename': req.file.filename};
                     res.json({success: true, message: "Successfully Uploaded", result})
                     }
             } else {
                  res.json({success: false, message: "please select jpg, jpeg, png file"})
             }
     });
 });
}

exports.addEmailTemplate = function (req, res) {

    connection.query("SELECT*FROM email_template where template_code='" + req.body.template_code + "'", function (error, templateresult) {
        if (templateresult[0] != null || templateresult[0] != undefined) {
            res.json({success: false, message: "Email Template found"})
        } else {
                var message=req.body.template_message
                //message= message.replace(/(&lt;|&gt;)/ig, "");
                var insertData = {
                                    "template_name": req.body.template_name,
                                    "template_code": req.body.template_code,
                                    "template_subject": req.body.template_subject,
                                    "template_message": message,
                                    "cc_email": req.body.cc_email,
                                    "bcc_email": req.body.bcc_email,
                                    "email_document": req.body.emailTemplateDoc,
                                    "created_at": created_at,
                                    "status": req.body.status,
                                    "created_by": req.decoded.id
                                }

                connection.query("INSERT INTO email_template SET ?", insertData, function (error, result) {
                                if (error) {
                                    res.json({"success": false, "message": "error", error});
                                } else {
                                    res.json({"success": true, "message": "Email Template Added Successfully"});
                                }
                });
            }
        });
    
}

exports.editEmailTemplate = function (req, res) {
    //console.log("my faq");
    var param_id = req.params.id;
    var query = connection.query("SELECT * FROM email_template WHERE id =" + param_id, function (error, data) {
        
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Edit Email Template", data});
        }
    });
};



exports.updateEmailTemplate = function (req, res) {

     var param_id = req.params.id;
     let sql="SELECT*FROM email_template where template_code=? AND id != ?";
     let value=[req.body.template_code, param_id];
     sql=mysql.format(sql, value);
     
    connection.query(sql, function (error, templateresult) {
        if (templateresult[0] != null || templateresult[0] != undefined) {
            res.json({success: false, message: "Email Template found"})
        } else {
                var message=req.body.template_message
                //message= message.replace(/(&lt;|&gt;)/ig, ""); 
        
                var updateData = {
                        "template_name": req.body.template_name,
                       // "template_code": req.body.template_code,
                        "template_subject": req.body.template_subject,
                        "template_message": message,
                        "cc_email": req.body.cc_email,
                        "bcc_email": req.body.bcc_email,
                        "email_document": req.body.emailTemplateDoc,
                        "updated_at": created_at,
                        "status": req.body.status,
                        "updated_by": req.decoded.id
                     }

                connection.query("UPDATE email_template SET ? WHERE id = ? AND status!=2", [updateData, param_id], function (error, result) {
                if (error) {
                    res.json({"success": false, "message": "error", error});
                } else {
                      res.json({"success": true, "message": "Email Template Updated Successfully"});
              
                }
            });
        }
     });   
                              
}

exports.downloadPdf = function (req, res) {
        console.log("asdsdasa");
    //fs.readFile("/EmailTemplateDoc/file-1516099149965.pdf",function(err,data){
        //console.log(data);
        //res.type('.pdf');
        res.download("/EmailTemplateDoc/file-1516099149965.pdf", "file-1516099149965.pdf");
   // });
}

exports.deleteEmailTemplate = function (req, res) {

    var id = req.params.id;
    var updateData = {
        "status": "2",
        "updated_at": created_at,
        "updated_by": req.decoded.id
    };
    var query = connection.query("UPDATE email_template SET ? WHERE id = ?", [updateData, id], function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Email Template Deleted Successfully", result});
        }
    });

//    console.log(query.sql);
};

