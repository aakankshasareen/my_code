var bcrypt = require('bcryptjs');
var mysql = require('mysql');
var salt = bcrypt.genSaltSync(10);
var config = require('../../../config/config');
var common_config = require('../../../config/common_config');
var connection = require('../../../config/db');
var cm_cfg = require('../../../config/common_config');
var emailFn = require('./email');
var jwt = require('jsonwebtoken');
var Hashids = require('hashids')
var hashSalt = new Hashids('Fuleex forget password');
var useragent = require('useragent');
var device = require('express-device');
var async = require('async');
var nodemailer = require('nodemailer');
var speakeasy = require('speakeasy');
var QRCode = require('qrcode');
var moment = require('moment');
const Countries = require('countries-api');
var Model = require('../../../config/bookshelf-model');
var mobileOTP = require('./mobile_otp');
var fs = require("fs");
const JSON = require('circular-json');
var bitcoin = require('bitcoin');

var transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // secure:true for port 465, secure:false for port 587
    auth: {
        user: config.email,
        pass: config.password
    }
});


var Web3 = require('web3');
var web3 = new Web3(config.geth_http);
var erc20web3 = new Web3(config.geth_http_erc20);

var client = new bitcoin.Client({
    host: config.btc_host,
    port: config.btc_port, // ipc port number
    user: config.btc_user,
    pass: config.btc_pass,
    timeout: 30000
});


var bch_client = new bitcoin.Client({
    host: config.bch_host,
    port: config.bch_port, // ipc port number
    user: config.bch_user,
    pass: config.bch_pass,
    timeout: 30000
});

function created_at() {
    var created = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return created;
}


function labdate() {
    var labdate = moment(new Date()).format("YYYY-MM-DD");
    return labdate;
}


var BlockIo = require('block_io');
var version = config.bitcoin_version;

var block_io = new BlockIo(config.bitcoin_apiKey, config.bitcoin_pin, version);

var ltc_block_io = new BlockIo(config.litecoin_apiKey, config.bitcoin_pin, version);

var doge_block_io = new BlockIo(config.dogecoin_apiKey, config.bitcoin_pin, version);


