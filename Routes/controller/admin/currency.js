var config = require('../../../config/config');
var connection = require('../../../config/db');
var jwt = require('jsonwebtoken');
var request = require('request');
//var Hashids = require('hashids')
//var hashSalt = new Hashids('Fuleex forget password');
//var useragent = require('useragent');
//var device = require('express-device');
//var nodemailer = require('nodemailer');
//var speakeasy = require('speakeasy');
//var QRCode = require('qrcode');

var path = require('path');
var multer = require('multer');
var fs = require('file-system');

var moment = require('moment');
var mysql = require('mysql')
//var transporter = nodemailer.createTransport({
//    host: 'smtp.zoho.com',
//    port: 465,
//    secure: true, // secure:true for port 465, secure:false for port 587
//    auth: {
//        user: config.email,
//        pass: config.password
//    }
//});
var date = new Date();

var created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './frontend/public/images/currencyimage')
//        cb(null, './images/currencyimage')
    },
    filename: function (req, file, cb) {
        //cb(null, file.fieldname + '-' + Date.now())
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
})

var upload = multer({storage: storage}).single('file')


exports.upload = function (req, res) {

    fs.mkdir("./frontend/public/images/currencyimage/", function (err) {

        upload(req, res, function (error, result) {
            var ext = req.file.originalname.substr(req.file.originalname.lastIndexOf('.') + 1);
            if (ext == 'jpg' || ext == 'jpeg' || ext == 'png' || ext == 'svg') {
                if (error) {
                    res.json({success: false, message: "error in file upload", error: error})
                } else {
                    var result = {'filename': req.file.filename};
                    res.json({success: true, message: "Successfully Uploaded", result})
                }
            } else {
                res.json({success: false, message: "please select jpg, jpeg, png file"})
            }
        });
    });
}

