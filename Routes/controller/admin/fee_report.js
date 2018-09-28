var config = require('../../../config/config');
var connection = require('../../../config/db');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var mysql = require('mysql')

exports.getAllCryptoFeeDetails = (req, res) => {
    var currency_code = req.body.currency_code;
    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var amount = req.body.amount
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var exportAs = req.body.exportAs;

    var searchQuery = '';
    var LIMIT = '';
    if (typeof amount !== 'undefined' && amount) {
        // searchQuery += " AND Y.amount LIKE '%" + amount + "%' ";
        searchQuery += " AND Y.amount LIKE " + mysql.escape('%' + amount + '%') + " ";
    }
    if (typeof req.body.platform_value !== 'undefined' && req.body.platform_value) {
        //searchQuery += " AND Y.platform_value LIKE '%" + req.body.platform_value + "%' ";
        searchQuery += " AND Y.platform_value LIKE " + mysql.escape('%' + req.body.platform_value + '%') + " ";
    } else {
        searchQuery += " ORDER BY Y.created_at DESC";
    }


    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + mysql.escape(offset) + ", " + mysql.escape(limit);
        //LIMIT = " LIMIT " + offset + ", " + limit;
    }
    // console.log(searchQuery)

    var sql1 = connection.query(`SELECT Y.*, @count:=@count+1 AS serial_number FROM(SELECT CONCAT(IF(tm.trade_type = 'Buy', 'ORDB-', 'ORDS-'), tm.id) AS transactionid, IF(tm.total_amount, tm.total_amount, tm.quantity) as amount, ${mysql.escape(currency_code)} as currency_code,tm.trade_type as operation, tm.platform_fee as platform_fee,IF(tm.platform_value,tm.platform_value,0) as platform_value, tm.created_at, tm.pair_id from transaction_master AS tm JOIN pair_master on pair_master.id = tm.pair_id  where (pair_master.from = ${mysql.escape(currency_code)} and  tm.trade_type='Sell') OR (pair_master.to = ${mysql.escape(currency_code)} and tm.trade_type='Buy')     
        UNION SELECT CONCAT('WITH-',w.id) AS transactionid,w.amount AS amount, w.currency_code as currency_code,  'Withdraw' AS operation,w.platform_fee AS platform_fee,IF(w.platform_value,w.platform_value,0) as platform_value, w.created_at, '' as pair_id FROM customer_withdraw AS w WHERE w.currency_code=${mysql.escape(currency_code)}
        UNION SELECT CONCAT('DEPO-',d.id) AS transactionid,d.amount AS amount, d.currency_code as currency_code, 'Deposit' AS operation,d.platform_fee AS platform_fee,IF(d.platform_value,d.platform_value,0) as platform_value, d.created_at, '' as pair_id FROM customer_deposite AS d  WHERE d.currency_code=${mysql.escape(currency_code)}  
        UNION SELECT CONCAT('ORDB-',b.id) AS transactionid,b.total_price AS amount, ${mysql.escape(currency_code)} as currency_code, 'Buy' AS operation,b.platform_fee AS platform_fee,IF(b.platform_value,b.platform_value,0) as platform_value, b.created_at, b.pair_id FROM buy AS b JOIN pair_master on pair_master.id = b.pair_id WHERE pair_master.to = ${mysql.escape(currency_code)} AND b.status = 'Executed'
        UNION SELECT CONCAT('ORDS-', s.id) AS transactionid, IF(s.total_price, s.total_price, s.quantity) AS amount, ${mysql.escape(currency_code)} as currency_code, 'Sell' AS operation, s.platform_fee AS platform_fee, IF(s.platform_value, s.platform_value, 0) as platform_value, s.created_at, s.pair_id FROM sell As s JOIN pair_master on pair_master.id = s.pair_id WHERE pair_master.from = ${mysql.escape(currency_code)} AND s.status = 'Executed') Y, (SELECT @count:='${offset}')z WHERE 1=1 ` + searchQuery + LIMIT, function(error, data) {
        if (error) {

            res.json({ "success": false, "message": "error", error });
        } else {
            connection.query(`SELECT count(*)as count, @count:=@count+1 AS serial_number FROM(SELECT CONCAT(IF(tm.trade_type = 'Buy', 'ORDB-', 'ORDS-'), tm.id) AS transactionid,IF(tm.total_amount, tm.total_amount, tm.quantity) as amount, ${mysql.escape(currency_code)} as currency_code,tm.trade_type as operation, tm.platform_fee as platform_fee,IF(tm.platform_value,tm.platform_value,0) as platform_value, tm.created_at, tm.pair_id from transaction_master AS tm JOIN pair_master on pair_master.id = tm.pair_id  where (pair_master.from = ${mysql.escape(currency_code)} and  tm.trade_type='Sell') OR (pair_master.to = ${mysql.escape(currency_code)} and tm.trade_type='Buy')     
                UNION SELECT CONCAT('WITH-',w.id) AS transactionid,w.amount AS amount, w.currency_code as currency_code,  'Withdraw' AS operation,w.platform_fee AS platform_fee,IF(w.platform_value,w.platform_value,0) as platform_value, w.created_at, '' as pair_id FROM customer_withdraw AS w WHERE w.currency_code=${mysql.escape(currency_code)}
                UNION SELECT CONCAT('DEPO-',d.id) AS transactionid,d.amount AS amount, d.currency_code as currency_code, 'Deposit' AS operation,d.platform_fee AS platform_fee,IF(d.platform_value,d.platform_value,0) as platform_value, d.created_at, '' as pair_id FROM customer_deposite AS d  WHERE d.currency_code=${mysql.escape(currency_code)}    
                UNION SELECT CONCAT('ORDB-',b.id) AS transactionid,b.total_price AS amount, ${mysql.escape(currency_code)} as currency_code, 'Buy' AS operation,b.platform_fee AS platform_fee,IF(b.platform_value,b.platform_value,0) as platform_value, b.created_at, b.pair_id FROM buy AS b JOIN pair_master on pair_master.id = b.pair_id WHERE pair_master.to = ${mysql.escape(currency_code)} AND b.status = 'Executed'
                UNION SELECT CONCAT('ORDS-', s.id) AS transactionid, IF(s.total_price, s.total_price, s.quantity) AS amount, ${mysql.escape(currency_code)} as currency_code, 'Sell' AS operation, s.platform_fee AS platform_fee, IF(s.platform_value, s.platform_value, 0) as platform_value, s.created_at, s.pair_id FROM sell As s JOIN pair_master on pair_master.id = s.pair_id WHERE pair_master.from = ${mysql.escape(currency_code)} AND s.status = 'Executed') Y, (SELECT @count:='${offset}')z WHERE 1=1 ` + searchQuery + LIMIT, function(error, data1) {
                if (error) {
                    res.json({ "success": false, "message": "error", error });
                } else {
                    var result = { 'totalRecords': data1, 'records': data };
                    res.json({ "success": true, "result": result });
                }

            })
        }
    })

}

