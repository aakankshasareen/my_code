var connection = require('../../../config/db');
var config = require('../../../config/config');
var nodemailer = require('nodemailer');
var mysql = require('mysql');
var async = require('async');
var common_config = require('../../../config/common_config');

const AWS = require('aws-sdk');
let credentials = new AWS.SharedIniFileCredentials({ profile: 'production' });
AWS.config.credentials = credentials;
AWS.config.update({ region: 'us-east-1' });
var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' });


var transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // secure:true for port 465, secure:false for port 587
    // service: 'gmail',
    auth: {
        user: config.email,
        pass: config.password
    }
});





// exports.sendSignEmail = function(name , email){
//    let template_subject="Login notification"; 
//    let template_message="You have successfully logged in";
//     let mailOptions = {
//         from: common_config.domainName+'<' + config.email + '>', // sender address
//         to: email, // list of receivers
//         subject: template_subject, // Subject line
//         text: '',
//         html: template_message // html body
//     };
//     //console.log(template_message);
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             reject(false);
//         }
//         resolve(true);
//     }); 
// }
// this.sendEmail('login')
exports.sendEmail = function (mailType, name, email, link, amount, currency_code, commission, defaultMsg, IP, Device, Date) {
    console.log(arguments);
    let template_subject, template_message

    return new Promise(function (resolve, reject) {
        let sqlTemplate = mysql.format("Select template_name,template_subject,template_message from email_template where template_code=?", [mailType]);
        // console.log(sqlTemplate);
        connection.query(sqlTemplate, function (err, res) {
            if (err) {
                reject(false);
            } else if (res.length > 0) {
                let c = res[0].template_name;
                console.log("sub", res[0].template_subject)

                template_subject = res[0].template_subject;
                template_message = res[0].template_message;

                template_message = template_message.replaceAll("{name}", " " + name);
                if (typeof (link) != 'undefined') {
                    template_message = template_message.replaceAll("{link}", link);
                }
                if (typeof (amount) != 'undefined') {
                    template_message = template_message.replaceAll("{amount}", amount);
                }
                if (typeof (currency_code) != 'undefined') {
                    template_message = template_message.replaceAll("{currency_code}", currency_code);
                }

                if (typeof (commission) != 'undefined') {
                    template_message = template_message.replaceAll("{commission}", commission);
                }

                if (typeof (IP) != 'undefined') {
                    template_message = template_message.replaceAll("{IP}", IP);
                }
                if (typeof (Device) != 'undefined') {
                    template_message = template_message.replaceAll("{Device}", Device);
                }
                if (typeof (Date) != 'undefined') {
                    template_message = template_message.replaceAll("{Date}", Date);
                }
                template_message = template_message.replaceAll("{host}", config.globalDomain + "/");

            } else {
                template_message = defaultMsg;
                template_subject = mailType;
            }


            let mailOptions = {
                from: common_config.domainName + '<' + config.email + '>', // sender address
                to: email, // list of receivers
                subject: template_subject, // Subject line
                text: '',
                html: template_message // html body
            };
            // console.log(template_message);
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("error at source", error)
                    reject(false);
                    // resolve(true);
                }
                resolve(true);
            });
        });
    });

}
exports.sendTradeEmails = function (mailType, obj, bodyObj) {
    // object format
    // obj.push({ amount: 600, quantity: 16, currency_code: '$', user_id: 6 });
    console.log(arguments);
    let template_subject = "Trade Invoice";
    let template_message = "";
    async.each(obj, function (i, callback) {
        var id = i.customer_id;
        // console.log('id='+id);
        let sqlUser = mysql.format("Select email,fullname,(select template_message from email_template where template_name='tradeInvoice') as template_message from customer where id=?", [id]);
        // console.log(sqlUser);
        connection.query(sqlUser, function (err, result) {
            if (err) {
                console.log(err);
            } else if (result.length > 0) {
                if (typeof (result[0].template_message) != 'object') {
                    template_message = result[0].template_message;
                } else {
                    template_message = "Your Trade Invoice reports <br>Reports details<br> your amount : {amount}   {currency_code}   <br> quantity   {quantity} fee: {commission}";
                }
                // console.log(bodyObj.amount);
                // console.log("quan=="+i.tradeQuan);
                // console.log(i.fee_value);
                let total_amount = (bodyObj.amount * i.tradeQuan) + parseInt(i.fee_value);
                // console.log("total amount="+total_amount);
                template_message = template_message.replaceAll("{name}", result[0].fullname);
                template_message = template_message.replaceAll("{currency_code}", bodyObj.currency_code);
                template_message = template_message.replaceAll("{amount}", total_amount);
                template_message = template_message.replaceAll("{quantity}", i.tradeQuan);
                template_message = template_message.replaceAll("{commission}", i.fee_value);
                template_message = template_message.replaceAll("{domainName}", common_config.domainName);
                template_message = template_message.replaceAll("{host}", config.globalDomain + "/");



                let mailOptions = {
                    from: common_config.domainName + '<' + config.email + '>', // sender address
                    to: result[0].email, // list of receivers
                    subject: template_subject, // Subject line
                    text: '',
                    html: template_message, // html body
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        reject(false);
                        // console.log(error);
                    } else {
                        console.log(info);
                    }
                });
                callback(null);
            } else {
                callback(null);
            }
        });

    });
}


