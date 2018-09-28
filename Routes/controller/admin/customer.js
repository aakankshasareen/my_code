var config = require('../../../config/config');
var connection = require('../../../config/db');
var sms_helper = require('../../../config/sms_helper');
var email_helper = require('../../../config/email_helper');
var request = require('request')
var path = require('path')
var multer = require('multer')
var fs = require('file-system');
var mail = require('../../../config/email')
var bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
var salt = bcrypt.genSaltSync(10);
var moment = require('moment');
var async = require('async');
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var socketio = require('../../../socket.js').io();
var commonHelper = require('../../helper/common_helper');
const QRCode = require('qrcode');
var cm_helper = require('./common_helper');
var cm_cfg = require('../../../config/common_config');


var date = new Date();

var created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");

exports.getAllCustomerList = function(req, res) {

    var limit = req.body.limit;

    var offset = req.body.offset == null ? 0 : req.body.offset;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var exportAs = req.body.exportAs;

    var fullname = req.body.fullname;
    var email = req.body.email;
    var mobileNumber = req.body.mobileNumber;
    var kyc_status = req.body.kyc_status;
    var bank_status = req.body.bank_status;
    var status = req.body.status;

    var searchQuery = '';
    var LIMIT = '';
    var searchStatus = ' AND cu.status != 2 ';

    if (typeof fullname !== 'undefined' && fullname) {
        searchQuery += " AND cu.fullname LIKE " + mysql.escape('%' + fullname + '%') + " ";
    }
    if (typeof email !== '' && email) {
        searchQuery += " AND u.email LIKE " + mysql.escape('%' + email + '%') + " ";
    }
    if (typeof mobileNumber !== 'undefined' && mobileNumber) {
        searchQuery += " AND cu.mobileNumber LIKE " + mysql.escape('%' + mobileNumber + '%') + " ";
    }
    if (typeof status !== 'undefined' && status !== null) {
        searchQuery += " AND cu.status = " + mysql.escape(status);
        searchStatus = '';
    }
    if (typeof kyc_status !== 'undefined' && kyc_status !== null) {
        searchQuery += " AND cu.kyc_status = " + mysql.escape(kyc_status);
    }
    if (typeof bank_status !== 'undefined' && bank_status !== null && bank_status === 2) {
        searchQuery += " AND bank.status = " + mysql.escape(bank_status);
    }

    searchQuery += searchStatus;
    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = "LIMIT " + mysql.escape(offset) + ", " + mysql.escape(limit);
    }

    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY u.id DESC";
    }

    var query = connection.query("SELECT @count:=@count+1 AS serial_number, Y.*  FROM  ( SELECT * FROM ( SELECT cu.fullname, u.email,cu.status, cu.created_at, cu.kyc_status,cu.mobileNumber,cu.id, IF(bank.status, bank.status, 3) as bank_status FROM user u LEFT JOIN customer cu ON u.type_id = cu.id LEFT JOIN bank_details as bank on bank.user_id=u.id WHERE u.user_type = 'C' " + searchQuery + ") AS t, (SELECT @count:=" + offset + ") AS X ) AS Y " + LIMIT, function(error, data) {
        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else {
            console.log("data 1", data.length);
            if(bank_status === 3){
                data = data.filter(x => x.bank_status === 3);
            }
            console.log("data 2", data.length);
            console.log('sql is ...........',bank_status, query.sql);
            var q1 = connection.query("SELECT count(*) as count  FROM user u LEFT JOIN customer cu ON u.type_id = cu.id  WHERE u.user_type = 'C' " + searchQuery, function(error, data1) {
                var result = { 'totalRecords': data1, 'records': data };
                res.json({ "success": true, "message": "Customer List", result });
            });
        }
    })
}

exports.editCustomerProfile = function(req, res) {
    var customer_id = req.params.customer_id;
    connection.query("SELECT c.mobileNumber,c.date_of_birth,c.birth_place,c.gender,c.kyc_status,c.kyc_status_comment, c.fullname,c.country,c.city,c.postal_code,c.address,cd.filename1,CONCAT('uploads/',cd.customer_id,'/',filename1)as document_path FROM customer c LEFT JOIN customer_document cd on cd.customer_id=c.id AND cd.doc_type=3 where c.id= ?", [customer_id], function(error, sqldata) {

        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (sqldata[0] == null || sqldata[0] == undefined) {
            res.json({ success: false, message: "Data not found" })
        } else {
            res.json({ success: true, message: "Profile info", data: sqldata[0] })
        }
    });
}

exports.updateCustomerProfile = function(req, res) {

    var id = req.params.customer_id;
    var updateData = {
        'fullname': req.body.fullname,
        'country': req.body.country,
        'address': req.body.address,
        'city': req.body.city,
        'postal_code': req.body.postal_code,
    }

    connection.query("UPDATE customer SET ? WHERE id = ?", [updateData, id], function(error, result) {
        if (error) {
            res.json({ success: false, message: "error", error });
        } else {
            res.json({ success: true, message: "Customer Profile Updated Successfully", result });
        }
    });
}


function changestatus(custoId) {
    return new Promise(function(resolve, reject) {

        let addressstatus_sql = "Select kaddress_status from customer_address where customer_id='" + custoId + "' and doc_type=5"
        connection.query(addressstatus_sql, function(error, adddata) {
            if (error) {
                console.log(error)
                reject(error)
            } else {
                console.log("adddata", adddata)
                let docstatus_sql = "Select id_status from customer_document where customer_id='" + custoId + "' and doc_type=1"
                connection.query(docstatus_sql, function(error, docdata) {
                    if (error) {
                        console.log(error)
                        reject(error)
                    } else {
                        console.log("doc", docdata)
                        let personalstatus_sql = "Select kpersonal_status from customer where id='" + custoId + "'"
                        connection.query(personalstatus_sql, function(error, parsonaldata) {
                            if (error) {
                                console.log(error)
                                reject(error)
                            } else {
                                console.log("per", parsonaldata)
                                if (adddata[0] == null || adddata[0] == undefined || docdata[0] == null || docdata[0] == undefined || adddata[0].kaddress_status == 0 || docdata[0].id_status == 0 || parsonaldata[0].kpersonal_status == 0) {
                                    //console.log("something is empty ")
                                    resolve("something is empty")
                                } else if (adddata[0].kaddress_status == 1 && docdata[0].id_status == 1 && parsonaldata[0].kpersonal_status == 1) {
                                    // console.log("status going to be change")
                                    let updatestatus_sql = "UPDATE customer SET kyc_status ='1' WHERE id = '" + custoId + "'";
                                    connection.query(updatestatus_sql, function(error, dta) {
                                        if (error) {
                                            console.log(error)
                                            reject(error)
                                        } else {

                                            resolve("status going to be change")
                                        }
                                    })

                                } else {
                                    //console.log("nothing to change in the status")
                                    resolve("nothing to change in the status")
                                }
                            }
                        })
                    }
                })
            }
        })
    })
}

//exports.documentDataAdmin = function (req, res) {}