exports.getAllFiatFeeDetails = (req, res) => {
    var currency_code = req.body.currency_code;
    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var amount = req.body.amount
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var exportAs = req.body.exportAs;

    var searchQuery = '';
    var LIMIT = '';
    if (typeof amount !== 'undefined' && amount) {
        // searchQuery += " AND Y.amount LIKE '%" + amount + "%' ";
        searchQuery += " AND Y.amount LIKE " + mysql.escape('%' + amount + '%') + " ";
    }
    if (typeof req.body.platform_value !== 'undefined' && req.body.platform_value) {
        //searchQuery += " AND Y.platform_value LIKE '%" + req.body.platform_value + "%' ";
        searchQuery += " AND Y.platform_value LIKE " + mysql.escape('%' + req.body.platform_value + '%') + " ";
    } else {
        searchQuery += " ORDER BY Y.created_at DESC";
    }


    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = " LIMIT " + mysql.escape(offset) + ", " + mysql.escape(limit);
        //LIMIT = " LIMIT " + offset + ", " + limit;
    }

    var sql1 = connection.query(`SELECT Y.*, @count:=@count+1 AS serial_number FROM(SELECT CONCAT(IF(tm.trade_type = 'Buy', 'ORDB-', 'ORDS-'), tm.id) AS transactionid,tm.total_amount as amount, ${mysql.escape(currency_code)} as currency_code,tm.trade_type as operation, tm.platform_fee as platform_fee,IF(tm.platform_value,tm.platform_value,0) as platform_value, tm.created_at, tm.pair_id from transaction_master AS tm JOIN pair_master on pair_master.id = tm.pair_id  where (pair_master.from = ${mysql.escape(currency_code)} and  tm.trade_type='Sell') OR (pair_master.to = ${mysql.escape(currency_code)} and tm.trade_type='Buy')     
            UNION SELECT CONCAT('WITH-',w.id) AS transactionid,w.amount AS amount, w.currency_code as currency_code,  'Withdraw' AS operation,w.platform_fee AS platform_fee,IF(w.platform_value,w.platform_value,0) as platform_value, w.created_at, '' as pair_id FROM customer_withdraw AS w WHERE w.currency_code=${mysql.escape(currency_code)}
            UNION SELECT CONCAT('DEPO-',d.id) AS transactionid,d.amount AS amount, d.currency_code as currency_code, 'Deposit' AS operation,d.platform_fee AS platform_fee,IF(d.platform_value,d.platform_value,0) as platform_value, d.created_at, '' as pair_id FROM customer_deposite AS d  WHERE d.currency_code=${mysql.escape(currency_code)}  
            UNION SELECT CONCAT('ORDB-',b.id) AS transactionid,b.total_price AS amount, ${mysql.escape(currency_code)} as currency_code, 'Buy' AS operation,b.platform_fee AS platform_fee,IF(b.platform_value,b.platform_value,0) as platform_value, b.created_at, b.pair_id FROM buy AS b JOIN pair_master on pair_master.id = b.pair_id WHERE pair_master.to = ${mysql.escape(currency_code)} AND b.status = 'Executed'
            UNION SELECT CONCAT('ORDS-', s.id) AS transactionid, s.total_price AS amount, ${mysql.escape(currency_code)} as currency_code, 'Sell' AS operation, s.platform_fee AS platform_fee, IF(s.platform_value, s.platform_value, 0) as platform_value, s.created_at, s.pair_id FROM sell As s JOIN pair_master on pair_master.id = s.pair_id WHERE pair_master.from = ${mysql.escape(currency_code)} AND s.status = 'Executed') Y, (SELECT @count:='${offset}')z WHERE 1=1 ` + searchQuery + LIMIT, function(error, data) {
        console.log(sql1.sql)
        if (error) {

            res.json({ "success": false, "message": "error", error });
        } else {
            connection.query(`SELECT count(*)as count, @count:=@count+1 AS serial_number FROM(SELECT CONCAT(IF(tm.trade_type = 'Buy', 'ORDB-', 'ORDS-'), tm.id) AS transactionid,tm.total_amount as amount, ${mysql.escape(currency_code)} as currency_code,tm.trade_type as operation, tm.platform_fee as platform_fee,IF(tm.platform_value,tm.platform_value,0) as platform_value, tm.created_at, tm.pair_id from transaction_master AS tm JOIN pair_master on pair_master.id = tm.pair_id  where (pair_master.from = ${mysql.escape(currency_code)} and  tm.trade_type='Sell') OR (pair_master.to = ${mysql.escape(currency_code)} and tm.trade_type='Buy')     
                    UNION SELECT CONCAT('WITH-',w.id) AS transactionid,w.amount AS amount, w.currency_code as currency_code,  'Withdraw' AS operation,w.platform_fee AS platform_fee,IF(w.platform_value,w.platform_value,0) as platform_value, w.created_at, '' as pair_id FROM customer_withdraw AS w WHERE w.currency_code=${mysql.escape(currency_code)}
                    UNION SELECT CONCAT('DEPO-',d.id) AS transactionid,d.amount AS amount, d.currency_code as currency_code, 'Deposit' AS operation,d.platform_fee AS platform_fee,IF(d.platform_value,d.platform_value,0) as platform_value, d.created_at, '' as pair_id FROM customer_deposite AS d  WHERE d.currency_code=${mysql.escape(currency_code)}    
                    UNION SELECT CONCAT('ORDB-',b.id) AS transactionid,b.total_price AS amount, ${mysql.escape(currency_code)} as currency_code, 'Buy' AS operation,b.platform_fee AS platform_fee,IF(b.platform_value,b.platform_value,0) as platform_value, b.created_at, b.pair_id FROM buy AS b JOIN pair_master on pair_master.id = b.pair_id WHERE pair_master.to = ${mysql.escape(currency_code)} AND b.status = 'Executed'
                    UNION SELECT CONCAT('ORDS-', s.id) AS transactionid, s.total_price AS amount, ${mysql.escape(currency_code)} as currency_code, 'Sell' AS operation, s.platform_fee AS platform_fee, IF(s.platform_value, s.platform_value, 0) as platform_value, s.created_at, s.pair_id FROM sell As s JOIN pair_master on pair_master.id = s.pair_id WHERE pair_master.from = ${mysql.escape(currency_code)} AND s.status = 'Executed') Y, (SELECT @count:='${offset}')z WHERE 1=1 ` + searchQuery + LIMIT, function(error, data1) {
                if (error) {
                    res.json({ "success": false, "message": "error", error });
                } else {
                    var result = { 'totalRecords': data1, 'records': data };
                    res.json({ "success": true, "result": result });
                }

            })
        }
    })

}