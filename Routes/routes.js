var express = require('express');
var router = express.Router();
var util = require('../config/util.js')
var valid = require('../config/valid.js')
var auth = require('../config/auth_api.js')
var admin_valid = require('../config/admin_valid.js');
var mid = require('../config/mid.js')
var validation = require('../config/admin_validation.js')

//registration

var registration = require('../Routes/controller/customer/registration');
router.post('/register', valid.register, mid.mid, registration.register); //util.verifyCaptcha,
router.post('/emailVerify', valid.emailVerify, mid.mid, registration.emailVerify);
router.post('/checkAndVerifyEmailToken', valid.emailVerify, mid.mid, registration.checkAndVerifyEmailToken);
router.post('/qrcode', valid.qrcode, mid.mid, registration.qrcode);
router.post('/signupVerifyCode', valid.signupVerifyCode, mid.mid, registration.signupVerifyCode);
router.get('/code', registration.code);
router.post('/login'/*, util.verifyCaptcha*/, valid.login, mid.mid, registration.login);
router.post('/loginVerifyCode', valid.signupVerifyCode, mid.mid, registration.loginVerifyCode);
router.post('/loginVerifyOTP', valid.signInVerifyOTP, mid.mid, registration.loginVerifyOTP);
router.post('/registerVerifyOTP', mid.mid, registration.registerVerifyOTP);
router.post('/email', valid.email/*, util.verifyCaptcha*/, mid.mid, registration.email);
router.post('/forgotPassword', valid.forgotPassword, mid.mid, registration.forgotPassword);
router.post('/cheakToken', registration.cheakToken);
router.post('/mobileLogin', valid.login, mid.mid, registration.login);
// router.post('/cheaKEmail', registration.cheakEmail);
// router.post('/sendOTP', registration.sendOTP);


let erc20 = require('../Routes/controller/customer/erc20');
router.get('/erc20UserAccount', util.checkToken, erc20.erc20UserAccount);


//profile
var profile = require('../Routes/controller/customer/profile');
router.get('/userDefaultCountry', util.checkToken, profile.userDefaultCountry);
router.post('/changePassword', util.checkToken, valid.changePassword, mid.mid, profile.changePassword);
router.post('/logout', util.checkToken, mid.mid, profile.logout);
router.post('/profile', valid.profile, util.checkToken, mid.mid, profile.profile);
router.get('/getProfileInfo', util.checkToken, profile.getProfileInfo);
router.get('/getProfile', util.checkToken, profile.getProfile);
router.post('/uploadProfileImage', util.checkToken, profile.uploadProfileImage)
router.post('/accountAcivity', util.checkToken, valid.accountAcivity, mid.mid, profile.accountAcivity);
router.get('/wallet', util.checkToken, profile.wallet);

router.post('/upload/:doc_type/:f_b_type', util.checkToken, profile.upload);
router.post('/documentData', util.checkToken, valid.documentdata, mid.mid, profile.documentData);
router.post('/customerKycDetails', util.checkToken, profile.customerKycDetails);
router.post('/uploadKycDetails/:id_pan/:id_aadhar', util.checkToken, profile.uploadKycDetails);
router.get('/getKycStatus', util.checkToken, profile.getKycStatus);
router.get('/getKycDetails', util.checkToken, profile.getKycDetails);
router.get('/getAddress', util.checkToken, profile.getAddress);
router.get('/getDocumentDetails', util.checkToken, profile.getDocumentDetails);
router.post('/createApplicant', auth.checkapitoken, profile.getApplicantId);
router.post('/download', function(req, res, next) {
    if (req.body.token)
        req.headers.token = req.body.token;
    if (req.body.path)
        req.query.path = req.body.path;
    next();
}, util.checkToken, profile.download);
router.post('/uploadKycForm', util.checkToken, profile.uploadKycFormFields);

router.get('/getKYCDetails', util.checkToken, profile.getKYCDetails);
router.post('/downloadKyc/', function(req, res, next) {
    if (req.body.token)
        req.headers.token = req.body.token;
    if (req.body.path)
        req.query.path = req.body.path;
    next();
}, util.checkToken, profile.downloadKyc);

var profile = require('../Routes/controller/customer/profile');
router.post('/getImage', util.checkToken, valid.getImage, profile.getImage);
router.get('/allActiveOrder', util.checkToken, profile.allActiveOrder);
router.post('/combineActiveOrder', util.checkToken, profile.combineActiveOrder); //updated below route for more filters
router.post('/cancelOrder', util.checkToken, valid.cancelOrder, mid.mid, profile.cancelOrder);
router.post('/allTransaction', util.checkToken, valid.allTransaction, mid.mid, profile.allTransaction); //updated below route for more filters
router.get('/getVerifyStatus', util.checkToken, profile.getVerifyStatus);
router.get('/sendEmailLink', util.checkToken, profile.sendEmailLink);
router.post('/emailLinkVerify', valid.emailVerify, profile.emailLinkVerify);
router.post('/faStatus', util.checkToken, mid.mid, profile.faStatus);
router.post('/verifyCode', util.checkToken, mid.mid, profile.verifyCode); // add token in this api
router.get('/getDashboadGraphData', util.checkToken, mid.mid, profile.getDashboadGraphData);