exports.documentDataAdmin = function(req, res) {

    var customer_id = req.params.customer_id;
    console.log('cc' + customer_id);
    let sq = mysql.format('SELECT * FROM customer_document WHERE customer_id =? and doc_type=?', [customer_id, req.body.doc_type]);

    connection.query(sq, [customer_id, req.body.doc_type], function(error, docdata) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (docdata[0] == null || docdata[0] == undefined) {
            if (req.body.doc_type == 1) {
                // console.log(req.body.expiration_date)
                if (req.body.expiration_date == '' || req.body.expiration_date == 'null') {

                    var insertData = {
                        "customer_id": customer_id,
                        "doc_type": req.body.doc_type,
                        "doc_name": req.body.doc_name,
                        "doc_reference": req.body.doc_reference,
                        "issue_date": req.body.issue_date,
                        "expiration_date": null,
                        "issuing_country": req.body.issuing_country,
                        "created_at": created_at,
                        "id_status": 1,
                        "f_b_type": 1
                    }

                    let sql1 = mysql.format("INSERT INTO customer_document SET ?", insertData)
                    console.log(sql1)

                    //let sql1 = "INSERT INTO customer_document (customer_id,doc_type,doc_name,doc_reference,issue_date,expiration_date,issuing_country,created_at,id_status,f_b_type) values ('" + customer_id + "','" + req.body.doc_type + "','" + req.body.doc_name + "','" + req.body.doc_reference + "','" + req.body.issue_date + "',null,'" + req.body.issuing_country + "','" + created_at + "',1,1);"
                    //console.log(sql1)
                    connection.query(sql1, function(error, dta) {
                        if (error) {
                            console.log(error)
                            res.json({ success: false, message: "Error" });
                        } else {
                            changestatus(customer_id).then(function(status) {
                                res.json({ success: true, message: "Successfully save id proof details" })
                            }, function(error) {
                                console.log(error)
                                res.json({ success: false, message: "Error", error: error });
                            })
                        }
                    })
                } else {
                    var insertData = {
                        "customer_id": customer_id,
                        "doc_type": req.body.doc_type,
                        "doc_name": req.body.doc_name,
                        "doc_reference": req.body.doc_reference,
                        "issue_date": req.body.issue_date,
                        "expiration_date": req.body.expiration_date,
                        "issuing_country": req.body.issuing_country,
                        "created_at": created_at,
                        "id_status": 1,
                        "f_b_type": 1
                    }

                    let sql1 = mysql.format("INSERT INTO customer_document SET ?", insertData)

                    // let sql1 = "INSERT INTO customer_document (customer_id,doc_type,doc_name,doc_reference,issue_date,expiration_date,issuing_country,created_at,id_status,f_b_type) values ('" + customer_id + "','" + req.body.doc_type + "','" + req.body.doc_name + "','" + req.body.doc_reference + "','" + req.body.issue_date + "','" + req.body.expiration_date + "','" + req.body.issuing_country + "','" + created_at + "',1,1);"
                    //console.log(sql1)
                    connection.query(sql1, function(error, dta) {
                        if (error) {
                            res.json({ success: false, message: "Error", error: error });
                        } else {
                            changestatus(customer_id).then(function(status) {
                                res.json({ success: true, message: "Successfully save id proof details" })
                            }, function(error) {
                                console.log(req.body.expiration_date)
                                res.json({ success: false, message: "Error", error: error });
                            })
                        }
                    })

                }
            } else if (req.body.doc_type == 3) {

                var insertData = {
                    "customer_id": customer_id,
                    "doc_type": req.body.doc_type,
                    "doc_name": 'photo',
                    "created_at": created_at,
                    "f_b_type": 1
                }


                let sql1 = mysql.format("INSERT INTO customer_document SET ?", insertData)

                //let sql1 = "INSERT INTO customer_document (customer_id,doc_type,doc_name,created_at) values ('" + customer_id + "','" + req.body.doc_type + "','photo','" + created_at + "');"
                //console.log(sql1)
                connection.query(sql1, function(error, dta) {
                    if (error) {
                        res.json({ success: false, message: "Error", error: error });
                    } else {

                        var updateData = {
                            "fullname": req.body.fullname,
                            "gender": req.body.gender,
                            "date_of_birth": req.body.date_of_birth,
                            "birth_place": req.body.birth_place,
                            "country_code": req.body.country_code,
                            "kpersonal_status": 1
                        }
                        let sql2 = mysql.format('UPDATE customer SET ? WHERE id = ?', [updateData, customer_id])

                        //let sql2 = "UPDATE customer SET fullname='" + req.body.fullname + "', gender ='" + req.body.gender + "',date_of_birth='" + req.body.date_of_birth + "',birth_place='" + req.body.birth_place + "',country_code ='" + req.body.country_code + "',kpersonal_status=1 WHERE id = '" + customer_id + "'";
                        connection.query(sql2, function(error, dta) {
                            if (error) {
                                res.json({ success: false, message: "Error", error: error });
                            } else {
                                changestatus(customer_id).then(function(status) {
                                    res.json({ success: true, message: "Successfully save personal info details" })
                                }, function(error) {
                                    res.json({ success: false, message: "Error", error: error });
                                })

                            }
                        })
                    }
                })

            } else if (req.body.doc_type == 2) {

                var insertData = {
                    "customer_id": customer_id,
                    "doc_type": req.body.doc_type,
                    "doc_name": req.body.doc_name,
                    "created_at": created_at,
                    "f_b_type": 1
                }


                let sql1 = mysql.format("INSERT INTO customer_document SET ?", insertData)


                //let sql1 = "INSERT INTO customer_document (customer_id,doc_type,doc_name,created_at) values ('" + customer_id + "','" + req.body.doc_type + "','" + req.body.doc_name + "','" + created_at + "');"
                //console.log(sql1)
                connection.query(sql1, function(error, dta) {
                    if (error) {
                        res.json({ success: false, message: "Error", error: error });
                    } else {
                        //console.log(req.body.city)
                        //console.log(typeof(req.body.city))

                        var city = ((req.body.city == '' || req.body.city == 'null') ? null : req.body.city)
                        var state = ((req.body.state == '' || req.body.state == 'null') ? null : req.body.state)
                        var country = ((req.body.country == '' || req.body.country == 'null') ? null : req.body.country)


                        var addrData = {

                            "customer_id": customer_id,
                            "address": req.body.address,
                            "pin_code": req.body.pin_code,
                            "city": city,
                            "state": state,
                            "country": country,
                            "type": 1,
                            "doc_type": req.body.doc_type,
                            "created_at": created_at

                        }



                        let sql2 = mysql.format("INSERT INTO customer_address SET ?", addrData)


                        //let sql2 = "INSERT INTO customer_address (customer_id,address,pin_code,city,state,country,type,doc_type,created_at) values ('" + customer_id + "','" + req.body.address + "','" + req.body.pin_code + "','" + req.body.city + "','" + req.body.state + "','" + req.body.country + "','1','" + req.body.doc_type + "','" + created_at + "');"

                        connection.query(sql2, function(error, dta) {
                            if (error) {
                                res.json({ success: false, message: "Error", error: error });
                            } else {
                                changestatus(customer_id).then(function(status) {
                                    res.json({ success: true, message: "Successfully save  Permanent address proof details" })
                                }, function(error) {
                                    res.json({ success: false, message: "Error", error: error });
                                })

                            }
                        })
                    }
                })
            } else if (req.body.doc_type == 5) {
                console.log('doc 5');
                var insertData = {
                    "customer_id": customer_id,
                    "doc_type": req.body.doc_type,
                    "doc_name": req.body.doc_name,
                    "created_at": created_at,
                    "f_b_type": 1
                }
                console.log(insertData);

                let sql1 = mysql.format("INSERT INTO customer_document SET ?", insertData)

                // let sql1 = "INSERT INTO customer_document (customer_id,doc_type,doc_name,created_at) values ('" + customer_id + "','" + req.body.doc_type + "','" + req.body.doc_name + "','" + created_at + "');"
                //console.log(sql1)
                connection.query(sql1, function(error, dta) {
                    if (error) {
                        res.json({ success: false, message: "Error", error: error });
                    } else {

                        var addrData = {

                            "customer_id": customer_id,
                            "address": req.body.res_address,
                            "pin_code": req.body.res_pin_code,
                            "city": req.body.res_city,
                            "state": req.body.res_state,
                            "country": req.body.res_country,
                            "type": 2,
                            "doc_type": req.body.doc_type,
                            "created_at": created_at,
                            "kaddress_status": 1

                        }



                        let sql3 = mysql.format("INSERT INTO customer_address SET ?", addrData)


                        //let sql3 = "INSERT INTO customer_address (customer_id,address,pin_code,city,state,country,type,doc_type,created_at,kaddress_status) values ('" + customer_id + "','" + req.body.res_address + "','" + req.body.res_pin_code + "','" + req.body.res_city + "','" + req.body.res_state + "','" + req.body.res_country + "','2','" + req.body.doc_type + "','" + created_at + "',1);"

                        connection.query(sql3, function(error, dta) {
                            if (error) {
                                res.json({ success: false, message: "Error", error: error });
                            } else {
                                changestatus(customer_id).then(function(status) {
                                    res.json({ success: true, message: "Successfully save Residential address proof details" })
                                }, function(error) {
                                    res.json({ success: false, message: "Error", error: error });
                                })


                            }
                        })
                    }
                })
            } else {
                res.json({ success: false, message: "Cannot upload document" });
            }
        } else {
            //console.log({ success: false, message: "already save" })

            if (req.body.doc_type == 1) {
                // console.log(req.body.expiration_date)
                if (req.body.expiration_date == '' || req.body.expiration_date == 'null') {

                    updatedData = {
                        "doc_name": req.body.doc_name,
                        "doc_reference": req.body.doc_reference,
                        "issue_date": req.body.issue_date,
                        "expiration_date": null,
                        "issuing_country": req.body.issuing_country
                    }


                    let sql1 = mysql.format('UPDATE customer_document SET ? where customer_id=? and doc_type=?', [updatedData, customer_id, req.body.doc_type])


                    //let sql1 = "UPDATE customer_document SET doc_name='" + req.body.doc_name + "',doc_reference='" + req.body.doc_reference + "',issue_date='" + req.body.issue_date + "',expiration_date=null,issuing_country='" + req.body.issuing_country + "'where customer_id='" + customer_id + "' and doc_type='" + req.body.doc_type + "'";
                    //console.log(sql1)
                    connection.query(sql1, function(error, dta) {
                        if (error) {
                            res.json({ success: false, message: "Error", error: error });
                        } else {
                            console.log(dta.changedRows)
                            if (dta.changedRows !== 0) {

                                changestatus(customer_id).then(function(status) {
                                    res.json({ success: true, message: "Successfully updated id proof details" })
                                }, function(error) {
                                    res.json({ success: false, message: "Error", error: error });
                                })

                            } else {
                                res.json({ success: true, message: "Successfully updated id proof details" })
                            }
                        }
                    })
                } else {
                    updatedData = {
                        "doc_name": req.body.doc_name,
                        "doc_reference": req.body.doc_reference,
                        "issue_date": req.body.issue_date,
                        "expiration_date": req.body.expiration_date,
                        "issuing_country": req.body.issuing_country
                    }


                    let sql1 = mysql.format('UPDATE customer_document SET ? where customer_id=? and doc_type=?', [updatedData, customer_id, req.body.doc_type])


                    //let sql1 = "UPDATE customer_document SET doc_name='" + req.body.doc_name + "',doc_reference='" + req.body.doc_reference + "',issue_date='" + req.body.issue_date + "',expiration_date='" + req.body.expiration_date + "',issuing_country='" + req.body.issuing_country + "'where customer_id='" + customer_id + "' and doc_type='" + req.body.doc_type + "'";
                    //console.log(sql1)
                    connection.query(sql1, function(error, dta) {
                        if (error) {
                            res.json({ success: false, message: "Error", error: error });
                        } else {
                            console.log(dta.changedRows)
                            if (dta.changedRows !== 0) {

                                changestatus(customer_id).then(function(status) {
                                    res.json({ success: true, message: "Successfully updated id proof details" })
                                }, function(error) {
                                    res.json({ success: false, message: "Error", error: error });
                                })

                            } else {
                                res.json({ success: true, message: "Successfully updated id proof details" })
                            }
                        }
                    })
                }
            } else if (req.body.doc_type == 3) {


                let sql1 = mysql.format("UPDATE customer_document SET doc_name='photo' where customer_id=? and doc_type=?", [customer_id, req.body.doc_type]);
                //console.log(sql1)
                connection.query(sql1, function(error, dta) {
                    if (error) {
                        res.json({ success: false, message: "Error", error: error });
                    } else {

                        var updateData = {
                            "fullname": req.body.fullname,
                            "gender": req.body.gender,
                            "date_of_birth": req.body.date_of_birth,
                            "birth_place": req.body.birth_place,
                            "country_code": req.body.country_code,

                        }
                        let sql2 = mysql.format('UPDATE customer SET ? WHERE id = ?', [updateData, customer_id])


                        //let sql2 = "UPDATE customer SET fullname='" + req.body.fullname + "',gender ='" + req.body.gender + "',date_of_birth='" + req.body.date_of_birth + "',birth_place='" + req.body.birth_place + "',country_code ='" + req.body.country_code + "' WHERE id = '" + customer_id + "'";
                        connection.query(sql2, function(error, dta) {
                            if (error) {
                                res.json({ success: false, message: "Error", error: error });
                            } else {
                                if (dta.changedRows !== 0) {

                                    changestatus(customer_id).then(function(status) {
                                        res.json({ success: true, message: "Successfully updated personal info details" })
                                    }, function(error) {
                                        res.json({ success: false, message: "Error", error: error });
                                    })

                                } else {


                                    res.json({ success: true, message: "Successfully updated personal info details" })
                                }
                            }
                        })
                    }
                })

            } else if (req.body.doc_type == 2) {



                let sql1 = mysql.format('UPDATE customer_document SET doc_name=? where customer_id=? and doc_type=?', [req.body.doc_name, customer_id, req.body.doc_type]);
                //console.log(sql1)
                connection.query(sql1, function(error, dta) {
                    if (error) {
                        res.json({ success: false, message: "Error", error: error });
                    } else {


                        let address_sql = mysql.format('Select* from customer_address where type=1 and customer_id=?', [customer_id]);
                        connection.query(address_sql, function(error, addressdta) {
                            if (error) {
                                res.json({ success: false, message: "Error", error: error });
                            } else if (addressdta[0] == null || addressdta == undefined) {

                                //console.log(req.body.city)
                                //console.log(typeof(req.body.city))

                                var city = ((req.body.city == '' || req.body.city == 'null') ? null : req.body.city)
                                var state = ((req.body.state == '' || req.body.state == 'null') ? null : req.body.state)
                                var country = ((req.body.country == '' || req.body.country == 'null') ? null : req.body.country)

                                var addrData = {

                                    "customer_id": customer_id,
                                    "address": req.body.address,
                                    "pin_code": req.body.pin_code,
                                    "city": city,
                                    "state": state,
                                    "country": country,
                                    "type": 1,
                                    "doc_type": req.body.doc_type,
                                    "created_at": created_at

                                }



                                let sql2 = mysql.format("INSERT customer_address SET ?", addrData)


                                //let sql2 = "INSERT INTO customer_address (customer_id,address,pin_code,city,state,country,type,doc_type,created_at) values ('" + customer_id + "','" + req.body.address + "','" + req.body.pin_code + "','" + req.body.city + "','" + req.body.state + "','" + req.body.country + "','1','" + req.body.doc_type + "','" + created_at + "');"

                                connection.query(sql2, function(error, dta) {
                                    if (error) {
                                        res.json({ success: false, message: "Error", error: error });
                                    } else {

                                        changestatus(customer_id).then(function(status) {
                                            res.json({ success: true, message: "Successfully updated  Permanent address proof details" })
                                        }, function(error) {
                                            res.json({ success: false, message: "Error", error: error });
                                        })


                                    }
                                })
                            } else {

                                //console.log(req.body.city)
                                // console.log(typeof(req.body.city))

                                var city = ((req.body.city == '' || req.body.city == 'null') ? null : req.body.city)
                                var state = ((req.body.state == '' || req.body.state == 'null') ? null : req.body.state)
                                var country = ((req.body.country == '' || req.body.country == 'null') ? null : req.body.country)

                                var upData = {

                                    "address": req.body.address,
                                    "pin_code": req.body.pin_code,
                                    "city": city,
                                    "state": state,
                                    "country": country,
                                    "type": 1,
                                    "doc_type": req.body.doc_type,
                                    "created_at": created_at

                                }


                                let sql2 = mysql.format("UPDATE customer_address SET ? where type=1 and customer_id=?", [upData, customer_id])



                                //let sql2 = "UPDATE customer_address SET address='" + req.body.address + "',pin_code='" + req.body.pin_code + "',city='" + req.body.city + "',state='" + req.body.state + "',country='" + req.body.country + "'where type=1 and customer_id='" + customer_id + "';"

                                connection.query(sql2, function(error, dta) {
                                    if (error) {
                                        res.json({ success: false, message: "Error", error: error });
                                    } else {

                                        if (dta.changedRows !== 0) {

                                            changestatus(customer_id).then(function(status) {
                                                res.json({ success: true, message: "Successfully updated  Permanent address proof details" })
                                            }, function(error) {
                                                res.json({ success: false, message: "Error", error: error });
                                            })

                                        } else {


                                            res.json({ success: true, message: "Successfully updated  Permanent address proof details" })
                                        }
                                    }
                                })
                            }
                        })
                    }
                })
            } else if (req.body.doc_type == 5) {

                let sql1 = mysql.format('UPDATE customer_document SET doc_name=? where customer_id=? and doc_type=?', [req.body.doc_name, customer_id, req.body.doc_type]);
                //console.log(sql1)
                connection.query(sql1, function(error, dta) {
                    if (error) {
                        res.json({ success: false, message: "Error", error: error });
                    } else {
                        let resaddress_sql = mysql.format("Select* from customer_address where type=2 and customer_id=?", [customer_id]);
                        connection.query(resaddress_sql, function(error, addressdta) {
                            if (error) {
                                res.json({ success: false, message: "Error", error: error });
                            } else if (addressdta[0] == null || addressdta == undefined) {

                                var addrData = {
                                    "customer_id": customer_id,
                                    "address": req.body.res_address,
                                    "pin_code": req.body.res_pin_code,
                                    "city": req.body.res_city,
                                    "state": req.body.res_state,
                                    "country": req.body.res_country,
                                    "type": 2,
                                    "doc_type": req.body.doc_type,
                                    "created_at": created_at,
                                    "kaddress_status": 1
                                }


                                let sql3 = mysql.format("INSERT INTO customer_address SET ?", addrData)
                                // let sql3 = "INSERT INTO customer_address (customer_id,address,pin_code,city,state,country,type,doc_type,created_at,kaddress_status) values ('" + customer_id + "','" + req.body.res_address + "','" + req.body.res_pin_code + "','" + req.body.res_city + "','" + req.body.res_state + "','" + req.body.res_country + "','2','" + req.body.doc_type + "','" + created_at + "',1);"
                                connection.query(sql3, function(error, dta) {
                                    if (error) {
                                        res.json({ success: false, message: "Error", error: error });
                                    } else {
                                        console.log(dta)
                                        changestatus(customer_id).then(function(status) {
                                            res.json({ success: true, message: "Successfully save Residential address proof details" })
                                        }, function(error) {
                                            res.json({ success: false, message: "Error", error: error });
                                        })
                                    }
                                })

                            } else {

                                var upData = {
                                    "address": req.body.res_address,
                                    "pin_code": req.body.res_pin_code,
                                    "city": req.body.res_city,
                                    "state": req.body.res_state,
                                    "country": req.body.res_country
                                }


                                let sql3 = mysql.format("UPDATE customer_address SET ? where type='2' and customer_id =?", [upData, customer_id])
                                // let sql3 = "UPDATE customer_address SET address='" + req.body.res_address + "',pin_code='" + req.body.res_pin_code + "',city='" + req.body.res_city + "',state='" + req.body.res_state + "',country='" + req.body.res_country + "' where type='2' and customer_id ='" + customer_id + "';"
                                connection.query(sql3, function(error, dta) {
                                    if (error) {
                                        res.json({ success: false, message: "Error", error: error });
                                    } else {
                                        console.log(dta)
                                        console.log(dta.changedRows)
                                        if (dta.changedRows !== 0) {

                                            changestatus(customer_id).then(function(status) {
                                                res.json({ success: true, message: "Successfully updated Residential address proof details" })
                                            }, function(error) {
                                                res.json({ success: false, message: "Error", error: error });
                                            })

                                        } else {


                                            res.json({ success: true, message: "Successfully updated Residential address proof details" })
                                        }
                                    }
                                })
                            }
                        })
                    }
                })
            } else {
                res.json({ success: false, message: "Cannot upload document" });
            }
        }
    })
}


