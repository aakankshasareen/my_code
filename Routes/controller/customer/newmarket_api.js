var connection = require('../../../config/db');
var config = require('../../../config/config');
var moment = require('moment');
var request = require('request')
var mysql = require('mysql');
var async = require('async');
var nodemailer = require('nodemailer');
var cm_cfg = require('../../../config/common_config');
var io = require('../../../socket.js').io();

var transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // secure:true for port 465, secure:false for port 587
    auth: {
        user: config.email,
        pass: config.password
    }
});



function created_at() {
    var created = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return created;
}


function tickerSocketUpdate(price, pairId) {
    io.emit('tickerTradePrice', { pairId, price })
}



exports.marketBuyOrder = function(req, res) {

    var newtotal_price = 0;
    var percurrency_amount = 0;
    var newquantity = 0;
    var n, est = 0;
    // var ded = [];
    // var partiallded = [];
    var newamount = 0;
    var totalCmdReceived = 0;
    var remainingamount = 0;
    var buyOrderid;
    var buyOrderTranid;
    var orderArray = [];
    var recamount = 0;
    var feedata = 0;
    var presentwalletamount = 0;

    function fee(walletinfo) {

        return new Promise(function(resolve, reject) {
            console.log("fee walletinfo", walletinfo)
            var fee_value = 0;
            var calquantity = 0;
            var walletdedquantity = 0;

            let sql1 = "Select*from commission where currency_code=" + mysql.escape(req.body.currency_code) + "and operation='Buy';"
            //console.log(sql1)
            connection.query(sql1, function(error, data) {
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

                        if (fee_value < data[0].min_amount && data[0].min_amount != 0) {

                            calamount = req.body.amount;
                            walletdedamount = parseFloat(req.body.amount) + parseFloat(data[0].min_amount);

                            if (walletdedamount <= walletinfo && calamount > 0) {


                                // feecalarr.push({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })

                                //return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                resolve({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })
                            } else {
                                reject("You have less money in your wallet included fee")
                            }
                        } else {

                            calamount = req.body.amount;
                            walletdedamount = parseFloat(req.body.amount) + fee_value;

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


    function cal(amount, topdata, n) {
        console.log("amount", amount)
        console.log(topdata)
        console.log("index", n)

        newamount = amount - topdata[n].total_price;
        console.log("na", newamount)


        if (topdata[n].total_price < amount && topdata[n].total_price > 0 && newamount > 0) {
            //if (newamount < amount && newamount > 0) {
            newquantity = topdata[n].quantity;
            console.log("nq", newquantity)
            //return (parseFloat(newquantity) + cal(newamount, topdata, n - 1))

            if (topdata[n].total_price <= amount) {
                obj = { n: n, calamount: amount, presenttotal_price: topdata[n].total_price, newtotal_price: Math.abs(newamount), trade_id: topdata[n].id, customer_id: topdata[n].customer_id, pair_id: topdata[n].pair_id, newquantity: Math.abs(newquantity), fee_percentage: topdata[n].platform_fee, fee_value: topdata[n].platform_value, sell_price: topdata[n].sell_price, presentquantity: topdata[n].quantity, status: 'Fully Executed', dedcutetotal_price: (parseFloat(topdata[n].quantity)*parseFloat(topdata[n].sell_price)).toFixed(8), type: topdata[0].type }
                //ded.push(obj)
                return (obj)

            } else {
                obj = { n: n, calamount: amount, presenttotal_price: topdata[n].total_price, newtotal_price: Math.abs(newamount), trade_id: topdata[n].id, customer_id: topdata[n].customer_id, pair_id: topdata[n].pair_id, newquantity: Math.abs(newquantity), fee_percentage: topdata[n].platform_fee, fee_value: topdata[n].platform_value, sell_price: topdata[n].sell_price, presentquantity: topdata[n].quantity, status: 'Partially Executed', dedcutetotal_price: amount, type: topdata[0].type }
                // partiallded.push(obj)
                return (obj)
            }


        } else if (topdata[n].total_price >= amount || newamount <= 0) {

            //} else if (newamount == 0 || newamount < 0) {
            percurrency_amount = topdata[n].quantity / topdata[n].total_price;
            console.log("pa", percurrency_amount)
            var newquantity = percurrency_amount * amount;
            console.log("partially newquantity", newquantity)
            //return parseFloat(newquantity)

            if (topdata[n].total_price <= amount) {

                obj = { n: n, calamount: amount, presenttotal_price: topdata[n].total_price, newtotal_price: Math.abs(newamount), trade_id: topdata[n].id, customer_id: topdata[n].customer_id, pair_id: topdata[n].pair_id, newquantity: Math.abs(newquantity), fee_percentage: topdata[n].platform_fee, fee_value: topdata[n].platform_value, sell_price: topdata[n].sell_price, presentquantity: topdata[n].quantity, status: 'Fully Executed', dedcutetotal_price: (parseFloat(topdata[n].quantity)*parseFloat(topdata[n].sell_price)).toFixed(8), type: topdata[0].type }
                // ded.push(obj)
                return (obj)
            } else {
                obj = { n: n, calamount: amount, presenttotal_price: topdata[n].total_price, newtotal_price: Math.abs(newamount), trade_id: topdata[n].id, customer_id: topdata[n].customer_id, pair_id: topdata[n].pair_id, newquantity: Math.abs(newquantity), fee_percentage: topdata[n].platform_fee, fee_value: topdata[n].platform_value, sell_price: topdata[n].sell_price, presentquantity: topdata[n].quantity, status: 'Partially Executed', dedcutetotal_price: amount, type: topdata[0].type }
                // partiallded.push(obj)
                return (obj)
            }



        } else {
            console.log('hi')
            return 0
        }
    }


    function marketcustomerdb(custId, pairId, pairfrom, pairto) { //working

        return new Promise(function(resolve, reject) {

            console.log("persent wallet amount of that currency ", presentwalletamount)
            // console.log("after sell currency recevied amount", receivedquantity)

            function rollback(connection, err) {
                console.log(err);
                connection.rollback(function() {
                    // throw err;
                    reject(err)
                });
            }

            function commit(connection) {
                connection.commit(function(err) {
                    if (err) {
                        return rollback(connection, err);
                    }

                    console.log('success!')
                    resolve('Your order successfully placed')
                });
            }

            function buyOrder(callback) {
                console.log("call in buy order")

                var insertbuy = {
                    "customer_id": custId,
                    "pair_id": req.body.pair_id,
                    "status": 'Executed', //marketorderstatus
                    "type": 'Market',
                    "total_price": feedata.calamount,
                    "created_at": created_at(),
                    "platform_fee": feedata.fee_percentage,
                    "platform_value": feedata.fee_value,
                    
                }

                let sql1 = mysql.format("INSERT INTO buy SET ?", [insertbuy])

                console.log(sql1)
                connection.query(sql1, function(error, buyorder) {
                    return callback(error, buyorder);
                })
            }


            function buyOrderTranMaster(buyOrderId, callback) {
                console.log("call in buy order transaction master")

                var insertBuyTran = {
                    "status": 'Executed',
                    "trade_type": 'Buy',
                    "type": 'Market',
                    "trade_id": buyOrderId,
                    "customer_id": custId,
                    "created_at": created_at(),
                    "total_amount": feedata.calamount, //dbtotal_price,
                    "platform_fee": feedata.fee_percentage,
                    "platform_value": feedata.fee_value,
                    "pair_id": pairId

                }

                let buyOrderTranMaster = mysql.format("INSERT INTO transaction_master set ?", [insertBuyTran])

                console.log(buyOrderTranMaster)
                connection.query(buyOrderTranMaster, function(err, transmasterid) {
                    return callback(err, transmasterid);
                })
            }

            function toWallet(callback) {
                console.log("call in buy wallet")

                console.log("presentwalletamount", presentwalletamount)
                console.log("dedcuteamount", feedata.walletdedamount)

                var presentBalance = presentwalletamount - feedata.walletdedamount;
                console.log("total money updated to the wallet after sell", presentBalance)

                let sendWallet_sql = mysql.format("UPDATE customer_wallet SET total_amount = ? WHERE customer_id=? AND currency_code=?", [presentBalance, custId, pairto]);

                console.log(sendWallet_sql)
                connection.query(sendWallet_sql, function(err, walletResponse) {
                    return callback(err, walletResponse);
                })
            }


            function insertOrders() {
                return new Promise((resolve, reject) => {

                    let sellOrder = mysql.format("Select*from sell where (status ='Executed'or status = 'Partially Executed' or status= 'Partially')and pair_id=? and type='Limit' and customer_id !=? order by sell_price asc, created_at asc limit 1", [req.body.pair_id, custId]);
                    console.log(sellOrder)

                    connection.query(sellOrder, function(error, orderdata) {
                        if (error) {
                            return reject(error);
                        } else {

                            if (!orderdata.length) {

                                console.log("NO order")
                                return resolve(false);
                            } else {

                                new Promise((resolve, reject) => {
                                    if (remainingamount == recamount) {
                                        console.log("with in the function of remaining amount", remainingamount)
                                        console.log("with in the function of remaining amount", recamount)
                                        // console.log("orderArray", orderArray)
                                        // console.log("No order found no action perform")
                                        // var result = "NO user found for sell";

                                        buyOrder(function(err, buyOrderResult) {
                                            if (err) {
                                                return reject(err)
                                            }
                                            buyOrderid = buyOrderResult.insertId
                                            buyOrderTranMaster(buyOrderResult.insertId, function(err, buyOrderTranMasterResult) {
                                                if (err) {
                                                    return reject(err)
                                                }
                                                buyOrderTranid = buyOrderTranMasterResult.insertId
                                                toWallet(function(err, walletResult) {
                                                    if (err) {
                                                        return reject(err)
                                                    }
                                                    resolve()
                                                })
                                            })
                                        })
                                    } else {
                                        resolve()
                                    }
                                }).then(() => {
                                    return cal(remainingamount, orderdata, 0)
                                }).then((dedd) => {
                                    return new Promise((resolve, reject) => {
                                        console.log("final", dedd)
                                        orderArray.push(dedd)

                                        console.log("before remainingamount", remainingamount)

                                        remainingamount = remainingamount - dedd.dedcutetotal_price
                                        console.log("remainingamount", remainingamount)

                                        //ND
                                        receWalletQuantity = (parseFloat(dedd.dedcutetotal_price) / parseFloat(dedd.sell_price));

                                        console.log("ch", receWalletQuantity)
                                        let receWallet = mysql.format("UPDATE customer_wallet SET total_amount =`total_amount` + ? WHERE customer_id=? AND currency_code=?", [receWalletQuantity, custId, pairfrom]);
                                        console.log(receWallet)
                                        connection.query(receWallet, function(err, receWalletData) {
                                            if (err) {
                                                return reject(err)
                                            }

                                            var customerwalletnewbalance = dedd.dedcutetotal_price
                                            console.log("sell custo wallet total", customerwalletnewbalance)

                                            let sellCustomerWallet_sql = mysql.format("UPDATE customer_wallet SET total_amount =`total_amount` + ? WHERE customer_id= ? AND currency_code=?", [customerwalletnewbalance, dedd.customer_id, pairto]);
                                            console.log(sellCustomerWallet_sql)
                                            connection.query(sellCustomerWallet_sql, function(err, rows, fields) {
                                                if (err) {

                                                    console.log("customer wallet error", err)
                                                    return reject(err)
                                                }

                                                var sellOrderQunatity = (dedd.status=='Fully Executed'?0:dedd.presentquantity - (parseFloat(dedd.dedcutetotal_price) / parseFloat(dedd.sell_price)))

                                                var comtatal_price = sellOrderQunatity * dedd.sell_price;

                                                let sellOrder_sql = mysql.format("UPDATE sell SET status =? ,quantity=? ,total_price=? WHERE id =?", [dedd.status, sellOrderQunatity, comtatal_price, dedd.trade_id]);
                                                console.log(sellOrder_sql)
                                                connection.query(sellOrder_sql, function(err, rows, fields) {
                                                    if (err)
                                                        return reject(err)
                                                    //console.log("done")
                                                    console.log("order trade id", dedd.trade_id)

                                                    let select_sellOrderTranMaster_sql = mysql.format("Select*from transaction_master where trade_type ='Sell' and trade_id=?", [dedd.trade_id]);
                                                    console.log('select_sellOrderTranMaster_sql', select_sellOrderTranMaster_sql)

                                                    connection.query(select_sellOrderTranMaster_sql, function(err, transactionmasterdata) {
                                                        if (err) {
                                                            console.log("sell order transaction_master error", err)
                                                            return reject(error)
                                                        } else if (!transactionmasterdata.length) {

                                                            console.log(transactionmasterdata)


                                                            var insert_sellorderTran = {

                                                                "status": dedd.status,
                                                                "trade_type": 'Sell',
                                                                "type": 'Limit',
                                                                "trade_id": dedd.trade_id,
                                                                "customer_id": dedd.customer_id,
                                                                "avg_price": dedd.sell_price,
                                                                "created_at": created_at(),
                                                                "price": dedd.sell_price,
                                                                "total_amount": dedd.presenttotal_price,
                                                                "quantity": dedd.presentquantity,
                                                                "platform_fee": dedd.fee_percentage,
                                                                "platform_value": dedd.fee_value,
                                                                "pair_id": dedd.pair_id

                                                            }
                                                            let insert_sellOrderTranMaster_sql = mysql.format("INSERT INTO transaction_master set ?", insert_sellorderTran)


                                                            console.log(insert_sellOrderTranMaster_sql)

                                                            connection.query(insert_sellOrderTranMaster_sql, function(err, insert_sellOrderTranMaster) {

                                                                if (err)
                                                                    return reject(error)


                                                                var sell_buyData = [

                                                                    [dedd.customer_id, 'Sell', dedd.type, dedd.trade_id, custId, dedd.sell_price, receWalletQuantity, 'Fully Executed', dedd.pair_id, created_at(), insert_sellOrderTranMaster.insertId],
                                                                    [custId, 'Buy', 'Market', buyOrderid, dedd.customer_id, dedd.sell_price, receWalletQuantity, 'Fully Executed', dedd.pair_id, created_at(), buyOrderTranid]
                                                                ]
                                                                let sell_buyOrder_sql = mysql.format("INSERT INTO transaction (customer_id,trade_type,type,trade_id,to_from_customer_id,price,quantity,status,pair_id,created_at,transanction_master_id) values ?", [sell_buyData])

                                                                //let sell_buyOrder_sql = "INSERT INTO transaction (customer_id,trade_type,type,trade_id,to_from_customer_id,price,quantity,status,pair_id,created_at,transanction_master_id) values ('" + dedd.customer_id + "','Sell','" + dedd.type + "','" + dedd.trade_id + "','" + custId + "','" + req.body.amount + "','" + dedd.presentquantity + "','Fully Executed','" + dedd.pair_id + "','" + created_at() + "','" + results.insertId + "'),('" + custId + "','Buy','Limit','" + limitbuyorderdata.insertId + "','" + dedd.customer_id + "','" + req.body.amount + "','" + dedd.presentquantity + "','Fully Executed','" + dedd.pair_id + "','" + created_at() + "','" + transmasterid.insertId + "');"
                                                                console.log(sell_buyOrder_sql)
                                                                connection.query(sell_buyOrder_sql, function(err, rows, fields) {
                                                                    if (err) {
                                                                        console.log(err)
                                                                        return reject(err)
                                                                    }
                                                                    console.log("walletans----------------------")
                                                                    return resolve(remainingamount > 0) // to tell then function to recall the insertOrders function or not
                                                                })
                                                            })
                                                        } else {
                                                            var sell_buyTranData = [

                                                                [dedd.customer_id, 'Sell', dedd.type, dedd.trade_id, custId, dedd.sell_price, receWalletQuantity, 'Fully Executed', dedd.pair_id, created_at(), transactionmasterdata[0].id],
                                                                [custId, 'Buy', 'Market', buyOrderid, dedd.customer_id, dedd.sell_price, receWalletQuantity, 'Fully Executed', dedd.pair_id, created_at(), buyOrderTranid]

                                                            ]

                                                            let sell_buyOrderTran_sql = mysql.format("INSERT INTO transaction (customer_id,trade_type,type,trade_id,to_from_customer_id,price,quantity,status,pair_id,created_at,transanction_master_id) values ? ", [sell_buyTranData])

                                                            console.log(sell_buyOrderTran_sql)
                                                            connection.query(sell_buyOrderTran_sql, function(err, rows, fields) {
                                                                if (err) {
                                                                    console.log(err)
                                                                    return reject(err)
                                                                }
                                                                let sellOrder_avgcal_sql = mysql.format("Select AVG(price) as avgprice from transaction where type=? and trade_type='Sell'and trade_id=?", [dedd.type, dedd.trade_id]);
                                                                console.log(sellOrder_avgcal_sql)
                                                                connection.query(sellOrder_avgcal_sql, function(err, avgcal) {
                                                                    if (err) {
                                                                        console.log("Error while performing Query");
                                                                        return reject(err)
                                                                    } else {
                                                                        console.log(avgcal[0].avgprice)
                                                                        let sellOrder_updatetranmaster_sql = mysql.format("UPDATE transaction_master SET status=?,avg_price=? where id= ?", [dedd.status, avgcal[0].avgprice, transactionmasterdata[0].id]);
                                                                        console.log(sellOrder_updatetranmaster_sql)
                                                                        connection.query(sellOrder_updatetranmaster_sql, function(err, results) {
                                                                            if (err) {
                                                                                return reject(err)
                                                                            } else {

                                                                                console.log("walletans----------------------")
                                                                                console.log(remainingamount)
                                                                                return resolve(remainingamount > 0) // to tell then function to recall the insertOrders function or not
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                            })
                                                        }
                                                    })
                                                })
                                            })
                                        })
                                    })
                                }).then((rerun) => {
                                    resolve(rerun)
                                }).catch((err) => {
                                    reject(err)
                                })
                            }
                        }
                    })
                }).then((rerun) => {
                    if (rerun)
                        return insertOrders()
                    return Promise.resolve()
                })
            }



            function updatebuyOrder(buyOrderId, recamount, callback) {
                console.log("reciving amount", recamount)
                var savetotal_price = 0;

                if (remainingamount == recamount) {
                    console.log("No updation required")
                    return callback()
                } else {

                    if (remainingamount == 0 || remainingamount < 0) {
                        var buysttus = 'Fully Executed'
                    } else if (remainingamount < recamount && recamount > 0) {
                        var buysttus = 'Partially Executed'
                    } else if (remainingamount == recamount) {
                        var buysttus = 'Executed'
                    } else {
                        var buysttus = 'no status'
                    }
                    console.log(buysttus)


                    if (remainingamount == 0) {
                        savetotal_price = 0;

                    } else {
                        savetotal_price = remainingamount
                    }


                    let updateBuyOrder = mysql.format("Update buy SET status=?,total_price=? where id= ?", [buysttus, savetotal_price, buyOrderId])

                    console.log(updateBuyOrder)
                    connection.query(updateBuyOrder, function(error, updatebuyorder) {
                        return callback(error, updatebuyorder);
                    })
                }
            }

            function updateBuyOrderTranMaster(buyOrderTranId, recamount, callback) {
                console.log("updatetran master id", buyOrderTranId)

                if (remainingamount == recamount) {
                    console.log("No updation required")
                    return callback()
                } else {

                    let buyOrder_avgcal_sql = mysql.format("Select AVG(price) as avgprice from transaction where transanction_master_id=?", [buyOrderTranId]);
                    console.log("buyorderavg", buyOrder_avgcal_sql)

                    connection.query(buyOrder_avgcal_sql, function(err, limitavgcal) {

                        if (err) {
                            console.log("Error while performing Query");
                            return callback(err);
                            //reject(err)
                        } else if (limitavgcal[0].avgprice == null || limitavgcal[0].avgprice == undefined) {
                            console.log("No transcation yet")
                            return callback()
                        } else {
                            console.log(limitavgcal[0].avgprice)


                            if (remainingamount == 0 || remainingamount < 0) {
                                var buysttus = 'Fully Executed'
                            } else if (remainingamount < feedata.calamount && remainingamount > 0) {
                                var buysttus = 'Partially Executed'
                            } else if (remainingamount == feedata.calamount) {
                                var buysttus = 'Executed'
                            } else {
                                var buysttus = 'no status'
                            }
                            console.log(buysttus)

                            let buyOrder_updatetranmaster_sql = mysql.format("UPDATE transaction_master SET avg_price=?, status=? where id= ?", [limitavgcal[0].avgprice, buysttus, buyOrderTranId]);
                            console.log("buyordertran", buyOrder_updatetranmaster_sql)
                            connection.query(buyOrder_updatetranmaster_sql, function(err, results) {

                                return callback(err, results)

                            })
                        }
                    })
                }

            }

            function feeCalAndWallet() {
                return new Promise((resolve, reject) => {
                    let sql2 = mysql.format("SELECT * FROM customer_wallet WHERE customer_id =? AND currency_code=?", [custId, pairto]);
                    connection.query(sql2, function(error, response) {
                        if (error)
                            return reject(error)
                        if (response[0].total_amount == 0 || response == undefined)
                            return reject({ ecode: 1, message: "You have 0 money to spend" })
                        if (response[0].total_amount < req.body.amount)
                            return reject({ ecode: 1, message: "You have less amount to spend : " + response[0].total_amount + "" });

                        presentwalletamount = response[0].total_amount
                        resolve(response)
                    })
                }).then((response) => {
                    return fee(response[0].total_amount)
                }).then((feedat) => {
                    feedata = feedat
                    remainingamount = feedat.calamount
                })
            }

            connection.beginTransaction(function(err) {
                if (err) {
                    return reject(err);
                }

                feeCalAndWallet().then(() => {
                    recamount = feedata.calamount
                    insertOrders().then(() => {
                        return new Promise((resolve, reject) => {
                            updatebuyOrder(buyOrderid, feedata.calamount, function(err, buyOrderResult) {
                                if (err) {
                                    return reject(err)
                                }

                                updateBuyOrderTranMaster(buyOrderTranid, feedata.calamount, function(err, buyOrderTranMasterResult) {
                                    if (err) {
                                        reject(err)
                                    } else {
                                        resolve()
                                    }
                                })
                            })
                        })
                    }).then(() => {
                        commit(connection)
                    }).catch((err) => {
                        rollback(connection, err);
                    })
                }).catch((err) => {
                    rollback(connection, err)
                })
            });
        });
    }


    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [req.decoded.email]);
    connection.query(sql, function(error, data) {
        //console.log(data)
        if (error) {
            res.json({ success: false, message: "error", error: error })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
           
            var pair_id = req.body.pair_id;
            let pair_sql = mysql.format("SELECT * FROM pair_master WHERE id =?", [pair_id]);
            connection.query(pair_sql, function(error, pairdata) {
                //console.log(data)
                if (error) {
                    res.json({ success: false, message: "error", error: error })
                } else if (pairdata[0] == null || pairdata[0] == undefined) {
                    res.json({ success: false, message: "Pair not found" })
                } else {

                    if (pairdata[0].status == 1) {
                        let tradelimit_sql = mysql.format("Select*from trade_limit where currency_code=? and operation='Buy'", [req.body.currency_code]);
                        connection.query(tradelimit_sql, function(error, tradelimitdata) {
                            if (error) {
                                console.log("fee error", error)
                            } else if (tradelimitdata[0] == null || tradelimitdata[0] == undefined) {
                                console.log("Trade limit data not found")
                            } else {
                                //console.log(data)
                                if (req.body.amount < tradelimitdata[0].min_amount) {
                                    res.json({ success: false, message: "Minimum trade limit is " + tradelimitdata[0].min_amount + "" })
                                } else {
                                    let sql3 = mysql.format("Select*from sell where (status ='Executed'or status = 'Partially Executed' or status='Partially')and pair_id=? and type='Limit'  and customer_id !=? order by sell_price asc", [req.body.pair_id, data[0].id]);

                                    connection.query(sql3, function(error, topdata) {
                                        if (error) {
                                            res.json({ success: false, message: "error", error: error });
                                        } else {
                                            if (topdata[0] == null || topdata[0] == undefined) {
                                                res.json({ success: false, message: "No user for sell" });
                                            } else {
                                                // let tranmastercount_sql = "SELECT COUNT( * ) as total from sell";
                                                // connection.query(tranmastercount_sql, function(error, countData) {
                                                //     if (error) {
                                                //         res.json({ success: false, message: "error", error: error });
                                                //     } else {

                                                //         console.log("countData", countData)

                                                //         let marketBuyFunction = countData[0].total == 1 ? firstmarketcustomerdb : marketcustomerdb

                                                let marketBuyFunction = marketcustomerdb

                                                marketBuyFunction(data[0].id, pairdata[0].id, pairdata[0].from, pairdata[0].to).then(() => {
                                                    if (orderArray.length) {
                                                        let lastOrder = orderArray.pop()
                                                        tickerSocketUpdate(lastOrder.sell_price, req.body.pair_id)
                                                    }
                                                    res.json({ success: true, message: "Your Order Successfully Executed" })
                                                }).catch((err) => {
                                                    if (err.ecode)
                                                        return res.json({ success: false, message: err.message })
                                                    res.json({ success: false, message: 'Error', error: cm_cfg.errorFn(err) })
                                                })
                                                // }
                                                //  })

                                            }
                                        }
                                    })
                                }
                            }
                        })
                    } else {
                        res.json({ success: false, message: "This pair is inactive by the admin." })
                    }
                }
            })
            // }).catch(function(err) {
            //     res.json({ success: false, message: err })
            // })
        }
    })
}


exports.limitBuyPlaceOrder = function(req, res) {

    var newtotal_price = 0;
    var percurrency_amount = 0;
    var newquantity = 0;
    var n, est = 0;
    var orderArray = [];
    var feecalarr = [];
    var percentage_amount = 0;
    // var max_amount = 0;
    // var low_amount = 0
    var remainingquantity = 0;
    var buyOrderid;
    var buyOrderTranid = 0;
    var amountTobeDeducted = 0;
    var quantity = 0;
    var fiatwalletamount = 0;
    var receivedquantity = 0;
    var feedata;
  

    function fee(walletinfo) {
        return new Promise(function(resolve, reject) {
            console.log("fee walletinfo", walletinfo)
            var fee_value = 0;
            var calquantity = 0;
            var walletdedquantity = 0;
            console.log(req.body.amount)
            console.log(req.body.quantity)
            var total_amount = req.body.amount * req.body.quantity

            let sql1 = "Select*from commission where currency_code=" + mysql.escape(req.body.currency_code) + "and operation='Buy';"
            //console.log(sql1)
            connection.query(sql1, function(error, data) {
                if (error) {
                    reject(error)
                } else if (data[0] == null || data[0] == undefined) {
                    reject("fee data not found")
                } else {
                    // console.log("fee data", data)
                    if (walletinfo == total_amount) {

                        console.log("min %", data[0].min_percentage)

                        fee_value = (data[0].min_percentage * total_amount) / 100;

                        if (fee_value < data[0].min_amount && data[0].min_amount != 0) {

                            calamount = parseFloat(total_amount) - parseFloat(data[0].min_amount);
                            walletdedamount = total_amount;

                            if (walletdedamount <= walletinfo && calamount > 0) {
                                //feecalarr.push({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })
                                // return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                resolve({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })
                            } else {
                                reject({ ecode: 1, message: "You have less money in your wallet included fee" })
                            }

                        } else {

                            calamount = parseFloat(total_amount) - fee_value;
                            walletdedamount = total_amount;

                            if (walletdedamount <= walletinfo && calamount > 0) {

                                //feecalarr.push({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })

                                //return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                resolve({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })
                            } else {
                                reject({ ecode: 1, message: "You have less money in your wallet included fee" })
                            }
                        }

                    } else if (walletinfo > total_amount) {
                        console.log("wallet is greater than amount")

                        fee_value = (data[0].min_percentage * total_amount) / 100;

                        if (fee_value < data[0].min_amount && data[0].min_amount != 0) {

                            calamount = total_amount;
                            walletdedamount = parseFloat(total_amount) + parseFloat(data[0].min_amount);

                            if (walletdedamount <= walletinfo && calamount > 0) {


                                // feecalarr.push({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })

                                //return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                resolve({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })
                            } else {
                                reject({ ecode: 1, message: "You have less money in your wallet included fee" })
                            }
                        } else {

                            calamount = total_amount;
                            walletdedamount = parseFloat(total_amount) + fee_value;

                            if (walletdedamount <= walletinfo && calamount > 0) {
                                //feecalarr.push({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })
                                // return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                resolve({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })
                            } else {
                                reject({ ecode: 1, message: "You have less money in your wallet included fee" })
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
                                reject({ ecode: 1, message: "You have less money in your wallet included fee" })
                            }

                        } else {

                            calamount = parseFloat(walletinfo) - fee_value;
                            walletdedamount = walletinfo;

                            if (walletdedamount <= walletinfo && calamount > 0) {

                                //feecalarr.push({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })
                                //return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                resolve({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })
                            } else {
                                reject({ ecode: 1, message: "You have less money in your wallet included fee" })
                            }
                        }
                    }


                }
            })

        })
    }


    function cal(quantity, topdata, n) {

        // return new Promise(function(resolve, reject) {
        console.log("quantity", quantity)
        console.log('calfunction', topdata)
        console.log("index", n)

        newquantity = Number(quantity - topdata[n].quantity).toFixed(6);
        //console.log("nq", newquantity)

        if (topdata[n].quantity < quantity && topdata[n].quantity > 0 && newquantity > 0) {
            console.log("tp", topdata[n])
            newtotal_price = topdata[n].total_price;
            console.log("ntp", newtotal_price)

            if (topdata[n].quantity <= quantity) {
                obj = { n: n, quantity: quantity, presentquantity: topdata[n].quantity, presenttotal_price: topdata[n].total_price, money: newtotal_price, trade_id: topdata[n].id, customer_id: topdata[n].customer_id, pair_id: topdata[n].pair_id, newquantity: Math.abs(newquantity), fee_percentage: topdata[n].platform_fee, fee_value: topdata[n].platform_value, type: topdata[n].type, transell_price: (topdata[n].sell_price == 0 ? req.body.amount : topdata[n].sell_price), status: 'Fully Executed', receWalletQuantity: topdata[n].quantity, presentsell_price: topdata[n].sell_price }
                // ded.push(obj)
                return (parseFloat(newtotal_price), obj)
                // resolve (parseFloat(newtotal_price) + cal(newquantity, topdata, n - 1))

            } else {
                obj = { n: n, quantity: quantity, presentquantity: topdata[n].quantity, presenttotal_price: topdata[n].total_price, money: newtotal_price, trade_id: topdata[n].id, customer_id: topdata[n].customer_id, pair_id: topdata[n].pair_id, newquantity: Math.abs(newquantity), fee_percentage: topdata[n].platform_fee, fee_value: topdata[n].platform_value, type: topdata[n].type, transell_price: (topdata[n].sell_price == 0 ? req.body.amount : topdata[n].sell_price), status: 'Partially Executed', receWalletQuantity: quantity, presentsell_price: topdata[n].sell_price }
                //partiallded.push(obj)
                return (parseFloat(newtotal_price), obj)
                //resolve (parseFloat(newtotal_price) + cal(newquantity, topdata, n - 1))
            }

        } else if (topdata[n].quantity >= quantity || newquantity <= 0) {

            console.log("partp", topdata[n])
            percurrency_amount = topdata[n].total_price / topdata[n].quantity;
            newtotal_price = percurrency_amount * quantity;
            console.log("network price", newtotal_price)
            // console.log("pa", percurrency_amount)
            if (topdata[n].quantity <= quantity) {

                obj = { n: n, quantity: quantity, presentquantity: topdata[n].quantity, presenttotal_price: topdata[n].total_price, money: newtotal_price, trade_id: topdata[n].id, customer_id: topdata[n].customer_id, pair_id: topdata[n].pair_id, newquantity: Math.abs(newquantity), fee_percentage: topdata[n].platform_fee, fee_value: topdata[n].platform_value, type: topdata[n].type, transell_price: (topdata[n].sell_price == 0 ? req.body.amount : topdata[n].sell_price), status: 'Fully Executed', receWalletQuantity: topdata[n].quantity, presentsell_price: topdata[n].sell_price }
                // ded.push(obj)
                return (parseFloat(newtotal_price), obj)
                //resolve (parseFloat(newtotal_price))
            } else {
                obj = { n: n, quantity: quantity, presentquantity: topdata[n].quantity, presenttotal_price: topdata[n].total_price, money: newtotal_price, trade_id: topdata[n].id, customer_id: topdata[n].customer_id, pair_id: topdata[n].pair_id, newquantity: Math.abs(newquantity), fee_percentage: topdata[n].platform_fee, fee_value: topdata[n].platform_value, type: topdata[n].type, transell_price: (topdata[n].sell_price == 0 ? req.body.amount : topdata[n].sell_price), status: 'Partially Executed', receWalletQuantity: quantity, presentsell_price: topdata[n].sell_price }
                // partiallded.push(obj)
                return (parseFloat(newtotal_price), obj)
                //resolve (parseFloat(newtotal_price))
            }

        } else {
            return 0
        }
        // })
    }



    function limitcustomerdb(custId, pairId, pairfrom, pairto) {

        return new Promise(function(resolve, reject) {

            console.log("persent wallet amount of that currency ", fiatwalletamount)
            console.log("after sell currency recevied amount", receivedquantity)

            function rollback(connection, err) {
                connection.rollback(function() {
                    reject(err)
                });
            }

            function commit(connection) {
                connection.commit(function(err) {
                    if (err)
                        return rollback(connection, err);
                    console.log('success!')
                    resolve('Your order successfully placed')
                });
            }


            function buyOrder(callback) {
                var dbtotal_price = receivedquantity * req.body.amount;

                var insertbuy = {
                    "customer_id": custId,
                    "pair_id": req.body.pair_id,
                    "status": 'Executed',
                    "type": 'Limit',
                    "quantity": receivedquantity,
                    "buy_price": req.body.amount,
                    
                    "total_price": dbtotal_price,
                    "created_at": created_at(),
                    "platform_fee": feedata.fee_percentage,
                    "platform_value": feedata.fee_value,
                    
                }

                let sql1 = mysql.format("INSERT INTO buy SET ?", insertbuy)

                console.log(sql1)
                connection.query(sql1, function(error, buyorder) {
                    return callback(error, buyorder);
                })
            }


            function buyOrderTranMaster(buyOrderId, callback) {
                var dbtotal_price = receivedquantity * req.body.amount;

                var insertBuyTran = {
                    "status": 'Executed',
                    "trade_type": 'Buy',
                    "type": 'Limit',
                    "trade_id": buyOrderId,
                    "customer_id": custId,
                    "created_at": created_at(),
                    "total_amount": dbtotal_price,
                    "price": req.body.amount,
                    "quantity": receivedquantity, //req.body.quantity
                    "platform_fee": feedata.fee_percentage,
                    "platform_value": feedata.fee_value,
                    "pair_id": pairId

                }

                let buyOrderTranMaster = mysql.format("INSERT INTO transaction_master set ?", [insertBuyTran])

                console.log(buyOrderTranMaster)
                connection.query(buyOrderTranMaster, function(err, transmasterid) {
                    return callback(err, transmasterid);
                })
            }


            function toWallet(callback) {
                console.log("fiatwalletamount", fiatwalletamount)
                console.log("dedcuteamount", amountTobeDeducted)
                console.log("third parameter", (remainingquantity * req.body.amount))

                let orderAmount = amountTobeDeducted + (remainingquantity * req.body.amount)

                if (feedata.fee_percentage && amountTobeDeducted > 0)
                    feedata.fee_value = (orderAmount * feedata.fee_percentage) / 100

                var presentBalance = fiatwalletamount - feedata.fee_value - orderAmount
          
                console.log("total money updated to the wallet after sell", presentBalance)
                let sendWallet_sql = mysql.format("UPDATE customer_wallet SET total_amount = ? WHERE customer_id=? AND currency_code=?", [presentBalance, custId, pairto]);

                console.log(sendWallet_sql)
                connection.query(sendWallet_sql, function(err, walletResponse) {
                    return callback(err, walletResponse);
                })
            }

            function insertOrders(buyOrderId, buyOrderTranId) {

                return new Promise((resolve, reject) => {
                    let sellOrder = mysql.format(" SELECT * FROM sell WHERE status in ('Executed', 'Partially Executed') and sell_price<=? and pair_id = ? and customer_id!=? order by sell_price asc ,created_at asc limit 1", [req.body.amount, req.body.pair_id, custId]);
                    console.log(sellOrder)
                    connection.query(sellOrder, function(error, orderdata) {
                        if (error) {
                            reject(error);
                        } else if (!orderdata.length) {
                            console.log("NO order")
                            resolve()
                        } else {

                            new Promise((resolve, reject) => {
                                if (remainingquantity == quantity) {
                                    // console.log("orderArray", orderArray)
                                    console.log(" order found no action perform")
                                    //var result = "NO user found for sell";

                                    buyOrderTranMaster(buyOrderId, function(err, buyOrderTranMasterResult) {
                                        if (err)
                                            return reject(err);
                                        buyOrderTranid = buyOrderTranMasterResult.insertId
                                        resolve()
                                    })
                                } else {
                                    resolve()
                                }
                            }).then(() => {
                                return new Promise((resolve, reject) => {
                                    // remainingquantity = quantity
                                    console.log("before remainingquantity", remainingquantity)

                                    dedd = cal(remainingquantity, orderdata, 0)
                                    console.log('dedd', dedd)
                                    amountTobeDeducted += dedd.receWalletQuantity * (dedd.type === 'Market' ? req.body.amount : dedd.presentsell_price)

                                    console.log('amountTobeDeducted', amountTobeDeducted)

                                    console.log("final", dedd);
                                    remainingquantity = remainingquantity - dedd.receWalletQuantity
                                    /* Anuj change 3 April */
                                    //if(remainingquantity==0)
                                    //quan=req.body.qu
                                    //else
                                    //quan=req.body.qu-remainingquantity
                                    /* Anuj changes 3 April */

                                    /* Anuj change 3 April */
                                    var quanTemp = 0;
                                    if (remainingquantity == 0) {
                                        quanTemp = req.body.quantity;
                                    } else {
                                        quanTemp = req.body.quantity - remainingquantity;
                                    }
                                    dedd.tradeQuan = quanTemp;
                                    console.log('********************************')
                                    console.log(dedd);
                                    console.log('********************************')
                                    /* Anuj changes 3 April */
                                    orderArray.push(dedd)
                                    console.log("remainingquantity", remainingquantity)

                                    let receWallet = mysql.format("UPDATE customer_wallet SET total_amount =`total_amount` + ? WHERE customer_id=? AND currency_code=?", [dedd.receWalletQuantity, custId, pairfrom]);
                                    console.log(receWallet)
                                    connection.query(receWallet, function(err, receWalletData) {
                                        if (err)
                                            return reject(err);

                                        var customerwalletnewbalance = dedd.receWalletQuantity * (dedd.type === 'Market' ? req.body.amount : dedd.presentsell_price)
                                        console.log("sell custo wallet total", customerwalletnewbalance)

                                        let sellCustomerWallet_sql = mysql.format("UPDATE customer_wallet SET total_amount =`total_amount` + ? WHERE customer_id= ? AND currency_code=?", [customerwalletnewbalance, dedd.customer_id, pairto]);
                                        console.log(sellCustomerWallet_sql)
                                        connection.query(sellCustomerWallet_sql, function(err, rows, fields) {
                                            if (err)
                                                return reject(err)

                                            var sellOrderQunatity = dedd.presentquantity - dedd.receWalletQuantity;

                                            var comtatal_price = sellOrderQunatity * dedd.presentsell_price;

                                            dedd.status = sellOrderQunatity ? 'Partially Executed' : 'Fully Executed'

                                            let sellOrder_sql = mysql.format("UPDATE sell SET status =? ,quantity=? ,total_price=? WHERE id =?", [dedd.status, sellOrderQunatity, comtatal_price, dedd.trade_id]);
                                            console.log(sellOrder_sql)
                                            connection.query(sellOrder_sql, function(err, rows, fields) {
                                                if (err)
                                                    return reject(err)

                                                //console.log("done")
                                                console.log(" oredr trade id", dedd.trade_id)

                                                let select_sellOrderTranMaster_sql = mysql.format("Select*from transaction_master where trade_type ='Sell' and trade_id=?", [dedd.trade_id]);
                                                console.log('select_sellOrderTranMaster_sql', select_sellOrderTranMaster_sql)
                                                connection.query(select_sellOrderTranMaster_sql, function(err, transactionmasterdata) {
                                                    if (err) {
                                                        console.log("sell order transaction_master error", err)
                                                        return reject(err)
                                                    } else if (!transactionmasterdata.length) {

                                                        console.log(transactionmasterdata)

                                                        var insert_sellorderTran = {
                                                            "status": dedd.status,
                                                            "trade_type": 'Sell',
                                                            "type": dedd.type,
                                                            "trade_id": dedd.trade_id,
                                                            "customer_id": dedd.customer_id,
                                                            "avg_price": dedd.presentsell_price,
                                                            "created_at": created_at(),
                                                            "price": dedd.presentsell_price,
                                                            "total_amount": dedd.presenttotal_price,
                                                            "quantity": dedd.presentquantity,
                                                            "platform_fee": dedd.fee_percentage,
                                                            "platform_value": dedd.fee_value,
                                                            "pair_id": dedd.pair_id

                                                        }
                                                        let insert_sellOrderTranMaster_sql = mysql.format("INSERT INTO transaction_master set ?", [insert_sellorderTran])

                                                        //let insert_sellOrderTranMaster_sql = "INSERT INTO transaction_master (status,trade_type,type,trade_id,customer_id,avg_price,created_at,price,total_amount,quantity,platform_fee,platform_value,pair_id) values ('Fully Executed','Sell','Limit','" + dedd.trade_id + "','" + dedd.customer_id + "','" + dedd.presentsell_price + "','" + created_at() + "','" + dedd.presentsell_price + "','" + dedd.presenttotal_price + "','" + dedd.presentquantity + "','" + dedd.fee_percentage + "','" + dedd.fee_value + "','" + pairId + "');"
                                                        console.log(insert_sellOrderTranMaster_sql)
                                                        connection.query(insert_sellOrderTranMaster_sql, function(err, insert_sellOrderTranMaster) {

                                                            if (err)
                                                                return reject(err)
                                                            // console.log("walletans", results.insertId)
                                                            var sell_buyData = [
                                                                [dedd.customer_id, 'Sell', dedd.type, dedd.trade_id, custId, dedd.transell_price, dedd.receWalletQuantity, 'Fully Executed', dedd.pair_id, created_at(), insert_sellOrderTranMaster.insertId],
                                                                [custId, 'Buy', 'Limit', buyOrderId, dedd.customer_id, dedd.transell_price, dedd.receWalletQuantity, 'Fully Executed', dedd.pair_id, created_at(), buyOrderTranid]
                                                            ]

                                                            let sell_buyOrder_sql = mysql.format("INSERT INTO transaction (customer_id,trade_type,type,trade_id,to_from_customer_id,price,quantity,status,pair_id,created_at,transanction_master_id) values ?", [sell_buyData])

                                                            //let sell_buyOrder_sql = "INSERT INTO transaction (customer_id,trade_type,type,trade_id,to_from_customer_id,price,quantity,status,pair_id,created_at,transanction_master_id) values ('" + dedd.customer_id + "','Sell','" + dedd.type + "','" + dedd.trade_id + "','" + custId + "','" + req.body.amount + "','" + dedd.presentquantity + "','Fully Executed','" + dedd.pair_id + "','" + created_at() + "','" + results.insertId + "'),('" + custId + "','Buy','Limit','" + limitbuyorderdata.insertId + "','" + dedd.customer_id + "','" + req.body.amount + "','" + dedd.presentquantity + "','Fully Executed','" + dedd.pair_id + "','" + created_at() + "','" + transmasterid.insertId + "');"
                                                            console.log(sell_buyOrder_sql)
                                                            connection.query(sell_buyOrder_sql, function(err, rows, fields) {
                                                                if (err)
                                                                    return reject(err)

                                                                let sellOrder_avgcal_sql = mysql.format("Select AVG(price) as avgprice from transaction where type=? and trade_type='Sell'and trade_id=?", [dedd.type, dedd.trade_id]);
                                                                console.log(sellOrder_avgcal_sql)
                                                                connection.query(sellOrder_avgcal_sql, function(err, avgcal) {
                                                                    if (err)
                                                                        return reject(err)

                                                                    console.log(avgcal[0].avgprice)

                                                                    let sellOrder_updatetranmaster_sql = mysql.format("UPDATE transaction_master SET status=?, avg_price=? where id= ?", [dedd.status, avgcal[0].avgprice, insert_sellOrderTranMaster.insertId]);
                                                                    console.log(sellOrder_updatetranmaster_sql)
                                                                    connection.query(sellOrder_updatetranmaster_sql, function(err, results) {
                                                                        if (err)
                                                                            return reject(err)
                                                                        console.log("walletans----------------------", results.insertId)
                                                                        return resolve(remainingquantity > 0)
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    } else {
                                                        var sell_buyTranData = [

                                                            [dedd.customer_id, 'Sell', dedd.type, dedd.trade_id, custId, dedd.transell_price, dedd.receWalletQuantity, 'Fully Executed', dedd.pair_id, created_at(), transactionmasterdata[0].id],
                                                            [custId, 'Buy', 'Limit', buyOrderId, dedd.customer_id, dedd.transell_price, dedd.receWalletQuantity, 'Fully Executed', dedd.pair_id, created_at(), buyOrderTranid]
                                                        ]

                                                        let sell_buyOrderTran_sql = mysql.format("INSERT INTO transaction (customer_id,trade_type,type,trade_id,to_from_customer_id,price,quantity,status,pair_id,created_at,transanction_master_id) values ? ", [sell_buyTranData])

                                                        console.log(sell_buyOrderTran_sql)
                                                        connection.query(sell_buyOrderTran_sql, function(err, rows, fields) {
                                                            if (err)
                                                                return reject(err)

                                                            let sellOrder_avgcal_sql = mysql.format("Select AVG(price) as avgprice from transaction where type=? and trade_type='Sell'and trade_id=?", [dedd.type, dedd.trade_id]);
                                                            console.log(sellOrder_avgcal_sql)
                                                            connection.query(sellOrder_avgcal_sql, function(err, avgcal) {
                                                                if (err)
                                                                    return reject(err)

                                                                console.log(avgcal[0].avgprice)

                                                                let sellOrder_updatetranmaster_sql = mysql.format("UPDATE transaction_master SET status=?,avg_price=? where id= ?", [dedd.status, avgcal[0].avgprice, transactionmasterdata[0].id]);
                                                                console.log(sellOrder_updatetranmaster_sql)
                                                                connection.query(sellOrder_updatetranmaster_sql, function(err, results) {
                                                                    if (err)
                                                                        return reject(err)
                                                                    console.log("walletans----------------------", results.insertId)
                                                                    return resolve(remainingquantity > 0)
                                                                })
                                                            })
                                                        })
                                                    }
                                                })
                                            })
                                        })
                                    })
                                })
                            }).then((rerun) => {
                                resolve(rerun)
                            }).catch((err) => {
                                reject(err)
                            })
                        }
                    })
                }).then((rerun) => {
                    if (rerun)
                        return insertOrders(buyOrderId, buyOrderTranid)
                    return Promise.resolve()
                })
            }

            function updatebuyOrder(buyOrderId, callback) {
                console.log("Call update buy order")
                console.log("remainingquantity", remainingquantity)
                var savequantity = 0;

                if (remainingquantity == receivedquantity) {
                    console.log("No updation required")
                    return callback()
                } else {



                    if (remainingquantity == 0 || remainingquantity < 0) {
                        var buysttus = 'Fully Executed'
                    } else if (remainingquantity < receivedquantity && remainingquantity > 0) {
                        var buysttus = 'Partially Executed'
                    } else if (remainingquantity == receivedquantity) {
                        var buysttus = 'Executed'
                    } else {
                        var buysttus = 'no status'
                    }
                    console.log(buysttus)

                    // var updatebuy = {

                    //     "status": buysttus,
                    //     "quantity": remainingquantity,
                    //     "buy_price": req.body.amount,
                    //     "total_price": dbtotal_price

                    // }
                    // console.log(updatebuy)
                    if (remainingquantity < 0) {
                        savequantity = 0;

                    } else {
                        savequantity = remainingquantity
                    }

                    var dbtotal_price = savequantity * req.body.amount;
                    console.log(dbtotal_price)


                    console.log("remainingquantity", savequantity)
                    let updateBuyOrder = mysql.format("Update buy SET status=?,quantity=?,total_price=?, platform_value=?  where id= ?", [buysttus, savequantity, dbtotal_price, feedata.fee_value, buyOrderId])

                    console.log(updateBuyOrder)
                    connection.query(updateBuyOrder, function(error, updatebuyorder) {
                        return callback(error, updatebuyorder);
                    })
                }
            }

            function updateBuyOrderTranMaster(buyOrderTranId, callback) {
                console.log("Call update buy order transaction")
                console.log("updatetran master id", buyOrderTranId)
                if (remainingquantity == receivedquantity) {
                    console.log("No updation required")
                    return callback()
                } else {
                    let buyOrder_avgcal_sql = mysql.format("Select AVG(price) as avgprice from transaction where transanction_master_id=?", [buyOrderTranId]);
                    console.log("buyorderavg", buyOrder_avgcal_sql)
                    connection.query(buyOrder_avgcal_sql, function(err, limitavgcal) {
                        if (err) {
                            console.log("Error while performing Query");
                            return callback(err);
                            reject(err)
                        } else if (limitavgcal[0].avgprice == null || limitavgcal[0].avgprice == undefined) {
                            console.log("No transcation yet")
                            return callback()
                        } else {
                            console.log(limitavgcal[0].avgprice)


                            if (remainingquantity == 0 || remainingquantity < 0) {
                                var buysttus = 'Fully Executed'
                            } else if (remainingquantity < receivedquantity && remainingquantity > 0) {
                                var buysttus = 'Partially Executed'
                            } else if (remainingquantity == receivedquantity) {
                                var buysttus = 'Executed'
                            } else {
                                var buysttus = 'no status'
                            }
                            console.log(buysttus)

                            let buyOrder_updatetranmaster_sql = mysql.format("UPDATE transaction_master SET avg_price=?, platform_value=?, status=? where id= ?", [limitavgcal[0].avgprice, feedata.fee_value, buysttus, buyOrderTranId]);
                            console.log("buyordertran", buyOrder_updatetranmaster_sql)
                            connection.query(buyOrder_updatetranmaster_sql, function(err, results) {

                                return callback(err, results)

                            })
                        }
                    })
                }

            }

            function feeCalAndWallet() {
                return new Promise((resolve, reject) => {
                    let sql2 = mysql.format("SELECT * FROM customer_wallet WHERE customer_id =? AND currency_code=?", [custId, pairto]);
                    connection.query(sql2, function(error, currentBalance) {
                        if (error) {
                            reject(err)
                        } else {
                            if (currentBalance[0].total_amount == 0) {
                                reject({ ecode: 1, message: "You have less amount amount to spend : 0" })
                            } else {
                                fiatwalletamount = currentBalance[0].total_amount
                                resolve(currentBalance)
                            }
                        }
                    })
                }).then((currentBalance) => {
                    return fee(currentBalance[0].total_amount)
                }).then(function(feecaldata) {
                    feedata = feecaldata
                    remainingquantity = feecaldata.calamount / req.body.amount;
                    receivedquantity = remainingquantity
                })
            }

            connection.beginTransaction(function(err) {
                if (err)
                    return reject(err)
                feeCalAndWallet().then(() => {
                    quantity = remainingquantity
                    buyOrder(function(err, buyOrderResult) {
                        if (err)
                            return rollback(connection, err)
                        insertOrders(buyOrderResult.insertId, buyOrderTranid).then(() => {
                            return new Promise((resolve, reject) => {
                                toWallet(function(err, walletResult) {
                                    if (err)
                                        return reject(err)
                                    updatebuyOrder(buyOrderResult.insertId, function(err, buyOrderResult) {
                                        if (err)
                                            return reject(err);
                                        updateBuyOrderTranMaster(buyOrderTranid, function(err, buyOrderTranMasterResult) {
                                            if (err)
                                                return reject(err)
                                            resolve()
                                        })
                                    })
                                })
                            })
                        }).then(() => {
                            commit(connection)
                        }).catch((err) => {
                            rollback(connection, err);
                        })
                    })
                }).catch((err) => {
                    rollback(connection, err)
                })
            })
        })
    }


    console.log("new limit api", (parseFloat(req.body.amount) * parseFloat(req.body.quantity) * parseFloat(req.btcPrice)))
    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    connection.query(sql, function(error, data) {
        //console.log(data)
        if (error) {
            res.json({ success: false, message: "error", error: error })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
           
            var pair_id = req.body.pair_id;
            let pair_sql = mysql.format("SELECT* FROM pair_master WHERE id =?", [pair_id]);
            //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
            connection.query(pair_sql, function(error, pairdata) {
                //console.log(data)
                if (error) {
                    res.json({ success: false, message: "error", error: error })
                } else if (pairdata[0] == null || pairdata[0] == undefined) {
                    res.json({ success: false, message: "Pair not found" })
                } else {
                    if (pairdata[0].status == 1) {
                        let tradelimit_sql = mysql.format(`Select*from trade_limit where currency_code=? and operation='Buy'`, [pairdata[0].to]);
                        console.log(tradelimit_sql)
                        connection.query(tradelimit_sql, function(error, tradelimitdata) {
                            if (error) {
                                res.json({ success: false, message: "Trade limit data not found", error: cm_cfg.errorFn(error) })
                            } else if (!tradelimitdata.length) {
                                res.json({ success: false, message: "Trade limit data not found", error: cm_cfg.errorFn(error) })
                            } else {

                                if ((req.body.amount * req.body.quantity) < tradelimitdata[0].min_amount) {
                                    res.json({ success: false, message: "Minimum trade limit is " + tradelimitdata[0].min_amount + "" })
                                } else {

                                    limitcustomerdb(data[0].id, req.body.pair_id, pairdata[0].from, pairdata[0].to)
                                        .then(function(finalstep) {
                                            if (orderArray.length) {
                                                let lastOrder = orderArray.pop()
                                                tickerSocketUpdate(lastOrder.transell_price, req.body.pair_id)
                                            }
                                            res.json({ success: true, message: finalstep })
                                        }).catch(function(err) {
                                            if (err.ecode)
                                                return res.json({ success: false, message: err.message })
                                            res.json({ success: false, message: 'Error', error: cm_cfg.errorFn(err) })
                                        })
                                }
                            }
                        })
                    } else {
                        res.json({ success: false, message: "This pair is inactive by the admin." })
                    }
                }
            })
            // }).catch(function(err) {
            //     res.json({ success: false, message: err })
            // })
        }
    })
}


exports.limitSellPlaceOrder = function(req, res) {

    var newtotal_price = 0;
    var orderArr = [];
    var percurrency_amount = 0;
    var newquantity = 0;
    var n, est = 0;
    var feecalarr = [];
    var foundquantity;
    var remainingtotal_price;
    var marketorder = [];
    var percentage_amount = 0;
    // var max_amount = 0;
    // var low_amount = 0;
    var remainingquantity = 0;
    var orderArray = []
    var sellOrderid;
    var sellOrderTranid = 0;
    var feedata;
    var crpytowalletamount;
    var receivedquantity;
    var quantity = 0;

    function fee(walletinfo) {

        return new Promise(function(resolve, reject) {

            console.log("fee walletinfo", walletinfo)

            var fee_value = 0;
            var calquantity = 0;
            var walletdedquantity = 0;

            let sql1 = "Select*from commission where currency_code=" + mysql.escape(req.body.currency_code) + "and operation='Sell';"
            //console.log(sql1)
            connection.query(sql1, function(error, data) {
                if (error) {
                    reject("fee error", error)
                } else if (data[0] == null || data[0] == undefined) {
                    reject({ ecode: 1, message: "fee data not found" })
                } else {
                    // console.log("fee data", data)
                    if (walletinfo == req.body.quantity) {
                        console.log("min %", data[0].min_percentage)

                        fee_value = (data[0].min_percentage * req.body.quantity) / 100;

                        if (fee_value < data[0].min_amount && data[0].min_amount != 0) {

                            calquantity = parseFloat(req.body.quantity) - parseFloat(data[0].min_amount);
                            walletdedquantity = req.body.quantity;

                            if (walletdedquantity <= walletinfo && calquantity > 0) {
                                feecalarr.push({ fee_percentage: 0, fee_value: data[0].min_amount, calquantity: calquantity, walletdedquantity: walletdedquantity })
                                // return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                resolve({ fee_percentage: 0, fee_value: data[0].min_amount, calquantity: calquantity, walletdedquantity: walletdedquantity })
                            } else {
                                reject({ ecode: 1, message: "You have less money in your wallet included fee" })
                            }

                        } else { // fee value greater than mini amount

                            calquantity = parseFloat(req.body.quantity) - fee_value;
                            walletdedquantity = req.body.quantity;

                            if (walletdedquantity <= walletinfo && calquantity > 0) {

                                feecalarr.push({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                //return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                resolve({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })
                            } else {
                                reject({ ecode: 1, message: "You have less money in your wallet included fee" })
                            }
                        }

                    } else if (walletinfo > req.body.quantity) {
                        console.log("wallet is greater than quantity")

                        fee_value = (data[0].min_percentage * req.body.quantity) / 100;

                        if (fee_value < data[0].min_amount && data[0].min_amount != 0) {
                            calquantity = req.body.quantity;
                            walletdedquantity = parseFloat(req.body.quantity) + parseFloat(data[0].min_amount);

                            if (walletdedquantity <= walletinfo && calquantity > 0) { // to check deducted amount present in wallet aur not


                                feecalarr.push({ fee_percentage: 0, fee_value: data[0].min_amount, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                //return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                resolve({ fee_percentage: 0, fee_value: data[0].min_amount, calquantity: calquantity, walletdedquantity: walletdedquantity })
                            } else {
                                reject({ ecode: 1, message: "You have less money in your wallet included fee" })
                            }
                        } else {

                            calquantity = req.body.quantity;
                            walletdedquantity = parseFloat(req.body.quantity) + fee_value;

                            if (walletdedquantity <= walletinfo && calquantity > 0) {
                                feecalarr.push({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })
                                // return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                resolve({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })
                            } else {
                                reject({ ecode: 1, message: "You have less money in your wallet included fee" })
                            }
                        }

                    } else {
                        //console.log("Nothing to do in fee")

                        fee_value = (data[0].min_percentage * walletinfo) / 100;

                        if (fee_value < data[0].min_amount && data[0].min_amount != 0) {

                            calquantity = parseFloat(walletinfo) - parseFloat(data[0].min_amount);
                            walletdedquantity = walletinfo;

                            if (walletdedquantity <= walletinfo && calquantity > 0) {
                                //feecalarr.push({ fee_percentage: 0, fee_value: data[0].min_amount, calamount: calamount, walletdedamount: walletdedamount })
                                // return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                resolve({ fee_percentage: 0, fee_value: data[0].min_amount, calquantity: calquantity, walletdedquantity: walletdedquantity })
                            } else {
                                reject({ ecode: 1, message: "You have less money in your wallet included fee" })
                            }

                        } else {

                            calquantity = parseFloat(walletinfo) - fee_value;
                            walletdedquantity = walletinfo;

                            if (walletdedquantity <= walletinfo && calquantity > 0) {

                                //feecalarr.push({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calamount: calamount, walletdedamount: walletdedamount })
                                //return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                resolve({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })
                            } else {
                                reject({ ecode: 1, message: "You have less money in your wallet included fee" })
                            }
                        }
                    }


                }
            })

        })
    }


    function cal(quantity, topdata, n) {
        // return new Promise(function(resolve, reject) {

        if (topdata[n].type == 'Market') {

            let totalPrice = Math.min(quantity * req.body.amount, topdata[n].total_price)
            let newTotalPrice = topdata[n].total_price - totalPrice
            let receWalletQuantity = totalPrice / req.body.amount

            return {
                n: n,
                quantity: quantity,
                presentquantity: topdata[n].quantity,
                presenttotal_price: topdata[n].total_price,
                money: totalPrice,
                trade_id: topdata[n].id,
                customer_id: topdata[n].customer_id,
                pair_id: topdata[n].pair_id,
                newquantity: quantity - receWalletQuantity,
                fee_percentage: topdata[n].platform_fee,
                fee_value: topdata[n].platform_value,
                buy_price: req.body.amount,
                type: topdata[n].type,
                presentbuy_price: topdata[n].buy_price,
                status: newTotalPrice ? 'Partially Executed' : 'Fully Executed',
                receWalletQuantity,
                newTotalPrice
            }
        } else { // if type= limit
            console.log("quantity", quantity)
            console.log(topdata)
            console.log("index", n)
            //console.log("reeamount", receivingAmount)

            newquantity = quantity - topdata[n].quantity;
            //console.log("nq", newquantity)

            if (topdata[n].quantity < quantity && topdata[n].quantity > 0 && newquantity > 0) {
                console.log("tp", topdata[n])
                newtotal_price = topdata[n].total_price;
                console.log("ntp", newtotal_price)
                //remainingtotal_price = receivingAmount - newtotal_price

                if (topdata[n].quantity <= quantity) {
                    obj = { n: n, quantity: quantity, presentquantity: topdata[n].quantity, presenttotal_price: topdata[n].total_price, money: newtotal_price, trade_id: topdata[n].id, customer_id: topdata[n].customer_id, pair_id: topdata[n].pair_id, newquantity: Math.abs(newquantity), fee_percentage: topdata[n].platform_fee, fee_value: topdata[n].platform_value, buy_price: topdata[n].buy_price, type: topdata[n].type, presentbuy_price: topdata[n].buy_price, status: 'Fully Executed', receWalletQuantity: topdata[n].quantity }
                    //ded.push(obj)
                    return (parseFloat(newtotal_price), obj)
                    // resolve (parseFloat(newtotal_price) + cal(newquantity, topdata, n - 1))

                } else {
                    obj = { n: n, quantity: quantity, presentquantity: topdata[n].quantity, presenttotal_price: topdata[n].total_price, money: newtotal_price, trade_id: topdata[n].id, customer_id: topdata[n].customer_id, pair_id: topdata[n].pair_id, newquantity: Math.abs(newquantity), fee_percentage: topdata[n].platform_fee, fee_value: topdata[n].platform_value, buy_price: topdata[n].buy_price, type: topdata[n].type, presentbuy_price: topdata[n].buy_price, status: 'Partially Executed', receWalletQuantity: quantity }
                    // partiallded.push(obj)
                    return (parseFloat(newtotal_price), obj)
                    //resolve (parseFloat(newtotal_price) + cal(newquantity, topdata, n - 1))
                }

            } else if (topdata[n].quantity >= quantity || newquantity <= 0) {

                console.log("partp", topdata[n])
                percurrency_amount = topdata[n].total_price / topdata[n].quantity;
                newtotal_price = percurrency_amount * quantity;
                console.log("network price", newtotal_price)
                // console.log("pa", percurrency_amount)
                if (topdata[n].quantity <= quantity) {

                    obj = { n: n, quantity: quantity, presentquantity: topdata[n].quantity, presenttotal_price: topdata[n].total_price, money: newtotal_price, trade_id: topdata[n].id, customer_id: topdata[n].customer_id, pair_id: topdata[n].pair_id, newquantity: Math.abs(newquantity), fee_percentage: topdata[n].platform_fee, fee_value: topdata[n].platform_value, buy_price: topdata[n].buy_price, type: topdata[n].type, presentbuy_price: topdata[n].buy_price, status: 'Fully Executed', receWalletQuantity: topdata[n].quantity }
                    // ded.push(obj)
                    return (parseFloat(newtotal_price), obj)
                    //resolve (parseFloat(newtotal_price))
                } else {
                    obj = { n: n, quantity: quantity, presentquantity: topdata[n].quantity, presenttotal_price: topdata[n].total_price, money: newtotal_price, trade_id: topdata[n].id, customer_id: topdata[n].customer_id, pair_id: topdata[n].pair_id, newquantity: Math.abs(newquantity), fee_percentage: topdata[n].platform_fee, fee_value: topdata[n].platform_value, buy_price: topdata[n].buy_price, type: topdata[n].type, presentbuy_price: topdata[n].buy_price, status: 'Partially Executed', receWalletQuantity: quantity }
                    //partiallded.push(obj)
                    return (parseFloat(newtotal_price), obj)
                    //resolve (parseFloat(newtotal_price))
                }

            } else {
                return 0
            }
            // })
        }
    }



    function limitcustomerdb(custId, pairId, pairfrom, pairto) {

        return new Promise(function(resolve, reject) {

            console.log("persent wallet amount of that currency ", crpytowalletamount)
            console.log("after sell currency recevied amount", receivedquantity)

            function rollback(connection, err) {
                connection.rollback(function() {
                    reject(err)
                });
            }

            function commit(connection) {
                connection.commit(function(err) {
                    if (err) {
                        return rollback(connection, err);
                    }

                    console.log('success!')
                    return resolve('Your order successfully placed')
                });
            }


            function sellOrder(callback) {

                var dbtotal_price = feedata.calquantity * req.body.amount;

                var insertsell = {
                    "customer_id": custId,
                    "pair_id": req.body.pair_id,
                    "status": 'Executed',
                    "type": 'Limit',
                    "quantity": feedata.calquantity,
                    "sell_price": req.body.amount,
                 
                    "total_price": dbtotal_price,
                    "created_at": created_at(),
                    "platform_fee": feedata.fee_percentage,
                    "platform_value": feedata.fee_value
                    
                }

                let sql1 = mysql.format("INSERT INTO sell SET ?", [insertsell])

                console.log(sql1)
                connection.query(sql1, function(error, sellorderdata) {
                    //console.log(sellorderdata)
                    //console.log(error)
                    return callback(error, sellorderdata);
                })
            }


            function sellOrderTranMaster(sellOrderId, callback) {
                var dbtotal_price = feedata.calquantity * req.body.amount;

                var insertSellTran = {
                    "status": 'Executed',
                    "trade_type": 'Sell',
                    "type": 'Limit',
                    "trade_id": sellOrderId,
                    "customer_id": custId,
                    "created_at": created_at(),
                    "total_amount": dbtotal_price,
                    "price": req.body.amount,
                    "quantity": feedata.calquantity, //req.body.quantity
                    "platform_fee": feedata.fee_percentage,
                    "platform_value": feedata.fee_value,
                    "pair_id": pairId

                }

                let sellOrderTranMaster = mysql.format("INSERT INTO transaction_master set ?", [insertSellTran])

                console.log(sellOrderTranMaster)
                connection.query(sellOrderTranMaster, function(err, transmasterid) {
                    return callback(err, transmasterid);
                })
            }


            function fromWallet(callback) {
                console.log("crpytowalletamount", crpytowalletamount)
                console.log("dedcuteamount", feedata.walletdedquantity)

                var presentBalance = crpytowalletamount - feedata.walletdedquantity;
                console.log("total money updated to the wallet after sell", presentBalance)
                let sendWallet_sql = mysql.format("UPDATE customer_wallet SET total_amount = ? WHERE customer_id=? AND currency_code=?", [presentBalance, custId, pairfrom]);

                console.log(sendWallet_sql)
                connection.query(sendWallet_sql, function(err, walletResponse) {
                    return callback(err, walletResponse);
                })
            }

            function insertOrders(sellOrderId, sellOrderTranId) {

                return new Promise((resolve, reject) => {
                    let sellOrder = mysql.format("Select*from buy where ((((type='Limit' and buy_price>=?) or type='Market')and (status='Executed'or status='Partially Executed'))and pair_id=?)and customer_id!=? order by buy_price desc ,created_at asc limit 1", [req.body.amount, req.body.pair_id, custId]);
                    console.log(sellOrder)
                    connection.query(sellOrder, function(error, orderdata) {
                        if (error) {
                            return reject(err)
                        } else if (orderdata[0] == null || orderdata[0] == undefined) {
                            //res.json({ success: false, message: "No Order" });
                            console.log("NO order")
                            return resolve(false);
                        } else {

                            new Promise((resolve, reject) => {
                                if (remainingquantity == quantity) {
                                    // console.log("orderArray", orderArray)
                                    //console.log(" order found no action perform")
                                    //var result = "NO user found for sell";

                                    sellOrderTranMaster(sellOrderId, function(err, sellOrderTranMasterResult) {
                                        if (err)
                                            return reject(err);
                                        sellOrderTranid = sellOrderTranMasterResult.insertId
                                        resolve()
                                    })
                                } else {
                                    resolve()
                                }
                            }).then(() => {

                                return new Promise((resolve, reject) => {
                                    dedd = cal(remainingquantity, orderdata, 0)
                                    console.log("final", dedd)
                                    orderArr.push(dedd)
                                    // remainingquantity = quantity
                                    console.log("before remainingquantity", remainingquantity)

                                    remainingquantity = remainingquantity - dedd.receWalletQuantity
                                    console.log("remainingquantity", remainingquantity)
                                    orderArray.push(dedd)
                                    var walletnewbalance = (dedd.receWalletQuantity * dedd.buy_price);

                                    let receWallet = mysql.format("UPDATE customer_wallet SET total_amount =`total_amount` + ? WHERE customer_id=? AND currency_code=?", [walletnewbalance, custId, pairto]);
                                    console.log(receWallet)
                                    connection.query(receWallet, function(err, receWalletData) {
                                        if (err)
                                            return reject(err)
                                        // var customerwalletnewbalance = (dedd.receWalletQuantity * req.body.amount);
                                        //console.log("sell custo wallet total", customerwalletnewbalance)

                                        let buyCustomerWallet_sql = mysql.format("UPDATE customer_wallet SET total_amount =`total_amount` + ? WHERE customer_id= ? AND currency_code=?", [dedd.receWalletQuantity, dedd.customer_id, pairfrom]);
                                        console.log(buyCustomerWallet_sql)
                                        connection.query(buyCustomerWallet_sql, function(err, rows, fields) {
                                            if (err)
                                                return reject(err)

                                            var buyOrderQunatity = dedd.type == 'Market' ? 0 : (dedd.presentquantity - dedd.receWalletQuantity);

                                            var comtatal_price = dedd.type == 'Market' ? dedd.newTotalPrice : (buyOrderQunatity * dedd.presentbuy_price);

                                            let buyOrder_sql = mysql.format("UPDATE buy SET status =? ,quantity=? ,total_price=? WHERE id =?", [dedd.status, buyOrderQunatity, comtatal_price, dedd.trade_id]);
                                            console.log(buyOrder_sql)
                                            connection.query(buyOrder_sql, function(err, rows, fields) {
                                                if (err)
                                                    return reject(err)
                                                //console.log("done")
                                                console.log(" oredr trade id", dedd.trade_id)

                                                let select_buyOrderTranMaster_sql = mysql.format("Select*from transaction_master where trade_type ='Buy' and trade_id=?", [dedd.trade_id]);
                                                console.log('select_buyOrderTranMaster_sql', select_buyOrderTranMaster_sql)
                                                connection.query(select_buyOrderTranMaster_sql, function(err, transactionmasterdata) {
                                                    if (err)
                                                        return reject(err)

                                                    if (!transactionmasterdata.length) {

                                                        console.log(transactionmasterdata)

                                                        var insert_buyorderTran = {
                                                            "status": dedd.status,
                                                            "trade_type": 'Buy',
                                                            "type": dedd.type,
                                                            "trade_id": dedd.trade_id,
                                                            "customer_id": dedd.customer_id,
                                                            "avg_price": dedd.presentbuy_price,
                                                            "created_at": created_at(),
                                                            "price": dedd.presentbuy_price,
                                                            "total_amount": dedd.presenttotal_price,
                                                            "quantity": dedd.presentquantity,
                                                            "platform_fee": dedd.fee_percentage,
                                                            "platform_value": dedd.fee_value,
                                                            "pair_id": dedd.pair_id

                                                        }
                                                        let insert_buyOrderTranMaster_sql = mysql.format("INSERT INTO transaction_master set ?", insert_buyorderTran)


                                                        console.log(insert_buyOrderTranMaster_sql)
                                                        connection.query(insert_buyOrderTranMaster_sql, function(err, insert_buyOrderTranMaster) {

                                                            if (err)
                                                                return reject(err)

                                                            // console.log("walletans", results.insertId)
                                                            var sell_buyData = [

                                                                [dedd.customer_id, 'Buy', dedd.type, dedd.trade_id, custId, dedd.buy_price, dedd.receWalletQuantity, 'Fully Executed', dedd.pair_id, created_at(), insert_buyOrderTranMaster.insertId],
                                                                [custId, 'Sell', 'Limit', sellOrderId, dedd.customer_id, dedd.buy_price, dedd.receWalletQuantity, 'Fully Executed', dedd.pair_id, created_at(), sellOrderTranid]
                                                            ]
                                                            let sell_buyOrder_sql = mysql.format("INSERT INTO transaction (customer_id,trade_type,type,trade_id,to_from_customer_id,price,quantity,status,pair_id,created_at,transanction_master_id) values ?", [sell_buyData])

                                                            console.log(sell_buyOrder_sql)
                                                            connection.query(sell_buyOrder_sql, function(err, rows, fields) {
                                                                if (err)
                                                                    return reject(err)

                                                                let buyOrder_avgcal_sql = mysql.format("Select AVG(price) as avgprice from transaction where type=? and trade_type='Buy'and trade_id=?", [dedd.type, dedd.trade_id]);
                                                                console.log(buyOrder_avgcal_sql)
                                                                connection.query(buyOrder_avgcal_sql, function(err, avgcal) {
                                                                    if (err)
                                                                        return reject(err)

                                                                    console.log(avgcal[0].avgprice)
                                                                    let buyOrder_updatetranmaster_sql = mysql.format("UPDATE transaction_master SET status=?, avg_price=? where id= ?", [dedd.status, avgcal[0].avgprice, insert_buyOrderTranMaster.insertId]);
                                                                    console.log(buyOrder_updatetranmaster_sql)
                                                                    connection.query(buyOrder_updatetranmaster_sql, function(err, results) {
                                                                        if (err)
                                                                            return reject(err)
                                                                        console.log("walletans----------------------")
                                                                        return resolve(remainingquantity > 0)
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    } else {
                                                        var sell_buyTranData = [

                                                            [dedd.customer_id, 'Buy', dedd.type, dedd.trade_id, custId, dedd.buy_price, dedd.receWalletQuantity, 'Fully Executed', dedd.pair_id, created_at(), transactionmasterdata[0].id],
                                                            [custId, 'Sell', 'Limit', sellOrderId, dedd.customer_id, dedd.buy_price, dedd.receWalletQuantity, 'Fully Executed', dedd.pair_id, created_at(), sellOrderTranid]
                                                        ]

                                                        let sell_buyOrderTran_sql = mysql.format("INSERT INTO transaction (customer_id,trade_type,type,trade_id,to_from_customer_id,price,quantity,status,pair_id,created_at,transanction_master_id) values ? ", [sell_buyTranData])

                                                        console.log(sell_buyOrderTran_sql)
                                                        connection.query(sell_buyOrderTran_sql, function(err, rows, fields) {
                                                            if (err)
                                                                return reject(err)

                                                            let buyOrder_avgcal_sql = mysql.format("Select AVG(price) as avgprice from transaction where type=? and trade_type='Buy'and trade_id=?", [dedd.type, dedd.trade_id]);
                                                            console.log(buyOrder_avgcal_sql)
                                                            connection.query(buyOrder_avgcal_sql, function(err, avgcal) {
                                                                if (err)
                                                                    return reject(err)

                                                                console.log(avgcal[0].avgprice)

                                                                let buyOrder_updatetranmaster_sql = mysql.format("UPDATE transaction_master SET status=?,avg_price=? where id= ?", [dedd.status, avgcal[0].avgprice, transactionmasterdata[0].id]);
                                                                console.log(buyOrder_updatetranmaster_sql)
                                                                connection.query(buyOrder_updatetranmaster_sql, function(err, results) {
                                                                    if (err)
                                                                        return reject(err)

                                                                    console.log("walletans----------------------")
                                                                    return resolve(remainingquantity > 0)
                                                                })
                                                            })
                                                        })
                                                    }
                                                })
                                            })
                                        })
                                    })
                                })
                            }).then((rerun) => {
                                resolve(rerun)
                            }).catch((err) => {
                                reject(err)
                            })
                        }
                    })
                }).then((rerun) => {
                    if (rerun)
                        return insertOrders(sellOrderId, sellOrderTranId)
                    return Promise.resolve()
                })
            }

            function updateSellOrder(sellOrderId, callback) {
                console.log("call in sell order")
                console.log("remainingquantity", remainingquantity)
                var savequantity = 0;

                if (remainingquantity == receivedquantity) {
                    console.log("NO updation required")
                    return callback()

                } else {


                    if (remainingquantity == 0 || remainingquantity < 0) {
                        var sellsttus = 'Fully Executed'
                    } else if (remainingquantity < receivedquantity && remainingquantity > 0) {
                        var sellsttus = 'Partially Executed'
                    } else if (remainingquantity == receivedquantity) {
                        var sellsttus = 'Executed'
                    } else {
                        var sellsttus = 'no status'
                    }
                    console.log(sellsttus)


                    if (remainingquantity < 0) {
                        savequantity = 0;

                    } else {
                        savequantity = remainingquantity
                    }


                    var dbtotal_price = savequantity * req.body.amount;
                    console.log(dbtotal_price)

                    // var updatebuy = {

                    //     "status": sellsttus,
                    //     "quantity": remainingquantity,
                    //     "buy_price": req.body.amount,
                    //     "total_price": dbtotal_price

                    // }
                    // console.log(updatebuy)
                    console.log("remainingquantity", savequantity)
                    let updateSellOrder = mysql.format("Update sell SET status=?,quantity=?,total_price=? where id= ?", [sellsttus, savequantity, dbtotal_price, sellOrderId])

                    console.log(updateSellOrder)
                    connection.query(updateSellOrder, function(error, updatesellorder) {
                        return callback(error, updatesellorder);
                    })
                }
            }

            function updateSellOrderTranMaster(sellOrderTranId, callback) {
                console.log("call in sell order transaction master")
                console.log("updatetran master id", sellOrderTranId)

                if (remainingquantity == receivedquantity) {
                    console.log("No updation required")
                    return callback()
                } else {
                    let sellOrder_avgcal_sql = mysql.format("Select AVG(price) as avgprice from transaction where transanction_master_id=?", [sellOrderTranId]);
                    console.log("sellorderavg", sellOrder_avgcal_sql)
                    connection.query(sellOrder_avgcal_sql, function(err, limitavgcal) {
                        if (err) {
                            console.log("Error while performing Query");
                            return callback(err);
                            reject(err)
                        } else if (limitavgcal[0].avgprice == null || limitavgcal[0].avgprice == undefined) {
                            console.log("NO transaction yet")
                            return callback()


                        } else {
                            console.log(limitavgcal[0].avgprice)


                            if (remainingquantity == 0 || remainingquantity < 0) {
                                var sellsttus = 'Fully Executed'
                            } else if (remainingquantity < receivedquantity) {
                                var sellsttus = 'Partially Executed'
                            } else if (remainingquantity == receivedquantity && remainingquantity > 0) {
                                var sellsttus = 'Executed'
                            } else {
                                var sellsttus = 'no status'
                            }
                            console.log(sellsttus)

                            let sellOrder_updatetranmaster_sql = mysql.format("UPDATE transaction_master SET avg_price=?, status=? where id= ?", [limitavgcal[0].avgprice, sellsttus, sellOrderTranId]);
                            console.log("sellordertran", sellOrder_updatetranmaster_sql)
                            connection.query(sellOrder_updatetranmaster_sql, function(err, results) {

                                return callback(err, results)

                            })
                        }
                    })
                }

            }

            function feeCalAndWallet() {
                return new Promise((resolve, reject) => {
                    connection.query("SELECT * FROM customer_wallet WHERE customer_id =? AND currency_code=?", [custId, pairfrom], (err, currentBalance) => {
                        if (err)
                            return reject(err)
                        if (currentBalance[0].total_amount == 0)
                            return reject({ ecode: 1, message: "You have 0 amount to spend" })
                        crpytowalletamount = currentBalance[0].total_amount
                        resolve(currentBalance)
                    })
                }).then((currentBalance) => {
                    return fee(currentBalance[0].total_amount)
                }).then((feecaldata) => {
                    feedata = feecaldata
                    remainingquantity = feecaldata.calquantity
                    receivedquantity = feecaldata.calquantity
                })
            }

            connection.beginTransaction(function(err) {
                if (err)
                    return reject(err)

                feeCalAndWallet().then(() => {
                    sellOrder(function(err, sellOrderResult) {
                        if (err)
                            return rollback(connection, err)

                        fromWallet(function(err, walletResult) {
                            if (err)
                                return rollback(connection, err)

                            quantity = receivedquantity

                            return insertOrders(sellOrderResult.insertId, sellOrderTranid).then(() => {
                                return new Promise((resolve, reject) => {
                                    updateSellOrder(sellOrderResult.insertId, function(err, sellOrderResultData) {
                                        if (err)
                                            return reject(err)
                                        updateSellOrderTranMaster(sellOrderTranid, function(err, sellOrderTranMasterResult) {
                                            if (err)
                                                return reject(err)
                                            resolve()
                                        })
                                    })
                                })
                            }).then(() => {
                                commit(connection)
                            }).catch((err) => {
                                rollback(connection, err)
                            })
                        })
                    })
                }).catch((err) => {
                    rollback(connection, err)
                })
            });
        })
        //})
    }



    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    connection.query(sql, function(error, data) {
        //console.log(data)
        if (error) {
            res.json({ success: false, message: "error", error: error })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            
                var pair_id = req.body.pair_id;
                let pair_sql = mysql.format("SELECT * FROM pair_master WHERE id =?", [pair_id]);

                connection.query(pair_sql, function(error, pairdata) {
                    //console.log(data)
                    if (error) {
                        res.json({ success: false, message: "error", error: error })
                    } else if (pairdata[0] == null || pairdata[0] == undefined) {
                        res.json({ success: false, message: "Pair not found" })
                    } else {
                        if (pairdata[0].status == 1) {
                            let tradelimit_sql = mysql.format("Select*from trade_limit where currency_code=? and operation='Sell'", [pairdata[0].from]);
                            console.log(tradelimit_sql)
                            connection.query(tradelimit_sql, function(error, tradelimitdata) {
                                if (error) {
                                    console.log("fee error", error)
                                    res.json({ success: false, message: 'fee error', error: cm_cfg.errorFn(error) })
                                } else if (tradelimitdata[0] == null || tradelimitdata[0] == undefined) {
                                    console.log("Trade limit data not found")
                                    res.json({ success: false, message: 'Trade limit data not found', error: cm_cfg.errorFn(error) })
                                } else {
                                    //console.log(data)
                                    if (req.body.quantity < tradelimitdata[0].min_amount) {
                                        res.json({ success: false, message: "Minimum trade limit is " + tradelimitdata[0].min_amount + "" })
                                    } else {
                                        // if (pairdata[0].last_trade_price == 0) {
                                        //     max_amount = req.body.amount
                                        //     low_amount = req.body.amount
                                        // } else {

                                        //     percentage_amount = (pairdata[0].last_trade_price * 20) / 100;


                                        //     max_amount = pairdata[0].last_trade_price + percentage_amount;
                                        //     low_amount = pairdata[0].last_trade_price - percentage_amount;
                                        // }
                                        // console.log("low amount",low_amount)
                                        // console.log("max amount", max_amount)

                                        // if (req.body.amount < low_amount) {
                                        //     res.json({ success: false, message: "Price cannot be lesser than : " + low_amount + ""+req.body.currency_code+ ""});
                                        // } else if (req.body.amount > max_amount) {
                                        //     res.json({ success: false, message: "Price cannot be greater than : " + max_amount + ""+req.body.currency_code+"" });
                                        // } else {
                                        limitcustomerdb(data[0].id, req.body.pair_id, pairdata[0].from, pairdata[0].to)
                                            .then(function(finalstep) {
                                                if (orderArray.length) {
                                                    let lastOrder = orderArray.pop()
                                                    let price = lastOrder.type === 'Market' ? req.body.amount : lastOrder.buy_price
                                                    tickerSocketUpdate(price, req.body.pair_id)
                                                }
                                                res.json({ success: true, message: finalstep })
                                            }, function(err) {
                                                if (err.ecode)
                                                    return res.json({ success: false, message: err.message })
                                                res.json({ success: false, message: 'Error', error: cm_cfg.errorFn(err) })
                                            })
                                    }
                                }
                            })

                        } else {
                            res.json({ success: false, message: "This pair is inactive by the admin " })
                        }
                    }
                })
            

        }
    })
}


exports.marketSellOrder = function(req, res) {

    var newtotal_price = 0;
    var percurrency_amount = 0;
    var newquantity = 0;
    var n, est = 0;
    // var ded = [];
    // var partiallded = [];
    var feecalarr = [];
    var marketorderstatus;
    var marketorderquantity = 0;
    var orderArray = [];
    var sellOrderTranid;
    var sellOrderid;
    var remainingquantity = 0;
    var recamount = 0;
    var presentwalletamount = 0;
    var feedata = 0;

    function fee(walletinfo) {

        return new Promise(function(resolve, reject) {

            console.log("fee walletinfo", walletinfo)

            var fee_value = 0,
                fee_val = 0;;
            var calquantity = 0;
            var walletdedquantity = 0;

            let sql1 = "Select*from commission where currency_code=" + mysql.escape(req.body.currency_code) + "and operation='Sell';"
            //console.log(sql1)
            connection.query(sql1, function(error, data) {
                if (error) {
                    reject("fee error", error)
                } else if (data[0] == null || data[0] == undefined) {
                    reject("fee data not found")
                } else {
                    console.log("fee data", data)
                    if (walletinfo == req.body.quantity) {
                        console.log("min %", data[0].min_percentage)

                        fee_value = (data[0].min_percentage * req.body.quantity) / 100;

                        if (fee_value < data[0].min_amount && data[0].min_amount != 0) {

                            calquantity = parseFloat(req.body.quantity) - parseFloat(data[0].min_amount);
                            walletdedquantity = req.body.quantity;

                            if (walletdedquantity <= walletinfo && calquantity > 0) {
                                feecalarr.push({ fee_percentage: 0, fee_value: data[0].min_amount, calquantity: calquantity, walletdedquantity: walletdedquantity })
                                // return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                resolve({ fee_percentage: 0, fee_value: data[0].min_amount, calquantity: calquantity, walletdedquantity: walletdedquantity })
                            } else {
                                reject("You have less money in your wallet included fee")
                            }

                        } else { // fee value greater than mini amount

                            calquantity = parseFloat(req.body.quantity) - fee_value;
                            fee_val = (data[0].min_percentage * calquantity) / 100; ///chnage here for cal
                            //console.log(fee_val)
                            walletdedquantity = calquantity + fee_val;

                            if (walletdedquantity <= walletinfo && calquantity > 0) {

                                feecalarr.push({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                //return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                resolve({ fee_percentage: data[0].min_percentage, fee_value: fee_val, calquantity: calquantity, walletdedquantity: walletdedquantity })
                            } else {
                                reject("You have less money in your wallet included fee")
                            }
                        }

                    } else if (walletinfo > req.body.quantity) {
                        console.log("wallet is greater than quantity")

                        fee_value = (data[0].min_percentage * req.body.quantity) / 100;

                        if (fee_value < data[0].min_amount && data[0].min_amount != 0) {
                            calquantity = req.body.quantity;
                            walletdedquantity = parseFloat(req.body.quantity) + parseFloat(data[0].min_amount);

                            if (walletdedquantity <= walletinfo && calquantity > 0) { // to check deducted amount present in wallet aur not


                                feecalarr.push({ fee_percentage: 0, fee_value: data[0].min_amount, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                //return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                resolve({ fee_percentage: 0, fee_value: data[0].min_amount, calquantity: calquantity, walletdedquantity: walletdedquantity })
                            } else {
                                reject("You have less money in your wallet included fee")
                            }
                        } else {

                            calquantity = req.body.quantity;
                            walletdedquantity = parseFloat(req.body.quantity) + fee_value;

                            if (walletdedquantity <= walletinfo && calquantity > 0) {
                                feecalarr.push({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })
                                // return ({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })

                                resolve({ fee_percentage: data[0].min_percentage, fee_value: fee_value, calquantity: calquantity, walletdedquantity: walletdedquantity })
                            } else {
                                reject("You have less money in your wallet included fee")
                            }
                        }

                    } else {
                        reject("Nothing to do")
                    }


                }
            })

        })
    }


    function cal(quantity, topdata, n) {

        // return new Promise(function(resolve, reject) {
        console.log("quantity", quantity)
        console.log(topdata)
        console.log("index", n)

        newquantity = Number(quantity - topdata[n].quantity).toFixed(6);
        //console.log("nq", newquantity)

        if (topdata[n].quantity < quantity && topdata[n].quantity > 0 && newquantity > 0) {
            console.log("tp", topdata[n])
            newtotal_price = topdata[n].total_price;
            console.log("ntp", newtotal_price)

            if (topdata[n].quantity <= quantity) {
                obj = { n: n, quantity: quantity, presentquantity: topdata[n].quantity, presenttotal_price: topdata[n].total_price, money: newtotal_price, trade_id: topdata[n].id, customer_id: topdata[n].customer_id, pair_id: topdata[n].pair_id, newquantity: Math.abs(newquantity), fee_percentage: topdata[n].platform_fee, fee_value: topdata[n].platform_value, buy_price: topdata[n].buy_price, status: "Fully Executed", receWalletQuantity: topdata[n].quantity }
                //   ded.push(obj)
                return (obj)
                // resolve (parseFloat(newtotal_price) + cal(newquantity, topdata, n - 1))

            } else {
                obj = { n: n, quantity: quantity, presentquantity: topdata[n].quantity, presenttotal_price: topdata[n].total_price, money: newtotal_price, trade_id: topdata[n].id, customer_id: topdata[n].customer_id, pair_id: topdata[n].pair_id, newquantity: Math.abs(newquantity), fee_percentage: topdata[n].platform_fee, fee_value: topdata[n].platform_value, buy_price: topdata[n].buy_price, status: "Partially Executed", receWalletQuantity: quantity }
                //   partiallded.push(obj)
                return (obj)
                //resolve (parseFloat(newtotal_price) + cal(newquantity, topdata, n - 1))
            }

        } else if (topdata[n].quantity >= quantity || newquantity <= 0) {

            console.log("partp", topdata[n])
            percurrency_amount = topdata[n].total_price / topdata[n].quantity;
            newtotal_price = percurrency_amount * quantity;
            console.log("network price", newtotal_price)
            // console.log("pa", percurrency_amount)
            if (topdata[n].quantity <= quantity) {

                obj = { n: n, quantity: quantity, presentquantity: topdata[n].quantity, presenttotal_price: topdata[n].total_price, money: newtotal_price, trade_id: topdata[n].id, customer_id: topdata[n].customer_id, pair_id: topdata[n].pair_id, newquantity: Math.abs(newquantity), fee_percentage: topdata[n].platform_fee, fee_value: topdata[n].platform_value, buy_price: topdata[n].buy_price, status: "Fully Executed", receWalletQuantity: topdata[n].quantity }
                //  ded.push(obj)
                return (obj)
                //resolve (parseFloat(newtotal_price))
            } else {
                obj = { n: n, quantity: quantity, presentquantity: topdata[n].quantity, presenttotal_price: topdata[n].total_price, money: newtotal_price, trade_id: topdata[n].id, customer_id: topdata[n].customer_id, pair_id: topdata[n].pair_id, newquantity: Math.abs(newquantity), fee_percentage: topdata[n].platform_fee, fee_value: topdata[n].platform_value, buy_price: topdata[n].buy_price, status: "Partially Executed", receWalletQuantity: quantity }
                // partiallded.push(obj)
                return (obj)
                //resolve (parseFloat(newtotal_price))
            }

        } else {
            return 0
        }
        // })
    }


    function marketcustomerdb(custId, pairId, pairfrom, pairto) { //working

        return new Promise(function(resolve, reject) {

            console.log("persent wallet amount of that currency ", presentwalletamount)
            // console.log("after sell currency recevied amount", receivedquantity)

            function rollback(connection, err) {
                console.log(err);
                connection.rollback(function() {
                    // throw err;
                    reject(err)
                });
            }

            function commit(connection) {
                connection.commit(function(err) {
                    if (err) {
                        return rollback(connection, err);
                    }

                    console.log('success!')
                    resolve('Your order successfully placed')
                });
            }


            function sellOrder(callback) {
                console.log("call in sell order")

                var insertsell = {
                    "customer_id": custId,
                    "pair_id": req.body.pair_id,
                    "status": 'Executed', //marketorderstatus
                    "type": 'Market',
                    "quantity": feedata.calquantity,
                    "created_at": created_at(),
                    "platform_fee": feedata.fee_percentage,
                    "platform_value": feedata.fee_value
                  
                }

                let sql1 = mysql.format("INSERT INTO sell SET ?", [insertsell])

                console.log(sql1)
                connection.query(sql1, function(error, sellorder) {
                    return callback(error, sellorder);
                })
            }


            function sellOrderTranMaster(sellOrderId, callback) {
                console.log("call in sell order transaction master")

                var insertSellTran = {
                    "status": 'Executed',
                    "trade_type": 'Sell',
                    "type": 'Market',
                    "trade_id": sellOrderId,
                    "customer_id": custId,
                    "created_at": created_at(),
                    "quantity": feedata.calquantity, //dbtotal_price,
                    "platform_fee": feedata.fee_percentage,
                    "platform_value": feedata.fee_value,
                    "pair_id": pairId

                }

                let sellOrderTranMaster = mysql.format("INSERT INTO transaction_master set ?", [insertSellTran])

                console.log(sellOrderTranMaster)
                connection.query(sellOrderTranMaster, function(err, transmasterid) {
                    return callback(err, transmasterid);
                })
            }

            function fromWallet(callback) {
                console.log("call in sell wallet")

                console.log("presentwalletamount", presentwalletamount)
                console.log("dedcuteamount", feedata.walletdedquantity)

                var presentBalance = presentwalletamount - feedata.walletdedquantity;
                console.log("total money updated to the wallet after sell", presentBalance)

                let sendWallet_sql = mysql.format("UPDATE customer_wallet SET total_amount = ? WHERE customer_id=? AND currency_code=?", [presentBalance, custId, pairfrom]);

                console.log(sendWallet_sql)
                connection.query(sendWallet_sql, function(err, walletResponse) {
                    return callback(err, walletResponse);
                })
            }


            function insertOrders() {
                return new Promise((resolve, reject) => {

                    let sellOrder_sql = mysql.format("Select*from buy where (status ='Executed'or status = 'Partially Executed')and pair_id=? and type='Limit' and customer_id !=? order by buy_price desc ,created_at asc limit 1", [req.body.pair_id, custId]);
                    console.log(sellOrder_sql)

                    connection.query(sellOrder_sql, function(error, orderdata) {
                        if (error) {
                            return reject(error);
                        } else {

                            if (!orderdata.length) {

                                console.log("NO order")
                                return resolve(false);
                            } else {

                                new Promise((resolve, reject) => {
                                    if (remainingquantity == recamount) {


                                        sellOrder(function(err, sellOrderResult) {
                                            if (err) {
                                                return reject(err)
                                            }
                                            sellOrderid = sellOrderResult.insertId
                                            sellOrderTranMaster(sellOrderResult.insertId, function(err, sellOrderTranMasterResult) {
                                                if (err) {
                                                    return reject(err)
                                                }
                                                sellOrderTranid = sellOrderTranMasterResult.insertId
                                                fromWallet(function(err, walletResult) {
                                                    if (err) {
                                                        return reject(err)
                                                    }
                                                    resolve()
                                                })
                                            })
                                        })
                                    } else {
                                        resolve()
                                    }
                                }).then(() => {
                                    return cal(remainingquantity, orderdata, 0)
                                }).then((dedd) => {
                                    return new Promise((resolve, reject) => {
                                        console.log("final", dedd)
                                        orderArray.push(dedd)

                                        console.log("before remainingquantity", remainingquantity)
                                        console.log(dedd.newquantity)
                                        remainingquantity = remainingquantity - parseFloat(dedd.receWalletQuantity)
                                        console.log("remainingquantity", remainingquantity)

                                        //ND
                                        var walletnewbalance = parseFloat(dedd.receWalletQuantity) * parseFloat(dedd.buy_price);

                                        console.log("ch", walletnewbalance)
                                        let receWallet = mysql.format("UPDATE customer_wallet SET total_amount =`total_amount` + ? WHERE customer_id=? AND currency_code=?", [walletnewbalance, custId, pairto]);
                                        console.log(receWallet)
                                        connection.query(receWallet, function(err, receWalletData) {
                                            if (err) {
                                                return reject(err)
                                            }

                                            //var customerwalletnewbalance = dedd.dedcutetotal_price
                                            // console.log("sell custo wallet total", customerwalletnewbalance)

                                            let buyCustomerWallet_sql = mysql.format("UPDATE customer_wallet SET total_amount =`total_amount` + ? WHERE customer_id= ? AND currency_code=?", [dedd.receWalletQuantity, dedd.customer_id, pairfrom]);
                                            console.log(buyCustomerWallet_sql)
                                            connection.query(buyCustomerWallet_sql, function(err, rows, fields) {
                                                if (err) {

                                                    console.log("customer wallet error", err)
                                                    return reject(err)
                                                }

                                                var buyOrderQunatity = dedd.presentquantity - dedd.receWalletQuantity;

                                                var comtatal_price = buyOrderQunatity * dedd.buy_price;

                                                let buyOrder_sql = mysql.format("UPDATE buy SET status =? ,quantity=? ,total_price=? WHERE id =?", [dedd.status, buyOrderQunatity, comtatal_price, dedd.trade_id]);
                                                console.log(buyOrder_sql)
                                                connection.query(buyOrder_sql, function(err, rows, fields) {
                                                    if (err)
                                                        return reject(err)
                                                    //console.log("done")
                                                    console.log("order trade id", dedd.trade_id)

                                                    let select_buyOrderTranMaster_sql = mysql.format("Select*from transaction_master where trade_type ='Buy' and trade_id=?", [dedd.trade_id]);
                                                    console.log('select_buyOrderTranMaster_sql', select_buyOrderTranMaster_sql)

                                                    connection.query(select_buyOrderTranMaster_sql, function(err, transactionmasterdata) {
                                                        if (err) {
                                                            console.log("sell order transaction_master error", err)
                                                            return reject(error)
                                                        } else if (!transactionmasterdata.length) {

                                                            console.log(transactionmasterdata)


                                                            var insert_buyorderTran = {

                                                                "status": dedd.status,
                                                                "trade_type": 'Buy',
                                                                "type": 'Limit',
                                                                "trade_id": dedd.trade_id,
                                                                "customer_id": dedd.customer_id,
                                                                "avg_price": dedd.buy_price,
                                                                "created_at": created_at(),
                                                                "price": dedd.buy_price,
                                                                "total_amount": dedd.presenttotal_price,
                                                                "quantity": dedd.presentquantity,
                                                                "platform_fee": dedd.fee_percentage,
                                                                "platform_value": dedd.fee_value,
                                                                "pair_id": dedd.pair_id

                                                            }
                                                            let insert_buyOrderTranMaster_sql = mysql.format("INSERT INTO transaction_master set ?", [insert_buyorderTran])


                                                            console.log("insert_buyOrderTranMaster_sql", insert_buyOrderTranMaster_sql)

                                                            connection.query(insert_buyOrderTranMaster_sql, function(err, insert_buyOrderTranMaster) {

                                                                if (err)
                                                                    return reject(error)
                                                                console.log(insert_buyOrderTranMaster)

                                                                var sell_buyData = [

                                                                    [dedd.customer_id, 'Buy', 'Limit', dedd.trade_id, custId, dedd.buy_price, dedd.receWalletQuantity, 'Fully Executed', dedd.pair_id, created_at(), insert_buyOrderTranMaster.insertId],
                                                                    [custId, 'Sell', 'Market', sellOrderid, dedd.customer_id, dedd.buy_price, dedd.receWalletQuantity, 'Fully Executed', dedd.pair_id, created_at(), sellOrderTranid]
                                                                ]
                                                                let sell_buyOrder_sql = mysql.format("INSERT INTO transaction (customer_id,trade_type,type,trade_id,to_from_customer_id,price,quantity,status,pair_id,created_at,transanction_master_id) values ?", [sell_buyData])

                                                                //let sell_buyOrder_sql = "INSERT INTO transaction (customer_id,trade_type,type,trade_id,to_from_customer_id,price,quantity,status,pair_id,created_at,transanction_master_id) values ('" + dedd.customer_id + "','Sell','" + dedd.type + "','" + dedd.trade_id + "','" + custId + "','" + req.body.amount + "','" + dedd.presentquantity + "','Fully Executed','" + dedd.pair_id + "','" + created_at() + "','" + results.insertId + "'),('" + custId + "','Buy','Limit','" + limitbuyorderdata.insertId + "','" + dedd.customer_id + "','" + req.body.amount + "','" + dedd.presentquantity + "','Fully Executed','" + dedd.pair_id + "','" + created_at() + "','" + transmasterid.insertId + "');"
                                                                console.log("sell_buyOrder_sql", sell_buyOrder_sql)
                                                                connection.query(sell_buyOrder_sql, function(err, rows, fields) {
                                                                    if (err) {
                                                                        console.log(err)
                                                                        return reject(err)
                                                                    }
                                                                    console.log("walletans----------------------")

                                                                    resolve(remainingquantity > 0) // to tell then function to recall the insertOrders function or not
                                                                })
                                                            })
                                                        } else {
                                                            var sell_buyTranData = [

                                                                [dedd.customer_id, 'Buy', 'Limit', dedd.trade_id, custId, dedd.buy_price, dedd.receWalletQuantity, 'Fully Executed', dedd.pair_id, created_at(), transactionmasterdata[0].id],
                                                                [custId, 'Sell', 'Market', sellOrderid, dedd.customer_id, dedd.buy_price, dedd.receWalletQuantity, 'Fully Executed', dedd.pair_id, created_at(), sellOrderTranid]

                                                            ]

                                                            let sell_buyOrderTran_sql = mysql.format("INSERT INTO transaction (customer_id,trade_type,type,trade_id,to_from_customer_id,price,quantity,status,pair_id,created_at,transanction_master_id) values ? ", [sell_buyTranData])

                                                            console.log(sell_buyOrderTran_sql)
                                                            connection.query(sell_buyOrderTran_sql, function(err, rows, fields) {
                                                                if (err) {
                                                                    console.log(err)
                                                                    return reject(err)
                                                                }
                                                                let buyOrder_avgcal_sql = mysql.format("Select AVG(price) as avgprice from transaction where trade_type='Buy'and trade_id=?", [dedd.trade_id]);
                                                                console.log(buyOrder_avgcal_sql)
                                                                connection.query(buyOrder_avgcal_sql, function(err, avgcal) {
                                                                    if (err) {
                                                                        console.log("Error while performing Query");
                                                                        return reject(err)
                                                                    } else {
                                                                        console.log(avgcal[0].avgprice)
                                                                        let buyOrder_updatetranmaster_sql = mysql.format("UPDATE transaction_master SET status=?,avg_price=? where id= ?", [dedd.status, avgcal[0].avgprice, transactionmasterdata[0].id]);
                                                                        console.log(buyOrder_updatetranmaster_sql)
                                                                        connection.query(buyOrder_updatetranmaster_sql, function(err, results) {
                                                                            if (err) {
                                                                                return reject(err)
                                                                            } else {

                                                                                console.log("walletans----------------------")
                                                                                console.log(remainingquantity)
                                                                                resolve(remainingquantity > 0) // to tell then function to recall the insertOrders function or not
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                            })
                                                        }
                                                    })
                                                })
                                            })
                                        })
                                    })
                                }).then((rerun) => {
                                    resolve(rerun)
                                }).catch((err) => {
                                    reject(err)
                                })
                            }
                        }
                    })
                }).then((rerun) => {
                    if (rerun)
                        return insertOrders()
                    return Promise.resolve()
                })
            }



            function updateSellOrder(sellOrderId, recamount, callback) {
                console.log("receving quantity", recamount)
                var savetotal_price = 0;

                if (remainingquantity == recamount) {
                    console.log("No updation required")
                    return callback()
                } else {

                    if (remainingquantity == 0 || remainingquantity < 0) {
                        var buysttus = 'Fully Executed'
                    } else if (remainingquantity < recamount && recamount > 0) {
                        var buysttus = 'Partially Executed'
                    } else if (remainingquantity == recamount) {
                        var buysttus = 'Executed'
                    } else {
                        var buysttus = 'no status'
                    }
                    console.log(buysttus)


                    if (remainingquantity == 0) {
                        savetotal_price = 0;

                    } else {
                        savetotal_price = remainingquantity
                    }


                    let updateSellOrder_sql = mysql.format("Update sell SET status=?,quantity=? where id= ?", [buysttus, savetotal_price, sellOrderId])

                    console.log(updateSellOrder_sql)
                    connection.query(updateSellOrder_sql, function(error, updatesellorder) {
                        return callback(error, updatesellorder);
                    })
                }
            }

            function updateSellOrderTranMaster(sellOrderTranId, recamount, callback) {
                console.log("updatetran master id", sellOrderTranId)

                if (remainingquantity == recamount) {
                    console.log("No updation required")
                    return callback()
                } else {

                    let sellOrder_avgcal_sql = mysql.format("Select AVG(price) as avgprice from transaction where transanction_master_id=?", [sellOrderTranId]);
                    console.log("buyorderavg", sellOrder_avgcal_sql)

                    connection.query(sellOrder_avgcal_sql, function(err, limitavgcal) {

                        if (err) {
                            console.log("Error while performing Query");
                            return callback(err);
                            //reject(err)
                        } else if (limitavgcal[0].avgprice == null || limitavgcal[0].avgprice == undefined) {
                            console.log("No transcation yet")
                            return callback()
                        } else {
                            console.log(limitavgcal[0].avgprice)


                            if (remainingquantity == 0 || remainingquantity < 0) {
                                var buysttus = 'Fully Executed'
                            } else if (remainingquantity < feedata.calquantity && remainingquantity > 0) {
                                var buysttus = 'Partially Executed'
                            } else if (remainingquantity == feedata.calquantity) {
                                var buysttus = 'Executed'
                            } else {
                                var buysttus = 'no status'
                            }
                            console.log(buysttus)

                            let sellOrder_updatetranmaster_sql = mysql.format("UPDATE transaction_master SET avg_price=?, status=? where id= ?", [limitavgcal[0].avgprice, buysttus, sellOrderTranId]);
                            console.log("buyordertran", sellOrder_updatetranmaster_sql)
                            connection.query(sellOrder_updatetranmaster_sql, function(err, results) {

                                return callback(err, results)

                            })
                        }
                    })
                }

            }

            function feeCalAndWallet() {
                return new Promise((resolve, reject) => {
                    let sql2 = mysql.format("SELECT * FROM customer_wallet WHERE customer_id =? AND currency_code=?", [custId, pairfrom]);
                    // console.log(sql2)
                    connection.query(sql2, function(error, response) {
                        if (error) {
                            return reject(error)
                        }
                        if (response[0].total_amount == 0 || response == undefined) {
                            return reject({ ecode: 1, message: "You have 0 money to spend" })
                        }
                        if (response[0].total_amount < req.body.quantity) {
                            console.log(response)
                            return reject({ ecode: 1, message: "You have less amount to spend : " + response[0].total_amount + "" })
                        }
                        presentwalletamount = response[0].total_amount
                        resolve(response)
                    })
                }).then((response) => {
                    return fee(response[0].total_amount)
                }).then(function(feedat) {
                    console.log(feedat)
                    console.log("feecalarr", feecalarr)
                    console.log(feecalarr[0].calquantity)
                    feedata = feedat
                    remainingquantity = feecalarr[0].calquantity
                })
            }

            connection.beginTransaction(function(err) {
                if (err) {
                    return reject(err)
                }
                feeCalAndWallet().then(() => {
                    recamount = feedata.calquantity

                    insertOrders().then(() => {
                        return new Promise((resolve, reject) => {
                            updateSellOrder(sellOrderid, feedata.calquantity, function(err, buyOrderResult) {
                                if (err) {
                                    return reject(err)
                                }

                                updateSellOrderTranMaster(sellOrderTranid, feedata.calquantity, function(err, buyOrderTranMasterResult) {
                                    if (err) {
                                        reject(err)
                                    } else {
                                        resolve()
                                    }
                                })
                            })
                        })
                    }).then(() => {
                        commit(connection)
                    }).catch((err) => {
                        rollback(connection, err);
                    })
                }).catch((err) => {
                    rollback(connection, err)
                })
            });
        });
    }


    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [req.decoded.email]);
    connection.query(sql, function(error, data) {
        //console.log(data)
        if (error) {
            res.json({ success: false, message: "Error", error: cm_cfg.errorFn(err) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            
                var pair_id = req.body.pair_id;
                let pair_sql = mysql.format("SELECT * FROM pair_master WHERE id =?", [pair_id]);
                //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
                connection.query(pair_sql, function(error, pairdata) {
                    //console.log(data)
                    if (error) {
                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(err) })
                    } else if (pairdata[0] == null || pairdata[0] == undefined) {
                        res.json({ success: false, message: "Pair not found" })
                    } else {
                        if (pairdata[0].status == 1) {
                            let tradelimit_sql = mysql.format("Select*from trade_limit where currency_code=? and operation='Sell'", [pairdata[0].from]);
                            //console.log(tradelimit_sql)
                            connection.query(tradelimit_sql, function(error, tradelimitdata) {
                                if (error) {
                                    console.log("fee error", error)
                                    res.json({ success: false, message: 'fee error', error: cm_cfg.errorFn(error) })
                                } else if (tradelimitdata[0] == null || tradelimitdata[0] == undefined) {
                                    console.log("Trade limit data not found")
                                    res.json({ success: false, message: 'Trade limit data not found', error: cm_cfg.errorFn(error) })
                                } else {
                                    //console.log(data)
                                    if (req.body.quantity < tradelimitdata[0].min_amount) {
                                        res.json({ success: false, message: "Minimum trade limit is " + tradelimitdata[0].min_amount + "" })
                                    } else {

                                        let sql3 = mysql.format("Select*from buy where (status ='Executed'or status = 'Partially Executed')and pair_id=? and type='Limit' and customer_id !=? order by buy_price desc,created_at desc", [req.body.pair_id, data[0].id]);

                                        console.log(sql3)
                                        connection.query(sql3, function(error, topdata) {

                                            if (error) {
                                                res.json({ success: false, message: "Error", error: cm_cfg.errorFn(err) });
                                            } else {
                                                // console.log("topdata", topdata)
                                                if (topdata[0] == null || topdata[0] == undefined) {
                                                    res.json({ success: false, message: "No user for buy" });
                                                } else {

                                                    console.log("quantity", req.body.quantity)
                                                    marketcustomerdb(data[0].id, req.body.pair_id, pairdata[0].from, pairdata[0].to).then(function(finalstep) {
                                                        if (orderArray.length) {
                                                            let lastOrder = orderArray.pop()
                                                            tickerSocketUpdate(lastOrder.buy_price, req.body.pair_id)
                                                        }
                                                        res.json({ success: true, message: "Your Order successfully executed" })
                                                    }).catch(function(err) {
                                                        if (err.ecode)
                                                            return res.json({ success: false, message: err.message })
                                                        res.json({ success: false, message: "Error", error: cm_cfg.errorFn(err) })
                                                    })

                                                }
                                            } //else

                                        })
                                    }
                                }
                            })
                        } else {
                            res.json({ success: false, message: "This pair is inactive by the admin." })
                        }
                    }
                })
            

        }
    })
}


