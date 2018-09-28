login.service('loginService', ['$http', '$q', 'apiService', '$rootScope', '$cookies', function($http, $q, apiService, $rootScope, $cookies) {

    var loginService = {};

    //service to communicate with users model to verify login credentials
    var accessLogin = function(parameters) {
        var deferred = $q.defer();
        apiService.create("login", parameters).then(function(response) {
                if (response) {
                    if (response.FA_status == 0) {
                        $rootScope.globals = response.token;
                        $http.defaults.headers.common['Authorization'] = 'Bearer ' + response.token;
                        sessionStorage.setItem('globals', $rootScope.globals);
                    }
                    deferred.resolve(response);
                } else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    var sendRegistrationOTP = function(parameters){
      var deferred = $q.defer();
      apiService.create('sendRegistrationOTP', parameters).then(function(response){
        if (response){
          deferred.resolve(response);
        } else
            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
    },
      function(response) {
        deferred.reject(response);
      });
    return deferred.promise;
    };

    //service to communicate with users to include a new user
    var registerUser = function(parameters) {
        var deferred = $q.defer();

        apiService.create("register", parameters).then(function(response) {
                if (response){
                    deferred.resolve(response);
                }
                else{
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                }
            },
            function(response) {
                console.log("rejected")
                deferred.reject(response);
            });
        return deferred.promise;
    };

    var emailLinkForgotPs = function(parameters) {
        var deferred = $q.defer();
        apiService.create("email", parameters, sessionStorage.getItem('globals')).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }
    var forgotPassword = function(parameters) {

        var deferred = $q.defer();
        apiService.create("forgotPassword", parameters).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    var getQR = function(parameters) {
        var deferred = $q.defer();
        apiService.create("qrcode", parameters).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;

    }

   // verify 2FA for login
    var verifyToken = function(parameters) {
        var deferred = $q.defer();
        apiService.create("verifyCode", parameters, sessionStorage.getItem('globals')).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;

    }

    var verifyAdminToken = function(parameters) {
        var deferred = $q.defer();
        apiService.create("admin/loginVerifyCode", parameters, sessionStorage.getItem('globals')).then(function(response) {
                if (response){
                    $rootScope.globals = response.token;
                    $http.defaults.headers.common['Authorization'] = 'Bearer ' + response.token;
                    sessionStorage.setItem('globals', $rootScope.globals);
                    deferred.resolve(response);
                  }
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;

    }

    //verify 2FA for registration
    var verifyRegistrationToken = function(parameters) {
        var deferred = $q.defer();
        apiService.create("signupVerifyCode", parameters).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var verifyEmail = function(parameters) { //not used
        var deferred = $q.defer();
        apiService.create("email", parameters).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;

    }

    var emailLinkVerify = function(parameters) {
        var deferred = $q.defer();
        apiService.create("emailVerify", parameters).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;

    }

    var emailLinkVerifyFromProfile = function(parameters) {
        var deferred = $q.defer();
        apiService.create("emailLinkVerify", parameters).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;

    }

    var checkLinkExpiry = function(parameters) {
        var deferred = $q.defer();
        apiService.create("cheakToken", parameters).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;

    }

    var checkEmailLinkExpiry = function(parameters) {
        var deferred = $q.defer();
        apiService.create("checkAndVerifyEmailToken", parameters).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var loginVerifyCodeWhen2FA = function(parameters) {
        var deferred = $q.defer();
        apiService.create("loginVerifyCode", parameters).then(function(response) {
                if (response) {
                    if (angular.isDefined(response.token)) {
                        $rootScope.globals = response.token;
                        $http.defaults.headers.common['Authorization'] = 'Bearer ' + response.token;
                        sessionStorage.setItem('globals', $rootScope.globals);
                    }
                    deferred.resolve(response);
                } else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var ethBalance = function(parameters) {
        var deferred = $q.defer();
        apiService.create("ethBalance", parameters, sessionStorage.getItem('globals')).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var btcBalance = function(parameters) {
        var deferred = $q.defer();
        apiService.create("btcBalance", parameters, sessionStorage.getItem('globals')).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var dogeBalance = function(parameters) {
        var deferred = $q.defer();
        apiService.create("dogeBalance", parameters, sessionStorage.getItem('globals')).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

     var ltcBalance = function(parameters) {
        var deferred = $q.defer();
        apiService.create("ltcBalance", parameters, sessionStorage.getItem('globals')).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getActiveCurrencyListHome = function(parameters){
         var deferred = $q.defer();
        apiService.edit("getActiveCurrencyListHome", parameters).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        
        return deferred.promise;
    }

    var loginVerifyCodeWhenOTP = function(parameters) {
        var deferred = $q.defer();
        apiService.create("loginVerifyOTP", parameters).then(function(response) {
                if (response) {
                    if (angular.isDefined(response.token)) {
                        $rootScope.globals = response.token;
                        $http.defaults.headers.common['Authorization'] = 'Bearer ' + response.token;
                        sessionStorage.setItem('globals', $rootScope.globals);
                    }
                    deferred.resolve(response);
                } else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }
    var registerVerifyOTP = function(parameters) {
        var deferred = $q.defer();
        apiService.create("registerVerifyOTP", parameters).then(function(response) {
                if (response) {
                    deferred.resolve(response);
                } else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    loginService.accessLogin = accessLogin;
    loginService.sendRegistrationOTP = sendRegistrationOTP;
    loginService.registerUser = registerUser;
    loginService.emailLinkForgotPs = emailLinkForgotPs;
    loginService.forgotPassword = forgotPassword;
    loginService.getQR = getQR;
    loginService.verifyToken = verifyToken;
    loginService.verifyRegistrationToken = verifyRegistrationToken;
    loginService.verifyEmail = verifyEmail;
    loginService.emailLinkVerify = emailLinkVerify;
    loginService.emailLinkVerifyFromProfile = emailLinkVerifyFromProfile;
    loginService.checkLinkExpiry = checkLinkExpiry;
    loginService.checkEmailLinkExpiry = checkEmailLinkExpiry;
    loginService.loginVerifyCodeWhen2FA = loginVerifyCodeWhen2FA;
    loginService.verifyAdminToken = verifyAdminToken;
    loginService.ethBalance = ethBalance;
    loginService.btcBalance = btcBalance;
    loginService.dogeBalance = dogeBalance;
    loginService.ltcBalance = ltcBalance;
    loginService.getActiveCurrencyListHome = getActiveCurrencyListHome;
    loginService.loginVerifyCodeWhenOTP = loginVerifyCodeWhenOTP;
    loginService.registerVerifyOTP = registerVerifyOTP;

    return loginService;

}]);
