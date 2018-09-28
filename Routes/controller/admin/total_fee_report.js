var config = require('../../../config/config');
var connection = require('../../../config/db');
var jwt = require('jsonwebtoken');
var moment = require('moment');
let mysql = require('mysql');



exports.getTotalFee= (req, res) => {

    // var currency_code = mysql.escape(req.body.currency_code);
    console.log('test', req.body.currency_code, (mysql.escape(req.body.currency_code)).toString())
    var currency_code = req.body.currency_code;
    var sqlTotal = connection.query(`
    SELECT SUM(platform_value) as totalFee FROM(SELECT IF(tm.platform_value,tm.platform_value,0) as platform_value from transaction_master AS tm JOIN pair_master on  pair_master.id = tm.pair_id where ((pair_master.from = '${currency_code}' and tm.trade_type='Sell') OR (pair_master.to = '${currency_code}' and tm.trade_type='Buy'))
                        UNION All SELECT IF(w.platform_value,w.platform_value,0) as platform_value FROM customer_withdraw AS w WHERE w.currency_code='${currency_code}' AND w.status != '2'
                        UNION All SELECT IF(d.platform_value,d.platform_value,0) as platform_value FROM customer_deposite AS d  WHERE d.currency_code='${currency_code}' AND d.status != '2' 
                        UNION All SELECT IF(b.platform_value,b.platform_value,0) as platform_value FROM buy AS b JOIN pair_master on pair_master.id = b.pair_id WHERE pair_master.to ='${currency_code}' AND b.status = 'Executed'
                        UNION All SELECT IF(s.platform_value,s.platform_value,0) as platform_value FROM sell AS s JOIN pair_master on pair_master.id = s.pair_id WHERE pair_master.from = '${currency_code}' AND s.status = 'Executed') Y`, function(error, totalFeeResule){

                    if(error){
                        console.log(error)
                        res.json({"success": false, "message": "error", error});
                    } else {

                         res.json({"success": true, "data": totalFeeResule});
                    }
        })
}

