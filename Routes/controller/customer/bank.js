var request = require('request')
var mysql = require('mysql');
var connection = require('../../../config/db');
var config = require('../../../config/config');
var path = require('path')
var multer = require('multer')
var fs = require('file-system');
var bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
var salt = bcrypt.genSaltSync(10);
var moment = require('moment');
var async = require('async');
var speakeasy = require('speakeasy');
var jwt = require('jsonwebtoken');
const jwtBlacklist = require('jwt-blacklist')(jwt);
var folder = "banks_documents";
var emailFn = require('./email');
var cm_cfg = require('../../../config/common_config');
const bankDocumentActivityType='081';
let transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
        user: config.email,
        pass: config.password
    }
});
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/' + req.user_id + "/" + folder)
        //"uploads/"+req.user_id+"/"+folder
    },
    filename: function(req, file, cb) {
        //cb(null, file.fieldname + '-' + Date.now())
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
})

var upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: function(req, file, cb) {
        //console.log(file.mimetype)
        // console.log("size", file.fileSize)
        //console.log(file);
        if (file.mimetype == 'image/png' || file.mimetype == 'image/gif' || file.mimetype == 'application/msword' || file.mimetype == 'image/jpeg' || file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype == 'application/pdf') {
            return cb(null, true);
        } else {
            //console.log('in else');
            cb(null, false);
        }
    }
}).single('documents');

function created_at() {
    var created = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return created;
}

exports.getAdminAccountDetails = function(req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            let sql1 = "Select bank_name,account_number,holder_name,ifsc_code,upi,bank_branch from bank_details where user_id=0 OR user_id=1";
            connection.query(sql1, function(error, dataa) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {
                    //console.log(dataa[0]);
                    res.json({ success: true, data: dataa[0] })
                }

            })
        }
    })
}

exports.getBankDetails = function(req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT *,(select id from user where email=" + mysql.escape(email) + ") as user_id FROM customer WHERE email =?", [email]);
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            let user_id = data[0].user_id;
            let sqlBankDetails = mysql.format("select id,bank_name as bankName,holder_name as holderName,account_number as accountNumber,account_number as accountNumberConf,ifsc_code as ifscCode,bank_branch as bankBranch,account_type as accountType,IFNULL(status,0) as status, remark from bank_details where user_id=" + mysql.escape(user_id));
            //console.log(sqlBankDetails);
            connection.query(sqlBankDetails, function(err, bankData) {
                if (err) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(err) })
                } else if (bankData.length > 0) {
                    let sqlBankDocumentDetails = mysql.format("select concat('uploads/" + mysql.escape(data[0].id) + "/banks_documents/',document_name) as document_name from bank_documents_details where bank_id=" + mysql.escape(bankData[0].id));
                    //console.log(sqlBankDocumentDetails);
                    connection.query(sqlBankDocumentDetails, function(errBD, bankDocuments) {
                        if (errBD) {
                            res.json({ success: false, message: "error", error: cm_cfg.errorFn(errBD) })
                        } else {
                            var documentArray = [];
                            bankData = bankData[0];
                            if (bankDocuments.length > 0) {
                                bankDocuments.forEach(function(i, j) {
                                    documentArray.push(i.document_name);
                                });
                            }
                            bankData.documents = documentArray;
                            res.json({ success: true, data: bankData, message: "User Bank Account details" })
                        }
                    });
                } else {
                    res.json({ success: true, message: "No data found", data: {} });
                }
            });
        }
    })
}


