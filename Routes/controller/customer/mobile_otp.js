let connection = require('../../../config/db')
let smsHelper =  require('../../../config/sms_helper')
let cm_cfg=require('../../../config/common_config')

//for sending otp from registration page
exports.sendRegistrationOTP = (req, res)=>{
  let phno = req.body.mobileNumber
  var email =req.body.email
  req.check('mobileNumber', 'Invalid mobile number').notEmpty().matches(/^\+?\d*$/);
  let error = req.validationErrors();
  if(error){
    res.json({success: false, message: 'Invalid mobile number'});
    return;
  }
  connection.query("SELECT * FROM customer WHERE email =? or mobileNumber=?", [email, phno],(err, result)=>{
    // console.log("otp result")
    // console.log(result)
    if(err)
      res.json({success: false, message: 'Error', error: cm_cfg.errorFn(err)})
    else if(result.length){
      res.json({success: false, message: 'Mobile number or email already exist'})
    }
    else{
      exports.sendOTP(phno, 'REGISTRATION_OTP').then((sent)=>{
        res.json({success: true, message: 'OTP sent'})
      }).catch((err)=>{
        res.json({success: false, message: err.ecode===1?err.message:'Error '+err.message, error:cm_cfg.errorFn(err)})
      })
    }
  })
}

//for sending otp from anywhere when logged in
exports.sendCustomerOTP = (req, res)=>{

 
  let smsTemplateCode = req.body.smsTemplateCode
  if(!smsTemplateCode)
    smsTemplateCode = 'TRANSACTION_OTP'
  connection.query(`SELECT mobileNumber FROM customer WHERE email = '${req.decoded.email}'`, (err, mobile)=>{
    if(err)
      return res.json({success: false, message: 'Error', error: cm_cfg.errorFn(err)})

    exports.sendOTP(mobile[0].mobileNumber, smsTemplateCode).then((sent)=>{
      res.json({success: true, message: 'OTP sent'})
    }).catch((err)=>{
      res.json({success: false, message: err.ecode===1?err.message:'Error', error:cm_cfg.errorFn(err)})
    })
  })
}

exports.changeCustomerOTP = (req, res)=>{
let smsTemplateCode = req.body.smsTemplateCode
  if(!smsTemplateCode)
    smsTemplateCode = 'TRANSACTION_OTP'
  connection.query(`SELECT mobileNumber FROM customer WHERE email = '${req.decoded.email}'`, (err, mobile)=>{
    if(err)
      return res.json({success: false, message: 'Error', error: cm_cfg.errorFn(err)})

    exports.sendOTP(mobile[0].mobileNumber, smsTemplateCode).then((sent)=>{
      res.json({success: true, message: 'OTP sent'})
    }).catch((err)=>{
      res.json({success: false, message: err.ecode===1?err.message:'Error', error:cm_cfg.errorFn(err)})
    })
  })
}

//for sending otp from any custom route
//check otp service is blocked by repeated wrong otp
//check the otp has been sent to the mobile number in the past hour < 3
exports.sendOTP = (phno, smsTemplateCode)=>{
  console.log(smsTemplateCode)
  if(!smsTemplateCode)
    smsTemplateCode = 'TRANSACTION_OTP'
  return new Promise((resolve, reject)=>{
    connection.query(
      `SELECT
      id, TIMESTAMPDIFF(minute, created_at, current_timestamp) as resendCycleMinutes,
      sent_counter,
      TIMESTAMPDIFF(minute, verification_blocked_at, current_timestamp) as blockMinutes
      FROM mobile_otp
      WHERE mobile_number = ?`, [phno], (err, result)=>{
      if(err){
        reject(err)
        return
      }
      if(result.length){
        const data = result[0]
        if((data.blockMinutes !== null) && (data.blockMinutes < 60)){
          reject({ecode: 1, message: 'OTP services blocked for ' + (60-data.blockMinutes) + ' minutes'})
          return
        }
        if(data.resendCycleMinutes < 60 && data.sent_counter > 2){
          reject({ecode: 1, message: 'OTP cannot be sent. Please wait for ' + (60-data.resendCycleMinutes) + ' minutes'})
          return
        }
      }
      let otp = (Math.random()+'').substring(2,8)
      let sql
      if(result.length){
        let ifNewHour = result[0].resendCycleMinutes>=60;
        sql = `UPDATE mobile_otp SET
               otp = ${otp},
               created_at = ${ifNewHour?'current_timestamp':'created_at'},
               updated_at = current_timestamp,
               sent_counter = ${ifNewHour?'1':'sent_counter + 1'},
               verification_counter = 0,
               verification_blocked_at = NULL
               WHERE mobile_number = ?`
      } else {
        sql = `INSERT INTO mobile_otp(otp, mobile_number) values(${otp},?)`
      }
      connection.query(sql, [phno], (err, upResult)=>{
        if(err){
          reject(err)
          return
        } else {
          ///send SMS
          let smsData = {
            sms_template_code: smsTemplateCode,
            mobile: phno,
            variables: [{'{OTP}': otp}]
          }
          smsHelper.sms_template(smsData).then((response)=>{
            response = JSON.parse(response)
            if(response.status == "success")
              resolve(true)
            else{
              cm_cfg.errorFn(response)
              reject({ecode: 1, message: 'Error while sending message'})
            }
          }).catch((err)=>{
            reject(err)
          })
        }
      })
    })
  })
}

//for verifying otp
//if email is passed then mobile number for the customer will be used
exports.verifyOTP = (phno, otp, email) =>{

  otp = Number(otp)
  let sql = `SELECT id,
    otp,
    TIMESTAMPDIFF(minute, updated_at, current_timestamp) as validityMinutes,
    verification_counter,
    TIMESTAMPDIFF(minute, verification_blocked_at, current_timestamp) as blockMinutes
    FROM mobile_otp
    WHERE mobile_number = ${email?`(SELECT mobileNumber FROM customer WHERE email = '${email}')`:'?'}
    LIMIT 1`

  return new Promise((resolve, reject)=>{
    connection.query(sql, [phno], (err, result)=>{
      if(err)
        return reject(err)
      if(!result.length)
        return reject({ecode: 1, message: 'No OTP found for your number, try resending'})

      let data = result[0]

      if((data.blockMinutes !== null) && (data.blockMinutes < 60))
        return reject({ecode: 1, message: 'OTP services blocked for '+ (60 - data.blockMinutes)+ ' minutes'})

      if(!data.otp || data.validityMinutes > 15)
        return reject({ecode: 1, message: 'No OTP found for your number, try resending'})

      if(data.otp == otp && data.verification_counter < 3){

        connection.query(`UPDATE mobile_otp SET otp = NULL WHERE id = ${data.id}`, (err, data)=>{
          if(err)
            return reject(err)
          resolve(true)
        })
      } else {
        connection.query(`UPDATE mobile_otp
          SET verification_counter = (@counter := verification_counter + 1),
          verification_blocked_at = if(@counter>2, current_timestamp, null)
          WHERE id = ${data.id}`, (err, upResult)=>{
            if(err)
              return reject(err)
            reject({ecode: 1, message: 'Incorrect OTP'})
          })
      }
    })
  })
}
