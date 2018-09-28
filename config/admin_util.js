var config = require('./config');
var moment = require('moment');
var mysql = require('mysql');
var connection = require('./db');
var jwt = require('jsonwebtoken');
var request = require('request');




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
                    var query = connection.query("SELECT u.user_type, u.role_id, u.is_super_admin FROM user u WHERE id =" + user_id, function (err, data) {
                        if (err) {
                            res.status(401).send({status: -2, message: err})
                            res.end();
                        } else if(data.length == 0) {
                            res.status(401).send({status: -2, message: 'User not found'})
                            res.end();
                        }
                        else {

                            var role_id = data[0].role_id;
                            var is_super_admin = data[0].is_super_admin;
                            var user_type = data[0].user_type;

                            // pass all permission if super admin
                            if(is_super_admin == 1) {
                                return next();
                            }
                            if(is_super_admin != 1 && user_type == "A"){
                                connection.query("SELECT id FROM permissions WHERE name = '" + node_route + "' LIMIT 1", function (err, data1) {
                                    if (data1.length > 0) {
                                        var permission_id = data1[0].id;
                                        if (user_type == "A" && is_super_admin == 0) {
                                            connection.query("SELECT * FROM permission_role WHERE role_id = " + role_id + " AND permission_id in " + "(SELECT id FROM permissions WHERE name = '" + node_route + "')", function (err, data2) {
                                                if (data2.length == 0) {
                                                    res.status(401).send({"status": -2, "message": "You don't have permission"});
                                                    res.end();
                                                }else {
                                                    return next();
                                                }
                                            })
                                        }
                                    }else {
                                        // check permission only on defined in permission table
                                        return next();
                                    }

                                });
                            }else if(user_type != "A") {
                                res.status(401).send({"status": -2, "message": "Access denied: unauthorized user", 'customer':1});
                                res.end();
                            }

                        }
                    });

                }
            });
        } else {
            res.status(401).send({status: -2, message: 'Unauthorized'})
            res.end();
        }
    },

    SuperAdminOnly: function (req, res, next) {

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
                    var query = connection.query("SELECT u.user_type, u.role_id, u.is_super_admin FROM user u WHERE id =" + user_id, function (err, data) {
                        if (err) {
                            res.status(401).send({status: -2, message: err})
                            res.end();
                        } else if(data.length == 0) {
                            res.status(401).send({status: -2, message: 'User not found'})
                            res.end();
                        }
                        else {

                            var role_id = data[0].role_id;
                            var is_super_admin = data[0].is_super_admin;
                            var user_type = data[0].user_type;

                            // pass all permission if super admin
                            if(is_super_admin == 1) {
                                return next();
                            }else if(user_type == "A") {
                                res.status(401).send({"status": -2, "message": "Access denied: unauthorized user", 'customer':0});
                                res.end();
                            }else {
                                res.status(401).send({"status": -2, "message": "Access denied: unauthorized user", 'customer':1});
                                res.end();
                            }
                        }
                    });

                }
            });
        } else {
            res.status(401).send({status: -2, message: 'Unauthorized'})
            res.end();
        }
    },

    verifyCaptcha : function (req, res, next) {

        if(req.body['g_recaptcha_response'] === undefined || req.body['g_recaptcha_response'] === '' || req.body['g_recaptcha_response'] === null) {
            return res.send({status: -2, message: 'Failed captcha verification.'})
        }
        // Put your secret key here.
        var secretKey = "6LdSvkYUAAAAAAlbQTNXG_hjcnklFaE-AIILForO";
        // req.connection.remoteAddress will provide IP address of connected user.
        var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g_recaptcha_response'] + "&remoteip=" + req.connection.remoteAddress;
        // Hitting GET request to the URL, Google will respond with success or error scenario.
        request(verificationUrl,function(error,response,body) {
          body = JSON.parse(body);
          // Success will be true or false depending upon captcha validation.
          if(body.success !== undefined && !body.success) {
            return res.send({status: -2, message: 'Failed captcha verification.'})
          }else {
            next();
          }

        });


    }
}