exports.sendEmailSupport = function (mailType, email, issue, subject, description, userEmail, defaultMsg) {
    console.log(arguments);
    let template_subject, template_message;

    return new Promise(function (resolve, reject) {
        let sqlTemplate = mysql.format("Select template_name,template_subject,template_message from email_template where template_code=?", [mailType]);
        // console.log(sqlTemplate);
        connection.query(sqlTemplate, function (err, res) {
            if (err) {
                reject(false);
            } else if (res.length > 0) {
                let c = res[0].template_name;
                //console.log("sub", res[0].template_subject)

                template_subject = res[0].template_subject;
                template_message = res[0].template_message;

                //template_message = template_message.replaceAll("{name}", " " + name);

                if (typeof (email) != 'undefined') {
                    template_message = template_message.replaceAll("{email}", email);
                }
                if (typeof (issue) != 'undefined') {
                    template_message = template_message.replaceAll("{issue}", issue);
                }
                if (typeof (subject) != 'undefined') {
                    template_message = template_message.replaceAll("{subject}", subject);
                }

                if (typeof (description) != 'undefined') {
                    template_message = template_message.replaceAll("{description}", description);
                }
                if (typeof (userEmail) != 'undefined') {
                    template_message = template_message.replaceAll("{userEmail}", userEmail);
                }


            } else {
                template_message = defaultMsg;
                template_subject = mailType;
            }


            let mailOptions = {
                from: common_config.domainName + '<' + config.email + '>', // sender address
                to: email, // list of receivers
                subject: template_subject, // Subject line
                text: '',
                html: template_message // html body
            };
            // console.log(template_message);
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("error :: " + error);
                    reject(false);
                }
                resolve(true);
            });
        });
    });

}

exports.send_email_aws = (mailType, name, email, link, amount, currency_code, commission, defaultMsg, IP, Device, Date) => {
    // console.log(arguments);
    let template_subject, template_message

    return new Promise(function (resolve, reject) {
        let sqlTemplate = mysql.format("Select template_name,template_subject,template_message from email_template where template_code=?", [mailType]);
        // console.log(sqlTemplate);
        connection.query(sqlTemplate, function (err, res) {
            if (err) {
                reject(false);
            } else if (res.length > 0) {
                let c = res[0].template_name;
                console.log("sub", res[0].template_subject)

                template_subject = res[0].template_subject;
                template_message = res[0].template_message;

                template_message = template_message.replaceAll("{name}", " " + name);
                if (typeof (link) != 'undefined') {
                    template_message = template_message.replaceAll("{link}", link);
                }
                if (typeof (amount) != 'undefined') {
                    template_message = template_message.replaceAll("{amount}", amount);
                }
                if (typeof (currency_code) != 'undefined') {
                    template_message = template_message.replaceAll("{currency_code}", currency_code);
                }

                if (typeof (commission) != 'undefined') {
                    template_message = template_message.replaceAll("{commission}", commission);
                }

                if (typeof (IP) != 'undefined') {
                    template_message = template_message.replaceAll("{IP}", IP);
                }
                if (typeof (Device) != 'undefined') {
                    template_message = template_message.replaceAll("{Device}", Device);
                }
                if (typeof (Date) != 'undefined') {
                    template_message = template_message.replaceAll("{Date}", Date);
                }
                template_message = template_message.replaceAll("{host}", config.globalDomain + "/");

            } else {
                template_message = defaultMsg;
                template_subject = mailType;
            }

            let params = {
                Destination: {
                    ToAddresses: [
                        email
                    ]
                },
                Message: { /* required */
                    Body: { /* required */
                        Html: {
                            Charset: "UTF-8",
                            Data: template_message
                        },
                        Text: {
                            Charset: "UTF-8",
                            Data: ""
                        }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: template_subject
                    }
                },
                Source: common_config.domainName + '<' + config.email + '>', /* required */
            };

            sendPromise.sendEmail(params).promise().then((result) => {
                console.log("This is the result", result);
                resolve(true);
            }).catch((error) => {
                console.log("This is the error", error);
                reject(false);
            })

            let mailOptions = {
                from: common_config.domainName + '<' + config.email + '>', // sender address
                to: email, // list of receivers
                subject: template_subject, // Subject line
                text: '',
                html: template_message // html body
            };
            // console.log(template_message);
            // transporter.sendMail(mailOptions, (error, info) => {
            //     if (error) {
            //         console.log("error at source", error)
            //         // reject(false);
            //         resolve(true);
            //     }
            //     resolve(true);
            // });
        });
    });

}