exports.addCurrency = function (req, res) {

    var insertData = {"currency_name": req.body.currency_name,
        "currency_code": req.body.currency_code,
//        "symbol": req.body.currency_symbol,
        "currency_icon": req.body.currency_icon,
        "type": req.body.currency_type,
        "status": req.body.currency_status,
        "created_at": created_at,
        "created_by": req.decoded.id
    };

    var commission_buy_status = 1;
    if (req.body.currency_type == 1) { // For Crypto Currency
        commission_buy_status = 0;
    }
    var commission_status = 1;
    var insertDataCommission = [
        [
            req.body.currency_code,
            "Buy",
            commission_buy_status,
            created_at,
            req.decoded.id
        ]
                ,
        [
            req.body.currency_code,
            "Sell",
            commission_status,
            created_at,
            req.decoded.id
        ]
                ,
        [
            req.body.currency_code,
            "Deposit",
            commission_status,
            created_at,
            req.decoded.id
        ]
                ,
        [
            req.body.currency_code,
            "Withdraw",
            commission_status,
            created_at,
            req.decoded.id
        ]
    ];

    var insertDataTradeLimit = [
        [
            req.body.currency_code,
            "Buy",
            created_at,
            req.decoded.id
        ]
                ,
        [
            req.body.currency_code,
            "Sell",
            created_at,
            req.decoded.id
        ]
                ,
        [
            req.body.currency_code,
            "Deposit",
            created_at,
            req.decoded.id
        ]
                ,
        [
            req.body.currency_code,
            "Withdraw",
            created_at,
            req.decoded.id
        ]
    ];


    var insertCustomerWallet = [];
    var insertMasterCustomerWallet = [];

    // cw = customer wallet table
    var cw_query = connection.query("SELECT id FROM customer WHERE id not IN (SELECT customer_id FROM customer_wallet WHERE currency_code ='" + req.body.currency_code + "')", function (error, result) {
        if (error) {
            res.json({"success": false, "message": 'error', error});
        } else {
            for (var i = 0; i < result.length; i++) {
                var cwArr = [];
                cwArr = [result[i].id, 0, req.body.currency_code, created_at, created_at];
                insertCustomerWallet.push(cwArr);
            }
        }
    });


    if (req.body.currency_type == 1) {
        // cw = master customer wallet table
        var mcw_query = connection.query("SELECT id FROM customer WHERE id not IN (SELECT customer_id FROM master_customer_wallet WHERE currency_code ='" + req.body.currency_code + "')", function (error, result) {
            if (error) {
                res.json({"success": false, "message": 'error', error});
            } else {
                for (var i = 0; i < result.length; i++) {
                    var cwArr = [];
                    cwArr = [result[i].id, 0, req.body.currency_code, created_at, created_at];
                    insertMasterCustomerWallet.push(cwArr);
                }
            }
        });
    }
    var query = connection.query("INSERT INTO currency_master SET ?", insertData, function (error, result) {

        if (error) {
            if (error.code == "ER_DUP_ENTRY") {
                var sqlMessage = error.sqlMessage;
                var arr = sqlMessage.split(" ").map(function (val) {
                    return val;
                });
                var column = arr[5].replace('_', ' ').replace(/'/g, "");
                var custom_error = column + " already exists ";
                res.json({"success": false, "message": custom_error, error});
            } else {
                res.json({"success": false, "message": "error", error});
            }
        } else {
            connection.query("INSERT INTO commission (`currency_code`,`operation`,`status`,`created_at`,`created_by`) VALUES ?", [insertDataCommission], function (error, result) {
                if (error) {
                    res.json({"success": false, "message": "error", error});
                } else {
                    connection.query("INSERT INTO trade_limit (`currency_code`,`operation`,`created_at`,`created_by`) VALUES ?", [insertDataTradeLimit], function (error, result) {
                        if (error) {
                            res.json({"success": false, "message": "error", error});
                        } else {
                            if (insertCustomerWallet.length > 0) {
                                connection.query("INSERT INTO customer_wallet (`customer_id`,`total_amount`,`currency_code`,`created_at`,`updated_at`) VALUES ?", [insertCustomerWallet], function (error, result) {
                                    if (error) {
                                        res.json({"success": false, "message": "error", error});
                                    } else {
                                        if (req.body.currency_type == 1 && insertMasterCustomerWallet.length > 0) {
                                            connection.query("INSERT INTO master_customer_wallet (`customer_id`,`total_amount`,`currency_code`,`created_at`,`updated_at`) VALUES ?", [insertMasterCustomerWallet], function (error, result) {
                                                if (error) {
                                                    res.json({"success": false, "message": "error", error});
                                                } else {
                                                    res.json({"success": true, "message": "Currency Added Successfully", result});
                                                }
                                            });
                                        } else {
                                            res.json({"success": true, "message": "Currency Added Successfully", result});
                                        }
                                    }
                                });
                            } else {
                                res.json({"success": true, "message": "Currency Added Successfully", result});
                            }
                        }
                    });
                }
            });
        }
    });
};


exports.getAllCurrencyList = function (req, res) {

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;

    var currency_name = req.body.currency_name;
    var currency_code = req.body.currency_code;
    var type = req.body.type ;
    var status = req.body.status ;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var order_by = req.body.order_by ;
    var exportAs = req.body.exportAs ;  

    var searchQuery = '';
    var LIMIT = '';

    if (typeof currency_name !== 'undefined' && currency_name) {
        searchQuery += " AND cm.currency_name LIKE " + mysql.escape('%'+currency_name+'%' )+" "
    } 
    if (typeof currency_code !== '' && currency_code) {
        searchQuery += " AND cm.currency_code LIKE " + mysql.escape('%' + currency_code + '%') + " ";
    }
    if (typeof type !== 'undefined' && type !== null) {
        searchQuery += " AND cm.type =" + mysql.escape(type);
    }
    if (typeof status !== 'undefined' && status !== null) {
        searchQuery += " AND cm.status = " + mysql.escape(status);
    }
    if (typeof order_by !== 'undefined' && order_by !== null) {
        searchQuery += " AND cm.order_by = " + mysql.escape(order_by);
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY cm.order_by ASC";
    }
    if (isNaN(offset) || isNaN(limit)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }

    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + mysql.escape(offset) + ", " + mysql.escape(limit);
    }
    var query = connection.query("SELECT cm.*, @count:=@count+1 AS serial_number FROM currency_master cm , (SELECT @count:=" + offset + ") AS X WHERE cm.status != 2 " + searchQuery + LIMIT, function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            var q1 = connection.query("SELECT count(*) as count FROM currency_master cm WHERE cm.status != 2 " + searchQuery, function (error, data1) {
                var result = {'totalRecords': data1, 'records': data};
                res.json({"success": true, "message": "Currency List", result});
            });
        }
    });
};

