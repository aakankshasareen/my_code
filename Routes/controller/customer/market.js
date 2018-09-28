var connection = require('../../../config/db');
var config = require('../../../config/config');
var moment = require('moment');
var mysql = require('mysql');
var cm_cfg = require('../../../config/common_config');
var async = require('async');
var nodemailer = require('nodemailer');

var request = require('request')
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


exports.estimateSellQuantity = function(req, res) {

    var newtotal_price = 0;
    var percurrency_amount = 0;
    var newquantity = 0;
    var n, est = 0;

    function fee(totalamount) {

        return new Promise(function(resolve, reject) {
          //  console.log("fee walletinfo", totalamount)
            var fee_value = 0;
            var calquantity = 0;
           // var walletdedquantity = 0;

            let sql = mysql.format("SELECT * FROM pair_master WHERE id =?", [req.body.pair_id]);
            connection.query(sql, function(error, pairdata) {
                if (error) {
                    console.log(error)
                    reject("error in  pair id")
                } else {

                    let sql1 = mysql.format("Select*from commission where currency_code=? and operation='Sell'", [pairdata[0].from])
                    console.log(sql1)
                    connection.query(sql1, function(error, data) {
                        if (error) {
                            reject("fee error", error)
                        } else if (data[0] == null || data[0] == undefined) {
                            reject("fee data not found")
                        } else {
                            // console.log("fee data", data)

                          //  console.log("min %", data[0].min_percentage)

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
                }
            })

        })
    }

    function cal(quantity, topdata, n) {
       // console.log("quantity", quantity)
       // console.log(topdata)
       // console.log("index", n)

        var newquantity = Number(quantity - topdata[n].quantity).toFixed(6);
      //  console.log("nq", newquantity)

        if (topdata[n].quantity < quantity && topdata[n].quantity > 0 && newquantity > 0) {
            newtotal_price = topdata[n].total_price;
         //   console.log("ntp", newtotal_price)
            return (parseFloat(newtotal_price) + cal(newquantity, topdata, n - 1))

        } else if (topdata[n].quantity >= quantity || newquantity <= 0) {
            percurrency_amount = topdata[n].total_price / topdata[n].quantity;
            // console.log("pa", percurrency_amount)
            newtotal_price = percurrency_amount * quantity;
         //   console.log(newtotal_price)
            return parseFloat(newtotal_price)

        } else {
            return 0
        }
    }

    //console.log(req.decoded)
    let sql = mysql.format("SELECT email,id,daily_trade_limit,monthly_trade_limit FROM customer WHERE email =?", [req.decoded.email]);
    connection.query(sql, function(error, data) {
        //console.log(data)
        if (error) {
            res.json({ success: false, message: "error", error: error })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
           
              //  console.log(dailydata)
                let sql2 = mysql.format("SELECT * FROM customer_wallet WHERE customer_id = ? AND currency_code=?", [data[0].id, req.body.currency_code]);
                connection.query(sql2, function(error, response) {
                    if (error) {
                        res.json({ success: false, message: "error", error: error });
                    } else {

                        if (response[0] == null || response == undefined) {
                            res.json({ success: false, message: "You have 0 money to spend" });
                        } else {

                            if (response[0].total_amount < req.body.quantity) {
                                res.json({ success: false, message: "You have less money to spend " + response[0].total_amount + "" });
                            } else {
                                let tradelimit_sql = mysql.format("Select*from trade_limit where currency_code=? and operation='Sell'", [req.body.currency_code]);
                                //console.log(tradelimit_sql)
                                connection.query(tradelimit_sql, function(error, tradelimitdata) {
                                    if (error) {
                                        console.log("fee error", error)
                                        res.json({ success: false, message: 'fee error', error: cm_cfg.errorFn(error) })
                                    } else if (tradelimitdata[0] == null || tradelimitdata[0] == undefined) {
                                        console.log("Trade limit data not found")
                                        res.json({ success: false, message: 'Trade limit data not found', error: cm_cfg.errorFn(error) })
                                    } else {
                                        if (req.body.quantity < tradelimitdata[0].min_amount) {
                                            res.json({ success: false, message: "You have less money minimum trade limit is " + tradelimitdata[0].min_amount + "" })
                                        } else {


                                            let order_sql = mysql.format("SELECT price FROM `transaction` WHERE pair_id=? order by created_at desc limit 1", [req.body.pair_id]);
                                            connection.query(order_sql, function(error, pricedata) {
                                                if (error) {


                                                    res.json({ success: false, message: "error", error })
                                                } else {
                                                    let sql3 = mysql.format("Select*from buy where (status ='Executed'or status = 'Partially Executed')and pair_id=? and type='Limit' and customer_id !=? order by buy_price asc,created_at desc", [req.body.pair_id, data[0].id]);
                                                    connection.query(sql3, function(error, topdata) {
                                                        if (error) {
                                                            res.json({ success: false, message: "error", error: error });
                                                        } else {
                                                            //console.log(topdata)
                                                            if (topdata[0] == null || topdata[0] == undefined) {
                                                                res.json({ success: false, message: "We have no user found for buy" });
                                                            } else {
                                                                //console.log("td", topdata)

                                                                let sql4 = mysql.format("SELECT SUM(quantity) AS totalquantity FROM buy where (status ='Executed'or status = 'Partially Executed')and pair_id=? and type='Limit' and customer_id !=? order by buy_price desc,created_at desc", [req.body.pair_id, data[0].id]);
                                                                connection.query(sql4, function(error, totalsum) {
                                                                    if (error) {
                                                                        res.json({ success: false, message: "error", error: error });
                                                                    } else {

                                                                        var ans = fee(req.body.quantity)
                                                                        ans.then(function(result) {
                                                                          //  console.log(result)
                                                                            // console.log(totalsum)
                                                                            if (totalsum[0].totalquantity >= req.body.quantity) {
                                                                              //  console.log("tos", totalsum[0].totalquantity)

                                                                                n = topdata.length;
                                                                              //  console.log(n)

                                                                                var final = cal(req.body.quantity, topdata, (n - 1))

                                                                                if (pricedata[0] == null || pricedata == undefined) {
                                                                                    res.json({ success: true, message: "estimated", amount: final.toFixed(8), fee_percentage: result.fee_percentage, fee_value: result.fee_value, lastprice: 0.00000000.toFixed(8) })

                                                                                } else {

                                                                                    res.json({ success: true, message: "estimated", amount: final.toFixed(8), fee_percentage: result.fee_percentage, fee_value: result.fee_value, lastprice: pricedata[0].price })
                                                                                }

                                                                            } else {
                                                                              //  console.log("change")
                                                                              //  console.log(req.body.quantity)
                                                                                var remainingquantity = req.body.quantity - totalsum[0].totalquantity;

                                                                                n = topdata.length;
                                                                              //  console.log(n)

                                                                                var final = cal(totalsum[0].totalquantity, topdata, (n - 1))
                                                                             //   console.log("final", final)
                                                                                if (pricedata[0] == null || pricedata == undefined) {
                                                                                    res.json({ success: true, message: " avg estimated", amount: final.toFixed(8), fee_percentage: result.fee_percentage, fee_value: result.fee_value, lastprice: 0.00000000.toFixed(8) })
                                                                                } else {
                                                                                    //res.json({ success: false, message: "total quantity to sell available is", amount: totalsum[0].totalquantity });
                                                                                    res.json({ success: true, message: "avg estimated", amount: final.toFixed(8), fee_percentage: result.fee_percentage, fee_value: result.fee_value, lastprice: pricedata[0].price });
                                                                                }
                                                                            }
                                                                        }, function(err) {
                                                                            res.json({ success: false, message: "Error in fee calculation" })
                                                                        })
                                                                    }

                                                                })
                                                            } //else
                                                        } //else

                                                    })
                                                }
                                            })
                                        }
                                    }
                                })

                            }
                        }
                    }
                })
          
        }
    })
}


exports.estimateBuyQuantity = function(req, res) {
    var newamount = 0;
    var percurrency_amount = 0;
    var newquantity = 0;
    var n, est = 0;

    function fee(totalamount) {

        return new Promise(function(resolve, reject) {
            //console.log("fee walletinfo", totalamount)
            var fee_value = 0;
            var calquantity = 0;
            //var walletdedquantity = 0;

            let sql = "SELECT * FROM pair_master WHERE id =" + mysql.escape(req.body.pair_id) + "";
            connection.query(sql, function(error, pairdata) {
                if (error) {
                    console.log(error)
                    reject("error in  pair id")
                } else {


                    let sql1 = "Select*from commission where currency_code=" + mysql.escape(pairdata[0].to) + "and operation='Buy';"
                    // console.log(sql1)
                    connection.query(sql1, function(error, data) {
                        if (error) {
                            reject("fee error", error)
                        } else if (data[0] == null || data[0] == undefined) {
                            reject("fee data not found")
                        } else {
                            // console.log("fee data", data)

                            //  console.log("min %", data[0].min_percentage)

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
                }
            })

        })
    }


    function cal(amount, topdata, n) {
      //  console.log("amount", amount)
      //  console.log(topdata)
      //  console.log("index", n)
        newamount = amount - topdata[n].total_price;
      //  console.log("na", newamount)

        if (topdata[n].total_price < amount && topdata[n].total_price > 0 && newamount > 0) {
            newquantity = topdata[n].quantity;
            //console.log("nq", newquantity)
            return (parseFloat(newquantity) + cal(newamount, topdata, n - 1))

        } else if (topdata[n].total_price >= amount || newamount <= 0) {
            percurrency_amount = topdata[n].quantity / topdata[n].total_price;
            //  console.log("pa", percurrency_amount)
            newquantity = percurrency_amount * amount;
            //  console.log(newquantity)
            return parseFloat(newquantity)

        } else {
            return 0
        }
    }


    //console.log(req.decoded)
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [req.decoded.email]);
    connection.query(sql, function(error, data) {
        //console.log(data)
        if (error) {
            res.json({ success: false, message: "error", error: error })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
           

                let sql2 = mysql.format("SELECT * FROM customer_wallet WHERE customer_id =? AND currency_code=?", [data[0].id, req.body.currency_code]);
                connection.query(sql2, function(error, response) {
                    if (error) {
                        res.json({ success: false, message: "error", error: error });
                    } else {

                        if (response[0] == null || response == undefined) {
                            res.json({ success: false, message: "You have 0 amount to spend" });
                        } else {

                            if (response[0].total_amount < req.body.amount) {
                                res.json({ success: false, message: "You have less money to spend " + response[0].total_amount + "" });
                            } else {
                                let tradelimit_sql = mysql.format("Select*from trade_limit where currency_code=? and operation='Buy'", [req.body.currency_code]);
                                //console.log(tradelimit_sql)
                                connection.query(tradelimit_sql, function(error, tradelimitdata) {
                                    if (error) {
                                       // console.log("fee error", error)
                                        res.json({ success: false, message: 'fee error', error: cm_cfg.errorFn(error) })
                                    } else if (tradelimitdata[0] == null || tradelimitdata[0] == undefined) {
                                       // console.log("Trade limit data not found")
                                        res.json({ success: false, message: 'Trade limit data not found', error: cm_cfg.errorFn(error) })
                                    } else {
                                        if (req.body.amount < tradelimitdata[0].min_amount) {
                                            res.json({ success: false, message: "You have less money minimum trade limit is " + tradelimitdata[0].min_amount + "" })
                                        } else {


                                            let order_sql = mysql.format("SELECT price FROM `transaction` WHERE pair_id=? order by created_at desc limit 1", [req.body.pair_id]);
                                            connection.query(order_sql, function(error, pricedata) {
                                                if (error) {

                                                    res.json({ success: false, message: "error", error })
                                                } else {

                                                    // connection.query('SELECT COUNT(*) as total from sell',(err, sellCount)=>{
                                                    //   if(err)
                                                    //    return res.json({success: false, message: 'Error', error: cm_cfg.errorFn(err)})
                                                    //   if(sellCount[0].total === 1){

                                                    //     request({url: cm_cfg.btcprice_url}, function(err, response, body) {
                                                    //         if (err) {
                                                    //           return res.json({success: false, message: 'Error', error: cm_cfg.errorFn(err)})
                                                    //         } else {

                                                    //             var obj = JSON.parse(body)
                                                    //             console.log(obj[0].price_usd)

                                                    //             totalCmdReceived = (obj[0].price_usd / cm_cfg.cmdCoinPrice)*req.body.amount
                                                    //             res.json({ success: true, message: "avg estimated", quantity: totalCmdReceived.toFixed(8), fee_percentage: 0, fee_value: 0, lastprice: 0});
                                                    //         }
                                                    //     })
                                                    //   }
                                                    //else {
                                                    let sql3 = mysql.format("Select*from sell where (status ='Executed'or status = 'Partially Executed' or status='Partially')and pair_id=? and type='Limit'  and customer_id !=? order by sell_price desc", [req.body.pair_id, data[0].id]);
                                                    connection.query(sql3, function(error, topdata) {

                                                        if (error) {
                                                            res.json({ success: false, message: "error", error: error });
                                                        } else {
                                                            if (topdata[0] == null || topdata[0] == undefined) {
                                                                res.json({ success: false, message: "We have no user found for sell" });

                                                            } else {
                                                                if (topdata[0] == null || topdata[0] == undefined) {
                                                                    res.json({ success: false, message: "We have no user found for sell" });
                                                                } else {
                                                                    //console.log(topdata)
                                                                    let sql4 = mysql.format("SELECT SUM(total_price) AS total FROM sell where (status ='Executed'or status = 'Partially Executed'or status='Partially')and pair_id=? and type='Limit' and customer_id !=?", [req.body.pair_id, data[0].id]);
                                                                    //let sql4 = mysql.format("SELECT SUM(total_price) AS total FROM sell where pair_id=? and status !='Fully Executed' and status != 'Not Executed'", [req.body.pair_id]);
                                                                    connection.query(sql4, function(error, totalsum) {
                                                                        if (error) {
                                                                            res.json({ success: false, message: "error", error: error });
                                                                        } else {

                                                                            var ans = fee(req.body.amount)
                                                                            ans.then(function(result) {
                                                                                  //  console.log(result)

                                                                                    if (totalsum[0].total >= req.body.amount) {

                                                                                     //   console.log("totalsum", totalsum[0].total)
                                                                                        n = topdata.length;

                                                                                        var final = cal(req.body.amount, topdata, (n - 1))
                                                                                        //console.log(final)
                                                                                      //  console.log("td", topdata)
                                                                                        //n = t
                                                                                        if (pricedata[0] == null || pricedata == undefined) {
                                                                                            res.json({ success: true, message: "estimated", quantity: final.toFixed(8), fee_percentage: result.fee_percentage, fee_value: result.fee_value, lastprice: 0.00000000.toFixed(8) });
                                                                                        } else {
                                                                                            res.json({ success: true, message: "estimated", quantity: final.toFixed(8), fee_percentage: result.fee_percentage, fee_value: result.fee_value, lastprice: pricedata[0].price });
                                                                                        }

                                                                                        res.json({ success: true, message: "estimated", quantity: final.toFixed(8), fee_percentage: result.fee_percentage, fee_value: result.fee_value, lastprice: pricedata[0].price });
                                                                                    } else {
                                                                                     //   console.log("change")
                                                                                      //  console.log(req.body.amount)
                                                                                      //  console.log("totalsum", totalsum[0].total)

                                                                                        var remainingamount = req.body.amount - totalsum[0].total;
                                                                                     //   console.log("ra", remainingamount)
                                                                                        n = topdata.length;
                                                                                     //   console.log(n)

                                                                                        var final = cal(totalsum[0].total, topdata, (n - 1))
                                                                                     //   console.log("final", final)


                                                                                        if (pricedata[0] == null || pricedata == undefined) {
                                                                                            res.json({ success: true, message: "avg estimated", quantity: final.toFixed(8), fee_percentage: result.fee_percentage, fee_value: result.fee_value, lastprice: 0.00000000.toFixed(8) });
                                                                                        } else {
                                                                                            res.json({ success: true, message: "avg estimated", quantity: final.toFixed(8), fee_percentage: result.fee_percentage, fee_value: result.fee_value, lastprice: pricedata[0].price });
                                                                                        }
                                                                                        // res.json({ success: false, message: "total amount to buy available is" + totalsum[0].total + "" });
                                                                                    }
                                                                                },
                                                                                function(err) {
                                                                                    res.json({ success: false, message: "Error in fee calculation" })
                                                                                })

                                                                        }
                                                                    })
                                                                }

                                                            }
                                                        }
                                                    })
                                                    //   }
                                                    // })
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        }
                    }

                })
            // }).catch(function(err) {
            //     res.json({ success: false, message: err })
            // })
        }
    })

}


exports.lastTradePrice = function(req, res) {
    var pdata = [];
    var finalprice = 0;
    var pair_id = req.body.pair_id;
    var price = 0;
    let sql = mysql.format("SELECT * FROM pair_master WHERE id =?", [pair_id]);

    // let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    //console.log(sql)
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "Pair not found" })
        } else {

            //let buyorder_sql = "Select*from buy where (status='Executed'or status='Partially Executed')and customer_id='" + data[0].id + "'";
            let order_sql = mysql.format("SELECT FORMAT(price,8) as price FROM `transaction` WHERE pair_id=? order by created_at desc limit 1", [pair_id]);
            connection.query(order_sql, function(error, pricedata) {
                if (error) {

                    res.json({ success: false, message: "error", error })
                } else if (pricedata[0] == null || pricedata == undefined) {
                    res.json({ success: true, message: "Transaction not found", lastprice: 0.00000000.toFixed(8) })
                } else {
                   // console.log("db", pricedata)

                    res.json({ success: true, message: "last price", lastprice: (pricedata[0].price) })


                }
            })
        }
    })
}
