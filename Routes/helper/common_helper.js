var config = require('../../config/config');
var mysql = require('mysql');
var con = require('../../config/db');
const io = require('../../socket').io();

module.exports = {
    getCustomerDetailById : function(customer_id){
        return new Promise(function(resolve,reject){
            var sql = mysql.format('SELECT fullname FROM customer WHERE id= ?',[customer_id])
            con.query(sql,function(err,data){
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            })
        }).catch(function(error){
            console.log("Caught Exception "+error);
        });;
    },

    getCustomerWithdrawDetailById : function(cw_id){      // cw_id = customer withdraw id
        return new Promise(function(resolve,reject){
            var sql = mysql.format('SELECT c.fullname, c.email, IF(cw.status=1,"Approved","Disapproved") AS cw_status, cw.* FROM customer_withdraw cw JOIN customer c ON c.id = cw.customer_id WHERE cw.id = ?',[cw_id])
            con.query(sql,function(err,data){
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            })
        }).catch(function(error){
            console.log("Caught Exception "+error);
        });;
    },
    getCustomerDepositDetailById : function(cd_id){      // cd_id = customer deposit id
        return new Promise(function(resolve,reject){
            var sql = mysql.format('SELECT c.fullname, c.email, IF(cd.status=1,"Approved","Disapproved") AS cd_status, cd.* FROM customer_deposite cd JOIN customer c ON c.id = cd.customer_id WHERE cd.id = ?',[cd_id])
            con.query(sql,function(err,data){
                if(err){
                    reject(err);
                }else{
                    console.log(data)
                    resolve(data);
                }
            })
        }).catch(function(error){
            console.log("Caught Exception "+error);
        });;
    },
    tickerSocketUpdate: (price, pairId) => {
        io.emit('tickerTradePrice', {pairId, price})
    },
}
