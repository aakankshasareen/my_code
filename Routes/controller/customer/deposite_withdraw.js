var request = require('request')
var connection = require('../../../config/db');
var config = require('../../../config/config');
var nodemailer = require('nodemailer');
var moment = require('moment');
var mail = require('../../../config/email')
var cm_cfg = require('../../../config/common_config');
var emailFn = require('./email');
var mysql = require('mysql');
var socketio = require('../../../socket.js').io();
let transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // secure:true for port 465, secure:false for port 587
    auth: {
        user: config.email,
        pass: config.password
    }
});
var fs = require('file-system');
var multer = require('multer');
var mobileOTP = require('./mobile_otp')
var verifyTwoFA = require('./verify2FA');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/' + req.user_id)
        //"uploads/"+req.user_id+"/"+folder
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
        if (file.mimetype == 'image/png' || file.mimetype == 'image/gif' || file.mimetype == 'application/msword' || file.mimetype == 'image/jpeg' || file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype == 'application/pdf') {
            return cb(null, true);
        } else {
            cb(null, false);
        }
    }
}).single('documents');
// var date = new Date();
// let created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");
// console.log(created_at)
function created_at() {
    var created = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return created;
}


exports.singleWalletInfo = function (req, res) {

    var email = req.decoded.email;
    let sql = mysql.format("SELECT email,id,kyc_status FROM customer WHERE email =?", [email]);
    //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    //console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            var currency_code = req.params.currency_code;

            let sql1 = mysql.format("SELECT * FROM currency_master WHERE currency_code =?", [currency_code]);
            //console.log(sql1)
            connection.query(sql1, function (error, currencydata) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })

                } else if (currencydata[0] == null || currencydata[0] == undefined) {
                    res.json({ success: false, message: "Currency not found" })
                } else {
                    //  console.log(currencydata)
                    let sql2 = mysql.format("SELECT total_amount,currency_code FROM customer_wallet WHERE customer_id =? and currency_code=?", [data[0].id, currency_code]);
                    console.log(sql2)
                    connection.query(sql2, function (error, walletdata) {

                        if (error) {
                            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                        } else {
                            // if (data[0].kyc_status != 2) {
                            //     var dat = walletdata.map(function(changedata) {
                            //         // console.log("datta", changedata)
                            //         return {
                            //             total_amount: '0.00',
                            //             currency_code: changedata.currency_code,
                            //         }
                            //
                            //         //total_amount = changedata.total_amount * 0}
                            //     })
                            //     console.log(dat)
                            //     var infoWallet2 = { total_amount: dat[0].total_amount, currency_code: dat[0].currency_code }
                            //     res.json({ success: true, message: "wallet info", walletinfo: infoWallet2 })
                            //
                            // } else {
                            console.log('walletdata is ... ', walletdata)
                            if (currencydata[0].type == 0) {
                                var dat = walletdata.map(function (changedata) {
                                    // console.log("datta", changedata)
                                    return {
                                        total_amount: changedata.total_amount.toFixed(2),
                                        currency_code: changedata.currency_code,
                                    }

                                    //total_amount = changedata.total_amount * 0}
                                })
                                console.log(dat)
                                var infoWallet2 = { total_amount: dat[0].total_amount, currency_code: dat[0].currency_code }
                                res.json({ success: true, message: "wallet info", walletinfo: infoWallet2 })

                            } else {

                                var infoWallet1 = { total_amount: walletdata[0].total_amount.toFixed(8), currency_code: walletdata[0].currency_code }
                                //  console.log(currencydata)
                                //  console.log(sql2)
                                res.json({ success: true, message: "wallet info", walletinfo: infoWallet1 })
                                //res.json({ success: true, message: "wallet info", walletinfo: infoWallet1 })
                            }
                            // }

                        }
                    })

                }
            })
        }
    })
}


function addNotification(user_id, link, title) {
    var notifyData = {
        "customer_id": user_id,
        "link": link,
        "title": title
    }

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



exports.addmoney = function (req, res) {
console.log("body",req.body)
    // var date = new Date();
    // let created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");
    // console.log(created_at)
    function fee(totalamount) {

        return new Promise(function (resolve, reject) {
            //console.log("fee walletinfo", walletinfo)
            var fee_value = 0;
            var calquantity = 0;
            var walletdedquantity = 0;
            //console.log(walletinfo)
            let sql1 = "Select*from commission where currency_code=" + mysql.escape(req.body.currency_code) + "and operation='Deposit'"
            console.log(sql1)
            connection.query(sql1, function (error, data) {
                if (error) {
                    reject("fee error", error)
                } else if (data[0] == null || data[0] == undefined) {
                    reject("fee data not found")
                } else {
                    // console.log("fee data", data)
                    console.log("min %", data[0].min_percentage)

                    fee_value = (data[0].min_percentage * totalamount) / 100;

                    if (fee_value < data[0].min_amount && data[0].min_amount != 0) {
                        calquantity = parseFloat(totalamount) + parseFloat(data[0].min_amount);
                        resolve({ fee_percentage: 0, fee_value: data[0].min_amount, calquantity: calquantity })

                    } else {
                        calquantity = parseFloat(totalamount) + fee_value;
                        resolve({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity })
                    }
                }
            })

        })
    }

    function deposit(custId, userId, feedata, walletbal) {

        return new Promise(function (resolve, reject) {

            connection.beginTransaction(function (err) {
                if (err) {
                    throw err;
                }
                // console.log("fefe", feedata)
                // console.log(custId)
                console.log(created_at())
                if (typeof (req.body.mode) == 'undefined') {
                    req.body.mode = '1';
                }
                var depositeData = {
                    "customer_id": custId,
                    "amount": req.body.amount,
                    "currency_code": req.body.currency_code,
                    "created_at": created_at(),
                    "status": 0,
                    "platform_fee": feedata.fee_percentage,
                    "platform_value": feedata.fee_value,
                    "reference_no": req.body.reference_no,
                    "deposit_date": req.body.deposit_date,
                    "mode": req.body.mode,
                }
                console.log(depositeData)
                let sql1 = mysql.format("INSERT INTO customer_deposite SET ?", depositeData)

                connection.query(sql1, function (error, ress) {

                    if (error) {
                        return connection.rollback(function () {
                            throw error;
                            reject(error)

                        });
                    }

                    var logData = {
                        "user_id": userId,
                        "activity_description": "" + req.body.amount + " " + req.body.currency_code + "request send to the admin",
                        "activity_type": '041',
                        "device_ipAddress": req.body.device_ipAddress,
                        "device_os": req.body.device_os,
                        "device_name": req.body.device_name,
                        "device_browser": req.body.device_browser,
                        "created_at": created_at(),
                        "created_by": userId,
                        "updated_by": userId
                    }

                    let sql3 = mysql.format("INSERT INTO log SET ?", logData)
                    connection.query(sql3, function (error, results) {
                        if (error) {
                            return connection.rollback(function () {
                                throw error;
                                reject(error)

                            });
                        }
                        // var bal = parseFloat(walletbal) + parseFloat(req.body.amount)
                        // //  console.log("mjmjm", walletbal)

                        // var updateData = { "total_amount": bal }

                        // let sql5 = mysql.format('UPDATE customer_wallet SET ? WHERE customer_id=? AND currency_code=?', [updateData, custId, req.body.currency_code])
                        // // console.log(sql5)
                        // connection.query(sql5, function(error, results) {
                        //     if (error) {
                        //         return connection.rollback(function() {
                        //             throw error;
                        //             reject(error)

                        //         });
                        //     }

                        connection.commit(function (err) {
                            if (err) {
                                //console.log("error in commit")
                                return connection.rollback(function () {
                                    throw err;
                                });
                            }

                            addNotification(custId, '/admin/edit-deposit-request/' + ress.insertId, 'New Deposit Request');
                            resolve("Money deposit to the wallet")
                        })
                    })
                })
            })
        })
        //})
    }


    var currency_code = req.body.currency_code;
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);


    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {


            let sql1 = mysql.format("SELECT * FROM currency_master WHERE currency_code =? AND type=0", [currency_code]);
            // console.log(sql1)
            connection.query(sql1, function (error, currencydata) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })

                } else if (currencydata[0] == null || currencydata[0] == undefined) {

                    res.json({ success: false, message: "Currency not found" })
                } else {
                    if (currencydata[0].status == 1) {
                      

                        let withdrawlimit_sql = mysql.format("SELECT * FROM trade_limit WHERE currency_code =? and operation='Deposit'", [currency_code]);
                        // console.log("sql", withdrawlimit_sql);
                        connection.query(withdrawlimit_sql, function(error, wlimitdata) {
                            if (error) {
                                res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                            } else if (wlimitdata[0] == null || wlimitdata[0] == undefined) {
                                res.json({ success: false, message: "Limit data not found" })
                            } else {
                                if (wlimitdata[0].min_amount <= req.body.amount && wlimitdata[0].max_amount >= req.body.amount) {

                        let wallet_sql = mysql.format("SELECT* FROM customer_wallet where customer_id= ? AND currency_code=?", [data[0].id, currency_code]);
                        //  console.log("sql", wallet_sql);
                        connection.query(wallet_sql, function (error, walletdata) {
                            if (error) {
                                res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) });
                            } else {

                                let sqlSelectRefNo = mysql.format("select id from customer_deposite where reference_no=?", [req.body.reference_no]);

                                connection.query(sqlSelectRefNo, function (errSR, resSR) {
                                    if (errSR) {
                                        //console.log(errSR);
                                        res.json({ success: false, message: "Something went wrong", error: cm_cfg.errorFn(errSR) }) //
                                    } else if (resSR.length > 0) {
                                        res.json({ success: false, message: "Reference no must be unique" })
                                    } else {

                                        fee(req.body.amount).then(function (feedata) {

                                            //  console.log("fd", feedata)

                                            //payment gate way code
                                            var payresult = true;
                                            if (payresult == true) {


                                                return deposit(data[0].id, data[0].created_by, feedata, walletdata[0].total_amount)
                                            } else {
                                                res.json({ success: false, message: "Payment cannot completed" })
                                            }
                                        }, function (err) {

                                            //   console.log(err)
                                            res.json({ success: false, message: "error", error: cm_cfg.errorFn(err) });
                                        }).then(function (order) {
                                            var defaultMsg = "Hello,<br> You have requested to deposite" + req.body.amount + " " + req.body.currency_code + " to the wallet.<br>";
                                            emailFn.sendEmail('dW125', data[0].fullname, data[0].email, undefined, req.body.amount, req.body.currency_code, undefined, defaultMsg).then(function (res1) {
                                                res.json({ success: true, message: order })
                                            }).catch(function (err1) {
                                                res.json({ success: false, message: "Error in mail sending" })
                                            })
                                        }, function (error) {
                                            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) });
                                        })
                                    }
                                })
                            }
                        })
                    
                        }
                        else {
                            res.json({ success: false, message: "Enter amount not match the deposit amount limit" })
                        }
                        }

                         })
                    } else {
                        res.json({ success: false, message: "Currency is  not active" })
                    }
                }

            })
        }
    })
}




