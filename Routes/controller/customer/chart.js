var models = require('../../models');
var moment = require('moment');
var sequelize = models.sequelize;
const PairMaster = models.pair_master;

exports.getChartData = function (req, res) {

    var from_pair = req.params.from_pair;
    var to_pair = req.params.to_pair;

    PairMaster.find({
        attributes: ["id"],
        raw: true,
        where: [{
            "from": from_pair,
            "to": to_pair
        }]
    }).then(function (result) {
        console.log(result.id);
        var pair_id = result.id;
        var resolution = req.params.resolution;
        var from_date = req.params.from;
        var to_date = req.params.to;
        var new_resolution = '';

        switch (resolution) {
            case 'D':
                new_resolution = "day";
                sequelize.query(`SELECT 
            DATE(dtl.date_traded) as day,     
            MIN(dtl.low) as low,
            MAX(dtl.high) as high, 
            SUM(dtl.volume) AS volume,
            SUBSTRING_INDEX(GROUP_CONCAT(dtl.first_open ORDER BY dtl.id asc), ',', 1 ) as first_open, 
            SUBSTRING_INDEX(GROUP_CONCAT(dtl.last_close ORDER BY dtl.id desc), ',', 1 ) as last_close  
             FROM daily_trade_log dtl
             JOIN pair_master pm ON pm.id = dtl.pair_id 
             WHERE DATE(dtl.date_traded) 
             BETWEEN '${from_date}' AND '${to_date}' 
             AND pm.id = '${pair_id}'
             GROUP BY ${new_resolution}`).then(data => {
                    res.json({
                        success: 'true',
                        message: "Daily Data",
                        data: data[0]
                    })
                }).catch((err) => {
                    console.log(err);
                    res.json({
                        success: 'false',
                        error: err
                    })
                })
                break;
            case 'W':
                new_resolution = "week";

                sequelize.query(`SELECT         
            WEEK(dtl.date_traded) as week,      
            MIN(dtl.low) as low,
            MAX(dtl.high) as high, 
            SUM(dtl.volume) AS volume,
            SUBSTRING_INDEX(GROUP_CONCAT(dtl.first_open ORDER BY dtl.id asc), ',', 1 ) as first_open, 
            SUBSTRING_INDEX(GROUP_CONCAT(dtl.last_close ORDER BY dtl.id desc), ',', 1 ) as last_close  
             FROM daily_trade_log dtl
             JOIN pair_master pm ON pm.id = '${pair_id}'
             WHERE DATE(dtl.date_traded) 
             BETWEEN '${from_date}' AND '${to_date}' 
             AND dtl.pair_id 
             GROUP BY ${new_resolution}`).then(data => {
                    res.json({
                        success: 'true',
                        message: "Weekly Data",
                        data: data[0]
                    })
                }).catch((err) => {
                    console.log(err);
                    res.json({
                        success: 'false',
                        error: err
                    })
                });
                break;
            case 'M':

                new_resolution = "month";
                sequelize.query(`SELECT 
           
            MONTH(dtl.date_traded) as month,
            MIN(dtl.low) as low,
            MAX(dtl.high) as high, 
            SUM(dtl.volume) AS volume,
            SUBSTRING_INDEX(GROUP_CONCAT(dtl.first_open ORDER BY dtl.id asc), ',', 1 ) as first_open, 
            SUBSTRING_INDEX(GROUP_CONCAT(dtl.last_close ORDER BY dtl.id desc), ',', 1 ) as last_close  
             FROM daily_trade_log dtl
             JOIN pair_master pm ON pm.id = '${pair_id}'
             WHERE DATE(dtl.date_traded) 
             BETWEEN '${from_date}' AND '${to_date}' 
             AND dtl.pair_id 
             GROUP BY ${new_resolution}`).then(data => {
                    res.json({
                        success: 'true',
                        message: "Monthly Data",
                        data: data[0]
                    })
                }).catch((err) => {
                    console.log(err);
                    res.json({
                        success: 'false',
                        error: err
                    })
                })
                break;
        }
    })
};



// SELECT  pair_id, MIN(price) as low, MAX(price) as high, SUM(`quantity`) AS volume,SUBSTRING_INDEX(GROUP_CONCAT(price ORDER BY id asc), ',', 1 ) as first_open, SUBSTRING_INDEX(GROUP_CONCAT(price ORDER BY id desc), ',', 1 ) as last_close  FROM `transaction` WHERE `trade_type`='Buy' GROUP BY pair_id