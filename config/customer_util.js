var config = require('./config');
var moment = require('moment');
var mysql = require('mysql');
var connection = require('./db');
var jwt = require('jsonwebtoken');
const bigNumber = require('bignumber.js');
bigNumber.config({ EXPONENTIAL_AT: 1e+9 });


module.exports = {
    checkToken: function (req, res, next) {
        var token = req.headers.token;

        if (token) {
            jwt.verify(token, config.superSecret, function (err, decoded) {
                if (err) {
                    res.status(401).send({status: -2, message: 'Failed to authenticate token.'})
                    res.end();
                } else {                    
                    req.decoded = decoded;
                    var user_id = decoded.id;
                    var node_route = req.route.path.split('/')[1];
                    var query = connection.query("SELECT u.user_type, u.role_id FROM user u WHERE id =" + user_id, function (err, data) {
                        if (err) {
                            res.status(401).send({status: -2, message: err})
                            res.end();
                        } else if(data.length == 0) {
                            res.status(401).send({status: -2, message: 'User not found'})
                            res.end();
                        }
                        else {
                         
                            var role_id = data[0].role_id;                            
                            var user_type = data[0].user_type;
                            
                            if(user_type == "C"){
                                return next();
                            }else if(user_type != "C") {                                
                                return next();
                            }                            
                        }
                    }); 
                }
            });
        } else {
            res.status(401).send({status: -2, message: 'token not found'})
            res.end();
        }
    },

    get_precise_val : (val, precision)=>{
        if(isNaN(val)){
            return "err";
        }else{
            let temp = 0;
            temp = bigNumber(val, 10).dp(precision, 1).toString();
            return Number(temp);
        }
    },

    number_handler: (val_1, val_2, operator, precision)=>{
        if(isNaN(val_1) || isNaN(val_2)){
            return "err";
        }
        if(operator === '+'){
            return Number(new bigNumber(val_1).plus(new bigNumber(val_2)).dp(precision, 1));
        }
        if(operator === '-'){
            return Number(new bigNumber(val_1).minus(new bigNumber(val_2)).dp(precision, 1));
        }
        if(operator === '*'){
            return Number(new bigNumber(val_1).multipliedBy(new bigNumber(val_2)).dp(precision, 1));
        }
        if(operator === '/'){
            return Number(new bigNumber(val_1).dividedBy(new bigNumber(val_2)).dp(precision, 1));
        }
    }
}