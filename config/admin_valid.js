const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

module.exports = {

    addFaq: function(req, res, next) {
        if (Object.keys(req.body).length == 4 ) {
            req.check('category_id', 'Invalid Category Name').notEmpty().isNumeric();
            req.check('question', 'Invalid Question').notEmpty();
            req.check('answer', 'Invalid Answer').notEmpty();
            req.check('status', 'Invalid status').notEmpty();            
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

    addEmailTemplate:function(req, res, next){
        if(Object.keys(req.body).length==5){
            req.check('template_name','Invalid Category Name').notEmpty();
            req.check('template_code', 'Invalid Template Code').notEmpty();
            req.check('template_subject','Invalid Template Subject').notEmpty();
            req.check('template_message','Invalid Template Message').notEmpty();
            req.check('status','Invalid Template Message').notEmpty();
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
        } else{
            res.json({ success: false, message: "Please send proper parameters" });
        }
    },

    addSupportData:function(req, res, next){
       
        if(Object.keys(req.body).length==4|| Object.keys(req.body).length==3){
            req.checkBody({
            issue: {
                notEmpty: true,
                
                errorMessage: 'Invalid Issue Name'
                },
            email: {
                notEmpty: true,
                isEmail: {
                errorMessage: 'Invalid email'
                },
                errorMessage: 'Email address is required'
                },
            subject: {
                notEmpty: true,
                matches: {
                  options: /^[a-zA-Z0-9 ]{1,1000}$/,                    
                 },
                errorMessage: 'Invalid Subject'
                },
            desc: {
                notEmpty: true,
                // matches: {
                //   options: /^[a-zA-Z0-9 ]{1,2000}$/,                    
                //  },
                errorMessage: 'Invalid Description'
            },

            // query: {
            //     notEmpty: true,
            //     matches: {
            //       options: /^[a-zA-Z0-9 ]{1,200}$/,                    
            //      },
            //     // matches: {
            //     // options: /^[0-9][1-4]$/,
            //     // // only string may be passed 
            //     // // options: /someregex/i
            //     // },
            //     errorMessage: 'Invalid Query'
            // },

        });
           var errors=req.validationErrors();
           if (errors) {
           return res.json({success: false, message: errors});
        }else { 
        }
        return next();
    } else {
        res.json({success: false, message: "Please send proper parameters"})
    }
},

showSupportData:function(req, res, next){
    
     if(Object.keys(req.body).length==3|| Object.keys(req.body).length==2){
         req.checkBody({
         email: {
             notEmpty: true,
             isEmail: {
             errorMessage: 'Invalid email'
             },
             errorMessage: 'Email address is required'
             },
         subject: {
             notEmpty: true,
             matches: {
               options: /^[a-zA-Z0-9 ]{1,1000}$/,                    
              },
             errorMessage: 'Invalid Subject'
             },
         desc: {
             notEmpty: true,
             // matches: {
             //   options: /^[a-zA-Z0-9 ]{1,2000}$/,                    
             //  },
             errorMessage: 'Invalid Description'
         },

     });
        var errors=req.validationErrors();
        if (errors) {
        return res.json({success: false, message: errors});
     }else { 
     }
     return next();
 } else {
     res.json({success: false, message: "Please send proper parameters"})
 }
},
    
addSupportComment:function(req, res, next){
  
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

       var errors=req.validationErrors();
            if (errors) {
                return res.json({success: false, message: errors});
            }  else {
              req.sanitize('comment').trim();
              req.sanitize('comment').escape();
            }
            return next();
      } else {
      res.json({success: false, message: "Please send proper parameters"})
    }
},

repplySupport: function(req, res, next) {
    if (Object.keys(req.body).length == 3) {
       
        req.check('limit', 'Invalid Limit').notEmpty().isNumeric();
        req.check('offset', 'Invalid Offset').notEmpty().isNumeric();
      
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

}

