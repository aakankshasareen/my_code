var config = require('../../../config/config');
var connection = require('../../../config/db');
var jwt = require('jsonwebtoken');

var email_helper = require("../../../config/email_helper");
var path = require('path');
var multer = require('multer');
var fs = require('file-system');
var moment = require('moment');
var mysql = require("mysql");
var emailer = require("./email.js");
const mmm = require('mmmagic');
let Magic = mmm.Magic;
let magic = new Magic(mmm.MAGIC_MIME_TYPE);

var date = new Date();
var created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");

exports.getSupportList = function (req, res) {
    var limit = req.body.limit == undefined ? 50 : req.body.limit;
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
        searchQuery += " AND su.issue LIKE '%" + mysql.escape(issue) + "%' ";
    }
    if (typeof email !== 'undefined' && email) {
        searchQuery += " AND su.email LIKE '%" + mysql.escape(email) + "%' ";
    }
    if (typeof subject !== 'undefined' && subject) {
        searchQuery += " AND su.subject LIKE '%" + mysql.escape(subject) + "%' ";
    }
    if (typeof query_type !== 'undefined' && query_type) {
        searchQuery += " AND su.email LIKE '%" + mysql.escape(query_type) + "%' ";
    }
    if (typeof status !== 'undefined' && status) {
        searchQuery += " AND fq.status = " + status;
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    }
    else {
        searchQuery += " ORDER BY su.id DESC";
    }

    //    if (filter_value != '') {
    //        searchQuery = " AND (cy.name LIKE '%" + filter_value + "%' )";
    //    }
    var query = connection.query("SELECT SQL_CALC_FOUND_ROWS su.*, @count:=@count+1 AS serial_number, CONCAT('supportdoc/',created_by,'/',su.doc_name)as document_path FROM support su , (SELECT @count:=" + offset + ") AS X WHERE su.status != 2 AND created_by=" + mysql.escape(req.decoded.id) + "" + searchQuery + "  LIMIT " + offset + ", " + limit, function (error, data) {
        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else {
            connection.query('SELECT FOUND_ROWS() as count', function (error, data1) {
                var result = { 'totalRecords': data1, 'records': data };
                res.json({ "success": true, "message": "Support List", result });
            });
        }
    })
};

exports.getUserProfile = function (req, res) {
    var email = req.decoded.email;
    sql = "SELECT id, email from user where email=?";
    var value = [email];
    sql = mysql.format(sql, value);
    connection.query(sql, function (error, userData) {
        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else if (userData == "" || userData == null) {
            res.json({ "success": false, "message": "No More Data Found" });
        } else {
            res.json({ "success": true, "message": "Repply Support", userData });
        }
    })
}


// exports.repplySupport = function(req, res) {

//     var limit = req.body.limit != undefined ? req.body.limit : "";
//     var offset = req.body.offset != undefined ? req.body.offset : "";
//     var param_id = req.params.id;
//     var query = connection.query("SELECT su.id, su.status, su.description, su.assign_to, su.created_by, sc.comment, sc.created_at, sc.sender_id, sc.receiver_id from support as su LEFT JOIN support_comment as sc ON su.id=sc.support_id WHERE su.id=" + param_id + "  ORDER BY sc.id DESC LIMIT " + offset + "," + limit + "", function(error, data) {
//         if (error) {
//             res.json({ "success": false, "message": "error", error });
//         } else if (data == "" || data == null) {
//             res.json({ "success": false, "message": "No More Data Found" });
//         } else {
//             res.json({ "success": true, "message": "Repply Support", data });
//         }
//     });
// };

