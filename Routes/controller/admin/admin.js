var bcrypt = require('bcryptjs');
var mysql = require('mysql');
var salt = bcrypt.genSaltSync(10);
var config = require('../../../config/config');
var common_config = require('../../../config/common_config');
var connection = require('../../../config/db');
var jwt = require('jsonwebtoken');
var Hashids = require('hashids')
var hashSalt = new Hashids('Fuleex forget password');
var useragent = require('useragent');
var device = require('express-device');
var nodemailer = require('nodemailer');
var speakeasy = require('speakeasy');
var QRCode = require('qrcode');
var moment = require('moment');
var path = require('path');
var fs = require('file-system');
var base64Img = require('base64-img');
const jwtBlacklist = require('jwt-blacklist')(jwt);
const verifyTwoFA = require('./two_factor_auth');



let transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
        user: config.email,
        pass: config.password
    }
});
var date = new Date();

var created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");

// function created_at() {
//     var created = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
//     return created;
// }


exports.adminLogin = function (req, res) {

    let sql = "SELECT * FROM user WHERE email ='" + req.body.email + "' AND status = 1";

    connection.query(sql, function (error, data) {
        if (error) {
            res.json({success: false, message: "User not found or not active", error})
        } else if (data[0] == null || data[0] == undefined) {
            res.json({success: false, message: "Sign In failed"})
        } else {

            let sqlV = "SELECT *, admin.id as admin_id, user.id as id FROM user join admin on admin.user_id = user.id WHERE user.email ='" + req.body.email + "' AND user_type='A'";
            connection.query(sqlV, function (error, cusdata) {
                if (error) {
                    res.json({success: false, message: "error", error})
                } else if (cusdata[0] == null || cusdata[0] == undefined) {

                    res.json({success: false, message: "Sign In failed"})
                }else
                    if (cusdata[0].emailVerify == '1') {
                        //
                        var password = bcrypt.compareSync("'" + req.body.password + "'", data[0].password)
                        //console.log(password)

                        if (password == true) {

                            stoken = {
                                id: data[0].id,
                                email: req.body.email,
                                device_name: req.body.device_name
                            }

                            // console.log(stoken)
                            let secret = cusdata[0].FA_status?common_config.login2FA:common_config.config2FA;
                            let expiresIn = cusdata[0].FA_status?'7d':'7d';
                            var token = jwt.sign(stoken, secret, {expiresIn});

                        //let sql1 = "UPDATE admin SET token = '" + token + "', updated_at = '" + updated_at + "' WHERE email = '" + req.body.email + "'";
                        let sql1 = "UPDATE admin SET token = '" + token + "' WHERE user_id = '" + cusdata[0].user_id + "'";
                        //console.log(sql1)
                        connection.query(sql1, function (error, result) {
                            if (error) {
                                res.json({success: false, message: "error", error})
                            } else {

                                //console.log("cu", result)
                                //let sql2 = "UPDATE user SET lastLogin_timestamp='" + updated_at + "',lastLogin_ip='" + ipAddress + "',lastLogin_device='" + dev + "',lastLogin_browser='" + browser + "' WHERE email='" + req.body.email + "';"
                                let sql2 = "UPDATE user SET lastLogin_timestamp='" + created_at + "',lastLogin_ip='" + req.body.device_ipAddress + "',lastLogin_device='" + req.body.device_name + "',lastLogin_browser='" + req.body.device_browser + "',lastLogin_os='" + req.body.device_os + "' WHERE email='" + req.body.email + "';"
                                //console.log("sql2", sql2)
                                connection.query(sql2, function (error, results) {
                                    if (!error) {
                                        //let sql3 = "INSERT INTO log (admin_id,activity_description,activity_type,created_at,updated_at,created_by,updated_by) SELECT id,'login','002','" + updated_at + "','" + updated_at + "',id,id FROM admin WHERE email='" + req.body.email + "';"
                                        let sql3 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) SELECT id,'admin Login','011','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at + "',id,id FROM user WHERE email='" + req.body.email + "';"
                                        //console.log("sql",sql3)
                                        connection.query(sql3, function (error, results) {
                                            if (!error) {
                                                if (req.body.device_name == 'Mobile') {
                                                    var verifyCode = ("" + Math.random()).substring(2, 7)

                                                    let sql4 = "UPDATE admin SET otp =" + verifyCode + " WHERE email = '" + req.body.email + "'";
                                                    // console.log(sql2)
                                                    connection.query(sql4, function (error, result) {
                                                        if (error) {
                                                            //console.log(error)
                                                            res.json({success: false, message: "Error"})
                                                        } else {

                                                            let mailOptions = {
                                                                from: 'Fuleex Exchange<' + config.email + '>', // sender address
                                                                to: req.body.email, // list of receivers
                                                                subject: 'One Time Password', // Subject line
                                                                text: '',
                                                                html: "Hello,<br>Your one time password (OTP).<br>" + verifyCode + "" // html body
                                                            }


                                                                transporter.sendMail(mailOptions, (error, info) => {
                                                                    if (error) {
                                                                        // res.json({ success: false, message: "Error" })
                                                                        console.log("mobile error", error)
                                                                    }
                                                                    //console.log('Message %s sent: %s', info.messageId, info.response);
                                                                    else {
                                                                        res.json({success: true, message: "Otp sent successfully, Please enter otp to login in your account"})
                                                                        //res.json({ success: true, message: "otp is sent on your mail" })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    } else {
                                                          res.json({success: true, message: "login success", token: token, name: cusdata[0].fullname, role_id: cusdata[0].role_id, is_super_admin: cusdata[0].is_super_admin, FA_status:cusdata[0].FA_status});
                                                        }
                                                }
                                             else {
                                                //console.log(error)
                                                res.json({success: false, message: "error", error})
                                            }
                                        })

                                    } else {
                                        res.json({success: false, message: "error", error})

                                    }
                                })
                            }
                        })
                    } else {
                        res.json({success: false, message: "SignIn failed"})
                    }
                } else {
                    res.json({success: false, message: "Email is not verified.Please verified your email"})
                }

            });
        }

    })
}

exports.adminLogout = function (req, res) {

    var user_id = req.decoded.id;
    var token = req.headers.token;
    jwtBlacklist.blacklist(token);
    let sql = mysql.format("SELECT * FROM admin WHERE user_id =?", [user_id]);

    connection.query(sql, function (error, data) {
        if (error) {
            res.json({success: false, message: "error", error})
        } else if (data[0] == null || data[0] == undefined) {

            res.json({success: false, message: "User not found"})
        } else {
            //console.log(req.decoded.email)

            let sql1 = mysql.format("UPDATE admin SET token = 'NULL' WHERE user_id = ?", [user_id]);
            //console.log(sql1)
            connection.query(sql1, function (error, result) {
                if (error) {
                    res.json({success: false, message: "error", error})
                } else {
                    //console.log(result)
                    res.json({success: true, message: "Successfully logout"})
                }
            })
        }

    })
}



exports.getKYCData = function (req, res) {
    var type = req.body.type;

    if (type == 1) {
        var sql = "SELECT id, name, status, icon_name, country_id FROM kyc_master WHERE status= ? AND type= ?";
    } else {
        var country_id = req.body.country_id;
        var sql = "SELECT id, name, status, icon_name, country_id FROM kyc_master WHERE status= ? AND type= ? AND country_id = ?";
    }

    var query = connection.query(sql, [1, type, country_id], function (error, data) {

        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            if (type == "1") {
                res.json({"success": true, "message": "KYC Tabs ", data});
            } else if (type == "2") {
                res.json({"success": true, "message": "KYC Id Types ", data});
            } else if (type == "3") {
                res.json({"success": true, "message": "KYC Issuing Authorities ", data});
            } else if (type == "4") {
                res.json({"success": true, "message": "KYC Address Proof types ", data});
            }
        }
    });
}

exports.getDefaultDateFormat = function (req, res) {
    var query = connection.query("SELECT date_format FROM date_format_master WHERE default_format = 1 AND status=1", function (err, data) {
        if (err) {
            res.json({"success": false, "message": "error", err});
        } else {
            res.json({"success": true, "message": "Date Format", data});
        }
    });
}

exports.getAdminSettings = function (req, res) {
    var query = connection.query("SELECT * FROM admin_setting ", function (err, data) {
        if (err) {
            res.json({"success": false, "message": "error", err});
        } else {
            res.json({"success": true, "message": "Admin Settings", data});
        }
    });
}

exports.getCustomerAdminSettings = function (req, res) {
    var query = connection.query("SELECT * FROM admin_setting ", function (err, data) {
        if (err) {
            res.json({"success": false, "message": "error", err});
        } else {
            res.json({"success": true, "message": "Admin Settings", data});
        }
    });
}

exports.updateSettings = function (req, res) {
    var updateData = {
        "date_format": req.body.date_format,
        "display_date_format": req.body.display_date_format
    }
    var query = connection.query("UPDATE admin_setting SET ?", [updateData], function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Settings Updated Successfully", result});
        }
    });
};

exports.getAllKYCMasterList = function (req, res) {

    var limit = typeof req.body.limit !== 'undefined' ? req.body.limit : 10;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var name = req.body.name;
    var country_name = req.body.country_name;
    var type = req.body.mobileNumber;
    var status = req.body.status;

    var searchQuery = '';

    if (typeof name !== 'undefined' && name) {
        searchQuery += " AND km.name LIKE '%" + name + "%' ";
    }
    if (typeof country_name !== '' && country_name) {
        searchQuery += " AND cy.name LIKE '%" + country_name + "%' ";
    }

    if (typeof status !== 'undefined' && status) {
        searchQuery += " AND km.status = " + status;
        searchStatus = '';
    }
    if (typeof type !== 'undefined' && type) {
        searchQuery += " AND km.type = " + type;
    }

    var query = connection.query("SELECT SQL_CALC_FOUND_ROWS km.*,@count:=@count+1 AS serial_number,cy.name as country_name FROM kyc_master km LEFT JOIN countries cy ON cy.id = km.country_id  , (SELECT @count:=" + offset + ") AS X WHERE km.status !=2 " + searchQuery + " LIMIT " + offset + ", " + limit + " ", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            connection.query('SELECT FOUND_ROWS() as count', function (error, data1) {
                var result = {'totalRecords': data1, 'records': data};
                res.json({"success": true, "message": "KYC Master List", result});
            });

        }
    })
};