exports.register = function(req, res) {
    var custId = {}
    var userId = {}
    if (typeof(req.body.country) != 'undefined') {
        req.body.country = req.body.country.trim();
    }

    function country(password) {
        return new Promise(function(resolve, reject) {
            let sql = mysql.format("Select*from countries where name=? or sortname=?", [req.body.country, req.body.sortName]);
            // console.log(sql)
            connection.query(sql, function(error, adddata) {
                console.log(adddata);
                if (adddata[0] == null || adddata[0] == undefined) {

                    var insertData = {
                        "name": req.body.country,
                        "sortname": req.body.sortName,
                        "phonecode": req.body.dialCode,
                        "created_at": created_at(),
                        "status": 1

                    };

                    let sql1 = mysql.format("INSERT INTO countries SET ?", insertData)

                    console.log(sql1)
                    connection.query(sql1, function(error, result) {

                        if (error) {
                            console.log(error)
                            reject(error)

                        } else {
                            console.log(result.insertId)
                            resolve(result.insertId)

                        }
                    })
                } else {
                    console.log(adddata[0].id)
                    resolve(adddata[0].id)
                }
            })
        })
    }

    function db(password) {
        return new Promise(function(resolve, reject) {

            connection.beginTransaction(function(err) {
                if (err) {
                   reject(err)
                }

                var custoData = {
                    "fullname": req.body.name,
                    "email": req.body.email,
                    "mobileNumber": req.body.mobileNumber!=undefined?req.body.mobileNumber:"",
                    "device_ipAddress": req.body.device_ipAddress,
                    "device_os": req.body.device_os,
                    "device_name": req.body.device_name,
                    "device_browser": req.body.device_browser,
                    "status": 1,
                    "created_at": created_at()
                };


                let sql1 = mysql.format("INSERT INTO customer SET ?", custoData)
                console.log(sql1)
                connection.query(sql1, function(error, result) {
                    if (error) {
                        return connection.rollback(function() {

                            reject(error)

                        });
                    }


                    var userData = {
                        "email": req.body.email,
                        "type_id": result.insertId,
                        "status": 1,
                        "password": password,
                        "user_type": 'C'
                    }

                    let sql2 = mysql.format("INSERT INTO user SET ?", userData)

                    console.log(sql2)
                    connection.query(sql2, function(error, results) {
                        if (error) {
                            return connection.rollback(function() {
                                   reject(error)
                           });
                        }

                        var logData = {
                            "user_id": results.insertId,
                            "activity_description": 'Customer Registration',
                            "activity_type": '001',
                            "device_ipAddress": req.body.device_ipAddress,
                            "device_os": req.body.device_os,
                            "device_name": req.body.device_name,
                            "device_browser": req.body.device_browser,
                            "created_at": created_at(),
                            "created_by": results.insertId,
                            "updated_by": results.insertId
                        }


                        let sql3 = mysql.format("INSERT INTO log SET ?", logData)

                        console.log(sql3)

                        connection.query(sql3, function(error, logdatas) {
                            if (error) {
                                return connection.rollback(function() {

                                    reject(error)

                                });
                            }

                            let sql = "SELECT * FROM currency_master";
                            //  console.log(sql)
                            connection.query(sql, function(error, currencydata) {
                                if (error) {
                                    return connection.rollback(function() {
                                        throw error;
                                        reject(error)

                                    });
                                } else if (currencydata[0] == null || currencydata[0] == undefined) {

                                    resolve("No currency found")
                                } else {

                                    var i = currencydata.length;

                                    async.forEachOf(currencydata, function(error, i, inner_callback) {
                                            let sql1 = mysql.format("Select *from customer_wallet where customer_id=? and currency_code=?", [result.insertId, currencydata[i].currency_code]);
                                            //   console.log(sql1)
                                            connection.query(sql1, function(error, walldata) {
                                                if (error) {
                                                    //     console.log("Error while performing Query");
                                                    inner_callback(error);
                                                } else if (walldata[0] != null || walldata[0] != undefined) {
                                                    //     console.log(walldata)
                                                    console.log("already exit wallet")
                                                    inner_callback(null);
                                                } else {
                                                    let sql5 = mysql.format("INSERT INTO customer_wallet (customer_id,total_amount,currency_code,created_at) values (?,'0',?,'" + created_at() + "');", [result.insertId, currencydata[i].currency_code])
                                                    //console.log("query", sql4)
                                                    connection.query(sql5, function(error, final) {
                                                        if (error) {
                                                            console.log("Error while performing Query");
                                                            inner_callback(error);
                                                        } else {

                                                            console.log("done")
                                                            inner_callback(null);
                                                        }
                                                    })

                                                }
                                            })
                                        },
                                        function(err) {
                                            if (err) {
                                                return connection.rollback(function() {

                                                    reject(err)

                                                })
                                            } else {
                                                console.log("ok")

                                                connection.commit(function(err) {
                                                    if (err) {
                                                        console.log("error in commit")
                                                        return connection.rollback(function() {

                                                            reject(err)
                                                        });
                                                    }
                                                    console.log("cu", result.insertId)
                                                    console.log("user", results.insertId)
                                                    var obj = { cus: result.insertId, use: results.insertId }
                                                    resolve(obj)
                                                })


                                            }
                                        }
                                    )
                                }
                            })

                        })
                    })
                })


            })
        })
    }


    function btcaddresscreation(customerId) {
        //console.log(customerId)
        return new Promise(function(resolve, reject) {

            let sql1 = mysql.format("Select * from user_crypto_address where user_id=? and crypto_type='BTC'", [customerId]);
            console.log(sql1)
            connection.query(sql1, function(error, adddata) {
                if (error) {
                    console.log(error)
                    reject(error)
                } else if (adddata[0] == null || adddata[0] == undefined) {

                  block_io.get_new_address( function(error, addr) {
                        if (error) {
                            console.log(error)
                            reject(error)
                        } else {


                            //  console.log(addr)
                            //console.log(cusdata)

                            var addressData = {
                                "user_id": customerId,
                                "crypto_address": addr.data.address,
                                "crypto_type": 'BTC',
                                "created_at": created_at()
                            };

                            let sql3 = mysql.format("INSERT INTO user_crypto_address SET ?", addressData)
                           
                            console.log("sql", sql3)
                            connection.query(sql3, function(error, results) {
                                if (!error) {
                                    console.log("resu", results)
                                    resolve(results)
                                } else {
                                    // console.log(error)
                                    reject(error)
                                }

                            })
                        }
                    })
                } else {
                    console.log({ success: false, message: "BTC account already created" })
                    resolve("BTC account already created")

                }
            })


        })

    }

    function ltcaddresscreation(customerId) {
        //console.log(customerId)
        return new Promise(function(resolve, reject) {

            let sql1 = mysql.format("Select * from user_crypto_address where user_id=? and crypto_type='LTC'", [customerId]);
            console.log(sql1)
            connection.query(sql1, function(error, adddata) {
                if (error) {
                    console.log(error)
                    reject(error)
                } else if (adddata[0] == null || adddata[0] == undefined) {
                 ltc_block_io.get_new_address( function(error, addr) {
                        if (error) {
                            console.log(error)
                            reject(error)
                        } else {


                            //  console.log(addr)
                            //console.log(cusdata)

                            var addressData = {
                                "user_id": customerId,
                                "crypto_address": addr.data.address,
                                "crypto_type": 'LTC',
                                "created_at": created_at()
                            };

                            let sql3 = mysql.format("INSERT INTO user_crypto_address SET ?", addressData)
                           
                            console.log("sql", sql3)
                            connection.query(sql3, function(error, results) {
                                if (!error) {
                                    console.log("resu", results)
                                    resolve(results)
                                } else {
                                   
                                    reject(error)
                                }

                            })
                        }
                    })
                } else {
                    console.log({ success: false, message: "LTC account already created" })
                    resolve("LTC account already created")

                }
            })


        })

    }

    function dogeaddresscreation(customerId) {
        //console.log(customerId)
        return new Promise(function(resolve, reject) {

            let sql1 = mysql.format("Select * from user_crypto_address where user_id=? and crypto_type='DOGE'", [customerId]);
            console.log(sql1)
            connection.query(sql1, function(error, adddata) {
                if (error) {
                    console.log(error)
                    reject(error)
                } else if (adddata[0] == null || adddata[0] == undefined) {

                    doge_block_io.get_new_address(function(error, addr) {
                        if (error) {
                            console.log(error)
                            reject(error)
                        } else {


                            //  console.log(addr)
                            //console.log(cusdata)

                            var addressData = {
                                "user_id": customerId,
                                "crypto_address": addr.data.address,
                                "crypto_type": 'DOGE',
                                "created_at": created_at()
                            };

                            let sql3 = mysql.format("INSERT INTO user_crypto_address SET ?", addressData)
                            //let sql1 = "INSERT INTO user_crypto_address (user_id,crypto_address,crypto_type,created_at) values('" + customerId + "','" + addr + "','BTC','" + created_at + "')"
                            console.log("sql", sql3)
                            connection.query(sql3, function(error, results) {
                                if (!error) {
                                    console.log("resu", results)
                                    resolve(results)
                                } else {
                                    // console.log(error)
                                    reject(error)
                                }

                            })
                        }
                    })
                } else {
                    console.log({ success: false, message: "DOGE account already created" })
                    resolve("DOGE account already created")

                }
            })


        })

    }
  
    function ethaddresscreation(customerId, email) {
        
                // console.log("in eth" , customerId)
                return new Promise(function(resolve, reject) {
                    let sql1 = mysql.format("Select*from user_crypto_address where user_id=? and crypto_type='ETH'",[customerId]);
                    console.log(sql1)
                    connection.query(sql1, function(error, adddata) {
                        if (adddata[0] == null || adddata[0] == undefined) {
                            //console.log(data)
                            var account = web3.eth.accounts.create()
        
                            var padd = account.address;
                            //console.log(padd)
        
                            var encryptdata = web3.eth.accounts.encrypt(account.privateKey, email);
                            //console.log("enc data", encryptdata)
                            var addressData = {
                                "user_id": customerId,
                                "crypto_address": padd,
                                "crypto_type": 'ETH',
                                "created_at": created_at()
                            };
        
                            let sql3 = mysql.format("INSERT INTO user_crypto_address SET ?", addressData)
        
                            // let sql3 = "INSERT INTO user_crypto_address (user_id,crypto_address,crypto_type,created_at) values('" + customerId + "','" + padd + "','ETH','" + created_at + "')"
                            //console.log("sql",sql3)
                            connection.query(sql3, function(error, results) {
                                if (!error) {
                                    console.log(results)
                                    //resolve(address)
        
                                    fs.appendFile('./key/' + padd, JSON.stringify(encryptdata), (err) => {
                                        if (err) {
                                            //console.log({ success: false, message: "error", err })
                                            reject(err)
                                        } else {
                                            console.log('The "data is appended');
                                            resolve(true)
                                        }
                                    })
        
        
                                } else {
                                    console.log(error)
                                    reject(error)
                                }
                            })
        
        
                        } else {
                            resolve("ETH account already created")
                        }
                    })
        
                })
            }

    function erc20addresscreation(customerId, email, erc20token) {        
                // console.log("in eth" , customerId)
                return new Promise(function(resolve, reject) {
                    let sql1 = mysql.format("Select*from user_crypto_address where user_id=? and crypto_type=?",[customerId, erc20token]);
                    connection.query(sql1, function(error, adddata) {
                        if (adddata[0] == null || adddata[0] == undefined) {
                            
                            var account = erc20web3.eth.accounts.create();
                            var padd = account.address;
        
                            var encryptdata = erc20web3.eth.accounts.encrypt(account.privateKey, email);
                            var addressData = {
                                "user_id": customerId,
                                "crypto_address": padd,
                                "crypto_type": erc20token,
                                "created_at": created_at()
                            };
        
                            let sql3 = mysql.format("INSERT INTO user_crypto_address SET ?", addressData)
        
                            // let sql3 = "INSERT INTO user_crypto_address (user_id,crypto_address,crypto_type,created_at) values('" + customerId + "','" + padd + "','ETH','" + created_at + "')"
                            //console.log("sql",sql3)
                            connection.query(sql3, function(error, results) {
                                if (!error) {
                                    console.log(results)
                                    //resolve(address)
        
                                    fs.appendFile('./key/' + padd, JSON.stringify(encryptdata), (err) => {
                                        if (err) {
                                            //console.log({ success: false, message: "error", err })
                                            reject(err)
                                        } else {
                                            console.log('The "data is appended');
                                            resolve(true)
                                        }
                                    })
        
        
                                } else {
                                    console.log(error)
                                    reject(error)
                                }
                            })
        
        
                        } else {
                            resolve(erc20token+" account already created")
                        }
                    })
        
                })
            }

    var password = bcrypt.hashSync("'" + req.body.password + "'", salt);

    var email = req.body.email;
    var mobile = req.body.mobileNumber;
    //let sql = mysql.format("SELECT * FROM customer WHERE email =? or mobileNumber=?", [email, mobile]);
    let sql = mysql.format("SELECT * FROM customer WHERE email =? ", [email, mobile]);

    //let sql = "SELECT * FROM customer WHERE email ='" + req.body.email + "'";
    //console.log(sql) ;
    //if (Countries.findByName(req.body.country.trim()).statusCode == 200 && Countries.findByName(req.body.country.trim()).data.length > 0) {


    connection.query(sql, function(error, data) {
        if (error) {
            console.log(error)
            res.json({ success: false, message: "Error" })
        } else {
            // console.log("data", data)

            if (data[0] == null || data[0] == undefined) {

                db(password).then(function(customerId) {

                    console.log("customer", customerId.cus)
                    custId = customerId.cus
                    userId = customerId.use
                    return btcaddresscreation(userId)
/*                }).then(function(addbtc) {
                    console.log("btc address", addbtc)
                    return dogeaddresscreation(userId, req.body.email)*/
                }).then(function(addbtc) {
                    console.log("btc address", addbtc)
                    return ltcaddresscreation(userId, req.body.email)
                }).then(function(addbtc) {
                    console.log("eth address", addbtc)
                    return ethaddresscreation(userId, req.body.email)
                }).then(function(addbtc) {
                    console.log("eth address", addbtc)
                    return erc20addresscreation(userId, req.body.email, 'FULX')
                }).then(function(addfulx) {
                    console.log("fulx address", addfulx)
                    return erc20addresscreation(userId, req.body.email, 'ABC')
                }).then(function(addabc) {
                    console.log("abc address", addabc)



                    stoken = {

                        email: req.body.email,
                        // device_name: req.body.device_name
                    }
                    // console.log(stoken)

                    var emailtoken = jwt.sign(stoken, config.superSecret, { expiresIn: '12h' });
                    console.log(emailtoken)
                    //  console.log(req.body.device_name)
                    // console.log(req.body.device_name == 'Mobile')


                    var updatedDate = {
                        
                        "emailToken": emailtoken,
                        "created_by": userId,
                        "updated_by": userId
                    }

                    let sql7 = mysql.format("UPDATE customer SET ? WHERE email =?", [updatedDate, email]);
                    
                    connection.query(sql7, function(error, result) {
                        if (error) {
                            console.log(error)
                            res.json({ success: false, message: "Error" })
                        } else {


                            link = config.globalDomain + "/emailVerify?token=" + emailtoken;


                            var defaultMsg = "Hello," + req.body.name + " <br>Your have successfully registered.<br>";
                        //    console.log("test",defaultMsg)
                            var defaultMsg1 = "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>";
                            emailFn.sendEmail('welcome', req.body.name, req.body.email, undefined, undefined, undefined, undefined, defaultMsg).then(function(res1) {
                                emailFn.sendEmail('verify_email', req.body.name, req.body.email, link, undefined, undefined, undefined, defaultMsg1).then(function(res2) {
                                    res.json({ success: true, message: "User successfully register" })
                                }).catch(function(err2) {
                                    console.log("err2", err2);
                                    res.json({ success: false, message: "Error in mail sending" })
                                });
                            }).catch(function(err1) {
                                console.log("err1", err1);
                                res.json({ success: false, message: "Error in mail sending" })
                            })

                        }


                    })


                }).catch(function(err) {
                    console.log(err)
                    res.json({ success: false, message: "Error" })
                })



            } else {
                res.json({ success: false, message: "Email already exist" })
            }
        }
    })
    // } else {
    //     res.json({ success: false, message: "Invalid country" })
    // }

}