exports.addBankDetails = function(req, res) {
    
    var email = req.decoded.email;
    let sql = mysql.format("SELECT *,(select id from user where email=" + mysql.escape(email) + ") as user_id FROM customer WHERE email =?", [email]);
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
         //   if(req.body.bankAccountNo === req.body.bankAccountNoConf) {
            var bank_name = req.body.bankName;
            var account_holder_name = req.body.accountHolderName;
            var ifsc_code = req.body.ifscCode;
            var bank_branch = req.body.bankBranch;
            var bank_account_num = req.body.bankAccountNo;
            var account_type = req.body.accountType;
            let sqlSelectUserBankDetails = mysql.format("select id from bank_details where user_id=?", [data[0].user_id]);
            let sqlInsertBankDetails = mysql.format("INSERT INTO bank_details (bank_name, holder_name, account_number, ifsc_code, user_id, created_at, status, bank_branch, account_type) VALUES (?, ?, ?, ?,?, now(), '1', ?, ?)",[bank_name, account_holder_name, bank_account_num, ifsc_code,data[0].user_id,bank_branch,account_type]);
            let sqlupdateBankDetails = mysql.format("update bank_details set bank_name=?,holder_name=?,account_number=?,ifsc_code=?,bank_branch=?,account_type=?,updated_at=now() where user_id=?", [bank_name, account_holder_name, bank_account_num, ifsc_code, bank_branch, account_type, data[0].user_id]);
            connection.query(sqlSelectUserBankDetails, function(errS, resS) {
                if (errS) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(errS) });
                } else if (resS.length > 0) {

                    // connection.query(sqlupdateBankDetails, function(err, bankData) {
                    //     if (err) {
                    //         res.json({ success: false, message: "error", error: cm_cfg.errorFn(err) })
                    //     } else {
                    //         data = req.body;
                    //         data.id = resS[0].id;
                    //         res.json({ success: true, data: data, message: "Bank details saved updated" })
                    //     }
                    // });
                    res.json({ success: false, message: "Bank details all ready saved" })
                } else {
                    connection.query(sqlInsertBankDetails, function(err, bankData) {
                        if (err) {
                            res.json({ success: false, message: "error", error: cm_cfg.errorFn(err) })
                        } else {
                            //var data={};
                            data = req.body;
                            data.id = bankData.insertId;
                            res.json({ success: true, data: data, message: "Bank details saved successfully" })
                        }
                    });
                }
            });
        // } else {
        //     res.json({ success: true, data: data, message: "please match account number" })
        // }
        }
    })
}
exports.uploadBankDocuments = function(req, res) {
    var email = req.decoded.email;
    var bank_id = req.params.bankAccountId;
    
    let sql = mysql.format("SELECT *,(select id from user where email=" + mysql.escape(email) + ") as user_id FROM customer WHERE email =?", [email]);
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            let user_id=data[0].user_id;
            let bankIdExistSql=mysql.format("select id,status,(select bank_id from bank_documents_details where bank_id=? order by id asc limit 1) as bankDocumentExists from bank_details where id=?",[bank_id,bank_id]);
            connection.query(bankIdExistSql,function(errS,resultS){
                if(errS){
                    res.json({ success: false, message: "Something went wrong", error: cm_cfg.errorFn(errS) });   
                }else if(resultS.length>0){
                    let bankDocumentExists=resultS[0].bankDocumentExists;
                    let bankStatus=resultS[0].status;
                    if(bankDocumentExists==null || (bankStatus=='3' ||bankStatus==3)){
                    if (!fs.exists("uploads/" + data[0].id)) {
                        fs.mkdir("uploads/" + data[0].id);
                    }
                    req.user_id = data[0].id;
                    fs.mkdir("uploads/" + data[0].id + "/" + folder, function(err) {
                        
                        upload(req, res, function(error) {
                            if (error) {
                                res.json({ success: false, message: "error in photo upload", error: cm_cfg.errorFn(error) })
                            }
                            if (!req.file) {
                                res.json({ success: false, message: "No file found" });
                            }
                            if (req.file) {
                                let logData=[];
                                logData['user_id']=user_id;
                                var ext = req.file.originalname.substr(req.file.originalname.lastIndexOf('.') + 1);
                                if (ext == 'doc' || ext == 'docx' || ext == 'pdf' || ext == 'jpg' || ext == 'jpeg' || ext == 'png') {
                                let document_name = req.file.filename;
                                let insertSql = mysql.format("INSERT INTO `bank_documents_details` (`bank_id`, `document_name`, `created_at`, `updated_at`) VALUES (?, ?, now(),now())", [bank_id, document_name])
                                let updateBankDocSql=mysql.format("update bank_documents_details set document_name=?,updated_at=now() where bank_id=?",[document_name,bank_id]);   
                                let finalSql="";
                                let queryType="";
                                    if(bankStatus==3 || bankStatus=='3'){
                                        finalSql=updateBankDocSql;
                                        queryType="update";
                                    }else{
                                        finalSql=insertSql;
                                        queryType='insert';
                                    }
                                    connection.query(finalSql, function(errI, resultI) {
                                        if (errI) {
                                            res.json({ success: false, message: "Something went wrong", error: cm_cfg.errorFn(errI) });
                                        } else {
                                            if(queryType=='update'){
                                                let updateStatusSql=mysql.format("update bank_details set status=? where id=?",[1,bank_id]);
                                                connection.query(updateStatusSql,function(errU,resultU){
                                                    if(errU){
                                                        res.json({ success: false, message: "Something went wrong", error: cm_cfg.errorFn(errU) });
                                                    }else if(resultU.affectedRows>0){
                                                        logData['activity_type']=bankDocumentActivityType;
                                                        logData['activity_description']='Bank document updated';
                                                        /* uncomment after frontend send log details like device_ipAddress and other keys*/
                                                        //logEntry(req,res,logData);
                                                        res.json({ success: true, message: "Document updated successfully" });
                                                    }else{
                                                        res.json({ success: false, message: "Something went wrong"});  
                                                    }    
                                                }); 
                                            }else{
                                                logData['activity_type']=bankDocumentActivityType;
                                                logData['activity_description']='Bank document uploaded';
                                                /* uncomment after frontend send log details like device_ipAddress and other keys*/
                                                //logEntry(req,res,logData);
                                                res.json({ success: true, message: "Document uploaded successfully" });  
                                            } 
                                        }
                                    })
                            }else {
                                res.json({ success: false, message: "Unsupported file format" })
                            }
                            }
                        });
                    });
                }else{
                    res.json({ success: false, message: "Document already uploaded" })   
                }
                }else{
                res.json({ success: false, message: "No bank found to upload documents" });   
                }
                });
        }
    })
}

