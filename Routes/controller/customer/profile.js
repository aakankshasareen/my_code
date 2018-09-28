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
var QRCode = require('qrcode');
var base64Img = require('base64-img');
var jwt = require('jsonwebtoken');
const jwtBlacklist = require('jwt-blacklist')(jwt);
var blockiowallet = require('./blockio');
var sumsubkyc = require('./sumsubkyc');
var socketio = require('../../../socket.js').io();
var cm_cfg = require('../../../config/common_config');
let fileName = '',
    fileNameFields = "";
var emailFn = require('./email');
const mmm = require('mmmagic');
let Magic = mmm.Magic;
let magic = new Magic(mmm.MAGIC_MIME_TYPE)

let transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
        user: config.email,
        pass: config.password
    }
});

function created_at() {
    var created = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return created;
}


function addNotification(user_id, link, title) {
    var notifyData = {
        "customer_id": user_id,
        "link": link,
        "title": title
    }
    //socketio.of('/admin').emit('new_notification', { message: title });
    let admin_notify = mysql.format("INSERT INTO admin_notifications set ?", notifyData);
    connection.query(admin_notify, function (error, result) {
        if (error) {
            console.log(error);
            //res.json({ success: false, message: "error", error })
        } else {

            let admin_count = mysql.format("update admin set notification_count = notification_count + 1 where user_id = 1");
            connection.query(admin_count, function (error, result) {
                if (error) {
                    console.log(error);
                    //res.json({ success: false, message: "error", error })
                } else {

                }
            });
            socketio.of('/admin').emit('new_notification', { message: title });
        }
    });
}


exports.userDefaultCountry = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    //console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            //console.log(data[0].name)
            // let sql1 = "SELECT * FROM log WHERE customer_id ='" + data[0].id + "'AND ";

            let sql1 = "Select country from customer where id ='" + data[0].id + "'";
            //console.log(sql)
            connection.query(sql1, function (error, dataa) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {

                    res.json({ success: true, data: dataa[0] })
                }

            })
        }
    })
}



exports.profile = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    //console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            //console.log(req.decoded.email)
            var updateData = {
                "fullname": req.body.fullname,
                "country": req.body.country,
                "address": req.body.address,
                "city": req.body.city,
                "postal_code": req.body.postal_code,
            }


            let sql1 = mysql.format('UPDATE customer SET ? WHERE email= ?', [updateData, email]);
            //let sql1 = "UPDATE customer SET fullname='" + req.body.fullname + "',country='" + req.body.country + "',address ='" + req.body.address + "',city ='" + req.body.city + "',postal_code ='" + req.body.postal_code + "' WHERE email = '" + req.decoded.email + "'";
            //console.log(sql1)
            connection.query(sql1, function (error, result) {
                if (error) {
                    console.log(error)
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {


                    var logData = {
                        "user_id": data[0].created_by,
                        "activity_description": 'Edit Profile',
                        "activity_type": '031',
                        "device_ipAddress": req.body.device_ipAddress,
                        "device_os": req.body.device_os,
                        "device_name": req.body.device_name,
                        "device_browser": req.body.device_browser,
                        "created_at": created_at(),
                        "created_by": data[0].created_by,
                        "updated_by": data[0].created_by
                    }


                    let sql2 = mysql.format("INSERT INTO log SET ?", [logData])


                    //let sql2 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) SELECT id,'edit profile','031','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at + "',id,id FROM user WHERE email='" + req.decoded.email + "';"
                    //console.log(result)
                    connection.query(sql2, function (error, result) {
                        if (error) {
                            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                        } else {
                            var defaultMsg = "Hello,<br>Your Profile has been successfully updated.<br>";
                            emailFn.sendEmail('pr125', req.body.fullname, email, undefined, undefined, undefined, undefined, defaultMsg).then(function () {
                                res.json({ success: true, message: "User Profile Successfully updated" })
                            }).catch(function (err) {
                                res.json({ success: false, message: "Error in Mail" })
                            })
                            // let mailOptions = {
                            //     from: 'Fuleex Exchange<' + config.email + '>', // sender address
                            //     to: req.decoded.email, // list of receivers
                            //     subject: 'Profile Successfully Updated', // Subject line
                            //     text: '',
                            //     html: "Hello,<br>Your Profile has been successfully updated.<br>" // html body
                            // };


                            // transporter.sendMail(mailOptions, (error, info) => {
                            //     if (error) {
                            //         console.log("jkjkj", error);
                            //     }
                            //     // console.log('Message %s sent: %s', info.messageId, info.response);

                            //     res.json({ success: true, message: "User Profile Successfully updated" })

                            // });
                        }
                    })
                }
            })
        }

    })
}

exports.getProfileInfo = function (req, res) {
    var email = req.decoded.email;
    //socketio.of('/admin').emit('new_notification', { message: 'hello' });
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    //console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {

            let lastlogin_sql = "SELECT MAX(created_at) as last FROM log where activity_type='011' and user_id=" + mysql.escape(data[0].created_by) + "";
            connection.query(lastlogin_sql, function (error, lastlogindata) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {

                    obj = { fullname: data[0].fullname, city: data[0].city, country: data[0].country, address: data[0].address, postal_code: data[0].postal_code, date_of_birth: data[0].date_of_birth, birth_place: data[0].birth_place, country_code: data[0].country_code, gender: data[0].gender, mobileNumber: data[0].mobileNumber, lastlogin: lastlogindata[0].last, email: email, profileImage: data[0].profile_image_ext ? `uploads/${data[0].id}/profile.${data[0].profile_image_ext}` : null }
                    res.json({ success: true, message: "Profile info", data: obj, kycStatus: data[0].kyc_status })

                }

            })
        }
    })
}



exports.logout = function (req, res) {

    var email = req.decoded.email;
    var token = req.headers.token;
    jwtBlacklist.blacklist(token);
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);

    //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    //console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            //console.log(req.decoded.email)

            let sql1 = mysql.format("UPDATE customer SET token = 'NULL' WHERE email = ?", [email]);
            //console.log(sql1)
            connection.query(sql1, function (error, result) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {
                    //console.log(result)
                    res.json({ success: true, message: "Successfully logout" })
                }
            })
        }

    })
}



exports.changePassword = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT *,IFNULL(getUserName(type_id),'') as username  FROM user WHERE email =?", [email]);
    console.log(sql);
    //let sql = "SELECT * FROM user WHERE email ='" + req.decoded.email + "'";
    //console.log(sql)
    console.log("SELECT *,IFNULL(getUserName(type_id),'') as username  FROM user WHERE email=?", [email]);
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "user not found" })
        } else {
            console.log(data[0]);
            // console.log(data[0].password)
            var pwd = bcrypt.compareSync("'" + req.body.oldPassword + "'", data[0].password)
            console.log("pass", pwd)

            if (pwd == true) {
                console.log("*************************************")
                var newPassword = bcrypt.hashSync("'" + req.body.newPassword + "'", salt);
                let sql1 = mysql.format("UPDATE user SET password = '" + newPassword + "' WHERE email = ?", email);
                //console.log(sql1)
                connection.query(sql1, function (error, result) {
                    if (error) {
                        res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                    } else {
                        var logData = {
                            "user_id": data[0].id,
                            "activity_description": 'change password',
                            "activity_type": '021',
                            "device_ipAddress": req.body.device_ipAddress,
                            "device_os": req.body.device_os,
                            "device_name": req.body.device_name,
                            "device_browser": req.body.device_browser,
                            "created_at": created_at(),
                            "created_by": data[0].id,
                            "updated_by": data[0].id
                        }
                        let sql2 = mysql.format("INSERT INTO log SET ?", logData)

                        //let sql2 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) SELECT id,'change password','021','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at + "',id,id FROM user WHERE email='" + req.decoded.email + "';"
                        //console.log("sql",sql3)
                        connection.query(sql2, function (error, results) {
                            if (!error) {



                                var defaultMsg = "Hello,<br>Your password has been successfully changed.<br>";
                                emailFn.sendEmail('ch125', data[0].username, data[0].email, undefined, undefined, undefined, undefined, defaultMsg).then(function () {
                                    res.json({ success: true, message: "Password Change" })
                                }).catch(function (err) {
                                    res.json({ success: false, message: "Error in Mail", error: cm_cfg.errorFn(err) })
                                })
                                //  res.json({ success: true, message: "Password Change" })

                            } else {
                                //console.log(error)
                                res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                            }
                        })
                    }

                })
            } else {
                res.json({ success: false, message: "Password not match" })
            }
        }

    })
}

//account
// exports.accountAcivity = function(req, res) {

//     var email = req.decoded.email;
//     let sql = mysql.format("SELECT email,created_by FROM customer WHERE email =?", [email]);
//     //let sql = "SELECT * FROM user WHERE email ='" + req.decoded.email + "'";
//     //console.log(sql)
//     connection.query(sql, function(error, data) {
//         if (error) {
//             res.json({ success: false, message: "error", error })
//         } else if (data[0] == null || data[0] == undefined) {

//             res.json({ success: false, message: "User not found" })
//         } else {
//             // console.log(data[0].name)
//             let sql1 = mysql.format("SELECT * FROM log WHERE user_id =? order by id desc", [data[0].created_by]);
//             //console.log(sql)
//             connection.query(sql1, function(error, dataa) {
//                 if (error) {
//                     res.json({ success: false, message: "error", error })
//                 } else {
//                     //console.log(req.decoded.email)
//                     res.json({ success: true, data: dataa })
//                 }

//             })
//         }
//     })
// }



// exports.accountAcivityFilter = function(req, res) {
//     var email = req.decoded.email;
//     let sql = mysql.format("SELECT email,id FROM user WHERE email =?", [email]);
//     //let sql = "SELECT * FROM user WHERE email ='" + req.decoded.email + "'";
//     console.log(sql)
//     connection.query(sql, function(error, data) {
//         if (error) {
//             res.json({ success: false, message: "error", error })
//         } else if (data[0] == null || data[0] == undefined) {

//             res.json({ success: false, message: "User not found" })
//         } else {

//             var limit = req.body.limit;
//             var offset = (req.body.offset == 'null' ? 0 : req.body.offset);
//             // console.log(data[0].name)
//             // let sql1 = "SELECT * FROM log WHERE customer_id ='" + data[0].id + "'AND ";
//             let sql1 = mysql.format("SELECT * FROM log WHERE user_id =? AND (created_at >=? AND created_at <= ?) order by id desc",[data[0].id,req.body.from,req.body.to])
//             console.log(sql1)
//             connection.query(sql1, function(error, dataa) {
//                 if (error) {
//                     res.json({ success: false, message: "error", error })
//                 } else {
//                     //console.log(req.decoded.email)
//                     res.json({ success: true, data: dataa })
//                 }

//             })
//         }
//     })
// }


exports.accountAcivity = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT email,id FROM user WHERE email =?", [email]);
    //let sql = "SELECT * FROM user WHERE email ='" + req.decoded.email + "'";
    console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {

            var limit = req.body.limit;
            var offset = (req.body.offset == 'null' ? 0 : req.body.offset);
            var dateTo = req.body.date_to
            var dateFrom = req.body.date_from
            var searchQuery = '';

            if (typeof dateTo !== 'undefined' && dateTo !== '' && typeof dateFrom !== 'undefined' && dateFrom !== '') {
                searchQuery += "AND (created_at >='" + dateFrom + "' AND created_at <= '" + dateTo + "')"
            }


            let logcount_sql = "SELECT COUNT( * ) as total from log where user_id = " + mysql.escape(data[0].id) + "" + searchQuery + "";
            console.log(logcount_sql)
            connection.query(logcount_sql, function (error, countdata) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {

                    let log_sql = "SELECT activity_description,device_browser,device_os,device_ipAddress,created_at FROM log WHERE user_id =" + mysql.escape(data[0].id) + "" + searchQuery + "order by id desc LIMIT " + limit + " OFFSET " + offset + "";
                    console.log(log_sql)
                    connection.query(log_sql, function (error, tranmasterdata) {
                        if (error) {
                            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                        } else {

                            res.json({ success: true, message: 'All activity data', data: tranmasterdata, totalcount: countdata[0].total })
                        }

                    })

                }
            })
        }
    })
}

function getSumSubKYCStatus(req, res, cusdata) {

    return new Promise(function (resolve, reject) {

        if (cusdata.applicant_id == null || cusdata.applicant_id == undefined) {
            resolve("no applicant found");
        } else if (cusdata.kyc_status == 2) {
            resolve(2);
        }
        else {

            var request = require('request');
            // Set the headers
            var headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'charset': 'UTF-8'
            }

            // Configure the request
            var options = {
                url: config.sumsub_api_url + '/resources/applicants/' + cusdata.applicant_id + '/status?key=' + config.sumsub_api_key,
                method: 'GET',
                headers: headers,
                json: true,
                body: {}
            };
            // Start the request
            request(options, function (error, response) {

                if (!error) {
                    if (response.body != undefined && response.body.id != undefined) {
                        // if applicant id generated then save to database
                        var updatePromise = updateKYCStatus(req, res, response.body, cusdata.id, cusdata.email);
                        updatePromise.then(function (status) {
                            resolve(status);
                        }, function (error) {
                            resolve(error);
                        })
                    } else if (response.body != undefined && response.body.correlationId != undefined) {
                        resolve("could not get subsum KYC status");
                    } else {
                        resolve("error in get subsum KYC status");
                    }
                } else {
                    console.log(error);
                }
            });

        }

    });
};

/**
 *  save valid applicant details to database
 */
function updateKYCStatus(req, res, sumsubresponse = '', customer_id, customer_email) {
    return new Promise(function (resolve, reject) {
        var updatedStatus = 0;
        if (sumsubresponse.reviewStatus == 'init') {
            updatedStatus = 0;
        } else if (sumsubresponse.reviewStatus == 'pending' || sumsubresponse.reviewStatus == 'queued' || sumsubresponse.reviewStatus == 'awaitingUser') {
            updatedStatus = 1;

        } else if ((sumsubresponse.reviewStatus == 'completed' || sumsubresponse.reviewStatus == 'completedSent' || sumsubresponse.reviewStatus == 'completedSentFailure') && sumsubresponse.reviewResult != undefined && sumsubresponse.reviewResult.reviewAnswer == "GREEN") {
            updatedStatus = 2;
        } else if (sumsubresponse.reviewResult.reviewAnswer == "RED") {
            updatedStatus = 3;
        }
        var updateData = {
            "kyc_status": updatedStatus,
            "kyc_status_comment": sumsubresponse.reviewStatus,
        }

        connection.query("UPDATE customer SET ? WHERE id = ?", [updateData, customer_id], function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });

    });
};