var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/' + folder)
    },
    filename: function(req, file, cb) {
        //cb(null, file.fieldname + '-' + Date.now())
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
})

var upload = multer({ storage: storage }).single('photo')


exports.uploadKyc = function(req, res) {

    function changestatus(custoId) {
        return new Promise(function(resolve, reject) {

            let addressstatus_sql = "Select kaddress_status from customer_address where customer_id='" + custoId + "' and doc_type=5"
            connection.query(addressstatus_sql, function(error, adddata) {
                if (error) {
                    console.log(error)
                    reject(error)
                } else {
                    //  console.log("adddata", adddata)
                    let docstatus_sql = "Select id_status from customer_document where customer_id='" + custoId + "' and doc_type=1"
                    connection.query(docstatus_sql, function(error, docdata) {
                        if (error) {
                            console.log(error)
                            reject(error)
                        } else {
                            //console.log("doc", docdata)
                            let personalstatus_sql = "Select kpersonal_status from customer where id='" + custoId + "'"
                            connection.query(personalstatus_sql, function(error, parsonaldata) {
                                if (error) {
                                    console.log(error)
                                    reject(error)
                                } else {
                                    // console.log("per", parsonaldata)
                                    if (adddata[0] == null || adddata[0] == undefined || docdata[0] == null || docdata[0] == undefined || adddata[0].kaddress_status == 0 || docdata[0].id_status == 0 || parsonaldata[0].kpersonal_status == 0) {
                                        // console.log("something is empty ")
                                        resolve("something is empty")
                                    } else if (adddata[0].kaddress_status == 1 && docdata[0].id_status == 1 && parsonaldata[0].kpersonal_status == 1) {
                                        //console.log("status going to be change")
                                        let updatestatus_sql = "UPDATE customer SET kyc_status ='1' WHERE id = '" + custoId + "'";
                                        connection.query(updatestatus_sql, function(error, dta) {
                                            if (error) {
                                                console.log(error)
                                                reject(error)
                                            } else {

                                                resolve("status going to be change")
                                            }
                                        })

                                    } else {
                                        //console.log("nothing to change in the status")
                                        resolve("nothing to change in the status")
                                    }
                                }
                            })
                        }
                    })
                }
            })
        })
    }

    var customer_id = req.params.customer_id;

    fs.mkdir("uploads/" + customer_id, function(err) {
        //console.log("folder make")

        //console.log(req.files)
        folder = customer_id
        // console.log(folder)
        upload(req, res, function(error) {
            //console.log(req.file)

            if (error) {
                res.json({ success: false, message: "error in photo upload", error: error })
            }
            if (!req.file) {
                res.json({ success: false, message: "No file found " });

            }
            if (req.file) {

                //console.log(req.file.originalname)

                var ext = req.file.originalname.substr(req.file.originalname.lastIndexOf('.') + 1);

                // console.log(ext)

                if (ext == 'doc' || ext == 'docx' || ext == 'pdf' || ext == 'jpg' || ext == 'jpeg' || ext == 'png') {

                    // console.log(req.file.path)

                    let sq = mysql.format("SELECT * FROM customer_document WHERE customer_id =? and doc_type=? and f_b_type=?", [customer_id, req.params.doc_type, req.params.f_b_type]);
                    //console.log(sq)
                    connection.query(sq, function(error, docdata) {
                        if (error) {
                            res.json({ success: false, message: "error", error })
                        } else if (docdata[0] == null || docdata[0] == undefined) {
                            if (req.params.doc_type == 1) {
                                // console.log("fb", req.params.f_b_type)
                                if (req.params.f_b_type == 1 || req.params.f_b_type == 2) {
                                    // console.log(req.file)
                                    //  console.log("fb", req.params.f_b_type)
                                    insertData = {
                                        "filename1": req.file.filename,
                                        "original_filename": req.file.originalname,
                                        "customer_id": customer_id,
                                        "doc_type": req.params.doc_type,
                                        "created_at": created_at,
                                        "f_b_type": req.params.f_b_type
                                    }

                                    let sql1 = mysql.format("INSERT INTO customer_document SET ?", insertData);
                                    // let sql1 = "INSERT INTO customer_document(filename1,original_filename,customer_id,doc_type,created_at,f_b_type) values('" + req.file.filename + "','" + req.file.originalname + "','" + customer_id + "','" + req.params.doc_type + "','" + created_at + "')";
                                    //console.log(sql1)
                                    connection.query(sql1, function(error, dta) {
                                        if (error) {
                                            res.json({ success: false, message: "Error", error: error });
                                        } else {
                                            res.json({ success: true, message: "Successfully save id proof photo" })
                                        }
                                    })
                                } else {
                                    res.json({ success: false, message: "File upload failed" });
                                }
                            } else if (req.params.doc_type == 4) {

                                insertData = {
                                    "filename1": req.file.filename,
                                    "original_filename": req.file.originalname,
                                    "customer_id": customer_id,
                                    "doc_type": req.params.doc_type,
                                    "doc_name": 'selfie',
                                    "created_at": created_at,
                                    "f_b_type": req.params.f_b_type

                                }

                                let sql1 = mysql.format("INSERT INTO customer_document SET ?", insertData);
                                //let sql1 = "INSERT INTO customer_document (customer_id,doc_type,doc_name,filename1,original_filename,created_at) values ('" + customer_id + "','" + req.params.doc_type + "','selfie','" + req.file.filename + "','" + req.file.originalname + "','" + created_at + "');"

                                connection.query(sql1, function(error, dta) {
                                    if (error) {
                                        res.json({ success: false, message: "Error", error: error });
                                    } else {
                                        res.json({ success: true, message: "Successfully save selfie" })
                                    }
                                })
                            } else if (req.params.doc_type == 3) {
                                console.log(req.params.doc_type)
                                console.log(typeof(req.params.doc_type))
                                console.log("params", req.params.f_b_type)
                                console.log(typeof(req.params.f_b_type))

                                insertData = {
                                    "filename1": req.file.filename,
                                    "original_filename": req.file.originalname,
                                    "customer_id": customer_id,
                                    "doc_type": req.params.doc_type,
                                    "f_b_type": req.params.f_b_type,
                                    "created_at": created_at


                                }

                                let sql1 = mysql.format("INSERT INTO customer_document SET ?", insertData);

                                //let sql1 = "INSERT INTO customer_document (filename1,original_filename,customer_id,doc_type,created_at) values ('" + req.file.filename + "','" + req.file.originalname + "','" + customer_id + "','" + req.params.doc_type + "','" + created_at + "')";
                                console.log(sql1)
                                connection.query(sql1, function(error, dta) {
                                    if (error) {
                                        console.log(error)
                                        res.json({ success: false, message: "Error", error: error });
                                    } else {
                                        res.json({ success: true, message: "Successfully save photo" })
                                    }
                                })
                            } else if (req.params.doc_type == 2) {
                                if (req.params.f_b_type == 1 || req.params.f_b_type == 2) {
                                    // console.log(req.file)
                                    // console.log(docdata)
                                    insertData = {
                                        "filename1": req.file.filename,
                                        "original_filename": req.file.originalname,
                                        "customer_id": customer_id,
                                        "doc_type": 2,
                                        "created_at": created_at,
                                        "f_b_type": req.params.f_b_type
                                    }

                                    let sql1 = mysql.format("INSERT INTO customer_document SET ?", insertData);
                                    //let sql1 = "INSERT INTO customer_document (filename1,original_filename,customer_id,doc_type,created_at) values ('" + req.file.filename + "','" + req.file.originalname + "','" + customer_id + "','2','" + created_at + "')";
                                    //console.log(sql1)
                                    connection.query(sql1, function(error, dta) {
                                        if (error) {
                                            res.json({ success: false, message: "Error", error: error });
                                        } else {
                                            res.json({ success: true, message: "Successfully save Permanent address proof photo" })
                                        }
                                    })
                                } else {
                                    res.json({ success: false, message: "File upload failed" });
                                }
                            } else if (req.params.doc_type == 5) {
                                if (req.params.f_b_type == 1 || req.params.f_b_type == 2) {
                                    // console.log(req.file)
                                    // console.log(docdata)
                                    insertData = {
                                        "filename1": req.file.filename,
                                        "original_filename": req.file.originalname,
                                        "customer_id": customer_id,
                                        "doc_type": 5,
                                        "created_at": created_at,
                                        "f_b_type": req.params.f_b_type
                                    }

                                    let sql1 = mysql.format("INSERT INTO customer_document SET ?", insertData);
                                    // let sql1 = "INSERT INTO customer_document (filename1,original_filename,customer_id,doc_type,created_at) values('" + req.file.filename + "','" + req.file.originalname + "','" + customer_id + "','5','" + created_at + "')";
                                    //console.log(sql1)
                                    connection.query(sql1, function(error, dta) {
                                        if (error) {
                                            res.json({ success: false, message: "Error", error: error });
                                        } else {
                                            console.log(dta)
                                            res.json({ success: true, message: "Successfully save Residential address proof photo" })
                                        }
                                    })
                                } else {
                                    res.json({ success: false, message: "File upload failed" });
                                }
                            } else {
                                res.json({ success: false, message: "Cannot upload document" });
                            }


                        } else {
                            if (req.params.doc_type == 1) {
                                //  console.log(req.file)
                                if (req.params.f_b_type == 1 || req.params.f_b_type == 2) {
                                    // console.log(docdata)
                                    var updateData = {
                                        "filename1": req.file.filename,
                                        "original_filename": req.file.originalname,

                                    }


                                    let sql1 = mysql.format('UPDATE customer_document SET ? WHERE customer_id= ? and doc_type=? and f_b_type=?', [updateData, customer_id, 1, req.params.f_b_type]);
                                    //let sql1 = "UPDATE customer_document SET filename1='" + req.file.filename + "',original_filename='" + req.file.originalname + "' where customer_id='" + customer_id + "' and doc_type=1"
                                    //console.log(sql1)
                                    connection.query(sql1, function(error, dta) {
                                        if (error) {
                                            res.json({ success: false, message: "Error", error: error });
                                        } else {
                                            if (dta.changedRows !== 0) {

                                                changestatus(customer_id).then(function(status) {
                                                    res.json({ success: true, message: "Successfully updated id proof photo" })
                                                }, function(error) {
                                                    res.json({ success: false, message: "Error", error: error });
                                                })

                                            } else {
                                                res.json({ success: true, message: "Successfully updated id proof photo" })
                                            }
                                        }
                                    })
                                } else {
                                    res.json({ success: false, message: "File cannot updated" });
                                }
                            } else if (req.params.doc_type == 4) {

                                var updateData = {
                                    "filename1": req.file.filename,
                                    "original_filename": req.file.originalname,

                                }


                                let sql1 = mysql.format('UPDATE customer_document SET ? WHERE customer_id= ? and doc_type=?', [updateData, customer_id, req.params.doc_type]);


                                //let sql1 = "UPDATE customer_document SET doc_name='selfie',filename1='" + req.file.filename + "',original_filename='" + req.file.originalname + "' where customer_id='" + customer_id + "' and doc_type='" + req.params.doc_type + "';"

                                connection.query(sql1, function(error, dta) {
                                    if (error) {
                                        res.json({ success: false, message: "Error", error: error });
                                    } else {
                                        if (dta.changedRows !== 0) {

                                            changestatus(customer_id).then(function(status) {
                                                res.json({ success: true, message: "Successfully updated selfie" })
                                            }, function(error) {
                                                res.json({ success: false, message: "Error", error: error });
                                            })

                                        } else {
                                            res.json({ success: true, message: "Successfully updated selfie" })
                                        }
                                    }
                                })
                            } else if (req.params.doc_type == 3) {
                                var updateData = {
                                    "filename1": req.file.filename,
                                    "original_filename": req.file.originalname,

                                }


                                let sql1 = mysql.format('UPDATE customer_document SET ? WHERE customer_id= ? and doc_type=?', [updateData, customer_id, req.params.doc_type]);
                                //let sql1 = "UPDATE customer_document SET filename1='" + req.file.filename + "',original_filename='" + req.file.originalname + "' where customer_id='" + customer_id + "' and doc_type=3"
                                //console.log(sql1)
                                connection.query(sql1, function(error, dta) {
                                    if (error) {
                                        console.log(error)
                                        res.json({ success: false, message: "Error", error: error });
                                    } else {
                                        if (dta.changedRows !== 0) {

                                            changestatus(customer_id).then(function(status) {
                                                res.json({ success: true, message: "Successfully updated photo" })
                                            }, function(error) {
                                                res.json({ success: false, message: "Error", error: error });
                                            })

                                        } else {
                                            res.json({ success: true, message: "Successfully updated photo" })
                                        }
                                    }
                                })
                            } else if (req.params.doc_type == 2) {
                                if (req.params.f_b_type == 1 || req.params.f_b_type == 2) {

                                    var updateData = {
                                        "filename1": req.file.filename,
                                        "original_filename": req.file.originalname,

                                    }

                                    let sql1 = mysql.format('UPDATE customer_document SET ? WHERE customer_id= ? and doc_type=? and f_b_type=?', [updateData, customer_id, 2, req.params.f_b_type]);
                                    //let sql1 = mysql.format('UPDATE customer_document SET ? WHERE customer_id= ? and doc_type', [updateData, customer_id,req.params.doc_type]);

                                    // let sql1 = "UPDATE customer_document SET filename1='" + req.file.filename + "',original_filename='" + req.file.originalname + "' where customer_id='" + customer_id + "' and doc_type=2"
                                    console.log(sql1)
                                    connection.query(sql1, function(error, dta) {
                                        if (error) {
                                            res.json({ success: false, message: "Error", error: error });
                                        } else {
                                            if (dta.changedRows !== 0) {

                                                changestatus(customer_id).then(function(status) {
                                                    res.json({ success: true, message: "Successfully updated Permanent address proof photo" })
                                                }, function(error) {
                                                    res.json({ success: false, message: "Error", error: error });
                                                })

                                            } else {
                                                res.json({ success: true, message: "Successfully updated Permanent address proof photo" })
                                            }
                                        }
                                    })
                                } else {
                                    res.json({ success: false, message: "File cannot updated" });
                                }
                            } else if (req.params.doc_type == 5) {
                                if (req.params.f_b_type == 1 || req.params.f_b_type == 2) {

                                    var updateData = {
                                        "filename1": req.file.filename,
                                        "original_filename": req.file.originalname,

                                    }

                                    let sql1 = mysql.format('UPDATE customer_document SET ? WHERE customer_id= ? and doc_type=? and f_b_type=?', [updateData, customer_id, 5, req.params.f_b_type]);

                                    // let sql1 = "UPDATE customer_document SET filename1='" + req.file.filename + "',original_filename='" + req.file.originalname + "' where customer_id='" + customer_id + "' and doc_type=5"
                                    console.log(sql1)
                                    connection.query(sql1, function(error, dta) {
                                        if (error) {
                                            res.json({ success: false, message: "Error", error: error });
                                        } else {
                                            if (dta.changedRows !== 0) {

                                                changestatus(customer_id).then(function(status) {
                                                    res.json({ success: true, message: "Successfully updated Residential address proof photo" })
                                                }, function(error) {
                                                    res.json({ success: false, message: "Error", error: error });
                                                })

                                            } else {
                                                res.json({ success: true, message: "Successfully updated Residential address proof photo" })
                                            }
                                        }
                                    })
                                } else {
                                    res.json({ success: false, message: "File cannot updated" });
                                }
                            } else {
                                res.json({ success: false, message: "Cannot upload document" });
                            }
                        }
                    })
                } else {
                    res.json({ success: false, message: "Unsupported file format" })
                }
            }
        })
    })
}

