const mysql = require('mysql');
const connection = require('../../../config/db');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const common_config = require('../../../config/common_config');
const config = require('../../../config/config')
const jwt = require('jsonwebtoken');

exports.checkTokenConfig = function(req, res, next){
  let token = req.body.logintoken||req.headers.logintoken;
  jwt.verify(token, common_config.config2FA, function (err, decoded) {
      if (err) {
          res.status(401).send({status: -2, message: 'Failed to authenticate token.'})
          res.end();
      } else {
        req.decoded = decoded;
        next();
      }
    })
}

exports.getQRCode = function(req, res) {
    let user_id = req.decoded.id;
    let email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM admin WHERE user_id =?" ,[user_id]);
    //console.log(sql)
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else {

            if (!data[0]) {
                res.json({ success: false, message: "User not found" })
            } else {

                var secret = speakeasy.generateSecret({ length: 20, name: "exchange(" + email + ")" });
                //console.log(secret.base32); // secret of length 20

                QRCode.toDataURL(secret.otpauth_url, function(err, data_url) {
                    if (err) {
                        res.json({ success: false, message: "error", err })

                    } else {
                        var updateDate = {
                            "secretKey": secret.base32,

                        }

                        let sql1 = mysql.format("UPDATE admin SET ? WHERE user_id=?", [updateDate, data[0].user_id]);

                        //let sql1 = "UPDATE customer SET secretKey ='" + secret.base32 + "', updated_at = '" + updated_at + "',created_by ='" + data[0].id + "',updated_by='" + data[0].id + "' WHERE email = '" + req.body.email + "'";
                        //let sql1 = "UPDATE customer SET secretKey ='" + secret.base32 + "',2FA_status=1 WHERE email = '" + data[0].email + "'";
                        //console.log(sql1)
                        connection.query(sql1, function(error, result) {
                            if (!error) {
                                // console.log(data_url); // get QR code data URL

                                res.json({ success: true, data: data_url, secretKey: secret.base32 })
                            } else {

                                res.json({ success: false, message: "Error", error })
                            }

                        })
                    }

                })
            }
        }
    })
}

exports.setFaStatus = function(req, res) {

    let user_id = req.decoded.id;
    let email = req.decoded.email;
    let sql = `SELECT * FROM admin WHERE user_id = ${user_id}`;
    //console.log(sql)
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            if (data[0].FA_status == 0 && req.body.status == 0) {
                res.json({ success: false, message: "Already Disable" })
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
                // console.log(verified);

                if (verified === true) {

                    if (req.body.status == 0) {

                        var updatedDate = {
                            "FA_status": 0,
                            "secretKey": null
                        }

                        let status_sql = mysql.format("UPDATE admin SET ? WHERE user_id =?", [updatedDate, user_id]);
                        connection.query(status_sql, function(error, result) {
                            if (error) {
                                res.json({ success: false, message: "Error" })
                            } else {

                                res.json({ success: true, message: "2FA Disable successfully" })
                            }
                        })
                    } else if (req.body.status == 1) {


                        var updateDate = {

                            "FA_status": 1
                        }

                        let status_sql = mysql.format("UPDATE admin SET ? WHERE user_id =?", [updateDate, user_id]);
                        connection.query(status_sql, function(error, result) {
                            if (error) {
                                res.json({ success: false, message: "Error" })
                            } else {
                              let token = jwt.sign({id: req.decoded.id, email: req.decoded.email}, config.superSecret, {expiresIn: '7d'});
                                res.json({ success: true, message: "2FA Enable successfully", token})
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

exports.loginVerifyCode = function(req, res) {
    // console.log("req body is ", req.body)
  let loginToken = req.body.logintoken?req.body.logintoken:req.headers.logintoken;
  jwt.verify(loginToken, common_config.login2FA, function (err, decoded) {
      if (err) {
          res.status(401).send({status: -2, message: 'Failed to authenticate token.'})
          res.end();
      }
      else {
        let user_id = decoded.id;
        //console.log(sql)
        let sql = mysql.format("SELECT*FROM admin WHERE user_id =?", user_id);
        connection.query(sql, function(error, data) {
            if (error) {
                res.json({ success: false, message: "error", error })
            } else {

                if (!data[0]) {

                    res.json({ success: false, message: "User not found" })
                } else {
                    //console.log(data[0].secretKey)

                    var secret = data[0].secretKey;

                    var token = speakeasy.totp({
                        secret: secret,
                        encoding: 'base32'
                    });
                    // console.log(token);
                    var verifyCode = req.body.verifyCode;

                    //var verifyCode = req.body.verifyCode

                    var verified = speakeasy.totp.verify({
                        secret: secret,
                        encoding: 'base32',
                        token: verifyCode
                        //window: 1
                    });
                    //console.log(verified);

                    if (verified === true) {
                        let token = jwt.sign({id: decoded.id, email: decoded.email}, config.superSecret, {expiresIn: '7d'});
                        res.json({ success: true, message: "2FA Authentication successfully", token})
                    } else {
                        res.json({ success: false, message: "2FA Authentication Failed" })
                    }


                }
            }
        })
      }
    })
}

exports.verify2FACode =(email, token)=>{
    console.log("email", email);
        let sql = "SELECT*FROM user WHERE email ='" + email+ "'";
           return new Promise((resolve, reject)=>{
              connection.query(sql, function(error, adminDetails) {
                if(error)
                    reject(error)
                else{

                    let sql2 ="SELECT*FROM admin WHERE user_id ='" + adminDetails[0].id+ "'";
                     connection.query(sql2, function(error, data) {
                            var secret = data[0].secretKey
                            var userToken = token;
                            var verified = speakeasy.totp.verify({
                                    secret: secret,
                                    encoding: 'base32',
                                    token: userToken
                                //window: 1
                                });
                            if (verified === true) {
                                    resolve(true)
                            } else {
                                resolve(false);
                            }

                     })
                    
                    
                }
             })

           })

}
