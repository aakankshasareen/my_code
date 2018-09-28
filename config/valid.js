const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
var moment = require('moment');
var mysql = require('mysql');
var connection = require('./db');
var currencyarray = [];
var pair_id_array = [];
var currency_code_array = [];
let sql = mysql.format("SELECT id,(SELECT group_concat(currency_code) FROM `currency_master` where status=1) as currency_code  FROM `pair_master` where status=1");

connection.query(sql, function(error, data) {
    if (error) {
        res.json({ success: false, message: "error", error })
    } else {
        data.forEach(function(i, j) {
            pair_id_array.push(i.id);
        });
    }
})



var devicearray = ['Mobile', 'Desktop']

module.exports = {



    //  errorResult:function(req,res,next){
    //          var errors = req.validationErrors();
    //         if (errors) {
    //             var response = [];
    //             errors.forEach(function(err) {
    //                 response.push(err.msg);
    //             });

    //             res.statusCode = 400;
    //             return res.json({ success: false, message: response[0] });
    //         }

    //         return next();

    // },

    otc_eth: function(req, res, next) {
        req.check('email', 'Invalid email').notEmpty().isEmail();
        var errors = req.validationErrors();
        if (errors) {
            var response = [];
            errors.forEach(function(err) {
                response.push(err.msg);
            });
            res.statusCode = 400;
            return res.json({ success: false, message: response[0] });
        }

        return next();
    },
    register: function(req, res, next) {



        if (Object.keys(req.body).length >= 8) {

            req.check('email', 'Invalid email').notEmpty().isEmail();
            req.check('name', 'Invalid name').notEmpty().matches(/^[ a-zA-Z]*$/).isLength({ max: 50 });
            req.check('mobileNumber', 'Invalid mobile number').notEmpty().matches(/^\+?\d*$/);
            req.check('password', 'Invalid password').notEmpty().matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%-_^*)|(?&#])[A-Za-z\d$@$!%-_^*)|(?&#]{8,}/)
            req.check('device_ipAddress', 'Invalid ip address').notEmpty().isIP();
            req.check('device_os', 'Invalid device os details').notEmpty();
            req.check('device_name', 'Invalid device name').notEmpty().isIn(devicearray);
            req.check('device_browser', 'Invalid device browser').notEmpty();
            //req.check('country', 'Invalid country').notEmpty().matches(/[A-Za-z]/);
            //req.check('sortName', 'Invalid sortname').notEmpty().isAlpha();
            //req.check('dialCode', 'Invalid dial code').notEmpty().isNumeric();
            req.check('referral_id', 'Invalid Referral Id').isLength({ max: 45 }).matches(/^[A-Za-z0-9]*$/)
            // req.check('otp', 'Invalid OTP').notEmpty().isNumeric();
            //exports.errorResult(req)

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
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },

    emailVerify: function(req, res, next) {
        if (Object.keys(req.body).length == 1) {
            req.check('token', 'Invalid token').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                var response = [];
                errors.forEach(function(err) {
                    response.push(err.msg);
                });

                res.statusCode = 400;
                return res.json({ success: false, message: response[0] });
            }

            return next();
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }

    },

    qrcode: function(req, res, next) {

        if (Object.keys(req.body).length == 1) {
            console.log(Object.keys(req.body).length)
            req.check('token', 'Invalid token').notEmpty();


            var errors = req.validationErrors();
            if (errors) {
                var response = [];
                errors.forEach(function(err) {
                    response.push(err.msg);
                });

                res.statusCode = 400;
                return res.json({ success: false, message: response[0] });
            }

            return next();
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },
    signupVerifyCode: function(req, res, next) {

        console.log("Object.keys(req.body).length");


        if (Object.keys(req.body).length == 6) {
            console.log(Object.keys(req.body).length)
            req.check('token', 'Invalid token').notEmpty();
            req.check('device_ipAddress', 'Invalid device_ipAddress').notEmpty();
            req.check('device_os', 'Invalid device_os').notEmpty();
            req.check('device_name', 'Invalid device_name').notEmpty();
            req.check('device_browser', 'Invalid device_browser').notEmpty();
            req.check('verifyCode', 'Invalid verifyCode').notEmpty().isNumeric();
            var errors = req.validationErrors();
            if (errors) {
                var response = [];
                errors.forEach(function(err) {
                    response.push(err.msg);
                });

                res.statusCode = 400;
                return res.json({ success: false, message: response[0] });
            }

            return next();
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },

    email: function(req, res, next) {

        req.check('email', 'Invalid email').notEmpty().isEmail();

        var errors = req.validationErrors();
        if (errors) {
            var response = [];
            errors.forEach(function(err) {
                response.push(err.msg);
            });
            res.statusCode = 400;
            return res.json({ success: false, message: response[0] });
        }

        return next();
    },

    forgotPassword: function(req, res, next) {

        if (Object.keys(req.body).length == 6) {
            console.log(Object.keys(req.body).length)

            req.check('password', 'Invalid password').notEmpty().matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%-_^*)|(?&#])[A-Za-z\d$@$!%-_^*)|(?&#]{8,}/)
            req.check('device_ipAddress', 'Invalid ip address').notEmpty().isIP();
            req.check('device_os', 'Invalid device os details').notEmpty();
            req.check('device_name', 'Invalid device name').notEmpty().isIn(devicearray);
            req.check('device_browser', 'Invalid device browser').notEmpty();
            req.check('token', 'Invalid token').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                var response = [];
                errors.forEach(function(err) {
                    response.push(err.msg);
                });

                res.statusCode = 400;
                return res.json({ success: false, message: response[0] });
            }

            return next();
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },

    accountAcivity: function(req, res, next) {

        if (Object.keys(req.body).length == 4) {
            console.log(Object.keys(req.body).length)

            req.check('limit', 'Invalid limit').notEmpty().isNumeric()
            req.check('offset', 'Invalid offset').notEmpty().isNumeric()
            req.check('date_from', 'Invalid Date').notEmpty().matches(/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9])(?:( [0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/)
            req.check('date_to', 'Invalid Date').notEmpty().matches(/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9])(?:( [0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/)

            var errors = req.validationErrors();
            if (errors) {
                var response = [];
                errors.forEach(function(err) {
                    response.push(err.msg);
                });

                res.statusCode = 400;
                return res.json({ success: false, message: response[0] });
            }

            return next();

        } else if (Object.keys(req.body).length == 2) {
            console.log(Object.keys(req.body).length)
            console.log(req.body.from)
            console.log(req.body.to)

            req.check('limit', 'Invalid limit').notEmpty().isNumeric()
            req.check('offset', 'Invalid offset').notEmpty().isNumeric()

            var errors = req.validationErrors();
            if (errors) {
                var response = [];
                errors.forEach(function(err) {
                    response.push(err.msg);
                });

                res.statusCode = 400;
                return res.json({ success: false, message: response[0] });
            }

            return next();

        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },

    login: function(req, res, next) {

        req.check('email', 'Invalid email').notEmpty().isEmail();
        req.check('password', 'Invalid password').notEmpty().matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%-_^*)|(?&#])[A-Za-z\d$@$!%-_^*)|(?&#]{8,}/)
        req.check('device_ipAddress', 'Invalid ip address').notEmpty().isIP();
        req.check('device_os', 'Invalid device os details').notEmpty();
        req.check('device_name', 'Invalid device name').notEmpty().isIn(devicearray);
        req.check('device_browser', 'Invalid device browser').notEmpty();

        var errors = req.validationErrors();
        if (errors) {
            var response = [];
            errors.forEach(function(err) {
                response.push(err.msg);
            });

            res.statusCode = 400;
            return res.json({ success: false, message: response[0] });
        }

        return next();

    },




    documentdata: function(req, res, next) {
        // console.log(req.body)
        if (req.body.doc_type == 1) {
            //console.log("taht", req.body)

            if (Object.keys(req.body).length == 6) {
                // console.log("inner", req.body)

                req.check('doc_type', 'Invalid doc type').notEmpty().isNumeric();
                req.check('doc_name', 'Invalid doc name').notEmpty().isNumeric();
                req.check('doc_reference', 'Invalid doc reference').notEmpty().matches(/^[a-zA-Z0-9]*$/);
                req.check('issue_date', 'Invalid issue date').notEmpty().matches(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/);
                req.check('issuing_country', 'Invalid issuing country').notEmpty().isNumeric();


                var errors = req.validationErrors();
                if (errors) {
                    var response = [];
                    errors.forEach(function(err) {
                        response.push(err.msg);
                    });

                    res.statusCode = 400;
                    return res.json({ success: false, message: response[0] });
                }

                return next();
            } else if (Object.keys(req.body).length == 6) {


                req.check('doc_type', 'Invalid doc type').notEmpty().isNumeric();
                req.check('doc_name', 'Invalid doc name').notEmpty().isNumeric();
                req.check('doc_reference', 'Invalid doc reference').notEmpty();
                req.check('issue_date', 'Invalid issue date').notEmpty();
                req.check('issuing_country', 'Invalid issuing country').notEmpty().isNumeric();
                req.check('expiration_date', 'Invalid expiration date').notEmpty().matches(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/);
                var todayDate = moment(new Date()).format("YYYY-MM-DD");
                var errors = req.validationErrors();
                if (errors) {
                    var response = [];
                    errors.forEach(function(err) {
                        response.push(err.msg);
                    });

                    res.statusCode = 400;
                    return res.json({ success: false, message: response[0] });
                } else if (req.body.expiration_date <= req.body.issue_date || req.body.expiration_date < todayDate) {
                    return res.json({ success: false, message: "Invalid expiry date" });
                }

                return next();
            } else {
                res.json({ success: false, message: "Please send proper parameters" })
            }

        } else if (req.body.doc_type == 3) {
            if (Object.keys(req.body).length == 6) {

                req.check('fullname', 'Invalid fullname').notEmpty().matches(/^[ a-zA-Z]*$/).isLength({ max: 50 });
                req.check('doc_type', 'Invalid doc_type').notEmpty().isNumeric();
                req.check('gender', 'Invalid gender').notEmpty().isIn(['female', 'male']);
                req.check('mobileNumber', 'Invalid mobile number').notEmpty().matches(/^\+?\d*$/);
                req.check('date_of_birth', 'Invalid date_of_birth').notEmpty().matches(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/);
                req.check('birth_place', 'Invalid birth_place').notEmpty().matches(/^[ a-zA-Z]*$/).isLength({ max: 50 });

                var errors = req.validationErrors();
                if (errors) {
                    var response = [];
                    errors.forEach(function(err) {
                        response.push(err.msg);
                    });

                    res.statusCode = 400;
                    return res.json({ success: false, message: response[0] });
                }

                return next();
            } else {
                res.json({ success: false, message: "Please send proper parameters" })
            }


        } else if (req.body.doc_type == 2) {

            // if(req.body.doc_type != '' || req.body.doc_type != 'null'){

            //  req.check('doc_type', 'Invalid doc type').isNumeric();
            //   }
            //   if(req.body.pin_code != '' || req.body.pin_code != 'null'){
            //     req.check('pin_code', 'Invalid pin code')().matches(/^[- a-zA-Z0-9]*$/).isLength({max:10});
            //   }
            //  if(req.body.city != '' || req.body.city != 'null'){
            //     req.check('city','Invalid city').isNumeric();
            //  }
            //  if(req.body.state != '' || req.body.state != 'null'){
            //     req.check('state','Invalid state').isNumeric();
            //  }
            //  if(req.body.country != '' || req.body.country != 'null'){
            //     req.check('country','Invalid country').isNumeric();
            //  }
            //  if(req.body.address != '' || req.body.address != 'null'){
            //     req.check('address','Invalid address').isLength({max:400});
            //  }
            //  if(req.body.doc_name != '' || req.body.doc_name != 'null'){
            //      req.check('doc_name', 'Invalid doc name').isNumeric();
            //  }

            //     var errors = req.validationErrors();
            //     if (errors) {
            //         var response = [];
            //         errors.forEach(function(err) {
            //             response.push(err.msg);
            //         });

            //         res.statusCode = 400;
            //         return res.json({ success: false, message: response[0] });
            //     }


            if ('pin_code' in req.body) {
                if (req.body.pin_code != '') {
                    req.check('pin_code', 'Invalid pin code').matches(/^[- a-zA-Z0-9]*$/).isLength({ max: 10 });
                }
            }

            if ('city' in req.body) {
                if (req.body.city != '') {
                    req.check('city', 'Invalid city').isNumeric();
                }
            }
            if ('state' in req.body) {
                if (req.body.state != '') {
                    req.check('state', 'Invalid state').isNumeric();
                }
            }
            if ('country' in req.body) {
                if (req.body.country != '') {
                    req.check('country', 'Invalid country').isNumeric();
                }
            }
            if ('address' in req.body) {
                if (req.body.address != '') {
                    req.check('address', 'Invalid address').isLength({ max: 400 });
                }
            }
            if ('doc_name' in req.body) {
                if (req.body.doc_name != '') {
                    req.check('doc_name', 'Invalid doc name').isNumeric();
                }
            }
            var errors = req.validationErrors();
            if (errors) {
                var response = [];
                errors.forEach(function(err) {
                    response.push(err.msg);
                });

                res.statusCode = 400;
                return res.json({ success: false, message: response[0] });
            }
            if ('country' in req.body) {
                if (req.body.country != '') {
                    let sql = mysql.format("select id from countries where id=" + req.body.country);
                    connection.query(sql, function(error, data) {
                        if (error) {
                            res.json({ success: false, message: "error", error })
                        } else if (data.length == 0) {
                            res.json({ success: false, message: "Invalid country" })
                        } else {
                            return next();
                        }
                    })
                } else {
                    return next();
                }
            } else {
                return next();
            }
            // return next();

        } else if (req.body.doc_type == 5) {
            if (Object.keys(req.body).length == 7) {

                req.check('doc_type', 'Invalid doc type').notEmpty().isNumeric();
                req.check('doc_name', 'Invalid doc name').notEmpty().isNumeric();
                req.check('res_pin_code', 'Invalid res pin code').notEmpty().matches(/^[- a-zA-Z0-9]*$/).isLength({ max: 10 });
                req.check('res_city', 'Invalid res city').notEmpty().isNumeric();
                req.check('res_state', 'Invalid res state').notEmpty().isNumeric();
                req.check('res_country', 'Invalid res country').notEmpty().isNumeric();
                req.check('res_address', 'Invalid res address').notEmpty().isLength({ max: 400 });
                var errors = req.validationErrors();
                if (errors) {
                    var response = [];
                    errors.forEach(function(err) {
                        response.push(err.msg);
                    });

                    res.statusCode = 400;
                    return res.json({ success: false, message: response[0] });
                }

                return next();
            } else {
                res.json({ success: false, message: "Please send proper parameters" })
            }
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },

    verifyCode: function(req, res, next) {

        if (Object.keys(req.body).length == 1) {
            console.log(Object.keys(req.body).length)
            req.check('verifyCode', 'Invalid verifyCode').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                var response = [];
                errors.forEach(function(err) {
                    response.push(err.msg);
                });

                res.statusCode = 400;
                return res.json({ success: false, message: response[0] });
            }

            return next();
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },

    profile: function(req, res, next) {
        console.log(req.body)

        if (Object.keys(req.body).length == 9) {
            console.log(Object.keys(req.body).length)

            req.check('fullname', 'Invalid fullname').notEmpty().matches(/^[ a-zA-Z]*$/).isLength({ max: 50 });
            req.check('city', 'Invalid city').notEmpty().isNumeric();
            req.check('country', 'Invalid country').notEmpty().isNumeric();
            req.check('address', 'Invalid address').isLength({ max: 400 })
            req.check('postal_code', 'Invalid postal code').notEmpty().isAlphanumeric().isLength({ max: 10 });
            req.check('device_ipAddress', 'Invalid ip address').notEmpty().isIP();
            req.check('device_os', 'Invalid device os details').notEmpty();
            req.check('device_name', 'Invalid device name').notEmpty().isIn(devicearray);
            req.check('device_browser', 'Invalid device browser').notEmpty();


            var errors = req.validationErrors();
            if (errors) {
                var response = [];
                errors.forEach(function(err) {
                    response.push(err.msg);
                });

                res.statusCode = 400;
                return res.json({ success: false, message: response[0] });
            }

            return next();
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },
    getImage: function(req, res, next) {
        console.log(req.body)

        if (Object.keys(req.body).length == 1) {
            console.log(Object.keys(req.body).length)

            req.check('path', 'Invalid Path').notEmpty()

            var errors = req.validationErrors();
            if (errors) {
                var response = [];
                errors.forEach(function(err) {
                    response.push(err.msg);
                });

                res.statusCode = 400;
                return res.json({ success: false, message: response[0] });
            }

            return next();
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },

    download: function(req, res, next) {
        console.log(req.query)

        if (Object.keys(req.query).length == 2) {
            console.log(Object.keys(req.query).length)

            req.check('token', 'Invalid token').notEmpty()
            req.check('path', 'Invalid Path').notEmpty()

            var errors = req.validationErrors();
            if (errors) {
                var response = [];
                errors.forEach(function(err) {
                    response.push(err.msg);
                });

                res.statusCode = 400;
                return res.json({ success: false, message: response[0] });
            }

            return next();
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },

    changePassword: function(req, res, next) {

        if (Object.keys(req.body).length == 6) {
            console.log(Object.keys(req.body).length)

            req.check('oldPassword', 'Invalid old password').notEmpty().matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%-_^*)|(?&#])[A-Za-z\d$@$!%-_^*)|(?&#]{8,}/)
            req.check('newPassword', 'Invalid new password').notEmpty().matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%-_^*)|(?&#])[A-Za-z\d$@$!%-_^*)|(?&#]{8,}/)
            req.check('device_ipAddress', 'Invalid ip address').notEmpty().isIP();
            req.check('device_os', 'Invalid device os details').notEmpty();
            req.check('device_name', 'Invalid device name').notEmpty().isIn(devicearray);
            req.check('device_browser', 'Invalid device browser').notEmpty();


            var errors = req.validationErrors();
            if (errors) {
                var response = [];
                errors.forEach(function(err) {
                    response.push(err.msg);
                });

                res.statusCode = 400;
                return res.json({ success: false, message: response[0] });
            }

            return next();
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },
    cancelOrder: function(req, res, next) {
        if (Object.keys(req.body).length == 2) {
            console.log(Object.keys(req.body).length)


            req.check('order_type', 'Invalid order type').notEmpty().isIn(['Sell', 'Buy'])
            req.check('id', 'Invalid Invalid').notEmpty().isNumeric()



            var errors = req.validationErrors();
            if (errors) {
                var response = [];
                errors.forEach(function(err) {
                    response.push(err.msg);
                });

                res.statusCode = 400;
                return res.json({ success: false, message: response[0] });
            }

            return next();
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },

    money: function(req, res, next) {

        if (Object.keys(req.body).length == 4 || Object.keys(req.body).length <= 9) {
            console.log(Object.keys(req.body).length)
            console.log(req.body)
            connection.query(sql, function(error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error })
                } else {
                    if (data[0].currency_code != '') {
                        currency_code_array = data[0].currency_code.split(',');
                    }
                    req.check('amount', 'Invalid amount').notEmpty().isDecimal({ decimal_digits: '0,8' }).not().isIn([0]);
                    req.check('currency_code', 'Invalid currency code').notEmpty().isUppercase().isAlpha().isIn(currency_code_array);
                    req.check('device_ipAddress', 'Invalid ip address').notEmpty().isIP();
                    req.check('device_os', 'Invalid device os details').notEmpty();
                    req.check('device_name', 'Invalid device name').notEmpty().isIn(devicearray);
                    req.check('device_browser', 'Invalid device browser').notEmpty();

                    var receiverAddress = Object.keys(req.body.receiverAddress != undefined ? req.body.receiverAddress : "");
                    if (receiverAddress != "") {
                        req.check('receiverAddress', 'Invalid Address').notEmpty();
                    }
                    var errors = req.validationErrors();
                    if (errors) {
                        var response = [];
                        errors.forEach(function(err) {
                            response.push(err.msg);
                        });

                        res.statusCode = 400;
                        return res.json({ success: false, message: response[0] });
                    }

                    return next();
                }
            })
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },
    addmoneyV: function(req, res, next) {

        if (Object.keys(req.body).length == 8 || Object.keys(req.body).length <= 10) {
            connection.query(sql, function(error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error })
                } else {
                    if (data[0].currency_code != '') {
                        currency_code_array = data[0].currency_code.split(',');
                    }
                    req.check('amount', 'Invalid amount').notEmpty().isDecimal({ decimal_digits: '0,8' }).not().isIn([0]);
                    req.check('currency_code', 'Invalid currency code').notEmpty().isUppercase().isAlpha().isIn(currency_code_array);
                    req.check('device_ipAddress', 'Invalid ip address').notEmpty().isIP();
                    req.check('device_os', 'Invalid device os details').notEmpty();
                    req.check('device_name', 'Invalid device name').notEmpty().isIn(devicearray);
                    req.check('device_browser', 'Invalid device browser').notEmpty();
                    req.check('reference_no', 'Invalid reference no').notEmpty();
                    req.check('deposit_date', 'Invalid deposit date').notEmpty();
                    req.check('mode', 'Invalid Mode').notEmpty();



                    var errors = req.validationErrors();
                    if (errors) {
                        var response = [];
                        errors.forEach(function(err) {
                            response.push(err.msg);
                        });

                        res.statusCode = 400;
                        return res.json({ success: false, message: response[0] });
                    }

                    return next();
                }
            })
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },


    fiatHistory: function(req, res, next) {

        if (Object.keys(req.body).length == 3) {
            console.log(Object.keys(req.body).length)
            connection.query(sql, function(error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error })
                } else {
                    if (data[0].currency_code != '') {
                        currency_code_array = data[0].currency_code.split(',');
                    }
                    req.check('currency_code', 'Invalid currency code').notEmpty().isUppercase().isAlpha().isIn(currency_code_array);
                    req.check('limit', 'Invalid limit').notEmpty();
                    req.check('offset', 'Invalid offset').notEmpty();

                    var errors = req.validationErrors();
                    if (errors) {
                        var response = [];
                        errors.forEach(function(err) {
                            response.push(err.msg);
                        });

                        res.statusCode = 400;
                        return res.json({ success: false, message: response[0] });
                    }

                    return next();
                }
            })
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },

    marketSellOrder: function(req, res, next) {

        if (Object.keys(req.body).length == 3) {

            connection.query(sql, function(error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error })
                } else {
                    data.forEach(function(i, j) {
                        pair_id_array.push(i.id);
                    })
                    if (data[0].currency_code != '') {
                        currency_code_array = data[0].currency_code.split(',');
                    }
                    req.check('currency_code', 'Invalid currency code').notEmpty().isLength({ max: 5 }).isUppercase().isAlpha().isIn(currency_code_array);
                    req.check('pair_id', 'Invalid pair id').notEmpty().isNumeric().isIn(pair_id_array)
                    req.check('quantity', 'Invalid quantity').notEmpty().isDecimal({ decimal_digits: '0,8' }).not().isIn([0]);
                    var errors = req.validationErrors();
                    if (errors) {
                        var response = [];
                        errors.forEach(function(err) {
                            response.push(err.msg);
                        });

                        res.statusCode = 400;
                        return res.json({ success: false, message: response[0] });
                    }
                    return next();
                }
            })
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },
    marketBuyOrder: function(req, res, next) {

        if (Object.keys(req.body).length == 3) {

            connection.query(sql, function(error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error })
                } else {
                    data.forEach(function(i, j) {
                        pair_id_array.push(i.id);
                    })
                    if (data[0].currency_code != '') {
                        currency_code_array = data[0].currency_code.split(',');
                    }
                    req.check('currency_code', 'Invalid currency code').notEmpty().isLength({ max: 5 }).isUppercase().isAlpha().isIn(currency_code_array);
                    req.check('pair_id', 'Invalid pair id').notEmpty().isNumeric().isIn(pair_id_array)
                    req.check('amount', 'Invalid amount').notEmpty().isDecimal({ decimal_digits: '0,8' }).not().isIn([0]);

                    var errors = req.validationErrors();
                    if (errors) {
                        var response = [];
                        errors.forEach(function(err) {
                            response.push(err.msg);
                        });

                        res.statusCode = 400;
                        return res.json({ success: false, message: response[0] });
                    }

                    return next();
                }
            })
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },
    limitPrice: function(req, res, next) {

        if (Object.keys(req.body).length == 1) {
            connection.query(sql, function(error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error })
                } else {
                    data.forEach(function(i, j) {
                        pair_id_array.push(i.id);
                    })
                    req.check('pair_id', 'Invalid pair id').notEmpty().isNumeric().isIn(pair_id_array);
                    var errors = req.validationErrors();
                    if (errors) {
                        var response = [];
                        errors.forEach(function(err) {
                            response.push(err.msg);
                        });

                        res.statusCode = 400;
                        return res.json({ success: false, message: response[0] });
                    }

                    return next();
                }
            })
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },

    limitCal: function(req, res, next) {

        if (Object.keys(req.body).length == 3) {
            console.log(Object.keys(req.body).length)

            connection.query(sql, function(error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error })
                } else {
                    data.forEach(function(i, j) {
                        pair_id_array.push(i.id);
                    })
                    req.check('pair_id', 'Invalid pair id').notEmpty().isNumeric().isIn(pair_id_array);
                    req.check('amount', 'Invalid amount').notEmpty().isDecimal({ decimal_digits: '0,8' }).not().isIn([0]);
                    req.check('quantity', 'Invalid quantity').notEmpty().isDecimal({ decimal_digits: '0,8' }).not().isIn([0]);

                    var errors = req.validationErrors();
                    if (errors) {
                        var response = [];
                        errors.forEach(function(err) {
                            response.push(err.msg);
                        });

                        res.statusCode = 400;
                        return res.json({ success: false, message: response[0] });
                    }

                    return next();
                }
            })
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },


    limitBuyOrder: function(req, res, next) {

        if (Object.keys(req.body).length == 7) {

            connection.query(sql, function(error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error })
                } else {
                    data.forEach(function(i, j) {
                        pair_id_array.push(i.id);
                    })
                    if (data[0].currency_code != '') {
                        currency_code_array = data[0].currency_code.split(',');
                    }
                    req.check('currency_code', 'Invalid currency code').notEmpty().isLength({ max: 5 }).isUppercase().isAlpha().isIn(currency_code_array);
                    req.check('pair_id', 'Invalid pair id').notEmpty().isNumeric().isIn(pair_id_array);
                    req.check('amount', 'Invalid amount').notEmpty().isDecimal({ decimal_digits: '0,8' }).not().isIn([0]);
                    req.check('total_amount', 'Invalid total_amount').notEmpty().isDecimal({ decimal_digits: '0,8' }).not().isIn([0]);
                    req.check('fee_value', 'Invalid fee_value ').notEmpty().isDecimal({ decimal_digits: '0,8' });
                    req.check('fee_percentage', 'Invalid fee_percentage').notEmpty().isDecimal({ decimal_digits: '0,8' });
                    req.check('quantity', 'Invalid quantity').notEmpty().isDecimal({ decimal_digits: '0,8' }).not().isIn([0]);
                    var errors = req.validationErrors();
                    if (errors) {
                        var response = [];
                        errors.forEach(function(err) {
                            response.push(err.msg);
                        });

                        res.statusCode = 400;
                        return res.json({ success: false, message: response[0] });
                    }

                    return next();
                }
            })
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }

    },
    limitSellOrder: function(req, res, next) {

        if (Object.keys(req.body).length == 4) {
            // console.log(Object.keys(req.body).length)

            connection.query(sql, function(error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error })
                } else {
                    data.forEach(function(i, j) {
                        pair_id_array.push(i.id);
                    })
                    if (data[0].currency_code != '') {
                        currency_code_array = data[0].currency_code.split(',');
                    }
                    req.check('currency_code', 'Invalid currency code').notEmpty().isLength({ max: 5 }).isUppercase().isAlpha().isIn(currency_code_array);
                    req.check('pair_id', 'Invalid pair id').notEmpty().isNumeric().isIn(pair_id_array);
                    req.check('amount', 'Invalid amount').notEmpty().isDecimal({ decimal_digits: '0,8' }).not().isIn([0]);
                    req.check('quantity', 'Invalid quantity').notEmpty().isDecimal({ decimal_digits: '0,8' }).not().isIn([0]);

                    var errors = req.validationErrors();
                    if (errors) {
                        var response = [];
                        errors.forEach(function(err) {
                            response.push(err.msg);
                        });

                        res.statusCode = 400;
                        return res.json({ success: false, message: response[0] });
                    }

                    return next();
                }
            })

        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },



    allTransaction: function(req, res, next) {
        console.log(req.body);

        connection.query(sql, function(error, data) {
            if (error) {
                res.json({ success: false, message: "error", error })
            } else {
                data.forEach(function(i, j) {
                    pair_id_array.push(i.id);
                })
                req.check('limit', 'Invalid limit').notEmpty().isNumeric()
                req.check('offset', 'Invalid offset').notEmpty().isNumeric()

                if (typeof req.body.type !== 'undefined' && req.body.type) {
                    req.check('type', 'Invalid type').notEmpty().isIn(['Limit', 'Market'])
                    // console.log(searchQuery)
                }

                if (typeof req.body.tradeType !== '' && req.body.tradeType) {
                    req.check('tradeType', 'Invalid trade type').notEmpty().isIn(['Buy', 'Sell'])
                    //console.log(searchQuery)
                }
                if (typeof req.body.pair_id !== 'undefined' && req.body.pair_id) {
                    req.check('pair_id', 'Invalid pair id').notEmpty().isNumeric().isIn(pair_id_array);
                    //console.log(searchQuery)
                }
                if (typeof req.body.status !== 'undefined' && req.body.status !== '') {
                    req.check('status', 'Invalid status').notEmpty().isIn(['Fully Executed', 'Executed', 'Partially Executed', 'Not Executed'])
                    //console.log(searchQuery)

                }
                if (typeof req.body.dateTo !== 'undefined' && req.body.dateTo !== '' && typeof req.body.dateFrom !== 'undefined' && req.body.dateFrom !== '') {
                    req.check('dateTo', 'Invalid date').notEmpty()
                    req.check('dateFrom', 'Invalid date').notEmpty()
                }
                var errors = req.validationErrors();
                if (errors) {
                    var response = [];
                    errors.forEach(function(err) {
                        response.push(err.msg);
                    });

                    res.statusCode = 400;
                    return res.json({ success: false, message: response[0] });
                }

                return next();
            }
        })

    },
    addBankDetailsValid: function(req, res, next) {

        if (Object.keys(req.body).length == 6 || Object.keys(req.body).length == 10) {
            // if(bankAccountNo === bankAccountNoConf) {
            req.check('bankName', 'Invalid Bank name').notEmpty();
            req.check('accountHolderName', 'Invalid Account holder name').notEmpty();
            req.check('ifscCode', 'Invalid Ifsc code').notEmpty().isLength({ max: 15 });
            req.check('bankBranch', 'Invalid Bank branch').notEmpty();
            req.check('bankAccountNo', 'Invalid Account no').notEmpty().isNumeric().isLength({ max: 20 });
            req.check('accountType', 'Invalid account type').notEmpty();

            // }else {
            //     res.json({ success: false, message: "Please check bank account numbers" })
            // }

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
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },

    customerKycDetails: function(req, res, next) {
        if (Object.keys(req.body).length == 4 || Object.keys(req.body).length <= 10) {
            req.check('pan_name', 'Enter name as pan card').notEmpty();
            req.check('aadhar_name', 'Enter name as aadhar card').notEmpty();
            req.check('dob', 'Enter DOB').notEmpty();
            req.check('pan_num', 'Enter pan number').notEmpty();
            req.check('pan_img', 'Enter pan image').notEmpty()
            req.check('aadhar_num', 'Invalid Aadhar Number').notEmpty().isNumeric().isLength({ max: 20 });;
            req.check('aadhar_front_img', 'Enter front image').notEmpty();
            req.check('aadhar_back_img', 'Enter back image ').notEmpty();
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
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },


    signInVerifyOTP: function(req, res, next) {
        if (Object.keys(req.body).length == 6) {
            console.log(Object.keys(req.body).length)
            req.check('token', 'Invalid token').notEmpty();
            req.check('device_ipAddress', 'Invalid device_ipAddress').notEmpty();
            req.check('device_os', 'Invalid device_os').notEmpty();
            req.check('device_name', 'Invalid device_name').notEmpty();
            req.check('device_browser', 'Invalid device_browser').notEmpty();
            req.check('otp', 'Invalid otp').notEmpty().isNumeric();
            var errors = req.validationErrors();
            if (errors) {
                var response = [];
                errors.forEach(function(err) {
                    response.push(err.msg);
                });

                res.statusCode = 400;
                return res.json({ success: false, message: response[0] });
            }

            return next();
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },


    newDepositRequest: function(req, res, next) {
        if (Object.keys(req.body).length == 8) {
            console.log(Object.keys(req.body).length)
            req.check('date', 'Invalid Date').notEmpty();
            req.check('email', 'Invalid Email').notEmpty().isEmail();
            req.check('name', 'Invalid Name').notEmpty().matches(/^[ a-zA-Z]*$/).isLength({ max: 50 });
            req.check('currency', 'Invalid Currency').notEmpty();
            req.check('amount', 'Invalid Amount').notEmpty().isDecimal({ decimal_digits: '0,8' }).not().isIn([0]);
            req.check('type', 'Invalid Type').notEmpty();
            req.check('utr', 'Invalid UTR').notEmpty().isLength({ max: 16 });
            req.check('info', 'Invalid info').notEmpty().isLength({ max: 1200 });;
            var errors = req.validationErrors();
            if (errors) {
                console.log('errors', errors)
                var response = [];
                errors.forEach(function(err) {
                    response.push(err.msg);
                });

                res.statusCode = 400;
                return res.json({ success: false, message: response[0] });
            }

            return next();
        } else {
            res.json({ success: false, message: "Please send proper parameters" })
        }
    },


    useraddress: function(req, res, next) {

        req.check('email', 'Invalid email').notEmpty().isEmail();

        var errors = req.validationErrors();
        if (errors) {
            var response = [];
            errors.forEach(function(err) {
                response.push(err.msg);
            });
            res.statusCode = 400;
            return res.json({ success: false, message: response[0] });
        }

        return next();
    },
}


// function countProperties (obj) {
//     var count = 0;

//     for (var property in obj) {
//         if (Object.prototype.hasOwnProperty.call(obj, property)) {
//             count++;
//         }
//     }

//     return count;
// }

// var bookCount = countProperties(bookAuthors);

// // Outputs: 4
// console.log(bookCount);



// validatePhoto:function(req, res, next) {
//     console.log(req.body)
//   validator('email', 'Invalid description’').isEmpty();
//   validator('mobileNumber', 'Invalid mobile number').isNumeric();
//   validator('password','Invalid password');

//   var errors = req.validationErrors();
//   if (errors) {
//     var response = { errors: [] };
//     errors.forEach(function(err) {
//       response.errors.push(err.msg);
//     });

//     res.statusCode = 400;
//     return res.json(response);
//   }

//   return next();
//  }
// }




// register: function(req, res, next) {
//     //console.log(req)
//     // console.log(req.body)
//     if (Object.keys(req.body).length == 8 || Object.keys(req.body).length == 9) {
//         //console.log(Object.keys(req.body).length)
//         check('email', 'Invalid email').isEmpty().isEmail(),
//         check('mobileNumber', 'Invalid mobile number').isEmpty(),
//         check('password', 'Invalid password').isEmpty().isLength({ min: 6 }).matches(['^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{6,}', 'g']),
//         check('device_ipAddress', 'Invalid ip address').isEmpty(),
//         check('device_os', 'Invalid device os details').isEmpty(),
//         check('device_name', 'Invalid device name').isEmpty(),
//         check('device_browser', 'Invalid device browser').isEmpty(),

//         var errors = getValidationResult(req);
//         // if (errors) {
//         //     var response = [];
//         //     errors.forEach(function(err) {
//         //         response.push(err.msg);
//         //     });
//         if (!errors.isEmpty()) {
//             res.statusCode = 400;
//             return res.json({ success: false, message: response });
//         }

//         return next();
//     } else {
//         res.json({ success: false, message: "Please send proper parameters" })
//     }
// },