exports.getDocumentDetailsById = function(req, res) {

    var customer_id = req.params.customer_id;
    //console.log(data[0].id)
    let sql1 = "SELECT *,CONCAT('uploads/',customer_document.customer_id,'/',filename1) as document_path FROM customer_document WHERE customer_id ='" + customer_id + "' and (doc_type=1 or doc_type=4)";
    console.log(sql1)
    connection.query(sql1, function(error, adddata) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (adddata[0] == null || adddata[0] == undefined) {

            res.json({ success: false, message: "document details not found" })
        } else {
            // obj = { fullname: data[0].fullname, city: data[0].city, country: data[0].country, address: data[0].address, postal_code: data[0].postal_code }
            res.json({ success: true, message: "Id details", data: adddata })
        }
    })
}

exports.downloadAdmin = function(req, res) {
    var reqPath = req.body.path;
    var str1 = reqPath.split("/");
    if (str1[0] == 'uploads') {
        if (str1.length > 4) {
            return res.json({ success: false, message: "Unauthorized folder access" })
        }
        if (str1.length === 4 && str1[2] !== 'banks_documents') {
            return res.json({ success: false, message: "Unauthorized folder access" })
        }
        var pathcheck = fs.existsSync(reqPath)
        if (pathcheck == true) {
            var file_path = path.resolve(reqPath);
            res.download(file_path);
        } else {
            res.json({ success: false, message: "Requested file not found" })
        }
    } else {
        res.json({ success: false, message: "Unauthorized folder access" })
    }
}

exports.getAddressById = function(req, res) {
    var customer_id = req.params.customer_id;
    //    let sql1 = "SELECT customer_document.customer_id, customer_document.doc_name,customer_document.filename1,CONCAT('uploads/',customer_document.customer_id,'/',filename1) as document_path,ca.country,ca.address,ca.pin_code,ca.city,ca.doc_type,ca.state,ca.type,ca.doc_type,ca.created_at FROM customer_address AS ca left join customer_document ON customer_document.doc_type =ca.doc_type AND customer_document.customer_id=" + customer_id + " WHERE (ca.doc_type=5 or ca.doc_type=2) and ca.customer_id=" + customer_id + " GROUP BY customer_document.doc_type";
    let sql1 = "SELECT customer_document.customer_id,customer_document.original_filename, customer_document.doc_name,customer_document.f_b_type,customer_document.filename1,CONCAT('uploads/',customer_document.customer_id,'/',filename1) as document_path,ca.country,ca.address,ca.pin_code,ca.city,ca.doc_type,ca.state,ca.type,ca.doc_type FROM customer_address AS ca inner join customer_document ON customer_document.doc_type =ca.doc_type  WHERE (ca.doc_type=5 or ca.doc_type=2) and ca.customer_id=" + customer_id + " AND customer_document.customer_id = " + customer_id;

    connection.query(sql1, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: error })
        } else {
            res.json({ success: true, message: "Address details", data: data })

        }
    })
}

