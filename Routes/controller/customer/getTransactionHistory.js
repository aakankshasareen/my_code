var connection = require('../../../config/db');
var config = require('../../../config/config');
var moment = require('moment');
var mysql = require('mysql');
var async = require('async');
var request = require('request');
var ether = require('../customer/ether');

function created_at() {
    var created = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return created;
}

function labdate() {
    var labdate = moment(new Date()).format("YYYY-MM-DD");
    return labdate;
}

let getCurrencyArray = [];
var BlockIo = require('block_io');
var version = config.bitcoin_version;
var block_io = {};

block_io['BTC'] = new BlockIo(config.bitcoin_apiKey, config.bitcoin_pin, version);
block_io['LTC'] = new BlockIo(config.ltc_apiKey, config.bitcoin_pin, version);
block_io['DOGE'] = new BlockIo(config.doge_apiKey, config.bitcoin_pin, version);

// console.log(block_io);

exports.getTransaction = function (req, res) {

    

    var currency_code = req.body.network;
    // console.log(currency_code);

    if (currency_code == 'BTC' || currency_code == 'LTC' || currency_code == 'DOGE') {

        let sql1 = `SELECT * FROM user_crypto_address WHERE user_id =` + req.decoded.id + ` AND crypto_type='` + currency_code + `'`;

        connection.query(sql1, function (error, data) {
            if (error) {
                res.json({ success: false, message: "error", error })

            }
            else if (data[0] == undefined || data[0] == null || block_io[currency_code] == undefined || block_io[currency_code] == null) {
                getCurrencyArray = [];
                res.json({ "success": true, "data": getCurrencyArray });
            }
            else {

                block_io[currency_code].get_transactions({ 'type': 'received', 'addresses': data[0]['crypto_address'] }, function (a, result) {
                    getCurrencyArray = [];

                    var len = result.data.txs.length;

                    if (len == 0) {
                        getCurrencyArray = [];
                        res.json({ "success": true, "data": getCurrencyArray });
                    }
                    else {
                        result.data.txs.forEach(function (e, i) {

                            var obj = {};
                            obj['network'] = result.data.network;
                            obj['txid'] = e.txid;
                            obj['time'] = e.time * 1000;
                            obj['confirmations'] = e.confirmations;
                            obj['amount_received'] = e.amounts_received[0]['amount'];
                            obj['sender'] = e.senders[0];

                            getCurrencyArray.push(obj)
                            if (i == len - 1) {
                                res.json({ "success": true, "data": getCurrencyArray });
                            }
                        })
                    }

                });

            }
        })
    } else if (currency_code == 'ETH') {
        ether.ethDepositHistory(req, res);
    } else if (currency_code == '' || currency_code == undefined) {
        res.json({ "success": true, "data": [] });
    } else {
        res.json({ "success": true, "data": [] });
    }
}

exports.getAllCurrencyTransactionHistory = function(req,res){
    var user_id = req.decoded.id;
    let sql1 = mysql.format("SELECT * FROM user_crypto_address WHERE user_id = ?",user_id);
    connection.query(sql1,function(error,data){
        // console.log(data);
    })
}