// router.get('/download',valid.download,mid.query,profile.download);
// router.get('/accountAcivity', util.checkToken, profile.accountAcivity);
// router.post('/accountAcivityFilter', util.checkToken, profile.accountAcivityFilter);
// router.get('/testwallet', util.checkToken,profile.testwallet);
// router.post('/currency', profile.currency);
// router.post('/currencyCalculate', profile.currencyCalculate);
// router.get('/time', profile.time1);
// router.post('/testdocumentData',util.checkToken, profile.testdocumentData);
// router.get('/allTransactionPage', util.checkToken, profile.allTransactionPage);
// router.get('/allTransaction/:limit/:offset', util.checkToken, profile.allTransactionfilter);
// router.get('/lastLogin', util.checkToken, profile.lastLogin);
// router.get('/sendMobileCode', util.checkToken, profile.sendMobileCode);
// router.post('/verifyMobileNo', util.checkToken, profile.verifyMobileNo);




var portfolio = require('./controller/customer/portfolio')
router.get('/getQRCodeByCurrency/:currency', util.checkToken, portfolio.getQRCodeByCurrency);
router.get('/portfolio', util.checkToken, portfolio.getPortfolio)
router.get('/portfolioDetails', util.checkToken, portfolio.getPortfolioDetails)
router.get('/tradeHistory/:pairId', util.checkToken, portfolio.tradeHistory) // using socket instead
router.get('/walletHistory', util.checkToken, portfolio.walletHistory);

//bank
var bank = require('../Routes/controller/customer/bank');
router.get('/getAdminAccountDetails', util.checkToken, bank.getAdminAccountDetails);
router.get('/getBankDetails', util.checkToken, bank.getBankDetails);
router.post('/addBankDetails', util.checkToken, valid.addBankDetailsValid, mid.mid, bank.addBankDetails);
router.post('/uploadBankDocuments/:bankAccountId', util.checkToken, bank.uploadBankDocuments);
router.get('/getBankStatus', util.checkToken, bank.getBankStatus);

// fiat money deposite_withdraw

var deposite_withdraw = require('../Routes/controller/customer/deposite_withdraw');
router.get('/singleWalletInfo/:currency_code', util.checkToken, deposite_withdraw.singleWalletInfo);
router.get('/inActiveBalance', util.checkToken, deposite_withdraw.inActiveBalance);
router.post('/addmoney', util.checkToken, valid.addmoneyV, mid.mid, deposite_withdraw.addmoney);
router.post('/uploadDepositeDocuments/:reference_no', util.checkToken, mid.mid, deposite_withdraw.uploadDepositeDocuments);
// router.post('/withdrawmoney', util.checkToken, deposite_withdraw.withdrawMoney);
router.post('/withdrawMoneyRequest', util.checkToken, valid.money, mid.mid, deposite_withdraw.withdrawMoneyRequest);
router.post('/fiatDepositeHistory', util.checkToken, valid.fiatHistory, mid.mid, deposite_withdraw.fiatDepositeHistory);
router.post('/withdrawHistory', util.checkToken, valid.fiatHistory, mid.mid, deposite_withdraw.withdrawHistory);
router.post('/getDepositWithdrawHistoryInr', util.checkToken, mid.mid, deposite_withdraw.getDepositWithdrawHistoryInr); //updated below route for more filters
router.post('/getDepositWithdrawHistoryCrypto', util.checkToken, mid.mid, deposite_withdraw.getDepositWithdrawHistoryCrypto); //updated below route for more filters


//limit

var limit = require('../Routes/controller/customer/limit');
router.post('/limitCheckBalance', util.checkToken, mid.mid, limit.limitCheckBalance);
router.post('/limitBuyPrice', util.checkToken, valid.limitPrice, mid.mid, limit.limitBuyPrice);
router.post('/limitSellPrice', util.checkToken, valid.limitPrice, mid.mid, limit.limitSellPrice);
router.post('/limitBuyCal', util.checkToken, valid.limitSellOrder, mid.mid, limit.limitBuyCal);
router.post('/limitSellCal', util.checkToken, valid.limitCal, mid.mid, limit.limitSellCal);
// router.post('/limitSellFee', util.checkToken, limit.limitSellFee)
// router.post('/limitBuyFee', util.checkToken, limit.limitBuyFee)


//market

var market = require('../Routes/controller/customer/market');
router.post('/estimateBuyQuantity', util.checkToken, valid.marketBuyOrder, mid.mid, market.estimateBuyQuantity);
router.post('/estimateSellQuantity', util.checkToken, valid.marketSellOrder, mid.mid, market.estimateSellQuantity);
// router.post('/getTotalBuyQuantityPresent', util.checkToken, mid.mid, market.totalBuyQunatity);
// router.post('/getTotalSellQuantityPresent', util.checkToken, mid.mid, market.totalSellQuantity)
router.post('/lastTradePrice', util.checkToken, market.lastTradePrice);


