var connection = require('../../../config/db');
var config = require('../../../config/config');
var moment = require('moment');
var QRCode = require('qrcode')
var mysql = require('mysql');
var async = require('async');
var request = require('request');
var cm_cfg = require('../../../config/common_config');

function created_at() {
    var created = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return created;
}


var BlockIo = require('block_io');
var version = config.bitcoin_version;
var doge_block_io = new BlockIo(config.dogecoin_apiKey, config.bitcoin_pin, version);



exports.dogeUserAccount = function(req, res) {
    // console.log(req.decoded)
    let sql ="SELECT customer.kyc_status, user.id as id FROM `customer` join user on user.email = customer.email where customer.email ='" + req.decoded.email + "'"; 
    //let sql = "SELECT email,id,kyc_status FROM user WHERE email ='" + req.decoded.email + "'";
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            if (false) {
                res.json({ success: false, message: "Address are available only when kyc is approved" })
            } else {
                //console.log(data)
                let sql1 = "SELECT * FROM user_crypto_address WHERE user_id =" + mysql.escape(data[0].id) + "AND crypto_type='DOGE'";
                // console.log(sql1)
                connection.query(sql1, function(error, dta) {
                    if (error) {
                        res.json({ success: false, message: "error", error })

                    } else if (dta[0] == null || dta[0] == undefined) {
                        res.json({ success: false, message: "Address not available" })
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
        }
    })
}

exports.dogeBalance = function(req, res) {
    // var tranarray=[];
    console.log('Call in DOGE balance');

    function db(custId, userId, masterWalletId, transdata, dbtranscount) {
        return new Promise(function(resolve, reject) {
            console.log(transdata)

            var origintransLength = transdata.length
            console.log(origintransLength)

            var loopcount = origintransLength - dbtranscount

            console.log("loopcount", loopcount)




            connection.beginTransaction(function(err) {
                if (err) {
                    throw err;
                }

                async.forEachOfSeries(transdata, function(error, i, inner_callback) {

                        var amount = transdata[i].amounts_received[0].amount;
                        console.log(amount)
                        var transaction_hash = transdata[i].txid;
                        var timestamp1 = moment.unix(transdata[i].time).format("YYYY-MM-DD HH:mm:ss");
                        console.log(timestamp1)

                        let select_tranLog_sql = mysql.format("Select * from transaction_log where transactionhash =?", [transaction_hash]);
                        console.log(select_tranLog_sql);
                        connection.query(select_tranLog_sql, function(err, checktran) {
                            if (err) {
                                console.log("presentcustomerwalletdata wallet error1", err)
                                inner_callback(err);
                                reject(err)

                            } else if (checktran[i] != null || checktran[i] != undefined) {
                                inner_callback(null);

                            } else if (checktran.length == 0) {

                                var trasData = {
                                    "customer_id": custId,
                                    "transactionhash": transaction_hash,
                                    "currency_code": 'DOGE',
                                    "created_at": created_at,
                                    "status": 1,
                                    "transaction_timestamp": timestamp1

                                }
                                console.log(trasData);
                                let tranLog_sql = mysql.format("Insert transaction_log SET ?", [trasData]);
                                console.log('Trans log start === ');
                                console.log(tranLog_sql);
                                console.log('Trans log end ===');
                                connection.query(tranLog_sql, function(error, masterfinal) {



                                    if (error) {

                                        console.log("presentcustomerwalletdata wallet error1 tranLog_sql", error)
                                        inner_callback(error);
                                        reject(error)

                                    } else {

                                    let masterWallet_sql = mysql.format("UPDATE master_customer_wallet SET total_amount = `total_amount` + ? WHERE customer_id=? AND currency_code='DOGE'", [amount, custId]);
                                        console.log(masterWallet_sql)
                                        connection.query(masterWallet_sql, function(error, masterfinal) {
                                         if (err) {
                                         console.log("presentcustomerwalletdata wallet error2", err)
                                                inner_callback(err);
                                                reject(err)

                                            } else {

                                           let customerWallet_sql = mysql.format("UPDATE customer_wallet SET total_amount =`total_amount` + ?  WHERE customer_id= ? AND currency_code='DOGE'", [amount, custId]);

                                                console.log(customerWallet_sql)
                                                connection.query(customerWallet_sql, function(error, walletfinal) {


                                                    if (err) {

                                                        console.log("presentcustomerwalletdata wallet error3", err)
                                                        inner_callback(err);
                                                        reject(err)

                                                    } else {

                                                        var depositData = {
                                                            "customer_id": custId,
                                                            "amount": amount,
                                                            "currency_code": 'DOGE',
                                                            "created_at": created_at(),
                                                            "status": 1,
                                                            "transaction_hash": transaction_hash,
                                                            "transaction_timestamp": timestamp1,
                                                        }

                                                        let deposit_sql = mysql.format("INSERT INTO customer_deposite set ?", [depositData])
                                                        console.log("sql", deposit_sql)
                                                        connection.query(deposit_sql, function(error, ress) {



                                                            if (err) {

                                                                console.log("presentcustomerwalletdata wallet error2", err)
                                                                inner_callback(err);
                                                                reject(err)

                                                            } else {


                                                                var logData = {
                                                                    "user_id": userId,
                                                                    "activity_description": 'money DOGE added to wallet',
                                                                    "activity_type": 005,
                                                                    "device_ipAddress": req.body.device_ipAddress,
                                                                    "device_os": req.body.device_os,
                                                                    "device_name": req.body.device_name,
                                                                    "device_browser": req.body.device_browser,
                                                                    "created_at": created_at(),
                                                                    "created_by": userId,
                                                                    "updated_by": userId
                                                                }


                                                                let log_sql = mysql.format("INSERT INTO log set ?", [logData])
                                                                console.log(log_sql)
                                                                connection.query(log_sql, function(error, results) {

                                                                    if (err) {

                                                                        console.log("presentcustomerwalletdata wallet error2", err)
                                                                        inner_callback(err);
                                                                        reject(err)

                                                                    } else {
                                                                        console.log("walletans", results.insertId)
                                                                        inner_callback(null);
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
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
                            connection.commit(function(err) {
                                if (err) {
                                    return connection.rollback(function() {
                                
                                        reject(err)
                                    });
                                }
                                console.log("walletans")
                                resolve('DOGE deposit to the wallet');
                                console.log("DOGE deposit to the wallet")
                            });


                        }
                    });


            })
        })


    }

    var newBalance = 0;
    var email = req.decoded.email

    let sql = mysql.format('SELECT * FROM customer WHERE email =?', [email]);
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {

            let sql1 = mysql.format("SELECT * FROM user_crypto_address WHERE user_id = ? AND crypto_type='DOGE'", [data[0].created_by]);
            console.log(sql1)
            connection.query(sql1, function(error, dta) {
                if (error) {
                    res.json({ success: false, message: "error", error })

                } else if (dta[0] == null || dta[0] == undefined) {
                    res.json({ success: false, message: "DOGE address is not created" })
                } else {

                    console.log("label", req.decoded.email)
                    doge_block_io.get_transactions({ 'type': 'received', 'addresses': dta[0].crypto_address }, function(error, addr) {
                        //block_io.get_transactions({ 'type': 'received', 'addresses': '38hPzovyjdZ9vxiUWU19az1dvp6ybFTZ24'  }, function(error, addr) {
                        console.log('======');
                        console.log(addr);
                        console.log(addr.data.txs)
                        console.log('======');
                        //block_io.get_address_balance({ 'label': req.decoded.email }, function(error, newBal) {
                        if (error) {
                            //console.log("newbalace", error)
                            res.json({ success: false, message: 'Something went worng', error: cm_cfg.errorFn(error) })
                        } else if (addr.data.txs[0] == null || addr.data.txs[0] == undefined) {
                            console.log(addr)
                            res.json({ success: false, message: 'No transaction yet' })
                        } else {


                            console.log(addr);
                            console.log(addr.data.txs[0].txid);
                            console.log(addr.data.txs[0].amounts_received[0].amount);
                            console.log(addr.data.txs[0].time);
                            var amount = addr.data.txs[0].amounts_received[0].amount;
                            var transaction_hash = addr.data.txs[0].txid;
                            var timestamp1 = moment.unix(addr.data.txs[0].time).format("YYYY-MM-DD HH:mm:ss");

                            // let sqlSelectTimeStamp = mysql.format("Select id from customer_deposite where customer_id=? AND transaction_hash=? AND transaction_timestamp=? AND currency_code='DOGE' order by id desc limit 1", [data[0].id, transaction_hash, timestamp1]);
                            // connection.query(sqlSelectTimeStamp, function(error, tranresult) {
                            //     console.log(sqlSelectTimeStamp)
                            //     if (error) {
                            //         res.json({ success: false, message: "error", error })

                            //     } else if (tranresult[0] != null || tranresult[0] != undefined) {

                            //         res.json({ success: false, message: "Balance already updated" })

                            //     } else {
                            let countTran_sql = mysql.format("Select COUNT( * ) as count_tran from transaction_log where customer_id = ? AND currency_code='DOGE'", [data[0].id])
                            connection.query(countTran_sql, function(error, countfinal) {
                                if (error) {
                                    res.json({ success: false, message: "error", error })

                                } else {

                                    let sql2 = mysql.format("SELECT * FROM master_customer_wallet WHERE customer_id = ? AND currency_code='DOGE'", [data[0].id]);
                                    console.log(sql2)
                                    connection.query(sql2, function(error, bal) {
                                        if (error) {
                                            res.json({ success: false, message: "error", error })

                                        } else if (bal[0] == null || bal[0] == undefined) {
                                            //console.log("bal", bal)
                                            // console.log(dta[0].crypto_address)
                                            var insertData = {
                                                "customer_id": data[0].id,
                                                "total_amount": 0,
                                                "currency_code": 'DOGE',
                                                "created_at": created_at()
                                            }

                                            let sql3 = mysql.format("INSERT INTO master_customer_wallet set ?", [insertData])
                                            connection.query(sql3, function(error, masterWalletData) {
                                                if (error) {
                                                    res.json({ success: false, message: "error", error })

                                                } else {
                                                    // newBalance = newBal.data.available_balance;
                                                    // console.log("newBalance", newBalance)  
                                                    db(data[0].id, data[0].created_by, masterWalletData.insertId, addr.data.txs, countfinal[0].count_tran).then(function(rdata) {
                                                        res.json({ success: true, message: rdata })
                                                    }).catch(function(err) {
                                                        res.json({ success: false, message: "error", err })
                                                    })


                                                }
                                            }) //getbalance
                                        } else {
                                            console.log("nothing")
                                            db(data[0].id, data[0].created_by, bal[0].id, addr.data.txs, countfinal[0].count_tran).then(function(rdata) {
                                                res.json({ success: true, message: rdata })

                                            }).catch(function(err) {
                                                res.json({ success: false, message: "error", err })

                                            })

                                        }

                                    }) //1

                                }
                            })
                        }
                    })
                }
            })
        }
    })
}
