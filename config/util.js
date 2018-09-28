var config = require('./config');
var mysql = require('mysql');
var connection = require('./db');
var jwt = require('jsonwebtoken');
var request = require('request');



module.exports = {
    checkToken: function(req, res, next) {
        // console.log("req body, header, query, param is", req.body, req.headers, req.query, req.params);
        var token = req.headers.token;

        if (token) {
            jwt.verify(token, config.superSecret, function(err, decoded) {
                if (err) {
                    res.status(401).send({ status: -2, message: 'Failed to authenticate token.' })
                    res.end();
                } else {
                    // var token_sql = mysql.format("Select token from customer where token =?", [req.headers.token])
                    // //console.log(token_sql)
                    // connection.query(token_sql, function(err, todata) {
                    //     if (err) {
                    //         // console.log(err)
                    //         res.status(401).send({ status: -2, message: 'Failed to authenticate token.' })
                    //     } else if (todata[0] == null || todata == undefined) {
                    //         res.status(401).send({ status: -2, message: 'Failed to authenticate token.' })
                    //     } else {
                    req.decoded = decoded;
                    var user_id = decoded.id;
                    var node_route = req.route.path.split('/')[1];
                    var query = connection.query("SELECT u.user_type, u.role_id FROM user u WHERE id =" + user_id, function(err, data) {
                        if (err) {

                            res.status(401).send({ status: -2, message: err })
                            res.end();
                        } else if (data.length == 0) {
                            res.status(401).send({ status: -2, message: 'User not found' })
                            res.end();
                        } else {

                            var role_id = data[0].role_id;
                            var user_type = data[0].user_type;

                            if (user_type == "C") {
                                return next();
                            } else if (user_type != "C") {
                                return next();
                            }
                        }
                    });
                    //     }
                    // })
                }
            });
        } else {
            res.status(401).send({ status: -2, message: 'token not found' })
            res.end();
        }
    },
    verifyCaptcha: function(req, res, next) {

        if (req.body['g_recaptcha_response'] === undefined || req.body['g_recaptcha_response'] === '' || req.body['g_recaptcha_response'] === null) {
            return res.send({ status: -2, message: 'Failed captcha verification.' })
        }
        // Put your secret key here.
        var secretKey = "6LdSvkYUAAAAAAlbQTNXG_hjcnklFaE-AIILForO";
        // req.connection.remoteAddress will provide IP address of connected user.
        var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g_recaptcha_response'] + "&remoteip=" + req.connection.remoteAddress;
        // Hitting GET request to the URL, Google will respond with success or error scenario.
        request(verificationUrl, function(error, response, body) {
            body = JSON.parse(body);
            // Success will be true or false depending upon captcha validation.
            if (body.success !== undefined && !body.success) {
                return res.send({ status: -2, message: 'Failed captcha verification.' })
            } else {
                return next();
            }

        });


    }
}