var newmarket = require('../Routes/controller/customer/newmarket_api');
router.post('/marketBuyOrder', util.checkToken, valid.marketBuyOrder, mid.mid, newmarket.marketBuyOrder);
router.post('/limitBuyPlaceOrder', util.checkToken, mid.mid, newmarket.limitBuyPlaceOrder);
router.post('/limitSellPlaceOrder', util.checkToken, valid.limitSellOrder, mid.mid, newmarket.limitSellPlaceOrder)
router.post('/marketSellOrder', util.checkToken, valid.marketSellOrder, mid.mid, newmarket.marketSellOrder)





//------------------------//
var getTransactionHistory = require('../Routes/controller/customer/getTransactionHistory');
router.post('/transactionHistory', util.checkToken, getTransactionHistory.getTransaction);
router.post('/getAllCurrencyTransactionHistory', util.checkToken, getTransactionHistory.getAllCurrencyTransactionHistory);

var ether = require('../Routes/controller/customer/ether');
router.get('/ethUserAccount', util.checkToken, ether.ethUserAccount);
router.post('/ethBalance', util.checkToken, ether.ethBalance);
router.get('/ethDepositHistory', util.checkToken, ether.ethDepositHistory);


var btc = require('../Routes/controller/customer/btc1');
router.get('/btcUserAccount', util.checkToken, btc.btcUserAccount);
router.post('/btcBalance', util.checkToken, btc.btcBalance);
router.get('/btcDepositHistory', util.checkToken, btc.btcDepositHistory);


var ltc = require('../Routes/controller/customer/ltc1');
router.get('/ltcUserAccount', util.checkToken, ltc.ltcUserAccount);
router.post('/ltcBalance', util.checkToken, ltc.ltcBalance);
router.get('/ltcDepositHistory', util.checkToken, ltc.ltcDepositHistory);

var bch = require('../Routes/controller/customer/bch');
router.get('/bchUserAccount', util.checkToken, bch.bchUserAccount);
//router.post('/bchBalance',util.checkToken, bch.bchBalance);
router.get('/bchDepositHistory', util.checkToken, bch.bchDepositHistory);

var doge = require('../Routes/controller/customer/doge');
router.get('/dogeUserAccount', util.checkToken, doge.dogeUserAccount);
router.post('/dogeBalance', util.checkToken, doge.dogeBalance);

//faq
var faqall = require('../Routes/controller/customer/faq');
router.get('/getAllfaqList', faqall.getAllfaqList);
router.get('/getAllfaqCat', faqall.getAllfaqCat);
router.post('/getAllfaqByCat/', faqall.getAllfaqByCat);
router.get('/getAllfaqListByCat', faqall.getAllfaqListByCat);
router.get('/call_download', faqall.call_download);

var support = require('../Routes/controller/customer/support');
router.get('/getUserProfile', util.checkToken, support.getUserProfile);
router.post('/addSupportData', admin_valid.addSupportData, util.checkToken, support.addSupportData);
router.post('/uploadSupport/:id', util.checkToken, support.uploadSupport);
router.post('/getSupportList', util.checkToken, support.getSupportList);
router.post('/repplySupport/:id', admin_valid.repplySupport, util.checkToken, support.repplySupport);
router.post('/addSupportComment', admin_valid.addSupportComment, util.checkToken, support.addSupportComment);
//router.post('/changeStatusCu/:id', util.checkToken, support.changeStatusCu);
router.post('/reOpenTicketCu/:id', util.checkToken, support.reOpenTicketCu);
router.post('/updateSupportStatusCu/:id', util.checkToken, support.updateSupportStatusCu);

router.post('/showSupportData', admin_valid.showSupportData, support.showSupportData); // for home-page - token not required.
router.post('/uploadSupportUser/:id/:email/:length', support.uploadSupportUser); // for home-page - token not required

const systemMetrics = require('../Routes/controller/customer/system_metrics')
router.get('/24HourVolume/:pairId', util.checkToken, systemMetrics._24HourVolume)
router.get('/todayLowHigh/:pairId', util.checkToken, systemMetrics.todayLowHigh)
router.get('/yearlyLowHigh/:pairId', util.checkToken, systemMetrics.yearlyLowHigh)
router.get('/histToday', systemMetrics.histToday)
router.get('/histData', systemMetrics.histData)

const banking = require('../Routes/controller/customer/banking');
router.post('/newDepositRequest', valid.newDepositRequest, banking.newDepositRequest);
router.post('/newWithdrawalRequest', banking.newWithdrawalRequest);
// valid.newWithdrawalRequest,


var otc_api = require('../Routes/controller/customer/otc_api');
var otc_auth = require('../config/otc_auth');
router.post('/getEtherAddress', otc_auth.authenticate, valid.otc_eth, otc_api.getEtherAccount);



router.post('/downloadSupport/', function(req, res, next) {
    if (req.body.token)
        req.headers.token = req.body.token;
    if (req.body.path)
        req.query.path = req.body.path;
    next();
}, util.checkToken, support.downloadSupport);


var otc = require('../Routes/controller/customer/otc');
router.post('/userAddressByEmail',valid.useraddress, otc.userAddressByEmail);

module.exports = router;