exports.updateCurrencyPairsOrder = function (req, res) {
    var currency_code = req.body.currency_code;
    var column_name = req.body.column_name;
    var column_value = req.body.column_value;
  
    let allowedColumns = ['order_by'];

    if(!allowedColumns.includes(column_name)){
      res.status(400).send({status: -2, message: 'invalid column'})
    } else {
       var query = connection.query("UPDATE currency_master SET " + column_name + " = " + column_value + ", `updated_at` = '" + created_at + "', `updated_by` = " + req.decoded.id + "  WHERE currency_code ='" + currency_code + "'", [currency_code], function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Order value Updated Successfully", data});
        }
    });
  }
};

exports.updateCurrencyPairOrder = function (req, res) {
    var from = req.body.from;
    var to = req.body.to;
    var column_name = req.body.column_name;
    var column_value = req.body.column_value;
  
    let allowedColumns = ['order_by'];

    if(!allowedColumns.includes(column_name)){
      res.status(400).send({status: -2, message: 'invalid column'})
    } else {
       var query = connection.query("UPDATE pair_master pm SET " + column_name + " = " + column_value + ", pm.updated_at = '" + created_at + "', pm.updated_by = " + req.decoded.id + "  WHERE pm.from ='" + from + "'AND pm.to = '"+to+"'", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Order value Updated Successfully", data});
        }
    });
  }
};


exports.getCurrencyList = function (req, res) {

    var query = connection.query("SELECT * FROM currency_master WHERE status != '2' ORDER BY id DESC ", function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Currency List", result});
        }
    });
};

exports.editCurrency = function (req, res) {
    var param_id = req.params.id;
    if (isNaN(param_id)) {
        res.json({ "success": false, "message": "Pass Valid Parameters" });
        return null;
    }
    var query = connection.query("SELECT * FROM currency_master WHERE id ="+ mysql.escape(param_id), function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Edit Currency", result});
        }
    });
};

exports.updateCurrency = function (req, res) {
    var param_id = req.params.id;

    var updateData = {"currency_name": req.body.currency_name,
        // "currency_code": req.body.currency_code,
//        "type": req.body.currency_type,
        "currency_icon": req.body.currency_icon,
        "status": req.body.currency_status,
        "updated_at": created_at,
        "updated_by": req.decoded.id
    }

    if (req.body.currency_status == 0) {
        var query = connection.query("SELECT `from`,`to`,`default`,`status` FROM pair_master WHERE `default`='true' AND (`from` =? OR `to` =? )", [req.body.currency_code, req.body.currency_code], function (error, result) {
            if (error) {
                res.json({"success": false, "message": "error", error});
            } else {
                if (result.length > 0) {
                    res.json({"success": false, "message": "This Currency has default currency pair, can not be inactive."});
                } else {
                    var q3 = connection.query("SELECT GROUP_CONCAT(id) AS pair_ids FROM pair_master WHERE `default`!='true' AND (`from` = '" + req.body.currency_code + "' OR `to` ='" + req.body.currency_code + "')", function (error, result2) {
                        if (error) {
                            res.json({"success": false, "message": "error", error});
                        } else {
                            if (result2) {
                                var pair_ids = result2[0].pair_ids;
                                var q2 = connection.query("UPDATE pair_master SET status = '0' WHERE id IN (" + pair_ids + ")", function (error, result3) {
                                    if (error) {
                                        res.json({"success": false, "message": "error", error});
                                    } else {
                                        var query = connection.query("UPDATE currency_master SET ? WHERE id = ?", [updateData, param_id], function (error, result) {
                                            if (error) {
                                                if (error.code == "ER_DUP_ENTRY") {
                                                    var sqlMessage = error.sqlMessage;
                                                    var arr = sqlMessage.split(" ").map(function (val) {
                                                        return val;
                                                    });
                                                    var column = arr[5].replace('_', ' ').replace(/'/g, "");
                                                    var custom_error = column + " already exists ";
                                                    res.json({"success": false, "message": custom_error, error});
                                                } else {
                                                    res.json({"success": false, "message": "error", error});
                                                }
                                            } else {
                                                res.json({"success": true, "message": "Currency Updated Successfully", result});
                                            }
                                        });
                                    }
                                })
                            }
                        }
                    })
                }
            }
        });
    } else {
        var query = connection.query("UPDATE currency_master SET ? WHERE id = ?", [updateData, param_id], function (error, result) {
            if (error) {
                res.json({"success": false, "message": "error", error});
            } else {
                res.json({"success": true, "message": "Currency Updated Successfully", result});
            }
        });
    }
};


exports.deleteCurrency = function (req, res) {
    var id = req.params.id;
    var updateData = {
        "status": "2",
        "updated_at": created_at,
        "updated_by": req.decoded.id
    };
    var query = connection.query("UPDATE currency_master SET ? WHERE id = ?", [updateData, id], function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Currency Deleted Successfully", result});
        }
    });
};

