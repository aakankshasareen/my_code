var express = require('express');
var router = express.Router();
var util = require('../config/admin_util.js');
var valid = require('../config/admin_valid.js');
var util = require('../config/admin_util.js')
var validation = require('../config/admin_validation.js')
var admin = require('../Routes/controller/admin/admin');

router.post('/adminLogin', /*util.verifyCaptcha,*/ validation.adminLogin, admin.adminLogin);
router.get('/getDefaultDateFormat', util.checkToken, admin.getDefaultDateFormat);
router.get('/getAdminSettings', util.checkToken, admin.getAdminSettings);
router.post('/updateSettings', util.checkToken, admin.updateSettings);
router.post('/getKYCData', util.checkToken, admin.getKYCData);
router.post('/getAllKYCMasterList', util.checkToken, admin.getAllKYCMasterList);
router.post('/addKYC', util.checkToken, validation.addKYC, admin.addKYC);
router.get('/editKYC/:id', util.checkToken, admin.editKYC);
router.post('/updateKYC/:id', util.checkToken, validation.addKYC, admin.updateKYC);
router.post('/adminLogout', util.checkToken, admin.adminLogout);
router.get('/getProfileInfoAdmin', util.checkToken, admin.getProfileInfoAdmin);
router.post('/getAllAdminUserList', util.checkToken, util.SuperAdminOnly, admin.getAllAdminUserList);
router.post('/registerAdminUser', util.checkToken, util.SuperAdminOnly, validation.registerAdminUser, admin.registerAdminUser);
router.get('/editBackendUser/:id', util.checkToken, util.SuperAdminOnly, admin.editBackendUser);
router.post('/updateAdminUser', util.checkToken, validation.editBackendUser, admin.updateAdminUser);

router.post('/deleteAdminUser/:id', util.checkToken, admin.deleteAdminUser);
router.get('/addmoney', admin.addmoney);
router.post('/adminchangePassword',util.checkToken,validation.adminchangePassword, admin.adminchangePassword);
router.get('/editMyProfile', util.checkToken, admin.editMyProfile);
router.post('/updateMyProfile', util.checkToken, validation.updateCustomerProfile, admin.updateMyProfile);
router.post('/forgotEmail',validation.forgotEmail, /*util.verifyCaptcha,*/ admin.forgotEmail);
router.post('/resetAdminPassword', validation.resetAdminPassword, admin.resetAdminPassword);
router.get('/addbalance', admin.addmoney);
router.post('/checkAdminPasswordToken',  admin.checkAdminPasswordToken);
router.post('/deleteAdminUser/:id', util.checkToken, util.SuperAdminOnly, admin.deleteAdminUser);
router.get('/addmoney', admin.addmoney);

var currency = require('../Routes/controller/admin/currency');

router.get('/getAdminActiveCurrencyListFiat/:id?', util.checkToken, currency.getActiveCurrencyListFiat);
router.get('/getAdminActiveCurrencyList/:id?', util.checkToken, currency.getActiveCurrencyList);
router.post('/addCurrency', validation.addCurrency, util.checkToken,  currency.addCurrency);
router.get('/editCurrency/:id', util.checkToken, currency.editCurrency);
router.post('/updateCurrency/:id',  util.checkToken, validation.addCurrency, currency.updateCurrency);
router.post('/deleteCurrency/:id', util.checkToken, currency.deleteCurrency);
router.get('/getCurrencyList', util.checkToken, currency.getCurrencyList);
router.post('/getAllCurrencyList', util.checkToken, currency.getAllCurrencyList);
router.post('/updateCurrencyPairsOrder', util.checkToken, currency.updateCurrencyPairsOrder);
router.post('/updateCurrencyPairOrder', util.checkToken, currency.updateCurrencyPairOrder);
router.post('/getAllTradeCurrencyPairs', util.checkToken, currency.getAllTradeCurrencyPairs);
router.post('/saveCurrencyPairs',  util.checkToken, validation.saveCurrencyPairs, currency.saveCurrencyPairs);
router.get('/getCurrencyPairs', util.checkToken, currency.getCurrencyPairs);
router.post('/deleteCurrencyPair/:id', util.checkToken, currency.deleteCurrencyPair);
router.post('/updateDefaultPair/:id',  util.checkToken, validation.updateDefaultPair, currency.updateDefaultPair);
router.post('/updatePairStatus',  util.checkToken, validation.updatePairStatus, currency.updatePairStatus);
router.post('/upload', util.checkToken, currency.upload);
//this route returns everything that route /api/getTradeCurrencyPairs returns along with maximum last trade price per pair
router.get('/getAllLastTradePrice', util.checkToken, currency.getAllLastTradePrice);

