const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var jwt = require('jsonwebtoken');
var config = require('./config');


module.exports = {
  validationErrorsResponse: function (req, res) {
    var errors = req.validationErrors();
    if (errors) {
      var response = [];
      var temp = [];
      errors.forEach(function (err) {
        // check for duplicate error message
        if (temp.indexOf(err.param) == -1) {
          response.push(err.msg);
        }
        temp.push(err.param);
      });
      return response;
    }
  },

  addCountry: function (req, res, next) {
    if (Object.keys(req.body).length == 4 || Object.keys(req.body).length == 5) {
      req.checkBody({
        country_name: {
          notEmpty: true,
          errorMessage: 'Invalid country name'
        },
        country_sortname: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[A-Za-z]{2,4}$/i,
            errorMessage: 'Invalid country sortname',
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'country sortnames is required'
        },
        country_phonecode: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[0-9]{2,4}$/i,
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid country phonecode'
        },
        status: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[0-1]{1}$/,
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid country status'
        }
      });

      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {
        return res.json({ success: false, message: errors });
      } else {
        req.sanitize('country_sortname').trim();
        req.sanitize('country_sortname').escape();
        req.sanitize('country_name').trim();
        req.sanitize('country_name').escape();
      }
      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },

  addCity: function (req, res, next) {
    if (Object.keys(req.body).length == 4 || Object.keys(req.body).length == 5) {
      req.checkBody({
        country_id: {
          notEmpty: true,
          isInt: {
            options:[{min : 1}]
          },
          errorMessage: 'Invalid country'
        },
        state_id: {
          notEmpty: true,
          isInt: {
            options:[{min : 1}]
          },
          errorMessage: 'Invalid state'
        },
        city_name: {
          notEmpty: true,
          matches: {
            //more than one options must be passed as arrays
            options: /^[A-Z ]{2,50}$/i,
            //single options may be passed directly
            //options: /someregex/i
          },
          errorMessage: 'Invalid city name'
        },
        status: {
          notEmpty: true,
          matches: {
            //more than one options must be passed as arrays
            options: /^[0-1]{1}$/,
            //single options may be passed directly
            //options: /someregex/i
          },
          errorMessage: 'Invalid state status'
        }
      });

      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {
        return res.json({ success: false, message: errors });
      } else {
        req.sanitize('city_name').trim();
        req.sanitize('city_name').escape();
      }
      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },

  addState: function (req, res, next) {
    if (Object.keys(req.body).length == 3 || Object.keys(req.body).length == 4) {
      req.checkBody({
        country_id: {
          notEmpty: true,
          isInt: {
            options:[{min : 1}]
          },
          errorMessage: 'Invalid country'
        },
        state_name: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[A-Z ]{2,50}$/i,
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid state name'
        },
        status: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[0-1]{1}$/,
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid state status'
        }
      });


      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {

        return res.json({ success: false, message: errors });
      } else {
        req.sanitize('state_name').trim();
        req.sanitize('state_name').escape();
      }

      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },

  addKYC: function (req, res, next) {
    // if(Object.keys(req.body).length == 5 || Object.keys(req.body).length == 6) {

    req.checkBody({
      country_id: {
        notEmpty: true,
        isInt: true,
        // matches: {
        //   // more than one options must be passed as arrays
        //   options: /^[0-9]{1,4}$/i,
        //   // single options may be passed directly
        //   // options: /someregex/i
        // },
        errorMessage: 'Invalid country'
      },

      type: {
        notEmpty: true,
        isInt: true,
        matches: {
          // more than one options must be passed as arrays
          // options: /^[1-9]{1,5}$/i,
          // single options may be passed directly
          // options: /someregex/i
        },
        errorMessage: 'Invalid type'
      },
      name: {
        notEmpty: true,
        errorMessage: 'Invalid name'
      },
      status: {
        notEmpty: true,
        matches: {
          // more than one options must be passed as arrays
          // options: /^[0-1]{1}$/,
          // single options may be passed directly
          // options: /someregex/i
        },
        errorMessage: 'Invalid status'
      }
    });

    var errors = module.exports.validationErrorsResponse(req, res);
    if (errors) {
      return res.json({ success: false, message: errors });
    } else {
      req.sanitize('icon_name').trim();
      req.sanitize('icon_name').escape();
      req.sanitize('name').trim();
      req.sanitize('name').escape();
    }
    return next();
    // } else {
    //     res.json({success: false, message: "Please send proper parameters"})
    // }
  },

  addRole: function (req, res, next) {
    if (Object.keys(req.body).length == 3 || Object.keys(req.body).length == 4) {

      req.checkBody({
        roles_name: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[a-z0-9- ]{1,100}$/i,
            errorMessage: 'Invalid role name',
            // single options may be passed directly
            // options: /someregex/i
          },
          //                  errorMessage: 'role name is required'
        },

        roles_description: {
          notEmpty: true,
          errorMessage: 'Invalid description'
        },
        is_active: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[0-1]{1}$/,
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid status'
        }
      });

      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {
        return res.json({ success: false, message: errors });
      } else {
        req.sanitize('description').trim();
        req.sanitize('description').escape();
        req.sanitize('name').trim();
        req.sanitize('name').escape();
      }
      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },

  registerAdminUser: function (req, res, next) {
    req.checkBody({
      name: {
        notEmpty: true,
        errorMessage: 'Invalid name'
      },
      email: {
        notEmpty: true,
        isEmail: {
          // more than one options must be passed as arrays
          errorMessage: 'Invalid email'
        },
        errorMessage: 'Email address is required'
      },
      password: {
        notEmpty: true,
        matches: {
          //more than one options must be passed as arrays
          options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&#~^()-_+=\/])[A-Za-z\d$@$!%*?&#~^()-_+=\/]{6,}/,
        },
        errorMessage: 'Password should contain minimum 6 characters, at least one uppercase letter, one lowercase letter, one number and one special character'
      },
      //                confirm_password: {
      //                  notEmpty: true,
      //                  matches: {
      //                    // more than one options must be passed as arrays
      //                    options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{6,}/,
      //                    // single options may be passed directly
      //                    // options: /someregex/i
      //                  },
      //                  errorMessage: 'Invalid confirm password'
      //                },
      role_id: {
        notEmpty: true,
        matches: {
          // more than one options must be passed as arrays
          options: /^[0-9]{1,10}$/,
          // single options may be passed directly
          // options: /someregex/i
        },
        errorMessage: 'Invalid role'
      },
      status: {
        notEmpty: true,
        matches: {
          // more than one options must be passed as arrays
          options: /^[0-1]{1}$/,
          // single options may be passed directly
          // options: /someregex/i
        },
        errorMessage: 'Invalid status'
      },
    });

    // req.assert('confirm_password', 'Passwords and confirm password must match').equals(req.body.password);

    var errors = module.exports.validationErrorsResponse(req, res);
    if (errors) {

      return res.json({ success: false, message: errors });
    } else {
      req.sanitize('state_name').trim();
      req.sanitize('state_name').escape();
    }

    return next();

  },

  editBackendUser: function (req, res, next) {
    if (Object.keys(req.body).length == 11) {
      req.checkBody({
        name: {
          notEmpty: true,
          errorMessage: 'Invalid name'
        },
        email: {
          notEmpty: true,
          isEmail: {
            // more than one options must be passed as arrays
            errorMessage: 'Invalid email'
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Email address is required'
        },
        password: {
          notEmpty: false,
          matches: {
            //more than one options must be passed as arrays
            options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&#~^()-_+=\/])[A-Za-z\d$@$!%*?&#~^()-_+=\/]{6,}|^\s*$/,
            //single options may be passed directly
            //options: /someregex/i
          },
          errorMessage: 'Password should contain minimum 6 characters, at least one uppercase letter, one lowercase letter, one number and one special character'
        },
        role_id: {
          notEmpty: true,
          matches: {
            options: /^[0-9]{1,10}$/,
          },
          errorMessage: 'Invalid role'
        },
        status: {
          notEmpty: true,
          matches: {
            //more than one options must be passed as arrays
            options: /^[0-1]{1}$/,
            //single options may be passed directly
            //options: /someregex/i
          },
          errorMessage: 'Invalid status'
        },
      });

      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {
        return res.json({ success: false, message: errors });
      } else {
        req.sanitize('state_name').trim();
        req.sanitize('state_name').escape();
      }
      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },

  adminLogin: function (req, res, next) {
    if (Object.keys(req.body).length == 2) {

      req.checkBody({
        email: {
          notEmpty: true,
          isEmail: {
            // more than one options must be passed as arrays
            errorMessage: 'Invalid email'
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Email address is required'
        },

        password: {
          notEmpty: false,
          matches: {
            //more than one options must be passed as arrays
            options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&#~^()-_+=\/])[A-Za-z\d$@$!%*?&#~^()-_+=\/]{6,}|^\s*$/,
            //single options may be passed directly
            //options: /someregex/i
          },
          errorMessage: 'Password should contain minimum 6 characters, at least one uppercase letter, one lowercase letter, one number and one special character'
        },
      });

      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {

        return res.json({ success: false, message: errors });
      }
      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },

  addCurrency: function (req, res, next) {
    if (Object.keys(req.body).length == 4 || Object.keys(req.body).length <= 8) {
      req.checkBody({
        currency_name: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[A-Z a-z]{1,45}$/i,
            errorMessage: 'Invalid currency name',
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid currency name'
        },
        currency_code: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[A-Za-z0-9]{1,45}$/i,
            errorMessage: 'Invalid currency code',
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid currency code'
        },
        currency_type: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[0-9]{1,10}$/,
            errorMessage: 'Invalid currency type',
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid currency type'
        },
        currency_status: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[0-1]{1}$/,
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid status'
        },
        currency_icon: {
          notEmpty: true,
          errorMessage: 'File is require'
        },
      });

      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {
        return res.json({ success: false, message: errors });
      } else {
        req.sanitize('currency_icon').trim();
        req.sanitize('currency_icon').escape();
      }
      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },

  getImageData: function (req, res, next) {
    if (Object.keys(req.body).length == 1) {
      req.check('path', 'Path is required').notEmpty();
      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {
        return res.json({ success: false, message: errors });
      }
      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },

  downloadAdmin: function (req, res, next) {
    if (Object.keys(req.query).length == 2) {
      req.check('path', 'Path is required').notEmpty();
      req.check('token', 'Token is required').notEmpty();
      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {
        return res.json({ success: false, message: errors });
      }
      var token = req.query.token;
      jwt.verify(token, config.superSecret, function (err, decoded) {
        if (err) {
          res.status(401).send({ status: -2, message: 'Failed to authenticate token.' })
          res.end();
        } else {
          return next();
        }
      });
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },

  addEmailTemplate: function (req, res, next) {


    var ccMail = Object.keys(req.body.cc_email != undefined ? req.body.cc_email : "");
    var bccMail = Object.keys(req.body.bcc_email != undefined ? req.body.bcc_email : "");
    if (Object.keys(req.body).length == 5 || Object.keys(req.body).length <= 10) {
      req.checkBody({
        template_name: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[A-Z a-z]{1,100}$/i,
            errorMessage: 'Invalid template name',
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid template name'
        },
        template_code: {
          notEmpty: true,
          matches: {
            options: /^[A-Z a-z0-9-_]{1,100}$/i,
            errorMessage: 'Invalid template code',
          },
          errorMessage: 'Invalid template code'
        },
        template_subject: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[A-Z a-z]{1,100}$/i,
            errorMessage: 'Invalid template subject',
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid template subject'
        },
        template_message: {
          notEmpty: true,
          errorMessage: 'Invalid template message'
        },

        status: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[0-1]{1}$/,
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid status'
        },
      });

      if (ccMail != "") {
        req.checkBody({
          cc_email: {
            notEmpty: true,
            isEmail: {
              // more than one options must be passed as arrays
              errorMessage: 'Invalid cc email'
            },
            errorMessage: 'Invalid cc email'
          }
        })
      };

      if (bccMail != "") {
        req.checkBody({
          bcc_email: {
            notEmpty: true,
            isEmail: {
              // more than one options must be passed as arrays
              errorMessage: 'Invalid bcc email'
            },
            errorMessage: 'Invalid bcc email'
          }
        })
      };

      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {
        return res.json({ success: false, message: errors });
      } /*else {

              req.sanitize('template_message').trim();
              req.sanitize('template_message').blacklist('template_message','\\@[@\\]');
            }*/
      return next();
      //}
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },

  addFaq: function (req, res, next) {

    if (Object.keys(req.body).length == 4 || Object.keys(req.body).length <= 7) {
      req.checkBody({
        category_id: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[0-9]{1,10}$/,
            errorMessage: 'Invalid category ',
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid category'
        },
        question: {
          notEmpty: true,
          errorMessage: 'Invalid question '
        },
        answer: {
          notEmpty: true,
          errorMessage: 'Invalid answer'
        },
        status: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[0-1]{1}$/,
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid status'
        },
      });


      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {
        return res.json({ success: false, message: errors });
      } else {
        //req.sanitize('question').trim();
        //req.sanitize('question').escape();
        //req.sanitize('answer').trim();
        //req.sanitize('answer').escape();
      }
      return next();
      //}
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },

  addSupportCommentTeam: function (req, res, next) {



    if (Object.keys(req.body).length == 3 || Object.keys(req.body).length <= 8) {
      req.checkBody({
        comment: {
          notEmpty: true,
          errorMessage: 'Invalid comment '
        },
        support_id: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[0-9]{1,10}$/,
            errorMessage: 'Invalid   support id ',
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid  support id'
        },
      });

      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {
        return res.json({ success: false, message: errors });
      } else {
        req.sanitize('comment').trim();
        req.sanitize('comment').escape();
      }
      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },

  saveCurrencyPairs: function (req, res, next) {

    if (Object.keys(req.body).length == 2) {
      req.checkBody({
        currency_from: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[A-Za-z0-9]{1,10}$/,
            errorMessage: 'Invalid currency from ',
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid currency from'
        },
        currency_to: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[A-Za-z0-9]{1,10}$/,
            errorMessage: 'Invalid  currency to ',
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid  currency to'
        }
      });

      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {
        return res.json({ success: false, message: errors });
      }
      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },

  updateDefaultPair: function (req, res, next) {

    if (Object.keys(req.body).length == 1) {
      req.checkBody({
        id: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[0-9]{1,10}$/,
            errorMessage: 'Invalid id ',
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid id'
        }
      });

      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {
        return res.json({ success: false, message: errors });
      }
      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }

  },

  updatePairStatus: function (req, res, next) {

    if (Object.keys(req.body).length == 2) {
      req.checkBody({
        id: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[0-9]{1,10}$/,
            errorMessage: 'Invalid id ',
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid id'
        },
        status: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[0-1]{1}$/,
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid status'
        },
      });

      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {
        return res.json({ success: false, message: errors });
      }
      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }

  },

  updateCommission: function (req, res, next) {

    if (Object.keys(req.body).length == 5) {
      req.checkBody({
        currency_code: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[A-Za-z]{1,50}$/,
            errorMessage: 'Invalid currency code ',
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid currency code'
        },
        operation: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[A-Za-z-_]{1,50}$/,
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid operation'
        },
        column_name: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[A-Za-z-_]{1,100}$/,
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid column  name'
        },
        column_value: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[0-9.]{1,10}$/,
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid  column value'
        },
        old_column_value: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[0-9.]{1,10}$/,
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid old column value'
        },

      });

      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {
        return res.json({ success: false, message: errors });
      }
      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },


  updateCustomerProfile: function (req, res, next) {

    if (Object.keys(req.body).length == 5 || Object.keys(req.body).length <= 15) {
      req.checkBody({
        fullname: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[A-Z a-z]{1,45}$/i,
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid Full Name '
        },
        country: {
          notEmpty: true,
          matches: {

            options: /^[0-9]{1,100}$/,

            // only string may be passed
            // options: /someregex/i
          },
          errorMessage: 'Invalid Country'
        },

        city: {
          notEmpty: true,
          matches: {

            options: /^[0-9]{1,100}$/,
            // only string may be passed
            // options: /someregex/i
          },
          errorMessage: 'Invalid City'
        },
        postal_code: {
          notEmpty: true,
          matches: {
            // more than one options must be passed as arrays
            options: /^[0-9]{1,10}$/,
            // single options may be passed directly
            // options: /someregex/i
          },
          errorMessage: 'Invalid Pincode'
        },

      });


      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {

        return res.json({ success: false, message: errors });
      } else {
        req.sanitize('address').trim();
        req.sanitize('address').escape();
      }

      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },

  approveWithdrawRequest: function (req, res, next) {

    if (Object.keys(req.body).length == 3) {
      req.checkBody({
        id: {
          notEmpty: true,
          matches: {
            options: /^[0-9]{1,10}$/,
          },
          errorMessage: 'Invalid Id'
        },
        status: {
          notEmpty: true,
        },
        comment: {
          notEmpty: true,
        },

      });
      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {
        return res.json({ success: false, message: errors });
      } else {
        req.sanitize('status').trim();
        req.sanitize('status').escape();
        req.sanitize('comment').trim();
        req.sanitize('comment').escape();
      }
      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },

  forgotEmail: function (req, res, next) {

    req.checkBody({
      forgotEmail: {
        notEmpty: true,
        isEmail: {
          // more than one options must be passed as arrays
          errorMessage: 'Invalid email'
        },
        errorMessage: 'Email address is required'
      },
    })
    var errors = module.exports.validationErrorsResponse(req, res);
    if (errors) {
      return res.json({ success: false, message: errors });
    }
    return next();

  },

  resetAdminPassword: function (req, res, next) {

    if (Object.keys(req.body).length == 1 || Object.keys(req.body).length <= 15) {
      req.checkBody({
        password: {
          notEmpty: false,
          matches: {
            //more than one options must be passed as arrays
            options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&#~^()-_+=\/])[A-Za-z\d$@$!%*?&#~^()-_+=\/]{6,}|^\s*$/,
            //single options may be passed directly
            //options: /someregex/i
          },
          errorMessage: 'Password should contain minimum 6 characters, at least one uppercase letter, one lowercase letter, one number and one special character'
        },
        token: {
          notEmpty: true,
          errorMessage: "token is require"
        }
      })
      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {
        return res.json({ success: false, message: errors });
      }
      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }
  },

  documentDataAdmin: function (req, res, next) {
    var fullname = Object.keys(req.body.fullname != undefined ? req.body.fullname : "");
    var expiration_date = Object.keys(req.body.expiration_date != undefined ? req.body.expiration_date : "");
    var res_address = Object.keys(req.body.res_address != undefined ? req.body.res_address : "");

    if (Object.keys(req.body).length == 14 || Object.keys(req.body).length <= 16) {
      if (fullname != "") {
        req.checkBody({
          fullname: {
            notEmpty: true,
            matches: {
              // more than one options must be passed as arrays
              options: /^[ A-Za-z]{1,45}$/i,
              // single options may be passed directly
              // options: /someregex/i
            },
            errorMessage: 'Invalid Full Name '
          },
          mobileNumber: {
            notEmpty: true,
            matches: {
              options: /^[+0-9]{1,15}$/,
              // only string may be passed
              // options: /someregex/i
            },
            errorMessage: 'Invalid Mobile Number'
          },
          date_of_birth: {
            notEmpty: true,
            matches: {
              options: /^\d{4}-\d{2}-\d{2}$/,
              // only string may be passed
              // options: /someregex/i
            },
            errorMessage: 'Invalid Date of Birth'
          },
          birth_place: {
            notEmpty: true,
            matches: {
              options: /^[ A-Za-z,-_]{1,200}$/,
              // only string may be passed
              // options: /someregex/i
            },
            errorMessage: 'Invalid Birth Place'
          },
          gender: {
            notEmpty: true,
            matches: {
              options: /^[A-Za-z]{1,7}$/,
              // only string may be passed
              // options: /someregex/i
            },
            errorMessage: 'Invalid Gender'
          },

        });
      }
      if (expiration_date != "") {
        req.checkBody({
          doc_type: {
            notEmpty: true,
            matches: {
              // more than one options must be passed as arrays
              options: /^[0-9]{1,10}$/i,
              // single options may be passed directly
              // options: /someregex/i
            },
            errorMessage: 'Invalid Doc Type'
          },
          issuing_country: {
            notEmpty: true,
            matches: {
              options: /^[0-9]{1,100}$/,
              // only string may be passed
              // options: /someregex/i
            },
            errorMessage: 'Invalid Country'
          },
          issue_date: {
            notEmpty: true,
            matches: {
              options: /^\d{4}-\d{2}-\d{2}$/,
              // only string may be passed
              // options: /someregex/i
            },
            errorMessage: 'Invalid Issue Date'
          },
          expiration_date: {
            notEmpty: true,
            matches: {
              options: /^\d{4}-\d{2}-\d{2}$/,
              // only string may be passed
              // options: /someregex/i
            },
            errorMessage: 'Invalid Expiration Date'
          },

        })

      }

      if (res_address != "") {

        req.checkBody({
          res_address: {
            notEmpty: true,
            rrorMessage: 'Invalid Doc Type'
          },
          res_country: {
            notEmpty: true,
            matches: {
              options: /^[0-9]{1,100}$/,
              // only string may be passed
              // options: /someregex/i
            },
            errorMessage: 'Invalid Country'
          },
          res_state: {
            notEmpty: true,
            matches: {
              options: /^[0-9]{1,100}$/,
              // only string may be passed
              // options: /someregex/i
            },
            errorMessage: 'Invalid State'
          },

          res_city: {
            notEmpty: true,
            matches: {
              options: /^[0-9]{1,100}$/,
              // only string may be passed
              // options: /someregex/i
            },
            errorMessage: 'Invalid City'
          },
          res_pin_code: {
            notEmpty: true,
            matches: {
              // more than one options must be passed as arrays
              options: /^[0-9]{1,10}$/,
              // single options may be passed directly
              // options: /someregex/i
            },
            errorMessage: 'Invalid Pincode'
          },

        })

      }

      var errors = module.exports.validationErrorsResponse(req, res);
      if (errors) {

        return res.json({ success: false, message: errors });
      } else {
        req.sanitize('address').trim();
        req.sanitize('address').escape();
      }

      return next();
    } else {
      res.json({ success: false, message: "Please send proper parameters" })
    }


  },

  uploadKyc: function (req, res, next) {
    console.log("Object.keys(req.body)Object.keys(req.body)Object.keys(req.body)");
    console.log(Object.keys(req.body));
    return;

    if (Object.keys(req.body).length == 14 || Object.keys(req.body).length <= 16) {
      req.checkBody({})
    }

  },

  validateWithdrawRequest: function (req, res, next) {
    req.checkBody({
      reference_number: {
        notEmpty: true,
        matches: {
          // options:
        },
        errorMessage: 'Invalid reference number.'
      },
      comment: {
        notEmpty: true,
        errorMessage: "Invalid remark"
      }
    })
    var errors = module.exports.validationErrorsResponse(req, res);
    if (errors) {

      return res.json({ success: false, message: errors });
    } else {
      req.sanitize('comment').trim();
      req.sanitize('reference_number').trim();
    }
    return next();
  },
  adminchangePassword: function (req, res, next) {
    console.log(Object.keys(req.body));
    if (Object.keys(req.body).length == 7) {
      req.check('currentPassword', 'Invalid Current Password').notEmpty();
      req.check('newPassword', 'Invalid New Password').notEmpty();
      req.check('device_os', 'Invalid Device OS').notEmpty();
      req.check('device_browser', 'Invalid Device Browser').notEmpty();
      req.check('device_ipAddress', 'Invalid Device ipAddress').notEmpty();
      req.check('device_name', 'Invalid Device Name').notEmpty();
    }
    return next();

  }
}