exports.getTradeCurrencyPairs = function (req, res) {
let concat = "";
    if(req.params.id)
    {
        concat += " AND pm.from = '"+req.params.id+"' ";
    }

    let sqlQuery="SELECT ((SELECT price FROM transaction WHERE created_at >= NOW() - INTERVAL 1 DAY AND pair_id=pm.id ORDER BY id desc limit 1) - (SELECT price FROM transaction WHERE created_at >= NOW() - INTERVAL 1 DAY AND pair_id=pm.id ORDER BY id asc limit 1)) as changeInPrice, pm.id,IFNULL(getTradePairPrice(pm.id),0) AS last_trade_price, pm.from,pm.to,pm.default,cm.symbol as 'from_symbol',cm2.symbol as 'to_symbol',cm.currency_code as 'from_currency_code',cm2.currency_code as 'to_currency_code', CONCAT('images/currencyimage/',cm.currency_icon) as from_icon_path, CONCAT('images/currencyimage/',cm2.currency_icon) as to_icon_path,IFNULL(getTradePairChanges(pm.id),0) as changes FROM `pair_master` pm JOIN `currency_master` cm ON pm.from = cm.currency_code JOIN `currency_master` cm2 ON pm.to = cm2.currency_code WHERE cm.type = '1' AND cm.status='1' AND cm2.status='1' AND pm.status = '1' "+concat+" ORDER By pm.order_by";

    var query = connection.query(sqlQuery, function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Trade Currency Pairs", result});
        }
    });
};
exports.getTradeCurrencyPairsFrontend = function (req, res) {
    let sqlQuery="SELECT IFNULL((SELECT price FROM transaction WHERE created_at >= NOW() - INTERVAL 1 DAY AND pair_id=pm.id ORDER BY id desc limit 1) - (SELECT price FROM transaction WHERE created_at >= NOW() - INTERVAL 1 DAY AND pair_id=pm.id ORDER BY id asc limit 1),0) as changeInPrice , pm.id,IFNULL(getTradePairPrice(pm.id),0) AS last_trade_price, pm.from,pm.to,pm.default,cm.symbol as 'from_symbol',cm2.symbol as 'to_symbol',cm.currency_code as 'from_currency_code',cm2.currency_code as 'to_currency_code', CONCAT('images/currencyimage/',cm.currency_icon) as from_icon_path, CONCAT('images/currencyimage/',cm2.currency_icon) as to_icon_path,IFNULL(getTradePairChanges(pm.id),0) as changes FROM `pair_master` pm JOIN `currency_master` cm ON pm.from = cm.currency_code JOIN `currency_master` cm2 ON pm.to = cm2.currency_code WHERE cm.type = '1' AND cm.status='1' AND cm2.status='1' AND pm.status = '1' ";
    var query = connection.query(sqlQuery, function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Trade Currency Pairs", result});
        }
    });
};

exports.getAllLastTradePrice = function (req, res) {
    var query = connection.query("SELECT pm.id, pm.from,pm.to,pm.default,cm.symbol as 'from_symbol',cm2.symbol as 'to_symbol',cm.currency_code as 'from_currency_code',cm2.currency_code as 'to_currency_code', CONCAT('images/currencyimage/',cm.currency_icon) as from_icon_path, CONCAT('images/currencyimage/',cm2.currency_icon) as to_icon_path, IFNULL(getTradePairPrice(pm.id),0) as last_trade_price FROM `pair_master` pm JOIN `currency_master` cm ON pm.from = cm.currency_code JOIN `currency_master` cm2 ON pm.to = cm2.currency_code LEFT JOIN (select max(t.price) as price,  t.pair_id from transaction t join (select max(created_at) as created_at, pair_id from transaction group by pair_id) r on t.created_at = r.created_at group by t.pair_id) as last_trade_price on last_trade_price.pair_id = pm.id WHERE cm.type = '1' AND cm.status='1' AND cm2.status='1' AND pm.status = '1' ", function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Trade Currency Pairs", result});
        }
    });
};