exports.withdrawMoneyRequest = function (req, res) {
    var name = '';
    var bankInfo = {};
    // bank_name : bank_name,
    // account_no : account_no,
    // ifsc_code : ifsc_code,
    var email = req.decoded.email;
    var amount = req.body.amount;
    console.log('req.body is a', req.body)
    let verificationPromise

    {
        var dataarray = [];
        function withdraw(custId, feedata, walletbal, currency_type, userId) {

            return new Promise(function (resolve, reject) {

                connection.beginTransaction(function (err) {
                    if (err) {
                        throw err;
                    }
                    // console.log(feedata)
                    // console.log(custId)

                    var depositeData = {
                        "customer_id": custId,
                        "amount": feedata.calamount,
                        "currency_code": req.body.currency_code,
                        "created_at": created_at(),
                        "type": currency_type,
                        "receiverAddress": req.body.receiverAddress,
                        "status": 0,
                        "platform_fee": feedata.fee_percentage,
                        "platform_value": feedata.fee_value
                    }

                    let sql1 = mysql.format("INSERT INTO customer_withdraw SET ?", [depositeData])

                    //let sql1 = "INSERT INTO customer_withdraw (customer_id,amount,currency_code,created_at,type,receiverAddress,platform_fee,platform_value) values(" + custId + ",'" + feedata.calamount + "','" + req.body.currency_code + "','" + created_at + "','"+currency_type+"','"+req.body.address+"','" + feedata.fee_percentage + "','" + feedata.fee_value + "');"

                    // console.log(sql1)
                    connection.query(sql1, function (error, response) {
                        if (error) {
                            return connection.rollback(function () {
                                throw error;
                                reject(error)

                            });
                        }

                        var logData = {
                            "user_id": userId,
                            "activity_description": "" + feedata.calamount + " " + req.body.currency_code + " withdrawn request from the wallet",
                            "activity_type": '051',
                            "device_ipAddress": req.body.device_ipAddress,
                            "device_os": req.body.device_os,
                            "device_name": req.body.device_name,
                            "device_browser": req.body.device_browser,
                            "created_at": created_at(),
                            "created_by": userId,
                            "updated_by": userId
                        }


                        let sql2 = mysql.format("INSERT INTO log SET ?", [logData])

                        //let sql2 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) SELECT id,' money withdrawn request from the wallet','051','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at + "',id,id FROM user WHERE type_id='" + custId + "';"

                        // console.log(sql2)
                        connection.query(sql2, function (error, final) {
                            if (error) {
                                return connection.rollback(function () {
                                    throw error;
                                    reject(error)

                                });
                            }
                            var bal = walletbal - feedata.walletdedamount
                            // console.log(walletbal)

                            var updateData = { "total_amount": bal }

                            let sql5 = mysql.format("UPDATE customer_wallet SET ? WHERE customer_id=? AND currency_code=?", [updateData, custId, req.body.currency_code]);
                            //  console.log(sql5)
                            connection.query(sql5, function (error, final) {
                                if (error) {
                                    return connection.rollback(function () {
                                        throw error;
                                        reject(error)

                                    });
                                }
                                connection.commit(function (err) {
                                    if (err) {
                                        console.log("error in commit")
                                        return connection.rollback(function () {
                                            throw err;
                                        });
                                    }

                                    addNotification(custId, '/admin/edit-withdraw-request/' + response.insertId, 'New Withdrawal Request');
                                    // console.log(data[0]);
                                    resolve("Your withdraw request has been placed successfully")
                                })
                            })
                        })
                    })
                })
            })
        }

        function fee(walletinfo) {

            return new Promise(function (resolve, reject) {
                // console.log("fee walletinfo", walletinfo)
                var fee_value = 0;
                var calquantity = 0;
                var walletdedquantity = 0;
                console.log(walletinfo)
                let sql1 = "Select*from commission where currency_code=" + mysql.escape(req.body.currency_code) + "and operation='Withdraw';"
                console.log(sql1)
                connection.query(sql1, function (error, data) {
                    if (error) {
                        reject("fee error", error)
                    } else if (data[0] == null || data[0] == undefined) {
                        reject("fee data not found")
                    } else {
                        // console.log("fee data", data)
                        if (walletinfo == req.body.amount) {
                            console.log("min %", data[0].min_percentage)

                            fee_value = (data[0].min_percentage * req.body.amount) / 100;

                            if (fee_value < data[0].min_amount && data[0].min_amount != 0) {

                                calamount = parseFloat(req.body.amount) - parseFloat(data[0].min_amount);
                                walletdedamount = req.body.amount;

                                if (walletdedamount <= walletinfo && calamount > 0) {
                                    //feecalarr.push({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })
                                    // return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                    resolve({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })
                                } else {
                                    reject("You have less money in your wallet included fee")
                                }

                            } else {

                                calamount = parseFloat(req.body.amount) - fee_value;
                                walletdedamount = req.body.amount;

                                if (walletdedamount <= walletinfo && calamount > 0) {

                                    //feecalarr.push({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })

                                    //return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                    resolve({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })
                                } else {
                                    reject("You have less money in your wallet included fee")
                                }
                            }

                        } else if (walletinfo > req.body.amount) {
                            console.log("wallet is greater than amount")

                            fee_value = (data[0].min_percentage * req.body.amount) / 100;
                            console.log("fee", fee_value)

                            if (fee_value < data[0].min_amount && data[0].min_amount != 0) {

                                calamount = req.body.amount;
                                console.log(calamount)
                                walletdedamount = parseFloat(req.body.amount) + parseFloat(data[0].min_amount);
                                console.log(walletdedamount)

                                if (walletdedamount <= walletinfo && calamount > 0) {


                                    // feecalarr.push({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })

                                    //return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                    resolve({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })
                                } else {
                                    reject("You have less money in your wallet included fee")
                                }
                            } else {

                                calamount = req.body.amount;
                                console.log("cal", calamount)
                                walletdedamount = parseFloat(req.body.amount) + fee_value;
                                console.log("wal", walletdedamount)

                                if (walletdedamount <= walletinfo && calamount > 0) {
                                    //feecalarr.push({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })
                                    // return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                    resolve({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })
                                } else {
                                    reject("You have less money in your wallet included fee")
                                }
                            }

                        } else {
                            console.log("You have less money in your wallet") //so use this code for else part "you have less money included fee"

                            fee_value = (data[0].min_percentage * walletinfo) / 100;

                            if (fee_value < data[0].min_amount && data[0].min_amount != 0) {

                                calamount = parseFloat(walletinfo) - parseFloat(data[0].min_amount);
                                walletdedamount = walletinfo;

                                if (walletdedamount <= walletinfo && calamount > 0) {
                                    //feecalarr.push({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })
                                    // return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                    resolve({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })
                                } else {
                                    reject("You have less money in your wallet included fee")
                                }

                            } else {

                                calamount = parseFloat(walletinfo) - fee_value;
                                walletdedamount = walletinfo;

                                if (walletdedamount <= walletinfo && calamount > 0) {

                                    //feecalarr.push({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })
                                    //return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                    resolve({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })
                                } else {
                                    reject("You have less money in your wallet included fee")
                                }
                            }
                        }


                    }
                })

            })
        }

        var currency_code = req.body.currency_code;
        var email = req.decoded.email;
        let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
        //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
        connection.query(sql, function (error, data) {

            if (error) {
                res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
            } else if (data[0] == null || data[0] == undefined) {
                res.json({ success: false, message: "User not found" })
            } else {
                name = data[0].fullname;
                // bank_name : bank_name,
                // account_no : account_no,
                // ifsc_code : ifsc_code,
                if (data[0].kyc_status == 0) {
                    res.json({ success: false, message: "Please complete your KYC" })
                } else if (data[0].kyc_status == 1) {
                    res.json({ success: false, message: "No Withdrawal Allowed Until Your KYC Has Been Approved by Admin. 在您的KYC获得Admin批准之前，系统不会允许您交易或取款。" })
                } else if (data[0].kyc_status == 3) {
                    res.json({ success: false, message: "Your KYC is rejected by admin" })
                } else {
                    //  console.log(data)

                    let currency_sql = mysql.format("SELECT * FROM currency_master WHERE currency_code =?", [currency_code]);
                    connection.query(currency_sql, function (error, currencydata) {
                        if (error) {
                            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                        } else if (currencydata[0] == null || currencydata[0] == undefined) {
                            res.json({ success: false, message: "Currency not found" })
                        } else {
                            if (currencydata[0].status == 1) {


                                let bank_details = mysql.format("SELECT bd.* FROM bank_details as bd join user as us on us.id = bd.user_id where us.type_id=?", [data[0].id]);
                                console.log("bank_details", bank_details);
                                connection.query(bank_details, function (error, bankData) {
                                    if (error) {
                                        res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) });
                                    } else {
                                        if ((bankData[0] == null || bankData[0] == undefined)) {
                                            res.json({ success: false, message: "Please complete your bank details" });
                                        } else {
                                            bankInfo = bankData[0];

                                            let withdrawlimit_sql = mysql.format("SELECT *, (SELECT IFNULL(SUM(amount), 0) from customer_withdraw WHERE created_at>= NOW() - INTERVAL 1 DAY AND customer_id = ? AND currency_code = ? GROUP BY currency_code) as day_total_withdraw FROM trade_limit WHERE currency_code = ? and operation='Withdraw'", [data[0].id, currency_code, currency_code]);
                                            connection.query(withdrawlimit_sql, function (error, wlimitdata) {
                                                console.log("checking output", wlimitdata, (wlimitdata[0].day_total_withdraw + Number(req.body.amount)), wlimitdata[0].daily_max_amount);
                                                if (error) {
                                                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                                                } else if (wlimitdata[0] == null || wlimitdata[0] == undefined) {
                                                    res.json({ success: false, message: "Limit data not found" })
                                                } else {
                                                    
                                                    if (wlimitdata[0].min_amount <= req.body.amount && wlimitdata[0].max_amount >= req.body.amount && wlimitdata[0].daily_max_amount >=req.body.amount) {
                                                        if(wlimitdata[0].day_total_withdraw<=wlimitdata[0].daily_max_amount)
                                                        {
                                                        let wallet_sql = mysql.format("SELECT* FROM customer_wallet where customer_id=? AND currency_code=?", [data[0].id, currency_code])
                                                        //console.log("sql", sql2);
                                                        connection.query(wallet_sql, function (error, walletdata) {
                                                            if (error) {
                                                                res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) });
                                                            } else {
                                                                if (walletdata[0].total_amount == 0 || walletdata[0].total_amount == undefined) {
                                                                    res.json({ success: false, message: "Please add money to the wallet first" });
                                                                } else {
                                                                    if(walletdata[0].total_amount>=req.body.amount)
                                                                    {

                                                                    fee(walletdata[0].total_amount).then(function (feedata) {
                                                                        //  console.log("feedata", feedata)
                                                                        dataarray.push(feedata)
                                                                        return withdraw(data[0].id, feedata, walletdata[0].total_amount, currencydata[0].type, data[0].created_by)
                                                                    }, function (error) {
                                                                        res.json({ success: false, message: error });
                                                                    }).then(function (order) {


                                                                        var defaultMsg = "Your withdrawal request has been accepted <br> amount is " + dataarray[0].calamount + ' ' + req.body.currency_code + " and commission is " + dataarray[0].fee_value;
                                                                        emailFn.sendEmail('WR125', '', req.decoded.email, undefined, dataarray[0].calamount, req.body.currency_code, dataarray[0].fee_value, defaultMsg).then(function (res1) {
                                                                            res.json({ success: true, message: order })
                                                                        }).catch(function (err1) {
                                                                            res.json({ success: false, message: "Error in mail sending" })
                                                                        })
                                                                    }, function (error) {
                                                                        // console.log(error)
                                                                        res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) });
                                                                    })
                                                                    

                                                                    }
                                                                    else
                                                                    {
                                                                        res.json({ success: false, message: "Less money in wallet" });
                                                                        return null;
                                                                    }

                                                                }

                                                            }


                                                        });
                                                    } else {
                                                        res.json({ success: false, message: "Daily Limit Exceeds" })
                                                    }

                                                    } else {
                                                        res.json({ success: false, message: "Enter amount not match the withdrawal amount limit" })
                                                    }
                                                }
                                            })
                                        }
                                    }
                                })
                            } else {
                                res.json({ success: false, message: "Currency is  not active" })
                            }

                        }
                    })
                }
            }
        })

    }
    //  }).catch((err) => {
    //      res.json({ success: false, message: 'Error', error: cm_cfg.errorFn(err) })
    //  })

}