//kyc
exports.getKycStatus = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT email,id FROM customer WHERE email =?", [email]);

    //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    //console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            // console.log(data)
            let addressstatus_sql = mysql.format("Select kaddress_status from customer_address where customer_id=? and doc_type=5", [data[0].id])
            //console.log(addressstatus_sql)
            connection.query(addressstatus_sql, function (error, adddata) {
                if (error) {
                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) })
                } else {
                    //  console.log("adddata", adddata)
                    let docstatus_sql = mysql.format("Select id_status from customer_document where customer_id=? and doc_type=1", [data[0].id])
                    // console.log(docstatus_sql)
                    connection.query(docstatus_sql, function (error, docdata) {
                        if (error) {
                            res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) })
                        } else {
                            //  console.log("doc", docdata)
                            let personalstatus_sql = mysql.format("Select kpersonal_status,kyc_status,kyc_status_comment from customer where id=?", [data[0].id])
                            //  console.log(personalstatus_sql)
                            connection.query(personalstatus_sql, function (error, parsonaldata) {
                                if (error) {
                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) })
                                } else {
                                    // console.log("per", parsonaldata)
                                    if (docdata[0] == null && adddata[0] == null) {
                                        res.json({ success: true, message: "All KYC status", personalinfo: parsonaldata[0].kpersonal_status, idinfo: 0, addressinfo: 0, completeinfo: parsonaldata[0].kyc_status, comment: parsonaldata[0].kyc_status_comment })
                                    } else if (adddata[0] == null || adddata[0] == undefined) {
                                        res.json({ success: true, message: "All KYC status", personalinfo: parsonaldata[0].kpersonal_status, idinfo: docdata[0].id_status, addressinfo: 0, completeinfo: parsonaldata[0].kyc_status, comment: parsonaldata[0].kyc_status_comment })
                                    } else if (docdata[0] == null || docdata[0] == undefined) {
                                        res.json({ success: true, message: "All KYC status", personalinfo: parsonaldata[0].kpersonal_status, idinfo: 0, addressinfo: adddata[0].kaddress_status, completeinfo: parsonaldata[0].kyc_status, comment: parsonaldata[0].kyc_status_comment })
                                    } else {

                                        res.json({ success: true, message: "All KYC status", personalinfo: parsonaldata[0].kpersonal_status, idinfo: docdata[0].id_status, addressinfo: adddata[0].kaddress_status, completeinfo: parsonaldata[0].kyc_status, comment: parsonaldata[0].kyc_status_comment })

                                    }
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

// //kyc
// exports.getKycStatus = function (req, res) {
//     var email = req.decoded.email;
//     let sql = mysql.format("SELECT email,id FROM customer WHERE email =?", [email]);

//     //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
//     //console.log(sql)
//     connection.query(sql, function (error, data) {
//         if (error) {
//             res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
//         } else if (data[0] == null || data[0] == undefined) {

//             res.json({ success: false, message: "User not found" })
//         } else {
//             // console.log(data)
//             let addressstatus_sql = mysql.format("Select kaddress_status from customer_address where customer_id=? and doc_type=5", [data[0].id])
//             //console.log(addressstatus_sql)
//             connection.query(addressstatus_sql, function (error, adddata) {
//                 if (error) {
//                     res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) })
//                 } else {
//                     //  console.log("adddata", adddata)
//                     let docstatus_sql = mysql.format("Select id_status from customer_document where customer_id=? and doc_type=1", [data[0].id])
//                     // console.log(docstatus_sql)
//                     connection.query(docstatus_sql, function (error, docdata) {
//                         if (error) {
//                             res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) })
//                         } else {
//                             //  console.log("doc", docdata)
//                             let personalstatus_sql = mysql.format("Select kpersonal_status,kyc_status,kyc_status_comment from customer where id=?", [data[0].id])
//                             //  console.log(personalstatus_sql)
//                             connection.query(personalstatus_sql, function (error, parsonaldata) {
//                                 if (error) {
//                                     res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) })
//                                 } else {
//                                     // console.log("per", parsonaldata)
//                                     if (docdata[0] == null && adddata[0] == null) {
//                                         res.json({ success: true, message: "All kyc status", personalinfo: parsonaldata[0].kpersonal_status, idinfo: 0, addressinfo: 0, completeinfo: parsonaldata[0].kyc_status, comment: parsonaldata[0].kyc_status_comment })
//                                     } else if (adddata[0] == null || adddata[0] == undefined) {
//                                         res.json({ success: true, message: "All kyc status", personalinfo: parsonaldata[0].kpersonal_status, idinfo: docdata[0].id_status, addressinfo: 0, completeinfo: parsonaldata[0].kyc_status, comment: parsonaldata[0].kyc_status_comment })
//                                     } else if (docdata[0] == null || docdata[0] == undefined) {
//                                         res.json({ success: true, message: "All kyc status", personalinfo: parsonaldata[0].kpersonal_status, idinfo: 0, addressinfo: adddata[0].kaddress_status, completeinfo: parsonaldata[0].kyc_status, comment: parsonaldata[0].kyc_status_comment })
//                                     } else {

//                                         res.json({ success: true, message: "All kyc status", personalinfo: parsonaldata[0].kpersonal_status, idinfo: docdata[0].id_status, addressinfo: adddata[0].kaddress_status, completeinfo: parsonaldata[0].kyc_status, comment: parsonaldata[0].kyc_status_comment })

//                                     }
//                                 }
//                             })
//                         }
//                     })
//                 }
//             })
//         }
//     })
// }

/**
 *  api to get or create new applicant id
 */

exports.getApplicantId = function (req, res) {

    //res.json({ success: true, message: "success", applicant_id:'1234566665'  });

    var email = req.body.email;
    console.log("Emailss", email)
    //let sql = mysql.format("SELECT c.id,c.applicant_id,c.email,c.fullname,c.kyc_status,d.image_type,d.id_doc_type, d.image_status,d.image_url FROM customer c LEFT JOIN sumsub_documents d ON d.customer_id = c.id WHERE c.email =?", [email]);
    let sql = mysql.format("SELECT c.id,c.applicant_id,c.email,c.fullname,c.kyc_status FROM customer c WHERE c.email =?", [email]);
    // sql query check if applicant id exist where email  = email
    // (data[0] == null || data[0] == undefined) {

    //     res.json({ success: false, message: "User not found" })
    connection.query(sql, function (error, result) {

        if (error) {
            res.json({ success: false, message: "error", applicant_id: 'null' })
        } else if (result[0].applicant_id != null) {
            let sql1 = mysql.format("SELECT d.image_type,d.id_doc_type, d.image_status,d.image_url FROM sumsub_documents d WHERE d.customer_id =?"[result[0].id]);
            connection.query(sql1, function (error, result1) {
                res.json({ success: true, message: "success", applicant_id: result[0].applicant_id, email: result[0].email, name: result[0].fullname, kyc_status: result[0].kyc_status, info: result1 });
            });
        } else {
            var applicentid = createApplicentsId(req, res, result[0])
            applicentid.then(function (applicant_id) {
                console.log("RAhul", applicant_id)
                res.json({ success: true, message: "successess", applicant_id: applicant_id.id, email: applicant_id.email, name: applicant_id.info.firstName, kyc_status: result[0].kyc_status });
            })

        }

    })



}


function createApplicentsId(req, res, cusdata) {

    return new Promise(
        function (resolve, reject) {

            var request = require('request');
            // Set the headers
            var headers = {
                'User-Agent': 'application/json',
                'Accept': 'application/json'
            }

            // Configure the request
            var options = {
                url: config.sumsub_api_url + '/resources/applicants?key=' + config.sumsub_api_key,
                method: 'POST',
                headers: headers,
                json: true,
                body: {
                    "email": cusdata.email,
                    "externalUserId": cusdata.email,
                    "requiredIdDocs": {
                        // country for which the check is done.
                        // leave 'null' for international checks
                        "includedCountries": ["IND"],
                        "country": cusdata.country_code,
                        "docSets": [{
                            // type of an id doc set
                            "idDocSetType": "IDENTITY",
                            // types of the documents allowed for this id doc set
                            "types": ["ID_CARD"],
                            "title": 'Provide your ID card',
                            "instructions": 'Please make photo of your ID card.',

                            // if you want enable support for double-sided documents, provide this type
                            // or leave 'null' for you are interested just in one side
                            "subTypes": null
                        }, {
                            // another id doc set that supports just 1 document
                            "idDocSetType": "SELFIE",
                            "types": ["SELFIE"],
                            "subTypes": null
                        },
                        {
                            // type of an id doc set
                            "idDocSetType": "IDENTITY2",
                            // types of the documents allowed for this id doc set
                            "types": ["PASSPORT"],
                            // if you want enable support for double-sided documents, provide this type
                            // or leave 'null' for you are interested just in one side
                            "subTypes": ["FRONT_SIDE", "BACK_SIDE"]
                        }
                        ]
                    },
                    "info": {
                        "country": cusdata.country_code,
                        "firstName": cusdata.fullname,
                        "middleName": "",
                        "lastName": "",
                        "phone": cusdata.mobileNumber,
                        "dob": cusdata.date_of_birth,
                        "placeOfBirth": cusdata.birth_place,
                        "kyc_status": cusdata.kyc_status
                    }
                }
            };

            // Start the request
            request(options, function (error, response) {
                console.log("in create applicant");
                console.log('response', response.body);
                if (!error) {
                    if (response.body.id != undefined) {
                        // if applicant id generated then save to database
                        saveApplicantDetails(req, res, response.body, cusdata.id)
                            .then(result => {
                                resolve(response.body);
                                response.json({ success: true, message: "applicant_id inserted", sumsubtoken: response.body.id })
                                return response.send("Hello")
                            })
                            .catch(error => {
                                reject(error);
                            });
                    } else if (response.body.correlationId != undefined) {
                        console.log("error happened");
                    }
                } else {
                    console.log(error);
                }
            });

        });
};



function createApplicantId(req, res, cusdata) {

    return new Promise(
        function (resolve, reject) {

            var request = require('request');
            // Set the headers
            var headers = {
                'User-Agent': 'application/json',
                'Accept': 'application/json'
            }

            // Configure the request
            var options = {
                url: config.sumsub_api_url + '/resources/applicants?key=' + config.sumsub_api_key,
                method: 'POST',
                headers: headers,
                json: true,
                body: {
                    "email": cusdata.email,
                    "externalUserId": cusdata.email,
                    "requiredIdDocs": {
                        // country for which the check is done.
                        // leave 'null' for international checks
                        "includedCountries": ["IND"],
                        "country": cusdata.country_code,
                        "docSets": [
                            {
                                // type of an id doc set
                                "idDocSetType": "IDENTITY",
                                // types of the documents allowed for this id doc set
                                "types": ["ID_CARD"],
                                // "title": 'Provide your ID card',
                                // "instructions": 'Please make photo of your ID card.',

                                // if you want enable support for double-sided documents, provide this type
                                // or leave 'null' for you are interested just in one side
                                "subTypes": null
                            },
                            {
                                // another id doc set that supports just 1 document
                                "idDocSetType": "SELFIE",
                                "types": ["SELFIE"],
                                "subTypes": null
                            },
                            {
                                // type of an id doc set
                                "idDocSetType": "IDENTITY2",
                                // types of the documents allowed for this id doc set
                                "types": ["PASSPORT"],
                                // if you want enable support for double-sided documents, provide this type
                                // or leave 'null' for you are interested just in one side
                                "subTypes": ["FRONT_SIDE", "BACK_SIDE"]
                            }
                        ]
                    },
                    "info": {
                        "country": cusdata.country_code,
                        "firstName": cusdata.fullname,
                        "middleName": "",
                        "lastName": "",
                        "phone": cusdata.mobileNumber,
                        "dob": cusdata.date_of_birth,
                        "placeOfBirth": cusdata.birth_place
                    }
                }
            };
            console.log('Hello', options);
            // Start the request
            request(options, function (error, response) {
                console.log("in create applicant");
                console.log('response', response.body);
                if (!error) {
                    if (response.body.id != undefined) {
                        // if applicant id generated then save to database
                        saveApplicantDetails(req, res, response.body, cusdata.id)
                            .then(result => {
                                resolve(response.body);

                            })
                            .catch(error => {
                                reject(error);
                            });
                    } else if (response.body.correlationId != undefined) {
                        console.log("error happened");
                    }
                } else {
                    console.log(error);
                }
            });

        });
};




/**
 *  save valid applicant details to database
 */
function saveApplicantDetails(req, res, sumsubresponse = '', customer_id) {

    return new Promise(
        function (resolve, reject) {
            var updateData = {
                "inspection_id": sumsubresponse.inspectionId,
                "client_id": sumsubresponse.clientId,
                "applicant_id": sumsubresponse.id,
                "job_id": sumsubresponse.jobId
            }
            connection.query("UPDATE customer SET ? WHERE id = ?", [updateData, customer_id], function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });

        });

};

function generateIframeToken(req, res) {
    var customer_id = req.decoded.customer_id;
    var request = require('request');
    // Set the headers
    var headers = {
        'User-Agent': 'application/json',
        'Accept': 'application/json'
    }

    // Configure the request
    var options = {
        url: config.sumsub_api_url + '/resources/accessTokens?userId=' + customer_id + '&key=' + config.sumsub_api_key,
        method: 'POST',
        headers: headers
    };
    // Start the request
    request(options, function (error, response) {
        sumsubres = JSON.parse(response.body);
        if (!error) {
            if (sumsubres.token != undefined) {
                // if applicant id generated then save to database                
                res.json({ success: true, message: "token success", sumsubtoken: sumsubres.token })
            } else if (response.body.correlationId != undefined) {

            }
        } else {

        }
    });
}

/**
 *  save valid applicant details to database
 */
exports.getIframeToken = function (req, res) {
    var customer_id = req.decoded.customer_id;
    let sq = mysql.format("SELECT * FROM customer WHERE id =?", customer_id);

    connection.query(sq, function (error, cusdata) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else {
            if (cusdata[0].applicant_id == null || cusdata[0].applicant_id.length <= 0) {
                console.log("customer id", cusdata[0].applicant_id)
                //console.log("customer id",cusdata[0].applicant_id.length)


                createApplicantId(req, res, cusdata[0]).then(result => {
                    return generateIframeToken(req, res);
                });
            } else {
                console.log("Hello Rahul")
                return generateIframeToken(req, res);
            }
        }
    });
};

/**
 *  save valid applicant details to database
 */
exports.kycCallback = function (req, res) {
    var externalid = req.body.externalUserId;
    var kyc_response = req.body;
    console.log(req.body);
    if ((kyc_response !== null || kyc_response !== undefined) && (kyc_response.type != undefined && kyc_response.type == 'INSPECTION_REVIEW_COMPLETED')) {
        var updated_status = 0;
        if (req.body.review.reviewAnswer == 'GREEN') {
            updated_status = 2;
            sumsubkyc.getSumSubDocuments(req, res, externalid);
        } else if (req.body.review.reviewAnswer == 'RED') {
            sumsubkyc.getSumSubDocuments(req, res, externalid);
            updated_status = 3;
        }
        var updateData = {
            "kyc_status": updated_status
        }

        connection.query("UPDATE customer SET ? WHERE email = ?", [updateData, externalid], function (error, result) {
            if (error) {

            } else {

                var insertData = {
                    "external_id": externalid,
                    "response": JSON.stringify(req.body),
                }

                let insert_log_sql = mysql.format("insert into subsum_kyc_callback_log SET ?", insertData);
                connection.query(insert_log_sql, function (error, dta) {
                    //connection.commit(function(err) {
                    //  res.json({ success: true, message: "Email changed successfully", error });
                    //});

                });

            }
        });


    }
    res.json({ success: true, message: "callback recieved" })
};


exports.getProfile = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT email,id FROM customer WHERE email =?", [email]);
    //console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            let sql1 = "SELECT customer.id, inspection_id, client_id, applicant_id, job_id, country, fullname,date_of_birth, birth_place, country_code, gender, mobileNumber,customer_document.filename1,customer_document.f_b_type,CONCAT('uploads/',customer_document.customer_id,'/',filename1)as document_path FROM customer left join customer_document on customer_document.customer_id=customer.id and customer_document.doc_type=3 where customer.id=" + mysql.escape(data[0].id) + "";
            //let sql1 = "SELECT fullname,date_of_birth, birth_place, country_code, gender, mobileNumber,customer_document.filename1,CONCAT('uploads/',customer_document.customer_id,'/',filename1)as document_path FROM customer left join customer_document on customer_document.customer_id=customer.id where customer.id='" + data[0].id + "' and doc_type=3";
            connection.query(sql1, function (error, sqldata) {
                //console.log(sql1);
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else if (sqldata[0] == null || sqldata[0] == undefined) {
                    res.json({ success: false, message: "Data not found" })
                } else {
                    //console.log(sqldata)
                    //obj = { fullname: data[0].fullname, city: data[0].city, country: data[0].country, address: data[0].address, postal_code: data[0].postal_code, date_of_birth: data[0].date_of_birth, birth_place: data[0].birth_place, country_code: data[0].country_code, gender: data[0].gender, mobileNumber: data[0].mobileNumber }
                    res.json({ success: true, message: "kyc Profile info", data: sqldata[0] })

                }

            })
        }
    })
}

exports.getAddress = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT email,id FROM customer WHERE email =?", [email]);
    //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    //console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            //console.log(data[0].id)
            //let sql1 = "SELECT * FROM customer_address WHERE customer_id ='" + data[0].id + "'";
            let sql1 = mysql.format("SELECT customer_document.customer_id,customer_document.original_filename, customer_document.doc_name,customer_document.f_b_type,customer_document.filename1,CONCAT('uploads/',customer_document.customer_id,'/',filename1) as document_path,ca.country,ca.address,ca.pin_code,ca.city,ca.doc_type,ca.state,ca.type,ca.doc_type FROM customer_address AS ca inner join customer_document ON customer_document.doc_type =ca.doc_type  WHERE (ca.doc_type=5 or ca.doc_type=2) and ca.customer_id=? AND customer_document.customer_id = ?", [data[0].id, data[0].id]);
            // console.log(sql1)
            connection.query(sql1, function (error, adddata) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else if (adddata[0] == null || adddata[0] == undefined) {

                    res.json({ success: false, message: "address details not found" })
                } else {
                    // obj = { fullname: data[0].fullname, city: data[0].city, country: data[0].country, address: data[0].address, postal_code: data[0].postal_code }
                    res.json({ success: true, message: "Address details", data: adddata })

                }

            })
        }
    })
}


// exports.getDocumentDetails = function (req, res) {
//     var customer_id = req.decoded.customer_id;

//     var get_image_sql = mysql.format("SELECT * from sumsub_documents where customer_id = ?", [customer_id]);
//     connection.query(get_image_sql, function(error, data) {            
//         if (error) {
//             res.json({ success: false, message: "No response from sumsub" });
//         }else if(data[0] != null && data[0] != undefined){
//             res.json({ success: true, message: "Success", data:data });
//         }else {
//             res.json({ success: false, message: "No response from sumsub" });
//         }
//     });
// }


exports.getDocumentDetails = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT email,id FROM customer WHERE email =?", [email]);
    //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    //console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            //console.log(data[0].id)
            let sql1 = mysql.format("SELECT *,CONCAT('uploads/',customer_document.customer_id,'/',filename1) as document_path FROM customer_document WHERE customer_id =? and (doc_type=1 or doc_type=4)", [data[0].id]);
            //console.log(sql1)
            connection.query(sql1, function (error, adddata) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else if (adddata[0] == null || adddata[0] == undefined) {

                    res.json({ success: false, message: "document details not found" })
                } else {
                    // obj = { fullname: data[0].fullname, city: data[0].city, country: data[0].country, address: data[0].address, postal_code: data[0].postal_code }
                    res.json({ success: true, message: "Id details", data: adddata })

                }

            })
        }
    })
}

function changestatus(custoId) {
    addNotification(custoId, '/admin/edit-customer-kyc/' + custoId, 'New Kyc Updated');
    return new Promise(function (resolve, reject) {

        let addressstatus_sql = "Select kaddress_status from customer_address where customer_id='" + custoId + "' and doc_type=5"
        connection.query(addressstatus_sql, function (error, adddata) {
            if (error) {
                console.log(error)
                reject(error)
            } else {
                //console.log("adddata", adddata)
                let docstatus_sql = "Select id_status from customer_document where customer_id='" + custoId + "' and doc_type=1"
                connection.query(docstatus_sql, function (error, docdata) {
                    if (error) {
                        console.log(error)
                        reject(error)
                    } else {
                        //console.log("doc", docdata)
                        let personalstatus_sql = "Select kpersonal_status from customer where id='" + custoId + "'"
                        connection.query(personalstatus_sql, function (error, parsonaldata) {
                            if (error) {
                                console.log(error)
                                reject(error)
                            } else {
                                // console.log("per", parsonaldata)
                                if (adddata[0] == null || adddata[0] == undefined || docdata[0] == null || docdata[0] == undefined || adddata[0].kaddress_status == 0 || docdata[0].id_status == 0 || parsonaldata[0].kpersonal_status == 0) {
                                    //console.log("something is empty ")
                                    resolve("something is empty")
                                } else if (adddata[0].kaddress_status == 1 && docdata[0].id_status == 1 && parsonaldata[0].kpersonal_status == 1) {
                                    // console.log("status going to be change")
                                    let updatestatus_sql = "UPDATE customer SET kyc_status ='1' WHERE id = '" + custoId + "'";
                                    connection.query(updatestatus_sql, function (error, dta) {
                                        if (error) {
                                            console.log(error)
                                            reject(error)
                                        } else {

                                            resolve("status going to be change")
                                        }
                                    })

                                } else {
                                    //console.log("nothing to change in the status")
                                    resolve("nothing to change in the status")
                                }
                            }
                        })
                    }
                })
            }
        })
    })
}


