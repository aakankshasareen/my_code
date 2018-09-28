var config = require('./config');
var nodemailer = require('nodemailer');
 let transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // secure:true for port 465, secure:false for port 587
    auth: {
        user: config.email,
        pass: config.password
    }
});
 
  module.exports = {
      mail: function(html,email,subject,currency_code,res,req) {
 //res.render('final', { amount: amount, commission: commission,total:total,currency_code:currency_code }, function(err, html) {
              // if (err) {
              //     console.log('error rendering email template:', err)
              //     return
              // } else {

              let mailOptions = {
                  from: 'Fuleex Exchange<' + config.email + '>', // sender address
                  to: email, // list of receivers
                  subject:subject, // Subject line
                  text: '',
                  html: html
              }


              transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                      console.log("jkjkj", error);
                  } else {
                      //console.log('Message %s sent: %s', info.messageId, info.response);
                      // console.log(response);

                      console.log("Mail succesfully sent!")
                  }

              //});
          })
      }
  }