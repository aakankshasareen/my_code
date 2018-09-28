admin.service(
    'adminService', ['$http', '$q', 'apiService', '$rootScope', '$cookies', 'Upload', 'appSettings', '$httpParamSerializer',
        function($http, $q, apiService, $rootScope, $cookies, Upload, appSettings, $httpParamSerializer) {

            var adminService = {};
            var storeData;
            var getData = function(key) {
                storeData = sessionStorage.getItem(key);
                //                    console.log('key' + key + 'vc ' + storeData);
                return storeData;
            }

            var setData = function(key, value) {
                //                    console.log("service" + value);
                sessionStorage.setItem(key, value)
                storeData = sessionStorage.getItem(key);
                //                    console.log('key222' + key + 'vc ' + storeData);
            }

            //service to communicate with users model to verify login credentials
            var accessLogin = function(parameters) {
                var deferred = $q.defer();
                apiService.create("adminLogin", parameters).then(function(response) {
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
            var addCurrency = function(parameters) {
                var deferred = $q.defer();
                apiService.create("addCurrency", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var editCurrency = function(parameters) {

                var deferred = $q.defer();
                apiService.edit("editCurrency", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getAdminActiveCurrencyList = function(parameters) {
                var deferred = $q.defer();
                apiService.edit("getAdminActiveCurrencyList", parameters, sessionStorage.getItem('globals')).then(function(response) {

                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var getAdminActiveCurrencyListFiat = function(parameters) {

                var deferred = $q.defer();
                apiService.edit("getAdminActiveCurrencyListFiat", parameters, sessionStorage.getItem('globals')).then(function(response) {

                        if (response) {

                            deferred.resolve(response);
                        } else {

                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                        }
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var getAllCurrencyList = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getAllCurrencyList", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var updateCurrency = function(parameters) {
                var deferred = $q.defer();
                apiService.update("updateCurrency", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var deleteCurrency = function(parameters) {
                var deferred = $q.defer();
                apiService.delet("deleteCurrency", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getActiveCurrencyList = function(parameters) {
                var deferred = $q.defer();
                apiService.edit("getActiveCurrencyList", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var saveCurrencyPairs = function(parameters) {
                var deferred = $q.defer();
                apiService.create("saveCurrencyPairs", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getAllTradeCurrencyPairs = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getAllTradeCurrencyPairs", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var updateDefaultPair = function(parameters) {
                var deferred = $q.defer();
                apiService.update("updateDefaultPair", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var deleteCurrencyPair = function(parameters) {
                var deferred = $q.defer();
                apiService.delet("deleteCurrencyPair", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            //                var getCommissionByCurrencyCode = function (parameters) {
            //                    var deferred = $q.defer();
            //                    apiService.edit("getCommissionByCurrencyCode", parameters, sessionStorage.getItem('globals')).then(function (response) {
            //                        if (response) {
            //                            deferred.resolve(response);
            //                        } else
            //                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            //                    },
            //                            function (response) {
            //                                deferred.reject(response);
            //                            });
            //                    return deferred.promise;
            //                };
            var updateCommission = function(parameters) {
                var deferred = $q.defer();
                apiService.create("updateCommission", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            //                var getTradeLimitByCurrencyCode = function (parameters) {
            //                    var deferred = $q.defer();
            //                    apiService.edit("getTradeLimitByCurrencyCode", parameters, sessionStorage.getItem('globals')).then(function (response) {
            //                        if (response) {
            //                            deferred.resolve(response);
            //                        } else
            //                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            //                    },
            //                            function (response) {
            //                                deferred.reject(response);
            //                            });
            //                    return deferred.promise;
            //                };
            var updateTradeLimit = function(parameters) {
                var deferred = $q.defer();
                apiService.create("updateTradeLimit", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var updateCurrencyPairsOrder = function(parameters) {
                var deferred = $q.defer();
                apiService.create("updateCurrencyPairsOrder", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var updateCurrencyPairOrder = function(parameters) {
                var deferred = $q.defer();
                apiService.create("updateCurrencyPairOrder", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getCommissions = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getCommissions", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getTradeLimits = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getTradeLimits", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getAllCountryList = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getAllCountryList", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getAllRoleList = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getAllRoleList", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response != null && response.status == -2) {
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                        } else
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getRoleList = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getRoleList", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response != null && response.status == -2) {
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                        } else
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var editBackendUser = function(parameters) {
                var deferred = $q.defer();
                apiService.edit("editBackendUser", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var updateAdminUser = function(parameters) {
                var deferred = $q.defer();
                apiService.create("updateAdminUser", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getAllPermission = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getAllPermission", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getAllAdminUserList = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getAllAdminUserList", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response != null && response.status == -2) {
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                        } else
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            //service to communicate with users to save a new user
            var registerAdminUser = function(parameters) {
                var deferred = $q.defer();
                apiService.create("registerAdminUser", parameters, sessionStorage.getItem('globals')).then(function(response) {
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
            var getCountryList = function(parameters) {
                var deferred = $q.defer();
                apiService.get("getCountries", sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var addCountry = function(parameters) {
                var deferred = $q.defer();
                apiService.create("addCountry", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var editCountry = function(parameters) {

                var deferred = $q.defer();
                apiService.edit("editCountry", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var updateCountry = function(parameters) {
                var deferred = $q.defer();
                apiService.update("updateCountry", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var deleteCountry = function(parameters) {
                var deferred = $q.defer();
                apiService.delet("deleteCountry", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getAllStateList = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getAllStateList", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var addState = function(parameters) {
                var deferred = $q.defer();
                apiService.create("addState", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var editState = function(parameters) {

                var deferred = $q.defer();
                apiService.edit("editState", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var updateState = function(parameters) {
                var deferred = $q.defer();
                apiService.update("updateState", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var deleteState = function(parameters) {
                var deferred = $q.defer();
                apiService.delet("deleteState", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getAllCityList = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getAllCityList", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var addCity = function(parameters) {
                var deferred = $q.defer();
                apiService.create("addCity", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var editCity = function(parameters) {

                var deferred = $q.defer();
                apiService.edit("editCity", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var updateCity = function(parameters) {
                var deferred = $q.defer();
                apiService.update("updateCity", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var deleteCity = function(parameters) {
                var deferred = $q.defer();
                apiService.delet("deleteCity", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getStatesByCountryId = function(parameters) {

                var deferred = $q.defer();
                apiService.edit("getStatesByCountryId", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var upload = function(file) {

                var deferred = $q.defer();
                Upload.upload({
                    url: appSettings.apiBase + 'upload/', //webAPI exposed to upload the file
                    data: { file: file },
                    headers: { 'token': sessionStorage.getItem('globals') } //pass file as data, should be user ng-model
                }).then(function(resp) { //upload function returns a promise
                    if (resp) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    }
                }, function(resp) { //catch error
                    deferred.reject(resp);
                });
                return deferred.promise;
            };
            var getAllCustomerList = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getAllCustomerList", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            // For Dashboard
            var getTotalUsers = function(parameters) {
                var deferred = $q.defer();
                apiService.get("getTotalUsers", sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            // For Dashboard
            var getTotalCustomerByKycStatus = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getTotalCustomerByKycStatus", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            // For Dashboard
            var getTotalActiveCurrencies = function(parameters) {
                var deferred = $q.defer();
                apiService.get("getTotalActiveCurrencies", sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            // For Dashboard
            var getActiveCurrencyIcons = function(parameters) {
                var deferred = $q.defer();
                apiService.get("getActiveCurrencyIcons", sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            // For Dashboard
            var getNewCustomers = function(parameters) {
                var deferred = $q.defer();
                apiService.get("getNewCustomers", sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            //For Dashboard
            var getLiveUsers = function(parameters) {
                var deferred = $q.defer();
                apiService.get("getLiveUsers", sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var getTradeCurrencyPairs = function(parameters) {
                var deferred = $q.defer();
                apiService.get("getTradeCurrencyPairs", sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getAllLastTradePrice = function(parameters) {
                var deferred = $q.defer();
                apiService.get("getAllLastTradePrice", sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var updateSettings = function(parameters) {
                var deferred = $q.defer();
                apiService.create("updateSettings", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getAdminSettings = function(parameters) {

                var deferred = $q.defer();
                apiService.get("getAdminSettings", sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var editCustomerProfile = function(parameters) {

                var deferred = $q.defer();
                apiService.edit("editCustomerProfile", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var updateCustomerProfile = function(parameters) {
                var deferred = $q.defer();
                apiService.update("updateCustomerProfile", parameters, sessionStorage.getItem('globals')).then(function(response) {
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
            var updatePairStatus = function(parameters) {
                var deferred = $q.defer();
                apiService.create("updatePairStatus", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var kycData = function(parameters) {
                var deferred = $q.defer();
                apiService.update("documentDataAdmin", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

            var uploadKyc = function(file, customer_id, doc_type, doc_side) {
                // console.log(doc_side);
                var deferred = $q.defer();
                Upload.upload({
                    url: appSettings.apiBase + 'uploadKyc/' + customer_id + '/' + doc_type + '/' + doc_side, //webAPI exposed to upload the file
                    data: { photo: file },
                    headers: { 'token': sessionStorage.getItem('globals') } //pass file as data, should be user ng-model
                }).then(function(resp) { //upload function returns a promise
                    if (resp) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    }
                }, function(resp) { //catch error
                    deferred.reject(resp);
                });
                return deferred.promise;
            };
            var getKycIdInfoById = function(parameters) {
                var deferred = $q.defer();
                apiService.edit("getDocumentDetailsById", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

            var downloadFile = function(data) {
                //  var deferred = $q.defer();
                // var queryStringObj = angular.merge(data);
                // var query_string = $httpParamSerializer(queryStringObj);
                // var href = "api/downloadAdmin?" + query_string;
                // return href;
                return data.path;
            }

            var getKycAddressById = function(parameters) {
                var deferred = $q.defer();
                apiService.edit("getAddressById", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

            var approveKYC = function(parameters) {
                var deferred = $q.defer();
                apiService.create("approveKYC", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

            var addRole = function(parameters) {
                var deferred = $q.defer();
                apiService.create("addRole", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var addRolePermission = function(parameters) {
                var deferred = $q.defer();
                apiService.create("addRolePermission", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var editRole = function(parameters) {
                var deferred = $q.defer();
                apiService.edit("editRole", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var updateRole = function(parameters) {
                var deferred = $q.defer();
                apiService.update("updateRole", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var deleteRole = function(parameters) {
                var deferred = $q.defer();
                apiService.delet("deleteRole", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var deleteAdminUser = function(parameters) {
                var deferred = $q.defer();
                apiService.delet("deleteAdminUser", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getAllWithdrawRequestList = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getAllWithdrawRequestList", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var approveWithdrawRequest = function(parameters) {
                var deferred = $q.defer();
                apiService.create("approveWithdrawRequest", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

            var getAllKYCMasterList = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getAllKYCMasterList", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

            var addKYC = function(parameters) {
                var deferred = $q.defer();
                apiService.create("addKYC", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var editKYC = function(parameters) {

                var deferred = $q.defer();
                apiService.edit("editKYC", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var updateKYC = function(parameters) {
                var deferred = $q.defer();
                apiService.update("updateKYC", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getFaqList = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getFaqList", parameters, sessionStorage.getItem('globals')).then(function(response) {

                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var addFaq = function(parameters) {
                var deferred = $q.defer();
                apiService.create("addFaq", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var editFaq = function(parameters) {

                var deferred = $q.defer();
                apiService.edit("editFaq", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var updateFaq = function(parameters) {
                var deferred = $q.defer();
                apiService.update("updateFaq", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var deleteFaq = function(parameters) {

                var deferred = $q.defer();
                apiService.delet("deleteFaq", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getFaqCategoryList = function(parameters) {
                var deferred = $q.defer();
                apiService.get("getFaqCategoryList", sessionStorage.getItem('globals')).then(function(response) {

                        if (response) {

                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getEmailTemplateList = function(parameters) {

                var deferred = $q.defer();
                apiService.create("getEmailTemplateList", parameters, sessionStorage.getItem('globals')).then(function(response) {

                        if (response) {

                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var addEmailTemplate = function(parameters) {
                var deferred = $q.defer();
                apiService.create("addEmailTemplate", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var uploadEmailTemplate = function(file) {

                //console.log(file);
                var deferred = $q.defer();
                Upload.upload({
                    url: appSettings.apiBase + 'uploadEmailTemplateDoc/', //webAPI exposed to upload the file
                    data: { file: file },
                    headers: { 'token': sessionStorage.getItem('globals') } //pass file as data, should be user ng-model
                }).then(function(resp) { //upload function returns a promise
                    if (resp) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    }
                }, function(resp) { //catch error
                    deferred.reject(resp);
                });
                return deferred.promise;
            };
            var editEmailTemplate = function(parameters) {

                var deferred = $q.defer();
                apiService.edit("editEmailTemplate", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var updateEmailTemplate = function(parameters) {
                var deferred = $q.defer();
                apiService.update("updateEmailTemplate", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var deleteEmailTemplate = function(parameters) {

                var deferred = $q.defer();
                apiService.delet("deleteEmailTemplate", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getSmsTemplateList = function(parameters) {

                var deferred = $q.defer();
                apiService.create("getSmsTemplateList", parameters, sessionStorage.getItem('globals')).then(function(response) {

                        if (response) {

                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getSmsTemplateById = function(id) {
                var deferred = $q.defer();
                apiService.get("getSmsTemplateById?id=" + id, sessionStorage.getItem('globals')).then(function(response) {
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

            var addSmsTemplate = function(parameters) {
                var deferred = $q.defer();
                apiService.create("addSmsTemplate", parameters, sessionStorage.getItem('globals')).then(function(response) {

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
            var updateSmsTemplate = function(parameters) {
                var deferred = $q.defer();
                apiService.create("updateSmsTemplate", parameters, sessionStorage.getItem('globals')).then(function(response) {

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
            var getSupportListAdmin = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getSupportListAdmin", parameters, sessionStorage.getItem('globals')).then(function(response) {

                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };


            var getContactListAdmin = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getContactListAdmin", parameters, sessionStorage.getItem('globals')).then(function(response) {

                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var deleteSupport = function(parameters) {

                var deferred = $q.defer();
                apiService.delet("deleteSupport", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var adminLogout = function(parameters) {
                var deferred = $q.defer();
                apiService.create("adminLogout", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

            var userProfileAdmin = function() {
                var deferred = $q.defer();
                apiService.get("getProfileInfoAdmin", sessionStorage.getItem('globals')).then(function(response) {
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

            var disapproveWithdrawRequest = function(parameters) {
                var deferred = $q.defer();
                apiService.create("disapproveWithdrawRequest", parameters, sessionStorage.getItem('globals')).then(function(response) {
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


            var repplySupport = function(parameters) {

                var deferred = $q.defer();
                apiService.update("repplySupportTeam", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var addSupportComment = function(parameters) {
                var deferred = $q.defer();
                apiService.create("addSupportCommentTeam", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };


            var getImageData = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getImageData", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

            var changeStatus = function(parameters) {

                var deferred = $q.defer();
                apiService.update("changeStatus", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var updateSupportStatus = function(parameters) {
                var deferred = $q.defer();
                apiService.update("updateSupportStatus", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var reOpenTicket = function(parameters) {
                var deferred = $q.defer();
                apiService.update("reOpenTicket", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var getTotalDeposit = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getTotalDepositAmount", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

            var getTotalWithdrawal = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getTotalWithdrawAmount", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

            var editMyProfile = function(parameters) {

                var deferred = $q.defer();
                apiService.get("editMyProfile", sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var updateMyProfile = function(parameters) {
                var deferred = $q.defer();
                apiService.create("updateMyProfile", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

            var sendMailLinkForgotPs = function(parameters) {
                var deferred = $q.defer();
                apiService.create("forgotEmail", parameters, sessionStorage.getItem('globals')).then(function(response) {
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


            var resetAdminPassword = function(parameters) {

                var deferred = $q.defer();
                apiService.create("resetAdminPassword", parameters).then(function(response) {
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

            var checkForgotPassLinkExpiry = function(parameters) {
                var deferred = $q.defer();
                apiService.create("checkAdminPasswordToken", parameters).then(function(response) {
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

            var adminChangePassword = function(parameters) {
                var deferred = $q.defer();
                apiService.create("adminchangePassword", parameters, sessionStorage.getItem('globals')).then(function(response) {

                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };


            var transactionReportAdmin = function(parameters) {

                var deferred = $q.defer();
                apiService.create("transactionReportAdmin", parameters, sessionStorage.getItem('globals')).then(function(response) {

                        if (response) {

                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var transactionReportCustomerAdmin = function(parameters) {
                var deferred = $q.defer();
                apiService.get("transactionReportCustomerAdmin", sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };


            var getKYCData = function(parameter) {
                var deferred = $q.defer();
                apiService.create("getKYCData", parameter, sessionStorage.getItem('globals')).then(function(response) {
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


            var getQRCode = function(data) {
                var deferred = $q.defer();
                apiService.create("admin/qrcode", data, sessionStorage.getItem('globals')).then(function(response) {
                    if (response) {
                        deferred.resolve(response);
                    } else {
                        deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    }
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            }

            var setFaStatus = function(parameters) {
                var deferred = $q.defer();
                apiService.create("admin/faStatus", parameters, sessionStorage.getItem('globals')).then(function(response) {
                    if (response.success) {
                        $rootScope.globals = response.token;
                        $http.defaults.headers.common['Authorization'] = 'Bearer ' + response.token;
                        sessionStorage.setItem('globals', $rootScope.globals);
                        deferred.resolve(response);
                    } else
                        deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                });
                return deferred.promise;

            }

            var marketCurrencypairadmin = function(parameters) {
                var deferred = $q.defer();
                apiService.get("marketCurrencypairadmin", sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var getWithdrawRequestById = function(parameters) {
                var deferred = $q.defer();
                apiService.edit("getWithdrawRequestById", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var addAmountToWallet = function(parameters) {
                var deferred = $q.defer();
                apiService.create("addAmountToWallet", parameters, sessionStorage.getItem('globals')).then(function(response) {
                    if (response) {
                        deferred.resolve(response);
                    } else {
                        deferred.reject(response);
                    }
                }, function(response) {
                    deferred.reject(response);
                })
                return deferred.promise;
            }

            var updateWithdrawRequest = function(parameters) {
                var deferred = $q.defer();
                apiService.create("updateWithdrawRequest", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var getAllDepositRequestList = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getAllDepositRequestList", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var approveDepositRequest = function(parameters) {
                var deferred = $q.defer();
                apiService.create("approveDepositRequest", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

            var disapproveDepositRequest = function(parameters) {
                var deferred = $q.defer();
                apiService.create("disapproveDepositRequest", parameters, sessionStorage.getItem('globals')).then(function(response) {
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



            var getDepositRequestById = function(parameters) {
                var deferred = $q.defer();
                apiService.edit("getDepositRequestById", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };


            var updateDepositRequest = function(parameters) {
                var deferred = $q.defer();
                apiService.create("updateDepositRequest", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var customerReportAdmin = function(parameters) {

                var deferred = $q.defer();
                apiService.create("customerReportAdmin", parameters, sessionStorage.getItem('globals')).then(function(response) {

                        if (response) {

                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };


            var addAmountToWallet = function(parameters) {
                var deferred = $q.defer();
                apiService.create("addAmountToWallet", parameters, sessionStorage.getItem('globals')).then(function(response) {
                    if (response) {
                        deferred.resolve(response);
                    } else {
                        deferred.reject(response);
                    }
                }, function(response) {
                    deferred.reject(response);
                })
                return deferred.promise;
            }


            var getBankDetails = function(customerId) {
                var deferred = $q.defer();
                apiService.get('admin/getBankDetailsByCustomerId/' + customerId, sessionStorage.getItem('globals')).then(function(response) {
                    if (response)
                        deferred.resolve(response);
                    else
                        deferred.reject('Something went wrong while processing your request. Please Contact Administrator.')
                }, function(response) {
                    deferred.reject(response);
                })
                return deferred.promise;
            }

            var updateBankDetailsStatus = function(data) {
                var deferred = $q.defer();
                apiService.create('admin/updateBankDetailsStatus', data, sessionStorage.getItem('globals')).then(function(response) {
                    if (response)
                        deferred.resolve(response);
                    else
                        deferred.reject('Something went wrong while processing your request. Please Contact Administrator');
                }, function(response) {
                    deferred.reject(response);
                })
                return deferred.promise;
            }

            // For Admin Notifications
            var getAllNotification = function(parameters) {
                var deferred = $q.defer();
                apiService.get("getAllNotification", sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            // For Reset Admin Notifications
            var resetAdminNotification = function(parameters) {
                var deferred = $q.defer();
                apiService.get("resetAdminNotification", sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            // For Reset Admin Notifications
            var markNotificationRead = function(parameters) {
                var deferred = $q.defer();
                apiService.create("markNotificationRead", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var getAllNotificationList = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getAllNotificationList", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var getTradeCurrencyPairsFrontend = function() {
                var deferred = $q.defer();
                apiService.get("getTradeCurrencyPairsFrontend", sessionStorage.getItem('globals')).then(function(response) {
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

            var getDepositReport = function(parameters) {
                var deferred = $q.defer();
                apiService.create("DepositeReport", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

            var getWithdrawalReport = function(parameters) {
                var deferred = $q.defer();
                apiService.create("withdrawalReport", parameters, sessionStorage.getItem('globals')).then(function(response) {
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
            //KYC NEW
            var getKycDetais = function(parameters) {
                var deferred = $q.defer();
                apiService.edit("getKYCDetails", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

            var getActivityDetails = function(parameters) {


                var deferred = $q.defer();
                apiService.create("adminUserActivity", parameters, sessionStorage.getItem('globals')).then(function(response) {
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
            var getUserDepositRequestList = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getUserDepositRequestList", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var getUserWithdrawRequestList = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getUserWithdrawRequestList", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var getCustomerWalletReport = function(parameters) {

                var deferred = $q.defer();
                apiService.edit("getCustomerWalletReport", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };


            var getCustomerTradeDetails = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getCustomerTradeDetails", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var getUserInfoData = function(parameters) {

                var deferred = $q.defer();
                apiService.edit("getUserInfoData", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var customerOpenOrder = function(parameters) {
                var deferred = $q.defer();
                apiService.create("customerOpenOrder", parameters, sessionStorage.getItem('globals')).then(function(response) {

                        if (response) {

                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
            var getOrderBookList = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getListOrderBook", parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };
           
            var getTotalFee = function(parameters) {
                
                var deferred = $q.defer();
                apiService.create("getTotalFee",parameters, sessionStorage.getItem('globals')).then(function(response) {
                        if (response) {
                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var getAllCryptoFeeDetails = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getAllCryptoFeeDetails", parameters, sessionStorage.getItem('globals')).then(function(response) {

                        if (response) {

                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var getAllFiatFeeDetails = function(parameters) {
                var deferred = $q.defer();
                apiService.create("getAllFiatFeeDetails", parameters, sessionStorage.getItem('globals')).then(function(response) {

                        if (response) {

                            deferred.resolve(response);
                        } else
                            deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
                    },
                    function(response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var blockMultiple = function (parameters) {
                
                var deferred = $q.defer();
                apiService.create("blockMultiple", parameters, sessionStorage.getItem('globals')).then(function (response) {
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
            var unblockMultiple = function (parameters) {
                var deferred = $q.defer();
                apiService.create("unblockMultiple", parameters, sessionStorage.getItem('globals')).then(function (response) {
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
            var blockCustomer = function (parameters) {
                var deferred = $q.defer();
                apiService.update("blockCustomer", parameters, sessionStorage.getItem('globals')).then(function (response) {
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
            var unblockCustomer = function (parameters) {
                var deferred = $q.defer();
                apiService.update("unblockCustomer", parameters, sessionStorage.getItem('globals')).then(function (response) {
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

            adminService.accessLogin = accessLogin;
            adminService.addCurrency = addCurrency;
            adminService.getAllCurrencyList = getAllCurrencyList;
            adminService.editCurrency = editCurrency;
            adminService.updateCurrency = updateCurrency;
            adminService.deleteCurrency = deleteCurrency;
            adminService.getAdminActiveCurrencyList = getAdminActiveCurrencyList;
            adminService.saveCurrencyPairs = saveCurrencyPairs;
            adminService.getAllTradeCurrencyPairs = getAllTradeCurrencyPairs;
            adminService.getAllLastTradePrice = getAllLastTradePrice;
            adminService.updateDefaultPair = updateDefaultPair;
            adminService.deleteCurrencyPair = deleteCurrencyPair;
            //adminService.getCommissionByCurrencyCode = getCommissionByCurrencyCode;
            adminService.updateCommission = updateCommission;
            //adminService.getTradeLimitByCurrencyCode = getTradeLimitByCurrencyCode;
            adminService.updateTradeLimit = updateTradeLimit;
            adminService.updateCurrencyPairsOrder = updateCurrencyPairsOrder;
            adminService.updateCurrencyPairOrder = updateCurrencyPairOrder;
            adminService.setData = setData;
            adminService.getData = getData;
            adminService.getCommissions = getCommissions;
            adminService.getTradeLimits = getTradeLimits;
            adminService.getAllCountryList = getAllCountryList;
            adminService.getCountryList = getCountryList;
            adminService.addCountry = addCountry;
            adminService.editCountry = editCountry;
            adminService.updateCountry = updateCountry;
            adminService.deleteCountry = deleteCountry;
            adminService.getAllStateList = getAllStateList;
            adminService.addState = addState;
            adminService.editState = editState;
            adminService.updateState = updateState;
            adminService.deleteState = deleteState;
            adminService.getAllCityList = getAllCityList;
            adminService.addCity = addCity;
            adminService.editCity = editCity;
            adminService.updateCity = updateCity;
            adminService.deleteCity = deleteCity;
            adminService.getStatesByCountryId = getStatesByCountryId;
            adminService.upload = upload;
            adminService.getAllCustomerList = getAllCustomerList;
            adminService.getTotalUsers = getTotalUsers;
            adminService.getTotalCustomerByKycStatus = getTotalCustomerByKycStatus;
            adminService.getTotalActiveCurrencies = getTotalActiveCurrencies;
            adminService.getActiveCurrencyIcons = getActiveCurrencyIcons;
            adminService.getNewCustomers = getNewCustomers;
            adminService.getTradeCurrencyPairs = getTradeCurrencyPairs;
            adminService.updateSettings = updateSettings;
            adminService.getAdminSettings = getAdminSettings;
            adminService.editCustomerProfile = editCustomerProfile;
            adminService.updateCustomerProfile = updateCustomerProfile;
            adminService.updatePairStatus = updatePairStatus;
            adminService.kycData = kycData;
            adminService.uploadKyc = uploadKyc;
            adminService.getKycIdInfoById = getKycIdInfoById;
            adminService.downloadFile = downloadFile;
            adminService.getKycAddressById = getKycAddressById;
            adminService.approveKYC = approveKYC;
            adminService.getAllRoleList = getAllRoleList;
            adminService.addRole = addRole;
            adminService.editRole = editRole;
            adminService.updateRole = updateRole;
            adminService.deleteRole = deleteRole;
            adminService.getAllPermission = getAllPermission;
            adminService.addRolePermission = addRolePermission;
            adminService.getAllWithdrawRequestList = getAllWithdrawRequestList;
            adminService.approveWithdrawRequest = approveWithdrawRequest;
            adminService.getAllKYCMasterList = getAllKYCMasterList;
            adminService.addKYC = addKYC;
            adminService.editKYC = editKYC;
            adminService.updateKYC = updateKYC;
            adminService.getFaqList = getFaqList;
            adminService.addFaq = addFaq;
            adminService.editFaq = editFaq;
            adminService.updateFaq = updateFaq;
            adminService.deleteFaq = deleteFaq;
            adminService.getFaqCategoryList = getFaqCategoryList;
            adminService.addEmailTemplate = addEmailTemplate;
            adminService.uploadEmailTemplate = uploadEmailTemplate;
            adminService.getEmailTemplateList = getEmailTemplateList;
            adminService.editEmailTemplate = editEmailTemplate;
            adminService.updateEmailTemplate = updateEmailTemplate;
            adminService.deleteEmailTemplate = deleteEmailTemplate;
            adminService.getSmsTemplateList = getSmsTemplateList;
            adminService.addSmsTemplate = addSmsTemplate;
            adminService.updateSmsTemplate = updateSmsTemplate;
            adminService.getSmsTemplateById = getSmsTemplateById;
            adminService.getSupportListAdmin = getSupportListAdmin;
            adminService.getContactListAdmin = getContactListAdmin;
            adminService.deleteSupport = deleteSupport;
            adminService.adminLogout = adminLogout;
            adminService.userProfileAdmin = userProfileAdmin;
            adminService.disapproveWithdrawRequest = disapproveWithdrawRequest;
            adminService.getAllAdminUserList = getAllAdminUserList;
            adminService.registerAdminUser = registerAdminUser;
            adminService.getRoleList = getRoleList;
            adminService.editBackendUser = editBackendUser;
            adminService.updateAdminUser = updateAdminUser;
            adminService.deleteAdminUser = deleteAdminUser;
            adminService.getImageData = getImageData;
            adminService.repplySupport = repplySupport;
            adminService.addSupportComment = addSupportComment;
            adminService.changeStatus = changeStatus;
            adminService.updateSupportStatus = updateSupportStatus;
            adminService.reOpenTicket = reOpenTicket;
            adminService.getTotalDeposit = getTotalDeposit;
            adminService.getTotalWithdrawal = getTotalWithdrawal;
            adminService.editMyProfile = editMyProfile;
            adminService.updateMyProfile = updateMyProfile;
            adminService.sendMailLinkForgotPs = sendMailLinkForgotPs;
            adminService.resetAdminPassword = resetAdminPassword;
            adminService.checkForgotPassLinkExpiry = checkForgotPassLinkExpiry;
            adminService.adminChangePassword = adminChangePassword;
            adminService.transactionReportAdmin = transactionReportAdmin;
            adminService.transactionReportCustomerAdmin = transactionReportCustomerAdmin
            adminService.checkForgotPassLinkExpiry = checkForgotPassLinkExpiry
            adminService.adminChangePassword = adminChangePassword;
            adminService.getKYCData = getKYCData;
            adminService.getQRCode = getQRCode;
            adminService.setFaStatus = setFaStatus;
            adminService.getLiveUsers = getLiveUsers;
            adminService.marketCurrencypairadmin = marketCurrencypairadmin;
            adminService.getWithdrawRequestById = getWithdrawRequestById;
            adminService.updateWithdrawRequest = updateWithdrawRequest;
            adminService.getDepositRequestById = getDepositRequestById;
            adminService.updateDepositRequest = updateDepositRequest;
            adminService.approveDepositRequest = approveDepositRequest;
            adminService.disapproveDepositRequest = disapproveDepositRequest;
            adminService.getAllDepositRequestList = getAllDepositRequestList;
            adminService.addAmountToWallet = addAmountToWallet;
            adminService.customerReportAdmin = customerReportAdmin;
            adminService.addAmountToWallet = addAmountToWallet;
            adminService.getBankDetails = getBankDetails;
            adminService.updateBankDetailsStatus = updateBankDetailsStatus;
            adminService.getAllNotification = getAllNotification;
            adminService.resetAdminNotification = resetAdminNotification;
            adminService.markNotificationRead = markNotificationRead;
            adminService.getAllNotificationList = getAllNotificationList;
            adminService.getTradeCurrencyPairsFrontend = getTradeCurrencyPairsFrontend;
            adminService.getDepositReport = getDepositReport;
            adminService.getWithdrawalReport = getWithdrawalReport;
            adminService.getKycDetais = getKycDetais;
            adminService.getAdminActiveCurrencyListFiat = getAdminActiveCurrencyListFiat;
            adminService.getActivityDetails = getActivityDetails;
            adminService.getUserDepositRequestList = getUserDepositRequestList;
            adminService.getUserWithdrawRequestList = getUserWithdrawRequestList;
            adminService.getCustomerWalletReport = getCustomerWalletReport;
            adminService.getCustomerTradeDetails = getCustomerTradeDetails;
            adminService.getUserInfoData = getUserInfoData;
             adminService.customerOpenOrder = customerOpenOrder;
             adminService.getAllCryptoFeeDetails = getAllCryptoFeeDetails;
             adminService.getAllFiatFeeDetails = getAllFiatFeeDetails;
            //  adminService.getLTCFeeDetails = getLTCFeeDetails;
            //  adminService.getETHFeeDetails = getETHFeeDetails;
            //  adminService.getFULXFeeDetails = getFULXFeeDetails;
            //  adminService.getABCFeeDetails = getABCFeeDetails;
            adminService.getOrderBookList = getOrderBookList;
            adminService.getTotalFee=getTotalFee;

            adminService.blockMultiple = blockMultiple;
            adminService.unblockMultiple = unblockMultiple;
            adminService.blockCustomer = blockCustomer;
            adminService.unblockCustomer = unblockCustomer;
            return adminService;
        }
    ]
);