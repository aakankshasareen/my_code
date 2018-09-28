const connection = require('../../../config/db');
const cm_cfg = require('../../../config/common_config')
var QRCode = require('qrcode')
var mysql = require('mysql');

var request = require('request')
exports.getPortfolio = (req, res) => {

  var email = req.decoded.email
  let sql = `SELECT * FROM customer WHERE email = ${mysql.escape(email)}`
  
  let value_in_currency_code = req.query.incurrency || 'USD'

  connection.query(sql, function (error, data) {
    if (error) {
      res.json({ success: false, message: "error", error })
    } else if (!data[0]) {
      res.json({ success: false, message: "Customer not found" })
    } else {
/*      let sql1 = `SELECT w.currency_code, w.total_amount AS balance, (w.total_amount * IFNULL(getTradePairPrice(pm.id), 0)) as wallet_value, IFNULL(getTradePairPrice(pm.id), 0) as last_trade_price, CONCAT('images/currencyimage/',cm.currency_icon) as icon_path,cm.currency_name as name, cm.type as Cryptotype FROM (customer_wallet w JOIN currency_master cm on cm.currency_code = w.currency_code) JOIN pair_master pm on w.currency_code = pm.from where w.customer_id = ${data[0].id} and cm.type = 1 and cm.status =1 and pm.to = '${value_in_currency_code}'`
*/
// IFNULL(getTradePairPrice(pm.id),0) AS last_trade_price

let sql1 = `Select 
w.currency_code, w.total_amount AS balance, CONCAT('images/currencyimage/',cm.currency_icon) as icon_path, cm.currency_name as name, cm.type as Cryptotype,
IFNULL((SELECT IFNULL(getTradePairPrice(pair_master.id),0) AS last_trade_price FROM pair_master where pair_master.from=w.currency_code and pair_master.to='USD'),0) as last_trade
from customer_wallet as w
JOIN currency_master cm on cm.currency_code = w.currency_code
WHERE w.customer_id = ${mysql.escape(data[0].id)} AND cm.status =1`
  
let priceInUSD;
let objectArray = [];
let totalBal=0;
let fiatTotalBal = 0;
let cryptoTotalBal = 0;
/*function getValueInUSD(result, i, cryptoName){

  return new Promise((res, rej)=>{
        request("https://api.coinmarketcap.com/v1/ticker/"+cryptoName+"/?convert=USD", function(error, response, body) {
          var priceInUSD
          try{
            priceInUSD =JSON.parse(body);

          } catch(e){
            return res(0)
          }

          if(priceInUSD.length)
          {

          priceInUSD = priceInUSD[0].price_usd
          res(parseFloat(priceInUSD));
          }
          else
            res(result[i].last_trade);
    });
  })  
}*/


      connection.query(sql1, [value_in_currency_code, value_in_currency_code, data[0].id, data[0].id, value_in_currency_code], function (error, result) {
        if (error) {
          res.json({ success: false, message: "error", error })
        } else {
          for (let i = 0; i < result.length; i++) {

            // let p = getValueInUSD(result, i, result[i].name.toLowerCase()).then(()=>{
              a = result[i].last_trade;
              totalBal+=parseFloat(a*result[i].balance);
            if(result[i].Cryptotype==0)
              fiatTotalBal+=parseFloat(a*result[i].balance);
            if(result[i].Cryptotype==1)
              cryptoTotalBal+=parseFloat(a*result[i].balance);
              result[i].priceInUSD = a;
            // })
            // objectArray.push(p)
            if(i==result.length-1)
            {
              result[0].totalBal = totalBal;
              result[0].fiatTotalBal = fiatTotalBal;
              result[0].cryptoTotalBal = cryptoTotalBal;
              res.json({ success: true, data: result })              
            }

          }
          // Promise.all(objectArray).then(()=>{
          // })
        }
      })
    }
  })
}

exports.tradeHistory = (req, res) => {
  let pairId = Number(req.params.pairId)
  if (!pairId)
    return res.json({ success: false, message: 'Invalid parameters' })
  connection.query(`SELECT price, quantity, created_at as time FROM transaction WHERE pair_id = ? and trade_type='Buy' ORDER BY id DESC LIMIT 20`, [pairId], (err, result) => {
    if (err)
      return res.json({ success: false, message: 'Error', error: cm_cfg.errorFn(err) })
    res.json({ success: true, message: 'Trade History', data: result })
  })
}


exports.walletHistory = (req, res) => {
  let limit = Number(req.query.limit) || 30
  let email = req.decoded.email

  connection.query(`
    SELECT btc_value, inr_value, created_at
    FROM wallet_history
    where customer_id = (SELECT id FROM customer where email=${mysql.escape(email)})
    ORDER BY created_at ASC,id desc
    limit ${limit}`, (err, result) => {
      if (err)
        return res.json({ success: false, message: 'Error', error: cm_cfg.errorFn(err) })
      res.json({ success: true, message: 'Wallet History', result })
    })
}

