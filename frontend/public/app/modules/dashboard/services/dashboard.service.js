﻿// import { todayLowHigh } from "../../../../../../Routes/controller/customer/system_metrics";

dashboard.service('dashboardService', ['$http', '$q', 'apiService', 'appSettings', '$cookies', 'Upload', '$httpParamSerializer', function ($http, $q, apiService, appSettings, $cookies, Upload, $httpParamSerializer) {

    var dashboardService = {};





    //from Admin
    var getCurrencyList = function () {
        var deferred = $q.defer();
        apiService.get("getActiveCurrencyList", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    //from Admin
    var getTradePairList = function () {
        var deferred = $q.defer();
        apiService.get("getTradeCurrencyPairs", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getTradeCurrencyFromPairs = function (parameters) {
        var deferred = $q.defer();
        apiService.edit("getTradeCurrencyFromPairs", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    //from Admin
    var getDateFormat = function () {
        var deferred = $q.defer();
        apiService.get("getCustomerAdminSettings", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getExchangeRate = function () {
        var deferred = $q.defer();
        apiService.get("allCurrency", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var depositMoney = function (parameters) {
        var deferred = $q.defer();
        apiService.create("addmoney", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var withdrawMoneyRequest = function (parameters) {
        var deferred = $q.defer();
        apiService.create("withdrawMoneyRequest", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getEthAddress = function () {
        var deferred = $q.defer();
        apiService.get("ethUserAccount", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;

    }

    var ethBalance = function (parameters) {
        var deferred = $q.defer();
        apiService.create("ethBalance", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var btcBalance = function (parameters) {
        var deferred = $q.defer();
        apiService.create("btcBalance", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getBtcAddress = function () {
        var deferred = $q.defer();
        apiService.get("btcUserAccount", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getLtcAddress = function () {
        var deferred = $q.defer();
        apiService.get("ltcUserAccount", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getDogeAddress = function () {
        var deferred = $q.defer();
        apiService.get("dogeUserAccount", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getWallet = function (parameters) {
        var deferred = $q.defer();
        apiService.get("wallet", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }


    var getWalletInfoByCurrency = function (parameters) {
        var deferred = $q.defer();
        apiService.edit("singleWalletInfo", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getCountries = function () {
        var deferred = $q.defer();
        apiService.get("getCustomerCountries", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getStates = function (parameters) {
        var deferred = $q.defer();
        apiService.edit("getCustomerStatesByCountryId", parameters, sessionStorage.getItem('globals')).then(function (response) { // get call with params
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getCities = function (parameters) {
        var deferred = $q.defer();
        apiService.edit("getCustomerCitiesByStateId", parameters, sessionStorage.getItem('globals')).then(function (response) { //get call with params
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getCitiesByCountry = function (parameters) {
        var deferred = $q.defer();
        apiService.edit("getCustomerCitiesByCountryId", parameters, sessionStorage.getItem('globals')).then(function (response) { //get call with params
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var changePassword = function (parameters) {
        var deferred = $q.defer();
        apiService.create("changePassword", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    var getUserProfile = function () {
        var deferred = $q.defer();
        apiService.get("getProfile", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    var userProfile = function () {
        var deferred = $q.defer();
        apiService.get("getProfileInfo", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    var profileUpdate = function (parameters) {
        var deferred = $q.defer();
        apiService.create("profile", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    var userProfileEmailVerification = function () {
        var deferred = $q.defer();
        apiService.get("sendEmailLink", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };


    var getAccActivity = function (parameters) {
        var deferred = $q.defer();
        apiService.create("accountAcivity", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    // var getAccActivity_Date = function(parameters) {
    //     var deferred = $q.defer();
    //     apiService.create("accountAcivityFilter", parameters, sessionStorage.getItem('globals')).then(function(response) {
    //             if (response)
    //                 deferred.resolve(response);
    //             else
    //                 deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
    //         },
    //         function(response) {
    //             deferred.reject(response);
    //         });
    //     return deferred.promise;
    // };

    var kycData = function (parameters) {
        var deferred = $q.defer();
        apiService.create("documentData", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var upload = function (file, doc_type, doc_side) {
        var deferred = $q.defer();
        Upload.upload({
            url: appSettings.apiBase + 'upload/' + doc_type + '/' + doc_side, //webAPI exposed to upload the file // doc_side : front, back, none
            data: { photo: file },
            headers: { 'token': sessionStorage.getItem('globals') } //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            if (resp) {
                deferred.resolve(resp);
            } else {
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            }
        }, function (resp) { //catch error
            deferred.reject(resp);
        });
        return deferred.promise;
    };

    var getKycAddress = function () {
        var deferred = $q.defer();
        apiService.get("getAddress", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getKycIdInfo = function () {
        var deferred = $q.defer();
        apiService.get("getDocumentDetails", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getKYCData = function (parameter) {
        var deferred = $q.defer();
        apiService.create("getCustomerKYCData", parameter, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getImageFile = function (parameters) {
        var deferred = $q.defer();
        apiService.create("getImage", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var downloadFile = function (data) {
        //  var deferred = $q.defer();
        // var queryStringObj = angular.merge(data, { token: sessionStorage.getItem('globals') });
        // var query_string = $httpParamSerializer(queryStringObj);
        // var href="api/download?"+query_string;

        return data.path;
    }

    var getKycStatus = function (response) {
        var deferred = $q.defer();
        apiService.get("getKycStatus", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var logout = function (parameters) {
        var deferred = $q.defer();
        apiService.create("logout", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    var getAuthenticationStatus = function () {
        var deferred = $q.defer();
        apiService.get("getVerifyStatus", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var faStatus = function (parameters) {
        var deferred = $q.defer();
        apiService.create("faStatus", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var fiatDepositHistory = function (parameters) {
        var deferred = $q.defer();
        apiService.create("fiatDepositeHistory", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var withdrawHistory = function (parameters) {
        var deferred = $q.defer();
        apiService.create("withdrawHistory", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var btcDepositHistory = function () {
        var deferred = $q.defer();
        apiService.get("btcDepositHistory", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var ethDepositHistory = function () {
        var deferred = $q.defer();
        apiService.get("ethDepositHistory", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var userDefaultCountry = function () {
        var deferred = $q.defer();
        apiService.get("userDefaultCountry", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var adminAccountDetail = function () {
        var deferred = $q.defer();
        apiService.get("getAdminAccountDetails", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getCurrencyPairTrade = function () {
        var deferred = $q.defer();
        apiService.get("getCurrencyPairTrade", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getCurrencyPairSelected = function (parameters) {
        var deferred = $q.defer();
        apiService.edit("getCurrencyPairSelected", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var walletHistoryInr = function (parameters) {
        var deferred = $q.defer();
        apiService.create("getDepositWithdrawHistoryInr", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var walletHistoryCrypto = function (parameters) {
        var deferred = $q.defer();
        apiService.create("getDepositWithdrawHistoryCrypto", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }


    var walletHistoryCrypto = function (parameters) {
        var deferred = $q.defer();
        apiService.create("getDepositWithdrawHistoryCrypto", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }


    var getWalletCrypto = function (parameters) {
        var deferred = $q.defer();
        apiService.get("portfolio", sessionStorage.getItem('globals')).then(function (response) {
            if (response)

                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    // Graph Services
    var getDashboadGraphData = function () {
        var deferred = $q.defer();
        apiService.get("getDashboadGraphData", sessionStorage.getItem('globals')).then(function (response) {
            if (response) {
                deferred.resolve(response);
            }
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getBankDetails = function (parameters) {
        var deferred = $q.defer();
        apiService.get("getBankDetails", sessionStorage.getItem('globals')).then(function (response) {
            if (response) {
                deferred.resolve(response);
            }


            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var updateBankDetails = function (data) {
        var deferred = $q.defer();
        apiService.create("addBankDetails", data, sessionStorage.getItem('globals')).then(function (response) {
            if (response)

                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var uploadBankDocument = function (file, id) {
        var deferred = $q.defer();
        Upload.upload({
            url: appSettings.apiBase + 'uploadBankDocuments/' + id, //webAPI exposed to upload the file // doc_side : front, back, none
            data: { documents: file },
            headers: { 'token': sessionStorage.getItem('globals') } //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            if (resp) {
                deferred.resolve(resp);
            } else {
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            }
        }, function (resp) { //catch error
            deferred.reject(resp);
        });
        return deferred.promise;
    };


    var uploadDepositReceipt = function (file, reference_no) {
        var deferred = $q.defer();
        Upload.upload({
            url: appSettings.apiBase + 'uploadDepositeDocuments/' + reference_no, //webAPI exposed to upload the file // doc_side : front, back, none
            data: { documents: file },
            headers: { 'token': sessionStorage.getItem('globals') } //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            if (resp) {
                deferred.resolve(resp);
            } else {
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            }
        }, function (resp) { //catch error
            deferred.reject(resp);
        });
        return deferred.promise;
    };

    // For Admin Notifications
    var getAllCustomerNotification = function (parameters) {
        var deferred = $q.defer();
        apiService.get("getAllCustomerNotification", sessionStorage.getItem('globals')).then(function (response) {
            if (response) {
                deferred.resolve(response);
            } else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };
    // For Reset Admin Notifications
    var resetCustomerNotification = function (parameters) {
        var deferred = $q.defer();
        apiService.get("resetCustomerNotification", sessionStorage.getItem('globals')).then(function (response) {
            if (response) {
                deferred.resolve(response);
            } else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    // For Reset Admin Notifications
    var markNotificationRead = function (parameters) {
        var deferred = $q.defer();
        apiService.create("markNotificationRead", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response) {
                deferred.resolve(response);
            } else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    var getAllCustomerNotificationList = function (parameters) {
        var deferred = $q.defer();
        apiService.create("getAllCustomerNotificationList", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response) {
                deferred.resolve(response);
            } else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };


    var getTradeCurrencyPairsFrontend = function () {
        var deferred = $q.defer();
        apiService.get("getTradeCurrencyPairsFrontend", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var sendCustomerOTP = function (parameters) {
        var deferred = $q.defer();
        apiService.create('sendCustomerOTP', parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response) {
                deferred.resolve(response);
            } else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;

    };
    var changeCustomerOTP = function (parameters) {
        var deferred = $q.defer();
        apiService.create('changeCustomerOTP', parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response) {
                deferred.resolve(response);
            } else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;

    };

    var getBankStatus = function () {
        var deferred = $q.defer();
        apiService.get("getBankStatus", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    //graph service....................
    // var getHomeGraphData = function(from_currency, to_currency) {
    //     var deferred = $q.defer();

    //     apiService.create("getHomeGraphData", { 'from_currency': from_currency, 'to_currency': to_currency, 'limit': 100 }, sessionStorage.getItem('globals')).then(function(response) {
    //             if (response)
    //                 deferred.resolve(response);
    //             else
    //                 deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
    //         },
    //         function(response) {
    //             deferred.reject(response);
    //         });
    //     return deferred.promise;
    // }

    var histData = function (from_currency, timeSpan) {
        var deferred = $q.defer();
        apiService.get("histData?fromCurrency=" + from_currency + "&fromTS=" + timeSpan, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }


    var histToday = function (from_currency, timeSpan) {
        var deferred = $q.defer();
        apiService.get("histToday?fromCurrency=" + from_currency + "&fromTS=" + timeSpan, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var uploadKycDocuments = function (pan_img, aadhar_front_img, aadhar_back_img, id_pan, id_aadhar) {
        var deferred = $q.defer();
        Upload.upload({
            url: appSettings.apiBase + 'uploadKycDetails/' + id_pan + '/' + id_aadhar, //webAPI exposed to upload the file // doc_side : front, back, none
            data: { pan_img, aadhar_front_img, aadhar_back_img },
            headers: { 'token': sessionStorage.getItem('globals') } //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            if (resp) {
                deferred.resolve(resp);
            } else {
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            }
        }, function (resp) { //catch error
            deferred.reject(resp);
        });
        return deferred.promise;
    };

    var addCustomerKycDetails = function (param) {

        var deferred = $q.defer();
        apiService.create('customerKycDetails', param, sessionStorage.getItem('globals')).then(function (response) {
            if (response) {
                deferred.resolve(response);
            } else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getKycDetails = function () {
        var deferred = $q.defer();
        apiService.get("getKycDetails", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var get24HourVolume = function (pairId) {
        var deferred = $q.defer();
        apiService.get("24HourVolume/" + pairId, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getTodayHighLow = function (pairId) {
        var deferred = $q.defer();
        apiService.get("todayLowHigh/" + pairId, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getYearlyHighLow = function (pairId) {
        var deferred = $q.defer();
        apiService.get("yearlyLowHigh/" + pairId, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getWalletHistory = function (days) {

        var deferred = $q.defer();
        apiService.get("walletHistory/?limit=" + days, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var uploadProfileImage = function (file) {
        var deferred = $q.defer();
        Upload.upload({
            url: appSettings.apiBase + 'uploadProfileImage', //webAPI exposed to upload the file // doc_side : front, back, none
            data: { profile_image: file },
            headers: { 'token': sessionStorage.getItem('globals') } //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            if (resp) {
                deferred.resolve(resp.data);
            } else {
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            }
        }, function (resp) { //catch error
            deferred.reject(resp);
        });
        return deferred.promise;
    }


    var inActiveBalance = function () {
        var deferred = $q.defer();
        apiService.get("inActiveBalance", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    var getIframeToken = function () {
        var deferred = $q.defer();
        apiService.create("getIframeToken", {}, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    var getWalletCryptoDetails = function (parameters) {
        var deferred = $q.defer();
        apiService.get("portfolioDetails", sessionStorage.getItem('globals')).then(function (response) {
            if (response)

                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var transactionHistory = function (parameters) {
        var deferred = $q.defer();

        apiService.create("transactionHistory", parameters, sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getQRCodeByCurrency = function (parameters) {
        var deferred = $q.defer();
        apiService.edit("getQRCodeByCurrency", parameters, sessionStorage.getItem('globals')).then(function (response) { //get call with params
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getLiveCustomers = function () {
        var deferred = $q.defer();
        apiService.get("getLiveCustomers", sessionStorage.getItem('globals')).then(function (response) {
            if (response)
                deferred.resolve(response);
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });
        return deferred.promise;

    }

    var uploadKYC = function (filesObj, adminAprovalStatus) {
        var deferred = $q.defer();
        let no = 0;
        Object.keys(filesObj).forEach((e) => {
            no++;
            Upload.upload({
                url: appSettings.apiBase + 'uploadKycForm/?id=' + e + '&&total=' + Object.keys(filesObj).length + '&&no=' + no + '&&adminAprovalStatus=' + adminAprovalStatus, //webAPI exposed to upload the file // doc_side : front, back, none
                data: { kyc_form: filesObj[e] },
                headers: { 'token': sessionStorage.getItem('globals') } //pass file as data, should be user ng-model
            }).then(function (resp) { //upload function returns a promise
                if (resp) {
                    deferred.resolve(resp.data);
                } else {
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                }
            }, function (resp) { //catch error
                deferred.reject(resp);
            });
        })
        /*        let files = [];
                files.push(file)
                files.push(file1)
        
                let i = 0;
        files.forEach((e)=>{
        i++;
                Upload.upload({
                    url: appSettings.apiBase + 'uploadKycForm/?id='+i+'&&total='+Object.keys(filesObj).length, //webAPI exposed to upload the file // doc_side : front, back, none
                    data: { kyc_form: e },
                    headers: { 'token': sessionStorage.getItem('globals') } //pass file as data, should be user ng-model
                }).then(function(resp) { //upload function returns a promise
                    if (resp) {
                        deferred.resolve(resp.data);
                    } else {
        
                        deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    }
                }, function(resp) { //catch error
                    deferred.reject(resp);
                });
        })*/
        return deferred.promise;
    }

    var uploadKYCFields = function (filesObj, adminAprovalStatus) {
        let files_arr = [];
        Object.keys(filesObj).forEach((e) => {
            if(e === "kyc_form"){
                files_arr[0] = filesObj[e];
            }
            if(e === "selfie_photo"){
                files_arr[1] = filesObj[e];
            }
            if(e === "identity_doc"){
                files_arr[2] = filesObj[e];
            }
            if(e === "address_doc"){
                files_arr[3] = filesObj[e];
            }
            if(e === "fund_source"){
                files_arr[4] = filesObj[e];
            }
            if(e === "transfer_purpose"){
                files_arr[5] = filesObj[e];
            }
        });
        // filesObj
        var deferred = $q.defer();

        let no = 0;
        // Object.keys(filesObj).forEach((e)=>{
        // no++;
        Upload.upload({
            url: appSettings.apiBase + 'uploadKycForm/?id=' + 0 + '&&total=' + Object.keys(filesObj).length + '&&no=' + no + '&&adminAprovalStatus=' + adminAprovalStatus, //webAPI exposed to upload the file // doc_side : front, back, none
            arrayKey: '',
            data: {
                kyc_form: files_arr[0],
                selfie_photo: files_arr[1],
                identity_doc: files_arr[2],
                address_doc: files_arr[3],
                fund_source: files_arr[4],
                transfer_purpose: files_arr[5]
            },
            headers: { 'token': sessionStorage.getItem('globals') } 
        }).then(function (resp) { 
            if (resp) {
                deferred.resolve(resp.data);
            } else {

                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            }
        }, function (resp) { 
            deferred.reject(resp);
        });
        return deferred.promise;
    }


    var getKycDetails = function () {
        var deferred = $q.defer();
        apiService.get("getKYCDetails", sessionStorage.getItem('globals')).then(function (response) {
            if (response) {
                deferred.resolve(response);
            }
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
            function (response) {
                deferred.reject(response);
            });

        return deferred.promise;
    }

    dashboardService.getCurrencyList = getCurrencyList;
    dashboardService.getTradePairList = getTradePairList;
    dashboardService.getDateFormat = getDateFormat;
    dashboardService.getExchangeRate = getExchangeRate;
    dashboardService.depositMoney = depositMoney;
    dashboardService.withdrawMoneyRequest = withdrawMoneyRequest;
    dashboardService.getEthAddress = getEthAddress;
    dashboardService.ethBalance = ethBalance;
    dashboardService.btcBalance = btcBalance;
    dashboardService.getBtcAddress = getBtcAddress;
    dashboardService.getLtcAddress = getLtcAddress;
    dashboardService.getDogeAddress = getDogeAddress;
    dashboardService.getWallet = getWallet;
    dashboardService.getWalletInfoByCurrency = getWalletInfoByCurrency;
    dashboardService.getCountries = getCountries;
    dashboardService.getStates = getStates;
    dashboardService.getCities = getCities;
    dashboardService.getCitiesByCountry = getCitiesByCountry;
    dashboardService.changePassword = changePassword;
    dashboardService.getUserProfile = getUserProfile;
    dashboardService.userProfile = userProfile;
    dashboardService.profileUpdate = profileUpdate;
    dashboardService.userProfileEmailVerification = userProfileEmailVerification;
    dashboardService.getAccActivity = getAccActivity;
    //  dashboardService.getAccActivity_Date = getAccActivity_Date;
    dashboardService.kycData = kycData;
    dashboardService.upload = upload;
    dashboardService.getKycAddress = getKycAddress;
    dashboardService.getKycIdInfo = getKycIdInfo;
    dashboardService.getKYCData = getKYCData;
    dashboardService.getImageFile = getImageFile;
    dashboardService.downloadFile = downloadFile;
    dashboardService.getKycStatus = getKycStatus;
    dashboardService.logout = logout;
    dashboardService.getAuthenticationStatus = getAuthenticationStatus;
    dashboardService.faStatus = faStatus;
    dashboardService.fiatDepositHistory = fiatDepositHistory;
    dashboardService.withdrawHistory = withdrawHistory;
    dashboardService.btcDepositHistory = btcDepositHistory;
    dashboardService.ethDepositHistory = ethDepositHistory;
    dashboardService.userDefaultCountry = userDefaultCountry;
    dashboardService.adminAccountDetail = adminAccountDetail;
    dashboardService.walletHistoryInr = walletHistoryInr;
    dashboardService.walletHistoryCrypto = walletHistoryCrypto;
    dashboardService.getWalletCrypto = getWalletCrypto;
    dashboardService.getDashboadGraphData = getDashboadGraphData;
    dashboardService.getBankDetails = getBankDetails;
    dashboardService.updateBankDetails = updateBankDetails;
    dashboardService.uploadBankDocument = uploadBankDocument;
    dashboardService.uploadDepositReceipt = uploadDepositReceipt;
    dashboardService.getAllCustomerNotification = getAllCustomerNotification;
    dashboardService.resetCustomerNotification = resetCustomerNotification;
    dashboardService.markNotificationRead = markNotificationRead;
    dashboardService.getAllCustomerNotificationList = getAllCustomerNotificationList;
    dashboardService.getTradeCurrencyPairsFrontend = getTradeCurrencyPairsFrontend;
    dashboardService.sendCustomerOTP = sendCustomerOTP;
    dashboardService.getBankStatus = getBankStatus;
    // dashboardService.getHomeGraphData = getHomeGraphData;
    dashboardService.uploadKycDocuments = uploadKycDocuments;
    dashboardService.addCustomerKycDetails = addCustomerKycDetails;
    dashboardService.getKycDetails = getKycDetails;
    dashboardService.getTodayHighLow = getTodayHighLow;
    dashboardService.get24HourVolume = get24HourVolume;
    dashboardService.getYearlyHighLow = getYearlyHighLow;
    dashboardService.getWalletHistory = getWalletHistory;
    dashboardService.uploadProfileImage = uploadProfileImage;
    dashboardService.histData = histData;
    dashboardService.histToday = histToday;
    dashboardService.inActiveBalance = inActiveBalance;
    dashboardService.getIframeToken = getIframeToken;
    dashboardService.getWalletCryptoDetails = getWalletCryptoDetails;
    dashboardService.changeCustomerOTP = changeCustomerOTP;
    dashboardService.transactionHistory = transactionHistory;
    dashboardService.getCurrencyPairTrade = getCurrencyPairTrade;
    dashboardService.getCurrencyPairSelected = getCurrencyPairSelected;

    dashboardService.getQRCodeByCurrency = getQRCodeByCurrency;
    dashboardService.getLiveCustomers = getLiveCustomers;
    dashboardService.getTradeCurrencyFromPairs = getTradeCurrencyFromPairs;
    dashboardService.uploadKYC = uploadKYC;
    dashboardService.uploadKYCFields = uploadKYCFields;
    dashboardService.getKycDetails = getKycDetails;

    return dashboardService;

}]);
