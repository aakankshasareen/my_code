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
var cm_cfg = require('../../../config/common_config');
const jwtBlacklist = require('jwt-blacklist')(jwt);
http = require('http'),
https = require('https');

var BlockIo = require('block_io');
var version = config.bitcoin_version;

var block_io = new BlockIo(config.bitcoin_apiKey, config.bitcoin_pin, version);

var ltc_block_io = new BlockIo(config.litecoin_apiKey, config.bitcoin_pin, version);

var doge_block_io = new BlockIo(config.dogecoin_apiKey, config.bitcoin_pin, version);


function created_at() {
    var created = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return created;
}

// generate block.io addresses when kyc is completed by email
exports.generateBlockIOAddress = function(req, res, email_id) {
    
    sql = 'SELECT customer.id, user.id as user_id, user.plain_password, user.email, customer.fullname,customer.mobileNumber, user.member_id FROM `customer` join user on user.email = customer.email where customer.email = ?';
    console.log(sql);
    connection.query(sql, [email_id], function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else {
            console.log(data[0]);
            createBlockIOAddresses(data[0]);
            createImatrixAndWebWallet(data[0]);
        }
    });
};


// create block.io address fro user by user id and customer id
function createBlockIOAddresses(customer_data) {
    
    return btcaddresscreation(customer_data).then(function(addbtc) {
        return dogeaddresscreation(customer_data);
    }).then(function(addbtc) {                    
       return ltcaddresscreation(customer_data);
    }).then(function(addbtc) {
       console.log("addresses generated for user id "+customer_data.user_id);
    })
}



 function btcaddresscreation(customer_data) {
        //console.log(customerId)
        return new Promise(function(resolve, reject) {

            let sql1 = mysql.format("Select * from user_crypto_address where user_id=? and crypto_type='BTC'", [customer_data.user_id]);
            //console.log(sql1)
            connection.query(sql1, function(error, adddata) {
                if (error) {
                    console.log(error)
                    reject(error)
                } else if (adddata[0] == null || adddata[0] == undefined) {

                    var label = customer_data.user_id

                    //console.log("label", label)


                    block_io.get_new_address({}, function(error, addr) {
                        if (error) {
                            console.log(error)
                            reject(error)

                        } else {


                            //  console.log(addr)
                            //console.log(cusdata)

                            var addressData = {
                                "user_id": customer_data.user_id,
                                "crypto_address": addr.data.address,
                                "crypto_type": 'BTC',
                                "created_at": created_at(),
                                "label": addr.data.label
                            };

                            let sql3 = mysql.format("INSERT INTO user_crypto_address SET ?", addressData)
                            //let sql1 = "INSERT INTO user_crypto_address (user_id,crypto_address,crypto_type,created_at) values('" + customerId + "','" + addr + "','BTC','" + created_at + "')"
                            
                            connection.query(sql3, function(error, results) {
                                if (!error) {
                                    
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

    function ltcaddresscreation(customer_data) {
        //console.log(customerId)
        return new Promise(function(resolve, reject) {

            let sql1 = mysql.format("Select * from user_crypto_address where user_id=? and crypto_type='LTC'", [customer_data.user_id]);
            //console.log(sql1)
            connection.query(sql1, function(error, adddata) {
                if (error) {
                    console.log(error)
                    reject(error)
                } else if (adddata[0] == null || adddata[0] == undefined) {

                    var label = customer_data.user_id;

                    ltc_block_io.get_new_address({}, function(error, addr) {
                        if (error) {
                            console.log(error)
                            reject(error)
                            //res.json({ success: false, message: "ltc error", error: error })
                        } else {

                            var addressData = {
                                "user_id": customer_data.user_id,
                                "crypto_address": addr.data.address,
                                "crypto_type": 'LTC',
                                "created_at": created_at(),
                                "label": addr.data.label
                            };

                            let sql3 = mysql.format("INSERT INTO user_crypto_address SET ?", addressData)
                            connection.query(sql3, function(error, results) {
                                if (!error) {
                                   
                                    resolve(results)
                                } else {
                                    // console.log(error)
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

    function dogeaddresscreation(customer_data) {
        //console.log(customerId)       
        return new Promise(function(resolve, reject) {

            let sql1 = mysql.format("Select * from user_crypto_address where user_id=? and crypto_type='DOGE'", [customer_data.user_id]);
            //console.log(sql1)
            connection.query(sql1, function(error, adddata) {
                if (error) {
                    console.log(error)
                    reject(error)
                } else if (adddata[0] == null || adddata[0] == undefined) {

                    var label = customer_data.user_id;
                    console.log("label", label)


                    doge_block_io.get_new_address({}, function(error, addr) {
                        if (error) {
                            console.log(error)
                            reject(error)
                            //res.json({ success: false, message: "DOGE error", error: error })
                        } else {


                            //  console.log(addr)
                            //console.log(cusdata)

                            var addressData = {
                                "user_id": customer_data.user_id,
                                "crypto_address": addr.data.address,
                                "crypto_type": 'DOGE',
                                "created_at": created_at(),
                                "label": addr.data.label
                            };

                            let sql3 = mysql.format("INSERT INTO user_crypto_address SET ?", addressData)
                            //let sql1 = "INSERT INTO user_crypto_address (user_id,crypto_address,crypto_type,created_at) values('" + customerId + "','" + addr + "','BTC','" + created_at + "')"
                            // console.log("sql", sql3)
                            connection.query(sql3, function(error, results) {
                                if (!error) {
                                    
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
    
    // api to push in imatrix and web wallet when kyc completed

function createImatrixAndWebWallet(customer_data) {    
    return createImatrixWallet(customer_data).then(function(result_data) {
        return createWebWallet(customer_data);
    }).catch((err)=>{
        console.log(err);
    });    
}


// api to push in imatrix when kyc completed

function createImatrixWallet(customer_data) {
    
    var member_id = customer_data.member_id;    
    return new Promise(function(resolve, reject) {
        var request = require('request');
        // Set the headers
        var headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'charset': 'UTF-8'
        }
        
        console.log("in imatrix wallet creation");
        var api_url = "https://secure4.office2office.com/designcenter/api/imx_api_call.asp?APIACTION=SIGNUPORDER&DATATYPE=XML&CL=cmd&LC=12013&API=Hy583Gy3r6TGuh4tg&LIVE=Y&USER="+member_id+"&ACTION=O&ORDERITM1=KYC&ORDERQTY1=1&PAYMENT=99";
        console.log(api_url);
        // Configure the request
        var options = {
            url: api_url,
            method: 'GET',
            headers: headers,
            json: true,
            body: {'kyc_status' : 2, 'comment':'Approved'}
        };
        // Start the request
        request(options, function(error, response) {
            if (!error) {
                var insertData = {
                    "email": customer_data.email,
                    "member_id": member_id,
                    "response": response.body
                }

                let insert_log_sql = mysql.format("insert into imatrix_credit_wallet_response SET ?", insertData);
                connection.query(insert_log_sql, function(error, dta) {
                   resolve("sent and inserted error");
                });
                
                resolve("sent");
            } else {                
                resolve("sent but error");
            }
        });
    });
}


function createWebWallet(customer_data) {
    var member_id = customer_data.member_id;
    return new Promise(function(resolve, reject) {
        var request = require('request');
        // Set the headers
        var headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'charset': 'UTF-8'
        }

        // Configure the request
        var options = {
            url: "https://wallet.coinmd.io/api",
            method: 'PUT',
            headers: headers,
            json: true,
            body: {'access_key' : 'toj9Geithuco2aDei7kash3ru', 'username': customer_data.fullname, 'password' : customer_data.plain_password, 'email':customer_data.email, 'contact': customer_data.mobileNumber}
        };
        // Start the request
        request(options, function(error, response) {
            if (!error) {                
                var is_success = 0;
                if(!response.body.error) {
                    var is_success = 1;
                }
                if(response.body == undefined || response.body.error == undefined) {
                    var is_success = 0;
                }
                var insertData = {
                    "email": customer_data.email,
                    "member_id": member_id,
                    "response": JSON.stringify(response.body),
                    "success": is_success
                }

                let insert_log_sql = mysql.format("insert into web_wallet_response SET ?", insertData);
                connection.query(insert_log_sql, function(error, dta) {
                   resolve("sent and inserted error");
                });
                resolve("sent");
            } else {                
                resolve("sent to web wallet");
            }
        });
    });
}