exports.documentData = function (req, res) {

    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    //console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            let sq = mysql.format('SELECT * FROM customer_document WHERE customer_id =? and doc_type=?', [data[0].id, req.body.doc_type]);

            //let sq = "SELECT * FROM customer_document WHERE customer_id ='" + data[0].id + "' and doc_type='" + req.body.doc_type + "'";
            //console.log(sq)
            connection.query(sq, function (error, docdata) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else if (docdata[0] == null || docdata[0] == undefined) {
                    if (req.body.doc_type == 1) {
                        // console.log(req.body.expiration_date)
                        if (req.body.expiration_date == '' || req.body.expiration_date == 'null') {

                            var insertData = {
                                "customer_id": data[0].id,
                                "doc_type": req.body.doc_type,
                                "doc_name": req.body.doc_name,
                                "doc_reference": req.body.doc_reference,
                                "issue_date": req.body.issue_date,
                                "expiration_date": null,
                                "issuing_country": req.body.issuing_country,
                                "created_at": created_at(),
                                "id_status": 1,
                                "f_b_type": 1
                            }

                            let sql1 = mysql.format("INSERT INTO customer_document SET ?", [insertData])
                            console.log(sql1)

                            //let sql1 = "INSERT INTO customer_document (customer_id,doc_type,doc_name,doc_reference,issue_date,expiration_date,issuing_country,created_at,id_status,f_b_type) values ('" + data[0].id + "','" + req.body.doc_type + "','" + req.body.doc_name + "','" + req.body.doc_reference + "','" + req.body.issue_date + "',null,'" + req.body.issuing_country + "','" + created_at + "',1,1);"
                            //console.log(sql1)
                            connection.query(sql1, function (error, dta) {
                                if (error) {
                                    console.log(error)
                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                } else {
                                    changestatus(data[0].id).then(function (status) {
                                        res.json({ success: true, message: "Successfully save id proof details" })
                                    }, function (error) {
                                        console.log(error)
                                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                    })
                                }
                            })
                        } else {
                            var insertData = {
                                "customer_id": data[0].id,
                                "doc_type": req.body.doc_type,
                                "doc_name": req.body.doc_name,
                                "doc_reference": req.body.doc_reference,
                                "issue_date": req.body.issue_date,
                                "expiration_date": req.body.expiration_date,
                                "issuing_country": req.body.issuing_country,
                                "created_at": created_at(),
                                "id_status": 1,
                                "f_b_type": 1
                            }

                            let sql1 = mysql.format("INSERT INTO customer_document SET ?", insertData)
                            // let sql1 = "INSERT INTO customer_document (customer_id,doc_type,doc_name,doc_reference,issue_date,expiration_date,issuing_country,created_at,id_status,f_b_type) values ('" + data[0].id + "','" + req.body.doc_type + "','" + req.body.doc_name + "','" + req.body.doc_reference + "','" + req.body.issue_date + "','" + req.body.expiration_date + "','" + req.body.issuing_country + "','" + created_at + "',1,1);"
                            //console.log(sql1)
                            connection.query(sql1, function (error, dta) {
                                if (error) {
                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                } else {
                                    changestatus(data[0].id).then(function (status) {
                                        res.json({ success: true, message: "Successfully save id proof details" })
                                    }, function (error) {
                                        console.log(req.body.expiration_date)
                                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                    })
                                }
                            })

                        }
                    } else if (req.body.doc_type == 3) {

                        var insertData = {
                            "customer_id": data[0].id,
                            "doc_type": req.body.doc_type,
                            "doc_name": 'photo',
                            "created_at": created_at(),
                            "f_b_type": 1
                        }


                        let sql1 = mysql.format("INSERT INTO customer_document SET ?", insertData)

                        //let sql1 = "INSERT INTO customer_document (customer_id,doc_type,doc_name,created_at) values ('" + data[0].id + "','" + req.body.doc_type + "','photo','" + created_at + "');"
                        //console.log(sql1)
                        connection.query(sql1, function (error, dta) {
                            if (error) {
                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                            } else {
                                var updateData = {
                                    "fullname": req.body.fullname,
                                    "gender": req.body.gender,
                                    "date_of_birth": req.body.date_of_birth,
                                    "birth_place": req.body.birth_place,
                                    "country_code": req.body.country_code,
                                    "kpersonal_status": 1,
                                    "mobileNumber": req.body.mobileNumber
                                }
                                console.log("..................", updateData)
                                let sql2 = mysql.format('UPDATE customer SET ? WHERE id = ?', [updateData, data[0].id])

                                //let sql2 = "UPDATE customer SET fullname='" + req.body.fullname + "', gender ='" + req.body.gender + "',date_of_birth='" + req.body.date_of_birth + "',birth_place='" + req.body.birth_place + "',country_code ='" + req.body.country_code + "',kpersonal_status=1 WHERE id = '" + data[0].id + "'";
                                connection.query(sql2, function (error, dta) {
                                    if (error) {
                                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                    } else {
                                        changestatus(data[0].id).then(function (status) {
                                            res.json({ success: true, message: "Successfully save personal info details" })
                                        }, function (error) {
                                            res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                        })

                                    }
                                })
                            }
                        })

                    } else if (req.body.doc_type == 2) {
                        var insertData = {
                            "customer_id": data[0].id,
                            "doc_type": req.body.doc_type,
                            "doc_name": req.body.doc_name,
                            "created_at": created_at(),
                            "f_b_type": 1
                        }
                        let sql1 = mysql.format("INSERT INTO customer_document SET ?", insertData)
                        //let sql1 = "INSERT INTO customer_document (customer_id,doc_type,doc_name,created_at) values ('" + data[0].id + "','" + req.body.doc_type + "','" + req.body.doc_name + "','" + created_at + "');"
                        //console.log(sql1)
                        connection.query(sql1, function (error, dta) {
                            if (error) {
                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                            } else {
                                //console.log(req.body.city)
                                //console.log(typeof(req.body.city))
                                var city = ((req.body.city == '' || req.body.city == 'null') ? null : req.body.city)
                                var state = ((req.body.state == '' || req.body.state == 'null') ? null : req.body.state)
                                var country = ((req.body.country == '' || req.body.country == 'null') ? null : req.body.country)

                                var addrData = {
                                    "customer_id": data[0].id,
                                    "address": req.body.address,
                                    "pin_code": req.body.pin_code,
                                    "city": city,
                                    "state": state,
                                    "country": country,
                                    "type": 1,
                                    "doc_type": req.body.doc_type,
                                    "created_at": created_at()
                                }

                                let sql2 = mysql.format("INSERT INTO customer_address SET ?", addrData)
                                //let sql2 = "INSERT INTO customer_address (customer_id,address,pin_code,city,state,country,type,doc_type,created_at) values ('" + data[0].id + "','" + req.body.address + "','" + req.body.pin_code + "','" + req.body.city + "','" + req.body.state + "','" + req.body.country + "','1','" + req.body.doc_type + "','" + created_at + "');"

                                connection.query(sql2, function (error, dta) {
                                    if (error) {
                                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                    } else {
                                        changestatus(data[0].id).then(function (status) {
                                            res.json({ success: true, message: "Successfully save  Permanent address proof details" })
                                        }, function (error) {
                                            res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                        })

                                    }
                                })
                            }
                        })
                    } else if (req.body.doc_type == 5) {
                        var insertData = {
                            "customer_id": data[0].id,
                            "doc_type": req.body.doc_type,
                            "doc_name": req.body.doc_name,
                            "created_at": created_at(),
                            "f_b_type": 1
                        }

                        let sql1 = mysql.format("INSERT INTO customer_document SET ?", insertData)

                        // let sql1 = "INSERT INTO customer_document (customer_id,doc_type,doc_name,created_at) values ('" + data[0].id + "','" + req.body.doc_type + "','" + req.body.doc_name + "','" + created_at + "');"
                        //console.log(sql1)
                        connection.query(sql1, function (error, dta) {
                            if (error) {
                                res.json({ success: false, message: "Error", error: error });
                            } else {

                                var addrData = {

                                    "customer_id": data[0].id,
                                    "address": req.body.res_address,
                                    "pin_code": req.body.res_pin_code,
                                    "city": req.body.res_city,
                                    "state": req.body.res_state,
                                    "country": req.body.res_country,
                                    "type": 2,
                                    "doc_type": req.body.doc_type,
                                    "created_at": created_at(),
                                    "kaddress_status": 1

                                }



                                let sql3 = mysql.format("INSERT INTO customer_address SET ?", addrData)


                                //let sql3 = "INSERT INTO customer_address (customer_id,address,pin_code,city,state,country,type,doc_type,created_at,kaddress_status) values ('" + data[0].id + "','" + req.body.res_address + "','" + req.body.res_pin_code + "','" + req.body.res_city + "','" + req.body.res_state + "','" + req.body.res_country + "','2','" + req.body.doc_type + "','" + created_at + "',1);"

                                connection.query(sql3, function (error, dta) {
                                    if (error) {
                                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                    } else {
                                        changestatus(data[0].id).then(function (status) {
                                            res.json({ success: true, message: "Successfully save Residential address proof details" })
                                        }, function (error) {
                                            res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                        })


                                    }
                                })
                            }
                        })
                    } else {
                        res.json({ success: false, message: "Cannot upload document" });
                    }
                } else {
                    //console.log({ success: false, message: "already save" })

                    if (req.body.doc_type == 1) {
                        // console.log(req.body.expiration_date)
                        if (req.body.expiration_date == '' || req.body.expiration_date == 'null') {

                            updatedData = {
                                "doc_name": req.body.doc_name,
                                "doc_reference": req.body.doc_reference,
                                "issue_date": req.body.issue_date,
                                "expiration_date": null,
                                "issuing_country": req.body.issuing_country
                            }


                            let sql1 = mysql.format('UPDATE customer_document SET ? where customer_id=? and doc_type=?', [updatedData, data[0].id, req.body.doc_type])


                            //let sql1 = "UPDATE customer_document SET doc_name='" + req.body.doc_name + "',doc_reference='" + req.body.doc_reference + "',issue_date='" + req.body.issue_date + "',expiration_date=null,issuing_country='" + req.body.issuing_country + "'where customer_id='" + data[0].id + "' and doc_type='" + req.body.doc_type + "'";
                            //console.log(sql1)
                            connection.query(sql1, function (error, dta) {
                                if (error) {
                                    res.json({ success: false, message: "Error", error: error });
                                } else {
                                    console.log(dta.changedRows)
                                    if (dta.changedRows !== 0) {

                                        changestatus(data[0].id).then(function (status) {
                                            res.json({ success: true, message: "Successfully updated id proof details" })
                                        }, function (error) {
                                            res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                        })

                                    } else {
                                        res.json({ success: true, message: "Successfully updated id proof details" })
                                    }
                                }
                            })
                        } else {
                            updatedData = {
                                "doc_name": req.body.doc_name,
                                "doc_reference": req.body.doc_reference,
                                "issue_date": req.body.issue_date,
                                "expiration_date": req.body.expiration_date,
                                "issuing_country": req.body.issuing_country
                            }


                            let sql1 = mysql.format('UPDATE customer_document SET ? where customer_id=? and doc_type=?', [updatedData, data[0].id, req.body.doc_type])


                            //let sql1 = "UPDATE customer_document SET doc_name='" + req.body.doc_name + "',doc_reference='" + req.body.doc_reference + "',issue_date='" + req.body.issue_date + "',expiration_date='" + req.body.expiration_date + "',issuing_country='" + req.body.issuing_country + "'where customer_id='" + data[0].id + "' and doc_type='" + req.body.doc_type + "'";
                            //console.log(sql1)
                            connection.query(sql1, function (error, dta) {
                                if (error) {
                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                } else {
                                    console.log(dta.changedRows)
                                    if (dta.changedRows !== 0) {

                                        changestatus(data[0].id).then(function (status) {
                                            res.json({ success: true, message: "Successfully updated id proof details" })
                                        }, function (error) {
                                            res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                        })

                                    } else {
                                        res.json({ success: true, message: "Successfully updated id proof details" })
                                    }
                                }
                            })
                        }
                    } else if (req.body.doc_type == 3) {


                        let sql1 = mysql.format("UPDATE customer_document SET doc_name='photo' where customer_id=? and doc_type=?", [data[0].id, req.body.doc_type]);
                        //console.log(sql1)
                        connection.query(sql1, function (error, dta) {
                            if (error) {
                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                            } else {

                                var updateData = {
                                    "fullname": req.body.fullname,
                                    "gender": req.body.gender,
                                    "date_of_birth": req.body.date_of_birth,
                                    "birth_place": req.body.birth_place,
                                    "country_code": req.body.country_code,

                                }
                                let sql2 = mysql.format('UPDATE customer SET ? WHERE id = ?', [updateData, data[0].id])


                                //let sql2 = "UPDATE customer SET fullname='" + req.body.fullname + "',gender ='" + req.body.gender + "',date_of_birth='" + req.body.date_of_birth + "',birth_place='" + req.body.birth_place + "',country_code ='" + req.body.country_code + "' WHERE id = '" + data[0].id + "'";
                                connection.query(sql2, function (error, dta) {
                                    if (error) {
                                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                    } else {
                                        if (dta.changedRows !== 0) {

                                            changestatus(data[0].id).then(function (status) {
                                                res.json({ success: true, message: "Successfully updated personal info details" })
                                            }, function (error) {
                                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                            })

                                        } else {


                                            res.json({ success: true, message: "Successfully updated personal info details" })
                                        }
                                    }
                                })
                            }
                        })

                    } else if (req.body.doc_type == 2) {



                        let sql1 = mysql.format('UPDATE customer_document SET doc_name=? where customer_id=? and doc_type=?', [req.body.doc_name, data[0].id, req.body.doc_type]);
                        //console.log(sql1)
                        connection.query(sql1, function (error, dta) {
                            if (error) {
                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                            } else {
                                let address_sql = mysql.format('Select* from customer_address where type=1 and customer_id=?', [data[0].id]);
                                connection.query(address_sql, function (error, addressdta) {
                                    if (error) {
                                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                    } else if (addressdta[0] == null || addressdta == undefined) {

                                        //console.log(req.body.city)
                                        //console.log(typeof(req.body.city))

                                        var city = ((req.body.city == '' || req.body.city == 'null') ? null : req.body.city)
                                        var state = ((req.body.state == '' || req.body.state == 'null') ? null : req.body.state)
                                        var country = ((req.body.country == '' || req.body.country == 'null') ? null : req.body.country)

                                        var addrData = {
                                            "customer_id": data[0].id,
                                            "address": req.body.address,
                                            "pin_code": req.body.pin_code,
                                            "city": city,
                                            "state": state,
                                            "country": country,
                                            "type": 1,
                                            "doc_type": req.body.doc_type,
                                            "created_at": created_at()

                                        }
                                        let sql2 = mysql.format("INSERT customer_address SET ?", addrData)


                                        //let sql2 = "INSERT INTO customer_address (customer_id,address,pin_code,city,state,country,type,doc_type,created_at) values ('" + data[0].id + "','" + req.body.address + "','" + req.body.pin_code + "','" + req.body.city + "','" + req.body.state + "','" + req.body.country + "','1','" + req.body.doc_type + "','" + created_at + "');"

                                        connection.query(sql2, function (error, dta) {
                                            if (error) {
                                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                            } else {
                                                changestatus(data[0].id).then(function (status) {
                                                    res.json({ success: true, message: "Successfully updated  Permanent address proof details" })
                                                }, function (error) {
                                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                                })

                                            }
                                        })
                                    } else {

                                        //console.log(req.body.city)
                                        // console.log(typeof(req.body.city))

                                        var city = ((req.body.city == '' || req.body.city == 'null') ? null : req.body.city)
                                        var state = ((req.body.state == '' || req.body.state == 'null') ? null : req.body.state)
                                        var country = ((req.body.country == '' || req.body.country == 'null') ? null : req.body.country)

                                        var upData = {
                                            "address": req.body.address,
                                            "pin_code": req.body.pin_code,
                                            "city": city,
                                            "state": state,
                                            "country": country,
                                            "type": 1,
                                            "doc_type": req.body.doc_type,
                                            "created_at": created_at()
                                        }


                                        let sql2 = mysql.format("UPDATE customer_address SET ? where type=1 and customer_id=?", [upData, data[0].id])
                                        //let sql2 = "UPDATE customer_address SET address='" + req.body.address + "',pin_code='" + req.body.pin_code + "',city='" + req.body.city + "',state='" + req.body.state + "',country='" + req.body.country + "'where type=1 and customer_id='" + data[0].id + "';"
                                        connection.query(sql2, function (error, dta) {
                                            if (error) {
                                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                            } else {

                                                if (dta.changedRows !== 0) {

                                                    changestatus(data[0].id).then(function (status) {
                                                        res.json({ success: true, message: "Successfully updated  Permanent address proof details" })
                                                    }, function (error) {
                                                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                                    })

                                                } else {
                                                    res.json({ success: true, message: "Successfully updated  Permanent address proof details" })
                                                }
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    } else if (req.body.doc_type == 5) {
                        let sql1 = mysql.format('UPDATE customer_document SET doc_name=? where customer_id=? and doc_type=?', [req.body.doc_name, data[0].id, req.body.doc_type]);
                        //console.log(sql1)
                        connection.query(sql1, function (error, dta) {
                            if (error) {
                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                            } else {
                                let resaddress_sql = mysql.format("Select* from customer_address where type=2 and customer_id=?", [data[0].id]);
                                connection.query(resaddress_sql, function (error, addressdta) {
                                    if (error) {
                                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                    } else if (addressdta[0] == null || addressdta == undefined) {
                                        var addrData = {
                                            "customer_id": data[0].id,
                                            "address": req.body.res_address,
                                            "pin_code": req.body.res_pin_code,
                                            "city": req.body.res_city,
                                            "state": req.body.res_state,
                                            "country": req.body.res_country,
                                            "type": 2,
                                            "doc_type": req.body.doc_type,
                                            "created_at": created_at(),
                                            "kaddress_status": 1
                                        }


                                        let sql3 = mysql.format("INSERT INTO customer_address SET ?", addrData)
                                        // let sql3 = "INSERT INTO customer_address (customer_id,address,pin_code,city,state,country,type,doc_type,created_at,kaddress_status) values ('" + data[0].id + "','" + req.body.res_address + "','" + req.body.res_pin_code + "','" + req.body.res_city + "','" + req.body.res_state + "','" + req.body.res_country + "','2','" + req.body.doc_type + "','" + created_at + "',1);"
                                        connection.query(sql3, function (error, dta) {
                                            if (error) {
                                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                            } else {
                                                console.log(dta)
                                                changestatus(data[0].id).then(function (status) {
                                                    res.json({ success: true, message: "Successfully save Residential address proof details" })
                                                }, function (error) {
                                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                                })
                                            }
                                        })

                                    } else {

                                        var upData = {
                                            "address": req.body.res_address,
                                            "pin_code": req.body.res_pin_code,
                                            "city": req.body.res_city,
                                            "state": req.body.res_state,
                                            "country": req.body.res_country
                                        }
                                        let sql3 = mysql.format("UPDATE customer_address SET ? where type='2' and customer_id =?", [upData, data[0].id])

                                        // let sql3 = "UPDATE customer_address SET address='" + req.body.res_address + "',pin_code='" + req.body.res_pin_code + "',city='" + req.body.res_city + "',state='" + req.body.res_state + "',country='" + req.body.res_country + "' where type='2' and customer_id ='" + data[0].id + "';"

                                        connection.query(sql3, function (error, dta) {
                                            if (error) {
                                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                            } else {
                                                console.log(dta)
                                                console.log(dta.changedRows)
                                                if (dta.changedRows !== 0) {
                                                    changestatus(data[0].id).then(function (status) {
                                                        res.json({ success: true, message: "Successfully updated Residential address proof details" })
                                                    }, function (error) {
                                                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                                    })

                                                } else {
                                                    res.json({ success: true, message: "Successfully updated Residential address proof details" })
                                                }
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    } else {
                        res.json({ success: false, message: "Cannot upload document" });
                    }
                }
            })
        }
    })
}



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/' + folder)
    },
    filename: function (req, file, cb) {
        //cb(null, file.fieldname + '-' + Date.now())
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
})

var uploadKyc = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: function (req, file, cb) {
        // console.log(file.mimetype)
        // console.log("size", file.fileSize)
        if (file.mimetype == 'image/png' || file.mimetype == 'application/msword' || file.mimetype == 'image/jpeg' || file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype == 'application/pdf') {
            return cb(null, true);
        } else {
            cb(null, false);
        }
    }
}).single('photo')


exports.upload = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);


    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            fs.mkdir("uploads/" + data[0].id, function (err) {

                folder = data[0].id

                uploadKyc(req, res, function (error) {


                    if (error) {
                        return res.json({ success: false, message: "error in photo upload", error: cm_cfg.errorFn(error) })
                    }
                    if (!req.file) {

                        return res.json({ success: false, message: "No file found " });

                    }
                    if (req.file) {
                        var ext = req.file.originalname.substr(req.file.originalname.lastIndexOf('.') + 1);

                        // console.log(ext)

                        if (ext == 'doc' || ext == 'docx' || ext == 'pdf' || ext == 'jpg' || ext == 'jpeg' || ext == 'png' || ext == 'DOC' || ext == 'DOCX' || ext == 'PDF' || ext == 'JPG' || ext == 'JPEG' || ext == 'PNG') {

                            // console.log(req.file.path)

                            let sq = mysql.format("SELECT * FROM customer_document WHERE customer_id =? and doc_type=? and f_b_type=?", [data[0].id, req.params.doc_type, req.params.f_b_type]);
                            //console.log(sq)
                            connection.query(sq, function (error, docdata) {
                                if (error) {
                                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                                } else if (docdata[0] == null || docdata[0] == undefined) {
                                    if (req.params.doc_type == 1) {
                                        // console.log("fb", req.params.f_b_type)
                                        if (req.params.f_b_type == 1 || req.params.f_b_type == 2) {
                                            // console.log(req.file)
                                            //  console.log("fb", req.params.f_b_type)
                                            insertData = {
                                                "filename1": req.file.filename,
                                                "original_filename": req.file.originalname,
                                                "customer_id": data[0].id,
                                                "doc_type": req.params.doc_type,
                                                "created_at": created_at(),
                                                "f_b_type": req.params.f_b_type
                                            }

                                            let sql1 = mysql.format("INSERT INTO customer_document SET ?", [insertData]);
                                            // let sql1 = "INSERT INTO customer_document(filename1,original_filename,customer_id,doc_type,created_at,f_b_type) values('" + req.file.filename + "','" + req.file.originalname + "','" + data[0].id + "','" + req.params.doc_type + "','" + created_at + "')";
                                            //console.log(sql1)
                                            connection.query(sql1, function (error, dta) {
                                                if (error) {
                                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                                } else {
                                                    res.json({ success: true, message: "Successfully save id proof photo" })
                                                }
                                            })
                                        } else {
                                            res.json({ success: false, message: "File upload failed" });
                                        }
                                    } else if (req.params.doc_type == 4) {

                                        insertData = {
                                            "filename1": req.file.filename,
                                            "original_filename": req.file.originalname,
                                            "customer_id": data[0].id,
                                            "doc_type": req.params.doc_type,
                                            "doc_name": 'selfie',
                                            "created_at": created_at(),
                                            "f_b_type": req.params.f_b_type

                                        }

                                        let sql1 = mysql.format("INSERT INTO customer_document SET ?", [insertData]);
                                        //let sql1 = "INSERT INTO customer_document (customer_id,doc_type,doc_name,filename1,original_filename,created_at) values ('" + data[0].id + "','" + req.params.doc_type + "','selfie','" + req.file.filename + "','" + req.file.originalname + "','" + created_at + "');"

                                        connection.query(sql1, function (error, dta) {
                                            if (error) {
                                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                            } else {
                                                res.json({ success: true, message: "Successfully save selfie" })
                                            }
                                        })
                                    } else if (req.params.doc_type == 3) {
                                        // console.log(req.params.doc_type)
                                        // console.log(typeof(req.params.doc_type))
                                        // console.log("params", req.params.f_b_type)
                                        // console.log(typeof(req.params.f_b_type))

                                        insertData = {
                                            "filename1": req.file.filename,
                                            "original_filename": req.file.originalname,
                                            "customer_id": data[0].id,
                                            "doc_type": req.params.doc_type,
                                            "f_b_type": req.params.f_b_type,
                                            "created_at": created_at()


                                        }

                                        let sql1 = mysql.format("INSERT INTO customer_document SET ?", [insertData]);

                                        //let sql1 = "INSERT INTO customer_document (filename1,original_filename,customer_id,doc_type,created_at) values ('" + req.file.filename + "','" + req.file.originalname + "','" + data[0].id + "','" + req.params.doc_type + "','" + created_at + "')";
                                        //console.log(sql1)
                                        connection.query(sql1, function (error, dta) {
                                            if (error) {
                                                console.log(error)
                                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                            } else {
                                                res.json({ success: true, message: "Successfully save photo" })
                                            }
                                        })
                                    } else if (req.params.doc_type == 2) {
                                        if (req.params.f_b_type == 1 || req.params.f_b_type == 2) {
                                            // console.log(req.file)
                                            // console.log(docdata)
                                            insertData = {
                                                "filename1": req.file.filename,
                                                "original_filename": req.file.originalname,
                                                "customer_id": data[0].id,
                                                "doc_type": 2,
                                                "created_at": created_at(),
                                                "f_b_type": req.params.f_b_type
                                            }

                                            let sql1 = mysql.format("INSERT INTO customer_document SET ?", [insertData]);
                                            //let sql1 = "INSERT INTO customer_document (filename1,original_filename,customer_id,doc_type,created_at) values ('" + req.file.filename + "','" + req.file.originalname + "','" + data[0].id + "','2','" + created_at + "')";
                                            //console.log(sql1)
                                            connection.query(sql1, function (error, dta) {
                                                if (error) {
                                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                                } else {
                                                    res.json({ success: true, message: "Successfully save Permanent address proof photo" })
                                                }
                                            })
                                        } else {
                                            res.json({ success: false, message: "File upload failed" });
                                        }
                                    } else if (req.params.doc_type == 5) {
                                        if (req.params.f_b_type == 1 || req.params.f_b_type == 2) {
                                            // console.log(req.file)
                                            // console.log(docdata)
                                            insertData = {
                                                "filename1": req.file.filename,
                                                "original_filename": req.file.originalname,
                                                "customer_id": data[0].id,
                                                "doc_type": 5,
                                                "created_at": created_at(),
                                                "f_b_type": req.params.f_b_type
                                            }

                                            let sql1 = mysql.format("INSERT INTO customer_document SET ?", [insertData]);
                                            // let sql1 = "INSERT INTO customer_document (filename1,original_filename,customer_id,doc_type,created_at) values('" + req.file.filename + "','" + req.file.originalname + "','" + data[0].id + "','5','" + created_at + "')";
                                            //console.log(sql1)
                                            connection.query(sql1, function (error, dta) {
                                                if (error) {
                                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                                } else {
                                                    console.log(dta)
                                                    res.json({ success: true, message: "Successfully save Residential address proof photo" })
                                                }
                                            })
                                        } else {
                                            res.json({ success: false, message: "File upload failed" });
                                        }
                                    } else {
                                        res.json({ success: false, message: "Cannot upload document" });
                                    }


                                } else {
                                    if (req.params.doc_type == 1) {
                                        //  console.log(req.file)
                                        if (req.params.f_b_type == 1 || req.params.f_b_type == 2) {
                                            // console.log(docdata)
                                            var updateData = {
                                                "filename1": req.file.filename,
                                                "original_filename": req.file.originalname,

                                            }


                                            let sql1 = mysql.format('UPDATE customer_document SET ? WHERE customer_id= ? and doc_type=? and f_b_type=?', [updateData, data[0].id, 1, req.params.f_b_type]);
                                            //let sql1 = "UPDATE customer_document SET filename1='" + req.file.filename + "',original_filename='" + req.file.originalname + "' where customer_id='" + data[0].id + "' and doc_type=1"
                                            //console.log(sql1)
                                            connection.query(sql1, function (error, dta) {
                                                if (error) {
                                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                                } else {
                                                    if (dta.changedRows !== 0) {

                                                        changestatus(data[0].id).then(function (status) {
                                                            res.json({ success: true, message: "Successfully updated id proof photo" })
                                                        }, function (error) {
                                                            res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                                        })

                                                    } else {
                                                        res.json({ success: true, message: "Successfully updated id proof photo" })
                                                    }
                                                }
                                            })
                                        } else {
                                            res.json({ success: false, message: "File cannot updated" });
                                        }
                                    } else if (req.params.doc_type == 4) {

                                        var updateData = {
                                            "filename1": req.file.filename,
                                            "original_filename": req.file.originalname,

                                        }


                                        let sql1 = mysql.format('UPDATE customer_document SET ? WHERE customer_id= ? and doc_type=?', [updateData, data[0].id, req.params.doc_type]);


                                        //let sql1 = "UPDATE customer_document SET doc_name='selfie',filename1='" + req.file.filename + "',original_filename='" + req.file.originalname + "' where customer_id='" + data[0].id + "' and doc_type='" + req.params.doc_type + "';"

                                        connection.query(sql1, function (error, dta) {
                                            if (error) {
                                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                            } else {
                                                if (dta.changedRows !== 0) {

                                                    changestatus(data[0].id).then(function (status) {
                                                        res.json({ success: true, message: "Successfully updated selfie" })
                                                    }, function (error) {
                                                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                                    })

                                                } else {
                                                    res.json({ success: true, message: "Successfully updated selfie" })
                                                }
                                            }
                                        })
                                    } else if (req.params.doc_type == 3) {
                                        var updateData = {
                                            "filename1": req.file.filename,
                                            "original_filename": req.file.originalname,

                                        }


                                        let sql1 = mysql.format('UPDATE customer_document SET ? WHERE customer_id= ? and doc_type=?', [updateData, data[0].id, req.params.doc_type]);
                                        //let sql1 = "UPDATE customer_document SET filename1='" + req.file.filename + "',original_filename='" + req.file.originalname + "' where customer_id='" + data[0].id + "' and doc_type=3"
                                        //console.log(sql1)
                                        connection.query(sql1, function (error, dta) {
                                            if (error) {
                                                console.log(error)
                                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                            } else {
                                                if (dta.changedRows !== 0) {

                                                    changestatus(data[0].id).then(function (status) {
                                                        res.json({ success: true, message: "Successfully updated photo" })
                                                    }, function (error) {
                                                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                                    })

                                                } else {
                                                    res.json({ success: true, message: "Successfully updated photo" })
                                                }
                                            }
                                        })
                                    } else if (req.params.doc_type == 2) {
                                        if (req.params.f_b_type == 1 || req.params.f_b_type == 2) {

                                            var updateData = {
                                                "filename1": req.file.filename,
                                                "original_filename": req.file.originalname,

                                            }

                                            let sql1 = mysql.format('UPDATE customer_document SET ? WHERE customer_id= ? and doc_type=? and f_b_type=?', [updateData, data[0].id, 2, req.params.f_b_type]);
                                            //let sql1 = mysql.format('UPDATE customer_document SET ? WHERE customer_id= ? and doc_type', [updateData, data[0].id,req.params.doc_type]);

                                            // let sql1 = "UPDATE customer_document SET filename1='" + req.file.filename + "',original_filename='" + req.file.originalname + "' where customer_id='" + data[0].id + "' and doc_type=2"
                                            console.log(sql1)
                                            connection.query(sql1, function (error, dta) {
                                                if (error) {
                                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                                } else {
                                                    if (dta.changedRows !== 0) {

                                                        changestatus(data[0].id).then(function (status) {
                                                            res.json({ success: true, message: "Successfully updated Permanent address proof photo" })
                                                        }, function (error) {
                                                            res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                                        })

                                                    } else {
                                                        res.json({ success: true, message: "Successfully updated Permanent address proof photo" })
                                                    }
                                                }
                                            })
                                        } else {
                                            res.json({ success: false, message: "File cannot updated" });
                                        }
                                    } else if (req.params.doc_type == 5) {
                                        if (req.params.f_b_type == 1 || req.params.f_b_type == 2) {

                                            var updateData = {
                                                "filename1": req.file.filename,
                                                "original_filename": req.file.originalname,

                                            }

                                            let sql1 = mysql.format('UPDATE customer_document SET ? WHERE customer_id= ? and doc_type=? and f_b_type=?', [updateData, data[0].id, 5, req.params.f_b_type]);

                                            // let sql1 = "UPDATE customer_document SET filename1='" + req.file.filename + "',original_filename='" + req.file.originalname + "' where customer_id='" + data[0].id + "' and doc_type=5"
                                            console.log(sql1)
                                            connection.query(sql1, function (error, dta) {
                                                if (error) {
                                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                                } else {
                                                    if (dta.changedRows !== 0) {

                                                        changestatus(data[0].id).then(function (status) {
                                                            res.json({ success: true, message: "Successfully updated Residential address proof photo" })
                                                        }, function (error) {
                                                            res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                                        })

                                                    } else {
                                                        res.json({ success: true, message: "Successfully updated Residential address proof photo" })
                                                    }
                                                }
                                            })
                                        } else {
                                            res.json({ success: false, message: "File cannot updated" });
                                        }
                                    } else {
                                        res.json({ success: false, message: "Cannot upload document" });
                                    }
                                }
                            })
                        } else {
                            res.json({ success: false, message: "Unsupported file format" })
                        }
                    }
                })
            })
        }
    })
}



exports.getImage = function (req, res) {

    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            //console.log(data[0].id)
            //console.log(req.body.path)
            // if (req.body.path == '' || req.body.path == null) {
            //     res.json({ success: false, message: "Requested file not found" })
            // } else {
            var reqPath = req.body.path
            var str1 = reqPath.split("/");
            //console.log(str1[1])
            if (data[0].id == str1[1] && str1[0] == 'uploads') {
                if (str1.length > 4) {

                    return res.json({ success: false, message: "Unauthorized folder access" })
                }
                if ((str1.length === 4) && !(str1[2] === 'banks_documents' || str1[2] === 'kyc')) {
                    return res.json({ success: false, message: "Unauthorized folder access" })
                }
                var pathcheck = fs.existsSync(reqPath)
                //console.log(pathcheck)
                if (pathcheck == true) {
                    var file_path = path.resolve(reqPath);
                    var data = base64Img.base64Sync(file_path);
                    res.json({ "success": true, data: data });
                } else {
                    res.json({ success: false, message: "Requested file not found" })
                }
            } else {
                res.json({ success: false, message: "Image requested for some other user" })
            }
            // }
        }
    })
}

// exports.download = function(req, res) {

//     var token = req.query.token;

//     if (token) {
//         jwt.verify(token, config.superSecret, function(err, decoded) {
//             if (err) {
//                 res.status(401).send({ status: -2, message: 'Failed to authenticate token.' })
//                 res.end();
//             } else {

//                 var email = decoded.email;
//                 let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
//                 //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
//                 connection.query(sql, function(error, data) {
//                     if (error) {
//                         res.json({ success: false, message: "error", error: error })
//                     } else if (data[0] == null || data[0] == undefined) {

//                         res.json({ success: false, message: "User not found" })
//                     } else {
//                         // console.log(data[0].id)
//                         //console.log(req.query.path)
//                         // if (req.query.path == '' || req.query.path == null) {
//                         //     res.json({ success: false, message: "Requested file not found" })
//                         // } else {
//                         var reqPath = req.query.path;
//                         var str1 = reqPath.split("/");
//                         // console.log(str1[1])
//                         if (data[0].id == str1[1] && str1[0] == 'uploads') {

//                             var pathcheck = fs.existsSync(reqPath)
//                             //console.log(pathcheck)
//                             if (pathcheck == true) {
//                                 var file_path = path.resolve(reqPath);
//                                 res.download(file_path);

//                             } else {
//                                 res.json({ success: false, message: "Requested file not found" })
//                             }
//                         } else {
//                             res.json({ success: false, message: "Image requested for some other user" })
//                         }
//                         //}
//                     }
//                 })
//             }

//         });
//     } else {
//         res.status(401).send({ status: -2, message: 'token not found' })
//         res.end();
//     }
// }



exports.download = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            // console.log(data[0].id)
            //console.log(req.query.path)
            // if (req.query.path == '' || req.query.path == null) {
            //     res.json({ success: false, message: "Requested file not found" })
            // } else {
            var reqPath = req.body.path;
            var str1 = reqPath.split("/");
            // console.log(str1[1])
            if (data[0].id == str1[1] && str1[0] == 'uploads') {
                if (str1.length > 4) {
                    return res.json({ success: false, message: "Unauthorized folder access" })
                }
                if (str1.length === 4 && str1[2] !== 'banks_documents') {
                    return res.json({ success: false, message: "Unauthorized folder access" })
                }
                var pathcheck = fs.existsSync(reqPath)
                //console.log(pathcheck)
                if (pathcheck == true) {
                    var file_path = path.resolve(reqPath);
                    res.download(file_path);

                } else {
                    res.json({ success: false, message: "Requested file not found" })
                }
            } else {
                res.json({ success: false, message: "Image requested for some other user" })
            }
            //}
        }
    })
}