exports.getAllTradeCurrencyPairs = function (req, res) {

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;

    var from = req.body.from ;
    var to = req.body.to;
    var status = req.body.status ;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var exportAs = req.body.exportAs;

    var searchQuery = '';
    var LIMIT = '';

    if (isNaN(offset) || isNaN(limit)) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }

    if (typeof from !== 'undefined' && from) {
        searchQuery += " AND pm.from LIKE " + mysql.escape('%' + from + '%') + "";
    }
    if (typeof to !== '' && to) {
        searchQuery += " AND pm.to LIKE " + mysql.escape('%' + to + '%') + "";
    }
    if (typeof status !== 'undefined' && status !== null) {
        searchQuery += " AND pm.status = " + mysql.escape(status);
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } 
    else {
       // searchQuery += " ORDER BY pm.order_by ASC";
    }

    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + mysql.escape(offset) + ", " + mysql.escape(limit);
    }

    var query = connection.query("SELECT @count:=@count+1 AS serial_number, pm.id, pm.status, pm.from, pm.to, pm.default,pm.order_by, cm.type as from_type, cm.symbol as 'from_symbol', cm2.symbol as 'to_symbol', cm.currency_code as 'from_currency_code', cm2.currency_code as 'to_currency_code' FROM `pair_master` pm JOIN `currency_master` cm ON pm.from = cm.currency_code JOIN `currency_master` cm2 ON pm.to = cm2.currency_code , (SELECT @count:=" + offset + ") AS count WHERE cm.type = 1 AND pm.status !=2 AND cm.status != 2 " + searchQuery + LIMIT, function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            var q1 = connection.query("SELECT count(*) as count FROM `pair_master` pm JOIN `currency_master` cm ON pm.from = cm.currency_code JOIN `currency_master` cm2 ON pm.to = cm2.currency_code WHERE cm.type = '1' AND cm.status='1' AND cm2.status='1' AND pm.status !='2' AND cm.status != 2 " + searchQuery, function (error, data1) {
                var result = {'totalRecords': data1, 'records': data};
                res.json({"success": true, "message": "Trade Currency Pairs", result});
            });
        }
    });
};


exports.getActiveCurrencyList = function (req, res) {

    var Where = {};
    var type = req.params.id;
    if (isNaN(type) && type) {
        res.json({ "success": false, "message": "Passed Wrong Parameters" });
        return null;
    }
    if (typeof type == 'undefined' || type == null) {
        var query = "SELECT *, CONCAT('images/currencyimage/','',currency_icon) as currency_icon_path FROM currency_master WHERE status=1 ORDER BY id DESC";
    } else {
        var query = "SELECT *,CONCAT('images/currencyimage/','',currency_icon) as currency_icon_path FROM currency_master WHERE status=1 AND type=? ORDER BY id DESC";
    }
    var query1 = connection.query(query,[type], function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Active Currency List", result});
        }
    });
};


exports.getActiveCurrencyListFiat = function (req, res) {
    
        var Where = {};
        if (typeof type == 'undefined' || type == null) {
            var query = "SELECT *, CONCAT('images/currencyimage/','',currency_icon) as currency_icon_path FROM currency_master WHERE status=1 and type=0 ORDER BY id DESC";
        } else {
            var query = "SELECT *,CONCAT('images/currencyimage/','',currency_icon) as currency_icon_path FROM currency_master WHERE status=1 AND type=0 ORDER BY id DESC";
        }
        var query1 = connection.query(query, function (error, result) {
            if (error) {
                res.json({"success": false, "message": "error", error});
            } else {
                res.json({"success": true, "message": "Active Currency List", result});
            }
        });
    };

exports.getTradeCurrencyPairsById = function (req, res) {
    var id = req.params.id;
    var query = connection.query("SELECT pm.id, pm.from, pm.to, pm.default, cm.symbol as 'from_symbol', cm2.symbol as 'to_symbol', cm.currency_code as 'from_currency_code', cm2.currency_code as 'to_currency_code' FROM `pair_master` pm JOIN `currency_master` cm ON pm.from = cm.currency_code JOIN `currency_master` cm2 ON pm.to = cm2.currency_code WHERE cm.type = '1' AND pm.id=" + id, function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Trade Currency Pairs", result});
        }
    });
};

