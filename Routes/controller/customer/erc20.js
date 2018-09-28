const config = require('../../../config/config');
const JSON = require('circular-json');
const QRCode = require('qrcode')
const mysql = require('mysql');
const request = require('request');
const Web3 = require('web3');
var web3 = new Web3(config.geth_http_erc20);

const wsappress = config.erc20Server;
const web3Socket = new Web3(new Web3.providers.WebsocketProvider(wsappress));

var abiSocket = [ { "anonymous": false, "inputs": [ { "indexed": true, "name": "tokenOwner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "tokens", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "approve", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }, { "name": "_extraData", "type": "bytes" } ], "name": "approveAndCall", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_value", "type": "uint256" } ], "name": "burn", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_freeze", "type": "bool" } ], "name": "emergencyFreezeAllAccounts", "outputs": [ { "name": "res", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_target", "type": "address" }, { "name": "_freeze", "type": "bool" } ], "name": "freezeAccount", "outputs": [ { "name": "res", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "tokens", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "emergencyFreezeStatus", "type": "bool" } ], "name": "EmerygencyFreezed", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "targetAddress", "type": "address" }, { "indexed": false, "name": "frozen", "type": "bool" } ], "name": "Freezed", "type": "event" }, { "constant": false, "inputs": [ { "name": "_tokenAddress", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferAnyERC20Token", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "from", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" } ], "name": "Burn", "type": "event" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "constant": true, "inputs": [ { "name": "_tokenOwner", "type": "address" }, { "name": "_spender", "type": "address" } ], "name": "allowance", "outputs": [ { "name": "remaining", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_tokenOwner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "balance", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "emergencyFreeze", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_targetAddress", "type": "address" } ], "name": "isFreezed", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" } ]


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




exports.erc20UserAccount = function(req, res) {


    var email = req.decoded.email;
    let sql = mysql.format("SELECT * FROM user WHERE email =?", [email]);

    
['FULX', 'ABC'].forEach((currencyName)=>{

    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            let sql1 = "SELECT * FROM user_crypto_address WHERE user_id ='" + data[0].id + "'AND crypto_type= '" + currencyName + "'";
            connection.query(sql1, function(error, dta) {
                if (error) {
                    res.json({ success: false, message: "error", error })
                } else if (dta[0] == null || dta[0] == undefined) {
                    res.json({ success: false, message: currencyName+" address is not created" })
                } else {

                    QRCode.toDataURL(dta[0].crypto_address, function(err, url) {
                        if (err) {
                            res.json({ success: false, message: "Error", error: err })
                        } else {
                            res.json({ success: true, data: url, address: dta[0].crypto_address })
                        }
                    })
                }
            })
        }
    })

})

}



var address = config.fulxContractAddress; // private -Net

var contractInstance =  new web3Socket.eth.Contract(abiSocket, address);

var pastTransferEvents = contractInstance.getPastEvents('Transfer', {}, {fromBlock: config.fulxLastBlock, toBlock:'latest'})



var addressABC = config.abcContractAddress; // private -Net

var contractInstanceABC =  new web3Socket.eth.Contract(abiSocket, addressABC);

var pastTransferEventsABC = contractInstanceABC.getPastEvents('Transfer', {}, {fromBlock: config.abcLastBlock, toBlock:'latest'})
let decimal = 1
let transactions = (table, currencyCode, e, customer_id)=>
{
    if(currencyCode=='FULX')
    {
        decimal = 10000;
    }
    else if(currencyCode=='ABC')
    {
        decimal = 1000000000000000000;
    }
    let result = e.returnValues;

    let sql = `INSERT INTO ${table} (customer_id,sender_address,receiver_address,transactionhash,created_at,currency_code, amount, blockNumber) 
    values 
    (`+customer_id + `,'`+ result.from + `','` + result.to + `','` + e.transactionHash + `','` + created_at() + `', '${currencyCode}', `+parseFloat(parseFloat(result.tokens)/decimal)+`, `+e.blockNumber+`)`;

    connection.query(sql, function(error, results) {
        if (error) {
            if(error.errno!=1062)
                console.log(error)
            // reject(error)
        } else {
            // console.log("inserted into db")
        }
    })

}




let getAllCryptoAddresses = (table, currencyCode) => {

    let sql = mysql.format(`SELECT uca.crypto_address, u.type_id as customer_id FROM user_crypto_address as uca 
        JOIN user as u on u.id=uca.user_id
        WHERE uca.crypto_type='${currencyCode}'`);
    connection.query(sql, function(error, data) {
        if (error) {
            console.log('error is ', error)
            // res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (data[0] == null || data[0] == undefined) {
            // res.json({ success: false, message: "Addresses not found" })
        } else {
if(currencyCode=='FULX')
{
    pastTransferEvents.then((events) => {
      events.forEach((e)=>{
        let result = e.returnValues;
        let value = data.findIndex(x => x.crypto_address == result.to)
        if(value!=-1)
            transactions(table, currencyCode, e,data[value].customer_id)
            // console.log("Block Number", e.blockNumber);
            // console.log("tx hash", e.transactionHash);
            // console.log('sender', result.from)
            // console.log('recipient', result.to)
            // console.log('amount', result.tokens)
            // console.log("\n");
      })
      // process.exit(1)
    })    
}
else if(currencyCode=='ABC')
{
    pastTransferEventsABC.then((events) => {
      events.forEach((e)=>{
        let result = e.returnValues;
        let value = data.findIndex(x => x.crypto_address == result.to)
        if(value!=-1)
            transactions(table, currencyCode, e,data[value].customer_id)
      })
    })
}

        }


})
}




let getBlockNumbers = (table, currencyCode)=>{
let findBlock = mysql.format(`SELECT blockNumber FROM ${table} WHERE currency_code='${currencyCode}' ORDER BY id desc limit 1`);
    connection.query(findBlock, function(error, blocks) {
        if (error) {
            console.log('error is ', error)
            // res.json({ success: false, message: "error", error: cm_cfg.errorFn(error) })
        } else if (blocks[0] == null || blocks[0] == undefined) {
            // res.json({ success: false, message: "Addresses not found" })
            getAllCryptoAddresses(table, currencyCode);
        } else {
            if(currencyCode=='FULX')
            {
                pastTransferEvents = contractInstance.getPastEvents('Transfer', {}, {fromBlock: blocks[0].blockNumber, toBlock:'latest'})
            }
            else if(currencyCode=='ABC')
            {
                pastTransferEventsABC = contractInstanceABC.getPastEvents('Transfer', {}, {fromBlock: blocks[0].blockNumber, toBlock:'latest'})
            }            
            getAllCryptoAddresses(table, currencyCode);
        }


})

}
// getBlockNumbers('fulx_transaction_log', 'FULX')
setInterval(function(){ getBlockNumbers('fulx_transaction_log', 'FULX') },30000)
// getBlockNumbers('fulx_transaction_log', 'FULX')

setInterval(function(){ getBlockNumbers('abc_transaction_log', 'ABC') },30000)
// getBlockNumbers('abc_transaction_log', 'ABC')