exports.wallet = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);

    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {

            let sql1 = "Select customer_id,total_amount,customer_wallet.currency_code ,currency_master.status,currency_master.type,currency_master.created_at,currency_master.currency_icon,CONCAT('images/currencyimage/','',currency_icon) as currency_icon_path from customer_wallet inner join currency_master ON currency_master.currency_code= customer_wallet.currency_code where customer_wallet.customer_id =" + mysql.escape(data[0].id) + " and currency_master.status='1' ORDER BY currency_master.order_by";

            //console.log(sql1)
            connection.query(sql1, function (error, dataa) {

                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {




                    var dat = dataa.map(function (changedata) {
                        // console.log("datta", changedata)
                        if (changedata.type == 0) {
                            return {
                                customer_id: changedata.customer_id,
                                total_amount: Number(changedata.total_amount).toFixed(2),
                                currency_code: changedata.currency_code,
                                status: changedata.status,
                                type: changedata.type,
                                currency_icon: changedata.currency_icon,
                                currency_icon_path: changedata.currency_icon_path
                            }
                        } else {
                            return {
                                customer_id: changedata.customer_id,
                                total_amount: Number(changedata.total_amount).toFixed(8),
                                currency_code: changedata.currency_code,
                                status: changedata.status,
                                type: changedata.type,
                                currency_icon: changedata.currency_icon,
                                currency_icon_path: changedata.currency_icon_path
                            }

                        }

                    })

                    //console.log("dat", dat)

                    res.json({ success: true, data: dat })
                }
                // }

            })
        }
    })
}


exports.allActiveOrder = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT email,id FROM customer WHERE email =?", [email]);

    // let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    //console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {

            //let buyorder_sql = "Select*from buy where (status='Executed'or status='Partially Executed')and customer_id='" + data[0].id + "'";
            // let buyorder_sql = "Select buy.id,buy.customer_id,buy.status,buy.quantity as quantity,buy.total_price, buy.buy_price,buy.platform_fee,buy.platform_value,buy.created_at,buy.pair_id,pair_master.from as pair_idfrom ,pair_master.to as pair_idto,buy.type,CONCAT('Buy') as trade_type,currency_master.type as currency_type from buy inner join pair_master ON pair_master.id=buy.pair_id left join currency_master on pair_master.to = currency_code where (buy.status='Executed'or buy.status='Partially Executed')and buy.customer_id='" + data[0].id + "' order by buy.id desc";
            let buyorder_sql = "Select buy.id,buy.customer_id,buy.status,buy.quantity as quantity,buy.total_price, buy.buy_price,buy.platform_fee,buy.platform_value,buy.created_at,IF(currency_master.type='0', FORMAT(buy.platform_value, 4), FORMAT(buy.platform_value, 8)) as platform_value,buy.pair_id,pair_master.from as pair_idfrom ,pair_master.to as pair_idto,buy.type,CONCAT('Buy') as trade_type,currency_master.type as currency_type from buy inner join pair_master ON pair_master.id=buy.pair_id left join currency_master on pair_master.to = currency_code where (buy.status='Executed'or buy.status='Partially Executed')and buy.customer_id='" + mysql.escape(data[0].id) + "' order by buy.id desc";
            // console.log("buyorderd_sql",buyorder_sql)
            connection.query(buyorder_sql, function (error, buydata) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {

                    //let sellorder_sql = "Select*from sell where (status='Executed'or status='Partially Executed')and customer_id='" + data[0].id + "'";
                    // let sellorder_sql = "Select sell.id,sell.customer_id,sell.status, sell.quantity as quantity,sell.total_price,sell.sell_price,sell.platform_fee, sell.platform_value, sell.created_at,sell.pair_id,pair_master.from as pair_idfrom ,pair_master.to as pair_idto,sell.type,CONCAT('Sell') as trade_type from sell inner join pair_master ON pair_master.id=sell.pair_id where (sell.status='Executed'or sell.status='Partially Executed')and sell.customer_id='" + data[0].id + "' order by sell.id desc";
                    let sellorder_sql = "Select sell.id,sell.customer_id,sell.status, sell.quantity as quantity,sell.total_price,sell.sell_price,sell.platform_fee, sell.platform_value, sell.created_at,IF(currency_master.type='0', FORMAT(sell.platform_value, 4), FORMAT(sell.platform_value, 8)) as platform_value,sell.pair_id,pair_master.from as pair_idfrom ,pair_master.to as pair_idto,sell.type,CONCAT('Sell') as trade_type ,currency_master.type as currency_type from sell inner join pair_master ON pair_master.id=sell.pair_id left join currency_master on pair_master.from = currency_code where (sell.status='Executed'or sell.status='Partially Executed')and sell.customer_id='" + mysql.escape(data[0].id) + "' order by sell.id desc";
                    // console.log("@@@@@@@@@",sellorder_sql)
                    connection.query(sellorder_sql, function (error, selldata) {
                        if (error) {
                            console.log(error)
                            res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) })
                        } else {

                            res.json({ success: true, message: 'All active orders', buyorder: buydata, sellorder: selldata })
                        }

                    })

                }
            })
        }
    })
}

// exports.combineActiveOrder = function(req, res) {
//     var email = req.decoded.email;
//     let sql = mysql.format("SELECT email,id FROM customer WHERE email =?", [email]);

//     // let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
//     //console.log(sql)
//     connection.query(sql, function(error, data) {
//         if (error) {
//             res.json({ success: false, message: "error", error })
//         } else if (data[0] == null || data[0] == undefined) {

//             res.json({ success: false, message: "User not found" })
//         } else {````

//             //let buyorder_sql = "Select*from buy where (status='Executed'or status='Partially Executed')and customer_id='" + data[0].id + "'";
//             let buyorder_sql = "Select buy.id,buy.customer_id,buy.status,FORMAT(buy.quantity,2) as quantity,buy.total_price,FORMAT(buy.buy_price,2) as buy_price,buy.platform_fee,FORMAT(buy.platform_value,2)as platform_value,buy.created_at,buy.pair_id,pair_master.from as pair_idfrom ,pair_master.to as pair_idto,buy.type,CONCAT('Buy') as trade_type from buy inner join pair_master ON pair_master.id=buy.pair_id where (buy.status='Executed'or buy.status='Partially Executed')and buy.customer_id='" + data[0].id + "'";
//             connection.query(buyorder_sql, function(error, buydata) {
//                 if (error) {
//                     res.json({ success: false, message: "error", error })
//                 } else {

//                     //let sellorder_sql = "Select*from sell where (status='Executed'or status='Partially Executed')and customer_id='" + data[0].id + "'";
//                     let sellorder_sql = "Select sell.id,sell.customer_id,sell.status,FORMAT(sell.quantity,2) as quantity,sell.total_price,FORMAT(sell.sell_price,2)as sell_price,sell.platform_fee,FORMAT(sell.platform_value,2)as platform_value,sell.created_at,sell.pair_id,pair_master.from as pair_idfrom ,pair_master.to as pair_idto,sell.type,CONCAT('Sell') as trade_type from sell inner join pair_master ON pair_master.id=sell.pair_id where (sell.status='Executed'or sell.status='Partially Executed')and sell.customer_id='" + data[0].id + "'";
//                     connection.query(sellorder_sql, function(error, selldata) {
//                         if (error) {
//                             console.log(error)
//                             res.json({ success: false, message: "Error" })
//                         } else {