exports.sendTradeEmails_aws = function (mailType, obj, bodyObj) {
    // object format
    // obj.push({ amount: 600, quantity: 16, currency_code: '$', user_id: 6 });
    console.log(arguments);
    let template_subject = "Trade Invoice";
    let template_message = "";
    async.each(obj, function (i, callback) {
        var id = i.customer_id;
        // console.log('id='+id);
        let sqlUser = mysql.format("Select email,fullname,(select template_message from email_template where template_name='tradeInvoice') as template_message from customer where id=?", [id]);
        // console.log(sqlUser);
        connection.query(sqlUser, function (err, result) {
            if (err) {
                console.log(err);
            } else if (result.length > 0) {
                if (typeof (result[0].template_message) != 'object') {
                    template_message = result[0].template_message;
                } else {
                    template_message = "Your Trade Invoice reports <br>Reports details<br> your amount : {amount}   {currency_code}   <br> quantity   {quantity} fee: {commission}";
                }
                // console.log(bodyObj.amount);
                // console.log("quan=="+i.tradeQuan);
                // console.log(i.fee_value);
                let total_amount = (bodyObj.amount * i.tradeQuan) + parseInt(i.fee_value);
                // console.log("total amount="+total_amount);
                template_message = template_message.replaceAll("{name}", result[0].fullname);
                template_message = template_message.replaceAll("{currency_code}", bodyObj.currency_code);
                template_message = template_message.replaceAll("{amount}", total_amount);
                template_message = template_message.replaceAll("{quantity}", i.tradeQuan);
                template_message = template_message.replaceAll("{commission}", i.fee_value);
                template_message = template_message.replaceAll("{domainName}", common_config.domainName);
                template_message = template_message.replaceAll("{host}", config.globalDomain + "/");

                let params = {
                    Destination: {
                        ToAddresses: [ result[0].email ]
                    },
                    Message: { /* required */
                        Body: { /* required */
                            Html: {
                                Charset: "UTF-8",
                                Data: template_message
                            },
                            Text: {
                                Charset: "UTF-8",
                                Data: ""
                            }
                        },
                        Subject: {
                            Charset: 'UTF-8',
                            Data: template_subject
                        }
                    },
                    Source: common_config.domainName + '<' + config.email + '>', /* required */
                };


                sendPromise.sendEmail(params).promise().then((result) => {
                    console.log("This is the result", result);
                    // resolve(true);
                }).catch((error) => {
                    console.log("This is the error", error);
                    reject(false);
                })


                // let mailOptions = {
                //     from: common_config.domainName + '<' + config.email + '>', // sender address
                //     to: result[0].email, // list of receivers
                //     subject: template_subject, // Subject line
                //     text: '',
                //     html: template_message, // html body
                // };

                // transporter.sendMail(mailOptions, (error, info) => {
                //     if (error) {
                //         reject(false);
                //         // console.log(error);
                //     } else {
                //         console.log(info);
                //     }
                // });

                callback(null);
            } else {
                callback(null);
            }
        });

    });
}

exports.sendEmailSupport_aws = function (mailType, email, issue, subject, description, userEmail, defaultMsg) {
    console.log(arguments);
    let template_subject, template_message;

    return new Promise(function (resolve, reject) {
        let sqlTemplate = mysql.format("Select template_name,template_subject,template_message from email_template where template_code=?", [mailType]);
        // console.log(sqlTemplate);
        connection.query(sqlTemplate, function (err, res) {
            if (err) {
                reject(false);
            } else if (res.length > 0) {
                let c = res[0].template_name;
                //console.log("sub", res[0].template_subject)

                template_subject = res[0].template_subject;
                template_message = res[0].template_message;

                //template_message = template_message.replaceAll("{name}", " " + name);

                if (typeof (email) != 'undefined') {
                    template_message = template_message.replaceAll("{email}", email);
                }
                if (typeof (issue) != 'undefined') {
                    template_message = template_message.replaceAll("{issue}", issue);
                }
                if (typeof (subject) != 'undefined') {
                    template_message = template_message.replaceAll("{subject}", subject);
                }

                if (typeof (description) != 'undefined') {
                    template_message = template_message.replaceAll("{description}", description);
                }
                if (typeof (userEmail) != 'undefined') {
                    template_message = template_message.replaceAll("{userEmail}", userEmail);
                }


            } else {
                template_message = defaultMsg;
                template_subject = mailType;
            }


            let params = {
                Destination: {
                    ToAddresses: [ email ]
                },
                Message: { /* required */
                    Body: { /* required */
                        Html: {
                            Charset: "UTF-8",
                            Data: template_message
                        },
                        Text: {
                            Charset: "UTF-8",
                            Data: ""
                        }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: template_subject
                    }
                },
                Source: common_config.domainName + '<' + config.email + '>', /* required */
            };


            sendPromise.sendEmail(params).promise().then((result) => {
                console.log("This is the result", result);
                resolve(true);
            }).catch((error) => {
                console.log("This is the error", error);
                reject(false);
            })


            // let mailOptions = {
            //     from: common_config.domainName + '<' + config.email + '>', // sender address
            //     to: email, // list of receivers
            //     subject: template_subject, // Subject line
            //     text: '',
            //     html: template_message // html body
            // };
            // // console.log(template_message);
            // transporter.sendMail(mailOptions, (error, info) => {
            //     if (error) {
            //         console.log("error :: " + error);
            //         reject(false);
            //     }
            //     resolve(true);
            // });
        });
    });

}

String.prototype.replaceAll = function (str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
}
