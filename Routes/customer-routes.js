var express = require('express');
var router = express.Router();
var util = require('../config/customer_util.js')
var validation = require('../config/admin_validation.js')
var jwt = require('jsonwebtoken');
let cm_cfg=require('../config/common_config'); 

var admin = require('../Routes/controller/admin/admin');
router.get('/getCustomerAdminSettings', util.checkToken, admin.getCustomerAdminSettings);
router.post('/getImageData', util.checkToken, validation.getImageData, admin.getImageData);

router.get('/getProfileInfoAdmin', util.checkToken, admin.getProfileInfoAdmin);
router.post('/getCustomerKYCData', util.checkToken, admin.getKYCData);

// dashboardService.getTradeCurrencyFromPairs

/*
Customised currency pair for trade page
*/
let currencyPairData = require('../Routes/controller/customer/getCurrencyPairTrade')
router.get('/getCurrencyPairTrade', currencyPairData.getCurrencyTradePair);
router.get('/getCurrencyPairSelected/:id', currencyPairData.getCurrencyPairSelected);
router.get('/getTradePairsChanges', currencyPairData.getTradePairsChanges);



var currency = require('../Routes/controller/admin/currency');
router.get('/getTradeCurrencyPairs', util.checkToken, currency.getTradeCurrencyPairs);
router.get('/getTradeCurrencyFromPairs/:id', currency.getTradeCurrencyPairs);
router.get('/getTradeCurrencyPairsFrontend', currency.getTradeCurrencyPairsFrontend);
router.get('/getFilteredCurrencyPairs', util.checkToken, currency.getFilteredCurrencyPairs);
router.get('/getCurrencyPairId', util.checkToken, currency.getCurrencyPairId);

var notification = require('../Routes/controller/customer/notification');
router.get('/getAllCustomerNotification', util.checkToken, notification.getAllCustomerNotification);
router.get('/resetCustomerNotification', util.checkToken, notification.resetCustomerNotification);
router.post('/markNotificationRead', util.checkToken, notification.markNotificationRead);
router.post('/getAllCustomerNotificationList', util.checkToken, notification.getAllCustomerNotificationList);
router.get('/getLiveCustomers', notification.getLiveCustomers);

router.get('/getTradeCurrencyPairsById/:id', util.checkToken, currency.getTradeCurrencyPairsById);
router.get('/getActiveCurrencyList/:id?', util.checkToken, currency.getActiveCurrencyList);
router.get('/getActiveCurrencyListHome/:id?', currency.getActiveCurrencyList); // for Home Page - Added by Ankita
router.post('/getConvertedRate', util.checkToken, currency.getConvertedRate);
router.post('/getGraphData', util.checkToken,currency.getGraphData);
router.post('/getHomeGraphData', currency.getHomeGraphData);

var country = require('../Routes/controller/admin/country');

router.get('/getCustomerCountries', util.checkToken, country.getCountries);
router.get('/getCustomerStates', util.checkToken, country.getStates);
router.get('/getCustomerStatesByCountryId/:country_id', util.checkToken, country.getStatesByCountryId);
router.get('/getCustomerCitiesByStateId/:state_id', util.checkToken, country.getCitiesByStateId);
router.get('/getCustomerCitiesByCountryId/:country_id', util.checkToken, country.getCitiesByCountryId);

var tradeLimit = require('../Routes/controller/admin/trade_limit');
router.get('/getTradeLimitByCurrencyCode/:currency_code?', util.checkToken, tradeLimit.getTradeLimitByCurrencyCode);

var commission = require('../Routes/controller/admin/commission');
router.get('/getCommissionByCurrencyCode/:currency_code?', util.checkToken, commission.getCommissionByCurrencyCode);

var mobileOTP = require('./controller/customer/mobile_otp');
router.post('/sendRegistrationOTP', mobileOTP.sendRegistrationOTP);
router.post('/sendCustomerOTP', (req, res, next)=>{
	jwt.verify(req.body.token, cm_cfg.login2FA, (err, decoded)=>{
		if(err)
			return res.json({success: false, message: 'Error'})
		req.decoded = decoded
		next()
	})
},mobileOTP.sendCustomerOTP);

router.post('/changeCustomerOTP', util.checkToken, mobileOTP.changeCustomerOTP);
var profile = require('../Routes/controller/customer/profile');
router.post('/getIframeToken', util.checkToken, profile.getIframeToken);
router.post('/kyc_callback/:digest?', profile.kycCallback);


var cron = require('../Routes/controller/customer/cron');
router.get('/updateDailyTradeLog/:date?', cron.updateDailyTradeLog);
router.get('/updateDailyTradeLogTillToday', cron.updateDailyTradeLogTillToday);
router.get('/updateTradingViewPairsJson', cron.updateTradingViewPairsJson);

var chart = require('../Routes/controller/customer/chart');
// router.get('/getChartData/:symbol?/:resolution?/:from?/:to?', chart.getChartData);
router.get('/getChartData/:from_pair?/:to_pair?/:resolution?/:from?/:to?', chart.getChartData);


module.exports = router;