exports.repplySupport = function (req, res) {

    var limit = mysql.escape(req.body.limit) != undefined ? mysql.escape(req.body.limit) : "";
    var offset = mysql.escape(req.body.offset) != undefined ? mysql.escape(req.body.offset) : "";
    var param_id = (req.params.id);

    var email = (req.decoded.email);
    var sql = "SELECT su.id, su.status, su.description, su.assign_to, su.created_by, sc.comment, sc.created_at, sc.sender_id, sc.receiver_id from support as su LEFT JOIN support_comment as sc ON su.id=sc.support_id WHERE su.id=? AND su.email=? ORDER BY sc.id ASC LIMIT " + offset + ", " + limit + "";

    var sqldata = mysql.format(sql, [param_id, email])

    var query = connection.query(sqldata, function (error, data) {

        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else if (data == "" || data == null) {
            res.json({ "success": false, "message": "No More Data Found" });
        } else {
            res.json({ "success": true, "message": "Repply Support", data });
        }
    });

};


// exports.addSupportComment = function(req, res) {

//     var date = new Date();
//     var created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");
//     var data = {
//         "comment": req.body.comment,
//         "support_id": req.body.support_id,
//         "receiver_id": req.body.receiver_id,
//         "sender_id": req.decoded.id,
//         //"status":req.body.status,
//         "created_at": created_at
//     };
//     let sql1 = "SELECT id, status from support WHERE id=? AND status!=0";
//     var value = [req.body.support_id];
//     sql1 = mysql.format(sql1, value);
//     var query1 = connection.query(sql1, function(error, ticketresult) {
//         if (error) {
//             res.json({ "success": false, "message": "error", error });
//         } else if (ticketresult[0] == null || ticketresult[0] == undefined) {
//             res.json({ "success": false, "message": "Ticket has been closed" });
//         } else {

//             let sql3 = "SELECT id, email, user_type from user WHERE id=? AND user_type ='C'";
//             var value3 = [req.decoded.id];
//             sql3 = mysql.format(sql3, value3);
//             var query3 = connection.query(sql3, function(error, custresult) {
//                 if (error) {
//                     res.json({ "success": false, "message": "error", error });
//                 } else if (custresult[0] == null || custresult[0] == undefined) {
//                     res.json({ "success": false, "message": "You not authorized for reply" });
//                 } else {
//                     let sql = "INSERT INTO support_comment SET ?";
//                     sql = mysql.format(sql, data);
//                     var query = connection.query(sql, function(error, result) {
//                         if (error) {
//                             res.json({ "success": false, "message": "error", error });
//                         } else {
//                             let sql2 = "SELECT id, email, mobileNumber from customer WHERE id=?";
//                             let value = [req.body.receiver_id];
//                             sql2 = mysql.format(sql2, value);
//                             let query2 = connection.query(sql2, function(error, userdata) {
//                                 if (error) {
//                                     res.json({ "success": false, "message": "error", error });
//                                 } else {
//                                     //console.log("userdatauserdatauserdata");
//                                     //console.log(userdata[0].email);
//                                     //return;
//                                     //let data=[{"{name}":"suneel Gupta"},{"{email}":"raj@gmaikl"} ,{"{address}":"I-110"}, {"Secon":"jjgghjh"}]
//                                     //email_helper.mail_template("we012", "suneel.gupta@sofocle.com", data, req, res)
//                                     let data = [{ "{message}": req.body.comment }, { "{name}": "Fuleex Support" }];
//                                     let userEmail = userdata != "" ? userdata[0].email : "";
//                                     email_helper.mail_template("MT125", "suneel.gupta@sofocle.com, " + userEmail + "", data, req, res)
//                                     res.json({ "success": true, "message": "Thank You For Your Reply. We Will Come Back To You Shortly.", result });
//                                 }
//                             })
//                         }
//                     })

//                 }

//             })

//         }
//     })
// };