// exports.testwithdrawMoneyRequest = function(req, res) {
//     var dataarray = [];


//     function withdraw(custId, feedata, walletbal, currency_type, userId) {

//         return new Promise(function(resolve, reject) {

//             connection.beginTransaction(function(err) {
//                 if (err) {
//                     throw err;
//                 }
//                 console.log(feedata)
//                 console.log(custId)

//                 var depositeData = {
//                     "customer_id": custId,
//                     "amount": feedata.calamount,
//                     "currency_code": req.body.currency_code,
//                     "created_at": created_at(),
//                     "type": currency_type,
//                     "receiverAddress": req.body.receiverAddress,
//                     "status": 0,
//                     "platform_fee": feedata.fee_percentage,
//                     "platform_value": feedata.fee_value
//                 }

//                 let sql1 = mysql.format("INSERT INTO customer_withdraw SET ?", depositeData)

//                 //let sql1 = "INSERT INTO customer_withdraw (customer_id,amount,currency_code,created_at,type,receiverAddress,platform_fee,platform_value) values(" + custId + ",'" + feedata.calamount + "','" + req.body.currency_code + "','" + created_at + "','"+currency_type+"','"+req.body.address+"','" + feedata.fee_percentage + "','" + feedata.fee_value + "');"

//                 // console.log(sql1)
//                 connection.query(sql1, function(error, response) {
//                     if (error) {
//                         return connection.rollback(function() {
//                             throw error;
//                             reject(error)

