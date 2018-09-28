var models = require('../../models');
var moment = require('moment');
var connection = require('../../../config/db');
var fs = require('fs');
var path = require('path');
var sequelize = models.sequelize;
const Op = sequelize.Op;
const Transaction = models.transaction;
const dailyTradeLog = models.daily_trade_log;
const PairMaster = models.pair_master;
const CurrencyMaster = models.currency_master;

exports.updateDailyTradeLog = function (req, res) {

    var cron_date = moment(new Date()).add(-1, 'days').format('YYYY-MM-DD');
    var created_at = req.query.date == undefined ? cron_date : req.query.date;

    getDateWiseLog(created_at).then(() => {
        res.json({
            success: true,
            message: "Trade Logged for " + cron_date
        })
    })
};

exports.updateDailyTradeLogTillToday = function (req, res) {

    dailyTradeLog.destroy({
        where: {},
        truncate: true
    });

    Transaction.findOne({
        limit: 1,
        raw: true,
        attributes: [
            [sequelize.fn('DATE', sequelize.col('created_at')), 'date_traded'],
        ],
        group: [
            [sequelize.fn('DATE', sequelize.col('created_at'))]
        ]
    }).then(function (result) {
        if (result !== null) {
            var start_date = result.date_traded;
            var end_date = moment(new Date()).format('YYYY-MM-DD');
            // start_date = "2018-05-10"
            // end_date = '2018-02-27';
            var dateArr = [];
            while (start_date < end_date) {
                dateArr.push(start_date);
                start_date = moment(start_date).add(+1, 'days').format('YYYY-MM-DD');
            }

            let chain = Promise.resolve();
            dateArr.forEach(date_trade => {
                chain = chain.then(() => {
                    return getDateWiseLog(date_trade);
                });
            });
            chain.then(() => {
                res.json({
                    status: 'success',
                    'message': 'Data Inserted'
                });
            })
        } else {
            res.json({
                'success': true,
                data: 'No Trade Yet'
            });
        }
    });
};

function getDateWiseLog(created_at_trade) {
    return new Promise((resolve, reject) => {
        sequelize.query(`SELECT COUNT(created_at) as count 
                        FROM transaction 
                        WHERE DATE(created_at)= '${created_at_trade}' `, {
            type: sequelize.QueryTypes.SELECT
        }).then(data => {
            if (data[0].count > 0) {
                return sequelize.query(`SELECT  pair_id, 
            '${created_at_trade}' as date_traded,
            MIN(price) as low,
            MAX(price) as high, 
            SUM(quantity) AS volume,
            SUBSTRING_INDEX(GROUP_CONCAT(price ORDER BY id asc), ',', 1 ) as first_open, 
            SUBSTRING_INDEX(GROUP_CONCAT(price ORDER BY id desc), ',', 1 ) as last_close  
            FROM transaction 
            WHERE trade_type='Buy' 
            AND DATE(created_at)= '${created_at_trade}' 
            GROUP BY pair_id`, {
                    type: sequelize.QueryTypes.SELECT
                }).then(result => {
                    let batch_data = [];
                    var foundPairs = [];
                    if (result.length > 0) {

                        foundPairs = result.map(function (elem) {
                            return elem.pair_id;
                        })

                        getPrevDateTradeLastClose(foundPairs, created_at_trade)
                            .then(lastClose => {
                                result.forEach((element, i) => {
                                    var data = {};
                                    data['pair_id'] = element.pair_id;
                                    data['date_traded'] = element.date_traded;
                                    data['low'] = element.low;
                                    data['high'] = element.high;
                                    data['first_open'] = lastClose[element.pair_id];
                                    data['last_close'] = element.last_close;
                                    data['volume'] = element.volume;
                                    data['created_at'] = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                                    batch_data.push(data);
                                });
                                return batch_data;
                            }).then((batch_data) => {
                                dailyTradeLog.bulkCreate(batch_data, {})
                            }).then(() => {
                                return getAllCurrencyPairs(foundPairs);
                            }).then((pairs) => {
                                if (pairs.length > 0) {
                                    getPrevDateTradeLog(pairs, created_at_trade).then(() => {
                                        // console.log('sdd', created_at_trade);
                                        resolve();
                                    })

                                } else {
                                    // console.log(created_at_trade);
                                    resolve();
                                }
                            })
                    }
                })
            } else {
                getAllCurrencyPairs().then((pairs) => {
                    return getPrevDateTradeLog(pairs, created_at_trade);
                }).then(() => {
                    resolve();
                })
            }
        })
    });
}


function getPrevDateTradeLastClose(pair_ids, date_trade) {
    var prev_date_trade = moment(date_trade).add(-1, 'days').format('YYYY-MM-DD');
    var dataArr = [];
    return dailyTradeLog.findAll({
        raw: true,
        where: {
            date_traded: new Date(prev_date_trade),
            pair_id: {
                [Op.or]: pair_ids
            }
        }
    }).then(result => {
        // console.log(result);
        var newPairIdArr = [];
        var pairIdArr = [];
        if (result.length > 0) {
            pairIdArr = result.map(elem => {
                return elem.pair_id;
            });
            pair_ids.forEach(val => {
                if (pairIdArr.indexOf(val) < 0) {
                    newPairIdArr.push(val);
                }
            });
            result.forEach(elem => {
                var newArr = {};
                newArr['pair_id'] = elem.pair_id;
                newArr['last_close'] = elem.last_close;
                dataArr.push(newArr);
            });
            if (newPairIdArr.length > 0) {
                newPairIdArr.forEach(val => {
                    var newArr = {};
                    newArr['pair_id'] = val;
                    newArr['last_close'] = 0;
                    dataArr.push(newArr);
                })
            }
        } else {
            if (pair_ids.length > 0) {
                pair_ids.forEach(val => {
                    var newArr = {};
                    newArr['pair_id'] = val;
                    newArr['last_close'] = 0;
                    dataArr.push(newArr);
                })
            }
        }
        var newDataArr = {};
        dataArr.forEach(function (elem) {
            newDataArr[elem.pair_id] = elem.last_close;
        })
        return newDataArr;
    })
}

