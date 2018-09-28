const moment = require('moment')
const connection = require('../../../config/db');
const cm_cfg = require('../../../config/common_config');
var mysql = require('mysql');

//24 hour volume
exports._24HourVolume = (req, res) =>{
  const pairId = req.params.pairId
  if(isNaN(pairId))
    return res.json({success: false, message: 'Invalid PairId'})

  const yesterday = moment().add(-1, 'days').format('YYYY-MM-DD HH:mm:ss')

  connection.query(`
    SELECT
      IFNULL(SUM(quantity),0) as volume
    FROM transaction
    WHERE
      pair_id = ${mysql.escape(pairId)} AND created_at >= '${yesterday}' AND trade_type = 'Buy'`, (err, result)=>{
    if(err)
      return res.json({success: false, message: 'Error', error: cm_cfg.errorFn(err)})
    res.json({success: true, message:'24 Hour Volume', data: result[0]})
  })

}

//today low high
exports.todayLowHigh = (req, res) =>{
  const pairId = req.params.pairId
  if(isNaN(pairId))
    return res.json({success: false, message: 'Invalid PairId'})

  const today = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')

  connection.query(`
    SELECT
      IFNULL(MIN(price),0) as low,
      IFNULL(MAX(price),0) as high
    FROM transaction
    WHERE pair_id = ${mysql.escape(pairId)} AND created_at >= '${today}'`, (err, result)=>{
    if(err)
      return res.json({success: false, message: 'Error', error: cm_cfg.errorFn(err)})
    res.json({success: true, message:'Today Low High', data: result[0]})
  })
}

//52 weeks low high
exports.yearlyLowHigh = (req, res) =>{
  const pairId = req.params.pairId
  if(isNaN(pairId))
    return res.json({success: false, message: 'Invalid PairId'})

  const year = moment().add(-52, 'weeks').format('YYYY-MM-DD HH:mm:ss')

  connection.query(`
    SELECT
      IFNULL(MIN(price),0) as low,
      IFNULL(MAX(price),0) as high
    FROM transaction WHERE pair_id = ${mysql.escape(pairId)} AND created_at >= '${year}'`, (err, result)=>{
    if(err)
      return res.json({success: false, message: 'Error', error: cm_cfg.errorFn(err)})
    res.json({success: true, message:'52 Weeks Low High', data: result[0]})
  })
}

exports.histToday = (req, res)=>{
  const from = req.query.fromCurrency
  if(!from || from.length>10)
    return res.json({success: false, message: 'Invalid From Currency'})

  const today = moment().startOf('Day').format('YYYY-MM-DD HH:mm:ss')

  connection.query(`
    SELECT id
    FROM pair_master pm
    WHERE pm.from = ? AND pm.to = 'INR'
    `, [from], (err, result)=>{
      if(err)
        return res.json({success: false, message: 'Error', })
      if(!result.length)
        return res.json({success: false, message: 'Currency not found'})

      let pairId = result[0].id

      connection.query(`
        SELECT IFNULL((
          SELECT price
          FROM transaction
          WHERE created_at<='${today}' AND pair_id='${mysql.escape(pairId)}'
          ORDER BY id DESC
          LIMIT 1
        ), 0) as price, '${today}' as created_at
        UNION
        SELECT price, (TIMESTAMP(d) + INTERVAL h HOUR) AS created_at
        FROM
          (
            SELECT AVG(price) price, DATE(created_at) d, HOUR(created_at) h
            FROM transaction
            WHERE created_at >= '${today}' AND pair_id='${mysql.escape(pairId)}' AND trade_type = 'Buy'
            GROUP BY DATE(created_at), HOUR(created_at)
          ) v
        `, (err, result)=>{
          if(err)
            return res.json({success: false, message: 'Error', error: cm_cfg.errorFn(err)})

          let arr = result.map((ele)=>{
            ele.created_at = moment(ele.created_at)
            return ele
          })

          result = []

          let start = moment(arr[0].created_at)
          const end = moment().startOf('Hour')
          let i = 0
          if(arr[1]&&arr[0].created_at.isSame(arr[1].created_at))
            i = 1
          for(; i<arr.length; i++){
            while(start.isBefore(arr[i].created_at)){
              result.push({time: start.unix(), price: arr[i-1].price})
              start.add(1, 'Hour')
            }
            result.push({time: arr[i].created_at.unix(), price: arr[i].price})
            start.add(1, 'Hour')
          }

          while(start.isSameOrBefore(end)){
            result.push({time: start.unix(), price: arr[arr.length-1].price})
            start.add(1, 'Hour')
          }

          res.json({success: true, message: 'Today Price', data: result})
        })
    })
}

exports.histData = (req, res) =>{
  const from = req.query.fromCurrency
  const fromTS = Number(req.query.fromTS)
  if(!from || from.length>10)
    return res.json({success: false, message: 'Invalid From Currency'})
  if(!fromTS || !moment(fromTS).isValid())
    return res.json({success: false, message: 'Invalid dataFor'})
 const fromDate = moment(fromTS).format('YYYY-MM-DD HH:mm:ss')

  connection.query(`
    SELECT id
    FROM pair_master pm
    WHERE pm.from = ? AND pm.to = 'INR'
    `, [from], (err, result)=>{
      if(err)
        return res.json({success: false, message: 'Error', })
      if(!result.length)
        return res.json({success: false, message: 'Currency not found'})

      let pairId = result[0].id

      connection.query(`
        SELECT IFNULL((
          SELECT AVG(price) price
          FROM transaction
          WHERE pair_id=${mysql.escape(pairId)} and created_at <= '${mysql.escape(fromDate)}'
          GROUP BY DATE(created_at)
          ORDER BY DATE(created_at) DESC
          LIMIT 1
        ), 0) AS price, '${mysql.escape(fromDate)}' AS created_at
        UNION
        SELECT AVG(price) price, DATE(created_at) AS created_at
        FROM transaction
        WHERE pair_id=${pairId} and created_at >= '${mysql.escape(fromDate)}'
        GROUP BY DATE(created_at)
        `, (err, result)=>{
          if(err)
            return res.json({success: false, message: 'Error', error: cm_cfg.errorFn(err)})

          let arr = result.map((ele)=>{
            ele.created_at = moment(ele.created_at)
            return ele
          })

          if(!arr.length)
            return res.json({success: true, message:'Historical data', data:[]})

          result = []
          let i = 0
          if(arr[1]&&arr[0].created_at.isSame(arr[1].created_at))
            i = 1
          let start = moment(arr[0].created_at)
          let end = moment().startOf('Day')

          for(; i<arr.length; i++){
            while(start.isBefore(arr[i].created_at)){
              result.push({time: start.unix(), price:arr[i-1].price})
              start.add(1, 'Day')
            }
            result.push({time: arr[i].created_at.unix(), price:arr[i].price})
            start.add(1, 'Day')
          }

          while(start.isSameOrBefore(end)){
            result.push({time: start.unix(), price: arr[arr.length-1].price})
            start.add(1, 'Day')
          }

          res.json({success: true, message: 'Today Price', data: result})
        })
    })
}