//                         });
//                     }

//                     var logData = {
//                         "user_id": userId,
//                         "activity_description": "" + feedata.calamount + " " + req.body.currency_code + " withdrawn request from the wallet",
//                         "activity_type": '051',
//                         "device_ipAddress": req.body.device_ipAddress,
//                         "device_os": req.body.device_os,
//                         "device_name": req.body.device_name,
//                         "device_browser": req.body.device_browser,
//                         "created_at": created_at(),
//                         "created_by": userId,
//                         "updated_by": userId
//                     }


//                     let sql2 = mysql.format("INSERT INTO log SET ?", logData)

//                     //let sql2 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) SELECT id,' money withdrawn request from the wallet','051','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at + "',id,id FROM user WHERE type_id='" + custId + "';"

//                     // console.log(sql2)
//                     connection.query(sql2, function(error, final) {
//                         if (error) {
//                             return connection.rollback(function() {
//                                 throw error;
//                                 reject(error)

//                             });
//                         }
//                         var bal = walletbal - feedata.walletdedamount
//                         // console.log(walletbal)

//                         var updateData = { "total_amount": bal }

//                         let sql5 = mysql.format("UPDATE customer_wallet SET ? WHERE customer_id=? AND currency_code=?", [updateData, custId, req.body.currency_code]);
//                         //  console.log(sql5)
//                         connection.query(sql5, function(error, final) {
//                             if (error) {
//                                 return connection.rollback(function() {
//                                     throw error;
//                                     reject(error)

//                                 });
//                             }
//                             connection.commit(function(err) {
//                                 if (err) {
//                                     console.log("error in commit")
//                                     return connection.rollback(function() {
//                                         throw err;
//                                     });
//                                 }


//                                 resolve("Your withdraw request has been placed successfully")
//                             })
//                         })
//                     })
//                 })
//             })
//         })
//     }

//     function fee(walletinfo) {

//         return new Promise(function(resolve, reject) {
//             console.log("fee walletinfo", walletinfo)
//             var fee_value = 0;
//             var calquantity = 0;
//             var walletdedquantity = 0;
//             console.log(walletinfo)
//             let sql1 = "Select*from commission where currency_code='" + req.body.currency_code + "'and operation='Withdraw';"
//             console.log(sql1)
//             connection.query(sql1, function(error, data) {
//                 if (error) {
//                     reject("fee error", error)
//                 } else if (data[0] == null || data[0] == undefined) {
//                     reject("fee data not found")
//                 } else {
//                     // console.log("fee data", data)
//                     if (walletinfo == req.body.amount) {
//                         console.log("min %", data[0].min_percentage)

//                         fee_value = (data[0].min_percentage * req.body.amount) / 100;

//                         if (fee_value < data[0].min_amount && data[0].min_amount != 0) {

//                             calamount = parseFloat(req.body.amount) - parseFloat(data[0].min_amount);
//                             walletdedamount = req.body.amount;

//                             if (walletdedamount <= walletinfo && calamount > 0) {
//                                 //feecalarr.push({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })
//                                 // return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

//                                 resolve({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })
//                             } else {
//                                 reject("You have less money in your wallet included fee")
//                             }

//                         } else {

//                             calamount = parseFloat(req.body.amount) - fee_value;
//                             walletdedamount = req.body.amount;

//                             if (walletdedamount <= walletinfo && calamount > 0) {

//                                 //feecalarr.push({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })

//                                 //return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

//                                 resolve({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })
//                             } else {
//                                 reject("You have less money in your wallet included fee")
//                             }
//                         }

//                     } else if (walletinfo > req.body.amount) {
//                         console.log("wallet is greater than amount")

//                         fee_value = (data[0].min_percentage * req.body.amount) / 100;
//                         console.log("fee", fee_value)

//                         if (fee_value < data[0].min_amount && data[0].min_amount != 0) {

//                             calamount = req.body.amount;
//                             console.log(calamount)
//                             walletdedamount = parseFloat(req.body.amount) + parseFloat(data[0].min_amount);
//                             console.log(walletdedamount)

//                             if (walletdedamount <= walletinfo && calamount > 0) {


//                                 // feecalarr.push({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })

//                                 //return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

//                                 resolve({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })
//                             } else {
//                                 reject("You have less money in your wallet included fee")
//                             }
//                         } else {

//                             calamount = req.body.amount;
//                             console.log("cal", calamount)
//                             walletdedamount = parseFloat(req.body.amount) + fee_value;
//                             console.log("wal", walletdedamount)

//                             if (walletdedamount <= walletinfo && calamount > 0) {
//                                 //feecalarr.push({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })
//                                 // return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

//                                 resolve({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })
//                             } else {
//                                 reject("You have less money in your wallet included fee")
//                             }
//                         }

//                     } else {
//                         console.log("You have less money in your wallet") //so use this code for else part "you have less money included fee"

//                         fee_value = (data[0].min_percentage * walletinfo) / 100;

//                         if (fee_value < data[0].min_amount && data[0].min_amount != 0) {

//                             calamount = parseFloat(walletinfo) - parseFloat(data[0].min_amount);
//                             walletdedamount = walletinfo;

//                             if (walletdedamount <= walletinfo && calamount > 0) {
//                                 //feecalarr.push({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })
//                                 // return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

//                                 resolve({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })
//                             } else {
//                                 reject("You have less money in your wallet included fee")
//                             }

//                         } else {

//                             calamount = parseFloat(walletinfo) - fee_value;
//                             walletdedamount = walletinfo;

//                             if (walletdedamount <= walletinfo && calamount > 0) {

//                                 //feecalarr.push({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })
//                                 //return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

//                                 resolve({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })
//                             } else {
//                                 reject("You have less money in your wallet included fee")
//                             }
//                         }
//                     }


//                 }
//             })

//         })
//     }

//     var currency_code = req.body.currency_code;
//     var email = req.decoded.email;
//     let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
//     //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
//     connection.query(sql, function(error, data) {
//         if (error) {
//             res.json({ success: false, message: "error", error })
//         } else if (data[0] == null || data[0] == undefined) {
//             res.json({ success: false, message: "User not found" })
//         } else {
//             //  console.log(data)

