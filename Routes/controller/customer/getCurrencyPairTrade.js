const connection = require('../../../config/db');
const cm_cfg = require('../../../config/common_config')
var mysql = require('mysql');


exports.getCurrencyTradePair = (req, res) => {

    let sql = 'SELECT IFNULL(getTradePairPrice(pm.id),0) AS last_trade_price, IFNULL(getTradePairChanges(pm.id),0) as changes, cm.type, pm.from, pm.to, pm.id as pairId, cm.id as currencyId from currency_master cm RIGHT JOIN pair_master pm on cm.currency_code=pm.from and pm.status=1 WHERE cm.STATUS=1 ORDER by pm.order_by'
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (!data[0]) {
            res.json({ success: false, message: "Pairs Not Found" })
        } else {

            let currencies = [];
            let result = [];
            async function f() {

                let a = await data.forEach((e) => {
                    if (!currencies.includes(e.from)) {
                        currencies.push(e.from);
                    }
                })
                result = { currencies, data }
                res.json({ success: true, data: result })
            }
            f()


        }
    })
}


exports.getCurrencyPairSelected = (req, res) => {
    let currency = req.params.id;
    let sql = mysql.format(`SELECT pm.from, pm.to, pm.id as pairId from pair_master pm WHERE pm.status=1 and (pm.from=? Or pm.to=?)`, [currency, currency]);

    // let sql = `SELECT pm.from, pm.to, pm.id as pairId from pair_master pm WHERE pm.status=1 and (pm.from=`+ ${currency} +` Or pm.to=`+${currency}+`), [currency]`;
    connection.query(sql, function(error, result) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (!result[0]) {
            res.json({ success: false, message: "Pairs Not Found" })
        } else {
            res.json({ success: true, data: result })
        }
    })
}







exports.getTradePairsChanges = function(req, res) {
    let concat = "";
    if (req.params.id) {
        concat += " AND pm.from = '" + req.params.id + "' ";
    }

    let sqlQuery = "SELECT ((SELECT price FROM transaction WHERE created_at >= NOW() - INTERVAL 1 DAY AND pair_id=pm.id ORDER BY id desc limit 1) - (SELECT price FROM transaction WHERE created_at >= NOW() - INTERVAL 1 DAY AND pair_id=pm.id ORDER BY id asc limit 1)) as changeInPrice, pm.id,IFNULL(getTradePairPrice(pm.id),0) AS last_trade_price, pm.from,pm.to,pm.default,cm.symbol as 'from_symbol',cm2.symbol as 'to_symbol',cm.currency_code as 'from_currency_code',cm2.currency_code as 'to_currency_code', CONCAT('images/currencyimage/',cm.currency_icon) as from_icon_path, CONCAT('images/currencyimage/',cm2.currency_icon) as to_icon_path,IFNULL(getTradePairChanges(pm.id),0) as changes FROM `pair_master` pm JOIN `currency_master` cm ON pm.from = cm.currency_code JOIN `currency_master` cm2 ON pm.to = cm2.currency_code WHERE cm.type = '1' AND cm.status='1' AND cm2.status='1' AND pm.status = '1' " + concat + " ORDER By pm.order_by";

    var query = connection.query(sqlQuery, function(error, result) {
        if (error) {
            res.json({ "success": false, "message": "error", error });
        } else {
            res.json({ "success": true, "message": "Trade Currency Pairs", result });
        }
    });
};