//                             var combinearray = (buydata.concat(selldata));

//                          var finalarray = combinearray.sort(function(a, b) {
//                                 return b.created_at-a.created_at;
//                             });
//                             console.log(finalarray)
//                             res.json({ success: true, message: 'All active orders', activeorderdata:finalarray })
//                         }

//                     })

//                 }
//             })
//         }
//     })
// }

exports.combineActiveOrder = function (req, res) {
    var email = req.decoded.email;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var limit = req.body.limit;
    var offset = (req.body.offset == 'null' ? 0 : req.body.offset);
    var exportAs = req.body.exportAs;
    var searchQuery = '';
    var transaction_sql_search = '';

    let pair_id = req.body.pair_id
    let platform_fee = req.body.platform_fee
    let platform_value = req.body.platform_value
    let price = req.body.price
    let quantity = req.body.quantity
    let status = req.body.status
    let totalprice = req.body.totalprice
    let trade_type = req.body.trade_type
    let type = req.body.type

    let filter = ''
    let sellFilter = '';
    if (pair_id) {
        filter += ` AND pair_id = '${mysql.escape(pair_id) == 'NULL' ? null : mysql.escape(pair_id)}'`
    }

    if (platform_fee || Number(pair_id)) {
        filter += ` AND platform_fee = '${mysql.escape(platform_fee) == 'NULL' ? null : mysql.escape(platform_fee)}'`
    }

    if (platform_value) {
        filter += ` AND platform_value = '${mysql.escape(platform_value) == 'NULL' ? null : mysql.escape(platform_value)}'`
    }

    if (quantity) {
        filter += ` AND quantity = '${mysql.escape(quantity) == 'NULL' ? null : mysql.escape(quantity)}'`
    }

    if (totalprice) {
        filter += ` AND total_price = '${mysql.escape(totalprice) == 'NULL' ? null : mysql.escape(totalprice)}'`
    }

    if (type) {
        filter += ` AND type = ${mysql.escape(type) == 'NULL' ? null : mysql.escape(type)}`
    }

    sellFilter = filter

    if (price) {
        filter += ` AND buy_price = '${mysql.escape(price) == 'NULL' ? null : mysql.escape(price)}'`
        sellFilter += ` AND sell_price = '${mysql.escape(price) == 'NULL' ? null : mysql.escape(price)}'`
    }

    if (status) {
        filter += ` AND buy.status = ${mysql.escape(status) == 'NULL' ? null : mysql.escape(status)}`
        sellFilter += ` AND sell.status = ${mysql.escape(status) == 'NULL' ? null : mysql.escape(status)}`
    }

    if (trade_type) {
        filter += ` HAVING trade_type = ${mysql.escape(trade_type) == 'NULL' ? null : mysql.escape(trade_type)}`
        sellFilter += ` HAVING trade_type = ${mysql.escape(trade_type) == 'NULL' ? null : mysql.escape(trade_type)}`
    }

    if (['created_at', 'price', 'quantity', 'platform_value', 'totalprice', 'status'].includes(order_column)
        && ['asc', 'desc'].includes(order_direction)) {
        searchQuery += ` ORDER BY Y.${order_column} ${order_direction}`
    }
    else
        searchQuery += ` ORDER BY Y.created_at DESC`;

    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + offset + ", " + limit;
    }

    let sql = mysql.format("SELECT email,id FROM customer WHERE email =?", [email]);
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            let transaction_sql_search = "SELECT * , (SELECT TYPE FROM currency_master WHERE currency_code = pair_idto) AS TYPE, \
            Format(Y.quantity, 2)       AS quantity,\
            Format(Y.totalprice, 2)    AS totalprice,\
            Format(Y.price, 2)      AS price \
            FROM  ( SELECT buy.id, \
                          buy.customer_id, \
                          buy.status, \
                          buy.quantity,\
                          buy.total_price AS totalprice,\
                          buy.buy_price AS price, \
                          buy.platform_fee,\
                          IF(TYPE=0, FORMAT(buy.platform_value,4), FORMAT(buy.platform_value,8)) AS platform_value, \
                          buy.created_at, \
                          buy.pair_id,\
                          pair_master.from              AS pair_idfrom, \
                          pair_master.to                AS pair_idto, \
                          buy.type,\
                          Concat('Buy')                 AS trade_type \
                   FROM   buy \
                          INNER JOIN pair_master\
                                  ON pair_master.id = buy.pair_id \
                   WHERE ( buy.status = 'Executed' \
                            OR buy.status = 'Partially Executed' ) \
                         AND buy.customer_id = '" + data[0].id + "' " + filter + " \
            UNION ALL \
            SELECT sell.id, \
                          sell.customer_id, \
                          sell.status, \
                          sell.quantity, \
                          sell.total_price AS totalprice, \
                          sell.sell_price, \
                          sell.platform_fee, \
                          IF(TYPE=0, FORMAT(sell.platform_value,4), FORMAT(sell.platform_value,8)) AS platform_value, \
                          sell.created_at, \
                          sell.pair_id, \
                          pair_master.from               AS pair_idfrom, \
                          pair_master.to                 AS pair_idto, \
                          sell.type, \
                          Concat('Sell')                 AS trade_type \
                   FROM   sell \
                          INNER JOIN pair_master \
                                  ON pair_master.id = sell.pair_id \
                   WHERE ( sell.status = 'Executed' \
                            OR sell.status = 'Partially Executed' ) \
                         AND sell.customer_id = '" + data[0].id + "' " + sellFilter + " ) AS Y  " + searchQuery + LIMIT;
console.log(transaction_sql_search)
            var q = connection.query(transaction_sql_search, function (error, search_data) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {
                    let transaction_sql_count = "SELECT COUNT(*) as count \
            FROM  (SELECT buy.id, \
                          buy.customer_id, \
                          buy.status, \
                          Format(buy.quantity, 2)       AS quantity,\
                          Format(buy.total_price, 2)    AS totalprice,\
                          Format(buy.buy_price, 2)      AS price, \
                          buy.platform_fee,\
                          Format(buy.platform_value, 8) AS platform_value, \
                          buy.created_at, \
                          buy.pair_id,\
                          pair_master.from              AS pair_idfrom, \
                          pair_master.to                AS pair_idto, \
                          buy.type,\
                          Concat('Buy')                 AS trade_type \
                   FROM   buy \
                          INNER JOIN pair_master\
                                  ON pair_master.id = buy.pair_id \
                   WHERE ( buy.status = 'Executed' \
                            OR buy.status = 'Partially Executed' ) \
                         AND buy.customer_id = '" + data[0].id + "' " + filter + " \
            UNION ALL \
           SELECT sell.id, \
                          sell.customer_id, \
                          sell.status, \
                          Format(sell.quantity, 2)       AS quantity, \
                          Format(sell.total_price, 2)    AS totalprice, \
                          Format(sell.sell_price, 2)     AS price, \
                          sell.platform_fee, \
                          Format(sell.platform_value, 8) AS platform_value, \
                          sell.created_at, \
                          sell.pair_id, \
                          pair_master.from               AS pair_idfrom, \
                          pair_master.to                 AS pair_idto, \
                          sell.type, \
                          Concat('Sell')                 AS trade_type \
                   FROM   sell \
                          INNER JOIN pair_master \
                                  ON pair_master.id = sell.pair_id \
                   WHERE ( sell.status = 'Executed' \
                            OR sell.status = 'Partially Executed' ) \
                         AND sell.customer_id = '" + data[0].id + "' " + sellFilter + " ) AS Y";
                    connection.query(transaction_sql_count, function (error, countdata) {
                        if (error) {
                            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                        } else {
                            res.json({ success: true, message: 'All active orders', activeorderdata: search_data, totalcount: countdata })
                        }
                    });
                }
            })
        }
    })
}


exports.cancelOrder = function (req, res) {

    console.log(req.body);

    function db(tradeId, custId, total_price, platform_value, receviedwalletcode, order_type, data) {
        console.log(arguments);
        return new Promise(function (resolve, reject) {
            connection.beginTransaction(function (err) {
                if (err) {
                    throw err;
                    reject(error)
                }

                let customerwallet_sql = "Select*from customer_wallet where currency_code=" + mysql.escape(receviedwalletcode) + "and customer_id=" + mysql.escape(custId) + "";

                connection.query(customerwallet_sql, function (error, customerwalletdata) {
                    if (error) {
                        return connection.rollback(function () {
                            throw error;
                            reject(error)

                        });
                    }



                    var receivedamount = parseFloat(total_price) + parseFloat(platform_value) + parseFloat(customerwalletdata[0].total_amount);
                    console.log(total_price)
                    console.log(platform_value)
                    console.log(customerwalletdata[0].total_amount)
                    console.log(receivedamount)
                    let customerwalletupdata_sql = "UPDATE customer_wallet SET total_amount=" + mysql.escape(receivedamount) + " where currency_code=" + mysql.escape(receviedwalletcode) + "and customer_id=" + mysql.escape(custId) + "";

                    connection.query(customerwalletupdata_sql, function (error, updatedata) {
                        if (error) {
                            return connection.rollback(function () {
                                throw error;
                                reject(error)

                            });
                        }

                        if (order_type == "Buy") {
                            console.log('Buy');
                            let updata_sql = "UPDATE buy SET status='Not Executed'where id='" + tradeId + "'and customer_id='" + custId + "'";
                            console.log(updata_sql);
                            connection.query(updata_sql, function (error, updatedata) {
                                if (error) {
                                    return connection.rollback(function () {
                                        throw error;
                                        reject(error)

                                    });
                                }

                                //console.log(data)
                                let trans_master_sql = "INSERT INTO transaction_master (status,trade_type,type,trade_id,customer_id,created_at,total_amount,price,quantity,platform_fee,platform_value,pair_id) values ('Not Executed','Buy','" + data[0].type + "','" + data[0].id + "','" + data[0].customer_id + "','" + created_at() + "','" + data[0].total_price + "','" + data[0].buy_price + "','" + data[0].quantity + "','" + data[0].platform_fee + "','" + data[0].platform_value + "','" + data[0].pair_id + "');"
                                console.log(trans_master_sql)
                                connection.query(trans_master_sql, function (error, trans_master) {
                                    if (error) {
                                        return connection.rollback(function () {
                                            throw error;
                                            reject(error)
                                        });
                                    }

                                    connection.commit(function (err) {
                                        if (err) {
                                            return connection.rollback(function () {
                                                throw err;
                                                reject(error)
                                            });
                                        }
                                        console.log('success!');
                                        resolve('success')
                                    });
                                })


                            });
                        } else if (order_type == "Sell") {
                            let updata_sql = "UPDATE sell SET status='Not Executed'where id='" + tradeId + "'and customer_id='" + custId + "'";
                            connection.query(updata_sql, function (error, updatedata) {
                                if (error) {
                                    return connection.rollback(function () {
                                        throw error;
                                        reject(error)

                                    });
                                }

                                let trans_master_sql = "INSERT INTO transaction_master (status,trade_type,type,trade_id,customer_id,created_at,total_amount,price,quantity,platform_fee,platform_value,pair_id) values ('Not Executed','Sell','" + data[0].type + "','" + data[0].id + "','" + data[0].customer_id + "','" + created_at() + "','" + data[0].total_price + "','" + data[0].sell_price + "','" + data[0].quantity + "','" + data[0].platform_fee + "','" + data[0].platform_value + "','" + data[0].pair_id + "');"
                                console.log(trans_master_sql)
                                connection.query(trans_master_sql, function (error, trans_master) {
                                    if (error) {
                                        return connection.rollback(function () {
                                            throw error;
                                            reject(error)
                                        });
                                    }
                                    connection.commit(function (err) {
                                        if (err) {
                                            return connection.rollback(function () {
                                                throw err;
                                            });
                                        }
                                        console.log('success!');
                                        resolve('success')
                                    });
                                })


                            });

                        } else {
                            reject("Wrong order type")
                        }
                    })

                })

            })
        })
    }


    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    //console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {

            if (req.body.order_type == "Buy") {

                let buyorder_sql = mysql.format("Select*from buy where id=? and customer_id=?", [req.body.id, data[0].id]);
                console.log(buyorder_sql);
                connection.query(buyorder_sql, function (error, buydata) {
                    if (error) {
                        res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                    } else if (buydata[0] == null || buydata[0] == undefined) {
                        res.json({ success: false, message: "Buy order not found" })
                    } else {
                        if (buydata[0].status == 'Partially Executed') {
                            res.json({ success: false, message: "Partially executed order cannot cancelled" })
                        } else if (buydata[0].status == 'Not Executed') {
                            res.json({ success: false, message: "Order already cancelled" })
                        } else {

                            let pair_sql = "SELECT * FROM pair_master WHERE id ='" + buydata[0].pair_id + "'";
                            connection.query(pair_sql, function (error, pairdata) {
                                if (error) {
                                    res.json({ success: false, message: "error in  pair id", error: cm_cfg.errorFn(error) })

                                } else {
                                    db(req.body.id, data[0].id, buydata[0].total_price, buydata[0].platform_value, pairdata[0].to, req.body.order_type, buydata).then(function (data) {
                                        res.json({ success: true, message: "Order cancelled successfully" })
                                    }, function (err) {
                                        res.json({ success: false, message: "error", error: cm_cfg.errorFn(err) })
                                    })

                                }

                            })
                        }
                    }
                })

            } else if (req.body.order_type == "Sell") {

                let sellorder_sql = mysql.format("Select*from sell where id=? and customer_id=?", [req.body.id, data[0].id]);
                // console.log(sellorder_sql)
                connection.query(sellorder_sql, function (error, selldata) {
                    if (error) {
                        res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                    } else if (selldata[0] == null || selldata[0] == undefined) {
                        res.json({ success: false, message: "Sell Order not found" })
                    } else {
                        if (selldata[0].status == 'Partially Executed') {
                            res.json({ success: false, message: "Partially executed order cannot cancelled" })
                        } else if (selldata[0].status == 'Not Executed') {
                            res.json({ success: false, message: "Order already cancelled" })
                        } else {


                            let pair_sql = "SELECT * FROM pair_master WHERE id ='" + selldata[0].pair_id + "'";
                            connection.query(pair_sql, function (error, pairdata) {
                                if (error) {
                                    res.json({ success: false, message: "error in  pair id", error: cm_cfg.errorFn(error) })

                                } else {
                                    console.log(selldata)
                                    db(req.body.id, data[0].id, selldata[0].quantity, selldata[0].platform_value, pairdata[0].from, req.body.order_type, selldata).then(function (data) {
                                        res.json({ success: true, message: "Order cancelled successfully" })
                                    }, function (err) {
                                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(err) })
                                    })

                                }


                            })

                        }

                    }
                })

            } else {
                res.json({ success: false, message: 'Wrong order type' })
            }
        }
    })
}



//Finance
exports.allTransaction = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);

    // let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    //console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            //console.log(data)

            var limit = req.body.limit;
            var offset = (req.body.offset == 'null' ? 0 : req.body.offset);

            var searchQuery = '';
            // console.log(req.body.type)
            var status = req.body.status;
            var type = req.body.type;
            var tradeType = req.body.trade_type
            var pairId = req.body.pair_id
            var dateTo = req.body.date_to
            var dateFrom = req.body.date_from

            let price = req.body.price
            let avgPrice = req.body.avg_price
            let quantity = req.body.quantity
            let totalAmount = req.body.total_amount
            let orderColumn = req.body.order_column
            let orderDirection = req.body.order_direction

            if (price) {
                searchQuery += ` AND price = ${mysql.escape(price) == 'NULL' ? null : mysql.escape(price)}`
            }

            if (quantity) {
                searchQuery += ` AND quantity = ${mysql.escape(quantity) == 'NULL' ? null : mysql.escape(quantity)}`
            }
            if (avgPrice) {
                searchQuery += ` AND avg_price = ${mysql.escape(avgPrice) == 'NULL' ? null : mysql.escape(avgPrice)}`
            }
            if (totalAmount) {
                searchQuery += ` AND total_amount = ${mysql.escape(totalAmount) == 'NULL' ? null : mysql.escape(totalAmount)}`
            }
            if (type) {
                searchQuery += ` AND type = ${mysql.escape(req.body.type) == 'NULL' ? null : mysql.escape(req.body.type)}`;
                // console.log(searchQuery)
            }
            if (tradeType) {
                searchQuery += `AND trade_type = ${mysql.escape(req.body.trade_type) == 'NULL' ? null : mysql.escape(req.body.trade_type)}`;
            }
            if (pairId) {
                searchQuery += ` AND pair_id = ${mysql.escape(req.body.pair_id) == 'NULL' ? null : mysql.escape(req.body.pair_id)}`;
            }
            if (status) {
                searchQuery += ` AND tm.status = ${mysql.escape(req.body.status) == 'NULL' ? null : mysql.escape(req.body.status)}`;
                //console.log(searchQuery)
            }
            if (typeof dateTo !== 'undefined' && dateTo !== '' && typeof dateFrom !== 'undefined' && dateFrom !== '') {
                searchQuery += "AND (tm.created_at >=" + mysql.escape(dateFrom) + " AND tm.created_at <= " + mysql.escape(dateTo) + ")"
            }
            if (orderColumn === "created_at" && orderDirection)
                searchQuery += ` ORDER BY tm.created_at ${mysql.escape(orderDirection) == 'NULL' ? null : mysql.escape(orderDirection)} `
            else if (['created_at', 'price', 'avg_price', 'quantity', 'platform_value', 'total_amount', 'status'].includes(orderColumn)
                && ['asc', 'desc'].includes(orderDirection))
                searchQuery += ` ORDER BY ${orderColumn} ${orderDirection} `
            else
                searchQuery += ` ORDER BY tm.created_at DESC `
            if (isNaN(limit)) {
                res.json({ success: false, message: "error", error: 'Please send right parameters' });
                return null;
            }
            if (isNaN(offset)) {
                res.json({ success: false, message: "error", error: 'Please send right parameters' });
                return null;
            }
            //let tranmastercount_sql = "SELECT COUNT( * ) as total FROM transaction_master where customer_id = '" + data[0].id + "'" + searchQuery + "";

            let tranmastercount_sql = "SELECT COUNT( * ) as total from transaction_master AS tm inner join pair_master ON pair_master.id = tm.pair_id where tm.status != 'Executed' AND tm.customer_id = '" + data[0].id + "'" + searchQuery + "";
            //console.log(tranmastercount_sql)
            connection.query(tranmastercount_sql, function (error, countdata) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {

                    let tranmaster_sql = `
                    Select
                      tm.id,tm.customer_id,
                      tm.status, if(tm.type='Market' AND tm.trade_type='Sell', tm.avg_price*(tm.quantity - getSellQuantity(tm.trade_id)), tm.total_amount) total_amount,
                      IF(tm.type='Market', tm.avg_price, tm.price) as price, tm.platform_fee as platform_fee,
                      tm.platform_value, tm.created_at, tm.pair_id,
                      tm.avg_price, tm.trade_id, pair_master.from as pair_idfrom,
                      pair_master.to as pair_idto, tm.type, tm.trade_type,
                      IF(tm.type='Limit' OR tm.trade_type='Sell', (quantity-IF(tm.trade_type='Buy',IFNULL(getBuyQuantity(tm.trade_id),0.00000000),IFNULL(getSellQuantity(tm.trade_id),0.00000000))),
                        (tm.total_amount-getBuyTotal(tm.trade_id))/tm.avg_price) as quantity
                    from transaction_master AS tm inner join pair_master ON pair_master.id = tm.pair_id where tm.status!= 'Executed' and tm.customer_id ='` + data[0].id + "'" + searchQuery + " LIMIT " + limit + " OFFSET " + offset + "";

                    //let tranmaster_sql = "Select tm.id,tm.customer_id, tm.status, FORMAT(tm.quantity,2) as quantity, FORMAT(tm.total_amount,2) as total_amount, FORMAT(tm.price,2) as price, FORMAT(tm.platform_fee,2) as platform_fee, FORMAT(tm.platform_value,2) as platform_value, tm.created_at, tm.pair_id, FORMAT(tm.avg_price,2) as avg_price, tm.trade_id, pair_master.from as pair_idfrom, pair_master.to as pair_idto, tm.type, tm.trade_type from transaction_master AS tm inner join pair_master ON pair_master.id = tm.pair_id where tm.customer_id = '" + data[0].id + "'" + searchQuery + "order by tm.created_at desc LIMIT " + limit + " OFFSET " + offset + "";
                    // console.log(tranmaster_sql)
                    connection.query(tranmaster_sql, function (error, tranmasterdata) {


                        if (error) {
                            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                        } else {

                            res.json({ success: true, message: 'All Transaction data', data: tranmasterdata, totalcount: countdata[0].total })
                        }

                    })

                }
            })
        }
    })
}