exports.addKYC = function (req, res) {
    var insertData = {
        "country_id": req.body.country_id,
        "name": req.body.name,
        "type": req.body.type,
        "icon_name": req.body.icon_name,
        "status": req.body.status,
        "created_by": req.decoded.id,
        "created_at": created_at
    }
    connection.query("INSERT INTO kyc_master SET ?", insertData, function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "KYC Master added successfully"});
        }
    });
}

exports.editKYC = function (req, res) {
    var param_id = req.params.id;
    connection.query("SELECT * FROM kyc_master WHERE id= ?", [param_id], function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "KYC Master Information", data});
        }
    });
}

exports.updateKYC = function (req, res) {
    var param_id = req.params.id;
    var updateData = {
        "country_id": req.body.country_id,
        "name": req.body.name,
        "type": req.body.type,
        "icon_name": req.body.icon_name,
        "status": req.body.status==2?1:req.body.status,
        "updated_by": req.decoded.id,
        "updated_at": created_at
    }

    if((req.body.status && isNaN(req.body.status)) || !(req.body.status>=0 && req.body.status<2))
    {
        res.json({"success": false, "message": "Please send valid parameters"});
        return null;
    }


    connection.query("UPDATE kyc_master SET ? WHERE id = ?", [updateData, param_id], function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "KYC Master updated successfully"});
        }
    });

}

