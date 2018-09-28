var config = require('../../../config/config');
var connection = require('../../../config/db');
var cm_cfg = require('../../../config/common_config');
var moment = require('moment');
var date = new Date();
var created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");

exports.getListOrderBook = function(req, res) {

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var order_num = req.body.order_num;
    var trade_type = req.body.trade_type;
    //var member_id = req.body.member_id;
    var member_name = req.body.member_name;
    var member_email = req.body.member_email;
    var type = req.body.type;
    //var usd_price = req.body.usd_price;
    var quantity = req.body.quantity;
    var status = req.body.status;
    var amount = req.body.btc_amount
    var btc_price = req.body.btc_price
    var orderDirection = req.body.order_direction
    var orderColumn = req.body.order_column
    var order = orderDirection && orderColumn ? `ORDER BY ${orderColumn} ${orderDirection}` : ''
    console.log(order)
    //  var trade_type = req.body.trade_type
    var LIMIT = '';
    var searchQuery = [];

    if (typeof order_num !== 'undefined' && order_num) {
        searchQuery.push(" X.order_num LIKE '%" + order_num + "%' ");
    }
    if (typeof trade_type !== 'undefined' && trade_type) {
        searchQuery.push(" X.trade_type LIKE '%" + trade_type + "%' ");
    }
    if (typeof btc_price !== 'undefined' && btc_price) {
        searchQuery.push(" X.btc_price LIKE '%" + btc_price + "%' ");
    }
    // if (typeof member_id !== 'undefined' && member_id) {
    //     searchQuery.push(" u.member_id LIKE '%" + member_id + "%' ")
    // }

    if (typeof member_name !== '' && member_name) {
        searchQuery.push(" c.fullname LIKE '%" + member_name + "%' ");
    }
    if (typeof member_email !== '' && member_email) {
        searchQuery.push(" c.email LIKE '%" + member_email + "%' ");
    }
    if (typeof type !== 'undefined' && type) {
        searchQuery.push(" X.type LIKE '%" + type + "%' ");

    }
    // if (typeof usd_price !== 'undefined' && usd_price !== null) {
    //     searchQuery.push(" X.usd_price LIKE '%" + usd_price + "%'");
    // }
    if (typeof quantity !== 'undefined' && quantity !== null) {
        searchQuery.push(" X.quantity LIKE '%" + quantity + "%'");
    }
    if (typeof status !== 'undefined' && status) {
        searchQuery.push(" X.status LIKE '=" + status + "%'");
    }
    if (typeof amount !== 'undefined' && amount) {
        searchQuery.push(" X.btc_amount LIKE '%" + amount + "%'");
    }
    if (typeof exportAs == 'undefined' || exportAs !== 1) {
        LIMIT = "LIMIT " + offset + ", " + limit;
    }
    // if (typeof trade_type !== 'undefined' && trade_type) {
    //     searchQuery += " AND  LIKE '%" + trade_type + "%'";
    // }


    if (searchQuery.length) {
        searchQuery = " WHERE " + searchQuery.join(' AND ')
    }


    var sql = connection.format(`SELECT Y.*, @count:=@count+1 AS serial_number FROM(SELECT X.*, c.email AS member_email, c.fullname AS member_name FROM (SELECT CONCAT('ORDB-', buy.id) AS order_num, total_price AS btc_amount, customer_id AS cust_id, 'buy' as trade_type, buy_price AS btc_price, quantity,buy.status, type ,buy.pair_id as pair_id,CONCAT(pair_master.from,'/',pair_master.to) as pair FROM buy  INNER JOIN pair_master ON pair_master.id = buy.pair_id WHERE buy.status IN ('Executed', 'Partially Executed') 
                                        UNION
                                    SELECT CONCAT('ORDS-', sell.id) AS order_num, total_price AS btc_amount, customer_id AS cust_id, 'sell' as trade_type, sell_price AS btc_price, quantity, sell.status, type ,sell.pair_id as pair_id,CONCAT(pair_master.from,'/',pair_master.to) as pair FROM sell  INNER JOIN pair_master
                                    ON pair_master.id = sell.pair_id
                                    WHERE sell.status IN ('Executed', 'Partially Executed')) X JOIN customer c ON c.id = X.cust_id JOIN user u ON u.email = c.email
                                    ${searchQuery})Y,(SELECT @count:=${offset}) AS Z ${order} ${LIMIT}`)
    // console.log(sql)
    connection.query(sql, function(err, data) {
        if (err) {
            //console.log(err)

            res.json({ success: false, message: "Error", error: err });
        } else {
            var q1 = connection.query(`SELECT count(*)as count, @count:=@count+1 AS serial_number FROM(SELECT X.*, c.email AS member_email, c.fullname AS member_name FROM (SELECT CONCAT('ORDB-', buy.id) AS order_num, total_price AS btc_amount, customer_id AS cust_id, 'buy' as trade_type, buy_price AS btc_price, quantity, buy.status, type ,buy.pair_id as pair_id FROM buy  INNER JOIN pair_master
                                  ON pair_master.id = buy.pair_id WHERE buy.status IN ('Executed', 'Partially Executed') 
                UNION
            SELECT CONCAT('ORDS-', sell.id) AS order_num, total_price AS btc_amount, customer_id AS cust_id, 'sell' as trade_type,sell_price AS btc_price, quantity, sell.status, type,sell.pair_id as pair_id FROM sell  INNER JOIN pair_master 
            
            ON pair_master.id = sell.pair_id WHERE sell.status IN ('Executed', 'Partially Executed'))  X JOIN customer c ON c.id = X.cust_id JOIN user u ON u.email = c.email
            ${searchQuery})Y,(SELECT @count:=${offset}) AS Z`, function(error, data1) {
                if (error) {
                    // console.log(error)
                }
                // console.log(data)
                var result = { totalRecords: data1, record: data }

                res.json({ "success": true, "message": "Order book List", result });
            })
        }
    })
    //     var sql = connection.format("SELECT X.*, @count:=@count+1 AS serial_number FROM ((SELECT concat('ORDB-',b.id) as order_num ,'buy' as 'trade_type', b.customer_id as member_id,b.type,b.usd_price as usd_price,b.buy_price as btc_price,b.quantity as quantity,b.total_price as btc_amount,(SELECT cu.email from customer cu where id=member_id)as member_email,(SELECT cu.fullname from customer cu where id=member_id)as member_name,b.status as status from buy b where status='Executed' or status='Partially Executed' ) UNION (SELECT concat('ORDS-',s.id) as order_num, 'sell' as 'trade_type' ,s.customer_id as member_id,s.type as type,s.usd_price as usd_price,s.sell_price as btc_price,s.quantity as quantity,s.total_price as btc_amount,(SELECT cu.email from customer cu where id=member_id)as member_email,(SELECT cu.fullname from customer cu where id=member_id)as member_name,s.status as status from sell s where status='Executed' or status='Partially Executed' )) X,  (SELECT @count:=" + offset + ") AS Y WHERE 1=1 " + searchQuery +' '+  LIMIT)

    //    // console.log(sql)
    //     connection.query(sql,function(err,data){
    //         if(err){
    //             console.log(err)
    //             res.json({success: false, message: "Error", error: err});
    //         }
    //         else{
    //             var q1 = connection.query("SELECT count(*)as count, @count:=@count+1 AS serial_number FROM ((SELECT id as order_num ,'buy' as 'trade_type', customer_id as member_id,type,usd_price as usd_price,buy_price as btc_price,quantity as quantity,total_price as btc_amount,(SELECT email from customer where id=member_id)as member_email,(SELECT fullname from customer where id=member_id)as member_name,status as status from buy where status='Executed' or status='Partially Executed' ) UNION (SELECT id as order_num, 'sell' as 'trade_type' ,customer_id as member_id,type,usd_price as usd_price,sell_price as btc_price,quantity as quantity,total_price as btc_amount,(SELECT email from customer where id=member_id)as member_email,(SELECT fullname from customer where id=member_id)as member_name,status as status from sell where status='Executed' or status='Partially Executed' )) X " + searchQuery  , function (error, data1) {
    //                 if(error){
    //                     console.log(error)
    //                 }

    //             var result ={totalRecords: data1, record:data}
    //             console.log("ewrrwer",result.totalRecords)
    //             res.json({"success": true, "message": "Order book List", result});
    //             })
    //         }
    //     })

}