exports.registerVerifyOTP = function(req, res) {
    var mobileNumber = req.body.mobileNumber
    var otp = req.body.otp;
    console.log(mobileNumber+" "+otp)
        let sql = mysql.format("SELECT * FROM mobile_otp WHERE mobile_number = ?",mobileNumber );
            console.log(sql)
            connection.query(sql, function(error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {
                    if (data[0] == null || data[0] == undefined) {
                       res.json({ success: false, message: "User not found" })
                    } else if(data[0].otp==otp){
                       let sql = mysql.format("update mobile_otp set verification_counter = 1" )
                       connection.query(sql, function(error, data) {
                        if (error) {
                            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                        } else {
                            res.json({success: true,message:'otp verified successfully'})
                        }       
                    })
                        }
                        else{
                            res.json({success: false ,message:'otp not matched'})
                        }

                    }
                })
           
        }






/**
 *  save valid applicant details to database
 */
function getSumSubKYCStatus(req, res, cusdata) {

    if(cusdata < 2 && cusdata.applicant_id !=null) {
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
        request(options, function(error, response) {

            if (!error) {
                if (response.body!= undefined && response.body.id != undefined) {
                    // if applicant id generated then save to database
                    updateKYCStatus(req, res, response.body, cusdata.id, cusdata.email);
                } else if (response.body!= undefined && response.body.correlationId != undefined) {
                    console.log("error happened");
                }
            } else {
                console.log(error);
            }
        });
    }
};

