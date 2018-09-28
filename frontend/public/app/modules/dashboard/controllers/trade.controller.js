dashboard.controller("TradeController", ['$rootScope', '$scope', 'dashboardService', 'loginService', '$interval', 'socket', '$stateParams', '$uibModal', '$state', 'tradeService', 'storageFactory', 'toastr', 'socket', '$window', '$timeout',
    function ($rootScope, $scope, dashboardService, loginService, $interval, socket, $stateParams, $uibModal, $state, tradeService, storageFactory, toastr, socket, $window, $timeout) {

        var vm = this;
        vm.takerFee = .2;
        vm.buy = {};
        vm.sell = {};
        vm.limitBuy = {};
        vm.limitSell = {};
        vm.symbol = '';
        var statusKYC = false;
        vm.showMaxBuyLimitErr = false;
        vm.showMaxSellLimitErr = false;
        vm.showMinBuyLimitErr = false;
        vm.showMinSellLimitErr = false;
        vm.showMaxBuyMarketErr = false;
        vm.showMaxSellMarketErr = false;
        vm.showMinBuyMarketErr = false;
        vm.showMinSellMarketErr = false;
        //variables for sorting
        {
            //sorting my active buy order
            vm.buyOrderSort = 'created_at';
            vm.buyOrderReverse = true;
            //sorting my active sell order
            vm.sellOrderSort = 'created_at';
            vm.sellOrderReverse = true;
            //trade history
            vm.tradeSort = 'time';
            vm.tradeReverse = true;
        }
        let withdrawCurrency = '';
       vm.withdrawLimit = () =>{
            tradeService.getTradeLimitByCurrencyCode({ 'id': $scope.selectedName.currency_code }).then(function (response) {
                if (response.success) {
                    for (var i = 0; i < response.data.length; i++) {
                        if (response.data[i].operation == "Buy") {
                            vm.minBuyLimit = response.data[i].min_amount;
                            vm.maxBuyLimit = response.data[i].max_amount;
                        } else if (response.data[i].operation == "Sell") {
                            vm.minSellLimit = response.data[i].min_amount;
                            vm.maxSellLimit = response.data[i].max_amount;
                        } else if (response.data[i].operation == "Withdraw") {
                            vm.minWithdrawAmt = response.data[i].min_amount;
                            vm.maxWithdrawAmt = response.data[i].max_amount;
                        }
                    }
                }
            }, function (err) { });
       }
        vm.changeAmountBuy =function(){

            tradeService.getTradeLimitByCurrencyCode({ 'id': vm.getCurrencyTo }).then(function (response) {
                 if (response.success) {
                    console.log('asdjasdlkjkljasdflkj//......', response.data)
                     for (var i = 0; i < response.data.length; i++) {
                         if (response.data[i].operation == "Buy") {
                             vm.minBuyLimit = response.data[i].min_amount;
                             vm.maxBuyLimit = response.data[i].max_amount;
                             console.log(vm.maxBuyLimit)
                         } else if (response.data[i].operation == "Sell") {
                             vm.minSellLimit = response.data[i].min_amount;
                             vm.maxSellLimit = response.data[i].max_amount;
                         }
                     }
                 }
             }, function (err) { });

             if(vm.minBuyLimit>vm.limitBuy.total){
                 vm.showMinBuyLimitErr = true;
             }
             else{
               
                 vm.showMinBuyLimitErr = false;
             } 
        }
        //Sell
        vm.changeAmountSell =function(){
            
        tradeService.getTradeLimitByCurrencyCode({ 'id': vm.getCurrencyFrom }).then(function (response) {
            if (response.success) {
                for (var i = 0; i < response.data.length; i++) {
                    if (response.data[i].operation == "Buy") {
                        vm.minBuyLimit = response.data[i].min_amount;
                        vm.maxBuyLimit = response.data[i].max_amount;
                    } else if (response.data[i].operation == "Sell") {
                        vm.minSellLimit = response.data[i].min_amount;
                        vm.maxSellLimit = response.data[i].max_amount;
                    }
                }
            }
        }, function (err) { });

         if(vm.minSellLimit >vm.limitSell.volume){
            vm.showMinSellLimitErr = true;
             }
        else{
            vm.showMinSellLimitErr = false;
            } 
   }

        vm.generateWithdrawRequestCrypto = function () {

            if (vm.withdrawFormCrypto.$valid) {
                var data = {
                    "amount": vm.withdrawAmt,
                    "currency_code": $scope.selectedName.currency_code,
                    "device_ipAddress": sessionStorage.getItem('myIP'),
                    "device_os": sessionStorage.getItem('myOS'),
                    "device_name": sessionStorage.getItem('myDevice'),
                    "device_browser": sessionStorage.getItem('myBrowser'),
                    "receiverAddress": vm.withdraw.receiverAddress,
                    "verify2FA": vm.verifyCode,
                    "otp": vm.otp
                }

                dashboardService.withdrawMoneyRequest(data).then(function (response) {
                    if (response.success) {
                        toastr.success(response.message);
                        vm.resetOTP();
                        $state.reload();
                        // ngToast.create({
                        //     className: 'success',
                        //     content: response.message
                        // });
                        dashboardService.getWalletInfoByCurrency({ 'id': $scope.selectedName.currency_code }).then(function (response) {
                            if (response.success) vm.withdrawWalletBalance = response.walletinfo.total_amount;
                        });
                        //vm.refreshTxnHistory();
                        resetParams();
                        //vm.withdrawFormCrypto.$submitted = false;
                        $window.scroll(0, 0);
                        //$uibModalInstance.dismiss('cancel');
                        // $('#withdrawMoneyModal').modal('hide')
                        vm.getWalletFunc();
                        vm.getWalletCryptofunction()
                        $("#contentRowHolder").hide();


                    } else {
                        toastr.error(response.message);
                        // ngToast.create({
                        //     className: 'danger',
                        //     content: response.message
                        // });
                    }
                }, function (err) {
                    toastr.error('Something went wrong. Please try again later.');
                    // ngToast.create({
                    //     className: 'danger',
                    //     content: 'Something went wrong. Please try again later.'
                    // });
                });

            }
            //else {


            //     alert("by")
            // }
        }

        vm.getWallet = {};
        var arr = [];

        vm.getWalletData = function () {

            // $(".header-balance-dropdown").toggleClass('active');
            var data = {
                "device_ipAddress": sessionStorage.getItem('myIP'),
                "device_os": sessionStorage.getItem('myOS'),
                "device_name": sessionStorage.getItem('myDevice'),
                "device_browser": sessionStorage.getItem('myBrowser')
            }

            var promises = [];

            var promise1 = dashboardService.btcBalance(data).then(function (response) { });
            promises.push(promise1);

            var promise2 = loginService.ltcBalance(data).then(function (response) { });
            promises.push(promise2);

            // var promise3 = loginService.dogeBalance(data).then(function (response) { });
            // promises.push(promise3);

            var promise4 = loginService.ethBalance(data).then(function (response) { });
            promises.push(promise4);
            Promise.all(promises).then(function (response) {
                dashboardService.getWallet().then(function (response) {
                    vm.getWallet = response.data;
                    for (var i = 0; i < vm.getWallet.length - 1; i++) {
                        if(vm.getWallet[i].type==1)
                        {
                            arr.push(vm.getWallet[i]);
                        }
                    }
                vm.getWalletDataa = [];

                    vm.getWalletDataa = arr;
                    $scope.selectedName = arr[0];
                });
            }, function (err) {
                console.log("error in balance");
            });

        }

        dashboardService.adminAccountDetail().then(function (response) {
            vm.adminAccountDetails = response.data
        })

        dashboardService.getKycStatus().then(function (response) {
            // $rootScope.kycStatus = response.completeinfo;
            // $rootScope.kycComment = response.comment;
            statusKYC = (response.completeinfo === 2) ? true : false;
        }, function (err) {
            console.log("Err occurred is", err);
        });


        vm.getWalletData();

        vm.pairs = [];
        vm.showPairs = [];
        vm.getPairs = (currency) => {
            sessionStorage.setItem('currencyFrom', currency);
            vm.active = currency;
            vm.showPairs = [];
            vm.pairs.forEach((e) => {
                if (currency == e.from)
                    vm.showPairs.push(e);
            })
        }

        $rootScope.fromPair = ''
        $rootScope.toPair = ''

        dashboardService.getCurrencyPairTrade().then(function (response) {
            // vm.getCurrencyPairTrade = response.data
            // var currency= response[0];
            vm.currencies = response.data.currencies;
            vm.pairs = response.data.data;

            if (sessionStorage.getItem("currencyFrom") != null || sessionStorage.getItem("currencyFrom") != undefined) {
                vm.getPairs(sessionStorage.getItem("currencyFrom"))
            }
            else {
                vm.getPairs(response.data.currencies[0])
            }
        })

        var sortItems = function (a, b) {
            var nameA = a.from.toUpperCase();
            var nameB = b.from.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            // names must be equal
            return 0;
        }

        function getCommission(currencyCode) {
            if (!currencyCode) {
                return Promise.reject();
            }

            return tradeService.getCommission(currencyCode).then(function (response) {
                if (response.success) {
                    return Promise.resolve(response)
                }
                return Promise.reject(response)
            })
        }

        var findBarPosition = function (low, high, ltp) {

            var position;

            if (low == high) {
                position = 0;
                return position;
            } else {
                position = (ltp - low) * 100 / (high - low);
                return position;
            }
        }

        var tradeAPICalls = function () { // calling this function in a chain promise .

            sessionStorage.setItem('pairId', vm.getPairId);
            sessionStorage.setItem('curFrom', vm.getCurrencyFrom);
            sessionStorage.setItem('curTo', vm.getCurrencyTo);
            sessionStorage.setItem('curFromSymbol', vm.getCurrencyFromSymbol);
            sessionStorage.setItem('curToSymbol', vm.getCurrencyToSymbol);

            vm.symbol = vm.getCurrencyFrom+'/'+vm.getCurrencyTo;

        

            tradeService.getActiveOrders().then(function (response) {
                if (response.success) {
                    vm.allBuyOrders = response.buyorder;
                    vm.allSellOrders = response.sellorder;
                } else {
                    toastr.error(response.message);

                }
            }, function (err) { });

            tradeService.getCryptoList(vm.getCurrencyTo).then(function (response) {
                if (response.success) {
                    //  response.data.sort(sortItems);
                    vm.graphCurrencyList = response.data;

                    for (var i = 0; i < vm.graphCurrencyList.length; i++) {
                        if (vm.graphCurrencyList[i].from == vm.getCurrencyFrom) {
                            vm.graphCurrency = vm.graphCurrencyList[i];
                            break;
                        }
                    }
                } else {
                    toastr.error(response.message);
                    //error msg toast
                }
            });

            getCommission(vm.getCurrencyFrom).then(function (response) {
                
                vm.limitSellPercentage = response.data.find(function (element) {
                    return element.operation === 'Sell' ? true : false;
                }).min_percentage;
            }, function () { });

            getCommission(vm.getCurrencyTo).then(function (response) {
                vm.limitBuyPercentage = response.data.find(function (element) {
                    return element.operation === 'Buy' ? true : false;
                }).min_percentage;
            }, function () { });


            // tradeService.getGraphData(vm.getCurrencyFrom, vm.getCurrencyTo).then(function(response) {

            //     var graphData = response.Data;
            //     graphData.forEach(function(i, j) {
            //         dateString = moment.unix(i.time).format("YYYY-MM-DD");
            //         //tmp.push(dateString);
            //         // graphNewData.push(tmp);
            //         graphData[j].time = dateString;
            //     });
            //     // create data table on loaded data
            //     var dataTable = anychart.data.table('time');
            //     dataTable.addData(graphData);
            //     // create stock chart
            //     anychart.theme(anychart.themes.darkEarth);

            //     var chart = anychart.stock();

            //     // map loaded data for the ohlc series
            //     var mapping = dataTable.mapAs({
            //         'open': 'open',
            //         'high': 'high',
            //         'low': 'low',
            //         'close': 'close'
            //     });

            //     // create first plot on the chart
            //     var plot = chart.plot(0);
            //     // set grid settings
            //     plot.yGrid(true)
            //         .xGrid(true)
            //         .yMinorGrid(true)
            //         .xMinorGrid(true);

            //     // create OHLC series
            //     plot.ohlc(mapping).name('Value');

            //     // create scroller series with mapped data
            //     chart.scroller().ohlc(mapping);

            //     // set container id for the chart
            //     chart.container('graph_container');
            //     // initiate chart drawing
            //     chart.draw();

            // });

            // tradeService.getCryptoCurrencyList({ 'id': 1 }).then(function(response) {
            //     if (response.success) {
            //         response.result.sort(sortItems);
            //         vm.graphCurrencyList = response.result;

            //         for (var i = 0; i < vm.graphCurrencyList.length; i++) {
            //             if (vm.graphCurrencyList[i].currency_code == vm.getCurrencyFrom) {
            //                 vm.graphCurrency = vm.graphCurrencyList[i];
            //                 break;
            //             }
            //         }
            //     } else {
            //         toastr.error(response.message);
            //         //error msg toast
            //     }
            // });

            //var promises = [];

            // var promise1 = dashboardService.getTodayHighLow(vm.getPairId).then(function(response) { // using socket
            //     vm.todayHighLow = response.data;
            // });
            // promises.push(promise1);

            // var promise2 = dashboardService.getYearlyHighLow(vm.getPairId).then(function(response) {
            //     vm.yearlyHighLow = response.data;
            // });
            // promises.push(promise2);

            // var promise3 = tradeService.getLastTradePrice({ 'pair_id': vm.getPairId }).then(function(response) {
            //     if (response.success) {
            //         vm.getLTP = response.lastprice;
            //     }
            // }, function(err) {});

            // Promise.all(promises).then(function(response) {
            //        // vm.position = findBarPosition(vm.todayHighLow.low, vm.todayHighLow.high, vm.getLTP);
            //       // vm.yearlyPosition = findBarPosition(vm.yearlyHighLow.low, vm.yearlyHighLow.high, vm.getLTP);
            //     }, function(err) {
            //     console.log("error");
            // });

            // dashboardService.get24HourVolume(vm.getPairId).then(function(response) { // using socket
            //     if (response.success) {
            //         vm._24HourVolume = response.data.volume
            //     }
            // })
            var defaultPair = {
                'id': 'FULX' /**'FCEX'*/
            }

            dashboardService.getTradeCurrencyFromPairs(defaultPair).then(function (response) {
                if (response.success) {
                    // response.result.sort(sortItems);
                    // vm.graphCurrencyList = response.result;
                    $scope.cryptoPairs = response.result;
                } else {
                  
                    toastr.error(response.message);
                    //error msg toast
                }
            });

            dashboardService.getWallet().then(function (response) {
                if (response.success) {
                    for (var i = 0; i < response.data.length; i++) {
                        if (response.data[i].currency_code == vm.getCurrencyFrom) {
                            vm.balance = response.data[i].total_amount;
                            break;
                        }
                    }
                }
            });

            // tradeService.getTradeHistory(vm.getPairId).then(function(response) { // using socket
            //     if (response.success) {
            //         vm.tradeHistory = response.data;
            //     }
            // });

            // order book
            socket.pairId = vm.getPairId;
            socket.emit('pair_id', vm.getPairId);

            socket.on('sell_buy', function (data) {

                if (data.id == vm.getPairId) {
                    $scope.buyOrder = data.obj.buy;
                    $scope.sellOrder = data.obj.sell;
                }
            });

            socket.on('trade_history', function (response) {
                vm.tradeHistory = response.obj.data;
            });

            socket.on('_24_hr_vol', function (response) {
                vm._24HourVolume = response.obj.data.volume;
            });

            socket.on('last_trade_price', function (response) {
                vm.getLTP = response.data.lastprice;
            });

            var position = 0;
            var yearlyPosition = 0;

            socket.on('today_low_high', function (response) {
                vm.todayHighLow = response.obj.data;
                position = findBarPosition(vm.todayHighLow.low, vm.todayHighLow.high, vm.getLTP);

                $("#slider").slider({
                    value: position
                });

            });

            socket.on('yearly_low_high', function (response) {
                vm.yearlyHighLow = response.obj.data;
                yearlyPosition = findBarPosition(vm.yearlyHighLow.low, vm.yearlyHighLow.high, vm.getLTP);

                $("#slider2").slider({
                    value: yearlyPosition
                });

            });

            vm.buy.price = 'Market Price';
            vm.sell.price = 'Market Price';
            //Limit Buy Price Per BTC
            tradeService.limitBuyPrice({ 'pair_id': vm.getPairId }).then(function (response) {
                if (response.success) {
                    vm.limitBuy.buyPrice = response.amount;
                    //vm.buy.price = response.amount;
                }
            }, function (err) { });

            //Limit Sell Price Per BTC
            tradeService.limitSellPrice({ 'pair_id': vm.getPairId }).then(function (response) {
                if (response.success) {
                    vm.limitSell.sellPrice = response.amount;
                    //vm.sell.price = response.amount;
                };
            }, function (err) { });

            // for market -- commented -- bug fix - mantis - 940
            // tradeService.getLastTradePrice({ 'pair_id': vm.getPairId }).then(function(response) {
            //     if (response.success) {
            //         vm.buy.price = response.lastprice;
            //         vm.sell.price = response.lastprice;
            //     }
            // }, function(err) {});

            dashboardService.getWalletInfoByCurrency({ 'id': vm.getCurrencyFrom }).then(function (response) {
                if (response.success)
                    vm.walletBalance_from = response.walletinfo.total_amount;
            }, function (err) { });

            dashboardService.getWalletInfoByCurrency({ 'id': vm.getCurrencyTo }).then(function (response) {
                if (response.success) {
                    vm.walletBalance_to = response.walletinfo.total_amount;
                }
            }, function (err) { });
            //to set minimum limit/market order amount
            tradeService.getTradeLimitByCurrencyCode({ 'id': vm.getCurrencyFrom }).then(function (response) {
                if (response.success) {
                    for (var i = 0; i < response.data.length; i++) {
                        if (response.data[i].operation == "Buy") {
                            vm.minBuyLimit = response.data[i].min_amount;
                            vm.maxBuyLimit = response.data[i].max_amount;
                        } else if (response.data[i].operation == "Sell") {
                            vm.minSellLimit = response.data[i].min_amount;
                            vm.maxSellLimit = response.data[i].max_amount;
                        } else if (response.data[i].operation == "Withdraw") {
                            vm.minWithdrawAmt = response.data[i].min_amount;
                            vm.maxWithdrawAmt = response.data[i].max_amount;
                        }
                    }
                }
            }, function (err) { });
        } // function-end

        //for browser refresh
        if ($stateParams.pair_id == undefined && $stateParams.currency_from == undefined && $stateParams.currency_to == undefined) {
            if (storageFactory.getPairId() == 'null' || storageFactory.getPairId() == undefined) {
                dashboardService.getTradePairList().then(function (response) {
                    if (response.success) {
                        var data = response.result;
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].default == 'true') {
                                //vm.default = data[i];
                                vm.getPairId = data[i].id;
                                vm.getCurrencyFrom = data[i].from_currency_code;
                                vm.getCurrencyTo = data[i].to_currency_code;
                                vm.getCurrencyFromSymbol = data[i].from_icon_path;
                                vm.getCurrencyToSymbol = data[i].to_icon_path;
                                isDefault = true;
                                break;
                            }
                        }
                        if (!isDefault) {
                            vm.getPairId = data[0].id;
                            vm.getCurrencyFrom = data[0].from_currency_code;
                            vm.getCurrencyTo = data[0].to_currency_code;
                            vm.getCurrencyFromSymbol = data[0].from_icon_path;
                            vm.getCurrencyToSymbol = data[0].to_icon_path;
                        }
                    } else {

                        toastr.error(response.message);
                    }

                }).then(function (response) {
                    tradeAPICalls();
                });
            } else {
                var is_pair_exists = 0;
                dashboardService.getTradePairList().then(function (response) {
                    if (response.success) {
                        var data = response.result;
                        for (var i = 0; i < response.result.length; i++) {
                            if (storageFactory.getPairId() == response.result[i].id) {
                                is_pair_exists = 1;
                                break;
                            }
                        }
                        if (is_pair_exists) {
                            vm.getPairId = storageFactory.getPairId();
                            vm.getCurrencyFrom = storageFactory.getCurFrom();
                            vm.getCurrencyTo = storageFactory.getCurTo();
                            vm.getCurrencyFromSymbol = storageFactory.getCurFromSymbol();
                            vm.getCurrencyToSymbol = storageFactory.getCurToSymbol();
                        } else {
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].default == 'true') {
                                    //vm.default = data[i];
                                    vm.getPairId = data[i].id;
                                    vm.getCurrencyFrom = data[i].from_currency_code;
                                    vm.getCurrencyTo = data[i].to_currency_code;
                                    vm.getCurrencyFromSymbol = data[i].from_icon_path;
                                    vm.getCurrencyToSymbol = data[i].to_icon_path;
                                    isDefault = true;
                                    break;
                                }
                            }
                            if (!isDefault) {
                                vm.getPairId = data[0].id;
                                vm.getCurrencyFrom = data[0].from_currency_code;
                                vm.getCurrencyTo = data[0].to_currency_code;
                                vm.getCurrencyFromSymbol = data[0].from_icon_path;
                                vm.getCurrencyToSymbol = data[0].to_icon_path;
                            }
                        }
                    } else {

                        toastr.error(response.message);
                    }
                }).then(function (response) {
                    tradeAPICalls();
                });
            }


        } else {
            dashboardService.getTradePairList().then(function (response) {
                if (response.success) {
                    var data = response.result;
                    for (var i = 0; i < response.result.length; i++) {
                        if (storageFactory.getPairId() == response.result[i].id) {
                            is_pair_exists = 1;
                            break;
                        }
                    }
                    var isDefault = false;
                    if (is_pair_exists) {
                        vm.getPairId = $stateParams.pair_id;
                        vm.getCurrencyFrom = $stateParams.currency_from;
                        vm.getCurrencyTo = $stateParams.currency_to;
                        vm.getCurrencyFromSymbol = $stateParams.currency_from_symbol;
                        vm.getCurrencyToSymbol = $stateParams.currency_to_symbol;
                    } else {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].default == 'true') {
                                //vm.default = data[i];
                                vm.getPairId = data[i].id;
                                vm.getCurrencyFrom = data[i].from_currency_code;
                                vm.getCurrencyTo = data[i].to_currency_code;
                                vm.getCurrencyFromSymbol = data[i].from_icon_path;
                                vm.getCurrencyToSymbol = data[i].to_icon_path;
                                isDefault = true;
                                break;
                            }
                        }
                        if (!isDefault) {
                            vm.getPairId = data[0].id;
                            vm.getCurrencyFrom = data[0].from_currency_code;
                            vm.getCurrencyTo = data[0].to_currency_code;
                            vm.getCurrencyFromSymbol = data[0].from_icon_path;
                            vm.getCurrencyToSymbol = data[0].to_icon_path;
                        }
                    }
                } else {
                    toastr.error(response.message);

                }
            }).then(function (response) {
                
                tradeAPICalls();
            });
        }

        vm.showZeroBuyPriceErr = false;
        vm.showZeroSellPriceErr = false;
        vm.showZeroBuyAmtErr = false;

        vm.showZeroBuyVolErr = false;
        vm.showZeroSellVolErr = false;
        vm.showZeroSellAmtErr = false;

        var resetBuy = function () {
            vm.showWalletError = false;
        }

        var resetSell = function () {
            vm.showWalletSellError = false;
        }

        vm.changeBuyVolume = function (value) {
            vm.limitBuyFee = {};
            clearTimeout(limitBuyTimer);
            // limitBuyTimer = setTimeout(getLimitBuyFee, 500);
            if (vm.limitBuyForm.$valid) {

                if (value == 'volume') {
                    if (vm.limitBuy.volume != 0) {
                        vm.showZeroBuyVolErr = false;
                        vm.showMinBuyLim = false;

                        if (vm.limitBuy.volume < vm.minBuyLimit) {
                            vm.showMinBuyLim = true;
                            // vm.buy.total = undefined;
                            // vm.buy.final_total = undefined;
                            return;
                        }

                        if (angular.isDefined(vm.limitBuy.buyPrice) && vm.limitBuy.buyPrice != '' && vm.limitBuy.buyPrice != 0) {

                            if (vm.limitBuy.buyPrice != 0) {
                                vm.limitBuy.total = calculateTotal(vm.limitBuy.volume, vm.limitBuy.buyPrice);
                                //vm.limitBuy.final_total = vm.limitBuy.total;
                                vm.showZeroBuyPriceErr = false;
                                if (vm.limitBuy.total > parseFloat(vm.walletBalance_to.replace(/,/g, ''))) { // wallet balance from api is in string , so converting it to float
                                    vm.showWalletError = true;
                                    return;
                                } else {
                                    vm.showWalletError = false;
                                }
                                return;
                            } else {
                                // vm.buy.total = undefined;
                                //vm.buy.final_total = undefined;
                                vm.showZeroBuyPriceErr = true;
                                return;
                            }
                        } else if (angular.isDefined(vm.limitBuy.total) && vm.limitBuy.total != '') {
                            if (vm.limitBuy.total !== 0) {
                                vm.limitBuy.buyPrice = calculatePrice(vm.limitBuy.volume, vm.limitBuy.total);
                            }
                        }
                    } else {
                        vm.limitBuy.total = undefined;
                        // vm.limitBuy.final_total = undefined;
                        vm.showMinBuyLim = false;
                        vm.showZeroBuyVolErr = true;
                        vm.showWalletError = false;
                        return;
                    }
                } // value == volume
                else if (value == 'price') {
                    if (vm.limitBuy.buyPrice != 0) {
                        if (angular.isDefined(vm.limitBuy.volume) && vm.limitBuy.volume != '') {
                            if (vm.limitBuy.volume != 0) {
                                vm.limitBuy.total = calculateTotal(vm.limitBuy.volume, vm.limitBuy.buyPrice);
                                //vm.limitBuy.final_total = vm.limitBuy.total;
                                vm.showZeroBuyVolErr = false;
                            } else {
                                vm.showZeroBuyVolErr = true;
                                return;
                            }
                        } else if (angular.isDefined(vm.limitBuy.total) && vm.limitBuy.total != '') {
                            if (vm.limitBuy.total !== 0) {
                                vm.limitBuy.volume = calculateVolume(vm.limitBuy.buyPrice, vm.limitBuy.total);
                            }
                        }
                        vm.showZeroBuyPriceErr = false;
                    } else {
                        vm.showZeroBuyPriceErr = true;
                        vm.limitBuy.total = undefined;
                        vm.showWalletError = false;
                        //vm.limitBuy.final_total = undefined;
                        return;
                    }
                } // value == price
                else if (value == 'amount') {
                    if (vm.limitBuy.total != 0) {

                        if (angular.isDefined(vm.limitBuy.buyPrice) && vm.limitBuy.buyPrice != '' && vm.limitBuy.buyPrice != 0) {

                            vm.limitBuy.volume = calculateVolume(vm.limitBuy.buyPrice, vm.limitBuy.total);
                            // }
                        } else if (angular.isDefined(vm.limitBuy.volume) && vm.limitBuy.volume != '') {
                            if (vm.limitBuy.volume !== 0) {
                                vm.limitBuy.buyPrice = calculatePrice(vm.limitBuy.volume, vm.limitBuy.total);
                                vm.showZeroBuyVolErr = false;
                                return;
                            } else {
                                vm.showZeroBuyVolErr = true;
                                return;
                            }
                        }
                        vm.showZeroBuyAmtErr = false;
                    } else {
                        vm.showZeroBuyAmtErr = true;
                        vm.limitBuy.volume = undefined;
                    }
                } // value == amount

                if (angular.isDefined(vm.limitBuy.volume) && vm.limitBuy.volume != 0 && (vm.limitBuy.volume < vm.minBuyLimit)) {
                    vm.showMinBuyLim = true;
                    vm.showZeroBuyVolErr = false;
                    vm.showWalletError = false;
                    return;
                } else {
                    // vm.buy.final_total = vm.buy.total;
                    if (vm.limitBuy.total > parseFloat(vm.walletBalance_to.replace(/,/g, ''))) { // wallet balance from api is in string , so converting it to float
                        vm.showWalletError = true;
                        return;
                    } else {
                        vm.showWalletError = false;
                    }
                    vm.showMinBuyLim = false;
                    vm.showZeroBuyPriceErr = false;
                    vm.showZeroBuyVolErr = false;
                    vm.showZeroBuyAmtErr = false;
                }

            } // form-valid
            else {
                if (angular.isUndefined(vm.limitBuy.buyPrice) && angular.isUndefined(vm.limitBuy.volume)) {
                    return;
                } else {
                    vm.showMinBuyLim = false;
                    vm.showZeroBuyPriceErr = false;
                    vm.showZeroBuyVolErr = false;
                    vm.showWalletError = false;
                }
            }
        }

        var limitBuyTimer;

        function getLimitBuyFee() {
            var data = {
                quantity: vm.limitBuy.volume,
                amount: vm.limitBuy.buyPrice,
                pairId: vm.getPairId
            }
            if (!vm.limitBuy.volume || !vm.limitBuy.buyPrice) {
                return;
            }
            tradeService.getLimitBuyFee(data).then(function (response) {
                if (!response.success) {
                    return toastr.error(response.message);
                }
                vm.limitBuyFee.feePercentage = response.feePercentage;
                vm.limitBuyFee.feeValue = response.feeValue;

                // if((response.feeValue+parseFloat(vm.limitSell.volume)) <= parseFloat(vm.walletBalance_from)){
                //   vm.showWalletSellError = false;
                // } else{
                //   vm.showWalletSellError = true;
                // }
            })
        }

        vm.limitBuyOrder = function () {
            if(vm.limitBuyForm.$valid && vm.showMinBuyLimitErr==false){
                
                if(!statusKYC){
                return toastr.error("Waiting KYC Approval.");
            }
            if (vm.limitBuyForm.$valid) {
                if (vm.limitBuy.total != 0) {
                    vm.showZeroBuyAmtErr = false;
                    if (vm.limitBuy.volume !== undefined && vm.limitBuy.total !== undefined && !vm.showZeroBuyVolErr && !vm.showMinBuyLim && !vm.showZeroBuyPriceErr && !vm.showWalletError) {

                        var data1 = {
                            'quantity': vm.limitBuy.volume, // amount to buy
                            'amount': vm.limitBuy.buyPrice, // price per btc/eth
                            'pair_id': vm.getPairId,
                            'currency_code': vm.getCurrencyTo
                        }

                        tradeService.limitBuyCal(data1).then(function (response1) {
                            if (response1.success) {

                                // vm.getTtlBuyPrc = response.total_amount;
                                var getBuyFee = {
                                    'value': response1.fee_value,
                                    'percent': response1.fee_percentage
                                }

                                var data2 = {
                                    'currency_code': vm.getCurrencyTo,
                                    'amount': response1.total_amount
                                }

                                tradeService.limitCheckBalance(data2).then(function (response2) {
                                    if (response2.success) {

                                        var data3 = {
                                            'pair_id': vm.getPairId,
                                            'amount': vm.limitBuy.buyPrice,
                                            'total_amount': response1.total_amount,
                                            'fee_value': getBuyFee.value,
                                            'fee_percentage': getBuyFee.percent,
                                            'quantity': vm.limitBuy.volume,
                                            'currency_code': vm.getCurrencyTo
                                        }

                                        tradeService.limitBuyPlaceOrder(data3).then(function (response3) {
                                            if (response3.success) {
                                                toastr.success(response3.message);
                                                $state.reload();
                                                 $window.scroll(0, 0);
                                            } else {
                                                toastr.error(response3.message);
                                            }

                                        }, function (err) {

                                        });
                                    } else {
                                        toastr.error(response2.message);
                                    }
                                }, function (err) { });

                                // modal not to be shown
                                // $uibModal.open({
                                //     templateUrl: 'app/modules/dashboard/views/trade/modals/confirmModalBuy.html',
                                //     size: 'lg modal-dialog-centered',
                                //     backdrop: 'static',

                                //     controller: function($scope, $uibModalInstance, tradeService, $stateParams) {
                                //         $scope.qtyToBuy = vm.limitBuy.volume;
                                //         $scope.priceBuyAt = vm.limitBuy.buyPrice;
                                //         $scope.currToBuy = vm.getCurrencyFrom;
                                //         $scope.currBuyAt = vm.getCurrencyTo;
                                //         $scope.buyIcon = vm.getCurrencyToSymbol;
                                //         $scope.sellIcon = vm.getCurrencyFromSymbol;
                                //         $scope.getTotalAmnt = response.total_amount;
                                //         $scope.getFee = getBuyFee;

                                //         $scope.ok = function() {

                                //             var data = {
                                //                 'currency_code': vm.getCurrencyTo,
                                //                 'amount': response.total_amount
                                //             }

                                //             tradeService.limitCheckBalance(data).then(function(response) {
                                //                 if (response.success) {

                                //                     var data = {
                                //                         'pair_id': vm.getPairId,
                                //                         'amount': $scope.priceBuyAt,
                                //                         'total_amount': $scope.getTotalAmnt,
                                //                         'fee_value': $scope.getFee.value,
                                //                         'fee_percentage': $scope.getFee.percent,
                                //                         'quantity': $scope.qtyToBuy,
                                //                         'currency_code': vm.getCurrencyTo
                                //                     }

                                //                     tradeService.limitBuyPlaceOrder(data).then(function(response) {
                                //                         if (response.success) {

                                //                             toastr.success(response.message);
                                //                             $state.reload();

                                //                         } else {

                                //                             toastr.error(response.message);
                                //                         }
                                //                         $uibModalInstance.dismiss('cancel');
                                //                     }, function(err) {

                                //                         $uibModalInstance.dismiss('cancel');
                                //                     });
                                //                 } else {

                                //                     toastr.error(response.message);
                                //                     $uibModalInstance.dismiss('cancel');
                                //                 }
                                //             }, function(err) {

                                //                 $uibModalInstance.dismiss('cancel');
                                //             });

                                //         } // ok - function .

                                //         $scope.cancel = function() {
                                //             $uibModalInstance.dismiss('cancel');
                                //         }
                                //     }
                                // }); // modal

                            } else {
                                toastr.error(response1.message);
                            }
                        }, function (err) {

                        });

                    } // if
                } else {
                    vm.showZeroBuyAmtErr = true;
                }
            } //if
        }
        } // function end

        vm.changeSellVolume = function (value) {

            vm.limitSellFee = {};
            clearTimeout(limitSellTimer);
            // limitSellTimer = setTimeout(getLimitSellFee, 500);

            if (vm.limitSellForm.$valid) {
                if (value == 'volume') {
                    if (vm.limitSell.volume != 0) {

                        vm.showZeroSellVolErr = false;
                        vm.showMinSellLim = false;

                        if (vm.limitSell.volume < vm.minSellLimit) {
                            vm.showMinSellLim = true;
                            // vm.sell.total = undefined;
                            // vm.sell.final_total = undefined;
                            return;
                        }

                        if (angular.isDefined(vm.limitSell.sellPrice) && vm.limitSell.sellPrice != '' && vm.limitSell.sellPrice != 0) {
                            if (vm.limitSell.sellPrice != 0) {
                                vm.limitSell.total = calculateTotal(vm.limitSell.volume, vm.limitSell.sellPrice);
                                //vm.limitSell.final_total = vm.sell.total;
                                vm.showZeroSellPriceErr = false;
                                if (vm.limitSell.volume > parseFloat(vm.walletBalance_from.replace(/,/g, ''))) { // wallet balance from api is in string , so converting it to float
                                    vm.showWalletSellError = true;
                                    return;
                                } else {
                                    vm.showWalletSellError = false;
                                }
                                return;
                            } else {
                                // vm.buy.total = undefined;
                                //vm.buy.final_total = undefined;
                                vm.showZeroSellPriceErr = true;
                                return;
                            }
                        } else if (angular.isDefined(vm.limitSell.total) && vm.limitSell.total != '') {
                            if (vm.limitSell.total !== 0) {
                                vm.limitSell.sellPrice = calculatePrice(vm.limitSell.volume, vm.limitSell.total);
                            }
                        }

                    } else {

                        vm.limitSell.total = undefined;
                        //vm.limitSell.final_total = undefined;
                        vm.showWalletSellError = false;
                        vm.showMinSellLim = false;
                        vm.showZeroSellVolErr = true;
                        return;
                    }
                } // value == volume
                else if (value == 'price') {
                    if (vm.limitSell.sellPrice != 0) {
                        if (angular.isDefined(vm.limitSell.volume) && vm.limitSell.volume != '') {
                            if (vm.limitSell.volume != 0) {
                                vm.limitSell.total = calculateTotal(vm.limitSell.volume, vm.limitSell.sellPrice);
                                //   vm.limitSell.final_total = vm.sell.total;
                                vm.showZeroSellVolErr = false;
                            } else {
                                vm.showZeroSellVolErr = true;
                                return;
                            }
                        } else if (angular.isDefined(vm.limitSell.total) && vm.limitSell.total != '') {
                            if (vm.limitSell.total !== 0) {
                                vm.limitSell.volume = calculateVolume(vm.limitSell.sellPrice, vm.limitSell.total);
                            }
                        }
                        vm.showZeroSellPriceErr = false;
                    } else {
                        vm.limitSell.total = undefined;
                        //vm.limitSell.final_total = undefined;
                        vm.showWalletSellError = false;
                        vm.showZeroSellPriceErr = true;
                        return;
                    }
                } // value == price
                else if (value == 'amount') {
                    if (vm.limitSell.total != 0) {
                        if (angular.isDefined(vm.limitSell.sellPrice) && vm.limitSell.sellPrice != '' && vm.limitSell.sellPrice != 0) {

                            vm.limitSell.volume = calculateVolume(vm.limitSell.sellPrice, vm.limitSell.total);
                            // }
                        } else if (angular.isDefined(vm.limitSell.volume) && vm.limitSell.volume != '') {
                            if (vm.limitSell.volume !== 0) {
                                vm.limitSell.sellPrice = calculatePrice(vm.limitSell.volume, vm.limitSell.total);
                                vm.showZeroSellVolErr = false;
                                return;
                            } else {
                                vm.showZeroSellVolErr = true;

                                return;
                            }
                        }
                        vm.showZeroSellAmtErr = false;
                    } else {
                        vm.showZeroSellAmtErr = true;
                        vm.limitSell.volume = undefined;
                    }
                } // value == amount

                if (angular.isDefined(vm.limitSell.volume) && vm.limitSell.volume != 0 && vm.limitSell.volume < vm.minSellLimit) {
                    vm.showMinSellLim = true;
                    vm.showZeroSellVolErr = false;
                    vm.showWalletSellError = false;
                    return;
                } else {
                    // vm.sell.final_total = vm.sell.total;
                    if (vm.limitSell.volume > parseFloat(vm.walletBalance_from.replace(/,/g, ''))) { // wallet balance from api is in string , so converting it to float
                        vm.showWalletSellError = true;
                        return;
                    } else {
                        vm.showWalletSellError = false;
                    }
                    vm.showMinSellLim = false;
                    vm.showZeroSellPriceErr = false;
                    vm.showZeroSellVolErr = false;
                    vm.showZeroSellAmtErr = false;
                }

            } // form-valid
            else {
                if (angular.isUndefined(vm.limitSell.sellPrice) && angular.isUndefined(vm.limitSell.volume)) {
                    return;
                } else {
                    vm.showMinSellLim = false;
                    vm.showZeroSellPriceErr = false;
                    vm.showZeroSellVolErr = false;
                    vm.showWalletSellError = false;
                    return;
                }
            }
        }

        var limitSellTimer;

        function getLimitSellFee() {
            var data = {
                quantity: vm.limitSell.volume,
                amount: vm.limitSell.sellPrice,
                pairId: vm.getPairId
            }
            if (!vm.limitSell.volume || !vm.limitSell.sellPrice) {
                return;
            }
            tradeService.getLimitSellFee(data).then(function (response) {
                console.log("Obtained fees is", response)
                if (!response.success) {
                    return toastr.error(response.message);
                }
                vm.limitSellFee.feePercentage = response.feePercentage;
                vm.limitSellFee.feeValue = response.feeValue;

                if ((response.feeValue + parseFloat(vm.limitSell.volume)) <= parseFloat(vm.walletBalance_from)) {
                    vm.showWalletSellError = false;
                } else {
                    vm.showWalletSellError = true;
                }
            })
        }

        vm.limitSellOrder = function () {
            if(vm.limitSellForm.$valid && vm.showMinSellMarketErr ==false){
            if(!statusKYC){
                return toastr.error("Waiting KYC Approval.")
            }
            console.log("traitor 4")
            if (vm.limitSellForm.$valid) {
                if (vm.limitSell.total != 0) {
                    vm.showZeroSellAmtErr = false;
                    if (vm.limitSell.volume !== undefined && vm.limitSell.total !== undefined && !vm.showZeroSellVolErr && !vm.showMinSellLim && !vm.showZeroSellPriceErr && !vm.showWalletSellError) {

                        var data1 = {
                            'quantity': vm.limitSell.volume, // amount to sell
                            'amount': vm.limitSell.sellPrice, // price per btc
                            'pair_id': vm.getPairId
                        }

                        tradeService.limitSellCal(data1).then(function (response1) {
                            if (response1.success) {
                                //vm.getTtlSellPrc = response.total_amount;
                                var getSellFee = {
                                    'value': response1.fee_value,
                                    'percent': response1.fee_percentage
                                }

                                var data2 = {
                                    'currency_code': vm.getCurrencyFrom,
                                    'amount': vm.limitSell.volume
                                }

                                tradeService.limitCheckBalance(data2).then(function (response2) {
                                    if (response2.success) {

                                        var data3 = {
                                            'pair_id': vm.getPairId,
                                            'amount': vm.limitSell.sellPrice,
                                            'quantity': vm.limitSell.volume,
                                            'currency_code': vm.getCurrencyFrom
                                        }

                                        tradeService.limitSellPlaceOrder(data3).then(function (response3) {
                                            if (response3.success) {
                                                toastr.success(response3.message);
                                                $state.reload();
                                            } else {
                                                toastr.error(response3.message);
                                            }
                                        }, function (err) { });
                                    } else {
                                        toastr.error(response2.message);
                                    }
                                });

                                // $uibModal.open({
                                //     templateUrl: 'app/modules/dashboard/views/trade/modals/confirmModalSell.html',
                                //     size: 'lg modal-dialog-centered',
                                //     backdrop: 'static',
                                //     controller: function($scope, $uibModalInstance, tradeService, $stateParams) {
                                //         $scope.qtyToSell = vm.limitSell.volume;
                                //         $scope.sellPrice = vm.limitSell.sellPrice;
                                //         $scope.currToSell = vm.getCurrencyFrom;
                                //         $scope.currSellAt = vm.getCurrencyTo;
                                //         $scope.buyIcon = vm.getCurrencyToSymbol;
                                //         $scope.sellIcon = vm.getCurrencyFromSymbol;
                                //         $scope.getTotalAmnt = response.total_amount;
                                //         $scope.getFee = getSellFee;

                                //         $scope.ok = function() {

                                //             var data = {
                                //                 'currency_code': vm.getCurrencyFrom,
                                //                 'amount': vm.limitSell.volume
                                //             }

                                //             tradeService.limitCheckBalance(data).then(function(response) {
                                //                 if (response.success) {

                                //                     var data = {
                                //                         'pair_id': vm.getPairId,
                                //                         'amount': $scope.sellPrice,
                                //                         'quantity': $scope.qtyToSell,
                                //                         'currency_code': vm.getCurrencyFrom
                                //                     }

                                //                     tradeService.limitSellPlaceOrder(data).then(function(response) {
                                //                         if (response.success) {
                                //                             toastr.success(response.message);
                                //                             $state.reload();
                                //                         } else {
                                //                             toastr.error(response.message);
                                //                         }
                                //                         $uibModalInstance.dismiss('cancel');
                                //                     }, function(err) {
                                //                     });
                                //                 } else {
                                //                     toastr.error(response.message);
                                //                     $uibModalInstance.dismiss('cancel');
                                //                 }
                                //             });
                                //         }

                                //         $scope.cancel = function() {
                                //             $uibModalInstance.dismiss('cancel');
                                //         }
                                //     }
                                // }); // modal

                            } else {
                                toastr.error(response1.message);
                            }
                        }, function (err) { });

                    }
                } else {
                    vm.showZeroSellAmtErr = false;
                }
            }
        }
    }

        var calculateTotal = function (qty, price) {
            var precision = 8,
                chk = vm.getCurrencyTo;
            if (chk === "ETH" || chk === "BTC" || chk === "LTC" || chk === "USDT") {
                precision = 8;
            }
            if (chk === "USD") {
                precision = 2;
            }
            var total = parseFloat((qty) * (price.replace(/,/g, ''))).toFixed(precision);
            // if (total <= 0.01) {
            //     total = 0.01
            //     return total;
            // } else {
            //     return total
            // }
            console.log("Inside calculate total function", vm.getCurrencyTo, total)
            return total;
        }

        var calculateVolume = function (price, total) {
            var volume = parseFloat((total * 1) / (price * 1)).toFixed(8);
            return volume;
        }

        var calculatePrice = function (qty, total) {
            var price = parseFloat((total * 1) / (qty * 1)).toFixed(2);
            return price;
        }

        dashboardService.adminAccountDetail().then(function (response) {
            if (response.success) {
                vm.bankData = response.data;
            }
        }, function (err) {

        });

        $scope.changeCryptoSelection = function (item) {
            $state.go('dashboard.trade', ({ pair_id: item.pairId, currency_from: item.from, currency_to: item.to, currency_from_symbol: item.from_currency_icon_path, currency_to_symbol: vm.getCurrencyToSymbol }));
            $window.scroll(0, 0);
        }

        vm.cancelActiveOrders = function (item) {

            $uibModal.open({
                animation: false,
                templateUrl: 'app/modules/dashboard/views/trade/modals/cancelOrder.html',
                size: 'md modal-dialog-centered',
                // backdrop: 'static',
                controller: function ($scope, $uibModalInstance, tradeService, $stateParams) {

                    $scope.cancelActiveOrder = function () {

                        var data = {
                            "order_type": item.trade_type,
                            "id": item.id,
                        }

                        tradeService.cancelOrder(data).then(function (response) {
                            if (response.success) {

                                toastr.success('Order Cancelled Successfully');
                                /*   tradeService.getActiveOrders().then(function(response) {
                                       if (response.success) {
                                           vm.allBuyOrders = response.buyorder;
                                           vm.allSellOrders = response.sellorder;
                                           ngToast.create({
                                               className: 'success',
                                               content: 'Order Cancelled Successfully'
                                           });
                                       } else {
                                           ngToast.create({
                                               className: 'danger',
                                               content: 'Order Cancelled Successfully. But could not update active order list. Please try again later.'
                                           });
                                       }
                                   }, function(err) {});*/
                                $state.reload();
                            } else {

                                toastr.error(response.message);
                            }
                        }, function (err) {

                            toastr.error('Something went wrong.');
                        });

                        $uibModalInstance.dismiss('cancel');
                    }

                    $scope.dismissCancelOrder = function () {
                        $uibModalInstance.dismiss('cancel');
                    }
                }
            });

        }

        $scope.clickSellTab = function () {

            vm.limitBuyFee = {};
            vm.limitSellForm.$setPristine();
            tradeService.limitSellPrice({ 'pair_id': vm.getPairId }).then(function (response) {
                if (response.success) vm.limitSell.sellPrice = response.amount;
            }, function (err) { });

            vm.errMsgSell = undefined;
            vm.showWalletSellError = false;
            vm.showZeroSellAmtErr = false;
            vm.showZeroSellPriceErr = false;
            vm.showZeroSellVolErr = false;
            vm.showMinSellLim = false;
            vm.limitSell.volume = undefined;
            vm.limitSell.total = undefined;
            vm.sell.quantity = undefined;

        }

        $scope.clickBuyTab = function () {

            vm.limitSellFee = {};
            vm.limitBuyForm.$setPristine();
            tradeService.limitBuyPrice({ 'pair_id': vm.getPairId }).then(function (response) {
                if (response.success) {
                    vm.limitBuy.buyPrice = response.amount;
                }
            }, function (err) { });

            vm.errMsgBuy = undefined;
            vm.showWalletError = false;
            vm.showZeroBuyAmtErr = false;
            vm.showZeroBuyPriceErr = false;
            vm.showZeroBuyVolErr = false;
            vm.showMinBuyLim = false;
            vm.limitBuy.volume = undefined;
            vm.limitBuy.total = undefined;
            vm.buy.quantity = undefined;
        }

        vm.calculateLimitBuySpend = function (value) {
            var amount_to_spend = vm.walletBalance_to * (value / 100);
            vm.limitBuy.total = amount_to_spend;
            $timeout(function () { vm.changeBuyVolume('amount'); }, 1);
        }

        vm.calculateLimitSellSpend = function (value) {
            var volume_to_spend = vm.walletBalance_from * (value / 100);
            vm.limitSell.volume = parseFloat(volume_to_spend);
            $timeout(function () { vm.changeSellVolume('volume'); }, 1);
        }
        /////////// MARKET - START /////////////////


        vm.showMinBuyMar = false;
        vm.showMinSellMar = false;

        var marketBuyFee = '';
        var marketSellFee = '';

        vm.selectBuyMarket = function () {

            // tradeService.limitBuyPrice({ 'pair_id': vm.getPairId }).then(function(response) {
            //     if (response.success) {
            //         vm.buy.price = response.amount;
            //     }
            // }, function(err) {});
            vm.limitBuyFee = {};
            vm.buy.price = 'Market Price';
            vm.buy.quantity = undefined;
            //vm.buy.totalAmt = undefined;
            vm.errMsgBuy = undefined;
            vm.showMinBuyMar = false;
        }

        vm.selectSellMarket = function () {

            // tradeService.limitSellPrice({ 'pair_id': vm.getPairId }).then(function(response) {
            //     if (response.success) vm.sell.price = response.amount;
            // }, function(err) {});
            vm.limitSellFee = {};
            vm.sell.price = 'Market Price';
            vm.sell.quantity = undefined;
            //vm.sell.totalAmt = undefined;
            vm.errMsgSell = undefined;
            vm.showMinSellMar = false;
        }

        vm.calculateBuySpend = function (value) {

            var amount_to_spend = vm.walletBalance_to * (value / 100);
            vm.buy.quantity = amount_to_spend;
            vm.estimateBalBuy();
        }

        vm.calculateSellSpend = function (value) {

            var amount_to_spend = vm.walletBalance_from * (value / 100);
            vm.sell.quantity = amount_to_spend;
            vm.estimateBalSell();
        }

        vm.estimateBalBuy = function () {
          
            if (!isNaN(vm.buy.quantity)) {
                vm.errMsgBuy = undefined;
                tradeService.getTradeLimitByCurrencyCode({ 'id': vm.getCurrencyTo }).then(function (response) {
                     if (response.success) {
                         for (var i = 0; i < response.data.length; i++) {
                             if (response.data[i].operation == "Buy") {
                                 vm.minBuyLimit = response.data[i].min_amount;
                                 vm.maxBuyLimit = response.data[i].max_amount;
                             } else if (response.data[i].operation == "Sell") {
                                 vm.minSellLimit = response.data[i].min_amount;
                                 vm.maxSellLimit = response.data[i].max_amount;
                             }
                         }
                     }
                 }, function (err) { });
                 if(vm.minBuyLimit>vm.buy.quantity){
                    vm.showMaxBuyLimitErr = false;
                    vm.showMaxSellLimitErr = false;
                    vm.showMinBuyLimitErr = false;
                    vm.showMinSellLimitErr = false;
                    vm.showMaxBuyMarketErr = false;
                    vm.showMaxSellMarketErr = false;
                    vm.showMinBuyMarketErr = true;
                    vm.showMinSellMarketErr = false;
                }

                else {
                    vm.showMaxBuyLimitErr = false;
                    vm.showMaxSellLimitErr = false;
                    vm.showMinBuyLimitErr = false;
                    vm.showMinSellLimitErr = false;
                    vm.showMaxBuyMarketErr = false;
                    vm.showMaxSellMarketErr = false;
                    vm.showMinBuyMarketErr = false;
                    vm.showMinSellMarketErr = false;
                    var data = {
                        "amount": vm.buy.quantity,
                        "pair_id": vm.getPairId
                    }
                    vm.showMinBuyMar = false;
                    // tradeService.marketBuyQtyCheck(data).then(function (response) {
                    //     if (response.success) {
                    //         vm.errMsgBuy = undefined;
                    //     }
                    //     else {
                    //         vm.errMsgBuy = response.message;
                    //     }
                    // }, function (err) {
                    //     vm.errMsgBuy = undefined;
                    // });
                    // tradeService.estimateBuyQty(data).then(function(response) {
                    //     if (response.success) {
                    //        // vm.buy.totalAmt = response.quantity;
                    //         vm.marketBuyFee = marketBuyFee = {
                    //             'value': response.fee_value,
                    //             'percent': response.fee_percentage
                    //         }
                    //         vm.errMsgBuy = undefined;
                    //     } else {
                    //         vm.errMsgBuy = response.message;
                    //        // vm.buy.totalAmt = undefined;
                    //     }
                    // }, function(err) {
                    //    // vm.buy.totalAmt = undefined;
                    //     vm.errMsgBuy = undefined;

                    // });
                }
            } else {
                vm.errMsgBuy = undefined;
                //vm.buy.totalAmt = undefined;
                vm.showMinBuyMar = false;
            }
        }

        vm.estimateBalSell = function () {
            if (!isNaN(vm.sell.quantity)) {
                vm.errMsgSell = undefined;
                if ((vm.sell.quantity * 1.02) > vm.walletBalance_from) {
                    return vm.errMsgSell = 'Low Wallet Balance';
                }
                tradeService.getTradeLimitByCurrencyCode({ 'id': vm.getCurrencyFrom }).then(function (response) {
                    if (response.success) {
                        for (var i = 0; i < response.data.length; i++) {
                            if (response.data[i].operation == "Buy") {
                                vm.minBuyLimit = response.data[i].min_amount;
                                vm.maxBuyLimit = response.data[i].max_amount;
                            } else if (response.data[i].operation == "Sell") {
                                vm.minSellLimit = response.data[i].min_amount;
                                vm.maxSellLimit = response.data[i].max_amount;
                            }
                        }
                    }
                }, function (err) { });
            
                if(vm.minSellLimit>vm.sell.quantity){
                   vm.showMaxBuyLimitErr = false;
                   vm.showMaxSellLimitErr = false;
                   vm.showMinBuyLimitErr = false;
                   vm.showMinSellLimitErr = false;
                   vm.showMaxBuyMarketErr = false;
                   vm.showMaxSellMarketErr = false;
                   vm.showMinBuyMarketErr = false;
                   vm.showMinSellMarketErr = true;
               }
            
                else {
                    vm.showMaxBuyLimitErr = false;
                    vm.showMaxSellLimitErr = false;
                    vm.showMinBuyLimitErr = false;
                    vm.showMinSellLimitErr = false;
                    vm.showMaxBuyMarketErr = false;
                    vm.showMaxSellMarketErr = false;
                    vm.showMinBuyMarketErr = false;
                    vm.showMinSellMarketErr = false;

                    var data = {
                        // "currency_code": vm.getCurrencyFrom,
                        "pair_id": vm.getPairId,
                        "quantity": vm.sell.quantity
                    }

                    vm.showMinSellMar = false;
                    // tradeService.marketSellQtyCheck(data).then(function (response) {
                    //     if (response.success) {
                    //         vm.errMsgSell = undefined;
                    //     } else {
                    //         vm.errMsgSell = response.message;
                    //     }
                    // }, function (err) {
                    //     vm.errMsgSell = undefined;
                    // });

                    // tradeService.estimateSellQty(data).then(function(response) {
                    //     if (response.success) {
                    //         //vm.sell.totalAmt = parseFloat(response.amount).toFixed(2);
                    //         vm.marketSellFee = marketSellFee = {
                    //             'value': response.fee_value,
                    //             'percent': response.fee_percentage
                    //         }
                    //         vm.errMsgSell = undefined;
                    //     } else {
                    //         vm.errMsgSell = response.message;
                    //         //vm.sell.totalAmt = undefined;
                    //     }
                    // }, function(err) {
                    //     vm.errMsgSell = undefined;
                    //     //vm.sell.totalAmt = undefined;
                    // });
                }
            } else {
                vm.errMsgSell = undefined;
                // vm.sell.totalAmt = undefined;
                vm.showMinSellMar = false;
            }

        }

        vm.buyNow = function () {
            if(vm.buyForm.$valid && vm.showMinBuyMarketErr ==false){

            if(!statusKYC){
                return toastr.error("Waiting KYC Approval.")
            }
            console.log("traitor 2")
            if (vm.buyForm.$valid && !vm.errMsgBuy && !vm.showMinBuyMar && vm.buy.quantity != 0) {

                var data = {
                    "amount": vm.buy.quantity,
                    "currency_code": vm.getCurrencyTo,
                    "pair_id": vm.getPairId
                }

                tradeService.marketBuy(data).then(function (response) {
                    if (response.success) {
                        toastr.success(response.message);
                    } else {
                        toastr.error(response.message);
                    }
                    $state.reload();
                }, function (err) {
                    toastr.error(response.message);
                });

                /*$uibModal.open({
                    templateUrl: 'app/modules/dashboard/views/trade/modals/confirmBuyMarket.html',
                    size: 'lg modal-dialog-centered',
                    backdrop: 'static',
                    controller: function($scope, $uibModalInstance, tradeService, $stateParams) {
                        $scope.price = vm.buy.price;
                        $scope.fromCurrency = vm.getCurrencyFrom;
                        $scope.toCurrency = vm.getCurrencyTo;
                        $scope.fromCurrencySymbol = vm.getCurrencyFromSymbol;
                        $scope.toCurrencySymbol = vm.getCurrencyToSymbol;
                        $scope.getFee = marketBuyFee;
                        $scope.qtyToSpend = vm.buy.quantity;
                        $scope.total = vm.buy.totalAmt;

                        $scope.placeOrder = function() {
                            var data = {
                                "amount": vm.buy.quantity,
                                "currency_code": vm.getCurrencyTo,
                                "pair_id": vm.getPairId
                            }

                            tradeService.marketBuy(data).then(function(response) {
                                if (response.success) {

                                } else {

                                }
                                $state.reload();
                            }, function(err) {

                            });
                            $uibModalInstance.dismiss('cancel');
                        }

                        $scope.cancelOrder = function() {
                            $uibModalInstance.dismiss('cancel');
                        }
                    }
                }); // modal*/
            }
        }
    }

        vm.sellNow = function () {
            if (vm.sellForm.$valid && vm.showMinSellMarketErr == false){
            if(!statusKYC){
                return toastr.error("Waiting KYC Approval.")
            }
            console.log("traitor 3")
            if (vm.sellForm.$valid && !vm.errMsgSell && !vm.showMinSellMar && vm.sell.quantity != 0) {

                var data = {
                    "currency_code": vm.getCurrencyFrom,
                    "pair_id": vm.getPairId,
                    "quantity": vm.sell.quantity
                }

                tradeService.marketSell(data).then(function (response) {
                    if (response.success) {
                        toastr.success(response.message);
                        $state.reload();
                    } else {
                        toastr.error(response.message);
                    }
                }, function (err) {
                    toastr.error(response.message);
                });


                // $uibModal.open({
                //     templateUrl: 'app/modules/dashboard/views/trade/modals/confirmSellMarket.html',
                //     size: 'lg modal-dialog-centered',
                //     backdrop: 'static',
                //     controller: function($scope, $uibModalInstance, tradeService, $stateParams) {
                //         $scope.qtyToSell = vm.sell.quantity;
                //         $scope.fromCurrency = vm.getCurrencyFrom;
                //         $scope.toCurrency = vm.getCurrencyTo;
                //         $scope.fromCurrencySymbol = vm.getCurrencyFromSymbol;
                //         $scope.toCurrencySymbol = vm.getCurrencyToSymbol;
                //         $scope.getFee = marketSellFee;
                //         $scope.price = vm.sell.price;
                //         $scope.total = vm.sell.totalAmt;

                //         $scope.placeOrder = function() {
                //             var data = {
                //                 "currency_code": vm.getCurrencyFrom,
                //                 "pair_id": vm.getPairId,
                //                 "quantity": vm.sell.quantity
                //             }

                //             tradeService.marketSell(data).then(function(response) {
                //                 if (response.success) {
                //                     $state.reload();
                //                 } else {
                //                 }
                //             }, function(err) {
                //             });

                //             $uibModalInstance.dismiss('cancel');
                //         }

                //         $scope.cancelOrder = function() {
                //             $uibModalInstance.dismiss('cancel');
                //         }
                //     }
                // }); // modal

            }
        }
    }

        /////////// MARKET - END /////////////////

        //// Order Book


        vm.clickBuyOrder = function (item) {
            vm.limitBuy.volume = item.quantity.toString();
            vm.limitBuy.total = item.total_price.toString();
            vm.limitBuy.buyPrice = item.buy_price.toString();
            vm.limitSell.volume = item.quantity.toString();
            vm.limitSell.total = item.total_price.toString();
            vm.limitSell.sellPrice = item.buy_price.toString();
        }

        vm.clickSellOrder = function (item) {
            vm.limitBuy.volume = item.quantity.toString();
            vm.limitBuy.total = item.total_price.toString();
            vm.limitBuy.buyPrice = item.sell_price.toString();
            vm.limitSell.volume = item.quantity.toString();
            vm.limitSell.total = item.total_price.toString();
            vm.limitSell.sellPrice = item.sell_price.toString();
        }
        vm.highlightPair = function () {
            var curFrom = sessionStorage.getItem("curFrom");
            var curTo = sessionStorage.getItem("curTo");
            $rootScope.fromPair = sessionStorage.getItem("curFrom");
            $rootScope.toPair = sessionStorage.getItem("curTo");
            var curPair = curFrom + "/" + curTo;
            var a = setInterval(function () {
                $(".active-row-pair tr .live").each(function () {
                    var $this = $(this);
                    $(".active-row-pair tr").removeClass('active-tr');
                    if ($this.text().trim() == curPair) {
                        //console.log('1');
                        $(".active-row-pair tr").removeClass('active-tr');
                        $this.parents('tr').addClass('active-tr');
                    }
                    else if (!$this.text().trim() == curPair) {
                        //$(".active-row-pair tr").removeClass('active-tr');	
                    }


                });
            }, 1000);

        }


        $(function () {
            $("#slider").slider({
                value: vm.position
            });
        });

        $(function () {
            $("#slider2").slider({
                value: vm.yearlyPosition
            });
        });

    }
]);