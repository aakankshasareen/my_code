const sio = require('socket.io')
const connection = require('./config/db');
const config = require('./config/config');
const mysql = require('mysql');
let io = null;
const jwt = require('jsonwebtoken');
const moment = require('moment');


exports.io = function() {
    return io;
};

let rooms = {}
let isEmitPairDataRun = false

exports.initialize = (server) => {
    io = sio(server);

    //object liveUsers structure as {userId1: liveDevices, userId2: liveDevices}
    //example {1:1, 2:5, 4:2}
    io.liveUsers = {}
    io.totalLiveUsers = 0

    setInterval(()=>{
      if(!isEmitPairDataRun){//checking if emitpairdata function is running
        emitPairData()
      }
    }, 1000)

    io.on('connection', (socket)=> {

      socket.on('pair_id', (id)=>{
        if(Number(id) && socket.pairRoom !== id){
        console.log(id)
          socket.leave(socket.pairRoom)
          socket.pairRoom = id
          socket.join(id)
          rooms[id] = 1
        }
      })

      socket.on('leave_pair_id', ()=>{
        socket.leave(socket.pairRoom)
        delete socket.pairRoom
      })
      socket.on('live_user_token', (token)=>{
        if(!socket.userId)
          jwt.verify(token, config.superSecret, (err, decoded)=>{
            if(!err){
                customer_id = decoded.customer_id;
                socket.userId = decoded.id
                socket.join(customer_id);
                if(io.liveUsers[decoded.id])
                  io.liveUsers[decoded.id]++
                else{
                  io.liveUsers[decoded.id] = 1
                  io.totalLiveUsers++
                }
            }
          })
        })

        socket.on('disconnect', ()=>{
          if(socket.userId){
            if(io.liveUsers[socket.userId]===1){
              delete io.liveUsers[socket.userId]
              io.totalLiveUsers--
            }
            else
              io.liveUsers[socket.userId]--
          }
      })
    })

    io.of('/admin').on('connection', (socket)=>{
      socket.on('pair_id', (id)=>{
        if(Number(id) && socket.pairRoom !== id){
          socket.leave(socket.pairRoom)
          socket.pairRoom = id
          socket.join(id)
          rooms[id] = 1
        }
      })

      socket.on('leave_pair_id', (id)=>{
        socket.leave(socket.pairRoom)
        delete socket.pairRoom
      })
    })
}

// function for emiting pair data to relevant rooms
function emitPairData(){
  isEmitPairDataRun = true // indicating that emitPair data is running
  let promises = []
  let timestamp = Date.now()
  Object.keys(rooms).forEach((id)=>{
    if(io.nsps['/'].adapter.rooms[id] || io.nsps['/admin'].adapter.rooms[id]){
      let promise = getPairData(id);
      let promise2 = tradeHistory(id);
      // let promise3 = _24HrVolume(id);
      // let promise4 = todayLowHigh(id);
      // let promise5 = lastTradePrice(id);
      // let promise6 = yearlyLowHigh(id);
      
      promises.push(promise);
      promises.push(promise2);
      // promises.push(promise3);
      // promises.push(promise4);
      // promises.push(promise5);
      // promises.push(promise6);

      promise.then((data)=>{
        if(data){
          io.of('/').to(id).emit('sell_buy', { obj: data, id});
          io.of('/admin').to(id).emit('sell_buy', {obj: data, id})
        }
      });

      promise2.then((data)=>{
        if(data){
          io.of('/').to(id).emit('trade_history', { obj: data, id});
        }
      });

/*      promise3.then((data)=>{
        if(data){
          io.of('/').to(id).emit('_24_hr_vol', { obj: data, id});
        }
      });

      promise4.then((data)=>{
        if(data){
          io.of('/').to(id).emit('today_low_high', { obj: data, id});
        }
      });

      promise5.then((data)=>{
        if(data){
          io.of('/').to(id).emit('last_trade_price', { data, id});
        }
      });

       promise6.then((data)=>{
        if(data){
          io.of('/').to(id).emit('yearly_low_high', { obj: data, id});
        }
      });*/

    }
  })
  //indicate that the function has returned
  Promise.all(promises).then(()=>{
    isEmitPairDataRun = false
  })
}

