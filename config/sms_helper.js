var config = require('./config');
var nodemailer = require('nodemailer');
var mysql = require('mysql');
var con = require('./db');

var request = require('request');

// let transporter = nodemailer.createTransport({
//     host: config.host,
//     port: config.port,
//     secure: config.secure, // secure:true for port 465, secure:false for port 587
//     auth: {
//         user: config.email,
//         pass: config.password
//     }
// });

module.exports = {
    sms_template: function(smsData, req, res) {
        return new Promise(function(resolve, reject) {
            var newData = "";
            var sendSMSData = [];
            let sql = "SELECT * from sms_template where template_code= ?";
            let value = [smsData['sms_template_code']];
            sql = mysql.format(sql, value);
            con.query(sql, function(err, dataValue) {
                if (err) {
                    // console.log("error", error);
                    reject(err);
                } else if (dataValue[0] == null || dataValue[0] == "" || dataValue[0] == undefined) {
                    reject("Template not found")
                } else {
                    newData = dataValue[0].template_message != undefined ? dataValue[0].template_message : "test";
                    for (k in smsData['variables']) {
                        for (j in smsData['variables'][k]) {
                            console.log(j);
                            var valueData = smsData['variables'][k][j];
                            console.log(valueData);
                            newData = newData.replace(j, valueData);
                        }
                    }

                    sendSMSData['message'] = newData;
                    sendSMSData['mobile'] = smsData['mobile'].replace('+', '');
                    var sendSMS = module.exports.send_sms(sendSMSData);
                    sendSMS.then(function(result) {
                        resolve(result);
                    }, function(err) {
                        reject(err);
                    })
                }

            });
        });

    },

    send_sms: function(sendSMSData) {
        var mobile = sendSMSData['mobile'];
        var message = sendSMSData['message'];
        return new Promise(function(resolve, reject) {
            request.post({
                    url: 'https://api.textlocal.in/send/?',
                    form: {
                        apikey: 'WDEl263SMsA-pKqIq93Q6JsNMiEBJrFph6MdXiM7EW',
                        message: message,
                        sender: 'Fuleex Exchange',
                        numbers: mobile
                    }
                },
                function(err, httpResponse, body) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(body);
                    }
                });

        })

    }
};