exports.addSupportComment = function (req, res) {

    var date = new Date();
    var created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");
    var data = {
        "comment": req.body.comment,
        "support_id": req.body.support_id,
        "receiver_id": req.body.receiver_id,
        "sender_id": req.decoded.id,
        //"status":req.body.status,
        "created_at": created_at
    };
    let sql1 = "SELECT id, status from support WHERE id=? AND email=? AND status!=0";
    var value = [req.body.support_id, req.decoded.email];
    sql1 = mysql.format(sql1, value);
    var query1 = connection.query(sql1, function (error, ticketresult) {
        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else if (ticketresult[0] == null || ticketresult[0] == undefined) {
            res.json({ "success": false, "message": "Ticket has been closed" });
        } else {

            let sql3 = "SELECT id, email, user_type from user WHERE id=? AND user_type ='C'";
            var value3 = [req.decoded.id];
            sql3 = mysql.format(sql3, value3);
            var query3 = connection.query(sql3, function (error, custresult) {
                if (error) {
                    res.json({ "success": false, "message": "error", error });
                } else if (custresult[0] == null || custresult[0] == undefined) {
                    res.json({ "success": false, "message": "You not authorized for reply" });
                } else {
                    let sql = "INSERT INTO support_comment SET ?";
                    sql = mysql.format(sql, data);
                    var query = connection.query(sql, function (error, result) {
                        if (error) {
                            res.json({ "success": false, "message": "error", error });
                        } else {
                            let sql2 = "SELECT id, email, mobileNumber from customer WHERE id=?";
                            let value = [req.body.receiver_id];
                            sql2 = mysql.format(sql2, value);
                            let query2 = connection.query(sql2, function (error, userdata) {
                                if (error) {
                                    res.json({ "success": false, "message": "error", error });
                                } else {
                                    //console.log("userdatauserdatauserdata");
                                    //console.log(userdata[0].email);
                                    //return;
                                    //let data=[{"{name}":"suneel Gupta"},{"{email}":"raj@gmaikl"} ,{"{address}":"I-110"}, {"Secon":"jjgghjh"}]
                                    //email_helper.mail_template("we012", "suneel.gupta@sofocle.com", data, req, res)
                                    let data = [{ "{message}": req.body.comment }, { "{name}": "BBEX Support" }];
                                    let userEmail = userdata != "" ? userdata[0].email : "";
                                    email_helper.mail_template("MT125", "support@bbex.in, " + userEmail + "", data, req, res)
                                    res.json({ "success": true, "message": "Support comment added Successfully", result });
                                }
                            })
                        }
                    })

                }

            })

        }
    })
};


exports.addSupportData = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT id, email, type_id, user_type FROM user WHERE email =? AND user_type = 'C'", [email]);
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            var supportData = {
                "issue": req.body.issue,
                "email": req.decoded.email,
                "subject": req.body.subject,
                "description": req.body.desc,
                "status": '1',
                "created_at": created_at,
                "created_by": data[0].id,
                "user_query_from": 1
            }

            let sql2 = mysql.format("INSERT INTO support SET ?", [supportData])
            connection.query(sql2, function (error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error })
                } else {
                    res.json({ success: true, message: "Support data uploaded sucessfully", id: data.insertId })
                }
            })
        }
    })

}


var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, './supportdoc/' + folder)
    },
    filename: function (req, file, cb) {

        cb(null, file.fieldname + '-' + Date.now())
        // cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
})

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log(file.mimetype)
        console.log("size", file.fileSize)
        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' || file.mimetype == 'application/pdf') {
            return cb(null, true);
        } else {
            cb(null, false);
        }
    }
}).single('photo');

var uploadMulti = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        cb(null, true);

        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' || file.mimetype == 'application/pdf') {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
}).any();


