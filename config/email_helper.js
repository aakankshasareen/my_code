var config = require('./config');
var common_config = require('./common_config')
// var mail = require('../../../config/email')
var nodemailer = require('nodemailer');
var mysql = require('mysql');
var con = require('./db');

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
    mail_template: function (tempcode, to, data, req, res) {
        return new Promise(function (resolve, reject) {
            var newData = "";
            let sql = "SELECT * from email_template where template_code= ?";
            let value = [tempcode];
            sql = mysql.format(sql, value);
            con.query(sql, function (err, dataValue) {
                if (err) {
                    reject(error);
                } else if (dataValue[0] == null || dataValue[0] == "" || dataValue[0] == undefined) {
                    reject('Template Not Found');
                } else {
                    newData = dataValue[0].template_message != undefined ? dataValue[0].template_message : "test";
                    data.forEach(function (value) {
                        for (key in value) {
                            var keyData = key;
                            var valueData = value[key];
                            console.log(keyData);
                            newData = newData.replace(keyData, valueData);
                        }
                    });

                    var sendMail = mail_helper(newData, to, dataValue[0].template_subject, res, req);
                    sendMail.then(function (result) {
                        resolve(result);
                    }, function (error) {
                        reject(error)
                    });
                }
            });
        }).catch(function (error) {
            console.log("Caught Exception " + error);
        });
    }
};

function mail_helper(html, to, subject, res, req) {


    let mailOptions = {
        from:common_config.domainName + '<' + config.email + '>', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: '',
        html: html
    }
    return new Promise(function (resolve, reject) {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            } else {
                resolve("Mail Sent Successfully.");
            }
        })
    }).catch(function (error) {
        console.log("Caught Exception " + error);
    })
}