exports.getPortfolioDetails = (req, res) => {
  var email = req.decoded.email
  let sql = `SELECT * FROM customer WHERE email = ${mysql.escape(email)}`
  let value_in_currency_code = req.query.incurrency || 'USD'

  connection.query(sql, function (error, data) {
    if (error) {
      res.json({ success: false, message: "error", error })
    } else if (!data[0]) {
      res.json({ success: false, message: "Customer not found" })
    } else {
      let sql1 = `
        SELECT w.currency_code, w.total_amount AS balance, 
        (SELECT sum(total_price) as UnitsInOrder FROM buy where 
        (status ='Executed' or status ='partially Executed') and customer_id = ${mysql.escape(data[0].id)})
         UnitsInOrder ,0 as last_trade_price,  CONCAT('images/currencyimage/',cm.currency_icon) 
         as icon_path,cm.currency_name as name, cm.type as Cryptotype 
         FROM customer_wallet w JOIN currency_master cm on cm.currency_code ='${value_in_currency_code}' and
        w.currency_code='${value_in_currency_code}' where w.customer_id = ${mysql.escape(data[0].id)}
       UNION ALL
       SELECT w.currency_code, 
        w.total_amount AS balance,
        (select sum(quantity) as UnitsInOrder FROM sell where (status='Executed' or status ='partially Executed')and customer_id=${mysql.escape(data[0].id)} and pair_id=pm.id) UnitsInOrder , 
        IFNULL(getTradePairPrice(pm.id), 0) as last_trade_price, 
        CONCAT('images/currencyimage/',cm.currency_icon) as icon_path,
        cm.currency_name as name, 
        cm.type as Cryptotype 
        FROM (customer_wallet w JOIN currency_master cm on cm.currency_code = w.currency_code) JOIN pair_master pm on w.currency_code = cm.currency_code where w.customer_id = ${mysql.escape(data[0].id)} and cm.type = 1 and cm.status =1`

      //        FROM (customer_wallet w JOIN currency_master cm on cm.currency_code = w.currency_code) JOIN pair_master pm on w.currency_code = pm.from where w.customer_id = ${data[0].id} and cm.type = 1 and cm.status =1`
      //  and pm.to = '${value_in_currency_code}'

      connection.query(sql1, function (error, result) {
        if (error) {
          res.json({ success: false, message: "error", error })
        } else {
          // if(data[0].kyc_status != 2){
          //     result.forEach((element, index)=>{
          //       result[index].balance = 0
          //       result[index].wallet_value = 0
          //     })
          //   } else {
          for (let i = 0; i < result.length; i++) {
            if (!result[i].last_trade_price) {
              result[i].UnitsInOrder = result[i].Cryptotype != 0 ? result[i].balance : result[i].UnitsInOrder;
            }
            else if (result[i].Cryptotype == 0) {
              result[i].UnitsInOrder = result[i].UnitsInOrder;
            }
          }
          let final_arr = [], result_final = [], trace_index = 0, fulx_obj = {}, fulx_bool = false, temp = {};
          result.forEach((elem, index) => {
            if (final_arr.indexOf(elem.currency_code) < 0) {
              final_arr.push(elem.currency_code);
              result_final.push(elem);
              if (elem.currency_code === "FULX") {
                fulx_bool = true;
                trace_index = result_final.length - 1;
                fulx_obj = elem;
              }
            }
          })
          if (fulx_bool) {
            result_final[trace_index] = result_final[0];
            result_final[0] = fulx_obj;
          }
          //}//
          res.json({ success: true, data: result_final })
        }
      })
    }
  })
}

exports.getQRCodeByCurrency = function (req, res) {

  var crypto_type = req.params.currency;
 
  let sql = "SELECT email,id FROM user WHERE email =" + mysql.escape(req.decoded.email) + "";
  connection.query(sql, function (error, data) {
    if (error) {
      res.json({ success: false, message: "error", error })
    } else if (data[0] == null || data[0] == undefined) {
      res.json({ success: false, message: "User not found" })
    } else {
      let sql1 = connection.query("SELECT * FROM user_crypto_address WHERE user_id =? AND crypto_type=?", [data[0].id, crypto_type], function (error, dta) {
        if (error) {
          res.json({ success: false, message: "error", error })
        } else if (dta[0] == null || dta[0] == undefined) {
          res.json({ success: false, message: "Address is not created" })
        } else {
          QRCode.toDataURL(dta[0].crypto_address, function (err, url) {
            if (err) {
              res.json({ success: false, message: "error", error })
            } else {
              res.json({ success: true, data: url, address: dta[0].crypto_address })
            }
          })
        }
      })
    }
  })
}