exports.getProfileInfoAdmin = function (req, res) {

    var email = req.decoded.email;
    var id = req.decoded.id;

    let sql = mysql.format("SELECT * FROM user JOIN admin ON user.id = admin.user_id WHERE user.email =? AND user.id=?", [email, id]);

    //console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({success: false, message: "error", error})
        } else if (data[0] == null || data[0] == undefined) {

            res.json({success: false, message: "User not found"})
        } else {

            let lastlogin_sql = "SELECT MAX(created_at) as last FROM log where activity_type='011' and user_id='" + data[0].created_by + "'";
            connection.query(lastlogin_sql, function (error, lastlogindata) {
                if (error) {
                    res.json({success: false, message: "error", error})
                } else {

                    obj = {fullname: data[0].fullname, city: data[0].city, country: data[0].country, address: data[0].address, postal_code: data[0].postal_code, date_of_birth: data[0].date_of_birth, birth_place: data[0].birth_place, country_code: data[0].country_code, gender: data[0].gender, mobileNumber: data[0].mobileNumber, lastlogin: lastlogindata[0].last, email: email}
                    res.json({success: true, message: "Profile info", data: obj})

                }

            })
        }
    })
}


exports.getAllAdminUserList = function (req, res) {

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var filter_value = req.body.filter_value;
    var fullname = req.body.fullname;
    var email = req.body.email;
    var mobileNumber = req.body.mobileNumber;
    var status = req.body.status;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var searchQuery = '';
    var orderBy = '';

    if (typeof fullname !== 'undefined' && fullname) {
        searchQuery += " AND admin.fullname LIKE '%" + fullname + "%' ";
    }
    if (typeof email !== 'undefined' && email) {
        searchQuery += " AND user.email LIKE '%" + email + "%' ";
    }
    if (typeof mobileNumber !== 'undefined' && mobileNumber) {
        searchQuery += " AND admin.mobileNumber LIKE '%" + mobileNumber + "%' ";
    }
    if (typeof status !== 'undefined' && status != undefined) {
        searchQuery += " AND user.status = " + status;
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY admin.id DESC";
    }

    var query = connection.query("SELECT admin.mobileNumber, admin.country,\n\
admin.country, admin.address, admin.fullname, admin.gender, admin.date_of_birth, admin.country_code, user.email, admin.fullname,\n\
 user.role_id, user.id, user.status,\n\
 @count:=@count+1 AS serial_number, admin.id as admin_id, user.id as id FROM user join admin on admin.user_id = user.id , (SELECT @count:="+offset+") AS X WHERE user_type='A' AND user.status !=2 AND user.is_super_admin !=1" + searchQuery + "  LIMIT " + offset + ", " + limit, function (error, data) {

        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            connection.query("SELECT count(*) as count FROM user join admin on admin.user_id = user.id WHERE user.user_type='A'" + searchQuery, function (error, data1) {
                var result = {'totalRecords': data1, 'records': data};
                res.json({"success": true, "message": "User List", result});
            });
        }
    })
}