logEntry=function(req,res,data){
    let userId=data['user_id'];
    let activity_description=data['activity_description'];
    var logData = {
        "user_id": userId,
        "activity_description": activity_description,
        "activity_type": data['activity_type'],
        "device_ipAddress": req.body.device_ipAddress,
        "device_os": req.body.device_os,
        "device_name": req.body.device_name,
        "device_browser": req.body.device_browser,
        "created_at": created_at(),
        "created_by": userId,
        "updated_by": userId
    }

    let logSql = mysql.format("INSERT INTO log SET ?", logData);
    connection.query(logSql,function(err,resultL){
    if(err){
        console.log(err);
    }else{
        console.log(resultL);
    }
    });

}
exports.getBankStatus = function(req, res) {

    var email = req.decoded.email;
    let sql = mysql.format("SELECT email,id FROM user WHERE email =?", [email]);
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
           console.log(data)
            let bankstatus_sql = mysql.format("Select status,remark from bank_details where user_id=?", [data[0].id])
           console.log(bankstatus_sql)
            connection.query(bankstatus_sql, function(error, statusdata) {
                if (error) {
                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) })
                } else if (statusdata[0]==null || statusdata[0]==undefined){
                    res.json({ success: true, message: "Bank Detail", status:0,comment:''})
                }else{
                    console.log(data)
                    res.json({ success: true, message: "Bank Detail", status: statusdata[0].status, comment:statusdata[0].remark})

                }
            })

        }
    })
}