//             let currency_sql = mysql.format("SELECT * FROM currency_master WHERE currency_code =?", [currency_code]);
//             connection.query(currency_sql, function(error, currencydata) {
//                 if (error) {
//                     res.json({ success: false, message: "error", error: error })
//                 } else if (currencydata[0] == null || currencydata[0] == undefined) {
//                     res.json({ success: false, message: "Currency not found" })
//                 } else {
//                     if (currencydata[0].status == 1) {

//                         let withdrawlimit_sql = mysql.format("SELECT * FROM trade_limit WHERE currency_code = ? and operation='Withdraw'", [currency_code]);
//                         connection.query(withdrawlimit_sql, function(error, wlimitdata) {
//                             if (error) {
//                                 res.json({ success: false, message: "error", error: error })
//                             } else if (wlimitdata[0] == null || wlimitdata[0] == undefined) {
//                                 res.json({ success: false, message: "Limit data not found" })
//                             } else {
//                                 if (wlimitdata[0].min_amount <= req.body.amount && wlimitdata[0].max_amount >= req.body.amount) {

//                                     let wallet_sql = mysql.format("SELECT* FROM customer_wallet where customer_id=? AND currency_code=?", [data[0].id, currency_code])
//                                     //console.log("sql", sql2);
//                                     connection.query(wallet_sql, function(error, walletdata) {
//                                         if (error) {
//                                             res.json({ success: false, message: "error", error: error });
//                                         } else {
//                                             if (walletdata[0].total_amount == 0 || walletdata[0].total_amount == undefined) {
//                                                 res.json({ success: false, message: "Please add money to the wallet first" });
//                                             } else {
//                                                 fee(walletdata[0].total_amount).then(function(feedata) {
//                                                     //  console.log("feedata", feedata)
//                                                     dataarray.push(feedata)
//                                                     return withdraw(data[0].id, feedata, walletdata[0].total_amount, currencydata[0].type, data[0].created_by)
//                                                 }, function(error) {
//                                                     // console.log("fee", error)
//                                                     res.json({ success: false, message: error });
//                                                 }).then(function(order) {
//                                                     // console.log("cha", dataarray)
//                                                     let data=[{ amount: req.body.amount}, {commission: dataarray[0].fee_value}, {total: dataarray[0].calamount}, {currency_code: currency_code }]
//                                                     //mail.mail(req.body.amount,dataarray[0].fee_value,dataarray[0].calamount,req.decoded.email,'withdrawal request accepted')
//                                                     //mail.mail(html, req.decoded.email, 'Withdrawal Request Accepted')


//                                                    // let data = [{ "{message}": req.body.comment }, { "{name}": "test" }];
//                                                    // let userEmail = userdata[0].email != undefined || userdata[0].email != null ? userdata[0].email : "";
//                                                     email_helper.mail_template("with12", "payal.singhal@sofocle.com," + req.decoded.email + "", data, req, res)
//                                                     //res.json({ "success": true, "message": "Support comment added Successfully", result });

//                                                     //console.log(order)
//                                                     res.json({ success: true, message: order })
//                                                     //})
//                                                 }, function(error) {
//                                                     // console.log(error)
//                                                     res.json({ success: false, message: "error", error: error });
//                                                 })
//                                             }
//                                         }


//                                     });
//                                 } else {
//                                     res.json({ success: false, message: "Enter amount not match the withdrawal amount limit" })
//                                 }
//                             }
//                         })
//                     } else {
//                         res.json({ success: false, message: "Currency is  not active" })
//                     }

//                 }
//             })
//         }
//     })
// }





exports.fiatDepositeHistory = function (req, res) {


    var currency_code = req.body.currency_code;
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);

    //console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {


            let sql1 = mysql.format("SELECT * FROM currency_master WHERE currency_code =?", [currency_code]);
            //console.log(sql1)
            connection.query(sql1, function (error, currencydata) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })

                } else if (currencydata[0] == null || currencydata[0] == undefined) {

                    res.json({ success: false, message: "Currency not found" })
                } else {

                    if (currencydata[0].status == 1 && currencydata[0].type == 0) {

                        // console.log(currencydata)

                        var limit = req.body.limit;
                        var offset = (req.body.offset == 'null' ? 0 : req.body.offset);
                        // console.log("os", offset)

                        let count_sql = mysql.format("SELECT COUNT( * ) as total FROM customer_deposite WHERE customer_id =? and currency_code=? ", [data[0].id, currency_code]);
                        // console.log(tranmastercount_sql)
                        connection.query(count_sql, function (error, countdata) {
                            if (error) {
                                res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                            } else {

                                let sql2 = mysql.format("SELECT currency_code,FORMAT(amount,2) as amount,FORMAT(platform_value,2) as platform_value,status,created_at,comment FROM customer_deposite WHERE customer_id =? and currency_code=?  order by created_at desc LIMIT " + limit + " OFFSET " + offset + "", [data[0].id, currency_code]);
                                //  console.log(sql2)
                                connection.query(sql2, function (error, deposite) {
                                    if (error) {
                                        console.log(error)
                                        res.json({ success: false, message: "error" })
                                    } else {

                                        res.json({ success: true, message: "Fiat deposite transaction  info", data: deposite, totalcount: countdata[0].total })
                                    }
                                })

                            }
                        })
                    } else {
                        res.json({ success: false, message: "Transaction not found" })
                    }

                }
            })
        }
    })
}

exports.withdrawHistory = function (req, res) {

    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);

    // console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            var currency_code = req.body.currency_code;

            let sql1 = mysql.format("SELECT * FROM currency_master WHERE currency_code =?", [currency_code]);
            // console.log(sql1)
            connection.query(sql1, function (error, currencydata) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })

                } else if (currencydata[0] == null || currencydata[0] == undefined) {

                    res.json({ success: false, message: "Currency not found" })
                } else {

                    if (currencydata[0].status == 1 && currencydata[0].type == 0) {

                        //  console.log(currencydata)

                        var limit = req.body.limit;
                        var offset = (req.body.offset == 'null' ? 0 : req.body.offset);
                        //  console.log("os", offset)

                        let count_sql = mysql.format("SELECT COUNT( * ) as total FROM customer_withdraw WHERE customer_id =? and currency_code=? ", [data[0].id, currency_code]);
                        // console.log(tranmastercount_sql)
                        connection.query(count_sql, function (error, countdata) {
                            if (error) {
                                res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                            } else {


                                let sql2 = mysql.format("SELECT currency_code,FORMAT(amount,2) as amount,FORMAT(platform_value,2) as platform_value,status,created_at,comment FROM customer_withdraw WHERE customer_id =? and currency_code=?  order by created_at desc LIMIT " + limit + " OFFSET " + offset + "", [data[0].id, currency_code]);
                                //   console.log(sql2)
                                connection.query(sql2, function (error, deposite) {
                                    if (error) {
                                        res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                                    } else {

                                        res.json({ success: true, message: "Fiat withdraw transaction  info", data: deposite, totalcount: countdata[0].total })
                                    }
                                })
                            }
                        })

                    } else if (currencydata[0].status == 1 && currencydata[0].type == 1) {

                        // console.log(currencydata)

                        var limit = req.body.limit;
                        var offset = (req.body.offset == 'null' ? 0 : req.body.offset);
                        //  console.log("os", offset)
                        let count_sql = mysql.format("SELECT COUNT( * ) as total FROM customer_withdraw WHERE customer_id =? and currency_code=? ", [data[0].id, currency_code]);
                        // console.log(tranmastercount_sql)
                        connection.query(count_sql, function (error, countdata) {
                            if (error) {
                                res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                            } else {

                                let sql2 = mysql.format("SELECT currency_code,FORMAT(amount,2) as amount,FORMAT(platform_value,2) as platform_value,status,created_at,comment,receiverAddress FROM customer_withdraw WHERE customer_id =? and currency_code=?  order by created_at desc LIMIT " + limit + " OFFSET " + offset + "", [data[0].id, currency_code]);
                                //  console.log(sql2)
                                connection.query(sql2, function (error, deposite) {
                                    if (error) {
                                        res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                                    } else {

                                        res.json({ success: true, message: "Fiat withdraw transaction  info", data: deposite, totalcount: countdata[0].total })
                                    }
                                })
                            }
                        })

                    } else {
                        res.json({ success: false, message: "Transaction not found" })
                    }

                }
            })
        }
    })
}



