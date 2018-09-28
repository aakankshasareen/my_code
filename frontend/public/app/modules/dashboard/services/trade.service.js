dashboard.service('tradeService', ['$http', '$q', 'apiService', 'appSettings', '$cookies', function($http, $q, apiService, appSettings, $cookies) {

    var tradeService = {};

    var getLastTradePrice = function(parameters) {
        var deferred = $q.defer();
        apiService.create("lastTradePrice", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    // NOT USING NOW - LOGIC CHANGED 

    // var estimateBuyQty = function(parameters) {
    //     var deferred = $q.defer();
    //     apiService.create("estimateBuyQuantity", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    // var estimateSellQty = function(parameters) {
    //     var deferred = $q.defer();
    //     apiService.create("estimateSellQuantity", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    var marketBuyQtyCheck = function(parameters){
        var deferred = $q.defer();
        apiService.create("getTotalBuyQuantityPresent", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    var marketSellQtyCheck = function(parameters){
        var deferred = $q.defer();
        apiService.create("getTotalSellQuantityPresent", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    var marketSell = function(parameters) { //market sell
        var deferred = $q.defer();
        apiService.create("marketSellOrder", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    var marketBuy = function(parameters) { //market buy
        var deferred = $q.defer();
        apiService.create("marketBuyOrder", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    var limitCheckBalance = function(parameters) {
        var deferred = $q.defer();
        apiService.create("limitCheckBalance", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    var limitBuyPrice = function(parameters) {
        var deferred = $q.defer();
        apiService.create("limitBuyPrice", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    var limitSellPrice = function(parameters) {
        var deferred = $q.defer();
        apiService.create("limitSellPrice", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    var limitBuyCal = function(parameters) {
        var deferred = $q.defer();
        apiService.create("limitBuyCal", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    var limitSellCal = function(parameters) {
        var deferred = $q.defer();
        apiService.create("limitSellCal", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    var limitBuyPlaceOrder = function(parameters) {
        var deferred = $q.defer();
        apiService.create("limitBuyPlaceOrder", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    var limitSellPlaceOrder = function(parameters) {
        var deferred = $q.defer();
        apiService.create("limitSellPlaceOrder", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    var getCommission = function(parameters) {
        var deferred = $q.defer();
        apiService.get("getCommissionByCurrencyCode/" + parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    var getTradeLimitByCurrencyCode = function(parameters) {
        var deferred = $q.defer();
        apiService.edit("getTradeLimitByCurrencyCode", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    var getActiveOrders = function() {
        var deferred = $q.defer();
        apiService.get("allActiveOrder", sessionStorage.getItem('globals')).then(function(response) {
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

    var filterTxnList = function(parameters) {
        var deferred = $q.defer();
        apiService.create("allTransaction", parameters, sessionStorage.getItem('globals')).then(function(response) {
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


    var orderBook = function(parameters) {
        var deferred = $q.defer();
        apiService.create("combineActiveOrder", parameters, sessionStorage.getItem('globals')).then(function(response) {
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


    var cancelOrder = function(parameters) {
        var deferred = $q.defer();
        apiService.create("cancelOrder", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    var getCryptoCurrencyList = function(parameters) {
        var deferred = $q.defer();
        apiService.edit("getActiveCurrencyList", parameters, sessionStorage.getItem('globals')).then(function(response) {
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

    var getPrice_Crypto_To_INR = function(crypto) {
        var deferred = $q.defer();
        var crypt = crypto.toLowerCase(crypto);
        // if (crypto == "BTC") {
        //     crypt = "bitcoin";
        // } else if (crypto == "ETH") {
        //     crypt = "ethereum";
        // } else if (crypto == "LTC") {
        //     crypt = "litecoin";
        // } else {
        //     crypto = "bitcoin";
        // }

        apiService.create("getConvertedRate", { 'currency': crypt }, sessionStorage.getItem('globals')).then(function(response) {
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


    //Graph

    var getGraphData = function(from_currency, to_currency) {
        var deferred = $q.defer();

        apiService.create("getGraphData", { 'from_currency': from_currency, 'to_currency': to_currency, 'limit': 100 }, sessionStorage.getItem('globals')).then(function(response) {
                if (response){
                    deferred.resolve(response);
                    console.log(response);
                }
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }



/////// home graph/////
var getHomeGraphData = function(from_currency, to_currency) {
    var deferred = $q.defer();

    apiService.create("getHomeGraphData", { 'from_currency': from_currency, 'to_currency': to_currency, 'limit': 100 }, sessionStorage.getItem('globals')).then(function(response) {
            if (response){
                deferred.resolve(response);
                console.log(response);
            }
            else
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
        },
        function(response) {
            deferred.reject(response);
        });
    return deferred.promise;
}

    var getCryptoList = function(to_currency) {
        var deferred = $q.defer();

        apiService.get("getFilteredCurrencyPairs?status=1&to=" + to_currency + "&type=1", sessionStorage.getItem('globals')).then(function(response) {
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

    // var getTradeHistory = function(pairId) {
    //     var deferred = $q.defer();
    //     apiService.get("tradeHistory/" + pairId, sessionStorage.getItem('globals')).then(function(response) {
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


    var getTradeListGraphData = function(parameters) {
         var deferred = $q.defer();
        apiService.get("getTradingViewData", sessionStorage.getItem('globals')).then(function(response) {
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

    var getLimitSellFee = function(parameters){
      var deferred = $q.defer();
      apiService.create("limitSellFee", parameters, sessionStorage.getItem('globals')).then(function(response) {
              if (response) {
                  deferred.resolve(response);
                  console.log(response);
              } else
                  deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
          },
          function(response) {
              deferred.reject(response);
          });
      return deferred.promise;
    }

    var getLimitBuyFee = function(parameters){
      var deferred = $q.defer();
      apiService.create("limitBuyFee", parameters, sessionStorage.getItem('globals')).then(function(response) {
              if (response) {
                  deferred.resolve(response);
                  console.log(response);
              } else
                  deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
          },
          function(response) {
              deferred.reject(response);
          });
      return deferred.promise;
    }

    tradeService.getLastTradePrice = getLastTradePrice;
    // tradeService.estimateBuyQty = estimateBuyQty;
    // tradeService.estimateSellQty = estimateSellQty;
    tradeService.marketBuyQtyCheck = marketBuyQtyCheck;
    tradeService.marketSellQtyCheck = marketSellQtyCheck;
    tradeService.marketSell = marketSell;
    tradeService.marketBuy = marketBuy;
    tradeService.limitCheckBalance = limitCheckBalance;
    tradeService.limitBuyPrice = limitBuyPrice;
    tradeService.limitSellPrice = limitSellPrice;
    tradeService.limitBuyCal = limitBuyCal;
    tradeService.limitSellCal = limitSellCal;
    tradeService.limitBuyPlaceOrder = limitBuyPlaceOrder;
    tradeService.limitSellPlaceOrder = limitSellPlaceOrder;
    tradeService.getCommission = getCommission;
    tradeService.getTradeLimitByCurrencyCode = getTradeLimitByCurrencyCode;
    tradeService.getActiveOrders = getActiveOrders;
    tradeService.filterTxnList = filterTxnList;
    tradeService.cancelOrder = cancelOrder;
    tradeService.getCryptoCurrencyList = getCryptoCurrencyList;
    tradeService.orderBook = orderBook;
    tradeService.getPrice_Crypto_To_INR = getPrice_Crypto_To_INR;
    tradeService.getGraphData = getGraphData;
    tradeService.getCryptoList = getCryptoList;
    tradeService.getHomeGraphData = getHomeGraphData;
    tradeService.getTradeListGraphData = getTradeListGraphData;
    tradeService.getLimitSellFee = getLimitSellFee;
    tradeService.getLimitBuyFee = getLimitBuyFee;
    //tradeService.getTradeHistory = getTradeHistory;


    return tradeService;

}]);