function getPairData(id){
  return new Promise((resolve, reject)=>{
    let sql1 = mysql.format(`
      SELECT buy_price, quantity, total_price, ((quantity/totalQuantity)*100) as remaining
      FROM
        (SELECT buy_price, SUM(quantity) as quantity, SUM(total_price) as total_price, SUM(totalQuantity) as totalQuantity
        FROM
          (SELECT
            buy_price,
            quantity,
            total_price,
            IF(buy.status = 'Executed', buy.quantity, (SELECT quantity FROM transaction_master WHERE trade_id=buy.id AND trade_type='Buy')) AS totalQuantity
          FROM buy
          WHERE (status='Executed'or status='Partially Executed') and pair_id =?
          ORDER BY buy_price desc, created_at desc) as s
        GROUP BY buy_price) as r ORDER BY buy_price desc
        LIMIT 15
      `,[id])
    connection.query(sql1, function(err, buyrow) {
        if (err) {
            console.log(err)
            resolve()
        } else {
            let sql2 = mysql.format(`
              SELECT sell_price, quantity, total_price, ((quantity/totalQuantity)*100) as remaining
              FROM
                (SELECT sell_price, SUM(quantity) as quantity, SUM(total_price) as total_price, SUM(totalQuantity) as totalQuantity
                FROM
                  (SELECT
                    sell_price,
                    quantity,
                    total_price,
                    IF(sell.status = 'Executed', sell.quantity, (SELECT quantity FROM transaction_master WHERE trade_id=sell.id AND trade_type='Sell')) AS totalQuantity
                  FROM sell
                  WHERE (status='Executed'or status='Partially Executed') and pair_id =?
                  ORDER BY sell_price desc, created_at desc) as s
                GROUP BY sell_price) as r
                LIMIT 15
              `,[id])
            connection.query(sql2, function(err, sellrow) {

                if (err) {
                    console.log(err)
                    resolve()
                } else {
                    obj = { buy: buyrow, sell: sellrow }
                    resolve(obj)
                }
            })
        }
    })
  })
}

function tradeHistory(id) {

    return new Promise((resolve, reject) => {

     let sql1 = mysql.format(`
     SELECT price, quantity, created_at as time FROM transaction WHERE pair_id = ? and 
     trade_type='Buy' ORDER BY id DESC LIMIT 20`, [id])
        connection.query(sql1, function(err, result) {
            if (err) {
                console.log(err);
                return resolve();
            } 
            resolve({ data: result })
        });
    });

}

function _24HrVolume(id) {

    return new Promise((resolve, reject) => {

        const yesterday = moment().add(-1, 'days').format('YYYY-MM-DD HH:mm:ss');

        let sql1 = mysql.format(`
      SELECT
      IFNULL(SUM(quantity),0) as volume
    FROM transaction
    WHERE
      pair_id = ? AND created_at >='${yesterday}' AND trade_type = 'Buy'`, [id])
        connection.query(sql1, function(err, result) {
            if (err) {
                console.log(err);
                return resolve();
            }
            resolve({ data: result[0] })
        });
    });
}

function todayLowHigh(id) {

    return new Promise((resolve, reject) => {

        const yesterday = moment().add(-1, 'days').format('YYYY-MM-DD HH:mm:ss');

        let sql1 = mysql.format(`
     SELECT
      IFNULL(MIN(price),0) as low,
      IFNULL(MAX(price),0) as high
    FROM transaction
    WHERE pair_id = ? AND created_at >= '${yesterday}'`, [id])
        connection.query(sql1, function(err, result) {
            if (err) {
                console.log(err);
                return resolve();
            }
            resolve({ data: result[0] })
        });
    });
}

function yearlyLowHigh(id) {

    return new Promise((resolve, reject) => {

        const year = moment().add(-52, 'weeks').format('YYYY-MM-DD HH:mm:ss');

        let sql1 = mysql.format(`
     SELECT
      IFNULL(MIN(price),0) as low,
      IFNULL(MAX(price),0) as high
    FROM transaction WHERE pair_id = ? AND created_at >= '${year}'`, [id])
        connection.query(sql1, function(err, result) {
            if (err) {
                console.log(err);
                return resolve();
            }
            resolve({ data: result[0] })
        });
    });
}


function lastTradePrice(id){
  return new Promise((resolve, reject) => {

    let sql = mysql.format("SELECT * FROM pair_master WHERE id =?", [id]);

    connection.query(sql, function(error, data) {
        if (error) {
            console.log(error);
            return resolve();
        } else if (data[0] == null || data[0] == undefined) {
             console.log("Pair not found....", id);
             return resolve();
        } else {

            let order_sql = mysql.format("SELECT price FROM `transaction` WHERE pair_id=? order by id desc limit 1", [id]);
            connection.query(order_sql, function(error, pricedata) {
                if (error) {
                  console.log(error);
                  return resolve();
                } else if (pricedata[0] == null || pricedata == undefined) {
                    resolve({ success: true, message: "Transaction not found", lastprice: Number(0.00).toFixed(2) })
                } else {
                    resolve({ success: true, message: "last price", lastprice: Number(pricedata[0].price).toFixed(2) });
                }
            })
        }
    });
  }); // return Promise 
}