exports.getDepositWithdrawHistoryInr = function (req, res) {

    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);

    // console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {

            var limit = req.body.limit;
            var offset = (req.body.offset == 'null' ? 0 : req.body.offset);

            let amount = req.body.amount
            let fee = req.body.platform_value
            let type = req.body.type
            let status = req.body.status

            let orderColumn = req.body.order_column
            let orderDirection = req.body.order_direction
            let orderBy = '';
            let searchQuery = '';

            if(Number(amount)){
                searchQuery += `AND amount = ${amount}`
              }
 
              if(Number(fee)){
                searchQuery += `AND platform_value = ${fee}`
              }

              if(status){
                searchQuery += `AND status = ${mysql.escape(status) == 'NULL'?null:mysql.escape(status)}`
              }
 
              if(type){
                searchQuery += `HAVING type =  ${mysql.escape(type) == 'NULL'?null:mysql.escape(type)}`
              }

            if(['created_at', 'amount', 'platform_value'].includes(orderColumn)
            && ['asc', 'desc'].includes(orderDirection)){
            orderBy += ` ORDER BY ${orderColumn} ${orderDirection} `
        }
        else
            orderBy += ` ORDER BY created_at DESC `
            //  console.log("os", offset)
            // let count_sql = mysql.format(`SELECT * FROM (SELECT currency_code,FORMAT(amount,2) as amount,FORMAT(platform_value,2) as platform_value,status,created_at,CONCAT('Deposit') as type,comment FROM customer_deposite WHERE customer_id =? AND currency_code ='INR' ${searchQuery} ) AS a UNION ALL SELECT * FROM (SELECT currency_code,FORMAT(amount,2) as amount,FORMAT(platform_value,2) as platform_value,status,created_at,CONCAT('Withdraw') as type,comment FROM customer_withdraw WHERE customer_id =? AND type = 0  ${searchQuery} ) AS b`, [data[0].id, data[0].id]);

            let count_sql = mysql.format("SELECT *FROM(SELECT currency_code,FORMAT(amount,2) as amount,FORMAT(platform_value,2) as platform_value,status,created_at,CONCAT('Deposit') as type,comment FROM customer_deposite WHERE customer_id =? AND currency_code IN (SELECT currency_code FROM currency_master where type=0) " + searchQuery + " ) AS a UNION ALL SELECT * FROM (SELECT currency_code,FORMAT(amount,2) as amount,FORMAT(platform_value,2) as platform_value,status,created_at,CONCAT('Withdraw') as type,comment FROM customer_withdraw WHERE customer_id =? AND type = 0 " + searchQuery + " ) AS b", [data[0].id, data[0].id]);

            connection.query(count_sql, function (error, countdata) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {

                    let sql2 = mysql.format("SELECT *FROM(SELECT currency_code, amount, platform_value,status,created_at,CONCAT('Deposit') as type,comment FROM customer_deposite WHERE customer_id =? AND currency_code IN (SELECT currency_code FROM currency_master where type=0) " + searchQuery + " ) AS a UNION ALL SELECT * FROM (SELECT currency_code, amount, platform_value,status,created_at,CONCAT('Withdraw') as type,comment FROM customer_withdraw WHERE customer_id =? AND type =0 " + searchQuery + " ) AS b" + orderBy + " LIMIT " + limit + " OFFSET " + offset + "", [data[0].id, data[0].id]);
                    //let sql2 = mysql.format("SELECT currency_code,FORMAT(amount,2) as amount,FORMAT(platform_value,2) as platform_value,status,created_at,comment FROM customer_withdraw WHERE customer_id =?  order by created_at desc LIMIT " + limit + " OFFSET " + offset + "", [data[0].id]);

                    connection.query(sql2, function (error, deposite) {
                        if (error) {
                            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                        } else {

                            var count = countdata.length
                            res.json({ success: true, message: "Deposit Withdraw transaction  info", data: deposite, totalcount: count })
                        }
                    })
                }
            })
        }
    })
}


exports.getDepositWithdrawHistoryCrypto = function (req, res) {

    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);

    // console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {

            var limit = req.body.limit;
            var offset = (req.body.offset == 'null' ? 0 : req.body.offset);
            let amount = req.body.amount
            let currencyCode = req.body.currency_code
            let fee = req.body.platform_value
            let type = req.body.type
            let status = req.body.status
            let orderColumn = req.body.order_column
            let orderDirection = req.body.order_direction

            let searchQuery = ''
            let orderBy = ''

            if (Number(amount)){
                searchQuery += ` AND amount = '${amount}' `
            }
            if (currencyCode)
                searchQuery += ` AND currency_code = '${currencyCode}' `
            if (Number(fee)){
                searchQuery += ` AND platform_value = '${fee}' `
            }
            if(status){
                searchQuery += `AND status = ${mysql.escape(status) == 'NULL'?null:mysql.escape(status)}`
              }
 
            if(type){
                searchQuery += `HAVING type =  ${mysql.escape(type) == 'NULL'?null:mysql.escape(type)}`
            }

            if(['created_at', 'amount', 'platform_value'].includes(orderColumn)
            && ['asc', 'desc'].includes(orderDirection)){
            orderBy += ` ORDER BY ${orderColumn} ${orderDirection} `
        }
        else
            orderBy += ` ORDER BY created_at DESC `

            //  console.log("os", offset)
/*            SELECT *FROM (SELECT cd.currency_code, cd.amount, cd.platform_value, cd.status,cd.created_at,CONCAT('Deposit') as type,cd.comment FROM customer_deposite cd 
              JOIN currency_master as cm on cm.currency_code=cd.currency_code 
              WHERE cd.customer_id =34 AND cm.type =1 ) AS a UNION ALL SELECT * FROM (SELECT currency_code, amount as amount,platform_value as platform_value,status,created_at,CONCAT('Withdraw') as type,comment FROM customer_withdraw WHERE customer_id =34 AND type = 1  ) AS b  LIMIT 10 OFFSET 0*/
            let count_sql = mysql.format("SELECT *FROM (SELECT cd.currency_code, cd.amount, cd.platform_value, cd.status,cd.created_at,CONCAT('Deposit') as type,cd.comment FROM customer_deposite cd JOIN currency_master as cm on cm.currency_code=cd.currency_code WHERE cd.customer_id =? AND cm.type =1 "  +searchQuery+ " ) AS a UNION ALL SELECT * FROM (SELECT currency_code, amount, platform_value,status,created_at,CONCAT('Withdraw') as type,comment FROM customer_withdraw WHERE customer_id =? AND type = 1 " + searchQuery + " ) AS b", [data[0].id, data[0].id]);
            // console.log(tranmastercount_sql)
            connection.query(count_sql, function (error, countdata) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {

                    let sql2 = mysql.format("SELECT *FROM(SELECT cd.currency_code, cd.amount, cd.platform_value, cd.status,cd.created_at,CONCAT('Deposit') as type,cd.comment FROM customer_deposite cd JOIN currency_master as cm on cm.currency_code=cd.currency_code WHERE cd.customer_id =? AND cm.type =1 " + searchQuery + " ) AS a UNION ALL SELECT * FROM (SELECT currency_code, amount as amount,platform_value as platform_value,status,created_at,CONCAT('Withdraw') as type,comment FROM customer_withdraw WHERE customer_id =? AND type = 1 " + searchQuery + " ) AS b " + orderBy + " LIMIT " + limit + " OFFSET " + offset + "", [data[0].id, data[0].id]);
                    //console.log('sql is ', sql2)
                    //let sql2 = mysql.format("SELECT currency_code,FORMAT(amount,2) as amount,FORMAT(platform_value,2) as platform_value,status,created_at,comment FROM customer_withdraw WHERE customer_id =?  order by created_at desc LIMIT " + limit + " OFFSET " + offset + "", [data[0].id]);

                    connection.query(sql2, function (error, deposite) {
                        if (error) {
                            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                        } else {

                            var count = countdata.length
                            res.json({ success: true, message: "Deposit Withdraw transaction  info", data: deposite, totalcount: count })
                        }
                    })
                }
            })
        }
    })
}