exports.registerAdminUser = function (req, res) {

    var password = bcrypt.hashSync("'" + req.body.password + "'", salt);
    var email = req.body.email;
    let sql = mysql.format("SELECT * FROM user WHERE email = ?", [email]);
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({success: false, message: "error", error})
        } else {
            // console.log("data", data)

            if (data[0] == null || data[0] == undefined) {
                var userData = {
                    "email": req.body.email,
                    "status": 1,
                    "password": password,
                    "user_type": 'A',
                    'role_id': req.body.role_id,
                    'status': req.body.status
                }
                let sql1 = mysql.format("INSERT INTO user SET ?", userData)
                //let sql1 = "INSERT into customer(fullname,email,mobileNumber,device_ipAddress,device_os,device_name,device_browser,status,created_at) values('" + req.body.name + "','" + req.body.email + "','" + req.body.mobileNumber + "','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','pending','" + created_at + "')";
                // console.log(sql1)
                connection.query(sql1, function (error, result) {

                    if (error) {
                        res.json({success: false, message: "error", error})
                    } else {
                        // console.log("ans", result.insertId)

                        var custoData = {
                            "fullname": req.body.name,
                            "mobileNumber": req.body.mobileNumber,
                            "device_ipAddress": req.body.device_ipAddress,
                            "device_os": req.body.device_os,
                            "device_name": req.body.device_name,
                            "user_id": result.insertId,
                            'emailVerify': 1,
                            "device_browser": req.body.device_browser,
                            "created_at": created_at

                        };

                        let sql2 = mysql.format("INSERT INTO admin SET ?", custoData)

                        connection.query(sql2, function (error, results) {
                            if (!error) {

                                var logData = {
                                    "user_id": results.insertId,
                                    "activity_description": 'Customer Registration',
                                    "activity_type": '001',
                                    "device_ipAddress": req.body.device_ipAddress,
                                    "device_os": req.body.device_os,
                                    "device_name": req.body.device_name,
                                    "device_browser": req.body.device_browser,
                                    "created_at": created_at,
                                    "created_by": results.insertId,
                                    "updated_by": results.insertId
                                }


                                let sql3 = mysql.format("INSERT INTO log SET ?", logData);
                                res.json({success: true, message: "User successfully register"});

                            } else {
                                //console.log(error)
                                res.json({success: false, message: "Error", Error: error})
                            }

                        })
                    }
                })
            } else {
                res.json({success: false, message: "Registration Failed : email id is already taken"})
            }
        }

    });

}