exports.saveCurrencyPairs = function (req, res) {

    var insertData = [[
            req.body.currency_from,
            req.body.currency_to,
            created_at,
            req.decoded.id
        ], [
            req.body.currency_to,
            req.body.currency_from,
            created_at,
            req.decoded.id
        ]]
        let currencies = [req.body.currency_to, req.body.currency_from]
        connection.query(`SELECT currency_code FROM currency_master where currency_code in ('${req.body.currency_to}', '${req.body.currency_from}')`, function (err, results) {
            if (err)
            res.json({ "success": false, "message": 'Server Error' });
            else if(results && results.length == 2){
                var query = connection.query("INSERT INTO pair_master (`from`,`to`,`created_at`,`created_by`) VALUES ?", [insertData], function (error, result) {
            if (error) {
            if (error.code = 'ER_DUP_ENTRY') {
                res.json({"success": false, "message": error.sqlMessage, error});
            } else {
                res.json({"success": false, "message": 'Error', error});
            }
        } else {
            res.json({"success": true, "message": "Currency Pair Added Successfully", result});
        }
    });
    }
    else{
        res.json({"success": true, "message": "Currencies not exits"});
    }
   })
};

exports.getCurrencyPairs = function (req, res) {

    var query = connection.query("SELECT pm.*,cm.type as from_type FROM pair_master pm LEFT JOIN currency_master cm ON cm.currency_code = pm.from  ORDER BY id DESC ", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Currency Pairs List", data});
        }
    });
}

// exports.getCurrencyPairId = (req, res) =>{
//   let toCurrency = req.query.to
//   let fromCurrency = req.query.from
//   if(!(toCurrency && fromCurrency)){
//     res.json({success: false, message: 'Please send correct parametes'})
//   } else {
//     connection.query('SELECT id as pairId FROM pair_master pm WHERE pm.from = ? AND pm.to = ? LIMIT 1', [fromCurrency, toCurrency], (err, result)=>{
//       if(err){
//         res.json({success: false, message: 'Error', err})
//       } else if(!result.length)
//         res.json({success: false, message: 'Currency pair not found'})
//       else
//         res.json({success: true, messsage:`Pair Id for ${fromCurrency}/${toCurrency}`, data: {pairId: result[0].pairId}})
//     })
//   }
// }

exports.getFilteredCurrencyPairs = (req, res) =>{

  let status = req.query.status
  let toCurrency = req.query.to
  let fromCurrency = req.query.from
  let type = req.query.type
  let filter = []
  if(status)
    filter.push('pm.status = '+ connection.escape(status))
  if(toCurrency)
    filter.push('pm.to = ' + connection.escape(toCurrency))
  if(fromCurrency)
    filter.push('pm.from = ' + connection.escape(fromCurrency))
  if(type)
    filter.push('cm.type = ' + connection.escape(type))

  if(filter.length){
    filter = 'WHERE ' + filter.join(' AND ')
  }

  connection.query(`SELECT pm.id as pairId , pm.from, pm.to, CONCAT('images/currencyimage/',cm.currency_icon) as from_currency_icon_path FROM currency_master cm JOIN pair_master pm ON pm.from = cm.currency_code ${filter}`, (err, result)=>{
    if(err){
      res.json({success: false, message: 'Error', err})
    } else if(!result.length)
      res.json({success: false, message: 'No currency pairs not found'})
    else
      res.json({success: true, messsage:`Filtered Pairs`, data: result})
  })
}


exports.updateDefaultPair = function (req, res) {

    var param_id = req.params.id;
    var updateData = {
        "default": 'true',
        "status": '1',
        "updated_at": created_at,
        "updated_by": req.decoded.id
    };

    var updateAllDefault = connection.query("UPDATE pair_master SET `default`='false' ", function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            connection.query("UPDATE pair_master SET ? WHERE id = ?", [updateData, param_id], function (error, result) {
                if (error) {
                    if (error.code = 'ER_DUP_ENTRY') {
                        res.json({"success": false, "message": error.sqlMessage, error});
                    } else {
                        res.json({"success": false, "message": 'Error', error});
                    }

                } else {
                    res.json({"success": true, "message": "Default Pair Updated Successfully", result});
                }
            });

//            res.json({"success": true, "message": "All Default Pair updated", result});
        }
    });

}

