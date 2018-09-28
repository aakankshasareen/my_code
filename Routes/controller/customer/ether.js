var config = require('../../../config/config');
var wallet = require('../../../config/wallet');
var fs = require("fs");
const JSON = require('circular-json');
var QRCode = require('qrcode')
var mysql = require('mysql');
var request = require('request');
var Web3 = require('web3');
var web3 = new Web3(config.geth_http);
//var web3 = new Web3(new Web3.providers.HttpProvider(config.geth_http))

//var net = require('net');
//var web3 = new Web3(new Web3.providers.IpcProvider(config.geth_ipc,net));
//var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
var moment = require('moment');
var connection = require('../../../config/db');

function created_at() {
    var created = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return created;
}




exports.ethUserAccount = function(req, res) {


    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM user WHERE email =?", [email]);

    //let sql = "SELECT * FROM user WHERE email ='" + req.decoded.email + "'";
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            // console.log(data)
           let sql1 = "SELECT * FROM user_crypto_address WHERE user_id =" + mysql.escape(data[0].id) + " AND crypto_type='ETH'";

            connection.query(sql1, function(error, dta) {
                if (error) {
                    res.json({ success: false, message: "error", error })

                } else if (dta[0] == null || dta[0] == undefined) {
                    res.json({ success: false, message: "Eth address is not created" })
                } else {
                    //  console.log(dta[0].crypto_address)

                    QRCode.toDataURL(dta[0].crypto_address, function(err, url) {
                        if (err) {
                            //  console.log(err)
                            res.json({ success: false, message: "Error", error: err })
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

exports.ethBalance = function(req, res) {
    let sql = "SELECT * FROM customer WHERE token =" + mysql.escape(req.headers.token) + "";
    connection.query(sql, function(error, data) {
        console.log("fgfghf",data)
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            let sq = "SELECT * FROM exchange_crypto_address WHERE crypto_type='ETH'";
            console.log(sq);
            connection.query(sq, function(error, exchangeAddress) {
                if (error) {
                    res.json({ success: false, message: "error", error })

                } else if (exchangeAddress[0] == null || exchangeAddress[0] == undefined) {
                    res.json({ success: false, message: "Exchange address not created" })

                } else {
                    let sql1 = "SELECT * FROM user_crypto_address WHERE user_id =" + mysql.escape(data[0].created_by) + " AND crypto_type='ETH'";
                    console.log(sql1)
                    connection.query(sql1, function(error, dta) {
                        if (error) {
                            res.json({ success: false, message: "error", error })

                        } else if (dta[0] == null || dta[0] == undefined) {
                            res.json({ success: false, message: "Eth address is not created" })
                        } else {
                            console.log(dta[0].crypto_address)
                            console.log(99);
                            console.log(dta[0].crypto_address);
                            var bal = web3.eth.getBalance("" + dta[0].crypto_address + "")
                            console.log('not 102');
                            bal.then(function(newBal) {
                                console.log('not 103');
                                console.log("new", newBal)
                                //console.log("new",typeof(newBal))
                                var nBalance = web3.utils.fromWei(newBal, 'ether')
                                var newBalance = parseFloat(nBalance)
                                console.log(newBalance.toFixed(8))
                                console.log("newBalance", newBalance)

                                let sql2 = "SELECT * FROM master_customer_wallet WHERE customer_id =" + mysql.escape(data[0].id) + " AND currency_code='ETH'";
                                console.log(sql2)
                                connection.query(sql2, function(error, bal) {
                                    if (error) {
                                        res.json({ success: false, message: "error", error })

                                    } else if (bal[0] == null && newBalance.toFixed(8) > 0 || bal[0] == undefined && newBalance.toFixed(8) > 0) {
                                        console.log("bal", bal)
                                        console.log(dta[0].crypto_address)
                                        let sql3 = "INSERT INTO master_customer_wallet (customer_id,total_amount,currency_code,created_at) VALUES ('" + data[0].id + "','" + newBalance.toFixed(8) + "','ETH','" + created_at() + "')";
                                        connection.query(sql3, function(error, bal) {
                                            if (error) {
                                                res.json({ success: false, message: "error", error })

                                            } else {
                                                let sql4 = "UPDATE master_customer_wallet SET total_amount ='" + newBalance.toFixed(8) + "' WHERE customer_id='" + data[0].id + "'AND currency_code='ETH'";
                                                //let sql4 = "INSERT INTO customer_wallet (customer_id,total_amount,currency_code,created_at) VALUES ('" + data[0].id + "','" + newBalance.toFixed(8) + "','ETH','" + created_at + "')";
                                                //console.log("query", sql4)
                                                connection.query(sql4, function(error, final) {
                                                    if (error) {
                                                        res.json({ success: false, message: "error", error })
                                                    } else {
                                                        let sql5 = "INSERT INTO customer_deposite (customer_id,amount,currency_code,created_at,status,platform_fee,platform_value) VALUES ('" + data[0].id + "','" + newBalance.toFixed(8) + "','ETH','" + created_at() + "',1,0,0)";
                                                        //console.log("sql", sql5)
                                                        connection.query(sql5, function(error, ress) {
                                                            if (error) {
                                                                res.json({ success: false, message: "error", error })
                                                            } else {

                                                                let sql6 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) VALUES ('" + data[0].created_by + "','money ETH added to wallet','041','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at() + "','" + data[0].created_by + "','" + data[0].created_by + "')";
                                                                // console.log(sql6)
                                                                connection.query(sql6, function(error, results) {
                                                                    if (error) {
                                                                        res.json({ success: false, message: "error", error })
                                                                    } else {

                                                                        console.log("call wallet function")
                                                                        var walletdata = wallet.ethTransferEntireBalance(dta[0].crypto_address, newBal, exchangeAddress[0].crypto_address,data[0].email)
                                                                        walletdata.then(function(data) {
                                                                            console.log("transhash", data)
                                                                            res.json({ success: true, message: "money added to wallet" })
                                                                        }, function(err) {
                                                                            res.json("tranhash error", err)
                                                                        })

                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }

                                        })
                                    } else if (bal[0] == null && newBalance == 0 || bal[0] == undefined && newBalance == 0) {
                                        // console.log("bal", bal)
                                        //console.log(dta[0].crypto_address)
                                        let sql7 = "INSERT INTO master_customer_wallet (customer_id,total_amount,currency_code,created_at) VALUES ('" + data[0].id + "','" + newBalance.toFixed(8) + "','ETH','" + created_at() + "')";
                                        connection.query(sql7, function(error, bal) {
                                            if (error) {
                                                res.json({ success: false, message: "error", error })

                                            } else {
                                                let sql8 = "UPDATE master_customer_wallet SET total_amount ='" + newBalance.toFixed(8) + "' WHERE customer_id='" + data[0].id + "'AND currency_code='ETH'";
                                                //"INSERT INTO customer_wallet (customer_id,total_amount,currency_code,created_at) VALUES ('" + data[0].id + "','" + newBalance.toFixed(8) + "','ETH','" + created_at + "')";
                                                // console.log("query", sql8)
                                                connection.query(sql8, function(error, final) {
                                                    if (error) {
                                                        res.json({ success: false, message: "error", error })
                                                    } else {
                                                        res.json({success:false,message:"Already updated"})
                                                        // let sql9 = "INSERT INTO customer_deposite (customer_id,amount,currency_code,created_at,status,platform_fee,platform_value) VALUES ('" + data[0].id + "','" + newBalance.toFixed(8) + "','ETH','" + created_at() + "',1,0,0)";
                                                        // // console.log("sql", sql9)
                                                        // connection.query(sql9, function(error, ress) {
                                                        //     if (error) {
                                                        //         res.json({ success: false, message: "error", error })
                                                        //     } else {
                                                        //         res.json({ success: false, message: "new balance is 0" })
                                                        //     }
                                                        // })
                                                    }
                                                })
                                            }
                                        })
                                    } else {
                                        if (newBalance.toFixed(8) == bal[0].total_amount.toFixed(8)) {
                                            //console.log(bal[0].total_amount)
                                            res.json({ success: true, message: "already updated" })
                                        } else if (newBalance < bal[0].total_amount) {
                                            let sql10 = "UPDATE master_customer_wallet SET total_amount ='" + newBalance.toFixed(8) + "' WHERE customer_id='" + data[0].id + "'AND currency_code='ETH'";

                                            // console.log(sql10)
                                            connection.query(sql10, function(error, final) {
                                                if (error) {
                                                    res.json({ success: false, message: "error", error })
                                                } else {
                                                    res.json({ success: true, mesaage: "original balance change in master table" })
                                                }
                                            })
                                        } else {
                                            let sqll = "SELECT * FROM customer_wallet WHERE customer_id ='" + data[0].id + "'AND currency_code='ETH'";
                                            console.log(sql2)
                                            connection.query(sqll, function(error, customerPresentBalance) {
                                                if (error) {
                                                    res.json({ success: false, message: "", error })

                                                } else {

                                                    let sql11 = "UPDATE master_customer_wallet SET total_amount ='" + newBalance.toFixed(8) + "' WHERE customer_id='" + data[0].id + "'AND currency_code='ETH'";

                                                    //  console.log(sql11)
                                                    connection.query(sql11, function(error, master) {
                                                        if (error) {
                                                            res.json({ success: false, message: "error", error })
                                                        } else {
                                                            console.log(customerPresentBalance[0].total_amount)
                                                            var vTotalBalance = customerPresentBalance[0].total_amount + newBalance;
                                                            console.log(vTotalBalance)
                                                            let sql12 = "UPDATE customer_wallet SET total_amount ='" + vTotalBalance.toFixed(8) + "' WHERE customer_id='" + data[0].id + "'AND currency_code='ETH'";

                                                            // console.log(sql12)
                                                            connection.query(sql12, function(error, final) {
                                                                if (error) {
                                                                    res.json({ success: false, message: "error", error })
                                                                } else {

                                                                    let sql13 = "INSERT INTO customer_deposite (customer_id,amount,currency_code,created_at,status,platform_fee,platform_value) values ('" + data[0].id + "','" + newBalance.toFixed(8) + "','ETH','" + created_at() + "',1,0,0)";
                                                                    //  console.log("sql", sql13)
                                                                    connection.query(sql13, function(error, ress) {

                                                                        if (error) {
                                                                            res.json({ success: false, message: "error", error })
                                                                        } else {

                                                                            let sql14 = "INSERT INTO log (user_id,activity_description,activity_type,device_ipAddress,device_os,device_name,device_browser,created_at,created_by,updated_by) values ('" + data[0].created_by + "','money ETH added to wallet','041','" + req.body.device_ipAddress + "','" + req.body.device_os + "','" + req.body.device_name + "','" + req.body.device_browser + "','" + created_at() + "','" + data[0].created_by + "','" + data[0].created_by + "')";
                                                                            //console.log(sql14)
                                                                            connection.query(sql14, function(error, results) {
                                                                                if (error) {
                                                                                    res.json({ success: false, message: "error", error })
                                                                                } else {
                                                                                    // res.json({ success: true, message: "money updated to wallet" })

                                                                                    console.log("call wallet function")
                                                                                    var walletdata = wallet.ethTransferEntireBalance(dta[0].crypto_address, newBal, exchangeAddress[0].crypto_address,data[0].email)
                                                                                    walletdata.then(function(data) {
                                                                                        console.log("transhash", data)
                                                                                        res.json({ success: true, message: "money updated to wallet" })
                                                                                    }, function(err) {
                                                                                        console.log("ewjdggejjgd", err)
                                                                                        //res.send(err)
                                                                                        res.json(err)
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
                                        }

                                    }
                                })
                            }, function(err) {
                                console.log('error 281 eth balance catch');
                                console.log(err);
                                res.json({ success: false, message: "Balance error", error: err })
                            })
                        }
                    })
                }
            })
        }
    })
}


exports.ethDepositHistory = function(req, res) {


    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);

    // console.log(sql)
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            let sql1 = "Select*from user_crypto_address where user_id='" + data[0].created_by + "'and crypto_type='ETH'";
            // console.log(sql1)
            connection.query(sql1, function(error, adddata) {
                if (adddata[0] == null || adddata[0] == undefined) {
                    res.json({ success: false, message: "ETH account not created" })
                } else {
                    

                    request('http://ropsten.etherscan.io/api?module=account&action=txlist&address=' + adddata[0].crypto_address + '&sort=asc&apikey=BG8YUA32ZT7E7TU2WAB7VXAEPXZGUGVP6D', function(error, response, body) {
                        //request('http://api.etherscan.io/api?module=account&action=txlist&address=0xE9B3Ed1Ef3E070D5ca0c23474f6F16d6Ce7CCa8b&sort=asc&apikey=BG8YUA32ZT7E7TU2WAB7VXAEPXZGUGVP6D', function(error, response, body) {
                        console.log('error:', error); // Print the error if one occurred
                        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                        console.log('body:', body);
                        // console.log(typeof (body))
                        var obj = JSON.parse(body); // Print the HTML for the Google homepage.
                        console.log('eth obj is  .......... ', obj, obj.result)
                        // obj['result']['txid'] = obj['result']['hash'];
                        // obj['result']['network'] = 'ETH';
                        // obj['result']['amount_received'] = (obj['result']['value'])/1000000000000000000;
                        // obj['result']['sender'] = obj['result']['from'];

                        obj['result'].forEach(function(e) {
                            e.txid = e.hash;
                            e.network = 'ETH';
                            e.amount_received = (e.value) / 1000000000000000000;
                            e.sender = e.from;
                            e.time = e.timeStamp * 1000;
                            e.timeStamp = e.timeStamp * 1000;
                        })
                        var objResult = {};
                        objResult = obj.result;


                        console.log("Ether API ", objResult);

                        res.json({ success: true, data: obj.result })

                    });
                }


            })
        }
    })
}