exports.uploadSupport = function (req, res) {

    var updated_id = req.params.id
    var email = req.decoded.email;

    let sql = mysql.format("SELECT * FROM user WHERE email =?", [email]);
    //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    connection.query(sql, function (error, data) {

        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {

    let sqlCheck = mysql.format("SELECT * FROM support WHERE id=? and email=?", [updated_id, email]);

    connection.query(sqlCheck, function (error, checkData) {

        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (checkData[0] == null || checkData[0] == undefined) {
            res.json({ success: false, message: "error" })
        } else {
            var customer_id = data[0].id;
            fs.mkdir("supportdoc/" + customer_id, function (err) {
                //console.log("folder make")

                //console.log(req.files)
                folder = customer_id;
                upload(req, res, function (error) {
                    console.log("support req.files", req.file, req.files)

                    if (error) {
                        res.json({ success: false, message: "error in photo upload", error: error })
                    }
                    if (!req.file) {
                        //console.log("this is a testing");
                        res.json({ success: false, message: "Wrong file passed " });
                    }
                    if (req.file) {

                        var ext = req.file.originalname.substr(req.file.originalname.lastIndexOf('.') + 1);


                        magic.detectFile(req.file.path, (magic_err, magic_result) => {
                            console.log("path detected #test12", magic_err, magic_result);
                            if (magic_err) {
                                res.json({ success: false, message: "File not uploaded, please try again." });
                            }
                            if (magic_result == 'image/png' || magic_result == 'image/jpeg' || magic_result == 'image/jpg' || magic_result == 'application/pdf') {
                                let sql1 = mysql.format("UPDATE support SET doc_name= ? where id= ? and email= ? ", [req.file.filename, updated_id, email])

                                connection.query(sql1, function (error, data) {
                                    if (error) {
                                        res.json({ success: false, message: "Error", error: error });
                                    } else {
                                        res.json({ success: true, message: "Successfully updated document photo" })
                                    }
                                })
                            } else {
                                res.json({ success: false, message: "File not uploaded, please select the correct extension" });
                            }
                        })

                        // if (ext == 'jpg' || ext == 'jpeg' || ext == 'png' || ext == 'pdf') {
                        //     let sql1 = mysql.format("UPDATE support SET doc_name= ? where id= ?", [req.file.filename, updated_id])

                        //     connection.query(sql1, function (error, data) {
                        //         if (error) {
                        //             res.json({ success: false, message: "Error", error: error });
                        //         } else {
                        //             res.json({ success: true, message: "Successfully updated document photo" })
                        //         }
                        //     })
                        // } else {
                        //     res.json({ success: false, message: "File not uploaded, please select the correct extension" });
                        // }
                    }
                })
            })


}
})



        }
    })
}

exports.updateSupportStatusCu = function (req, res) {
    var email = req.decoded.email;
    var param_id = req.params.id;
    var updateData = {
        "updated_at": created_at,
        "status": req.body.status,
        "updated_by": req.decoded.id
    }
    connection.query("UPDATE support SET ? WHERE id = ? AND email = ?", [updateData, param_id, email], function (error, result) {
        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else if (result.affectedRows != 0) {
            console.log("resultresult", result)

            res.json({ "success": true, "message": "Support Status Change Successfully" });
        } else {
            res.json({ "success": false, "message": "Support Status not Change " });
        }
    });

}