var country = require('../Routes/controller/admin/country');

router.get('/getCountries', util.checkToken, country.getCountries);
router.get('/getStates', util.checkToken, country.getStates);
router.get('/getStatesByCountryId/:country_id', util.checkToken, country.getStatesByCountryId);
router.get('/getCitiesByStateId/:state_id', util.checkToken, country.getCitiesByStateId);
router.get('/getCitiesByCountryId/:country_id', util.checkToken, country.getCitiesByCountryId);

router.post('/addCountry',  util.checkToken, validation.addCountry, country.addCountry);
router.post('/getAllCountryList', util.checkToken, country.getAllCountryList);
router.get('/editCountry/:id', util.checkToken, country.editCountry);
router.post('/updateCountry/:id', util.checkToken, validation.addCountry, country.updateCountry);
router.post('/deleteCountry/:id', util.checkToken, country.deleteCountry);

router.post('/addState', util.checkToken, validation.addState, country.addState);
router.post('/getAllStateList', util.checkToken, country.getAllStateList);
router.get('/editState/:id', util.checkToken, country.editState);
router.post('/updateState/:id', util.checkToken, validation.addState, country.updateState);
router.post('/deleteState/:id', util.checkToken, country.deleteState);

router.post('/addCity', util.checkToken, validation.addCity, country.addCity);
router.post('/getAllCityList', util.checkToken, country.getAllCityList);
router.get('/editCity/:id', util.checkToken, country.editCity);
router.post('/updateCity/:id', util.checkToken, validation.addCity, country.updateCity);
router.post('/deleteCity/:id', util.checkToken, country.deleteCity);

var commission = require('../Routes/controller/admin/commission');
router.post('/updateCommission', validation.updateCommission, util.checkToken, commission.updateCommission);
router.post('/getCommissions', util.checkToken, commission.getCommissions);
//router.get('/getCommissions', util.checkToken, commission.getCommissions);

var tradeLimit = require('../Routes/controller/admin/trade_limit');
router.post('/updateTradeLimit', validation.updateCommission, util.checkToken, tradeLimit.updateTradeLimit);
router.post('/getTradeLimits', util.checkToken, tradeLimit.getTradeLimits);
router.post('/updateTradeLimit', util.checkToken, tradeLimit.updateTradeLimit);
router.post('/getTradeLimits', util.checkToken, tradeLimit.getTradeLimits);


var customer = require('../Routes/controller/admin/customer');
router.post('/getAllCustomerList', util.checkToken, customer.getAllCustomerList);
router.get('/editCustomerProfile/:customer_id', util.checkToken, customer.editCustomerProfile);
router.post('/updateCustomerProfile/:customer_id', util.checkToken, validation.updateCustomerProfile, customer.updateCustomerProfile);
router.post('/documentDataAdmin/:customer_id', util.checkToken, validation.documentDataAdmin, customer.documentDataAdmin);
router.post('/uploadKyc/:customer_id/:doc_type/:f_b_type', util.checkToken, customer.uploadKyc);
router.get('/getDocumentDetailsById/:customer_id', util.checkToken, customer.getDocumentDetailsById);
router.post('/addAmountToWallet', util.checkToken, customer.addAmountToWallet);
router.get('/getKYCDetails/:customer_id', util.checkToken, customer.getKYCDetails);
router.post('/downloadKyc/',function(req, res, next){
	if(req.body.token)
    req.headers.token = req.body.token;
	if(req.body.path)
    req.query.path = req.body.path;
	next();
},	util.checkToken, customer.downloadKyc);

router.get('/getUserInfoData/:customer_id', util.checkToken, customer.getUserInfoData);

router.post('/downloadAdmin',function (req, res, next){
  if(req.body.token)
    req.headers.token = req.body.token;
  if(req.body.path)
    req.query.path = req.body.path;
  next();
}, util.checkToken, customer.downloadAdmin);

router.get('/getAddressById/:customer_id', util.checkToken, customer.getAddressById);
router.post('/approveKYC', util.checkToken, customer.approveKYC);
router.post('/getAllWithdrawRequestList', util.checkToken, customer.getAllWithdrawRequestList);
router.post('/approveWithdrawRequest', util.checkToken, validation.validateWithdrawRequest, customer.approveWithdrawRequest);
router.post('/disapproveWithdrawRequest', util.checkToken,validation.validateWithdrawRequest, customer.disapproveWithdrawRequest);
router.get('/getWithdrawRequestById/:id',util.checkToken,  customer.getWithdrawRequestById);
router.post('/updateWithdrawRequest', util.checkToken, validation.validateWithdrawRequest, customer.updateWithdrawRequest);