// Select tm.id,tm.customer_id, tm.status, tm.quantity, tm.total_amount, Format(tm.price,2), tm.platform_fee, tm.platform_value, tm.created_at, tm.pair_id, tm.avg_price, tm.trade_id, pair_master.from as pair_idfrom, pair_master.to as pair_idto, tm.type, tm.trade_type from transaction_master AS tm inner join pair_master ON pair_master.id = tm.pair_id where tm.customer_id = '61'AND tm.status ='Fully Executed'order by tm.created_at desc LIMIT 10 OFFSET 0;




//verification
// exports.sendMobileCode = function(req, res) {

//     var email = [req.decoded.email]

//     let sql = "SELECT * FROM user WHERE email =?";
//     //console.log(sql)
//     connection.query(sql, email, function(error, data) {
//         if (error) {
//             res.json({ success: false, message: "error", error })
//         } else if (data[0] == null || data[0] == undefined) {

//             res.json({ success: false, message: "User not found" })
//         } else {
//             var verifyCode = ("" + Math.random()).substring(2, 7)
//             console.log("verifycode", verifyCode)


//             let sql7 = "UPDATE customer SET otp =" + verifyCode + " WHERE email = '" + email + "'";
//             // console.log(sql2)
//             connection.query(sql7, function(error, result) {
//                 if (error) {
//                     //console.log(error)
//                     res.json({ success: false, message: "Error" })
//                 } else {

//                     let mailOptions = {
//                         from: 'Fuleex Exchange<' + config.email + '>', // sender address
//                         to: email, // list of receivers
//                         subject: 'One Time Password', // Subject line
//                         text: '',
//                         html: "Hello,<br>Your one time password (OTP).<br>" + verifyCode + "" // html body
//                     }


//                     transporter.sendMail(mailOptions, (error, info) => {
//                         if (error) {
//                             console.log(error)
//                             // res.json({ success: false, message: "Error" })
//                             res.json({ success: false, message: "Error", })
//                         }
//                         //console.log('Message %s sent: %s', info.messageId, info.response);
//                         else {
//                             res.json({ success: true, messgae: "OTP send successfully" })
//                         }
//                     })
//                 }
//             })
//         }
//     })
// }


// exports.verifyMobileNo = function(req, res) {

//     var email = [req.decoded.email]

//     let sql = "SELECT * FROM user WHERE email =?";

//     //console.log(sql)
//     connection.query(sql, function(error, data) {
//         if (error) {
//             res.json({ success: false, message: "error", error })
//         } else if (data[0] == null || data[0] == undefined) {
//             res.json({ success: false, message: "User not found" })
//         } else {

//             if (data[0].otp == req.body.otp) {
//                 let sql2 = "UPDATE customer SET otpVerify = '1' WHERE id = '" + data[0].id + "'";
//                 // console.log(sql2)
//                 connection.query(sql2, function(error, result) {
//                     if (error) {
//                         //console.log(error)
//                         res.json({ success: false, message: "Error" })
//                     } else {


//                         res.json({ success: true, message: "Successfully verify Mobile Number" })


//                     }
//                 })
//             } else {

//                 res.json({ success: false, message: "Wrong OTP" })
//             }
//         }
//     })
// }


exports.getVerifyStatus = function (req, res) {

    var email = req.decoded.email

    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    //console.log(sql)
    connection.query(sql, email, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            //console.log(data)
            obj = { email: data[0].emailVerify, mobile: data[0].otpVerify, FA: data[0].FA_status }
            res.json({ success: true, message: "Verify Status", data: obj })
        }
    })
}

exports.sendEmailLink = function (req, res) {

    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    //console.log(sql)
    connection.query(sql, email, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            if (data[0].emailVerify == 1) {
                res.json({ success: false, message: "Email already verified" })
            } else {

                jwt.verify(data[0].emailToken, config.superSecret, function (err, checktoken) {
                    if (err) {
                        console.log(err)


                        stoken = {

                            email: req.body.email,
                            //device_name: req.body.device_name
                        }
                        // console.log(stoken)

                        var emailtoken = jwt.sign(stoken, config.superSecret, { expiresIn: '12h' });
                        console.log(emailtoken)

                        var updatedDate = {
                            "emailToken": emailtoken,
                        }

                        let sql7 = mysql.format("UPDATE customer SET ? WHERE email =?", [updatedDate, email]);
                        // console.log(sql2)
                        connection.query(sql7, function (error, result) {
                            if (error) {
                                //console.log(error)
                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) })
                            } else {


                                link = config.globalDomain + "/emailLinkVerify?token=" + emailtoken;

                                console.log(link)

                                let mailOptions = {
                                    from: 'Fuleex Exchange<' + config.email + '>', // sender address
                                    to: email, // list of receivers
                                    subject: 'Confirm your Email account', // Subject line
                                    text: '',
                                    html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>" // html body
                                };
                                //  console.log(mailOptions)

                                transporter.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        console.log("mail error", error)
                                        res.json({ success: false, message: "Mail error", error: cm_cfg.errorFn(error) })
                                    }
                                    //console.log('Message %s sent: %s', info.messageId, info.response);
                                    else {


                                        res.json({ success: true, message: "An email verification link has been sent to your email address." })
                                    }

                                })
                            }
                        })
                    } else {
                        res.json({ success: false, message: "Email link already sent on your email" })
                    }
                })


            }
        }
    })
}

exports.emailLinkVerify = function (req, res) {
    console.log(req.body.token)

    jwt.verify(req.body.token, config.superSecret, function (err, checktoken) {
        if (err) {
            console.log(err)
            res.json({ success: false, message: 'Email link experied.', error: cm_cfg.errorFn(err) })
        } else {
            console.log(req.body.token)

            let sql = "SELECT * FROM customer WHERE emailToken ='" + req.body.token + "'";
            console.log(sql)
            connection.query(sql, function (error, data) {
                if (data[0] == null || data[0] == undefined) {
                    res.json({ success: false, message: "User not found" })
                } else {
                    if (data[0].emailVerify == 1) {
                        console.log("okoko", data[0].emailVerify)
                        res.json({ success: false, message: "Email link experied." })
                    } else {

                        let sq = "SELECT * FROM user WHERE type_id =" + mysql.escape(data[0].id) + "";
                        //console.log(sq)
                        connection.query(sq, function (error, userdata) {

                            if (userdata[0] == null || userdata[0] == undefined) {
                                res.json({ success: false, message: "User not found" })
                            } else {

                                var updateDate = {
                                    "emailVerify": 1,
                                }

                                //let sql1 = "UPDATE customer SET emailVerify = 'true', updated_at = '" + updated_at + "' WHERE email = '" + data[0].email + "'";
                                let token_sql = mysql.format("UPDATE customer SET ? WHERE email =?", [updateDate, data[0].email]);
                                //console.log(sql1)
                                connection.query(token_sql, function (error, result) {
                                    if (error) {
                                        console.log(error)
                                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) })
                                    } else {

                                        //console.log("verified")
                                        res.json({ success: true, message: 'Email verify successfully' });

                                    }
                                })
                            }
                        })
                    }
                }
            })

        }
    })
}


exports.verifyCode = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);

    //let sql = "SELECT*FROM customer WHERE email ='" + req.decoded.email + "'";
    // console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else {
            //console.log("data", data[0])

            if (data[0] == null || data[0] == undefined) {

                res.json({ success: false, message: "User not found" })
            } else {
                //console.log(data[0].secretKey)

                var secret = data[0].secretKey

                var token = speakeasy.totp({
                    secret: secret,
                    encoding: 'base32'
                });
                // console.log(token);

                var userToken = req.body.verifyCode;

                //var verifyCode = req.body.verifyCode

                var verified = speakeasy.totp.verify({
                    secret: secret,
                    encoding: 'base32',
                    token: userToken
                    // window: 1
                });
                //console.log(verified);

                if (verified === true) {
                    res.json({ success: true, message: "2FA Authentication successfully" })
                } else {
                    res.json({ success: false, message: "2FA Authentication Failed" })
                }

            }
        }
    })
}

exports.getDashboadGraphData = function (req, res) {
    var email = req.decoded.email;
    var daysRecord = 6;
    let created = moment(new Date()).format("YYYY-MM-DD");
    var dateArray = [];
    dateArray.push(moment(new Date()).format("YYYY-MM-DD"));
    for (var i = 1; i <= 6; i++) {
        dateArray.push(moment(new Date()).subtract(i, 'd').format("YYYY-MM-DD"));
    }
    var dateString = dateArray.join(',');

    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            var all_transactions_sql = "CALL sp_getGraphTransactionData(" + daysRecord + ")";
            //console.log(all_transactions_sql);
            connection.query(all_transactions_sql, function (error, tranmasterdata) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {
                    tranmasterdata = tranmasterdata[0];
                    res.json({ success: true, message: 'All Transaction data', data: tranmasterdata })
                }

            })
        }
    })
}

// exports.allTransactionPage = function(req, res) {

//     var email = req.decoded.email;
//     let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);

//     //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
//     //console.log(sql)
//     connection.query(sql, function(error, data) {
//         if (error) {
//             res.json({ success: false, message: "error", error })
//         } else if (data[0] == null || data[0] == undefined) {

//             res.json({ success: false, message: "User not found" })
//         } else {

//             //let buyorder_sql = "Select*from buy where (status='Executed'or status='Partially Executed')and customer_id='" + data[0].id + "'";
//             let tranmaster_sql = "Select tm.id,tm.customer_id, tm.status, tm.quantity, tm.total_amount, tm.price, tm.platform_fee, tm.platform_value, tm.created_at, tm.pair_id, tm.avg_price, tm.trade_id, pair_master.from as pair_idfrom, pair_master.to as pair_idto, tm.type, tm.trade_type from transaction_master AS tm inner join pair_master ON pair_master.id = tm.pair_id where tm.customer_id = '" + data[0].id + "'";

//             connection.query(tranmaster_sql, function(error, tranmasterdata) {
//                 if (error) {
//                     res.json({ success: false, message: "error", error })
//                 } else {

//                     res.json({ success: true, message: 'All Transaction data', data: tranmasterdata })
//                 }

//             })

//         }
//     })
// }






// exports.emailChangePassword = function(req, res) {

//     rand = Math.floor((Math.random() * 100) + 54);
//     host = req.get('host');
//     link = "http://" + req.get('host') + "/#/dashboard/ChangePassword";



//     let mailOptions = {
//         from: 'Fuleex Exchange<payal.singhal@sofocle.com>', // sender address
//         to: req.body.email, // list of receivers
//         subject: 'Confirm your Email account', // Subject line
//         text: '',
//         html: "Hello,<br> Please Click on the link to change your password.<br><a href=" + link + ">Click here to verify</a>" // html body
//     };


//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             return console.log("jkjkj", error);
//         }
//         console.log('Message %s sent: %s', info.messageId, info.response);
//         res.json({ success: true, message: "mail send" })
//     });
// }










exports.emailLinkVerify = function (req, res) {
    console.log(req.body.token)

    jwt.verify(req.body.token, config.superSecret, function (err, checktoken) {
        if (err) {
            console.log(err)
            res.json({ success: false, message: 'Email link experied.', error: cm_cfg.errorFn(err) })
        } else {
            console.log(req.body.token)

            let sql = "SELECT * FROM customer WHERE emailToken ='" + req.body.token + "'";
            console.log(sql)
            connection.query(sql, function (error, data) {
                if (data[0] == null || data[0] == undefined) {
                    res.json({ success: false, message: "User not found", error: cm_cfg.errorFn(error) })
                } else {
                    if (data[0].emailVerify == 1) {
                        console.log("okoko", data[0].emailVerify)
                        res.json({ success: false, message: "Email link experied." })
                    } else {

                        let sq = "SELECT * FROM user WHERE type_id ='" + data[0].id + "'";
                        //console.log(sq)
                        connection.query(sq, function (error, userdata) {

                            if (userdata[0] == null || userdata[0] == undefined) {
                                res.json({ success: false, message: "User not found" })
                            } else {

                                var updateDate = {
                                    "emailVerify": 1,
                                }

                                //let sql1 = "UPDATE customer SET emailVerify = 'true', updated_at = '" + updated_at + "' WHERE email = '" + data[0].email + "'";
                                let token_sql = mysql.format("UPDATE customer SET ? WHERE email =?", [updateDate, data[0].email]);
                                //console.log(sql1)
                                connection.query(token_sql, function (error, result) {
                                    if (error) {
                                        console.log(error)
                                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) })
                                    } else {

                                        //console.log("verified")
                                        res.json({ success: true, message: 'Email verify successfully' });

                                    }
                                })
                            }
                        })
                    }
                }
            })

        }
    })
}


exports.faStatus = function (req, res) {


    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    //console.log(sql)
    connection.query(sql, email, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            if (data[0].FA_status == 0 && req.body.status == 0) {
                res.json({ success: false, message: "Already Disable", "faStatus": data[0].FA_status })
            } else if (data[0].FA_status == 1 && req.body.status == 1) {
                res.json({ success: false, message: "Already Enable" })
            } else {
                var secret = data[0].secretKey

                var token = speakeasy.totp({
                    secret: secret,
                    encoding: 'base32'
                });
                // console.log(token);

                var userToken = req.body.verifyCode;

                //var verifyCode = req.body.verifyCode

                var verified = speakeasy.totp.verify({
                    secret: secret,
                    encoding: 'base32',
                    token: userToken
                    // window: 1
                });
                //console.log(verified);

                if (verified === true) {

                    if (req.body.status == 0) {

                        var updatedDate = {
                            "FA_status": 0,
                            "secretKey": null
                        }

                        let stauts_sql = mysql.format("UPDATE customer SET ? WHERE email =?", [updatedDate, email]);
                        console.log(stauts_sql)
                        connection.query(stauts_sql, function (error, result) {
                            if (error) {
                                console.log(error)
                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) })
                            } else {

                                res.json({ success: true, message: "2FA Disable successfully" })
                            }
                        })
                    } else if (req.body.status == 1) {


                        var updateDate = {

                            "FA_status": 1
                        }

                        let stauts_sql = mysql.format("UPDATE customer SET ? WHERE email =?", [updateDate, email]);
                        console.log(stauts_sql)
                        connection.query(stauts_sql, function (error, result) {
                            if (error) {
                                console.log(error)
                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) })
                            } else {

                                res.json({ success: true, message: "2FA Enable successfully" })
                            }
                        })



                    } else {
                        res.json({ success: false, message: "2FA Failed" })
                    }

                } else {
                    res.json({ success: false, message: "2FA Authentication Failed" })
                }
            }
        }

    })
}



exports.verifyCode = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);

    //let sql = "SELECT*FROM customer WHERE email ='" + req.decoded.email + "'";
    // console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else {
            //console.log("data", data[0])

            if (data[0] == null || data[0] == undefined) {

                res.json({ success: false, message: "User not found" })
            } else {
                //console.log(data[0].secretKey)

                var secret = data[0].secretKey

                var token = speakeasy.totp({
                    secret: secret,
                    encoding: 'base32'
                });
                // console.log(token);

                var userToken = req.body.verifyCode;

                //var verifyCode = req.body.verifyCode

                var verified = speakeasy.totp.verify({
                    secret: secret,
                    encoding: 'base32',
                    token: userToken
                    // window: 1
                });
                //console.log(verified);

                if (verified === true) {
                    res.json({ success: true, message: "2FA Authentication successfully" })
                } else {
                    res.json({ success: false, message: "2FA Authentication Failed" })
                }


            }
        }
    })
}

exports.getDashboadGraphData = function (req, res) {
    var email = req.decoded.email;
    var daysRecord = 6;
    let created = moment(new Date()).format("YYYY-MM-DD");
    var dateArray = [];
    dateArray.push(moment(new Date()).format("YYYY-MM-DD"));
    for (var i = 1; i <= 6; i++) {
        dateArray.push(moment(new Date()).subtract(i, 'd').format("YYYY-MM-DD"));
    }
    var dateString = dateArray.join(',');

    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            var all_transactions_sql = "CALL sp_getGraphTransactionData(" + daysRecord + ")";
            //console.log(all_transactions_sql);
            connection.query(all_transactions_sql, function (error, tranmasterdata) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {
                    tranmasterdata = tranmasterdata[0];
                    res.json({ success: true, message: 'All Transaction data', data: tranmasterdata })
                }

            })
        }
    })
}


// exports.allTransactionPage = function(req, res) {

//     var email = req.decoded.email;
//     let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);

//     //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
//     //console.log(sql)
//     connection.query(sql, function(error, data) {
//         if (error) {
//             res.json({ success: false, message: "error", error })
//         } else if (data[0] == null || data[0] == undefined) {

//             res.json({ success: false, message: "User not found" })
//         } else {

//             //let buyorder_sql = "Select*from buy where (status='Executed'or status='Partially Executed')and customer_id='" + data[0].id + "'";
//             let tranmaster_sql = "Select tm.id,tm.customer_id, tm.status, tm.quantity, tm.total_amount, tm.price, tm.platform_fee, tm.platform_value, tm.created_at, tm.pair_id, tm.avg_price, tm.trade_id, pair_master.from as pair_idfrom, pair_master.to as pair_idto, tm.type, tm.trade_type from transaction_master AS tm inner join pair_master ON pair_master.id = tm.pair_id where tm.customer_id = '" + data[0].id + "'";

//             connection.query(tranmaster_sql, function(error, tranmasterdata) {
//                 if (error) {
//                     res.json({ success: false, message: "error", error })
//                 } else {

//                     res.json({ success: true, message: 'All Transaction data', data: tranmasterdata })
//                 }

//             })

//         }
//     })
// }







// exports.emailChangePassword = function(req, res) {

//     rand = Math.floor((Math.random() * 100) + 54);
//     host = req.get('host');
//     link = "http://" + req.get('host') + "/#/dashboard/ChangePassword";



//     let mailOptions = {
//         from: 'Fuleex Exchange<payal.singhal@sofocle.com>', // sender address
//         to: req.body.email, // list of receivers
//         subject: 'Confirm your Email account', // Subject line
//         text: '',
//         html: "Hello,<br> Please Click on the link to change your password.<br><a href=" + link + ">Click here to verify</a>" // html body
//     };


//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             return console.log("jkjkj", error);
//         }
//         console.log('Message %s sent: %s', info.messageId, info.response);
//         res.json({ success: true, message: "mail send" })
//     });
// }




// exports.lastLogin = function(req, res) {

//     var email = [req.decoded.email]

//     let sql = "SELECT * FROM user WHERE email =?";
//     //console.log(sql)
//     connection.query(sql, email, function(error, data) {
//         if (error) {
//             res.json({ success: false, message: "error", error })
//         } else if (data[0] == null || data[0] == undefined) {

//             res.json({ success: false, message: "User not found" })
//         } else {

//             //let lastlogin_sql = SELECT created_at FROM log where activity_type='011' and user_id=143 order by created_at desc limit 2

//             let lastlogin_sql = "SELECT MAX(created_at) as last FROM log where activity_type='011' and user_id='" + data[0].id + "'";

//             connection.query(lastlogin_sql, function(error, lastlogindata) {
//                 if (error) {
//                     res.json({ success: false, message: "error", error })
//                 } else {

//                     res.json({ success: true, message: 'Last Login data', data: lastlogindata[0].last })
//                 }

//             })
//         }
//     })
// }





// exports.allTransactionfilter = function(req, res) {

//     let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
//     //console.log(sql)
//     connection.query(sql, function(error, data) {
//         if (error) {
//             res.json({ success: false, message: "error", error })
//         } else if (data[0] == null || data[0] == undefined) {

//             res.json({ success: false, message: "User not found" })
//         } else {

//             var limit = req.params.limit;
//             var offset = req.params.offset == null ? 0 : req.params.offset;

