var request = require('request')
var mysql = require('mysql');
var connection = require('../../../config/db');
var config = require('../../../config/config');
var moment = require('moment');
var async = require('async');

function created_at() {
    var created = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return created;
}


exports.newDepositRequest = function(req,res){

let sql = `INSERT INTO bank_deposit (date, email, name, currency, amount, type, utr, info) 
VALUES ('`+req.body.date+`', '`+req.body.email+`', '`+req.body.name+`', '`+req.body.currency+`', 
`+req.body.amount+`, '`+req.body.type+`', '`+req.body.utr+`', '`+req.body.info+`')`;

    connection.query(sql, function(error, results) {
        if (!error) {
            // console.log("success", results)
            res.json({
                "success": true,
                "message": "Successfull"
            })
        } else {
            // console.log(error)
            res.json({
                "success": false,
                "message": "Server Error"
            })
        }
    })

}

exports.newWithdrawalRequest = function(req,res){
// email, bank_name, account_no, ifsc_code, amount
let sql = `INSERT INTO bank_deposit (date, email, name, currency, amount, type, utr, info) 
VALUES ('`+req.body.date+`', '`+req.body.email+`', '`+req.body.name+`', '`+req.body.currency+`', 
`+req.body.amount+`, '`+req.body.type+`', '`+req.body.utr+`', '`+req.body.info+`')`;

/*    connection.query(sql, function(error, results) {
        if (!error) {
            console.log("success", results)
            res.json({
                "success": true,
                "message": "Successfull"
            })
        } else {
            res.json({
                "success": false,
                "message": "Server Error"
            })
        }
    })*/

}