exports.uploadDepositeDocuments = function (req, res) {
    var email = req.decoded.email;
    var reference_no = req.params.reference_no;
    let sql = mysql.format("SELECT *,(select id from user where email=" + mysql.escape(email) + ") as user_id FROM customer WHERE email =?", [email]);
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            let sqlSelectRefNo = mysql.format("select id,document_name,customer_id from customer_deposite where reference_no=?", [reference_no]);

            connection.query(sqlSelectRefNo, function (errS, resultS) {
                if (errS) {
                    res.json({ success: false, message: "Something went wrong", error: cm_cfg.errorFn(errS) });
                } else if (resultS.length > 0) {
                    if (resultS[0].customer_id == data[0].id) {
                        let documentStatus = resultS[0].document_name;
                        if (documentStatus == null || documentStatus == '') {
                            if (!fs.exists("uploads/" + data[0].id)) {
                                fs.mkdir("uploads/" + data[0].id);
                            }
                            req.user_id = data[0].id;
                            fs.mkdir("uploads/" + data[0].id, function (err) {

                                upload(req, res, function (error) {
                                    if (error) {
                                        console.log(error);
                                        res.json({ success: false, message: "error in photo upload", error: error })
                                    }
                                    else if (!req.file) {
                                        res.json({ success: false, message: "No file found" });
                                    }
                                    else if (req.file) {
                                        var ext = req.file.originalname.substr(req.file.originalname.lastIndexOf('.') + 1);
                                        if (ext == 'doc' || ext == 'docx' || ext == 'pdf' || ext == 'jpg' || ext == 'jpeg' || ext == 'png') {
                                            let document_name = req.file.filename;
                                            let updateDocSql = mysql.format("update customer_deposite set document_name=? where reference_no=? and customer_id=?", [document_name, reference_no, data[0].id])
                                            connection.query(updateDocSql, function (errI, resultI) {
                                                if (errI) {
                                                    res.json({ success: false, message: "Something went wrong", error: cm_cfg.errorFn(errI) });
                                                } else if (resultI.affectedRows > 0) {
                                                    res.json({ success: true, message: "Document uploaded successfully" });
                                                } else {
                                                    res.json({ success: false, message: "Not able to upload document" });
                                                }
                                            })
                                        } else {
                                            res.json({ success: false, message: "Unsupported file format" })
                                        }
                                    }
                                });
                            });
                        } else {
                            res.json({ success: false, message: "Document already uploaded" });
                        }
                    } else {
                        res.json({ success: false, message: "Incorrect document upload" });
                    }
                } else {
                    res.json({ success: false, message: "Incorrect document upload" });
                }
            })

        }
    })
}


