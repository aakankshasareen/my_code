
var config = require('./config');
var mysql = require('mysql');
var connection = require('./db');
var jwt = require('jsonwebtoken');
var request = require('request');



module.exports = {
  
    checkapitoken: function(req, res, next) {
        var api_token =config.api_token;
       
        if(req.body.api_token===api_token){
            req.check('api_token', 'Invalid token').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                var response = [];
                errors.forEach(function(err) {
                    response.push(err.msg);
                    console.log(err)
                });

                res.statusCode = 400;
                return res.json({ success: false, message: response[0] });
            }

            return next();
        } else {
            res.json({ success: false, message: "Authentication Failed" })
        }
    }
  
}