exports.approveKYC = function(req, res) {

    var id = req.body.id;
    var userEmail;
    connection.query("SELECT kyc_status,email FROM customer WHERE id= ?", [id], function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: error })
        } else {
            userEmail = data[0].email
            if (data[0].kyc_status == 0) {
                res.json({ success: false, message: "KYC Status is Incomplete. Can not be Approved." })
            }
        }
    });

    let set_admin_verifed = (id, cb)=>{
        let int_obj = { };
        int_obj["verified_at"] = created_at;
        connection.query("UPDATE customer_kyc SET ? WHERE customer_id = ? ", [int_obj, id], function(error, data) {
            if (error) {
                return cb(null);
            } else {
                return cb(true);
            }
        })        
    };


    var updateOldData = {
        kyc_form: null,
        selfie_photo: null,
        identity_doc: null,
        address_doc: null,
        fund_source: null,
        transfer_purpose: null
    }

    var updateData = { kyc_status: req.body.kyc_status, kyc_status_comment: req.body.kyc_status_comment }

    connection.query("UPDATE customer SET ? WHERE id = ? ", [updateData, id], function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: error })
        } else {
            if (req.body.kyc_status == 2) {

                cm_helper.log(userEmail, 'Approved KYC', '', '', '', '', '', req.decoded.id, req.decoded.email, '', req.body.kyc_status_comment).then(function(logdata) {
                    set_admin_verifed(id, (verified_response)=>{
                        res.json({ success: true, message: "KYC Approved Successfully", data: data })                        
                    })
                }).catch(function(error) {
                    res.json({ success: false, message: "error", error: error })
                })
            } else {

                connection.query("UPDATE customer_kyc SET ? WHERE customer_id = ? ", [updateOldData, id], function(error, data) {
                    if (error) {
                        res.json({ success: false, message: "error", error: error })
                    } else {

                        cm_helper.log(userEmail, 'Disapproved KYC', '', '', '', '', '', req.decoded.id, req.decoded.email, '', req.body.kyc_status_comment).then(function(logdata) {
                            res.json({ success: true, message: "KYC Disapproved Successfully", data: data })


                        }).catch(function(error) {
                            res.json({ success: false, message: "error", error: error })
                        })

                    }
                });
            }
        }
    });

}


exports.getAllWithdrawRequestList = function(req, res) {

    var customer_name = req.body.customer_name;
    var email =req.body.email;
    var currency_code = req.body.currency_code;
    var amount = req.body.amount;
    var status = req.body.status;
    var comment = req.body.comment;
    var currency_type = req.body.currency_type;
    var reference_number =req.body.reference_number
    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;

    var searchQuery = '';

    if (typeof customer_name !== 'undefined' && customer_name) {
        searchQuery += " AND c.fullname LIKE '%" + customer_name + "%' ";
    }
    if (typeof email !== 'undefined' && email) {
        searchQuery += " AND c.email LIKE '%" + email + "%' ";
    }
    if (typeof currency_code !== '' && currency_code) {
        searchQuery += " AND cw.currency_code LIKE '%" + currency_code + "%' ";
    }
    if (typeof currency_type !== 'undefined' && currency_type !== null) {
        searchQuery += " AND cm.type = " + currency_type;
    }
    if (typeof amount !== 'undefined' && amount) {
        searchQuery += " AND cw.formatedAmount LIKE '%" + amount + "%' ";

    }
    if (typeof reference_number !== 'undefined' && reference_number) {
        searchQuery += " AND cw.reference_number LIKE '%" + reference_number + "%' ";
    }
    if (typeof status !== 'undefined' && status !== null) {
        searchQuery += " AND cw.status = " + status;
    }
    if (typeof comment !== 'undefined' && comment) {
        searchQuery += " AND cw.comment  LIKE '%" + comment + "%'";
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY cw.id DESC";
    }

    var query = connection.query("SELECT Y.*, @count:=@count+1 AS serial_number  FROM ( SELECT cw.*,IF(cw.type='0', FORMAT(cw.amount, 2), FORMAT(cw.amount, 8)) as formatedAmount, cm.type as currency_type, u.id as user_id, c.fullname as customer_name,c.email ,(cw.amount+cw.platform_value) as refund_amount FROM customer_withdraw cw JOIN customer c ON c.id = cw.customer_id JOIN user u ON u.type_id = cw.customer_id JOIN currency_master cm ON cm.currency_code=cw.currency_code WHERE 1=1 " + searchQuery + "  LIMIT " + offset + ", " + limit + " ) AS Y,  (SELECT @count:=" + offset + ") AS X", function(error, data) {
        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else {
            console.log(query.sql);
            connection.query("SELECT count(*) as count FROM customer_withdraw cw JOIN customer c ON c.id = cw.customer_id JOIN currency_master cm ON cm.currency_code=cw.currency_code WHERE 1=1 " + searchQuery, function(error, data1) {
                var result = { 'totalRecords': data1, 'records': data };
                res.json({ "success": true, "message": "Withdraw Request List", result });
            });
        }
    })
}