//             console.log(offset)

//             let tranmastercount_sql = "SELECT COUNT( * ) as total FROM transaction_master where customer_id = '" + data[0].id + "'";
//             connection.query(tranmastercount_sql, function(error, countdata) {
//                 if (error) {
//                     res.json({ success: false, message: "error", error })
//                 } else {

//                     let tranmaster_sql = "Select tm.id,tm.customer_id, tm.status, tm.quantity, tm.total_amount, tm.price, tm.platform_fee, tm.platform_value, tm.created_at, tm.pair_id, tm.avg_price, tm.trade_id, pair_master.from as pair_idfrom, pair_master.to as pair_idto, tm.type, tm.trade_type from transaction_master AS tm inner join pair_master ON pair_master.id = tm.pair_id where tm.customer_id = '" + data[0].id + "' LIMIT " + limit + " OFFSET " + offset + "";

//                     connection.query(tranmaster_sql, function(error, tranmasterdata) {
//                         if (error) {
//                             res.json({ success: false, message: "error", error })
//                         } else {

//                             res.json({ success: true, message: 'All Transaction data', data: tranmasterdata, totalcount: countdata[0].total })
//                         }

//                     })

//                 }
//             })
//         }
//     })
// }












// exports.wallet = function(req, res) {
//     var samedata=[];
//     function walletcreation(arrdata, customerId) {
//         return new Promise(function(resolve, reject) {
//             var i = arrdata.length
//             console.log("fwwfj", i)
//             async.forEachOf(arrdata, function(error, i, inner_callback) {
//                     let sql5 = "INSERT INTO customer_wallet (customer_id,total_amount,currency_code,created_at) values ('" + customerId + "','0','" + arrdata[i].currency_code + "','" + created_at + "');"
//                     //console.log("query", sql4)
//                     connection.query(sql5, function(error, final) {
//                         if (error) {
//                             console.log("Error while performing Query");
//                             inner_callback(error);
//                         } else {

//                             console.log("done")
//                             inner_callback(null);
//                         }
//                     })

//                 },
//                 function(err) {
//                     if (err) {
//                         console.log(err)
//                         reject(err)
//                         //handle the error if the query throws an error

//                     } else {
//                         console.log("ok")
//                         resolve("ok")

//                         //whatever you wanna do after all the iterations are done
//                     }
//                 }
//             )
//         })
//     }


//     let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
//     //console.log(sql)
//     connection.query(sql, function(error, data) {
//         if (error) {
//             res.json({ success: false, message: "error", error })
//         } else if (data[0] == null || data[0] == undefined) {

//             res.json({ success: false, message: "User not found" })
//         } else {
//             //console.log(data[0].name)
//             let sql = "SELECT * FROM currency_master where status='1'";
//             connection.query(sql, function(error, presentcurrency) {
//                 if (error) {
//                     res.json({ success: false, message: "error", error })
//                 } else if (presentcurrency[0] == null || presentcurrency == undefined) {
//                     res.json({ success: false, message: "No active currency found" })
//                 } else {
//                     let sql1 = "SELECT * FROM customer_wallet WHERE customer_id ='" + data[0].id + "'";
//                     //console.log(sql)
//                     connection.query(sql1, function(error, customerdataa) {
//                         if (error) {
//                             res.json({ success: false, message: "error", error })
//                         } else {

//                                         samedata.push(customerdataa)

//                             function remove_duplicates(a, b) {
//                                 for (var i = 0, len = a.length; i < len; i++) {
//                                     for (var j = 0, len2 = b.length; j < len2; j++) {
//                                         if (a[i].currency_code === b[j].currency_code) {
//                                             b.splice(j, 1);
//                                             len2 = b.length;
//                                         }
//                                     }
//                                 }
//                                 //ret

//                                 console.log("pc", a);
//                                 console.log("cc", b);

//                             }
//                             //console.log(presentcurrency)
//                             //console.log(customerdataa)

//                             remove_duplicates(customerdataa, presentcurrency);

//                             if (presentcurrency[0] == null) {
//                                 res.json({ success: true,message:"no added", data: samedata[0] })
//                             } else {


//                                 for (var i = 0, len = presentcurrency.length; i < len; i++) {
//                                     console.log("name:" + presentcurrency[i].currency_code + " id:" + presentcurrency[i].id);


//                                 var walletdata = walletcreation(presentcurrency, data[0].id)
//                                 walletdata.then(function(wadata) {
//                                     let sql2 = "SELECT * FROM customer_wallet WHERE customer_id ='" + data[0].id + "'";
//                                     //console.log(sql)
//                                     connection.query(sql2, function(error, dataa) {
//                                         if (error) {
//                                             res.json({ success: false, message: "error", error })
//                                         } else {

//                                             res.json({ success: true, data: dataa })
//                                         }

//                                     })

//                                 }).catch(function(e) {
//                                     res.json({ success: false, message: "Error", error: e })
//                                 })
//                             }
//                             }


//                         }

//                     })
//                 }
//             })
//         }
//     })
// }



// exports.wallet = function(req, res) {
// var samedata=[];
//     function walletcreation(arrdata, customerId) {
//         return new Promise(function(resolve, reject) {
//             var i = arrdata.length
//             console.log("fwwfj", i)
//             async.forEachOf(arrdata, function(error, i, inner_callback) {
//                     let sql5 = "INSERT INTO customer_wallet (customer_id,total_amount,currency_code,created_at) values ('" + customerId + "','0','" + arrdata[i].currency_code + "','" + created_at + "');"
//                     //console.log("query", sql4)
//                     connection.query(sql5, function(error, final) {
//                         if (error) {
//                             console.log("Error while performing Query");
//                             inner_callback(error);
//                         } else {

//                             console.log("done")
//                             inner_callback(null);
//                         }
//                     })

//                 },
//                 function(err) {
//                     if (err) {
//                         console.log(err)
//                         reject(err)
//                         //handle the error if the query throws an error

//                     } else {
//                         console.log("ok")
//                         resolve("ok")

//                         //whatever you wanna do after all the iterations are done
//                     }
//                 }
//             )
//         })
//     }


//     let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
//     //console.log(sql)
//     connection.query(sql, function(error, data) {
//         if (error) {
//             res.json({ success: false, message: "error", error })
//         } else if (data[0] == null || data[0] == undefined) {

//             res.json({ success: false, message: "User not found" })
//         } else {
//             //console.log(data[0].name)
//             let sql = "SELECT * FROM currency_master where status='1'";
//             connection.query(sql, function(error, presentcurrency) {
//                 if (error) {
//                     res.json({ success: false, message: "error", error })
//                 } else if (presentcurrency[0] == null || presentcurrency == undefined) {
//                     res.json({ success: false, message: "No active currency found" })
//                 } else {
//                     let sql1 = "SELECT * FROM customer_wallet WHERE customer_id ='" + data[0].id + "'";
//                     //console.log(sql)
//                     connection.query(sql1, function(error, customerdataa) {
//                         if (error) {
//                             res.json({ success: false, message: "error", error })
//                         } else {

//                                         samedata.push(customerdataa)

//                             function remove_duplicates(a, b) {
//                                 for (var i = 0, len = a.length; i < len; i++) {
//                                     for (var j = 0, len2 = b.length; j < len2; j++) {
//                                         if (a[i].currency_code === b[j].currency_code) {
//                                             b.splice(j, 1);
//                                             len2 = b.length;
//                                         }
//                                     }
//                                 }
//                                 //ret

//                                 console.log("pc", a);
//                                 console.log("cc", b);

//                             }
//                             //console.log(presentcurrency)
//                             //console.log(customerdataa)

//                             remove_duplicates(customerdataa, presentcurrency);

//                             if (presentcurrency[0] == null) {
//                                 res.json({ success: true,message:"no added", data: samedata[0] })
//                             } else {


//                                 for (var i = 0, len = presentcurrency.length; i < len; i++) {
//                                     console.log("name:" + presentcurrency[i].currency_code + " id:" + presentcurrency[i].id);


//                                 var walletdata = walletcreation(presentcurrency, data[0].id)
//                                 walletdata.then(function(wadata) {
//                                     let sql2 = "SELECT * FROM customer_wallet WHERE customer_id ='" + data[0].id + "'";
//                                     //console.log(sql)
//                                     connection.query(sql2, function(error, dataa) {
//                                         if (error) {
//                                             res.json({ success: false, message: "error", error })
//                                         } else {

//                                             res.json({ success: true, data: dataa })
//                                         }

//                                     })

//                                 }).catch(function(e) {
//                                     res.json({ success: false, message: "Error", error: e })
//                                 })
//                             }
//                             }


//                         }

//                     })
//                 }
//             })
//         }
//     })
// }

//select*from customer_wallet inner join currency_master ON currency_master.currency_code= customer_wallet.currency_code where customer_wallet.customer_id ='151'and currency_master.status="1"



//dynamic walllet
// exports.wallet = function(req, res) {
//     var samedata = [];

//     function walletcreation(arrdata, customerId) {
//         return new Promise(function(resolve, reject) {
//             var i = arrdata.length
//             console.log("fwwfj", i)
//             async.forEachOf(arrdata, function(error, i, inner_callback) {
//                     let sql5 = "INSERT INTO customer_wallet (customer_id,total_amount,currency_code,created_at) values ('" + customerId + "','0','" + arrdata[i].currency_code + "','" + created_at + "');"
//                     //console.log("query", sql4)
//                     connection.query(sql5, function(error, final) {
//                         if (error) {
//                             console.log("Error while performing Query");
//                             inner_callback(error);
//                         } else {

//                             console.log("done")
//                             inner_callback(null);
//                         }
//                     })

//                 },
//                 function(err) {
//                     if (err) {
//                         console.log(err)
//                         reject(err)
//                         //handle the error if the query throws an error

//                     } else {
//                         console.log("ok")
//                         resolve("ok")

//                         //whatever you wanna do after all the iterations are done
//                     }
//                 }
//             )
//         })
//     }


//     let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
//     //console.log(sql)
//     connection.query(sql, function(error, data) {
//         if (error) {
//             res.json({ success: false, message: "error", error })
//         } else if (data[0] == null || data[0] == undefined) {

//             res.json({ success: false, message: "User not found" })
//         } else {
//             //console.log(data[0].name)
//             let sql = "SELECT * FROM currency_master where status='1'";
//             connection.query(sql, function(error, presentcurrency) {
//                 if (error) {
//                     res.json({ success: false, message: "error", error })
//                 } else if (presentcurrency[0] == null || presentcurrency == undefined) {
//                     res.json({ success: false, message: "No active currency found" })
//                 } else {
//                     let sql1 = "Select customer_id,total_amount,customer_wallet.currency_code ,currency_master.status from customer_wallet inner join currency_master ON currency_master.currency_code= customer_wallet.currency_code where customer_wallet.customer_id ='" + data[0].id + "'and currency_master.status='1'";

//                     //console.log(sql)
//                     connection.query(sql1, function(error, customerdataa) {
//                         if (error) {
//                             res.json({ success: false, message: "error", error })
//                         } else {

//                             samedata.push(customerdataa)

//                             function remove_duplicates(a, b) {
//                                 for (var i = 0, len = a.length; i < len; i++) {
//                                     for (var j = 0, len2 = b.length; j < len2; j++) {
//                                         if (a[i].currency_code === b[j].currency_code) {
//                                             b.splice(j, 1);
//                                             len2 = b.length;
//                                         }
//                                     }
//                                 }
//                                 //ret

//                                 console.log("pc", a);
//                                 console.log("cc", b);

//                             }
//                             //console.log(presentcurrency)
//                             //console.log(customerdataa)

//                             remove_duplicates(customerdataa, presentcurrency);

//                             if (presentcurrency[0] == null) {
//                                 res.json({ success: true, message: "no added", data: samedata[0] })
//                             } else if (presentcurrency[0] != null) {


//                                 for (var i = 0, len = presentcurrency.length; i < len; i++) {
//                                     console.log("name:" + presentcurrency[i].currency_code + " id:" + presentcurrency[i].id);


//                                     var walletdata = walletcreation(presentcurrency, data[0].id)
//                                     walletdata.then(function(wadata) {
//                                         let sql2 = "SELECT * FROM customer_wallet WHERE customer_id ='" + data[0].id + "'";
//                                         //console.log(sql)
//                                         connection.query(sql2, function(error, dataa) {
//                                             if (error) {
//                                                 res.json({ success: false, message: "error", error })
//                                             } else {

//                                                 res.json({ success: true, data: dataa })
//                                             }

//                                         })

//                                     }).catch(function(e) {
//                                         res.json({ success: false, message: "added", message: "Error", error: e })
//                                     })
//                                 }
//                             }


//                         }

//                     })
//                 }
//             })
//         }
//     })
// }





// exports.profile = function(req, res) {
//     let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
//     //console.log(sql)
//     connection.query(sql, function(error, data) {
//         if (error) {
//             res.json({ success: false, message: "error", error })
//         } else if (data[0] == null || data[0] == undefined) {

//             res.json({ success: false, message: "User not found" })
//         } else {
//             //console.log(req.decoded.email)

//             let sql1 = "UPDATE customer SET country='" + req.body.country + "',address ='" + req.body.address + "',city ='" + req.body.city + "',postal_code ='" + req.body.postal_code + "' WHERE email = '" + req.decoded.email + "'";
//             //console.log(sql1)
//             connection.query(sql1, function(error, result) {
//                 if (error) {
//                     res.json({ success: false, message: "error", error })
//                 } else {
//                     let sql2 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) SELECT id,'edit profile','031','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at + "',id,id FROM user WHERE email='" + req.decoded.email + "';"
//                     //console.log(result)
//                     connection.query(sql2, function(error, result) {
//                         if (error) {
//                             res.json({ success: false, message: "error", error })
//                         } else {
//                             res.json({ success: true, message: "User Profile Successfully updated" })
//                         }
//                     })
//                 }
//             })
//         }

//     })
// }
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/' + folder + '/kyc/')
    },
    filename: function (req, file, cb) {
        //cb(null, file.fieldname + '-' + Date.now())
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
})

var upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: function (req, file, cb) {
        //console.log(file.mimetype)
        // console.log("size", file.fileSize)
        if (file.mimetype == 'image/png' || file.mimetype == 'application/msword' || file.mimetype == 'image/jpeg' || file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype == 'application/pdf') {
            return cb(null, true);
        } else {
            cb(null, false);
        }
    }
}).fields([{ name: 'pan_img', maxCount: 1 },
{ name: 'aadhar_front_img', maxCount: 1 },
{ name: 'aadhar_back_img', maxCount: 1 }
])


exports.uploadKycDetails = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            var id_pan = req.params.id_pan;
            var id_aadhar = req.params.id_aadhar;
            fs.mkdir("uploads/" + data[0].id + "/kyc/", function (err) {
                folder = data[0].id
                upload(req, res, function (error) {
                    if (error) {
                        res.json({ success: false, message: "error in photo upload", error: cm_cfg.errorFn(error) })
                    }
                    else if (!req.files) {
                        res.json({ success: false, message: "No file found " });
                    }
                    else if (Object.keys(req.files).length) {

                        // var ext = req.file.originalname.substr(req.file.originalname.lastIndexOf('.') + 1);
                        if (req.files.pan_img && req.files.aadhar_front_img && req.files.aadhar_back_img) {
                            let document_name = req.files.pan_img;
                            var doc_pan = document_name != "" ? document_name[0].filename : "";
                            let updateSql = mysql.format("UPDATE customer_kyc SET front_img=? WHERE customer_id=? and doc_name =?", [doc_pan, data[0].id, 'pan']);
                            //console.log(updateSql);
                            connection.query(updateSql, function (error, datapan) {
                                if (error) {
                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                } else {
                                    var document1 = req.files.aadhar_front_img;
                                    var document2 = req.files.aadhar_back_img;
                                    var doc_front = document1 != "" ? document1[0].filename : "";
                                    var doc_back = document2 != "" ? document2[0].filename : "";
                                    let upSql = mysql.format("UPDATE customer_kyc SET front_img=? ,back_img=? WHERE customer_id=? and id =?", [doc_front, doc_back, data[0].id, id_aadhar]);
                                    connection.query(upSql, function (error, dataadhar) {
                                        if (error) {
                                            res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                        } else {
                                            let status_sql = mysql.format("UPDATE customer SET kyc_status ='1' WHERE id = ?", [data[0].id])
                                            connection.query(status_sql, function (error, data) {
                                                if (error) {
                                                    // console.log(error)
                                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                                } else {
                                                    console.log(data)
                                                    res.json({ success: true, message: 'Profile updated  successfully' });
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                        else if (req.files.aadhar_front_img || req.files.aadhar_back_img) {
                            var document1 = req.files.aadhar_front_img;
                            var document2 = req.files.aadhar_back_img;
                            // var objUpdate={};
                            if (req.files.aadhar_front_img) {
                                var doc_front = document1 != "" ? document1[0].filename : "";
                                //objUpdate.front_img=doc_front;
                            } if (req.files.aadhar_back_img) {
                                var doc_back = document2 != "" ? document2[0].filename : "";
                                // objUpdate.back_img=doc_back;
                            }
                            // console.log(objUpdate);

                            let upSql = mysql.format("UPDATE customer_kyc SET front_img=? ,back_img=? WHERE customer_id=? and id =?", [doc_front, doc_back, data[0].id, id_aadhar]);
                            connection.query(upSql, function (error, dataadhar) {
                                if (error) {
                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                } else {
                                    let status_sql = mysql.format("UPDATE customer SET kyc_status ='1' WHERE id = ?", [data[0].id])
                                    connection.query(status_sql, function (error, data) {
                                        if (error) {
                                            //console.log(error)
                                            res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                        } else {
                                            //  console.log(data)

                                            res.json({ success: true, message: 'Profile updated successfully' });
                                        }
                                    })
                                }
                            })
                        }

                        else if (req.files.pan_img) {
                            let document_name = req.files.pan_img;
                            var doc_pan = document_name != "" ? document_name[0].filename : "";
                            let updateSql = mysql.format("UPDATE customer_kyc SET front_img=? WHERE customer_id=? and id =?", [doc_pan, data[0].id, id_pan]);
                            connection.query(updateSql, function (error, datapan) {
                                if (error) {
                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                } else {
                                    //success =1
                                    res.json({ success: true, message: 'Profile updated successfully' });
                                }
                            })
                        }
                        else {
                            res.json({ success: true, message: "image not updated" });
                        }

                    }
                    else {
                        res.json({ success: true, message: 'Profile updated  successfully' });
                    }
                })
            })
        }
    })
}





//kyc details...........................
exports.customerKycDetails = function (req, res) {

    var array = [];
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            let sql1 = mysql.format("SELECT * FROM customer_kyc WHERE customer_id =?", [data[0].id])
            connection.query(sql1, function (err, data1) {
                if (err) {
                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                }
                else if (data1.length > 0) {
                    // console.log(data1[0].id);
                    // console.log(data1[1].id)
                    var updateDataPan = {
                        "name": req.body.pan_name,
                        "dob": moment(req.body.dob).format("YYYY-MM-DD"),
                        "number": req.body.pan_number,
                        "status": 1,
                        "created_at": created_at(),
                        "created_by": req.decoded.id,
                    }

                    let sql2 = mysql.format('UPDATE customer_kyc SET ? WHERE customer_id = ? and doc_name =?', [updateDataPan, data[0].id, 'pan']);
                    connection.query(sql2, function (err, data2) {
                        if (err) {
                            res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                        }
                        else {
                            array.push({ "idPan": data1[0].id });
                            var updateDataAdhar = {
                                "customer_id": data[0].id,
                                "name": req.body.aadhar_name,
                                "number": req.body.aadhar_number,
                                "status": 1,
                                "created_at": created_at(),
                                "created_by": req.decoded.id,
                            }
                            let sql3 = mysql.format('UPDATE customer_kyc SET ? WHERE customer_id = ? and doc_name = ?', [updateDataAdhar, data[0].id, 'aadhar']);
                            // console.log(sql3);
                            connection.query(sql3, function (err, data3) {
                                if (err) {
                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                }
                                else {
                                    array.push({ "idAdhar": data1[1].id })
                                    res.json({ success: true, message: "Data added successfully", id: array });
                                }
                            })
                        }
                    })
                }
                else {
                    var insertData_pan = {
                        "customer_id": data[0].id,
                        "name": req.body.pan_name,
                        "dob": moment(new Date(req.body.dob).getTime()).format("YYYY-MM-DD"),
                        "number": req.body.pan_number,
                        "doc_name": 'pan',
                        "status": 1,
                        "created_at": created_at(),
                        "created_by": req.decoded.id,
                    }

                    let sql1 = mysql.format("INSERT INTO customer_kyc SET ?", [insertData_pan]);
                    console.log(sql1)
                    connection.query(sql1, function (error1, data4) {
                        if (error1) {
                            console.log(error1)

                            res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                        } else {

                            array.push({ "idPan": data1.insertId });

                            var insertDataAdhar = {
                                "customer_id": data[0].id,
                                "name": req.body.aadhar_name,
                                "number": req.body.aadhar_number,
                                "doc_name": 'aadhar',
                                "status": 1,
                                "created_at": created_at(),
                                "created_by": req.decoded.id,
                            }


                            let sql1 = mysql.format("INSERT INTO customer_kyc SET ?", [insertDataAdhar]);
                            connection.query(sql1, function (error, dataadhar) {
                                if (error) {

                                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                                } else {
                                    array.push({ "idAdhar": dataadhar.insertId })
                                    res.json({ success: true, message: "Data added successfully", id: array });
                                }
                            })
                        }
                    })
                }
            })

        }
    })

}
//get kyc info.............
exports.getKycDetails = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {

            let getsql = mysql.format(`Select *,concat('uploads/${mysql.escape(data[0].id)}/kyc/',front_img) as f_img,concat('uploads/${mysql.escape(data[0].id)}/kyc/',back_img) as b_img from customer_kyc where customer_id = ${data[0].id}`)
            connection.query(getsql, function (error, kycData) {
                console.log("kycData");
                console.log(kycData)

                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {
                    // kycData = data[0]
                    // connection.query(`select  from customer_kyc where customer_id = ${data[0].id}`,
                    // (err, doc)=>{
                    //     // console.log(`select concat('uploads/kyc/${customer_id}/front_img/',front_img) as f_img,concat('uploads/kyc/${customer_id}/back_img/',back_img) as b_img from customer_kyc where customer_id = ${data[0].id}`)
                    //     if(err){
                    //       res.json({ success: false, message: 'Error', error: cm_cfg.errorFn(err) })
                    //     } else {
                    //         // console.log(doc.length)
                    //         // if (doc.length){
                    //         //     kycData.documents = []
                    //         //     doc.forEach((document)=>{
                    //         //         kycData.documents.push(document.f_img)
                    //         //         kycData.documents.push(document.b_img)
                    //         //   })}
                    //         //   kycData[0].front_img=doc[0].f_img
                    //         //   kycData[0].back_img=doc[0].b_img
                    //         //   kycData[1].front_img=doc[0].f_img
                    //         //   kycData[1].back_img=doc[0].b_img
                    //         // console.log("new kyc data")
                    //         //   console.log(kycData)
                    //         res.json({ success: true, message: "Profile info", result: doc })
                    //     }
                    //   })
                    res.json({ success: true, message: "Profile info", result: kycData, kycStatus: data[0].kyc_status })
                }

            })
        }
    })
}