exports.editBackendUser = function (req, res) {
    var param_id = req.params.id;
    var query = connection.query("SELECT admin.mobileNumber, admin.country, \n\
admin.country, admin.address, admin.fullname, admin.gender, admin.date_of_birth, admin.country_code, user.email, admin.fullname,\n\
 user.role_id, user.id, user.status FROM user join admin on admin.user_id = user.id WHERE is_super_admin != 1 AND user.id =" + param_id, function (error, data) {

        if (error || data.length == 0) {
            res.status(401).send({status: -2, message: 'Permission denied'});
        } else {
            res.json({"success": true, "message": "Edit User", data});
        }
    });
};

exports.updateAdminUser = function (req, res) {

    var password = bcrypt.hashSync("'" + req.body.password + "'", salt);
    var email = req.body.email;
    var user_id = req.body.user_id;
    let sql = mysql.format("SELECT * FROM user WHERE email = ? AND id != ? ", [email, user_id]);
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "Something went wrong", error })
        } else {

            if (data[0] == null || data[0] == undefined) {
                var userData = {
                    "email": req.body.email,
                    "user_type": 'A',
                    'role_id': req.body.role_id,
                    'status': req.body.status,
                }
                if (req.body.password != undefined && req.body.password.length > 0) {
                    userData['password'] = password;
                }
                let sql1 = mysql.format("update user SET ? where is_super_admin != 1 AND id ="+user_id, userData)
                connection.query(sql1, function(error, result) {
                    if (error || result.affectedRows == 0) {
                        res.json({ success: false, message: "Something went wrong", error })
                    } else {
                        // console.log("ans", result.insertId)

                        var custoData = {
                            "fullname": req.body.name,
                            "mobileNumber": req.body.mobileNumber,
                            "device_ipAddress": req.body.device_ipAddress,
                            "device_os": req.body.device_os,
                            "device_name": req.body.device_name,
                            "updated_at": created_at

                        };

                        let sql2 = mysql.format("update admin SET ? where user_id =" + user_id, custoData)

                        connection.query(sql2, function (error, results) {
                            if (!error) {

                                var logData = {
                                    "user_id": results.insertId,
                                    "activity_description": 'Customer Registration',
                                    "activity_type": '001',
                                    "device_ipAddress": req.body.device_ipAddress,
                                    "device_os": req.body.device_os,
                                    "device_name": req.body.device_name,
                                    "device_browser": req.body.device_browser,
                                    "created_at": created_at,
                                    "created_by": results.insertId,
                                    "updated_by": results.insertId
                                }


                                let sql3 = mysql.format("INSERT INTO log SET ?", logData);
                                res.json({ success: true, message: "User updated successfully" });


                            } else {

                                res.json({success: false, message: "Error", Error: error})
                            }

                        })
                    }
                })
            } else {
                res.json({success: false, message: "Failed : email id is already taken"})
            }
        }

    });

};