router.post('/getAllDepositRequestList', util.checkToken, customer.getAllDepositRequestList);
router.post('/approveDepositRequest', util.checkToken, customer.approveDepositRequest);
router.post('/disapproveDepositRequest', util.checkToken, customer.disapproveDepositRequest);
router.get('/getDepositRequestById/:id',util.checkToken,customer.getDepositRequestById);
router.post('/updateDepositRequest', util.checkToken, customer.updateDepositRequest);
router.post('/getUserDepositRequestList', util.checkToken, customer.getUserDepositRequestList);
router.post('/customerOpenOrder', util.checkToken, customer.customerOpenOrder);
router.post('/getCustomerTradeDetails', util.checkToken, customer.getCustomerTradeDetails);
router.get('/getCustomerWalletReport/:customer_id', util.checkToken, customer.getCustomerWalletReport);
router.post('/getUserWithdrawRequestList', util.checkToken, customer.getUserWithdrawRequestList);
router.post('/blockMultiple', util.checkToken, customer.blockMultiple);
router.post('/unblockMultiple', util.checkToken, customer.unblockMultiple);
router.post('/blockCustomer/:id', util.checkToken, customer.blockCustomer);
router.post('/unblockCustomer/:id', util.checkToken, customer.unblockCustomer);

var dashboard = require('../Routes/controller/admin/dashboard');
router.get('/getTotalUsers', util.checkToken, dashboard.getTotalUsers);
router.post('/getTotalCustomerByKycStatus', util.checkToken, dashboard.getTotalCustomerByKycStatus);
router.get('/getTotalActiveCurrencies', util.checkToken, dashboard.getTotalActiveCurrencies);
router.get('/getActiveCurrencyIcons', util.checkToken, dashboard.getActiveCurrencyIcons);
router.get('/getNewCustomers', util.checkToken, dashboard.getNewCustomers);
router.get('/getLiveUsers', util.checkToken, dashboard.getLiveUsers)
router.get('/getAllNotification', util.checkToken, dashboard.getAllNotification);
router.get('/resetAdminNotification', util.checkToken, dashboard.resetAdminNotification);
router.post('/markNotificationRead', util.checkToken, dashboard.markNotificationRead);
router.post('/getAllNotificationList', util.checkToken, dashboard.getAllNotificationList);

var role = require('../Routes/controller/admin/role');
router.post('/getAllRoleList', util.checkToken,  util.SuperAdminOnly, role.getAllRoleList);
router.post('/getRoleList', util.checkToken, util.SuperAdminOnly, role.getRoleList);
router.post('/addRole', util.checkToken, util.SuperAdminOnly, validation.addRole, role.addRole);
router.get('/editRole/:id', util.checkToken, util.SuperAdminOnly, role.editRole);
router.post('/updateRole/:id', util.checkToken, util.SuperAdminOnly, validation.addRole, role.updateRole);
router.post('/deleteRole/:id', util.checkToken, util.SuperAdminOnly, role.deleteRole);

var permission = require('../Routes/controller/admin/permission');
router.post('/getAllPermission', util.checkToken, util.SuperAdminOnly, permission.getAllPermission);
router.post('/addRolePermission', util.checkToken,util.SuperAdminOnly, permission.addRolePermission);
//router.post('/getAdminUserPermission', util.checkToken, permission.getAdminUserPermission);
router.post('/getAdminUserPermission', util.checkToken, permission.getAdminUserPermission);

var faq = require('../Routes/controller/admin/faq');
router.post('/getFaqList', util.checkToken, faq.getFaqList);
router.post('/addFaq', util.checkToken, validation.addFaq, faq.addFaq);
router.get('/editFaq/:id', util.checkToken, faq.editFaq);
router.post('/updateFaq/:id', util.checkToken, validation.addFaq, faq.updateFaq);
router.post('/deleteFaq/:id', util.checkToken, faq.deleteFaq);
router.get('/getFaqCategoryList', util.checkToken, faq.getFaqCategoryList);

