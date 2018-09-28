var connection = require('../../../config/db');
var config = require('../../../config/config');
var wallet = require('../../../config/wallet');
var moment = require('moment');
var bitcoin = require('bitcoin');
var QRCode = require('qrcode')
var mysql = require('mysql');
var request = require('request');

function created_at() {
   var  created = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
         return created;
    }

var bch_client = new bitcoin.Client({
    host: config.bch_host,
    port: config.bch_port, // ipc port number
    user: config.bch_user,
    pass: config.bch_pass,
    timeout: 30000
});



exports.bchUserAccount = function(req, res) {
    // console.log(req.decoded)
    let sql = "SELECT email,id FROM user WHERE email ='" + req.decoded.email + "'";
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
             console.log(data)
            let sql1 = "SELECT * FROM user_crypto_address WHERE user_id ='" + data[0].id + "'AND crypto_type='BCH'";
            // console.log(sql1)
            connection.query(sql1, function(error, dta) {
                if (error) {
                    res.json({ success: false, message: "error", error })

                } else if (dta[0] == null || dta[0] == undefined) {
                    res.json({ success: false, message: "BCH address is not created" })
                } else {
                    //  console.log(dta[0].crypto_address)

                    QRCode.toDataURL(dta[0].crypto_address, function(err, url) {
                        if (err) {
                            //  console.log(err)
                            res.json({ success: false, message: "error", error })
                        } else {
                            // console.log(url)
                            res.json({ success: true, data: url, address: dta[0].crypto_address })
                        }
                    })
                }
            })
        }
    })
}

// exports.bchBalance = async function(req, res) {
//   try{
//     let data = await queryDB(`SELECT * FROM customer WHERE token = '${req.headers.token}'`)

//     if(!data.results.length)
//       throw {ecode: 1, message: 'User not found'}

//     let exchangeAddress = await queryDB(`SELECT * FROM exchange_crypto_address WHERE crypto_type='BCH'`)

//     if(!exchangeAddress.results.length)
//       throw {ecode: 1, message: 'exchange address is not created'}

//     let dta = await queryDB(`SELECT * FROM user_crypto_address WHERE user_id ='${data.results[0].created_by}' AND crypto_type='BCH'`)

//     if(!dta.results.length)
//       throw {ecode: 1, message: 'BCH address is not created'}

//     let newBalance = await new Promise((resolve, reject)=>{
//       client.getBalance(data.results[0].email, 1, function(err, newBalance) {
//         if(err)
//           return reject(err)
//         resolve(newBalance)
//       })
//     })

//     let bal = await queryDB(`SELECT * FROM master_customer_wallet WHERE customer_id ='${data.results[0].id}' AND currency_code='BCH'`)

//     if(!bal.results.length){
//       await queryDB(`INSERT INTO master_customer_wallet (customer_id,total_amount,currency_code,created_at) VALUES ('${data.results[0].id}','${newBalance}','BCH','${created_at()}')`)
//       await queryDB(`UPDATE customer_wallet SET total_amount = '${newBalance}' WHERE customer_id='${data.results[0].id}' AND currency_code='BCH'`)
//       await queryDB(`INSERT INTO customer_deposite (customer_id,amount,currency_code,created_at,status) VALUES ('${data.results[0].id}','${newBalance}','BCH','${created_at()}',1)`)

//       if(newBalance>0){
//         await queryDB(`INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by)
//         VALUES ('${data.results[0].created_by}','money BCH added to wallet','041','${req.body.device_ipAddress}','${req.body.device_os}', '${req.body.device_name}','${req.body.device_browser}', '${created_at()}','${data.results[0].created_by}','${data.results[0].created_by}')`)

//         try{
//           await wallet.bchTransferEntireBalance(data.results[0].email, newBalance, exchangeAddress.results[0].crypto_address)
//         } catch(err){
//           cm_cfg.errorFn(err)
//           throw {ecode: 1, "tranhash error"}
//         }