function getPrevDateTradeLog(pair_ids, date_trade) {
    var prev_date_trade = moment(date_trade).add(-1, 'days').format('YYYY-MM-DD');
    var dataArr = [];
    return dailyTradeLog.findAll({
        raw: true,
        where: {
            date_traded: new Date(prev_date_trade),
            pair_id: {
                [Op.or]: pair_ids
            }
        }
    }).then(function (result) {
        // console.log('dailyTradeLog', prev_date_trade, result)
        var newPairIdArr = [];
        var pairIdArr = [];
        if (result.length > 0) {
            pairIdArr = result.map(elem => {
                return elem.pair_id;
            });
            pair_ids.forEach(val => {
                if (pairIdArr.indexOf(val) < 0) {
                    newPairIdArr.push(val);
                }
            });
            result.forEach(elem => {
                var newArr = {};
                newArr['pair_id'] = elem.pair_id;
                newArr['date_traded'] = date_trade;
                newArr['low'] = elem.last_close;
                newArr['high'] = elem.last_close;
                newArr['first_open'] = elem.last_close;
                newArr['last_close'] = elem.last_close;
                newArr['volume'] = 0;
                newArr['created_at'] = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                dataArr.push(newArr);
            });
            if (newPairIdArr.length > 0) {
                newPairIdArr.forEach(val => {
                    var newArr = {};
                    newArr['pair_id'] = val;
                    newArr['date_traded'] = date_trade;
                    newArr['low'] = 0;
                    newArr['high'] = 0;
                    newArr['first_open'] = 0;
                    newArr['last_close'] = 0;
                    newArr['volume'] = 0;
                    newArr['created_at'] = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                    dataArr.push(newArr);
                })
            }
        } else {
            if (pair_ids.length > 0) {
                pair_ids.forEach(val => {
                    var newArr = {};
                    newArr['pair_id'] = val;
                    newArr['date_traded'] = date_trade;
                    newArr['low'] = 0;
                    newArr['high'] = 0;
                    newArr['first_open'] = 0;
                    newArr['last_close'] = 0;
                    newArr['volume'] = 0;
                    newArr['created_at'] = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                    dataArr.push(newArr);
                })
            }
        }
        // console.log('dailyTradeLogbulkCreate', date_trade, dataArr)
        return dataArr;
    }).then(dataArr => {
        return dailyTradeLog.bulkCreate(dataArr, {
            fields: ["pair_id", "date_traded", "low", "high", "volume", "first_open", "last_close"],
            updateOnDuplicate: true
        });
    })
}

function getAllCurrencyPairs(pair_ids = []) {
    return new Promise(function (resolve, reject) {
        var whereQuery = '';
        if (pair_ids.length > 0) {
            whereQuery = ' AND pm.id NOT IN (' + pair_ids.join() + ')';
        }
        sequelize.query("SELECT pm.id, pm.from,pm.to FROM `pair_master` pm JOIN `currency_master` cm ON pm.from = cm.currency_code JOIN `currency_master` cm2 ON pm.to = cm2.currency_code WHERE pm.status != '2'" + whereQuery, {
                type: sequelize.QueryTypes.SELECT
            })
            .then(result => {
                var pairIds = {};
                pairIds = result.map(function (element) {
                    return element.id;
                })
                resolve(pairIds);
            })
    })
}

// exports.updateTradingViewPairsJson = function (req, res) {
//     PairMaster.hasOne(CurrencyMaster,{targetKey:'currency_code',foreignKey: 'currency_code'})
//     PairMaster.findAll({
//         raw: true,
//         attributes: ["id", "from", "to"],
//         include: [{
//             model: CurrencyMaster,
//             where: {
//                 status: 1
//             }
//         }]
//     }).then(function (result) {
//         res.json(result);
//     })
// }

exports.updateTradingViewPairsJson = function (req, res) {
    let sqlQuery = "SELECT CONCAT(pm.from,'/',pm.to) AS name,CONCAT(pm.from,'/',pm.to) AS description, 'Fuleex' as exchange, 'instrument' as type FROM `pair_master` pm JOIN `currency_master` cm ON pm.from = cm.currency_code JOIN `currency_master` cm2 ON pm.to = cm2.currency_code WHERE cm.type = '1' AND cm.status='1' AND cm2.status='1' AND pm.status = '1'";
    connection.query(sqlQuery, function (err, data) {
        var file_path = path.resolve('config/tradingview.json');
        data = JSON.stringify(data);
        fs.writeFile(file_path, data, function (err, data) {
            if (err) {
                res.json({
                    'error': err
                });
            } else {
                res.json({
                    'success': true,
                    'message': 'Trading View Pair JSON Updated'
                })
            }
        });
    })
}