var emailtemplate = require('../Routes/controller/admin/email_template');
router.post('/getEmailTemplateList', util.checkToken, emailtemplate.getEmailTemplateList);
router.post('/uploadEmailTemplateDoc', util.checkToken, emailtemplate.uploadEmailTemplateDoc);
router.post('/addEmailTemplate', util.checkToken, validation.addEmailTemplate, emailtemplate.addEmailTemplate);
router.get('/editEmailTemplate/:id', util.checkToken, emailtemplate.editEmailTemplate);
router.post('/updateEmailTemplate/:id', util.checkToken, validation.addEmailTemplate, emailtemplate.updateEmailTemplate);
// router.post('/deleteEmailTemplate/:id', util.checkToken, emailtemplate.deleteEmailTemplate);
router.get('/downloadPdf', util.checkToken, emailtemplate.downloadPdf);

var support = require('../Routes/controller/admin/support');
router.post('/getSupportListAdmin', util.checkToken, support.getSupportListAdmin);
// router.post('/getContactListAdmin', util.checkToken, support.getContactListAdmin);
// router.post('/deleteSupport/:id', util.checkToken, support.deleteSupport);
router.post('/repplySupportTeam/:id', util.checkToken, support.repplySupportTeam);
router.post('/reOpenTicket/:id', util.checkToken, support.reOpenTicket);
router.post('/addSupportCommentTeam', util.checkToken, validation.addSupportCommentTeam, support.addSupportCommentTeam);
router.post('/changeStatus/:id', util.checkToken, support.changeStatus);
router.post('/updateSupportStatus/:id', util.checkToken, support.updateSupportStatus);

var report = require('../Routes/controller/admin/report');
router.post('/getTotalDepositAmount', util.checkToken, report.getTotalDepositAmount);
router.post('/getTotalWithdrawAmount', util.checkToken, report.getTotalWithdrawAmount);
router.post('/DepositeReport', util.checkToken, report.DepositeReport);
router.post('/withdrawalReport', util.checkToken, report.withdrawalReport);


//two factor authentication
var twoFactorAuth = require('./controller/admin/two_factor_auth');
router.post('/admin/qrcode', twoFactorAuth.checkTokenConfig, twoFactorAuth.getQRCode);
router.post('/admin/faStatus', twoFactorAuth.checkTokenConfig, twoFactorAuth.setFaStatus);
router.post('/admin/loginVerifyCode', twoFactorAuth.loginVerifyCode);

var transactionreport = require('../Routes/controller/admin/transaction_report');
router.post('/transactionReportAdmin', util.checkToken, transactionreport.transactionReportAdmin);
router.get('/transactionReportCustomerAdmin', util.checkToken, transactionreport.transactionReportCustomerAdmin);
router.get('/marketCurrencypairadmin', util.checkToken, transactionreport.marketCurrencypairadmin);

var customeradminreport = require('../Routes/controller/admin/customer_report');
router.post('/customerReportAdmin', util.checkToken, customeradminreport.customerReportAdmin);

var bankDetails = require('./controller/admin/bank_details.js')
router.get('/admin/getBankDetailsByCustomerId/:id', util.checkToken, bankDetails.getBankDetailsByCustomerId)
router.post('/admin/updateBankDetailsStatus', util.checkToken, bankDetails.updateBankDetailsStatus)

var smsTemplate = require('./controller/admin/sms_template')
router.get('/getSmsTemplateById', util.checkToken, smsTemplate.getSmsTemplateById)
router.post('/addSmsTemplate', util.checkToken, smsTemplate.addSmsTemplate)
router.post('/updateSmsTemplate', util.checkToken, smsTemplate.updateSmsTemplate)
router.post('/getSmsTemplateList', util.checkToken, smsTemplate.getSmsTemplateList)

var activity = require('./controller/admin/activity')
router.post('/adminUserActivity', util.checkToken, activity.adminUserActivity)

var feeReport = require('./controller/admin/fee_report.js');
router.post('/getAllCryptoFeeDetails', util.checkToken, feeReport.getAllCryptoFeeDetails);
router.post('/getAllFiatFeeDetails', util.checkToken, feeReport.getAllFiatFeeDetails);
// router.post('/getLTCFeeDetails', util.checkToken, feeReport.getLTCFeeDetails);
// router.post('/getETHFeeDetails', util.checkToken, feeReport.getETHFeeDetails);
// router.post('/getFULXFeeDetails', util.checkToken, feeReport.getFULXFeeDetails);
// router.post('/getABCFeeDetails', util.checkToken, feeReport.getABCFeeDetails);

var order_book = require('../Routes/controller/admin/order_book');
router.post('/getListOrderBook', util.checkToken, order_book.getListOrderBook);

var totalFeeReport = require('./controller/admin/total_fee_report.js');
router.post('/getTotalFee',  util.checkToken, totalFeeReport.getTotalFee);


module.exports = router;
