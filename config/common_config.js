module.exports = {
  //login2FA has been used in:
  //Routes/controller/admin/two_factor_auth.js,
  //Routes/controller/admin/admin.js
  //Routes/controller/customer/registration.js,
  login2FA: 'secret',
  //config2FA to be used for login token generation when 2 fa is not set for a admin users
  //used in
  //Routes/controller/admin/two_factor_auth.js,
  //Routes/controller/admin/admin.js
  config2FA: 'doublesecret',


  error: 0,//not show

  errorFn: function (err) {
    console.log(err);
    if (this.error == 1) {
      return err;
    }

  },

  domainName: 'fuleex.io',

  decimalPoints: 8,
  buyOrderPrefix: 'ORDB-',
sellOrderPrefix: 'ORDS-',

  taker_fee: 0.4,
  maker_fee: 0.3

}