/**
 *  save valid applicant details to database
 */
function updateKYCStatus(req, res, sumsubresponse = '', customer_id, customer_email) {
    var updatedStatus = 0;
    if (sumsubresponse.reviewStatus == 'init') {
        updatedStatus = 0;
    } else if (sumsubresponse.reviewStatus == 'pending' || sumsubresponse.reviewStatus == 'queued' || sumsubresponse.reviewStatus == 'awaitingUser') {
        updatedStatus = 1;
    } else if (sumsubresponse.reviewStatus == 'completed' || sumsubresponse.reviewStatus == 'completedSent' || sumsubresponse.reviewStatus == 'completedSentFailure') {
        updatedStatus = 2;
        generateBlockIOAddress(customer_email);
    }
    var updateData = {
        "kyc_status": updatedStatus,
        "kyc_status_comment": sumsubresponse.reviewStatus,
    }

    connection.query("UPDATE customer SET ? WHERE id = ?", [updateData, customer_id], function(error, result) {
        if (error) {
            console.log(error);
        } else {
            console.log(result);
        }
    });
};






exports.emailVerify = function(req, res) {
    console.log("token" , req.body.token)
    jwt.verify(req.body.token, config.superSecret, function(err, checktoken) {
        if (err) {
            console.log(err)
            res.status(401).send({ status: -2, success: false, message: 'Invalid or Email link has been expired.', error: cm_cfg.errorFn(err) })
        } else {
            console.log(req.body.token)

            let sql = mysql.format("SELECT * FROM customer WHERE emailToken =?", [req.body.token]);
            console.log(sql)
            connection.query(sql, function(error, data) {
                if (data[0] == null || data[0] == undefined) {
                    
                    res.json({ success: false, message: "Invalid or Email link has been expired" })
                } else {
                    if (data[0].emailVerify == 1) {
                       
                        res.json({ success: false, message: "Invalid or Email link has been expired." })
                    } else {

                        let sq = mysql.format("SELECT * FROM user WHERE type_id =?", [data[0].id]);
                        //console.log(sq)
                        connection.query(sq, function(error, userdata) {

                            if (userdata[0] == null || userdata[0] == undefined) {
                                res.json({ success: false, message: "user not found" })
                            } else {

                                stoken = {

                                    id: userdata[0].id,
                                    email: data[0].email,

                                }


                                var token = jwt.sign(stoken, config.superSecret, { expiresIn: '7d' });


                                var updateDate = {
                                    "emailVerify": 1,
                                    "token": token
                                }
                                //let sql1 = "UPDATE customer SET emailVerify = 'true', updated_at = '" + updated_at + "' WHERE email = '" + data[0].email + "'";
                                let token_sql = mysql.format("UPDATE customer SET ? WHERE email =?", [updateDate, data[0].email]);
                                //console.log(sql1)
                                connection.query(token_sql, function(error, result) {
                                    if (error) {
                                        res.json({ success: false, message: "Invalid or Email link has been expired", error: cm_cfg.errorFn(error) })
                                    } else {

                                        //console.log("verified")
                                        res.json({ success: true, message: 'Email verify successfully', token: token });

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


exports.qrcode = function(req, res) {

    let sql = mysql.format("SELECT * FROM customer WHERE token =?", [req.body.token]);
    console.log(sql)
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else {
            // console.log("data", data[0])

            if (data[0] == null || data[0] == undefined) {

                res.json({ success: false, message: "User not found" })
            } else {

                var secret = speakeasy.generateSecret({ length: 20, name: "" + cm_cfg.domainName + "(" + data[0].email + ")" });
                //console.log(secret.base32); // secret of length 20

                QRCode.toDataURL(secret.otpauth_url, function(err, data_url) {
                    if (err) {
                        res.json({ success: false, message: "error", error: cm_cfg.errorFn(err) })

                    } else {
                        var updateDate = {
                            "secretKey": secret.base32,

                        }

                        let sql1 = mysql.format("UPDATE customer SET ? WHERE email=?", [updateDate, data[0].email]);

                        //let sql1 = "UPDATE customer SET secretKey ='" + secret.base32 + "', updated_at = '" + updated_at + "',created_by ='" + data[0].id + "',updated_by='" + data[0].id + "' WHERE email = '" + req.body.email + "'";
                        //let sql1 = "UPDATE customer SET secretKey ='" + secret.base32 + "',2FA_status=1 WHERE email = '" + data[0].email + "'";
                        //console.log(sql1)
                        connection.query(sql1, function(error, result) {
                            if (!error) {
                                // console.log(data_url); // get QR code data URL

                                res.json({ success: true, data: data_url, secretKey: secret.base32 })
                            } else {

                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) })
                            }

                        })
                    }

                })
            }
        }
    })
}


exports.signupVerifyCode = function(req, res) {

    jwt.verify(req.body.token, config.superSecret, function(err, checktoken) {
        if (err) {
            //console.log(err)
            res.json({ success: false, message: 'Token expired.', error: cm_cfg.errorFn(err) })
        } else {

            let sql = "SELECT*FROM customer WHERE token ='" + req.body.token + "'";
            //console.log(sql)
            connection.query(sql, function(error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {
                    console.log("data", data[0])

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
                            //window: 1
                        });
                        //console.log(verified);

                        if (verified === true) {
                            console.log("set otp verify")
                            var updateDate = { "FA_status": 1 }

                            let sql1 = mysql.format("UPDATE customer SET ? WHERE email=?", [updateDate, data[0].email]);

                            //let sql1 = "UPDATE customer SET secretKey ='" + secret.base32 + "', updated_at = '" + updated_at + "',created_by ='" + data[0].id + "',updated_by='" + data[0].id + "' WHERE email = '" + req.body.email + "'";
                            //let sql1 = "UPDATE customer SET secretKey ='" + secret.base32 + "',2FA_status=1 WHERE email = '" + data[0].email + "'";
                            console.log(sql1)
                            connection.query(sql1, function(error, result) {
                                if (!error) {
                                    // console.log(data_url); // get QR code data URL
                                    res.json({ success: true, message: "2FA Authentication successfully" })
                                    //res.json({ success: true, data: data_url, secretKey: secret.base32 })
                                } else {
                                    res.json({ success: false, message: "2FA Authentication Failed", error: cm_cfg.errorFn(error) })

                                }

                            })

                        } else {
                            res.json({ success: false, message: "2FA Authentication Failed" })
                        }


                    }
                }
            })
        }
    })
}



exports.login = function(req, res) {
    var email = req.body.email;
    let sql = mysql.format("SELECT * FROM user WHERE email =?", email);

    connection.query(sql, function(error, data) {

        if (error) {
            //console.log(error)
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "Sign In Failed" })
        } else {
            //console.log(data)
            let sq = mysql.format("SELECT * FROM customer WHERE email =?", email);
            //console.log(sql)
            connection.query(sq, function(error, cusdata) {
                if (error) {
                    //console.log(error)
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {
                    if (data[0].user_type == 'C' && cusdata[0].status == 1) {

                        if(cusdata[0].login_counter > 4){
                          res.json({success: false, message: "Maximum login attempts reached. User access blocked."})
                        }
                        //console.log(cusdata[0].emailVerify)

                        else if (cusdata[0].otpVerify == 0 && req.body.device_name == "Mobile") {

                            res.json({ success: false, message: "OTP is not verified.Please verified your OTP" })
                        } else {
                            //
                            var password = bcrypt.compareSync("'" + req.body.password + "'", data[0].password)
                            console.log("pwd", password)

                            if (password == true ) {

                                stoken = {
                                    id: data[0].id,
                                    customer_id: cusdata[0].id,
                                    email: email,
                                    device_name: req.body.device_name
                                }
                                // console.log(stoken)

                                var token = jwt.sign(stoken, config.superSecret, { expiresIn: '7d' });

                                //let sql1 = "UPDATE customer SET token = '" + token + "', updated_at = '" + updated_at + "' WHERE email = '" + req.body.email + "'";
                                let sql1 = mysql.format("UPDATE customer SET token = ?, login_counter = 0 WHERE email = ?", [token, email]);
                                //console.log(sql1)
                                connection.query(sql1, function(error, result) {
                                    if (error) {
                                        res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                                    } else {
                                        var userData = {
                                            "lastLogin_timestamp": created_at(),
                                            "lastLogin_ip": req.body.device_ipAddress,
                                            "lastLogin_device": req.body.device_name,
                                            "lastLogin_browser": req.body.device_browser,
                                            "lastLogin_os": req.body.device_os
                                        }
                                        let sql2 = mysql.format("UPDATE user SET ? where email= ?", [userData, email])
                                        //console.log("cu", result)
                                        //let sql2 = "UPDATE user SET lastLogin_timestamp='" + updated_at + "',lastLogin_ip='" + ipAddress + "',lastLogin_device='" + dev + "',lastLogin_browser='" + browser + "' WHERE email='" + req.body.email + "';"
                                        //let sql2 = "UPDATE user SET lastLogin_timestamp='" + created_at + "',lastLogin_ip='" + req.body.device_ipAddress + "',lastLogin_device='" + req.body.device_name + "',lastLogin_browser='" + req.body.device_browser + "',lastLogin_os='" + req.body.device_os + "' WHERE email='" + req.body.email + "';"
                                        //console.log("sql2", sql2)
                                        connection.query(sql2, function(error, results) {
                                            if (!error) {
                                                var logData = {
                                                    "user_id": data[0].id,
                                                    "activity_description": 'Customer Login',
                                                    "activity_type": '011',
                                                    "device_ipAddress": req.body.device_ipAddress,
                                                    "device_os": req.body.device_os,
                                                    "device_name": req.body.device_name,
                                                    "device_browser": req.body.device_browser,
                                                    "created_at": created_at(),
                                                    "created_by": data[0].id,
                                                    "updated_by": data[0].id
                                                }


                                                let sql3 = mysql.format("INSERT INTO log SET ?", logData)
                                                //let sql3 = "INSERT INTO log (customer_id,activity_description,activity_type,created_at,updated_at,created_by,updated_by) SELECT id,'login','002','" + updated_at + "','" + updated_at + "',id,id FROM customer WHERE email='" + req.body.email + "';"
                                                //let sql3 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) SELECT id,'Customer Login','011','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at + "',id,id FROM user WHERE email='" + req.body.email + "';"
                                                //console.log("sql",sql3)
                                                connection.query(sql3, function(error, results) {
                                                    if (!error) {
                                                        if (req.body.device_name == 'Mobile') {
                                                            var verifyCode = ("" + Math.random()).substring(2, 7)
                                                            console.log(verifyCode)
                                                             let sql4 = mysql.format("UPDATE customer SET otp =? WHERE email = ?", [verifyCode, req.body.email]);
                                                            // console.log(sql2)
                                                            connection.query(sql4, function(error, result) {
                                                                if (error) {
                                                                    //console.log(error)
                                                                    res.json({ success: false, message: "Error",error: cm_cfg.errorFn(error) })
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
                                                                            res.json({ success: false, message: "Error",error: cm_cfg.errorFn(error) })
                                                                            console.log("mobile error", error)
                                                                        }
                                                                        //console.log('Message %s sent: %s', info.messageId, info.response);
                                                                        else {
                                                                            res.json({ success: true, message: "Otp sent successfully, Please enter otp to login in your account" })
                                                                            //res.json({ success: true, message: "otp is sent on your mail" })
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        } else {
                                                            if (cusdata[0].FA_status == 0) {
                                                               // console.log(result)
                                                             var defaultMsg = "Hello,"+cusdata[0].fullname+"<br> you have Successfully loggedin";

                                                             emailFn.sendEmail("dW126",cusdata[0].fullname,cusdata[0].email,undefined, undefined, undefined,undefined,defaultMsg,req.body.device_ipAddress,req.body.device_os,created_at()).then(function(res1) {
                                                                    res.json({ success: true, message: "login success", token: token, name: cusdata[0].fullname, FA_status: 0, kyc: cusdata[0].kyc_status })

                                                                    }).catch(function(err) {
                                                                    
                                                                       res.json({ success: false, message: "Error in mail sending",error: cm_cfg.errorFn(err) })
                                                                    })
                                                                 }
                                                                 else {
                                                                logtoken = {
                                                                    id: data[0].id,
                                                                    device_name: req.body.device_name
                                                                }
                                                                // console.log(stoken)

                                                                var logintoken = jwt.sign(stoken, common_config.login2FA, { expiresIn: 60 * 15 });

                                                                //let sql1 = "UPDATE customer SET token = '" + token + "', updated_at = '" + updated_at + "' WHERE email = '" + req.body.email + "'";
                                                                let sql1 = mysql.format("UPDATE customer SET loginToken = ? WHERE email = ?", [logintoken, email]);
                                                                //console.log(sql1)
                                                                connection.query(sql1, function(error, result) {
                                                                    if (error) {
                                                                        res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                                                                    } else {

                                                                        res.json({ success: true, message: "login success", logintoken: logintoken, FA_status: 1, kyc: cusdata[0].kyc_status})
                                                                    }
                                                                })
                                                            }

                                                        }
                                                    } else {
                                                        //console.log(error)
                                                        res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                                                    }
                                                })

                                            } else {
                                                
                                                res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })

                                            }

                                        })
                                    }
                                })
                            } else {
                              connection.query("UPDATE customer SET login_counter = login_counter+1 WHERE email = ?", [email], (err, result)=>{
                                if(err)
                                  res.json({ success: false, message: "Sign In Failed", error: cm_cfg.errorFn(err) })
                                else{
                                  let loginAttemptsLeft = 4 - cusdata[0].login_counter;

                                  res.json({success: false, message: 'Sign In Failed.', attempts: loginAttemptsLeft})
                                }
                              })
                            }
                        }

                    } else {
                        res.json({ success: false, message: "Sign In Failed" })
                    }
                }
            })
        }

    })
}


exports.loginVerifyCode = function(req, res) {

    jwt.verify(req.body.token, common_config.login2FA, function(err, checktoken) {
        if (err) {
            console.log(err)
            res.send({ status: -2, success: false, message: 'Token expired.', error: cm_cfg.errorFn(err) })
        } else {
            var tok = req.body.token

            let sql = mysql.format("SELECT*FROM customer WHERE loginToken =?", tok);
            //console.log(sql)
            connection.query(sql, function(error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {

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
                            //window: 1
                        });
                        //console.log(verified);

                        if (verified === true) {
                            console.log("set otp verify")
                            var defaultMsg = "Hi," + data[0].fullname + "<br> you have Successfully logged in to your Fuleex account from <br/>IP " + req.body.device_ipAddress + "<br/>Device " + req.body.device_name + " <br/>Time " + created_at() + " ";
                            emailFn.sendEmail("dW126", data[0].fullname, data[0].email, undefined, undefined, undefined, undefined, defaultMsg, req.body.device_ipAddress, req.body.device_name, moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"))
                            res.json({ success: true, message: "2FA Authentication successfully", token: data[0].token })
                        } else {
                            res.json({ success: false, message: "2FA Authentication Failed" })
                        }


                    }
                }
            })
        }
    })
}

exports.loginVerifyOTP = function(req, res) {
    jwt.verify(req.body.token, common_config.login2FA, function(err, checktoken) {
        if (err) {
            console.log(err)
            res.send({ status: -2, success: false, message: 'Token expired.', error: cm_cfg.errorFn(err) })
        } else {
            var tok = req.body.token

            let sql = mysql.format("SELECT*FROM customer WHERE loginToken =?", tok);
            //console.log(sql)
            connection.query(sql, function(error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else {

                    if (data[0] == null || data[0] == undefined) {

                        res.json({ success: false, message: "User notsdfsdfsdf found" })
                    } else {
                        //console.log(data[0].secretKey)
                        mobileOTP.verifyOTP(null, req.body.otp, data[0].email).then((verified) => {

                            console.log("verifiedverifiedverified");
                            console.log(verified);

                            if (!verified) {

                                res.json({ success: false, message: 'OTP In currect' })
                            } else {
                                var defaultMsg = "Hi," + data[0].fullname + "<br> you have Successfully logged in to your Fuleex account from <br/>IP " + req.body.device_ipAddress + "<br/>Device " + req.body.device_name + " <br/>Time " + created_at() + " ";
                                emailFn.sendEmail("dW126", data[0].fullname, data[0].email, undefined, undefined, undefined, undefined, defaultMsg, req.body.device_ipAddress, req.body.device_name, moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"))
                                //res.json({ success: true, message: "2FA Authentication successfully", })
                                res.json({ success: true, message: 'OTP verify successfully', token: data[0].token })
                            }
                        }).catch((err) => {
                            res.json({ success: false, message: 'In correct Mobile OTP', })
                        });


                    }
                }
            })
        }
    })
}


exports.email = function(req, res) {
    var email = req.body.email;
    let sql1 = mysql.format("SELECT * FROM customer WHERE email =?", email);
    connection.query(sql1, function(error, result) {
        if (error) {
            console.log(error)
        } else if (result[0] == null) {
            res.json({ success: false, message: "We have received your request. If your email exists, you will get a confirmation email to reset login password." })
        } else {
            // host = req.get('host');
            let name = result[0].fullname;

            stoken = { email: req.body.email }
            // console.log(stoken)
            var token = jwt.sign(stoken, config.superSecret, { expiresIn: 60 * 30 });
            console.log(token)

            link = config.globalDomain + "/forgotPassword?token=" + token;
            //link = req.get('host') + "/#/emailVerify/?id=" + result[0].id;


            var updatedDate = {
                "forgotToken": token
            }

            let sql7 = mysql.format("UPDATE customer SET ? WHERE email =?", [updatedDate, email]);

            connection.query(sql7, function(error, result) {
                if (error) {
                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) })
                } else {

                    /*
                                        let mailOptions = {
                                            from: 'Fuleex Exchange<' + config.email + '>', // sender address
                                            to: req.body.email, // list of receivers
                                            subject: 'Forgot Password', // Subject line
                                            text: '',
                                            html: "Hello,<br> Please Click on the link to confirm your forgot password request.<br><a href=" + link + ">Click here to verify</a>" // html body
                                        };


                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log("jkjkj", error);
                        }
                        //console.log('Message %s sent: %s', info.messageId, info.response);
                        else {
                            res.json({ success: true, message: "Forgot password mail sent" })
                        }
                    });
                    */
                    var defaultMsg = "Hello,<br> Please Click on the link to confirm your forgot password request.<br><a href=" + link + ">Click here to verify</a>";
                    emailFn.sendEmail('FORGOT_PASSWORD_LINK', name, req.body.email, link, undefined, undefined, undefined, defaultMsg).then(function(res1) {

                        res.json({ success: true, message: "We have received your request. If your email exists, you will get a confirmation email to reset login password." })
                    }).catch(function(err) {

                        res.json({ success: false, message: "Error in mail sent", error: cm_cfg.errorFn(err) })
                    })
                }
            })
        }
    })
}


exports.forgotPassword = function(req, res) {

    jwt.verify(req.body.token, config.superSecret, function(err, checktoken) {
        if (err) {
            //console.log(err)
            res.json({ success: false, message: 'Token expired.', error: cm_cfg.errorFn(err) })
        } else {
            var tok = req.body.token
            let sql = mysql.format("SELECT * FROM customer WHERE forgotToken =?", tok);
            // console.log(sql)
            connection.query(sql, function(error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                } else if (data[0] == null || data[0] == undefined) {

                    res.json({ success: false, message: "User not found" })
                } else {

                    var newPassword = bcrypt.hashSync("'" + req.body.password + "'", salt);

                    let sql1 = mysql.format("UPDATE user SET password = ? WHERE id = ?", [newPassword, data[0].created_by]);
                    // console.log(sql1)
                    connection.query(sql1, function(error, result) {
                        if (error) {
                            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                        } else {

                            var logData = {
                                "user_id": data[0].created_by,
                                "activity_description": 'Customer Forgot Password',
                                "activity_type": '061',
                                "device_ipAddress": req.body.device_ipAddress,
                                "device_os": req.body.device_os,
                                "device_name": req.body.device_name,
                                "device_browser": req.body.device_browser,
                                "created_at": created_at(),
                                "created_by": data[0].created_by,
                                "updated_by": data[0].created_by
                            }


                            let sql2 = mysql.format("INSERT INTO log SET ?", logData)



                            //let sql2 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) SELECT id,'Customer Forgot Password','061','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at + "',id,id FROM user WHERE id='" + data[0].created_by + "';"
                            //console.log("sql",sql2)
                            connection.query(sql2, function(error, results) {
                                if (!error) {
                                    let cus_sql1 = mysql.format("UPDATE customer SET forgotToken = 'NULL' WHERE email = ?", [data[0].email]);
                                    //console.log(sql1)
                                    connection.query(cus_sql1, function(error, cusresult) {
                                        if (error) {
                                            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
                                        } else {

                                            var defaultMsg = "Hello,<br>Your password has been successfully changed.<br>";
                                            emailFn.sendEmail('FORGOT_PASSWORD', data[0].fullname, data[0].email, undefined, undefined, undefined, undefined, defaultMsg).then(function(res1) {
                                                res.json({ success: true, message: "Password Reset Successfully" })
                                            }).catch(function(err) {
                                                res.json({ success: true, message: "Error in mail sent" })
                                            })

                                            // emailFn.sendEmail('forgot_password', data[0].name, data[0].email).then(function(res1) {
                                            //     res.json({ success: true, message: "Password Reset Successfully" })
                                            // }).catch(function(err) {
                                            //     res.json({ success: true, message: "Error in mail sent" })
                                            // })

                                            /*
                                                                                            let mailOptions = {
                                                                                                from: 'Fuleex Exchange<' + config.email + '>', // sender address
                                                                                                to: data[0].email, // list of receivers
                                                                                                subject: 'Forget Password Success', // Subject line
                                                                                                text: '',
                                                                                                html: "Hello,<br>Your password has been successfully changed.<br>" // html body
                                                                                            };


                                                                                            transporter.sendMail(mailOptions, (error, info) => {
                                                                                                if (error) {
                                                                                                    res.json({ success: true, message: "Error in mail sent" })
                                                                                                }
                                                                                                //console.log('Message %s sent: %s', info.messageId, info.response);
                                                                                                res.json({ success: true, message: "Password Reset Successfully" })
                                                                                            });
                                                                                            */

                                        }

                                    })
                                } else {
                                    res.json({ success: true, message: "Error" })
                                }

                            })
                        }
                    })

                }

            })
        }
    })
}


exports.cheakToken = function(req, res) {

    jwt.verify(req.body.token, config.superSecret, function(err, checktoken) {
        if (err) {
            res.status(401).send({ status: -2, success: false, message: 'Token expired.' })
        } else {
            res.json({ success: true, message: "Token found" })
        }
    })
}


exports.checkAndVerifyEmailToken = function(req, res) {

    jwt.verify(req.body.token, config.superSecret, function(err, checktoken) {
        if (err) {
            res.status(401).send({ status: -2, success: false, message: 'Token has been expired.' })
        } else {
            AllUserPromise = new Model.Customer().where({ emailVerify: 0 }).where({ emailToken: req.body.token }).
            fetchAll({
                withRelated: ['user'],
                columns: ['id', 'email']
            });
            AllUserPromise.then(function(customer) {
                if (customer.length == 0) {
                    res.send({ status: -2, success: false, message: 'Invalid or email verification link has been expired.' })
                } else {

                    var custdata = customer.toJSON();
                    var customerid = custdata[0]['id'];
                    stoken = {
                        id: custdata[0]['user']['id'],
                        email: custdata[0]['email'],
                    }

                    var token = jwt.sign(stoken, config.superSecret, { expiresIn: '7d' });

                    CustomerModel = new Model.Customer({ id: customerid });
                    var params = { 'emailVerify': 1, 'token': token }
                    CustomerModel.save(params, { method: 'update', patch: true }).then(function(model) {
                        res.json({ success: true, message: 'Email verify successfully', token: token });
                    }).catch(function(err) {
                        res.send({ status: -2, success: false, message: 'Invalid or email verification link expiredss.' })
                    });
                    //res.json({ success: true, message: "Token found" })
                }
            }).catch(function(err) {
                console.log(err);
                res.send({ status: -2, success: false, message: 'Invalid or email verification link expireds.' })
            });
        }
    })

}

exports.code = function(req, res) {

    var secret = "LMRSS6SSFRGTSYR2JF2EE32XKBDC6KJG"

    var token = speakeasy.totp({
        secret: secret,
        encoding: 'base32'
    });
    res.send(token);
}