const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/' + req.userId)
    },
    filename: (req, file, cb) => {
        //cb(null, file.fieldname + '-' + Date.now())
        cb(null, 'profile.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
})

const uploadProfileImage = multer({
    storage: profileStorage,
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: function (req, file, cb) {
        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpeg') {
            return cb(null, true)
        } else {
            cb(null, false)
        }
    }
}).single('profile_image')

exports.uploadProfileImage = (req, res) => {
    const email = req.decoded.email
    new Promise((resolve, reject) => {
        connection.query(`SELECT id FROM customer WHERE email=?`, [email], (err, result) => {
            if (err)
                return reject(err)
            req.userId = result[0].id
            fs.mkdir("uploads/" + result[0].id, (err) => {
                if (err)
                    return reject(err)
                uploadProfileImage(req, res, (err) => {
                    console.log(req.file)
                    if (err)
                        return reject(err)
                    let ext = req.file.originalname.split('.')[1]
                    if (!['jpeg', 'png', 'jpg'].includes(ext))
                        return reject({ ecode: 1, message: 'Invalid Filetype' })
                    connection.query('UPDATE customer SET profile_image_ext=? WHERE id=?', [ext, req.userId], (err) => {
                        if (err)
                            return reject(err)
                        resolve()
                    })
                })
            })
        })
    }).then(() => {
        res.json({ success: true, message: 'Profile image uploaded' })
    }).catch((err) => {
        res.json({ success: false, message: err.ecode ? err.message : 'Image not uploaded. Try again', error: !err.ecode ? cm_cfg.errorFn(err) : null })
    })
}
//kyc form upload

var kycStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './frontend/public/uploads/' + folder + '/kyc/')
    },
    filename: (req, file, cb) => {
        console.log('Original file name is ', file)
        console.log('Original file name is ', file.fieldname)
        //cb(null, file.fieldname + '-' + Date.now())
        cb(null, fileName + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
})

var kycStorageFields = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './frontend/public/uploads/' + folder + '/kyc/')
    },
    filename: (req, file, cb) => {
        console.log('Original file name is ', file)
        console.log('Original file name is ', file.fieldname)
        if (file.fieldname == 'kyc_form') {
            fileNameFields = 'KYC';
        }
        if (file.fieldname == 'selfie_photo') {
            fileNameFields = 'Selfie';
        }
        if (file.fieldname == 'identity_doc') {
            fileNameFields = 'Identity_Document';
        }
        if (file.fieldname == 'address_doc') {
            fileNameFields = 'Address_Document';
        }
        if (file.fieldname == 'fund_source') {
            fileNameFields = 'Fund_Source';
        }
        if (file.fieldname == 'transfer_purpose') {
            fileNameFields = 'Transfer_Purpose';
        }
        fileNameFields = fileNameFields+'_'+folder;
        //cb(null, file.fieldname + '-' + Date.now())
        cb(null, fileNameFields + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
})

const uploadKycDetails_n = multer({
    storage: kycStorage,
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: function (req, file, cb) {
        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpeg' || file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype == 'application/pdf' || file.mimetype == 'application/msword') {
            return cb(null, true)
        } else {
            cb(null, false)
        }
    }
}).single('kyc_form')

/**
 * This api is hit only a single time for every file.
 */
exports.uploadKycForm = function (req, res) {
    console.log(req.query.id, JSON.stringify(req.query.id), req.query.id.toString())
    let adminAprovalStatus = req.query.adminAprovalStatus;
    uploadData = {}
    var uploadFilePath = (path) => {
        if (req.query.id == 'kyc_form') {
            uploadData['kyc_form'] = path;
        }
        else if (req.query.id == 'selfie_photo') {
            uploadData['selfie_photo'] = path;
        }
        else if (req.query.id == 'identity_doc') {
            uploadData['identity_doc'] = path;
        }
        else if (req.query.id == 'address_doc') {
            uploadData['address_doc'] = path;
        }
        else if (req.query.id == 'fund_source') {
            uploadData['fund_source'] = path;
        }
        else if (req.query.id == 'transfer_purpose') {
            uploadData['transfer_purpose'] = path;
        }
        else {
            res.json({ success: false, message: 'error' })
            return null;
        }

    }
    fileName = ''
    var filePath = req.query.id;

    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            // var kyc_data= req.file
            fs.mkdir("./frontend/public/uploads/" + data[0].id + "/kyc/", function (err) {
                folder = data[0].id;
                if (req.query.id == 'kyc_form') {
                    fileName = 'KYC';
                }
                else if (req.query.id == 'selfie_photo') {
                    fileName = 'Selfie';
                }
                else if (req.query.id == 'identity_doc') {
                    fileName = 'Identity_Document';
                }
                else if (req.query.id == 'address_doc') {
                    fileName = 'Address_Document';
                }
                else if (req.query.id == 'fund_source') {
                    fileName = 'Fund_Source';
                }
                else if (req.query.id == 'transfer_purpose') {
                    fileName = 'Transfer_Purpose';
                }
                else {
                    res.json({ success: false, message: 'error', error })
                }

                uploadKycDetails_n(req, res, function (error) {
                    if (error) {
                        res.json({ success: false, message: "error in file upload", error: cm_cfg.errorFn(error) })
                    }
                    else if (!req.file) {
                        res.json({ success: false, message: "No file found " });
                    }
                    else {

                        if (req.query.no == req.query.total) {

                            uploadData = {
                                "customer_id": data[0].id,
                                // filePath:req.file.path,
                                "status": '1',
                                "created_at": created_at()
                            }

                            uploadFilePath(req.file.path)
                        }
                        else {
                            uploadData = {
                                "customer_id": data[0].id,
                                // filePath:req.file.path,
                                "status": '0',
                                "created_at": created_at()
                            }
                            uploadFilePath(req.file.path)
                        }

                        if (req.query.no == 1 && !(req.query.id == 'fund_source' || req.query.id == 'transfer_purpose')) {
                            if (adminAprovalStatus == 3) {
                                var sql = mysql.format("UPDATE customer_kyc SET ? where customer_id = ? ", [uploadData, data[0].id])
                                connection.query(sql, function (err, dta) {
                                    if (err) {
                                        res.json({ success: false, message: 'error in upload', err });
                                    }
                                    else {
                                        // res.json({ success: 'wait', message: 'KYC details upload successfully' });
                                    }
                                })
                            }
                            else {
                                // "recreating the flow #1 INSERT", uploadData;
                                var sql = mysql.format("INSERT INTO customer_kyc SET ? ", [uploadData])
                                connection.query(sql, function (err, dta) {
                                    if (err) {
                                        res.json({ success: false, message: 'error in upload', err });
                                        console.log(err)
                                    }
                                    else {
                                        // res.json({ success: 'wait', message: 'KYC details upload successfully' });
                                    }
                                })
                            }
                        }
                        else {
                            /*                            var check = mysql.format("SELECT * from customer_kyc where customer_id = ? ", [data[0].id])
                                                        connection.query(check, function (err, dta) {
                                                            if (err) {
                                                                res.json({ success: false, message: 'error in upload', err });
                                                            }
                                                            else {
                                                        }})*/
                            // recreating the flow #2 no!=1 case", uploadData, data[0].id);
                            var sql = mysql.format("UPDATE customer_kyc SET ? where customer_id = ? ", [uploadData, data[0].id])
                            connection.query(sql, function (err, dta) {
                                // "check err and data #239 second", err, dta)
                                if (err) {
                                    res.json({ success: false, message: 'error in upload', err });
                                    console.log(err)
                                }
                                else {
                                    if (req.query.no == req.query.total && req.query.adminAprovalStatus != 2) {
                                        // "recreating the flow #3 customer table updated", data[0].id);
                                        var sql1 = mysql.format("UPDATE customer set kyc_status =1 where id=? ", [data[0].id]);

                                        connection.query(sql1, function (error, result) {
                                            if (error) {
                                                console.log(error);
                                                res.json({ success: false, message: 'error', error })
                                            }
                                            else {
                                                /**Temporary code
                                                 * changes on the way.
                                                 */
                                                setTimeout(() => {
                                                    res.json({ success: true, message: 'KYC details upload successfully' });
                                                }, 11000);
                                            }
                                        })
                                    }
                                    else {
                                        // res.json({ success: 'wait', message: 'KYC details upload successfully' });
                                        // res.json({ success: true, message: 'KYC details upload successfully' });
                                    }
                                }
                            })
                        }



                    }
                })
            })
        }
    })
}
//download

const uploadKycDetailsFields = multer({
    storage: kycStorageFields,
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: function (req, file, cb) {
        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpeg' || file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype == 'application/pdf' || file.mimetype == 'application/msword') {
            return cb(null, true)
        } else {
            cb(null, false)
        }
    }
}).fields([{ name: "kyc_form" }, { name: "selfie_photo" }, { name: "identity_doc" }, { name: "address_doc" }, { name: "fund_source" }, { name: "transfer_purpose" }])    //'kyc_form_arr', 6)

exports.uploadKycFormFields = function (req, res) {
    // ("Request body #numero uno", req.body);
    let update_customer = (cst_id, status, cb) => {
        let cst_update = mysql.format("UPDATE customer set kyc_status = ? where id=? ", [status, cst_id]);
        connection.query(cst_update, function (error, result) {
            if (error) {
                console.log(error);
                return cb(null);
            }
            else {
                return cb(true);
            }
        })
    },
        mime_detector = (ext_test, cb) => {
            let join_arr = [];
            async.forEach(ext_test, (element, next) => {
                magic.detectFile(element.path, (magic_err, magic_result) => {
                    // ("path detected ", ext_test.indexOf(element), magic_err, magic_result);
                    if (magic_err) {
                        return res.json({ success: false, message: "Extension detection error." });
                    }
                    if (element.fieldname === "kyc_form" &&
                        !(magic_result === 'application/msword' ||
                            magic_result === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
                        join_arr.push("KYC Form");
                        // return res.json({ success: false, message: "KYC Form type is Invalid." });
                    }
                    if (element.fieldname === "selfie_photo" &&
                        !(magic_result === 'application/msword' ||
                            magic_result === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                            magic_result == 'image/png' ||
                            magic_result == 'image/jpeg')) {
                        join_arr.push("Selfie Photo");
                        // return res.json({ success: false, message: "Selfie Photo type is Invalid." });
                    }
                    if (element.fieldname === "identity_doc" &&
                        !(magic_result === 'application/msword' ||
                            magic_result === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                            magic_result == 'image/png' ||
                            magic_result == 'image/jpeg')) {
                            join_arr.push("Identity Document");
                        // return res.json({ success: false, message: "Identity Document type is Invalid." });
                    }
                    if (element.fieldname === "address_doc" &&
                        !(magic_result === 'application/msword' ||
                            magic_result === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                            magic_result == 'image/png' ||
                            magic_result == 'image/jpeg')) {
                            join_arr.push("Address Document");
                        // return res.json({ success: false, message: "Address Document type is Invalid." });
                    }
                    if (element.fieldname === "fund_source" &&
                        !(magic_result === 'application/msword' ||
                            magic_result === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                            magic_result == 'image/png' ||
                            magic_result == 'image/jpeg')) {
                            join_arr.push("Fund Source");
                        // return res.json({ success: false, message: "Fund Source type is Invalid." });
                    }
                    if (element.fieldname === "transfer_purpose" &&
                        !(magic_result === 'application/msword' ||
                            magic_result === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                            magic_result == 'image/png' ||
                            magic_result == 'image/jpeg')) {
                            join_arr.push("Transfer Purpose");
                        // return res.json({ success: false, message: "Transfer Purpose type is Invalid." });
                    }
                    next();
                })
            }, (async_cmp) => {
                // ("iterations completed.", join_arr)
                if(join_arr.length){
                    return res.json({ success: false, message: `Uploaded ${join_arr.join(',')} Documents are of invalid type.` });
                }
                return cb(true);
            })
        };

    // uploadKycDetailsFields(req, res, function (error) {
    //     ("error #23499", error, req.file, req.files);
    // });

    let email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            // var kyc_data= req.file
            fs.mkdir("./frontend/public/uploads/" + data[0].id + "/kyc/", function (err) {
                if (error) {
                    return res.json({ success: false, message: "error in folder creation.", error: cm_cfg.errorFn(err) })
                }
                console.log("#error res", err);
                folder = data[0].id;
                let ext_test_arr = [];
                uploadKycDetailsFields(req, res, function (error) {
                    console.log("error #234", error, req.file, req.files);
                    for (let x in req.files) {
                        // ("new for in loop", x);
                        ext_test_arr.push(req.files[x][0]);
                    }
                    // ("ext_test_arr", ext_test_arr);
                    mime_detector(ext_test_arr, (is_true_type) => {
                        if (is_true_type) {
                            if (error) {
                                res.json({ success: false, message: "error in file upload", error: cm_cfg.errorFn(error) })
                            }
                            else if (!Object.keys(req.files).length) {
                                res.json({ success: false, message: "No file found." });
                            }
                            else {
                                let kyc_data = {};
                                if (req.files.kyc_form) {
                                    kyc_data['kyc_form'] = req.files.kyc_form[0].path;
                                }
                                if (req.files.selfie_photo) {
                                    kyc_data['selfie_photo'] = req.files.selfie_photo[0].path;
                                }
                                if (req.files.identity_doc) {
                                    kyc_data['identity_doc'] = req.files.identity_doc[0].path;
                                }
                                if (req.files.address_doc) {
                                    kyc_data['address_doc'] = req.files.address_doc[0].path;
                                }
                                if (req.files.fund_source) {
                                    kyc_data['fund_source'] = req.files.fund_source[0].path;
                                }
                                if (req.files.transfer_purpose) {
                                    kyc_data['transfer_purpose'] = req.files.transfer_purpose[0].path;
                                }

                                /**Check if user is NEW or OLD */
                                var check = mysql.format("SELECT * from customer_kyc where customer_id = ? ", [data[0].id]);
                                connection.query(check, function (err, cst_kyc_data) {
                                    if (err) {
                                        res.json({ success: false, message: 'error in upload', err });
                                        console.log(err)
                                    } else if (cst_kyc_data[0] == null || cst_kyc_data[0] == undefined) {
                                        /**If user is new. */
                                        kyc_data["customer_id"] = data[0].id;
                                        kyc_data["created_at"] = created_at();
                                        kyc_data["status"] = 1;
                                        var new_row = mysql.format("INSERT INTO customer_kyc SET ? ", [kyc_data]);
                                        connection.query(new_row, function (err, kyc_inserted) {
                                            if (err) {
                                                res.json({ success: false, message: 'error in upload', err });
                                            } else {
                                                /**Update customer table for kyc_status. */
                                                update_customer(data[0].id, 1, (is_updated) => {
                                                    if (is_updated) {
                                                        res.json({ success: true, message: 'KYC details upload successfully' });
                                                    } else {
                                                        res.json({ success: false, message: 'Customer could not be updated.' });
                                                    }
                                                })
                                            }
                                        })
                                    } else {
                                        /**
                                         * User is updating remaining two docs or user's KYC was rejected. */
                                        kyc_data["updated_at"] = created_at();
                                        kyc_data["status"] = 1;
                                        var update_kyc = mysql.format("UPDATE customer_kyc SET ? where customer_id = ? ", [kyc_data, data[0].id])
                                        connection.query(update_kyc, function (err, kyc_updated) {
                                            if (err) {
                                                res.json({ success: false, message: 'Error in file update.', err });
                                            }
                                            else {
                                                /**Update customer table for KYC status.*/
                                                if (data[0].kyc_status == 2) {
                                                    return res.json({ success: true, message: 'KYC details upload successfully' });
                                                }
                                                update_customer(data[0].id, 1, (is_updated) => {
                                                    if (is_updated) {
                                                        res.json({ success: true, message: 'KYC details upload successfully' });
                                                    } else {
                                                        res.json({ success: false, message: 'Customer could not be updated.' });
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        } else {
                            res.json({ success: false, message: "Internal server error." });
                        }
                    })
                })
            })
        }
    })
}


exports.getKYCDetails = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    connection.query(sql, function (err, data) {
        if (err) {
            res.json({ success: false, message: "error", err })
            console.log(err);
        }
        else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "user not found" })
        }
        else {
            let sql1 = mysql.format("SELECT * FROM customer_kyc WHERE customer_id =?", [data[0].id]);
            connection.query(sql1, function (error, result) {
                if (error) {
                    res.json({ success: false, message: "error", error })
                } else if (result[0] == null || result[0] == undefined) {
                    res.json({ success: false, message: "document details not found" })
                } else {
                    // obj = { fullname: data[0].fullname, city: data[0].city, country: data[0].country, address: data[0].address, postal_code: data[0].postal_code }
                    res.json({ success: true, message: "Details", data: result, kycStatus: data[0].kyc_status })
                }
            })
        }
    })

}

exports.downloadKyc = function (req, res) {

    filePath = req.body.path;


    var pathcheck = fs.existsSync(filePath)
    if (pathcheck == true) {
        var file_path = path.resolve(filePath);
        res.download(file_path);
    } else {
        res.json({ success: false, message: "Requested file not found" })
    }
} 