//         return res.json({ success: true, message: "money added to wallet" })
//       }

//       return res.json({ success: false, message: "new balance is 0" })
//     }

//     if(bal.results[0].total_amount === newBalance)
//       return res.json(success: true, message: "already updated")

//     if(newBalance < bal[0].total_amount){
//       await queryDB(`UPDATE master_customer_wallet SET total_amount ='${newBalance}' WHERE customer_id='${data.results[0].id}' AND currency_code='BCH'`)
//       return res.json(success: true, message: "original balance change")
//     }

//     let vTotalBalance = bal[0].total_amount + newBalance
//     await queryDB(`UPDATE master_customer_wallet SET total_amount ='${newBalance}' WHERE customer_id='${data.results[0].id}' AND currency_code='BCH'`)
//     await queryDB(`UPDATE customer_wallet SET total_amount ='${vTotalBalance}' WHERE customer_id='${data[0].results[0].id}' AND currency_code='BCH'`)
//     await queryDB(`INSERT INTO customer_deposite (customer_id,amount,currency_code,created_at,status) VALUES ('${data.results[0].id}','${vTotalBalance}','BCH','${created_at()}',1)`)

//     await queryDB(`INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by)
//     VALUES ('${data.results[0].created_by}','money BCH added to wallet','041','${req.body.device_ipAddress}','${req.body.device_os}', '${req.body.device_name}','${req.body.device_browser}', '${created_at()}','${data.results[0].created_by}','${data.results[0].created_by}')`)

//     try{
//       await wallet.bchTransferEntireBalance(data.results[0].email, newBalance, exchangeAddress.results[0].crypto_address)
//     } catch(err){
//       cm_cfg.errorFn(err)
//       throw {ecode: 1, "tranhash error"}
//     }

//     return res.json({ success: true, message: "money added to wallet" })

//   } catch(err){
//     if(err.ecode)
//       return res.json({success: false, message: err.message})
//     res.json({success: false, message: 'Error', error: err})
//   }
// }

exports.bchDepositHistory = function(req, res) {

    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);

    console.log(sql)
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            client.listTransactions(email, function(error, tran) {
                if (error) {
                    console.log("newbalace", error)
                } else {
                    //             var timestamp = moment.unix(1515565306);
                    // console.log( timestamp.format("dd/mm/yyyy") );
                    res.json({ success: true, data: tran })
                }
            })
        }
    })
}

// function queryDB(query){
//   return new Promise((resolve, reject)=>{
//     connection.query(query, (err, results, fields)=>{
//       if(err)
//         return reject(err)
//       resolve({results, fields})
//     })
//   })
// }