exports.deleteAdminUser = function (req, res) {
    var id = req.params.id;
    var updateData = {
        "status": "2"
    };
    var query = connection.query("UPDATE user SET ? WHERE id = ?", [updateData, id], function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "User Deleted Successfully", result});
        }
    });
};


exports.getImageData = function (req, res) {
    var reqPath = req.body.path;
    var str1 = reqPath.split("/");
    if(str1[0] !== 'uploads'){
      return res.json({ success: false, message: "Unauthorized folder access" })
    }
    if(str1.length > 4){
      return res.json({ success: false, message: "Unauthorized folder access" })
    }
    if(str1.length === 4 && str1[2] !== 'banks_documents'){
      return res.json({ success: false, message: "Unauthorized folder access" })
    }
    var pathcheck = fs.existsSync(reqPath)
    if (pathcheck == true) {
        var file_path = path.resolve(reqPath);
        var data = base64Img.base64Sync(file_path);
        res.json({"success": true, data: data});
    } else {
        res.json({success: false, message: "Request file not found"})
    }
}

exports.addmoney = function (req, res) {

    var email = req.query.email;
    var code = req.query.code;
    var amount = req.query.amount;

    var q = connection.query("UPDATE customer_wallet SET total_amount =" + amount + " WHERE currency_code = '" + mysql.escape(code) + "' AND customer_id = (SELECT id FROM customer WHERE email='" + mysql.escape(email) + "')", function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Updated"});
        }
    });

}

exports.adminchangePassword = function (req, res) {
    var email = req.decoded.email;
    let protectRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/;
    if(!protectRegEx.test(req.body.newPassword))
    {
        res.json({success: false, message: "Insecure Password"});
        return null;
    }
    verifyTwoFA.verify2FACode(email, req.body.verify2FA).then((verified)=>{
        if (!verified){
            res.json({ success: false, message: 'Incorrect 2FA verification code' })
        }
        else{
            let sql = mysql.format("SELECT * FROM user WHERE email =?", [email]);
            connection.query(sql, function (error, data) {
                if (error) {
        
                    res.json({success: false, message: "error", error})
                } else if (data[0] == null || data[0] == undefined) {
        
                    res.json({success: false, message: "user not found"})
                } else {
        
                    // console.log(data[0].password)
                    var pwd = bcrypt.compareSync("'" + req.body.currentPassword + "'", data[0].password)
                    if (pwd == true) {
                        var newPassword = bcrypt.hashSync("'" + req.body.newPassword + "'", salt);
                        let sql1 = mysql.format("UPDATE user SET password = '" + newPassword + "' WHERE email = ?", email);
        
                        //console.log(sql1);
                        connection.query(sql1, function (error, result) {
                            if (error) {
                                res.json({success: false, message: "error", error})
                            } else {
                                console.log("connection");
                                var logData = {
                                    "user_id": data[0].id,
                                    "activity_description": 'change password',
                                    "activity_type": '021',
                                    "device_ipAddress": req.body.device_ipAddress,
                                    "device_os": req.body.device_os,
                                    "device_name": req.body.device_name,
                                    "device_browser": req.body.device_browser,
                                    "created_at": created_at,
                                    "created_by": data[0].id,
                                    "updated_by": data[0].id
                                }
        
        
                                let sql2 = mysql.format("INSERT INTO log SET ?", logData)
        
                                //let sql2 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) SELECT id,'change password','021','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at + "',id,id FROM user WHERE email='" + req.decoded.email + "';"
                                //console.log("sql",sql3)
                                connection.query(sql2, function (error, results) {
                                    if (!error) {
                                        //console.log(result)
                                        let mailOptions = {
                                            from: 'Fuleex Exchange<' + config.email + '>', // sender address
                                            to: email, // list of receivers
                                            subject: 'Change password', // Subject line
                                            text: '',
                                            html: "Hello,<br>Your password has been successfully changed.<br>" // html body
                                        };
                                        transporter.sendMail(mailOptions, (error, info) => {
                                            if (error) {
        
                                            }
                                            console.log('Message %s sent: %s', info.messageId, info.response);
        
                                        });
                                        res.json({"success": true, message: "Password Change"})
        
        
                                    } else {
                                        //console.log(error)
                                        res.json({success: false, message: "error", error})
                                    }
                                })
                            }
        
                        })
                    } else {
                        res.json({success: false, message: "Incorrect Current Password"})
                    }
                }
        
            })
        }
    })
  
}



