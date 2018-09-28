var connection = require('../../../config/db');
var config = require('../../../config/config');
var moment = require('moment');
const cm_cfg = require('../../../config/common_config')
var async = require('async');
var mysql = require('mysql');
var emailFn = require('./email');

function created_at() {
    var created = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return created;
}


exports.limitCheckBalance = function(req, res) {
    //console.log(req.decoded)
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
            var currency_code = req.body.currency_code;

            let sql2 = mysql.format("SELECT * FROM customer_wallet WHERE customer_id =? AND currency_code=?", [data[0].id, currency_code]);
            //console.log(sql2)
            connection.query(sql2, function(error, response) {
                if (error) {
                    res.json({ success: false, message: "error", error: error });
                } else {
                    if (response[0] == null || response[0] == undefined) {
                        res.json({ success: false, message: "You have 0 " + currency_code + " to spend" });
                    } else {
                        if (response[0].total_amount < req.body.amount) {
                            res.json({ success: false, message: "You have less money to spend " + response[0].total_amount + "" });
                        } else {
                            res.json({ success: true, message: "You have money to spend " + response[0].total_amount + "" });

                        }
                    }
                }
            })
        }
    })
}


exports.limitBuyPrice = function(req, res) {

    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);

    connection.query(sql, function(error, data) {
        //console.log(data)
        if (error) {
            res.json({ success: false, message: "error", error: error })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            var pair_id = req.body.pair_id
            //let sql3 = "SELECT MAX(created_at) AS lastorder FROM buy WHERE pair_id ='" + req.body.pair_id +"'" ;
            let sql3 = mysql.format("select*from buy where pair_id =? and (type='Limit' and(status='Executed'or status='Partially Executed' or status='Partially')) order by buy_price asc,created_at asc limit 1", [pair_id]);
            //let sql3 = mysql.format("select*from buy where pair_id =? order by created_at desc", [pair_id]);
            //console.log(sql3)
            connection.query(sql3, function(error, lastrate) {
                //console.log(lastrate)
                if (error) {
                    res.json({ success: false, message: "error", error: error });
                } else {
                    if (lastrate[0] == null || lastrate[0] == undefined) {
                        res.json({ success: false, message: "We have 0 orders" });
                    } else {
                        //console.log(lastrate[0].buy_price)
                        res.json({ success: true, message: "last place order rate", amount: (lastrate[0].buy_price).toFixed(8) })
                    }
                }
            })
        }
    })
}


exports.limitSellPrice = function(req, res) {

    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);

    //let sql = "SELECT * FROM customer WHERE email ='" + req.decoded.email + "'";
    connection.query(sql, function(error, data) {
        //console.log(data)
        if (error) {
            res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "User not found" })
        } else {
            var pair_id = req.body.pair_id
            let sql3 = mysql.format("Select*from sell where pair_id =? and (type='Limit' and(status='Executed'or status='Partially Executed' or status='Partially'))order by sell_price asc,created_at desc limit 1", [pair_id]);
            //let sql3 = mysql.format("Select*from sell where pair_id =? order by created_at desc", [pair_id]);
            connection.query(sql3, function(error, lastrate) {

                if (error) {
                    res.json({ success: false, message: "Error", error: cm_cfg.errorFn(error) });
                } else {
                    if (lastrate[0] == null || lastrate[0] == undefined) {
                        res.json({ success: false, message: "We have 0 orders" });
                    } else {
                        //console.log(lastrate[0].buy_price)
                        res.json({ success: true, message: "last place order rate", amount: (lastrate[0].sell_price).toFixed(8) })
                    }
                }
            })
        }
    })
}






exports.limitBuyCal = function(req, res) {

    function cal(amount, quantity) {
        var no=0,final=0
        //console.log(amount)
        //console.log(quantity)
        return new Promise(function(resolve, reject) {

            if (quantity < 1) {
                 no = 1 / quantity
                 final = amount / no
                resolve(final)
            } else if (quantity >= 1) {

                var int_part = Math.trunc(quantity);
                var int_no = int_part * amount
                // console.log(int_no)

               var float_part = Number((quantity - int_part).toFixed(4));
                // console.log(float_part)
                 no = 1 / float_part
                 final = amount / no
                var ffinal = int_no + final
                resolve(ffinal)
                //console.log(ffinal)
            } else {
                reject("error")
            }
        })
    }


    function fee(totalamount) {

        return new Promise(function(resolve, reject) {
            //console.log("fee walletinfo", totalamount)
            var fee_value = 0;
            var calquantity = 0;
            //var walletdedquantity = 0;

            let sql = "SELECT * FROM pair_master WHERE id =" + mysql.escape(req.body.pair_id) +"";
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
            var ans = cal(req.body.amount, req.body.quantity)
            ans.then(function(result) {
                //console.log(result)
                return fee(result)
            }, function(err) {
                res.json({ success: false, message: "Error", error: err });
            }).then(function(feecaldta) {
                console.log(feecaldta)
                res.json({ success: true, message: "Total amount included fee", total_amount: feecaldta.calquantity, fee_percentage: feecaldta.fee_percentage, fee_value: feecaldta.fee_value });

            }, function(err) {
                res.json({ success: false, message: "Fee Error", error: err });
            })
        }

    })
}



exports.limitSellCal = function(req, res) {



    function fee(totalamount) {

        return new Promise(function(resolve, reject) {
            // console.log("fee walletinfo", totalamount)
            var fee_value = 0;
            var calquantity = 0;
            //var walletdedquantity = 0;

            let sql = "SELECT * FROM pair_master WHERE id =" + mysql.escape(req.body.pair_id) + "";
            connection.query(sql, function(error, pairdata) {
                if (error) {
                    console.log(error)
                    reject("error in  pair id")
                } else {

                    let sql1 = "Select*from commission where currency_code=" + mysql.escape(pairdata[0].from) + "and operation='Sell';"
                    //console.log(sql1)
                    connection.query(sql1, function(error, data) {
                        if (error) {
                            reject("fee error", error)
                        } else if (data[0] == null || data[0] == undefined) {
                            reject("fee data not found")
                        } else {
                            // console.log("fee data", data)

                        //    console.log("min %", data[0].min_percentage)

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


            var ans = fee(req.body.quantity)
            ans.then(function(result) {
                //console.log(result)


                var totalamount = req.body.quantity * req.body.amount;
                // console.log(totalamount)
                //})

                // var ans = cal(req.body.amount, req.body.quantity)
                // ans.then(function(result) {
                //     console.log(result)
                //     return fee(result)

                // }, function(err) {
                //     res.json({ success: false, message: "Error", error: err });
                // }).then(function(feecaldta) {
                //     console.log(feecaldta)

                res.json({ success: true, message: "Total amount included fee", total_amount: totalamount, fee_percentage: result.fee_percentage, fee_value: result.fee_value });
            }, function(err) {
                res.json({ success: false, message: "Error", error: err });
            })
        }

    })
}
