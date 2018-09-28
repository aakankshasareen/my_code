var moment = require('moment');
var mysql = require('mysql');
var bitcoin = require('bitcoin');
var fs = require("fs");
const JSON = require('circular-json');
var config = require('./config');
var connection = require('./db');
var date = new Date();
var created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");

var client = new bitcoin.Client({
    host: config.btc_host,
    port: config.btc_port, // ipc port number
    user: config.btc_user,
    pass: config.btc_pass
    //timeout: 30000
});

var bch_client = new bitcoin.Client({
    host: config.bch_host,
    port: config.bch_port, // ipc port number
    user: config.bch_user,
    pass: config.bch_pass,
    timeout: 30000
});

var Web3 = require('web3');
var web3 = new Web3(config.geth_http);
var erc20web3 = new Web3(config.geth_http_erc20);

module.exports = {

    eth: function() {

        let sql1 = "Select*from exchange_crypto_address where crypto_type='ETH'";
        connection.query(sql1, function(error, adddata) {
            if (adddata[0] == null || adddata[0] == undefined) {
                var account = web3.eth.accounts.create()
                var encryptdata = web3.eth.accounts.encrypt(account.privateKey, config.ethExchangeWallet);
                let sql2 = "INSERT INTO exchange_crypto_address (crypto_address,crypto_type,created_at) values('" + account.address + "','ETH','" + created_at + "')"
                connection.query(sql2, function(error, results) {
                    if (!error) {
                        fs.appendFile('./key/' + account.address, JSON.stringify(encryptdata), (err) => {
                            if (err) {
                                console.log({ success: false, message: "error", err })

                            } else {
                                // console.log('The "data is appended');

                            }
                        })
                    } else {
                        console.log(error)

                    }

                })
            } else {
                // console.log("eth account already created")
            }
        })

    },
    erc20: function(erc20token) {
        let sql1 = "Select*from exchange_crypto_address where crypto_type='" + erc20token + "'";
        connection.query(sql1, function(error, adddata) {
            if (adddata[0] == null || adddata[0] == undefined) {

                var account = erc20web3.eth.accounts.create();
                var padd = account.address;

                var encryptdata = erc20web3.eth.accounts.encrypt(account.privateKey, config.ethExchangeWallet);

                var walletname = (erc20token=="FULX"?config.fuleexExchangeWallet:config.abcExchangeWallet);
                let sql2 = "INSERT INTO exchange_crypto_address (crypto_address,crypto_type,created_at) values('" + account.address + "','"+erc20token+"','" + created_at + "')"
                connection.query(sql2, function(error, results) {
                    if (!error) {
                        fs.appendFile('./key/' + account.address, JSON.stringify(encryptdata), (err) => {
                            if (err) {
                                console.log({ success: false, message: "error", err })

                            } else {
                                // console.log('The "data is appended');

                            }
                        })
                    } else {
                        console.log(error)

                    }

                })
            } else {
                // console.log("erc20 account already created")
            }
        })

    },

    btc: function() {



        let sql3 = "Select*from exchange_crypto_address where crypto_type='BTC'";
        connection.query(sql3, function(error, adddata) {
            if (adddata[0] == null || adddata[0] == undefined) {
                client.getAccountAddress(config.btcExchangeWallet, function(error, addr) {
                    if (error) {
                        console.log(error)
                        //res.json({ success: false, message: "btc error", error: error })
                    } else {
                        let sql3 = "INSERT INTO exchange_crypto_address (crypto_address,crypto_type,created_at) values('" + addr + "','BTC','" + created_at + "')"
                        connection.query(sql3, function(error, results) {
                            if (!error) {
                                // console.log("btcdata", results)
                            } else {
                                console.log(error)

                            }
                        })
                    }
                })

            } else {
                // console.log("btc account already created")
            }
        })

    },

    bch: function() {

        let sql3 = "Select*from exchange_crypto_address where crypto_type='BCH'";
        connection.query(sql3, function(error, adddata) {
            if (adddata[0] == null || adddata[0] == undefined) {
                bch_client.getAccountAddress(config.bchExchangeWallet, function(error, addr) {
                    if (error) {
                        console.log(error)
                        //res.json({ success: false, message: "btc error", error: error })
                    } else {
                        let sql3 = "INSERT INTO exchange_crypto_address (crypto_address,crypto_type,created_at) values('" + addr + "','BCH','" + created_at + "')"
                        connection.query(sql3, function(error, results) {
                            if (!error) {
                                // console.log("btcdata", results)
                            } else {
                                console.log(error)

                            }
                        })
                    }
                })

            } else {
                // console.log("btc account already created")
            }
        })

        // },
    }
}