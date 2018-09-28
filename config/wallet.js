var moment = require('moment');
var mysql = require('mysql');
var bitcoin = require('bitcoin');
var fs = require("fs");
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

var Web3 = require('web3');
var web3 = new Web3(config.geth_http);


module.exports = {

     ethTransferEntireBalance: function(senderAddress, newBalance, receiverAddress , password) {
        return new Promise(function(resolve, reject) {
            console.log("sa",senderAddress)
            console.log("nb",newBalance)
            console.log("ra",receiverAddress)

            fs.readFile('./key/' + senderAddress, "utf8", (err, data) => {
                if (err) {
                    reject(err);
                    //  console.log("file", err)
                } else {
                    //console.log(typeof data)
                    // console.log(data);
                    // var obj = JSON.parse(data);
                    // console.log(obj.privateKey)

                     var obj=web3.eth.accounts.decrypt(data,password);
                    console.log("a",obj)
                     console.log("ap",obj.privateKey)
                    
                    var gp = web3.eth.getGasPrice()
                    gp.then(function(gp) {
                          console.log("gp", gp)
                        var estcost = gp* 21000;//21000000000 
                        console.log(estcost)
                        var transferAmount = newBalance - estcost;
                        console.log(transferAmount)

                        tx = {
                            to: receiverAddress,
                            value: transferAmount,
                            gasPrice: gp, //21000
                            gas: '21000'
                        }
                        //console.log(tx)
                        web3.eth.accounts.signTransaction(tx, obj.privateKey, function(err, dta) {
                            if (err) {
                                //   console.log('sign', err)
                                reject(err)
                            } else {
                                console.log("sign", dta)
                                  console.log(dta.rawTransaction)
                                
                                web3.eth.sendSignedTransaction(dta.rawTransaction, function(err, txhash) {
                                    //console.log("",dtaa)
                                    if (err) {
                                           console.log("send", err)
                                        reject(err)
                                    } else {
                                        console.log("sendsigntransaction dta", txhash)
                                        let sql = "INSERT INTO transaction_log (customer_id,sender_address,receiver_address,transactionhash,created_at) values ('" + '0' + "','" + senderAddress + "','" + receiverAddress + "','" + txhash + "','" + created_at + "')";
                                        //  console.log(sql3)
                                        connection.query(sql, function(error, results) {
                                            if (error) {
                                                console.log(err)
                                                reject(err)
                                            } else {
                                                console.log("inserted into db")
                                                resolve(txhash)
                                            }
                                        })


                                    }
                                })
                            }
                        })
                    }, function(err) {
                        reject(err)
                    })

                }

            })

        })

    },

    btcTransferEntireBalance: function(senderAddress, newBalance, receiverAddress) {
        
        return new Promise(function(resolve, reject) {
            console.log(senderAddress)
          console.log(receiverAddress)
          console.log(newBalance)
            // var estcost = gp * 21000;
            // var transferAmount = newBalance - estcost;
            // console.log(transferAmount)

            client.sendFrom(senderAddress,receiverAddress,newBalance ,0, function(error, txhash) {
                if (error) {
                    console.log(error)
                    reject(error)
                } else {
                    console.log("sendsigntransaction dta", txhash)
                    let sql = "INSERT INTO transaction_log (customer_id,sender_address,receiver_address,transactionhash,created_at) values ('" + '0' + "','" + senderAddress + "','" + receiverAddress + "','" + txhash + "','" + created_at + "')";
                    //  console.log(sql3)
                    connection.query(sql, function(error, results) {
                        if (error) {
                            console.log(err)
                        } else {
                            console.log("inserted into db")
                            resolve(txhash)
                        }
                    })
                }
            })


        })

    },

    bchTransferEntireBalance: function(senderAddress, newBalance, receiverAddress) {
        
        return new Promise(function(resolve, reject) {
            console.log(senderAddress)
          console.log(receiverAddress)
          console.log(newBalance)
            // var estcost = gp * 21000;
            // var transferAmount = newBalance - estcost;
            // console.log(transferAmount)

            client.sendFrom(senderAddress,receiverAddress,newBalance ,0, function(error, txhash) {
                if (error) {
                    console.log(error)
                    reject(error)
                } else {
                    console.log("sendsigntransaction dta", txhash)
                    let sql = "INSERT INTO transaction_log (customer_id,sender_address,receiver_address,transactionhash,created_at) values ('" + '0' + "','" + senderAddress + "','" + receiverAddress + "','" + txhash + "','" + created_at + "')";
                    //  console.log(sql3)
                    connection.query(sql, function(error, results) {
                        if (error) {
                            console.log(err)
                        } else {
                            console.log("inserted into db")
                            resolve(txhash)
                        }
                    })
                }
            })


        })

    }
}