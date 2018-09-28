var mysql = require('mysql');
var request = require('request');
var Web3 = require('web3');
var config = require('../../../config/config');
var web3 = new Web3(config.geth_http);

var moment = require('moment');
var connection = require('../../../config/db');

function created_at() {
    var  created = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return created;
}


exports.getEtherAccount = function (req, res) {
    var email = req.body.email;
    var token = req.body.token;
    let sql = mysql.format("SELECT * from otc_ether WHERE email =? and token =?", [email, token]);
   
   connection.query(sql, function (error, result) {
       
       if (error) {
        console.log("in error mysql");
        console.log(error);
           res.json({ success: false, message: "could not get ether addresses",  data:error })
       } else if(result[0] != null){
           res.json({ success: true, message: "success", data:result[0]  });
       }else {
           var createethaddr = getNewOTCEtherAddress(req,res, email, token)
           createethaddr.then(function(resdata) {
                res.json({ success: true, message: "success", data:resdata  });
            }).catch(function(error) {
                console.log(error);
                res.json({ success: false, message: "could not got ether address", data:'null'  });
        });
  
       }

   })
  
}

function getNewOTCEtherAddress(req, res, email, token) {
    return new Promise(
        function (resolve, reject) {
            account = web3.eth.accounts.create();
            var addr = account.address;
            var pvtkey = account.privateKey;
                    var updateData = {
                        "token": token,
                        "address": addr,
                        "private_key": pvtkey,
                        "email": email,
                        "created_at": created_at()
                    }
                    connection.query("insert into otc_ether SET ?", [updateData], function(error, result) {
                        if (error) {        
                            reject(error);
                        } else {
                            resolve(updateData);
                        }
                    });
        
        }
    );
}