exports.reOpenTicketCu = function (req, res) {
    var param_id = req.params.id;
    var updateData = {
        "updated_at": created_at,
        "status": 1,
        "updated_by": req.decoded.id
    }

    connection.query("UPDATE support SET ? WHERE id = ?", [updateData, param_id], function (error, result) {
        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else {

            res.json({ "success": true, "message": "Support Satatus Change Successfully" });
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
    var query = connection.query("UPDATE support SET ? WHERE id = ?", [updateData, id], function (error, result) {
        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else {
            res.json({ "success": true, "message": "Support Deleted Successfully", result });
        }
    });

    //    console.log(query.sql);
};

exports.downloadSupport = function (req, res) {
    filePath = req.body.path;

    var str1 = filePath.split("/");
    if (str1[0] == 'supportdoc') {
        if (str1.length > 3) {
            return res.json({ success: false, message: "Unauthorized folder access" })
        }
        var pathcheck = fs.existsSync(filePath)
        if (pathcheck == true) {
            var file_path = path.resolve(filePath);
            res.download(file_path);
        } else {
            res.json({ success: false, message: "Requested file not found" })
        }
    } else {
        res.json({ success: false, message: "Unauthorized folder access" })
    }
}

// support on Home Page 
exports.showSupportData = function (req, res) {

    var email = req.body.email != undefined ? req.body.email : '';
    let sql = mysql.format("SELECT id, email, user_type FROM user WHERE email =? AND user_type = 'C'", [email]);
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error });

        } else {
            var supportData = {
                // "issue": req.body.issue,
                "email": req.body.email,
                "subject": req.body.subject,
                "description": req.body.desc,
                "status": '1',
                "created_at": created_at,
                "created_by": data[0] != null ? data[0].id : 0,
                // "user_query_from":data[0] != null ? 1:0 // for registered user - 1, unregistered user - 0
            }

            let sql2 = mysql.format("INSERT INTO contact SET ?", [supportData])
            connection.query(sql2, function (error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error })
                } else {
                    var defaultMsg = "Hello, <br/>Thank you for your request. Your support ticket has been raised. <br/>We will get back to you shortly.<br/>";
                    var defaultMsg1 = "Hello,<br/> Please find the support ticket raised by the user.<br/> Email : " + req.body.email + "<br/> Subject : " + req.body.subject + "<br/> Description : " + req.body.desc;

                    emailer.sendEmailSupport('SUPPORT_TCKT_ADMIN', 'himanshu.sharma@prolitus.com', req.body.subject, req.body.desc, req.body.email, defaultMsg1);
                    emailer.sendEmailSupport('SUPPORT', req.body.email, undefined, undefined, undefined, defaultMsg);
                    res.json({ success: true, message: "Data uploaded sucessfully", id: data.insertId });

                }
            });

        } //else 
    })
}

exports.uploadSupportUser = function (req, res) {
    // let filePath = [];
    var updated_id = req.params.id
    var email = req.body.email != undefined ? req.body.email : '';
    let sql = mysql.format("SELECT * FROM user WHERE email =?", [email]);

    connection.query(sql, function (error, data) {
        console.log('data ', data)
        if (error) {
            res.json({ success: false, message: "error", error })
            // } else if (data[0] == null || data[0] == undefined) {
            //     res.json({ success: false, message: "User not found" })
        } else {

            var customer_id = data[0] != null ? data[0].id : 'UnregisteredUsersDocs';
            fs.mkdir("supportdoc/" + customer_id, function (err) {
                folder = customer_id;
                uploadMulti(req, res, function (error) {

                    if (error)
                        return res.json({ success: false, message: "error in photo upload", error: error })

                    if (!req.files)
                        return res.json({ success: false, message: "Wrong file passed " });

                    /*                        let filePath = req.files.reduce((accumulator, cur)=>{
                                                console.log('nini', accumulator.path+','+cur.path)
                                                return accumulator.path + ','+ cur.path;
                                            })*/
                    let filePath = '';
                    req.files.forEach((e) => {
                        if (filePath == '' || null) {
                            filePath += e.path;
                        }
                        else {
                            filePath += ',' + e.path;
                        }
                        var ext = e.originalname.substr(e.originalname.lastIndexOf('.') + 1);
                        if (ext == 'jpg' || ext == 'jpeg' || ext == 'png' || ext == 'pdf') {
                        } else {
                            return res.json({ success: false, message: "Please select currect extension" });
                        }

                    })
                    let sql1 = mysql.format("UPDATE support SET doc_name= ? where id= ?", [filePath, updated_id])

                    connection.query(sql1, function (error, data) {
                        if (error) {
                            res.json({ success: false, message: "Error", error: error });
                        } else {

                            res.json({ success: true, message: "Successfully updated document photo" })
                        }
                    })


                })
            })
        }
    })
}