exports.editMyProfile = function (req, res) {

    var email = req.decoded.email;
    var id = req.decoded.id;
    let sql = mysql.format("SELECT * FROM user JOIN admin ON user.id = admin.user_id WHERE user.email =? AND user.id=?", [email, id]);
    connection.query(sql, function (error, data) {

        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {

            res.json({"success": true, "message": "user Information found", data});
        }
    })
}

exports.updateMyProfile = function (req, res) {

    var id = req.decoded.id
    var data = {
        "fullname": req.body.fullname,
        "mobileNumber": req.body.mobileNumber,
        "address": req.body.address,
        "postal_code": req.body.postal_code,
        "country": req.body.country,
        "city": req.body.city,
        "device_ipAddress": req.body.device_ipAddress,
        "device_browser": req.body.device_browser,
        "device_name": req.body.device_name,
        "device_os": req.body.device_os
    }

    let sql = mysql.format("UPDATE admin set ? where user_id=?", [data, id]);

    connection.query(sql, function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else if (result != "") {
            res.json({"success": true, "message": "Data is updated successfully"});
        } else {
            res.json({"success": false, "message": "Data is not updated"});
        }
    })

}


exports.forgotEmail = function (req, res) {
    var email = req.body.forgotEmail;
    let sql1 = mysql.format("SELECT id, email FROM user WHERE email =?", email);

    connection.query(sql1, function (error, resultuser) {
        if (error) {
            console.log(error)
        } else if (resultuser[0] == null || resultuser[0] == undefined) {
            res.json({success: true, message: "We have received your request. If your email exists, you will get a confirmation email to reset login password."})
        } else {

            stoken = { email: req.body.forgotEmail }
            // console.log(stoken)

            var token = jwt.sign(stoken, config.superSecret, {expiresIn: 60 * 30});
            console.log(token)

            link = config.globalDomain + "/adminforgotpasslink?token=" + token;
            //link = req.get('host') + "/#/emailVerify/?id=" + result[0].id;

            var updatedDate = {
                "forgotToken": token
            }


            let sql7 = mysql.format("UPDATE admin SET ? WHERE user_id =?", [updatedDate, resultuser[0].id]);

            connection.query(sql7, function (error, result) {
                if (error) {
                    //console.log(error)
                    res.json({success: false, message: "Error"})
                } else if (result.affectedRows==1){
                    let mailOptions = {
                        from: 'Fuleex Exchange<' + config.email + '>', // sender address
                        to: req.body.forgotEmail, // list of receivers
                        subject: 'Forgot Password', // Subject line
                        text: '',
                        html: "Hello,<br> Please Click on the link to confirm your forgot password request.<br><a href=" + link + ">Click here to change password</a>" // html body
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log("jkjkj", error);
                        }
                        //console.log('Message %s sent: %s', info.messageId, info.response);
                        else {
                            res.json({success: true, message: "We have received your request. If your email exists, you will get a confirmation email to reset login password."})
                        }
                    });
                } else {
                    res.json({success: true, message: "We have received your request. If your email exists, you will get a confirmation email to reset login password."})
                }
            })
        }
    })
}

