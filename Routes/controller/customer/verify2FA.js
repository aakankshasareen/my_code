let connection = require('../../../config/db');
let speakeasy = require('speakeasy');
exports.verify2FACode =(email, token)=>{
        let sql = "SELECT*FROM customer WHERE email ='" + email+ "'";
           return new Promise((resolve, reject)=>{
              connection.query(sql, function(error, data) {
                if(error)
                    reject(error)
                else{ 
                     if(data[0].FA_status==1){
                            var secret = data[0].secretKey
                            var userToken = token;
                            var verified = speakeasy.totp.verify({
                                    secret: secret,
                                    encoding: 'base32',
                                    token: userToken
                                //window: 1
                                });
                            if (verified === true) {
                                    resolve(true)
                            } else {
                                resolve(false);
                            }
                    } else {
                       resolve(true)                    
                    }
                }
             })

           })
           
}