exports.updatePairStatus = function (req, res) {

    var id = req.body.id;
    var updateData = {
        "status": req.body.status,
    };

    var q = connection.query("SELECT cm1.currency_code as from_code, cm2.currency_code as to_code, cm1.status as from_status, cm2.status as to_status FROM pair_master pm RIGHT JOIN currency_master cm1 ON cm1.currency_code = pm.from RIGHT JOIN currency_master cm2 ON cm2.currency_code = pm.to WHERE pm.id = " + id + " AND pm.status=0 AND (cm1.status=0 OR cm2.status=0) ", function (error, result) {
        if (error) {
            res.json({"success": false, "message": 'Error', error});
        } else {
            if (result.length>0) {
                res.json({"success": false, "message": 'Status can not be updated. One of the currency is inactive'});
            } else {
                connection.query("UPDATE pair_master SET ? WHERE id = ?", [updateData, id], function (error, result1) {
                    if (error) {
                        res.json({"success": false, "message": 'Error', error});
                    } else {
                        res.json({"success": true, "message": "Status Updated Successfully"});
                    }
                });
            }
        }
    });
}

exports.deleteCurrencyPair = function (req, res) {
    var id = req.params.id;
    var updateData = {
        "default": "false",
        "status": "2",
        "updated_at": created_at,
        "updated_by": req.decoded.id
    };
    var query = connection.query("UPDATE pair_master SET ? WHERE id = ?", [updateData, id], function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Currency Pair Deleted Successfully", result});
        }
    });
};

exports.getConvertedRate = function (req, res) {

    var id = req.params.id;
    crypt = req.body.currency;
    request("https://www.zebapi.com/api/v1/market/ticker-new/"+crypt+"/inr/", function(error, response, body) {
        res.send(body);
    });
};

exports.getGraphData = function (req, res) {

    var id = req.params.id;
    from = req.body.from_currency;
    to = req.body.to_currency;
    limit = req.body.limit;
    timestamp = new Date().getTime();
    // https://min-api.cryptocompare.com/data/histoday?fsym=BTC&tsym=USD&limit=30&aggregate=3&e=CCCAGG
    request("https://min-api.cryptocompare.com/data/histoday?fsym="+from+"&tsym="+to+"&limit="+limit+"&aggregate=1&toTs="+timestamp, function(error, response, body) {
        res.send(body);
    });
};


exports.getHomeGraphData = function (req, res) {

    var id = req.params.id;
    from = req.body.from_currency;
    to = req.body.to_currency;
    limit = req.body.limit;
    timestamp = new Date().getTime();
    request("https://min-api.cryptocompare.com/data/histoday?fsym="+from+"&tsym="+to+"&limit="+limit+"&aggregate=1&toTs="+timestamp, function(error, response, body) {
        res.send(body);
    });
};



exports.getFilteredCurrencyPairs = (req, res) =>{

  let status = req.query.status
  let toCurrency = req.query.to
  let fromCurrency = req.query.from
  let type = req.query.type
  let filter = []
  if(status)
    filter.push('pm.status = '+ connection.escape(status))
  if(toCurrency)
    filter.push('pm.to = ' + connection.escape(toCurrency))
  if(fromCurrency)
    filter.push('pm.from = ' + connection.escape(fromCurrency))
  if(type)
    filter.push('cm.type = ' + connection.escape(type))

  if(filter.length){
    filter = 'WHERE ' + filter.join(' AND ')
  }

  connection.query(`SELECT pm.id as pairId , pm.from, pm.to, CONCAT('images/currencyimage/',cm.currency_icon) as from_currency_icon_path FROM currency_master cm JOIN pair_master pm ON pm.from = cm.currency_code ${filter}`, (err, result)=>{
    if(err){
      res.json({success: false, message: 'Error', err})
    } else if(!result.length)
      res.json({success: false, message: 'No currency pairs not found'})
    else
      res.json({success: true, messsage:`Filtered Pairs`, data: result})
  })
}

exports.getCurrencyPairId = (req, res) =>{
  let toCurrency = req.query.to
  let fromCurrency = req.query.from
  if(!(toCurrency && fromCurrency)){
    res.json({success: false, message: 'Please send correct parametes'})
  } else {
    connection.query('SELECT id as pairId FROM pair_master pm WHERE pm.from = ? AND pm.to = ? LIMIT 1', [fromCurrency, toCurrency], (err, result)=>{
      if(err){
        res.json({success: false, message: 'Error', err})
      } else if(!result.length)
        res.json({success: false, message: 'Currency pair not found'})
      else
        res.json({success: true, messsage:`Pair Id for ${fromCurrency}/${toCurrency}`, data: {pairId: result[0].pairId}})
    })
  }
}