exports.bchBalance = function(req, res) {
    var newBalance = 0;
    var email = req.decoded.email

    let sql = mysql.format('SELECT * FROM customer WHERE email =?', [email]);
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            //console.log(data)
            let sq = "SELECT * FROM exchange_crypto_address WHERE crypto_type='BCH'";
            connection.query(sq, function(error, exchangeAddress) {
                if (error) {
                    res.json({ success: false, message: "error", error })

                } else if (exchangeAddress[0] == null || exchangeAddress[0] == undefined) {
                    res.json({ success: false, message: "exchange addressis not created", error })

                } else {
                    let sql1 = "SELECT * FROM user_crypto_address WHERE user_id ='" + data[0].created_by + "'AND crypto_type='BCH'";
                    //console.log(sql1)
                    connection.query(sql1, function(error, dta) {
                        if (error) {
                            res.json({ success: false, message: "error", error })

                        } else if (dta[0] == null || dta[0] == undefined) {
                            res.json({ success: false, message: "BCH address is not created" })
                        } else {
                            //console.log(dta[0].crypto_address)

                            //client.getBalance(data[0].email, 1, function(error, newBalance) {

                                // change in label
                            console.log("label",req.decoded.email)
                            bch_client.getBalance(data.results[0].email, 1, function(err, newBal) {
                                if (error) {
                                    console.log("newbalace", error)
                                } else {

                                    newBalance = newBal.data.available_balance;
                                    console.log("newBalance", newBalance)


                                    let sql2 = "SELECT * FROM master_customer_wallet WHERE customer_id ='" + data[0].id + "'AND currency_code='BCH'";
                                    //console.log(sql2)
                                    connection.query(sql2, function(error, bal) {
                                        if (error) {
                                            res.json({ success: false, message: "error", error })

                                        } else if (bal[0] == null && newBalance > 0 || bal[0] == undefined && newBalance > 0) {
                                            //console.log("bal", bal)
                                            // console.log(dta[0].crypto_address)
                                            let sql3 = "INSERT INTO master_customer_wallet (customer_id,total_amount,currency_code,created_at) VALUES ('" + data[0].id + "','" + newBalance + "','BCH','" + created_at() + "')";
                                            connection.query(sql3, function(error, bal) {
                                                if (error) {
                                                    res.json({ success: false, message: "error", error })

                                                } else {
                                                    let sql4 = "UPDATE customer_wallet SET total_amount ='" + newBalance + "' WHERE customer_id='" + data[0].id + "'AND currency_code='BCH'";
                                                    // let sql4 = "INSERT INTO customer_wallet (customer_id,total_amount,currency_code,created_at) VALUES ('" + data[0].id + "','" + newBalance + "','BCH','" + created_at + "')";
                                                    // console.log("query", sql3)
                                                    connection.query(sql4, function(error, final) {
                                                        if (error) {
                                                            res.json({ success: false, message: "error", error })
                                                        } else {
                                                            let sql5 = "INSERT INTO customer_deposite (customer_id,amount,currency_code,created_at,status) VALUES ('" + data[0].id + "','" + newBalance + "','BCH','" + created_at() + "',1)";
                                                            //console.log("sql", sql4)
                                                            connection.query(sql5, function(error, ress) {
                                                                if (error) {
                                                                    res.json({ success: false, message: "error", error })
                                                                } else {

                                                                    let sql6 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) VALUES ('" + data[0].created_by + "','money BCH added to wallet','005','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at() + "','" + data[0].created_by + "','" + data[0].created_by + "')";
                                                                    //console.log(sql6)
                                                                    connection.query(sql6, function(error, results) {
                                                                        if (error) {
                                                                            res.json({ success: false, message: "error", error })
                                                                        } else {

                                                                            // console.log("call wallet function")
                                                                            // var walletdata = wallet.bchTransferEntireBalance(data[0].email, newBalance, exchangeAddress[0].crypto_address)
                                                                            // walletdata.then(function(data) {
                                                                            //     console.log("transhash", data)
                                                                            //     res.json({ success: true, message: "money added to wallet" })
                                                                            // }, function(err) {
                                                                            //     res.json({ message: "tranhash error", error: err })
                                                                            // })
                                                                            res.json({ success: true, message: "BCH added" })

                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    }) //4
                                                }

                                            }) //3
                                        } else if (bal[0] == null && newBalance == 0 || bal[0] == undefined && newBalance == 0) {
                                            console.log("bal", bal)
                                            console.log(dta[0].crypto_address)
                                            let sql3 = "INSERT INTO master_customer_wallet (customer_id,total_amount,currency_code,created_at) VALUES ('" + data[0].id + "','" + newBalance + "','BCH','" + created_at() + "')";
                                            connection.query(sql3, function(error, bal) {
                                                if (error) {
                                                    res.json({ success: false, message: "error", error })

                                                } else {
                                                    let sql4 = "UPDATE customer_wallet SET total_amount ='" + newBalance + "' WHERE customer_id='" + data[0].id + "'AND currency_code='BCH'";
                                                    // let sql4 = "INSERT INTO customer_wallet (customer_id,total_amount,currency_code,created_at) VALUES ('" + data[0].id + "','" + newBalance + "','BCH','" + created_at + "')";
                                                    //console.log("query", sql3)
                                                    connection.query(sql4, function(error, final) {
                                                        if (error) {
                                                            res.json({ success: false, message: "error", error })
                                                        } else {
                                                            let sql5 = "INSERT INTO customer_deposite (customer_id,amount,currency_code,created_at,status) VALUES ('" + data[0].id + "','" + newBalance + "','BCH','" + created_at() + "',1)";
                                                            // console.log("sql", sql4)
                                                            connection.query(sql5, function(error, ress) {
                                                                if (error) {
                                                                    res.json({ success: false, message: "error", error })
                                                                } else {
                                                                    res.json({ success: false, message: "New balance is 0" })
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        } else {
                                            //console.log(bal)
                                            if (newBalance == bal[0].total_amount) {
                                                res.json({ success: true, message: "Already updated" })
                                            } else if (newBalance < bal[0].total_amount) {
                                                let sql6 = "UPDATE master_customer_wallet SET total_amount ='" + newBalance + "' WHERE customer_id='" + data[0].id + "'AND currency_code='BCH'";

                                                //console.log(sql6)
                                                connection.query(sql6, function(error, final) {
                                                    if (error) {
                                                        res.json({ success: false, message: "error", error })
                                                    } else {
                                                        res.json({ success: true, mesaage: "original balance change" })
                                                    }
                                                })
                                            } else {
                                                var vTotalBalance = bal[0].total_amount + newBalance;
                                                console.log(vTotalBalance)
                                                let sql5 = "UPDATE master_customer_wallet SET total_amount ='" + newBalance + "' WHERE customer_id='" + data[0].id + "'AND currency_code='BCH'";

                                                //console.log(sql5)
                                                connection.query(sql5, function(error, final) {
                                                    if (error) {
                                                        res.json({ success: false, message: "error", error })
                                                    } else {
                                                        let sql6 = "UPDATE customer_wallet SET total_amount ='" + vTotalBalance + "' WHERE customer_id='" + data[0].id + "'AND currency_code='BCH'";

                                                        // console.log(sql6)
                                                        connection.query(sql6, function(error, final) {
                                                            if (error) {
                                                                res.json({ success: false, message: "error", error })
                                                            } else {

                                                                let sql7 = "INSERT INTO customer_deposite (customer_id,amount,currency_code,created_at,status) values ('" + data[0].id + "','" + vTotalBalance + "','BCH','" + created_at() + "',1)";
                                                                // console.log("sql", sql7)
                                                                connection.query(sql7, function(error, ress) {

                                                                    if (error) {
                                                                        console.log(error)
                                                                        res.json({ success: false, message: "error" })
                                                                    } else {

                                                                        let sql8 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) values ('" + data[0].created_by + "','money BCH added to wallet','005','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at() + "','" + data[0].created_by + "','" + data[0].created_by + "')";
                                                                        //console.log(sql8)
                                                                        connection.query(sql8, function(error, results) {
                                                                            if (error) {
                                                                                res.json({ success: false, message: "error", error })
                                                                            } else {
                                                                                res.json({ success: true, message: "BCH added" })

                                                                                // console.log("call wallet function")
                                                                                // var walletdata = wallet.bchTransferEntireBalance(data[0].email, newBalance, exchangeAddress[0].crypto_address)
                                                                                // walletdata.then(function(data) {
                                                                                //     console.log("transhash", data)
                                                                                //     res.json({ success: true, message: "money updated to wallet" })
                                                                                // }, function(err) {
                                                                                //     //res.status(0).json(err)
                                                                                //     res.json({ message: "tranhash error", error: err })
                                                                                // })
                                                                            }
                                                                        }) //8
                                                                    }

                                                                }) //7
                                                            }

                                                        }) //6
                                                    }
                                                }) //5
                                            } //else
                                        } //big else
                                    }) //2
                                }
                            }) //getbalance
                        }

                    }) //1
                }
            })
        }
    })
}