exports.resetAdminPassword = function (req, res) {
    var tok = req.body.token
    let sql = mysql.format("SELECT * FROM admin WHERE forgotToken =?", tok);

    connection.query(sql, function (error, data) {

        if (error) {
            res.json({success: false, message: "error", error})
        } else if (data[0] == null || data[0] == undefined) {
            res.json({status: -2, message: "Token has been expire"})
        } else {

            var newPassword = bcrypt.hashSync("'" + req.body.password + "'", salt);

            let sql1 = mysql.format("UPDATE user SET password = ? WHERE id = ?", [newPassword, data[0].user_id]);
            // console.log(sql1)
            connection.query(sql1, function (error, result) {
                if (error) {
                    res.json({success: false, message: "error", error})
                } else {

                    var logData = {
                        "user_id": data[0].user_id,
                        "activity_description": 'Admin Forgot Password',
                        "activity_type": '071',
                        "device_ipAddress": req.body.device_ipAddress != undefined ? req.body.device_ipAddress : "0.0.0.0",
                        "device_os": req.body.device_os != undefined ? req.body.device_os : "window",
                        "device_name": req.body.device_name != undefined ? req.body.device_name : "Desktop",
                        "device_browser": req.body.device_browser != undefined ? req.body.device_browser : "chrome",
                        "created_at": created_at,
                        "created_by": data[0].user_id,
                        "updated_by": data[0].user_id
                    }

                    let sql2 = mysql.format("INSERT INTO log SET ?", logData)

                    //let sql2 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) SELECT id,'Customer Forgot Password','061','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at + "',id,id FROM user WHERE id='" + data[0].created_by + "';"
                    //console.log("sql",sql2)
                    connection.query(sql2, function (error, results) {


                        if (!error) {

                            let cus_sql1 = mysql.format("UPDATE admin SET forgotToken = 'NULL' WHERE user_id = ?", [data[0].user_id]);
                            //console.log(sql1)
                            connection.query(cus_sql1, function (error, cusresult) {
                                if (error) {
                                    res.json({success: false, message: "error", error})
                                } else {
                                     let sql1 = mysql.format("SELECT email from user WHERE id = ?", [data[0].user_id]);
                                    // console.log(sql1)
                                        connection.query(sql1, function (error, userEmail) {
                                        if (error) {
                                                res.json({success: false, message});
                                              } else {
                                                let mailOptions = {
                                                from: 'Fuleex Exchange<' + config.email + '>', // sender address
                                                to: userEmail[0].email, // list of receivers
                                                subject: 'Forget Password Success', // Subject line
                                                text: '',
                                                    html: "Hello,<br>Your password has been successfully changed.<br>" // html body
                                            };


                                            transporter.sendMail(mailOptions, (error, info) => {
                                                if (error) {
                                                    res.json({success: true, message: "Error in mail sent"})
                                                }
                                        //console.log('Message %s sent: %s', info.messageId, info.response);
                                                res.json({success: true, message: "Password Reset Successfully"})
                                                });



                                            }
                                        })
                                }


                            })
                        } else {
                            res.json({success: true, message: "Error"})
                        }

                    })
                }
            })

        }

    })
}

exports.checkAdminPasswordToken = function (req, res) {
    var tok = req.body.token
    let sql = mysql.format("SELECT * FROM admin WHERE forgotToken =?", tok);

    connection.query(sql, function (error, data) {

        if (error) {
            res.json({success: false, message: "error", error})
        } else if (data[0] == null || data[0] == undefined) {
            res.json({status: -2, message: "Token has been expire"})
        } else {
            res.json({success: false, message: "error", error})
        }
    });

}