exports.inActiveBalance = function (req, res) {
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?" , [email]);
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        }
        else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        }
        else {
            let sql1 = "SELECT sum(total_price) as tp FROM buy where (status ='Executed' or status ='partially Executed') and customer_id=" + mysql.escape(data[0].id);
            //console.log(sql1);
            connection.query(sql1, function (err, data) {
                if (err) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(err) });
                }
                else {
                    res.json({ success: true, result: data });
                }
            })
        }

    })
}



 // exports.withdrawMoney = function(req, res) {

 //     let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
 //     connection.query(sql, function(error, data) {
 //         if (error) {
 //             res.json({ success: false, message: "error", error })
 //         } else if (data[0] == null || data[0] == undefined) {
 //             res.json({ success: false, message: "User not found" })
 //         } else { //payment gate code
 //             var payresult = true;
 //             if (payresult == true) {
 //                 let sql2 = "SELECT* FROM customer_wallet where customer_id='" + data[0].id + "'AND currency_code='" + req.body.currency_code + "'";
 //                 //console.log("sql", sql2);
 //                 connection.query(sql2, function(error, response) {
 //                     if (error) {
 //                         res.json({ success: false, message: "error", error });
 //                     } else {
 //                         if (response[0] == null || response == undefined) {
 //                             res.json({ success: false, message: "Please add money to wallet first" });
 //                         } else {
 //                             if (response[0].total_amount < req.body.total_amount) {
 //                                 res.json({ success: false, message: "Cannot withdraw more than the wallet limit." });
 //                             } else {
 //                                 var total_amount = parseFloat(response[0].total_amount) - parseFloat(req.body.total_amount);
 //                                 var withdraw_amount = parseFloat(req.body.total_amount) - parseFloat(req.body.fee_value)

 //                                 let sql3 = "INSERT INTO customer_withdraw (customer_id,amount,currency_code,created_at,status,platform_fee,platform_value) SELECT id,'" + req.body.total_amount + "','" + req.body.currency_code + "','" + created_at + "','success','" + req.body.fee_percentage + "','" + req.body.fee_value + "' FROM customer WHERE id='" + data[0].id + "';"
 //                                 connection.query(sql3, function(error, response) {
 //                                     if (error) {
 //                                         res.json({ success: false, message: "error", error });
 //                                     } else {

 //                                         let sql4 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) SELECT id,'" + req.body.total_amount + " " + req.body.currency_code + " withdrawn from the wallet','006','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at + "',id,id FROM customer WHERE id='" + data[0].created_by + "';"
 //                                         connection.query(sql4, function(error, response) {
 //                                             if (error) {
 //                                                 res.json({ success: false, message: "error", error });
 //                                             } else {

 //                                                 let sql5 = "UPDATE customer_wallet SET total_amount ='" + total_amount + "' WHERE customer_id='" + data[0].id + "'AND currency_code='" + req.body.currency_code + "'";
 //                                                 connection.query(sql5, function(error, response) {
 //                                                     if (error) {
 //                                                         res.json({ success: false, message: "error", error });
 //                                                     } else {
 //                                                         res.json({ success: true, message: "Money withdrawn from wallet." });

 //                                                         let mailOptions = {
 //                                                             from: 'Fuleex Exchange<' + config.email + '>', // sender address
 //                                                             to: data[0].email, // list of receivers
 //                                                             subject: 'Money withdrawn from exchange wallet', // Subject line
 //                                                             text: '',
 //                                                             html: "Hello,<br>Your have withdrawn " + withdraw_amount + " " + req.body.currency_code + " from the exchange wallet.<br>" // html body
 //                                                         };


 //                                                         transporter.sendMail(mailOptions, (error, info) => {
 //                                                             if (error) {
 //                                                                 return console.log("error", error);
 //                                                             }
 //                                                             console.log('Message %s sent: %s', info.messageId, info.response);

 //                                                         });

 //                                                     }
 //                                                 });
 //                                             }
 //                                         });
 //                                     }
 //                                 });

 //                             }
 //                         }
 //                     }

 //                 });

 //             } else {
 //                 res.json({ success: false, message: "payment cannot completed" })
 //             }
 //         }
 //     })
 // }





 // exports.addmoney = function(req, res) {

 //     var email = req.decoded.email;
 //     let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);

 //     //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
 //     //console.log(sql)
 //     connection.query(sql, function(error, data) {
 //         if (error) {
 //             res.json({ success: false, message: "error", error })
 //         } else if (data[0] == null || data[0] == undefined) {

 //             res.json({ success: false, message: "User not found" })
 //         } else { //payment gate code
 //             var payresult = true;
 //             if (payresult == true) {

 //                 var depositeData = {
 //                     "customer_id": data[0].id,
 //                     "amount": req.body.amount,
 //                     "currency_code": req.body.currency_code,
 //                     "created_at": created_at,
 //                     "status": 0,
 //                     "platform_fee": req.body.fee_percentage,
 //                     "platform_value": req.body.fee_value
 //                 }

 //                 let sql2 = mysql.format("INSERT INTO customer_deposite SET ?", depositeData)

 //                 // console.log(req.decoded.email)
 //                 // let sql2 = "INSERT INTO customer_deposite (customer_id,amount,currency_code,created_at,status,platform_fee,platform_value) SELECT id,'" + req.body.amount + "','" + req.body.currency_code + "','" + created_at + "','success','" + req.body.fee_percentage + "','" + req.body.fee_value + "' FROM customer WHERE id='" + data[0].id + "';"
 //                 // console.log("sql", sql2)
 //                 connection.query(sql2, function(error, ress) {

 //                     if (error) {
 //                         res.json({ success: false, message: "error", error })
 //                     } else {
 //                         var logData = {
 //                             "user_id": data[0].created_by,
 //                             "activity_description": "'" + req.body.amount + " " + req.body.currency_code + " added to the wallet'",
 //                             "activity_type": '041',
 //                             "device_ipAddress": req.body.device_ipAddress,
 //                             "device_os": req.body.device_os,
 //                             "device_name": req.body.device_name,
 //                             "device_browser": req.body.device_browser,
 //                             "created_at": created_at,
 //                             "created_by": data[0].created_by,
 //                             "updated_by": data[0].created_by
 //                         }


 //                         let sql3 = mysql.format("INSERT INTO log SET ?", logData)


 //                         //let sql3 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) SELECT id,'" + req.body.amount + " " + req.body.currency_code + " added to the wallet','041','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at + "',id,id FROM customer WHERE id='" + data[0].created_by + "';"
 //                         // console.log(sql3)
 //                         connection.query(sql3, function(error, results) {
 //                             if (error) {
 //                                 res.json({ success: false, message: "error", error })
 //                             } else {

 //                                 let sql_3 = "SELECT* FROM customer_wallet where customer_id='" + data[0].id + "'AND currency_code='" + req.body.currency_code + "'";
 //                                 connection.query(sql_3, function(error, datta) {
 //                                     if (datta[0] == null || datta == undefined) {

 //                                         let sql4 = "INSERT INTO customer_wallet (customer_id,total_amount,currency_code,created_at) SELECT id,'" + req.body.amount + "','" + req.body.currency_code + "','" + created_at + "' FROM customer WHERE id='" + data[0].id + "'";
 //                                         //console.log("query", sql4)
 //                                         connection.query(sql4, function(error, final) {
 //                                             if (error) {
 //                                                 res.json({ success: false, message: "error", error })
 //                                             } else {
 //                                                 res.json({ success: true, message: "Money added to the wallet" })
 //                                             }
 //                                         })
 //                                     } else {
 //                                         //console.log(datta[0].total_amount)
 //                                         total_amount = parseInt(datta[0].total_amount) + parseInt(req.body.amount);
 //                                         //console.log(total_amount)
 //                                         let sql5 = "UPDATE customer_wallet SET total_amount ='" + total_amount + "' WHERE customer_id='" + data[0].id + "'AND currency_code='" + req.body.currency_code + "'";
 //                                         //console.log(sql5)
 //                                         connection.query(sql5, function(error, final) {
 //                                             if (error) {
 //                                                 res.json({ success: false, message: "error", error })
 //                                             } else {

 //                                                 res.json({ success: true, message: "Money added to the wallet" })

 //                                             }
 //                                         })

 //                                     }

 //                                     let mailOptions = {
 //                                         from: 'Fuleex Exchange<' + config.email + '>', // sender address
 //                                         to: data[0].email, // list of receivers
 //                                         subject: 'Money added to the exchange wallet', // Subject line
 //                                         text: '',
 //                                         html: "Hello,<br>Your have added " + req.body.amount + " " + req.body.currency_code + " to the exchange wallet.<br>" // html body
 //                                     };


 //                                     transporter.sendMail(mailOptions, (error, info) => {
 //                                         if (error) {
 //                                             return console.log("jkjkj", error);
 //                                         }
 //                                         console.log('Message %s sent: %s', info.messageId, info.response);

 //                                     });

 //                                 })
 //                             }
 //                         })
 //                     }
 //                 })
 //             } else {
 //                 res.json({ success: false, message: "Payment cannot completed" })
 //             }
 //         }
 //     })
 // }






 // let mailOptions = {
 //                                                   from: 'Fuleex Exchange<' + config.email + '>', // sender address
 //                                                   to: data[0].email, // list of receivers
 //                                                   subject: 'Money withdrawn Requset from exchange wallet', // Subject line
 //                                                   text: '',
 //                                                   html: "Hello,<br>Your have submit request for withdraw " + withdraw_amount + " " + req.body.currency_code + " from the exchange wallet.<br>" // html body
 //                                               };


 //                                               transporter.sendMail(mailOptions, (error, info) => {
 //                                                   if (error) {
 //                                                       return console.log("error", error);
 //                                                   }
 //                                                   console.log('Message %s sent: %s', info.messageId, info.response);

 //                                               });

 // if (walletdata[0].total_amount < req.body.total_amount) {




 //     res.json({ success: false, message: "Cannot withdraw more than the wallet limit." });
 // } else {
 //     var total_amount = parseFloat(response[0].total_amount) - parseFloat(req.body.total_amount);
 //     var withdraw_amount = parseFloat(req.body.total_amount) - parseFloat(req.body.fee_value)

 //     let sql3 = "INSERT INTO customer_withdraw (customer_id,amount,currency_code,created_at,status,platform_fee,platform_value) SELECT id,'" + req.body.total_amount + "','" + req.body.currency_code + "','" + created_at + "','success','" + req.body.fee_percentage + "','" + req.body.fee_value + "' FROM customer WHERE id='" + data[0].id + "';"
 //     connection.query(sql3, function(error, response) {
 //         if (error) {
 //             res.json({ success: false, message: "error", error });
 //         } else {

 //             let sql4 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) SELECT id,'" + req.body.total_amount + " " + req.body.currency_code + " withdrawn from the wallet','006','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at + "',id,id FROM customer WHERE id='" + data[0].created_by + "';"
 //             connection.query(sql4, function(error, response) {
 //                 if (error) {
 //                     res.json({ success: false, message: "error", error });
 //                 } else {

 //                     let sql5 = "UPDATE customer_wallet SET total_amount ='" + total_amount + "' WHERE customer_id='" + data[0].id + "'AND currency_code='" + req.body.currency_code + "'";
 //                     connection.query(sql5, function(error, response) {
 //                         if (error) {
 //                             res.json({ success: false, message: "error", error });
 //                         } else {
 //                             res.json({ success: true, message: "Money withdrawn from wallet." });

 //                             let mailOptions = {
 //                                 from: 'Fuleex Exchange<' + config.email + '>', // sender address
 //                                 to: data[0].email, // list of receivers
 //                                 subject: 'Money withdrawn Requset from exchange wallet', // Subject line
 //                                 text: '',
 //                                 html: "Hello,<br>Your have submit request for withdraw " + withdraw_amount + " " + req.body.currency_code + " from the exchange wallet.<br>" // html body
 //                             };


 //                             transporter.sendMail(mailOptions, (error, info) => {
 //                                 if (error) {
 //                                     return console.log("error", error);
 //                                 }
 //                                 console.log('Message %s sent: %s', info.messageId, info.response);

 //                             });

 //                         }
 //                     });
 //                 }
 //             });
 //         }
 //     });

 // }