exports.approveWithdrawRequest = function(req, res) {
    var id = req.body.id;
    var updated_by = req.decoded.id;
    var customer_id = req.body.customer_id;
    var amount = req.body.amount;
    var userId = req.decoded.id;
    var updated_at = created_at;
    let userEmail, data;
    var updateData = {
        // amount: amount,
        reference_number: mysql.escape(req.body.reference_number) == 'NULL' ? null : req.body.reference_number,
        status: req.body.status,
        comment: mysql.escape(req.body.comment) == 'NULL' ? null :req.body.comment,
        updated_at: updated_at,
        updated_by: updated_by
    }
    let withdrawAmount = 0;
    let currency_codes = '';


    if (req.body.status && isNaN(req.body.status)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (id && isNaN(id)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (updated_by && isNaN(updated_by)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (customer_id && isNaN(customer_id)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (amount && isNaN(amount)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (userId && isNaN(userId)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }

    if (req.body.status == 1) {
        var q = connection.query("SELECT kyc_status FROM customer c WHERE c.id = " + customer_id + " AND c.kyc_status = 0 ", function(error, result) {
            if (result.length > 0) {
                res.json({ success: false, message: "Customer KYC is Incomplete, Request can not be Approved." })
            } else {
                var qry = connection.query("SELECT status, amount, currency_code FROM customer_withdraw where id = " + id + " ", function(error, resultr) {
                    if (resultr[0].status != 0) {
                        res.json({ success: false, message: "Action already taken on withdraw request." })
                    } else {
                        withdrawAmount = resultr[0].amount;
                        currency_codes = resultr[0].currency_code;
                        updateData.amount = withdrawAmount;
                        connection.query("UPDATE customer_withdraw SET ? WHERE id = ?", [updateData, id], function(error, data) {
                            if (error) {
                                res.json({ success: false, message: "error", error: error })
                            } else {

                                if (req.body.status == '1') { // For Approved Request

                                    var logData = {
                                        "user_id": req.body.user_id, // customer_id in user table
                                        "activity_description": "" + withdrawAmount + " " + currency_codes + " Withdraw Request Accepted",
                                        "activity_type": '041',
                                        "device_ipAddress": req.body.device_ipAddress,
                                        "device_os": req.body.device_os,
                                        "device_name": req.body.device_name,
                                        "device_browser": req.body.device_browser,
                                        "created_at": created_at,
                                        "created_by": userId,
                                        "updated_by": userId
                                    }

                                    let sql3 = mysql.format("INSERT INTO log SET ?", logData)

                                    connection.query(sql3, function(error, results) {
                                        if (error) {
                                            return connection.rollback(function() {
                                                throw error;
                                                reject(error)
                                            });
                                        } else {
                                            var customerData = commonHelper.getCustomerWithdrawDetailById(id);
                                            //console.log("4465564", customerData);
                                            customerData.then(function(result) {
                                                data = [
                                                    { "{name}": result[0].fullname },
                                                    { "{currency_code}": result[0].currency_code },
                                                    { "{amount}": result[0].amount },
                                                    { "{currency_code}": result[0].currency_code },
                                                    { "{address}": result[0].receiverAddress == null ? '' : result[0].receiverAddress },
                                                    { "{reference_number}": result[0].reference_number },
                                                    { "{status}": result[0].cw_status },
                                                    {"{commission}":result[0].platform_value},
                                                ];
                                                userEmail = result[0].email;

                                                return cm_helper.log(userEmail, 'Approve withdraw request', '', '', req.body.reference_number, 'reference_number', req.body.currency_code, req.decoded.id, req.decoded.email, id, req.body.comment)
                                            }).then(function(modata) {
                                                console.log("email", userEmail)
                                                return email_helper.mail_template("WITHDRAW_REQUEST_APPROVED", userEmail, data, req, res);
                                            }).then(function(sendMail) {
                                                console.log('success');
                                            }).catch(function(error) {
                                                console.log(error);
                                            })

                                        }
                                    });
                                }
                                var notification = 'Withdraw Request Approved - ' + req.body.reference_number + '.'
                                addCustomerNotification(customer_id, '/dashboard/history', notification, updated_by);
                                res.json({ success: true, message: "Withdraw Request Updated Successfully", data: data })

                            }
                        });
                    }
                })
            }

        });
    } else {
        connection.query("UPDATE customer_withdraw SET ? WHERE id = ?", [updateData, id], function(error, data) {
            if (error) {
                res.json({ success: false, message: "error", error: error })
            } else {
                res.json({ success: true, message: "Withdraw Request Updated Successfully", data: data })
            }
        })
    }

}


exports.disapproveWithdrawRequest = function(req, res) {

    var id = req.body.id;
    var userId = req.decoded.id;
    var customer_id = req.body.customer_id;
    var currency_code = mysql.escape(req.body.currency_code) == 'NULL' ? null : mysql.escape(req.body.currency_code);
    var updated_by = req.decoded.id;
    var customer_id = req.body.customer_id;
    var refund_amount = req.body.refund_amount;
    var userId = req.decoded.id;
    var updated_at = created_at;

    var updateData = {
        // amount: refund_amount,
        reference_number: mysql.escape(req.body.reference_number) == 'NULL' ? null : req.body.reference_number,
        status: req.body.status,
        comment: mysql.escape(req.body.comment) == 'NULL' ? null : req.body.comment,
        updated_at: updated_at,
        updated_by: updated_by
    }
    let withdrawAmount = 0;
    let currency_codes = '';
    let total_refundamount = 0;

    if (req.body.status && isNaN(req.body.status)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (id && isNaN(id)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (updated_by && isNaN(updated_by)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (customer_id && isNaN(customer_id)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (refund_amount && isNaN(refund_amount)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (userId && isNaN(userId)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }

    connection.query("SELECT status, amount,platform_value, currency_code FROM customer_withdraw where id = " + mysql.escape(id) + " ", function(error, resultr) {
        if (resultr[0].status != 0) {
            res.json({ success: false, message: "Action already taken on withdraw request." })
        } else {
            total_refundamount = parseFloat(resultr[0].amount) + parseFloat(resultr[0].platform_value)
            withdrawAmount = resultr[0].amount;
            currency_codes = resultr[0].currency_code;
            updateData.amount = withdrawAmount;
            connection.query("UPDATE customer_withdraw SET ? WHERE id = ?", [updateData, id], function(error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error: error })
                } else {
                    console.log("resultr",resultr)
                    connection.query("UPDATE customer_wallet SET total_amount =  `total_amount` + ? , updated_at = ?, updated_by = ? WHERE customer_id = ? AND currency_code = ?", [total_refundamount, created_at, req.decoded.id, customer_id, currency_codes], function(error, data) {
                        if (error) {
                            res.json({ success: false, message: "error", error: error })
                        } else {
                            var logData = {
                                "user_id": req.body.user_id,
                                "activity_description": "" + withdrawAmount + " " + currency_codes + " Refunded to wallet",
                                "activity_type": '041',
                                "device_ipAddress": req.body.device_ipAddress,
                                "device_os": req.body.device_os,
                                "device_name": req.body.device_name,
                                "device_browser": req.body.device_browser,
                                "created_at": created_at,
                                "created_by": userId,
                                "updated_by": userId
                            }


                            let sql3 = mysql.format("INSERT INTO log SET ?", logData)


                            connection.query(sql3, function(error, results) {
                                if (error) {
                                    return connection.rollback(function() {
                                        throw error;
                                        reject(error)

                                    });
                                } else {
                                    var customerData = commonHelper.getCustomerWithdrawDetailById(id);
                                    customerData.then(function(result) {
                                        data = [
                                            { "{name}": result[0].fullname },
                                            { "{currency_code}": result[0].currency_code },
                                            { "{amount}": result[0].amount },
                                            { "{commission}": result[0].platform_value },
                                            // { "{reference_number}": result[0].reference_number },
                                            { "{status}": result[0].cw_status },
                                            { "{remark}": result[0].comment },
                                        ];
                                        userEmail = result[0].email;
                                        return cm_helper.log(userEmail, 'Disapprove withdraw request', '', '', req.body.reference_number, 'reference_number', req.body.currency_code, req.decoded.id, req.decoded.email, id, req.body.comment)
                                    }).then(function(modata) {
                                        console.log("email", userEmail)
                                        return email_helper.mail_template("WITHDRAW_REQUEST_DISAPPROVED", userEmail, data, req, res);
                                    }).then(function(sendMail) {
                                        console.log('success');
                                    }).catch(function(error) {
                                        console.log(error);
                                    })
                                }
                            });
                        }
                    });
                    addCustomerNotification(customer_id, '/dashboard/history', 'Withdraw Request Disapproved -', updated_by);
                    res.json({ success: true, message: "Withdraw Request Disapproved Successfully", data: data })

                }
            })

        }
    })

};

exports.updateWithdrawRequest = function(req, res) {
    var id = req.body.id;
    var updated_by = req.decoded.id;
    var customer_id = req.body.customer_id;
    var amount = req.body.amount;
    var userId = req.decoded.id;
    var updated_at = created_at;
    var updateData = {
        reference_number: req.body.reference_number,
        comment: req.body.comment,
        updated_at: updated_at,
        updated_by: updated_by
    }
    connection.query("UPDATE customer_withdraw SET ? WHERE id = ?", [updateData, id], function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: error })
        } else {
            cm_helper.log(req.body.email, 'Update withdraw request', '', req.body.old_reference_number, req.body.reference_number, 'reference_number', req.body.currency_code, req.decoded.id, req.decoded.email, id, req.body.comment).then(function(result) {
                console.log('success')
                res.json({ success: true, message: "Withdraw Request Updated Successfully", data: data })
            }).catch(function(err) {
                res.json({ "success": false, "message": "error", error });
            })
        }
    })
}


exports.getWithdrawRequestById = function(req, res) {
    var id = req.params.id;
    connection.query('SELECT c.id as user_id,c.email, c.kyc_status,c.fullname,cw.currency_code,cw.type,cw.amount,cw.comment, cw.reference_number,cw.status,cw.created_at,cw.customer_id, cw.receiverAddress FROM customer_withdraw cw JOIN customer c ON c.id = cw.customer_id WHERE cw.id= ?', [id], function(err, data) {
        if (err) {
            res.json({ success: false, error: 'Error', err });
        } else {
            if (data.length) {
                if (data[0].type) { // for crypto
                    //generate QR code
                    if (data[0].receiverAddress) {
                        QRCode.toDataURL(data[0].receiverAddress, (err, qrcode) => {
                            if (err)
                                res.json({ success: false, error: 'Error', err })
                            else {
                                data[0].qrcode = qrcode
                                res.json({ success: true, message: "Customer Withdraw Request", data })
                            }
                        })
                    } else {
                        res.json({ success: true, message: 'Customer Withdraw Request', data })
                    }
                } else { // for fiat
                    connection.query('SELECT bd.bank_name as bankName, bd.holder_name as holderName, bd.account_number as accNumber, bd.ifsc_code as ifscCode, bd.status FROM (user u JOIN bank_details bd on u.id=bd.user_id) WHERE u.type_id = ? AND u.user_type = "C"', [data[0].user_id], (err, bankDetails) => {
                        if (err) {
                            res.json({ success: false, error: 'Error', err });
                            return;
                        } else {
                            data[0].bankDetails = bankDetails[0];
                        }
                        res.json({ success: true, message: "Customer Withdraw Request", data })
                    })
                }
            } else {
                res.json({ success: false, message: "Withdraw Request Not Found" })
            }
        }
    });
}



// Deposit Request


exports.getAllDepositRequestList = function(req, res) {

    var customer_name = req.body.customer_name;
    var currency_code = req.body.currency_code;
    var amount = req.body.amount;
    var status = req.body.status;
    var comment = req.body.comment;

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;

    var searchQuery = '';

    if (typeof customer_name !== 'undefined' && customer_name) {
        searchQuery += " AND c.fullname LIKE '%" + customer_name + "%' ";
    }
    if (typeof currency_code !== '' && currency_code) {
        searchQuery += " AND cd.currency_code LIKE '%" + currency_code + "%' ";
    }
    if (typeof amount !== 'undefined' && amount) {
        searchQuery += " AND cd.amount LIKE '%" + amount + "%' ";

    }
    if (typeof status !== 'undefined' && status !== null) {
        searchQuery += " AND cd.status = " + status;
    }
    if (typeof comment !== 'undefined' && comment) {
        searchQuery += " AND cd.comment LIKE '%" + comment + "%'";
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY cd.id DESC";
    }

    var query = connection.query("SELECT Y.*, @count:=@count+1 AS serial_number  FROM ( SELECT cd.*,u.id as user_id, c.fullname as customer_name ,u.email,(cd.amount+cd.platform_value) as refund_amount FROM customer_deposite cd JOIN customer c ON c.id = cd.customer_id JOIN user u ON u.type_id = cd.customer_id WHERE 1=1 " + searchQuery + "  LIMIT " + offset + ", " + limit + " ) AS Y,  (SELECT @count:=" + offset + ") AS X", function(error, data) {
        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else {
            console.log(query.sql);
            connection.query("SELECT count(*) as count FROM customer_deposite cd JOIN customer c ON c.id = cd.customer_id WHERE 1=1 " + searchQuery, function(error, data1) {
                var result = { 'totalRecords': data1, 'records': data };
                res.json({ "success": true, "message": "Deposit Request List", result });
            });
        }
    })
}

function addCustomerNotification(customer_id, link, title, admin_id = 0) {
    var notifyData = {
        "customer_id": customer_id,
        "link": link,
        "title": title,
        "admin_id": admin_id,
    }

    let admin_notify = mysql.format("INSERT INTO customer_notifications set ?", notifyData);
    connection.query(admin_notify, function(error, result) {
        if (error) {
            console.log(error);
            //res.json({ success: false, message: "error", error })
        } else {

            let admin_count = mysql.format("update customer set notification_count = notification_count + 1 where id = " + customer_id);
            connection.query(admin_count, function(error, result) {
                if (error) {
                    console.log(error);
                    //res.json({ success: false, message: "error", error })
                } else {

                }
            });
            socketio.to(customer_id).emit('new_customer_notification', { message: title });
        }
    });
}


exports.approveDepositRequest = function(req, res) {
    var id = req.body.id;
    var updated_by = req.decoded.id;
    var customer_id = req.body.customer_id;
    var amount = req.body.amount;
    var userId = req.decoded.id;
    var updated_at = created_at;
    var currency_code = req.body.currency_code;
    let userEmail, data;
    var updateData = {
        // amount:amount,
        reference_no: req.body.reference_number,
        status: req.body.status,
        comment: req.body.comment,
        updated_at: updated_at,
        updated_by: updated_by
    }
    let depositAomunt = 0;
    let currency_codes = '';
    if (req.body.status && isNaN(req.body.status)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (id && isNaN(id)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (updated_by && isNaN(updated_by)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (customer_id && isNaN(customer_id)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (amount && isNaN(amount)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (userId && isNaN(userId)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }

    if (req.body.status == 1) {
        var q = connection.query("SELECT kyc_status FROM customer c WHERE c.id = " + customer_id + " AND c.kyc_status = 0 ", function(error, result) {
            if (result.length > 0) {
                res.json({ success: false, message: "Customer KYC is Incomplete, Request can not be Approved." })
            } else {
                var qry = connection.query("SELECT status, amount, currency_code FROM customer_deposite where id = " + id + " ", function(error, result) {
                    if (result[0].status != 0) {
                        res.json({ success: false, message: "Action already taken on customer deposite request." })
                    } else {
                        currency_codes = result[0].currency_code;
                        depositAomunt = result[0].amount;
                        connection.query("UPDATE customer_wallet SET total_amount =  `total_amount` + ? , updated_at = ?, updated_by = ? WHERE customer_id = ? AND currency_code = ?", [depositAomunt, created_at, req.decoded.id, customer_id, currency_codes], function(error, data) {
                            if (error) {
                                res.json({ success: false, message: "error", error: error })
                            } else {
                                var r = connection.query("UPDATE customer_deposite SET ? WHERE id = ?", [updateData, id], function(error, data) {
                                    console.log(r.sql);
                                    if (req.body.status == '1') { // For Approved Request

                                        var logData = {
                                            "user_id": req.body.user_id, // customer_id in user table
                                            "activity_description": "" + result[0].amount + " " + req.body.currency_code + " Deposit Request Accepted",
                                            "activity_type": '041',
                                            "device_ipAddress": req.body.device_ipAddress,
                                            "device_os": req.body.device_os,
                                            "device_name": req.body.device_name,
                                            "device_browser": req.body.device_browser,
                                            "created_at": created_at,
                                            "created_by": userId,
                                            "updated_by": userId
                                        }


                                        let sql3 = mysql.format("INSERT INTO log SET ?", logData)


                                        connection.query(sql3, function(error, results) {
                                            if (error) {
                                                return connection.rollback(function() {
                                                    throw error;
                                                    reject(error)

                                                });
                                            } else {
                                                var customerData = commonHelper.getCustomerDepositDetailById(id);
                                                customerData.then(function(result) {
                                                    data = [
                                                        { "{host}": config.globalDomain },
                                                        { "{name}": result[0].fullname },
                                                        { "{currency_code}": result[0].currency_code },
                                                        { "{amount}": result[0].amount },
                                                        { "{commission}": result[0].platform_value },
                                                        { "{reference_number}": result[0].reference_no },
                                                        { "{remark}": result[0].comment },
                                                        { "{status}": result[0].cd_status },
                                                    ];

                                                    userEmail = result[0].email;
                                                    // console.log('00000',data)
                                                    // console.log('22222222222',result[0].email)result[0].amount
                                                    return cm_helper.log(userEmail, 'Approve deposit request', '', '', '', '', result[0].currency_code, req.decoded.id, req.decoded.email, id, req.body.comment)
                                                }).then(function(modata) {
                                                    console.log("email", userEmail)
                                                    return email_helper.mail_template("DEPOSIT_REQUEST_APPROVED", userEmail, data, req, res);
                                                }).then(function(sendMail) {
                                                    console.log('success');
                                                }).catch(function(error) {
                                                    console.log(error);
                                                })
                                            }
                                        });
                                    }

                                    var notification = 'Deposit Request Approved -' + req.body.reference_number + '.'
                                    addCustomerNotification(customer_id, '/dashboard/history', notification, updated_by);
                                    //socketio.of('/').emit('new_customer_notification', { message: 'Deposit Request Approved Successfully' });
                                    res.json({ success: true, message: "Deposit Request Approved Successfully", data: data })
                                });
                            }
                        });

                    }
                });
            }
        });
    } else {
        connection.query("UPDATE customer_deposite SET ? WHERE id = ?", [updateData, id], function(error, data) {
            if (error) {
                res.json({ success: false, message: "error", error: error })
            } else {

                res.json({ success: true, message: "Deposit Request Updated Successfully", data: data })


            }
        })
    }

}



exports.disapproveDepositRequest = function(req, res) {
    var id = req.body.id;
    var userId = req.decoded.id;
    var customer_id = req.body.customer_id;
    var currency_code = req.body.currency_code;
    //
    //    var updateData = {
    //        total_amount: req.body.refund_amount+'+ total_amount',
    //        updated_at: created_at,
    //        updated_by:req.decoded.id
    //    }

    var updated_by = req.decoded.id;
    var customer_id = req.body.customer_id;
    var refund_amount = req.body.refund_amount;
    var userId = req.decoded.id;
    var updated_at = created_at;
    let userEmail, data;
    var updateData = {
        amount: refund_amount,
        reference_no: req.body.reference_number,
        status: req.body.status,
        comment: req.body.comment,
        updated_at: updated_at,
        updated_by: updated_by
    }
    let depositAomunt = 0;
    let currency_codes = '';

    if (req.body.status && isNaN(req.body.status)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (id && isNaN(id)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (updated_by && isNaN(updated_by)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (customer_id && isNaN(customer_id)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (refund_amount && isNaN(refund_amount)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (userId && isNaN(userId)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }

    var qry = connection.query("SELECT status, amount, currency_code FROM customer_deposite where id = " + id + " ", function(error, result) {
        if (result[0].status != 0) {
            res.json({ success: false, message: "Action already taken on customer deposite request." })
        } else {
            currency_codes = result[0].currency_code;
            depositAomunt = result[0].amount;
            updateData.amount = depositAomunt;

            connection.query("UPDATE customer_deposite SET ? WHERE id = ?", [updateData, id], function(error, data) {
                if (error) {
                    res.json({ success: false, message: "error", error: error })
                } else {
                    //    connection.query("UPDATE customer_wallet SET total_amount =  `total_amount` + ? , updated_at = ?, updated_by = ? WHERE customer_id = ? AND currency_code = ?", [req.body.refund_amount, created_at, req.decoded.id, customer_id, currency_code], function (error, data) {
                    //     if (error) {
                    //         res.json({success: false, message: "error", error: error})
                    //     } else {
                    var logData = {
                        "user_id": req.body.user_id,
                        "activity_description": "" + depositAomunt + " " + currency_codes + " Disapproved",
                        "activity_type": '041',
                        "device_ipAddress": req.body.device_ipAddress,
                        "device_os": req.body.device_os,
                        "device_name": req.body.device_name,
                        "device_browser": req.body.device_browser,
                        "created_at": created_at,
                        "created_by": userId,
                        "updated_by": userId
                    }


                    let sql3 = mysql.format("INSERT INTO log SET ?", logData)


                    connection.query(sql3, function(error, results) {
                        if (error) {
                            return connection.rollback(function() {
                                throw error;
                                reject(error)

                            });
                        } else {
                            var customerData = commonHelper.getCustomerDepositDetailById(id);
                            customerData.then(function(result) {
                                data = [
                                    { "{name}": result[0].fullname },
                                    { "{currency_code}": result[0].currency_code },
                                    { "{amount}": result[0].amount },
                                    { "{commission}": result[0].platform_value },
                                    { "{reference_number}": result[0].reference_no },
                                    { "{remark}": result[0].comment },
                                    { "{status}": result[0].cd_status },
                                ];
                                userEmail = result[0].email;
                                return cm_helper.log(userEmail, 'Disapprove deposit request', '', '', '', '', result[0].currency_code, req.decoded.id, req.decoded.email, id, req.body.comment)
                            }).then(function(modata) {
                                console.log("email", userEmail)
                                return email_helper.mail_template("DEPOSIT_REQUEST_DISAPPROVED", userEmail, data, req, res);
                            }).then(function(sendMail) {
                                console.log('success');
                            }).catch(function(error) {
                                console.log(error);
                            })
                        }
                    });
                    var notification = 'Deposit Request Disapproved -' + req.body.reference_number + '.'
                    addCustomerNotification(customer_id, '/dashboard/history', notification, updated_by);
                    //cm_helper.log(userId, userEmail, 'Disapprove deposit request', '', '', '', '', req.body.currency_code, req.decoded.id, req.decoded.email, id, req.body.comment).then(function(result) {
                    res.json({ success: true, message: "Deposit Request Disapproved Successfully", data: data })
                    //}).catch(function(err) {
                    //res.json({ "success": false, "message": "error", error });
                    //})


                }
                //     });
                // }
            })

        }
    })


};

exports.updateDepositRequest = function(req, res) {
    var id = req.body.id;
    var updated_by = req.decoded.id;
    var customer_id = req.body.customer_id;
    var amount = req.body.amount;
    var userId = req.decoded.id;
    var updated_at = created_at;
    var updateData = {
        reference_no: req.body.reference_number,
        comment: req.body.comment,
        updated_at: updated_at,
        updated_by: updated_by
    }
    connection.query("UPDATE customer_deposite SET ? WHERE id = ?", [updateData, id], function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error: error })
        } else {
            cm_helper.log(req.body.email, 'Update deposit request', '', '', '', '', req.body.currency_code, req.decoded.id, req.decoded.email, id, req.body.comment).then(function(result) {
                res.json({ success: true, message: "Deposit Request Updated Successfully", data: data })
            }).catch(function(err) {
                res.json({ "success": false, "message": "error", error });
            })
        }
    })
}


exports.getDepositRequestById = function(req, res) {
    var id = req.params.id;
    connection.query('SELECT c.id as user_id,c.fullname,c.email, cd.currency_code,cd.amount,cd.comment, cd.reference_no as reference_number,cd.status,cd.created_at,cd.customer_id,concat("uploads/",c.id,"/",document_name) as document FROM customer_deposite cd JOIN customer c ON c.id = cd.customer_id WHERE cd.id= ?', [id], function(err, data) {
        if (err) {
            res.json({ success: false, error: 'Error', err });
        } else {
            res.json({ success: true, message: "Customer Deposit Request", data })
        }
    });
}

exports.addAmountToWallet = (req, res) => {
    let cust_email = req.body.cust_email;
    let wallet = req.body.wallet;
    let updated_by = req.decoded.id;
    let updated_at = created_at;
    //fetching customer id
    function updateWallet(customer_id, currency_code, amount) {
        return new Promise((resolve, reject) => {
            connection.query(`UPDATE customer_wallet SET total_amount = total_amount + ${amount}, updated_at = '${updated_at}', updated_by = ${updated_by} WHERE customer_id = ${customer_id} AND currency_code = '${currency_code}'`, (err) => {
                if (err) {

                    reject(err)
                } else {
                    cm_helper.log(cust_email, 'Add amount', '', '', amount, '', currency_code, req.decoded.id, req.decoded.email, '', '').then(function(result) {
                        resolve()
                    }).catch(function(error) {
                        reject(err)
                    })
                }
            })
        })
    }
    connection.query(`SELECT id AS cust_id FROM customer where email = '${cust_email}' LIMIT 1`, (err, data) => {
        if (err) {
            res.json({ success: false, message: 'Error', err })
        } else if (!data.length) {
            res.json({ success: false, message: 'User not found' })
        } else {
            let promises = []
            // Object.keys(wallet).forEach((currency)=>{
            //   if(currency.amount)
            //     promises.push(updateWallet(data[0].id, currency.currency_code, currency.amount))
            // })
            for (currency in wallet) {
                if (wallet[currency])
                    promises.push(updateWallet(data[0].cust_id, currency, wallet[currency]))
            }
            Promise.all(promises).then(() => {
                res.json({ success: true, message: 'Values updated' })
            }).catch((err) => {
                res.json({ success: false, message: 'Some Values not updated', err })
            })
        }
    })
}

exports.getKYCDetails = function(req, res) {
    var customer_id = req.params.customer_id;
    let sql1 = mysql.format("SELECT * FROM customer_kyc WHERE customer_id =?", customer_id);
    console.log(sql1)
    connection.query(sql1, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "document details not found" })
        } else {
            // obj = { fullname: data[0].fullname, city: data[0].city, country: data[0].country, address: data[0].address, postal_code: data[0].postal_code }
            var sql = mysql.format("SELECT kyc_status ,kyc_status_comment FROM customer where id = ?", customer_id)
            connection.query(sql, function(error, result) {
                if (error) {
                    console.log(error)
                    res.json({ success: false, message: "details not found" })
                } else {

                    res.json({ success: true, message: "Details", data: data, result: result })
                }
            })

        }
    })
}

exports.downloadKyc = function(req, res) {
    filePath = req.body.path;


    var pathcheck = fs.existsSync(filePath)
    if (pathcheck == true) {
        var file_path = path.resolve(filePath);
        res.download(file_path);
    } else {
        // obj = { fullname: data[0].fullname, city: data[0].city, country: data[0].country, address: data[0].address, postal_code: data[0].postal_code }
        res.json({ success: true, message: "Details", data: data })
    }
}


exports.downloadKyc = function(req, res) {
    filePath = req.body.path;


    var pathcheck = fs.existsSync(filePath)
    if (pathcheck == true) {
        var file_path = path.resolve(filePath);
        res.download(file_path);
    } else {
        res.json({ success: false, message: "Requested file not found" })
    }
}

exports.getUserInfoData = (req, res) => {

    var id = req.params.customer_id;
    var query = connection.query("SELECT cu.fullname, cu.email, cu.mobileNumber, cr.crypto_address, cr.crypto_type FROM customer cu JOIN user u on cu.id =u.type_id LEFT JOIN user_crypto_address cr on u.id=cr.user_id AND cr.crypto_type='BTC' WHERE cu.id=?", [id], function(error, data) {
        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else {

        }
        res.json({ "success": true, "message": "User Details", data });
    })
}

exports.getUserDepositRequestList = function(req, res) {

    var id = req.body.id;
    var customer_name = req.body.customer_name;
    var currency_code = req.body.currency_code;

    var exportAs = req.body.exportAs;
    var amount = req.body.amount;
    var status = req.body.status;
    var comment = req.body.comment;

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var LIMIT = '';
    var searchQuery = '';

    if (typeof customer_name !== 'undefined' && customer_name) {
        searchQuery += " AND c.fullname LIKE '%" + customer_name + "%' ";
    }
    if (typeof currency_code !== '' && currency_code) {
        searchQuery += " AND cd.currency_code LIKE '%" + currency_code + "%' ";
    }
    if (typeof amount !== 'undefined' && amount) {
        searchQuery += " AND cd.amount LIKE '%" + amount + "%' ";

    }
    if (typeof status !== 'undefined' && status !== null) {
        searchQuery += " AND cd.status = " + status;
    }
    if (typeof comment !== 'undefined' && comment) {
        searchQuery += " AND cd.comment LIKE '%" + comment + "%'";
    }

    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + offset + ", " + limit;
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY cd.id DESC";
    }

    var query = connection.query("SELECT Y.*, @count:=@count+1 AS serial_number  FROM ( SELECT cd.*,u.id as user_id, c.fullname as customer_name ,u.email,(cd.amount+cd.platform_value) as refund_amount FROM customer_deposite cd JOIN customer c ON c.id = cd.customer_id JOIN user u ON u.type_id = cd.customer_id WHERE cd.customer_id=" + id + searchQuery + LIMIT + " ) AS Y,  (SELECT @count:=" + offset + ") AS X", function(error, data) {
        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else {

            connection.query("SELECT count(*) as count FROM customer_deposite cd JOIN customer c ON c.id = cd.customer_id WHERE cd.customer_id=" + id + searchQuery, function(error, data1) {
                var result = { 'totalRecords': data1, 'records': data };


                res.json({ "success": true, "message": "Deposit Request List", result });
            });
        }
    })

}

exports.customerOpenOrder = (req, res) => {
    var id = req.body.id;
    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var LIMIT = '';
    var searchQuery = '';
    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + offset + ", " + limit;
    }

    var a = connection.query(`SELECT * FROM (Select CONCAT('${cm_cfg.buyOrderPrefix}',buy.id) as transactionid, buy.customer_id, buy.status, FORMAT(buy.quantity, 8) as quantity, FORMAT(buy.total_price, 2) as totalprice, FORMAT(buy.buy_price, 8) as price, buy.platform_fee, FORMAT(buy.platform_value, 8) as platform_value, buy.created_at, buy.pair_id, pair_master.from as pair_idfrom, pair_master.to as pair_idto, buy.type, CONCAT('Buy') as trade_type from buy inner join pair_master ON pair_master.id = buy.pair_id where(buy.status = 'Executed' or  buy.status = 'Partially Executed' ) and buy.customer_id = '` + id + `' UNION ALL Select CONCAT('${cm_cfg.sellOrderPrefix}',sell.id) AS transactionid, sell.customer_id, sell.status, FORMAT(sell.quantity, 8) as quantity, FORMAT(sell.total_price, 8) as totalprice, FORMAT(sell.sell_price, 8) as price, sell.platform_fee, FORMAT(sell.platform_value, 8) as platform_value, sell.created_at, sell.pair_id, pair_master.from as pair_idfrom, pair_master.to as pair_idto, sell.type, CONCAT('Sell') as trade_type from sell inner join pair_master ON pair_master.id = sell.pair_id where(sell.status = 'Executed' or  sell.status = 'Partially Executed') and sell.customer_id = '` + id + "') AS b " + searchQuery + " ORDER BY created_at DESC " + LIMIT + "", function(error, data) {
        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else {

            connection.query(`SELECT count(*) as count FROM(Select CONCAT('${cm_cfg.buyOrderPrefix}',buy.id) as transactionid, buy.customer_id, buy.status, FORMAT(buy.quantity, 8) as quantity, FORMAT(buy.total_price, 2) as totalprice, FORMAT(buy.buy_price, 8) as price, buy.platform_fee, FORMAT(buy.platform_value, 8) as platform_value, buy.created_at, buy.pair_id, pair_master.from as pair_idfrom, pair_master.to as pair_idto, buy.type, CONCAT('Buy') as trade_type from buy inner join pair_master ON pair_master.id = buy.pair_id where(buy.status = 'Executed' or  buy.status = 'Partially Executed') and buy.customer_id = '` + id + `' UNION ALL Select CONCAT('${cm_cfg.sellOrderPrefix}',sell.id) AS transactionid, sell.customer_id, sell.status, FORMAT(sell.quantity, 8) as quantity, FORMAT(sell.total_price, 8) as totalprice, FORMAT(sell.sell_price, 8) as price, sell.platform_fee, FORMAT(sell.platform_value, 8) as platform_value, sell.created_at, sell.pair_id, pair_master.from as pair_idfrom, pair_master.to as pair_idto, sell.type, CONCAT('Sell') as trade_type from sell inner join pair_master ON pair_master.id = sell.pair_id where(sell.status = 'Executed' or  sell.status = 'Partially Executed') and sell.customer_id = '` + id + "') AS b", function(error, data1) {
                if (error) {

                    res.json({ "success": false, "message": "error", error });

                } else {

                    var result = { 'totalRecords': data1, 'records': data };
                    res.json({ "success": true, "message": "Customer Open Order", result });
                }
            })

        }

    })
}

exports.getCustomerTradeDetails = (req, res) => {
    var id = req.body.id;
    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var exportAs = req.body.exportAs;
    var transactionid = req.body.transactionid;
    var date = req.body.created_at;
    var trade_type = req.body.trade_type;
    var customer_id = req.body.customer_id;
    var status = req.body.status;
    var pair_id = req.body.pair_id;
    var fromDate = req.body.date_from;
    var toDate = req.body.date_to;
    var searchQuery = '';
    var LIMIT = '';
    if (typeof transactionid !== 'undefined' && transactionid) {
        searchQuery += " AND tm.trade_id LIKE '%" + transactionid + "%' ";
    }
    if (typeof trade_type !== '' && trade_type) {
        searchQuery += " AND tm.trade_type LIKE '%" + trade_type + "%' ";
    }
    if (typeof status !== 'undefined' && status !== null && status) {
        searchQuery += " AND tm.status LIKE '%" + status + "%' ";
    }
    if (typeof date !== 'undefined' && date !== null && date) {
        searchQuery += " AND tm.created_at = '" + date + "'";
    }
    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + offset + ", " + limit;
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
        //        searchQuery += " ORDER BY tl.id desc ";
    }

    var query = connection.query(`
                                Select 
                                CONCAT(IF(tm.trade_type='Sell', '${cm_cfg.sellOrderPrefix}','${cm_cfg.buyOrderPrefix}'), tm.trade_id) AS transactionid,tm.customer_id, 
                                tm.status, 
                                IF(tm.status='Not Executed'OR (tm. trade_type='Buy'AND tm.status='Fully Executed'),tm.total_amount,getCustomerTotalTransation(tm.trade_id, tm.trade_type))as total_amount,IFNULL(tm.avg_price,0.00000000) as price, 
                                tm.platform_fee as platform_fee,tm.platform_value, tm.created_at, tm.pair_id,tm.avg_price, tm.trade_id, pair_master.from as pair_idfrom,pair_master.to as pair_idto, 
                                tm.type, tm.trade_type,IF(tm.status='Not Executed' OR (tm. trade_type='Sell'AND tm.status='Fully Executed'),tm.quantity, getCustomerTotalQuantity(tm.trade_id, tm.trade_type)) as quantity 
                                from transaction_master AS tm inner join pair_master ON pair_master.id = tm.pair_id where tm.status!= 'Executed' and tm.customer_id ='` + id + "'" + searchQuery + "order by tm.created_at desc " + LIMIT + "",

        function(error, data) {
            if (error) {
                res.json({ "success": false, "message": "error", error });
            } else {
                // console.log(query.sql);
                var q1 = connection.query("SELECT count(*) as count FROM  transaction_master AS tm inner join pair_master ON pair_master.id = tm.pair_id where tm.customer_id= " + id + searchQuery, function(error, data1) {

                    if (error) {
                        res.json({ "success": false, "message": "error", error });
                    } else {
                        var result = { 'totalRecords': data1, 'records': data };
                        res.json({ "success": true, "message": "Transation List", result });
                    }
                });

            }
        })


}

exports.getCustomerWalletReport = (req, res) => {

    var id = req.params.customer_id;

    connection.query("SELECT total_amount, currency_code FROM customer_wallet where customer_id=" + id, function(error, walletdata) {

        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else {
            res.json({ "success": true, "message": "User Wallet  Amount List", walletdata });
        }
    })

}

exports.getUserWithdrawRequestList = function(req, res) {
    var id = req.body.id;
    var customer_name = req.body.customer_name;
    var currency_code = req.body.currency_code;
    var exportAs = req.body.exportAs;
    var amount = req.body.amount;
    var status = req.body.status;
    var comment = req.body.comment;
    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var LIMIT = '';

    var searchQuery = '';
    if (typeof id !== 'undefined' && id !== null) {
        searchQuery += " AND cw.customer_id = " + id;
    }
    if (typeof customer_name !== 'undefined' && customer_name) {
        searchQuery += " AND c.fullname LIKE '%" + customer_name + "%' ";
    }
    if (typeof currency_code !== '' && currency_code) {
        searchQuery += " AND cw.currency_code LIKE '%" + currency_code + "%' ";
    }
    if (typeof amount !== 'undefined' && amount) {
        searchQuery += " AND cw.amount LIKE '%" + amount + "%' ";

    }
    if (typeof status !== 'undefined' && status !== null) {
        searchQuery += " AND cw.status = " + status;
    }
    if (typeof comment !== 'undefined' && comment) {
        searchQuery += " AND cw.comment LIKE '%" + comment + "%'";
    }
    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + offset + ", " + limit;
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY cw.id DESC";
    }

    var query = connection.query("SELECT Y.*, @count:=@count+1 AS serial_number  FROM ( SELECT cw.*,u.id as user_id, uca.crypto_address as btc_address,c.fullname as customer_name,u.email ,(cw.amount+cw.platform_value) as refund_amount FROM customer_withdraw cw JOIN customer c ON c.id = cw.customer_id JOIN user u ON u.type_id = cw.customer_id LEFT JOIN user_crypto_address uca ON uca.user_id = u.id AND uca.crypto_type = 'BTC' WHERE 1=1" + searchQuery + LIMIT + " ) AS Y,  (SELECT @count:=" + offset + ") AS X", function(error, data) {
        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else {
            connection.query("SELECT count(*) as count FROM customer_withdraw cw JOIN customer c ON c.id = cw.customer_id WHERE cw.receiverAddress != '' " + searchQuery, function(error, data1) {
                var result = { 'totalRecords': data1, 'records': data };
                res.json({ "success": true, "message": "Withdraw Request List", result });
            });
        }
    })
}

exports.blockMultiple = function (req, res) {

    // console.log("req.bodies", req.body.id);
   // return;

    var id = req.body.id;
    var updateData = {
        'status': "0"
        
    }

    connection.query("UPDATE customer SET ? WHERE id in (?)", [updateData, id], function (error, result) {
        if (error) {
            res.json({ success: false, message: "error", error });
        } else {
            console.log("multipleBlock",result)
            res.json({ success: true, message: "Customer Blocked Successfully", result });
        }
    });
}

exports.unblockMultiple = function (req, res) {
    // console.log("req.boddddies", req.body.id);
    var id = req.body.id;
    var updateData = {
        'status': "1",
        'login_counter': 0
        
    }

    connection.query("UPDATE customer SET ? WHERE id in (?)", [updateData, id], function (error, result) {
        if (error) {
            res.json({ success: false, message: "error", error });
        } else {
            console.log("multipleUnblock",result);
            res.json({ success: true, message: "Customer Unblocked Successfully", result });
        }
    });
}

exports.blockCustomer = function (req, res) {

    var id = req.params.id;
    var updateData = {
        'status': "0"
        
    }

    connection.query("UPDATE customer SET ? WHERE id = ?", [updateData, id], function (error, result) {
        if (error) {
            res.json({ success: false, message: "error", error });
        } else {
            res.json({ success: true, message: "Customer Blocked Successfully", result });
        }
    });
}

exports.unblockCustomer = function (req, res) {

    var id = req.params.id;
    var updateData = {
        'status': "1",
        'login_counter': 0
   }
    connection.query("UPDATE customer SET ? WHERE id = ?", [updateData, id], function (error, result) {
        if (error) {
            res.json({ success: false, message: "error", error });
        } else {
            res.json({ success: true, message: "Customer Unblocked Successfully", result });
        }
    });
}