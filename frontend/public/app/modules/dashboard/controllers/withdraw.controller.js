dashboard.controller("WithdrawController", ['$rootScope', '$scope', '$templateCache', '$state', 'toastr', '$interval', 'dashboardService', 'tradeService', 'uiGridConstants', '$timeout', '$filter', '$window', '$stateParams', '$uibModal', 'WITHDRAW_DEPOSIT', 'WITHDRAW_DEPOSIT_STATUS', 'WITHDRAW_DEPOSIT_STATUS_INR',
    function ($rootScope, $scope, $templateCache, $state, toastr, $interval, dashboardService, tradeService, uiGridConstants, $timeout, $filter, $window, $stateParams, $uibModal, WITHDRAW_DEPOSIT, WITHDRAW_DEPOSIT_STATUS, WITHDRAW_DEPOSIT_STATUS_INR) {

        var vm = this;
        $scope.form = {};
        vm.cryptoCurrencies = [];
        vm.currencySelected = "";
        vm.showMinWithdrawErr = false;
        vm.showMaxWithdrawErr = false;
        vm.showCommissionAmt = false;
        vm.showZeroAmtErr = false;
        vm.showWalletAmtErr = false;
        vm.withdrawFee = 0;
        vm.withdrawFeeValue = 0;

        var statusKYC = false;

        var resetParams = function () {
            vm.withdrawAmt = '';
            vm.withdrawalAmtToUser = undefined;
            vm.commissionFee = undefined;
            vm.ttlWithdrawAmt = undefined;
            vm.showMinWithdrawErr = false;
            vm.showMaxWithdrawErr = false;
            vm.showCommissionAmt = false;
            vm.showZeroAmtErr = false;
            vm.withdraw.receiverAddress = undefined;
            vm.showWalletAmtErr = false;


        }
        $scope.statusKYCW = true;
        dashboardService.getKycStatus().then(function (response) {
            statusKYC = (response.completeinfo === 2) ? true : false;
            $scope.statusKYCW = (response.completeinfo === 2) ? false : true;
        }, function (err) {
            console.log("Err occurred is", err);
        });

        vm.removeModel = () => {
            $('.modal-backdrop').remove();
        }
        var dateFormat = sessionStorage.getItem("DateFormat") != undefined ? sessionStorage.getItem("DateFormat") : 'dd-MM-yyyy HH:mm a';
        /**date filter for ui grid**/
        // Set Bootstrap DatePickerPopup config
        $scope.datePicker = {

            options: {
                formatMonth: 'MM',
                startingDay: 1
            },
            format: "yyyy-MM-dd"
        };

        $scope.getCryptoPairsOnSelect = (pair) => {
            var defaultPair = {
                'id': pair
            }
            dashboardService.getCurrencyPairSelected(defaultPair).then(function (response) {
                if (response.success) {
                    // response.result.sort(sortItems);
                    // vm.graphCurrencyList = response.result;
                    console.log('.....', response.data)
                    $scope.cryptoPairsModal = response.data
                } else {
                    console.log('error is ')
                    toastr.error(response.message);
                    //error msg toast
                }
            });

        }


        // Set two filters, one for the 'Greater than' filter and other for the 'Less than' filter
        $scope.showDatePopup = [];
        $scope.showDatePopup.push({ opened: false });
        $scope.showDatePopup.push({ opened: false });

        $templateCache.put('ui-grid/date-cell',
            "<div class='ui-grid-cell-contents'>{{COL_FIELD | date:'yyyy-MM-dd'}}</div>"
        );

        // Custom template using Bootstrap DatePickerPopup
        // Custom template using Bootstrap DatePickerPopup
        $templateCache.put('ui-grid/ui-grid-date-filter',
            "<div class=\"ui-grid-filter-container\" ng-repeat=\"colFilter in col.filters\" >" +
            "<input type=\"text\" uib-datepicker-popup=\"{{datePicker.format}}\" " +
            "datepicker-options=\"datePicker.options\" " +
            "datepicker-append-to-body=\"true\" show-button-bar=\"false\"" +
            "is-open=\"showDatePopup[$index].opened\" class=\"ui-grid-filter-input ui-grid-filter-input-{{$index}}\"" +
            "style=\"font-size:1em; width:9em!important\" ng-model=\"colFilter.term\" ng-attr-placeholder=\"{{colFilter.placeholder || ''}}\" " +
            " aria-label=\"{{colFilter.ariaLabel || aria.defaultFilterLabel}}\" />" +

            "<span style=\"padding-left:0.3em;\"><button type=\"button\"   class=\"btn btn-default btn-sm date-filter-btn custom-calender-btn\" ng-click=\"showDatePopup[$index].opened = true\">" +
            "<i class=\"fa fa-calendar\" aria-hidden='true'></i></button></span>" +

            "<div role=\"button\" class=\"ui-grid-filter-button\" ng-click=\"removeFilter(colFilter, $index)\" ng-if=\"!colFilter.disableCancelFilterButton\" ng-disabled=\"colFilter.term === undefined || colFilter.term === null || colFilter.term === ''\" ng-show=\"colFilter.term !== undefined && colFilter.term !== null && colFilter.term !== ''\">" +
            "<i class=\"ui-grid-icon-cancel\" ui-grid-one-bind-aria-label=\"aria.removeFilter\">&nbsp;</i></div></div><div ng-if=\"colFilter.type === 'select'\"><select class=\"ui-grid-filter-select ui-grid-filter-input-{{$index}}\" ng-model=\"colFilter.term\" ng-attr-placeholder=\"{{colFilter.placeholder || aria.defaultFilterLabel}}\" aria-label=\"{{colFilter.ariaLabel || ''}}\" ng-options=\"option.value as option.label for option in colFilter.selectOptions\"><option value=\"\"></option></select><div role=\"button\" class=\"ui-grid-filter-button-select\" ng-click=\"removeFilter(colFilter, $index)\" ng-if=\"!colFilter.disableCancelFilterButton\" ng-disabled=\"colFilter.term === undefined || colFilter.term === null || colFilter.term === ''\" ng-show=\"colFilter.term !== undefined && colFilter.term != null\"><i class=\"ui-grid-icon-cancel\" ui-grid-one-bind-aria-label=\"aria.removeFilter\">&nbsp;</i></div></div>"
        );

        $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
            if (col.filters[0].term) {
                return 'header-filtered';
            } else {
                return '';
            }
        };

        /**date filter for ui grid end here**/

        dashboardService.faStatus({ "status": 0 }).then(function (response) {

            vm.userFAStatus = response.faStatus;
        })

        vm.withdrawStatusvalue = 1;
        vm.selectListCur = function (data) {
            // if(!statusKYC){
            //     console.log("checking the kyc status in the accordions")
            //     return toastr.error("Waiting KYC Approval.");
            // }
            // console.log("traitor 7");
            vm.currencySelected = data;
            dashboardService.getWalletInfoByCurrency({ 'id': vm.currencySelected }).then(function (response) {
                if (response.success)
                    vm.withdrawWalletBalance = response.walletinfo.total_amount;
                vm.currencySelected = response.walletinfo.currency_code;

            });

            if (vm.withdrawStatusvalue != 1) {
                return vm.withdrawStatusvalue = vm.withdrawStatusvalue == 1 ? 0 : 1;
            }
            vm.withdrawStatusvalue = vm.withdrawStatusvalue == 1 ? 0 : 1;
            // vm.currencySelected = data;
            vm.otp = "";
            vm.verifyCode = "";
            vm.withdrawFormCrypto.$setPristine();
            resetParams();

            tradeService.getTradeLimitByCurrencyCode({ 'id': vm.currencySelected }).then(function (response) {
                for (var i = 0; i < response.data.length; i++) {
                    if (response.data[i].operation == "Withdraw") {
                        vm.minWithdrawAmt = response.data[i].min_amount;
                        vm.maxWithdrawAmt = response.data[i].max_amount;
                        break;
                    }
                }

            });

            //Default Load
            //$scope.getGridData();

        }

        vm.withdrawal = {};

        // vm.refreshTxnHistory = function() {
        //     $scope.drawGrid();
        // }

        vm.changeAmount = function () {
            vm.withdrawFeeValue = vm.withdrawFee * vm.withdrawAmt * 0.01 || 0;

            if (vm.withdrawForm.wdAmount.$invalid) {
                vm.ttlWithdrawAmt = 0;
                vm.showMinWithdrawErr = false;
                vm.showMaxWithdrawErr = false;
                vm.showZeroAmtErr = false;
                vm.showWalletAmtErr = false;
                vm.withdrawalAmtToUser = undefined;
                vm.commissionFee = undefined;
            } else if (vm.withdrawWalletBalance == 0) {
                vm.showWalletAmtErr = true;
                vm.showMinWithdrawErr = false;
                vm.showMaxWithdrawErr = false;
                vm.showZeroAmtErr = false;
                vm.withdrawForm.$valid = false;
            } else if (vm.withdrawAmt == 0 && vm.minWithdrawAmt == 0) {
                vm.showZeroAmtErr = true;
                vm.withdrawForm.$valid = false;
                vm.showMinWithdrawErr = false;
                vm.showMaxWithdrawErr = false;
                vm.showWalletAmtErr = false;
                // } else if (vm.withdrawAmt < vm.minWithdrawAmt) {
                //     vm.showMinWithdrawErr = true;
                //     vm.showZeroAmtErr = false;
                //     vm.withdrawForm.$valid = false;
                //     vm.showMaxWithdrawErr = false;
                //     vm.showWalletAmtErr = false;
                // } else if (vm.withdrawAmt > vm.maxWithdrawAmt) {
                //     vm.showMinWithdrawErr = false;
                //     vm.showZeroAmtErr = false;
                //     vm.withdrawForm.$valid = false;
                //     vm.showMaxWithdrawErr = true;
                //     vm.showWalletAmtErr = false;
            } else if (parseFloat(vm.withdrawAmt) > parseFloat(vm.withdrawWalletBalance)) {
                vm.showWalletAmtErr = true;
                vm.showMinWithdrawErr = false;
                vm.showMaxWithdrawErr = false;
                vm.showZeroAmtErr = false;
                vm.withdrawForm.$valid = false;
            } else {
                vm.showMinWithdrawErr = false;
                vm.showZeroAmtErr = false;
                vm.showMaxWithdrawErr = false;
                vm.showWalletAmtErr = false;
                //vm.withdrawForm.$valid = true;
                /*var calcAmount = (vm.withdrawAmt * (vm.minCommissionPercentage / 100));
                if (calcAmount < vm.minCommissionAmount) {
                    vm.showCommissionAmt = true;
                    feeValue = vm.minCommissionAmount;
                    feePercent = 0;
                    vm.ttlWithdrawAmt = (vm.withdrawAmt * 1) + (vm.minCommissionAmount * 1);
                } else {
                    vm.showCommissionAmt = false;
                    feeValue = calcAmount;
                    feePercent = vm.minCommissionPercentage;
                    vm.ttlWithdrawAmt = (vm.withdrawAmt * 1) + (calcAmount * 1);
                }*/
                //withdrawCalculation();
            } //else

        }

        vm.changeAmountCrypto = function () {

            if (vm.withdrawFormCrypto.wdAmount.$invalid) {
                vm.ttlWithdrawAmt = 0;
                vm.showMinWithdrawErr = false;
                vm.showMaxWithdrawErr = false;
                vm.showZeroAmtErr = false;
                vm.showWalletAmtErr = false;
                vm.withdrawalAmtToUser = undefined;
                vm.commissionFee = undefined;
            } else if (vm.withdrawWalletBalance == 0) {
                vm.showWalletAmtErr = true;
                vm.showMinWithdrawErr = false;
                vm.showMaxWithdrawErr = false;
                vm.showZeroAmtErr = false;
                vm.withdrawFormCrypto.$valid = false;
            } else if (vm.withdrawAmt == 0 && vm.minWithdrawAmt == 0) {
                vm.showZeroAmtErr = true;
                vm.withdrawFormCrypto.$valid = false;
                vm.showMinWithdrawErr = false;
                vm.showMaxWithdrawErr = false;
                vm.showWalletAmtErr = false;
            } else if (vm.withdrawAmt < vm.minWithdrawAmt) {
                vm.showMinWithdrawErr = true;
                vm.showZeroAmtErr = false;
                vm.withdrawFormCrypto.$valid = false;
                vm.showMaxWithdrawErr = false;
                vm.showWalletAmtErr = false;
            } else if (vm.withdrawAmt > vm.maxWithdrawAmt) {
                vm.showMinWithdrawErr = false;
                vm.showZeroAmtErr = false;
                vm.withdrawFormCrypto.$valid = false;
                vm.showMaxWithdrawErr = true;
                vm.showWalletAmtErr = false;
            } else if (parseFloat(vm.withdrawAmt) > parseFloat(vm.withdrawWalletBalance)) {
                vm.showWalletAmtErr = true;
                vm.showMinWithdrawErr = false;
                vm.showMaxWithdrawErr = false;
                vm.showZeroAmtErr = false;
                vm.withdrawFormCrypto.$valid = false;
            } else {
                vm.showMinWithdrawErr = false;
                vm.showZeroAmtErr = false;
                vm.showMaxWithdrawErr = false;
                vm.showWalletAmtErr = false;
                //vm.withdrawForm.$valid = true;
                /*var calcAmount = (vm.withdrawAmt * (vm.minCommissionPercentage / 100));
                if (calcAmount < vm.minCommissionAmount) {
                    vm.showCommissionAmt = true;
                    feeValue = vm.minCommissionAmount;
                    feePercent = 0;
                    vm.ttlWithdrawAmt = (vm.withdrawAmt * 1) + (vm.minCommissionAmount * 1);
                } else {
                    vm.showCommissionAmt = false;
                    feeValue = calcAmount;
                    feePercent = vm.minCommissionPercentage;
                    vm.ttlWithdrawAmt = (vm.withdrawAmt * 1) + (calcAmount * 1);
                }*/
                //withdrawCalculation();
            } //else
        }

        vm.getWithdrawFee = function (currency_code) {
            console.log("checking currency code", currency_code);
            tradeService.getCommission(currency_code).then(function (response) {
                if (response.success) {
                    console.log("Response is", response);
                    vm.withdrawFee = response.data.filter(x => x.operation === "Withdraw")[0].min_percentage;
                    vm.withdrawFeeValue = vm.withdrawFee * vm.withdrawAmt * 0.01 || 0;
                }
            })
            console.log("kyc called test.")
            if (!$scope.statusKYCW) {
              $('#withdrawMoneyModal').modal('show');
            }else{
                return toastr.error("Waiting KYC Approval.");
            }
        }

        var withdrawCalculation = function () {
            var walletAmount;
            dashboardService.getWalletInfoByCurrency({ 'id': vm.currencySelected }).then(function (response) {
                if (response.success)
                    walletAmount = response.walletinfo.total_amount;
                //   });

                /*dashboardService.getWallet().then(function(response) {
                    for (var i = 0; i < response.data.length; i++) {
                        if (response.data[i].currency_code == vm.currencySelected.currency_code) {
                            walletAmount = response.data[i].total_amount;
                            break;
                        }
                    }*/

                if (walletAmount == 0) {
                    vm.showWalletAmtErr = true;
                    vm.withdrawForm.wdAmount.$valid = false;
                    //resetParams();
                }
                /*else if (vm.withdrawAmt == walletAmount) {
                    var fees = (vm.withdrawAmt * (vm.minCommissionPercentage / 100));
                    if (fees < vm.minCommissionAmount && vm.minCommissionAmount !== 0) {
                        vm.showCommissionAmt = true;
                        fees = vm.minCommissionAmount;
                        var withdrawal_amount_to_user = vm.withdrawAmt - fees;
                        var total = (withdrawal_amount_to_user * 1) + (fees * 1); //same as withdraw amount
                    } else {
                        vm.showCommissionAmt = false;
                        var withdrawal_amount_to_user = vm.withdrawAmt - fees;
                        var total = (withdrawal_amount_to_user * 1) + (fees * 1);
                    }
                    vm.withdrawalAmtToUser = withdrawal_amount_to_user;
                    vm.commissionFee = fees;
                    vm.ttlWithdrawAmt = total;
                    vm.showWalletAmtErr = false;
                } else if (vm.withdrawAmt < walletAmount) {
                    var fees = (vm.withdrawAmt * (vm.minCommissionPercentage / 100));
                    if (fees < vm.minCommissionAmount && vm.minCommissionAmount !== 0) {
                        vm.showCommissionAmt = true;
                        fees = vm.minCommissionAmount;
                        var withdrawal_amount_to_user = vm.withdrawAmt;
                        var total = (withdrawal_amount_to_user * 1) + (fees * 1);

                        if (total > walletAmount) {
                            withdrawal_amount_to_user = walletAmount - fees;
                            total = (withdrawal_amount_to_user * 1) + (fees * 1);
                            // vm.showWalletAmtErr = true;
                            // vm.withdrawForm.$valid = false;
                            // Error - total amount is greater than wallet amount;
                        }
                        // else vm.showWalletAmtErr = false;
                    } else {
                        vm.showCommissionAmt = false;
                        var withdrawal_amount_to_user = vm.withdrawAmt;
                        var total = (withdrawal_amount_to_user * 1) + (fees * 1);

                        if (total > walletAmount) {
                            withdrawal_amount_to_user = walletAmount - fees;
                            total = (withdrawal_amount_to_user * 1) + (fees * 1);
                            // vm.showWalletAmtErr = true;
                            // vm.withdrawForm.$valid = false;
                            // Error - total amount is greater than wallet amount;
                        }
                        //else vm.showWalletAmtErr = false;
                    }
                    vm.ttlWithdrawAmt = total;
                    vm.withdrawalAmtToUser = withdrawal_amount_to_user;
                    vm.commissionFee = fees;
                } else { // amount > wallet amount
                    var fees = (vm.withdrawAmt * (vm.minCommissionPercentage / 100));
                    if (fees < vm.minCommissionAmount && vm.minCommissionAmount !== 0) {
                        vm.showCommissionAmt = true;
                        fees = vm.minCommissionAmount;
                        var withdrawal_amount_to_user = walletAmount - fees;
                        var total = (withdrawal_amount_to_user * 1) + (fees * 1);
                    } else {
                        vm.showCommissionAmt = false;
                        var withdrawal_amount_to_user = walletAmount - fees;
                        var total = (withdrawal_amount_to_user * 1) + (fees * 1);
                    }
                    vm.withdrawalAmtToUser = withdrawal_amount_to_user;
                    vm.ttlWithdrawAmt = total;
                    vm.commissionFee = fees;
                    vm.showWalletAmtErr = true;
                }*/

            });

        }

        vm.withdraw = {};

        //variable to show send otp button
        vm.showSendButton = true;
        vm.OTPSent = false;

        //send otp to customer
        vm.sendCustomerOTP = function () {
            dashboardService.sendCustomerOTP({ otp: vm.otp, smsTemplateCode: 'WITHDRAWAL_OTP' }).then(function (response) {
                if (response.success) {
                    toastr.success(response.message);
                    vm.OTPSent = true;
                    try {
                        otpTimer(response.data.seconds);
                    } catch (e) {
                        otpTimer();
                    }
                }
                else
                    toastr.error(response.message);
            }).catch(function () {
                toastr.error('Error while sending OTP');
            })
        }

        vm.changeCustomerOTP = function () {

            dashboardService.changeCustomerOTP({ otp: vm.otp, smsTemplateCode: 'WITHDRAWAL_OTP' }).then(function (response) {
                if (response.success) {
                    toastr.success(response.message);
                    vm.OTPSent = true;
                    try {
                        otpTimer(response.data.seconds);
                    } catch (e) {
                        otpTimer();
                    }
                }
                else
                    toastr.error(response.message);
            }).catch(function () {
                toastr.error('Error while sending OTP');
            })
        }

        function otpTimer(seconds) {
            $interval.cancel(vm.timerInterval);
            vm.showSendButton = false;
            vm.timer = seconds ? seconds : 120;
            vm.timerInterval = $interval(function () {
                if (vm.timer <= 0) {
                    vm.showSendButton = true;
                    $interval.cancel(vm.timerInterval);
                    return;
                }
                vm.timer--;
            }, 1000)
        }

        vm.resetOTP = function () {
            // if(!statusKYC){
            //     return;
            // }
            // console.log("traitor 6");
            vm.showSendButton = true;
            delete vm.otp;
            vm.OTPSent = false;
            $interval.cancel(vm.timerInterval);
        }

        vm.getWalletFunc = function () {
            dashboardService.getWallet().then(function (response) {
                vm.getWallet = response.data;
            });
        }

        vm.getWalletCryptofunction = function () {
            dashboardService.getWalletCrypto().then(function (response) {
                vm.getWalletCrypto = response.data;
                vm.cryptoCurrencies.length = 0;
                for (i = 0; i < response.data.length; i++) {
                    if (response.data[i].Cryptotype === 1) {
                        vm.cryptoCurrencies.push({ name: response.data[i].currency_code, value: response.data[i].currency_code, label: response.data[i].currency_code })
                    }
                }
            });
        }

        vm.getWalletCryptofunction = function () {
            console.log("called 2nd crypto one.")
            dashboardService.getWalletCryptoDetails().then(function (response) {
                vm.getWalletCrypto = response.data;
                vm.cryptoCurrencies.length = 0;
                for (i = 0; i < response.data.length; i++) {
                    if (response.data[i].Cryptotype === 1) {
                        vm.cryptoCurrencies.push({ name: response.data[i].currency_code, value: response.data[i].currency_code, label: response.data[i].currency_code })
                    }
                }
                console.log("getWalletCrypto", vm.getWalletCrypto, "cryptoCurrencies", vm.cryptoCurrencies, response);
            });
        }

        /**
         * Adding balance update for both header H and crypto wallet W ng-repeat
         */
        $rootScope.updateBalanceHW2 = function () {
            console.log("uBHW2 called");
            dashboardService.getWalletCryptoDetails().then(function (response) {
                vm.getWalletCrypto = response.data;
                vm.cryptoCurrencies.length = 0;
                for (i = 0; i < response.data.length; i++) {
                    if (response.data[i].Cryptotype === 1) {
                        vm.cryptoCurrencies.push({ name: response.data[i].currency_code, value: response.data[i].currency_code, label: response.data[i].currency_code })
                    }
                }
            });
        }

        vm.generateWithdrawRequest = function () {



            if (vm.withdrawForm.$valid) {
          
                var data = {
                    "amount": vm.withdrawAmt,
                    "currency_code": vm.currencySelected,
                    "device_ipAddress": sessionStorage.getItem('myIP'),
                    "device_os": sessionStorage.getItem('myOS'),
                    "device_name": sessionStorage.getItem('myDevice'),
                    "device_browser": sessionStorage.getItem('myBrowser'),
                    "receiverAddress": vm.withdraw.receiverAddress,
                    "verify2FA": vm.verifyCode,
                    "otp": vm.otp
                }

console.log("to string data",data)

                dashboardService.withdrawMoneyRequest(data).then(function (response) {
                    if (response.success) {

                        toastr.success(response.message);
                        // ngToast.create({
                        //     className: 'success',
                        //     content: response.message
                        // });
                        dashboardService.getWalletInfoByCurrency({ 'id': vm.currencySelected }).then(function (response) {
                            if (response.success)
                                vm.withdrawWalletBalance = response.walletinfo.total_amount;
                        });
                        //vm.refreshTxnHistory();
                        resetParams();
                        vm.withdrawForm.$submitted = false;
                        $window.scroll(0, 0);
                        //$uibModalInstance.dismiss('cancel');
                        $('#withdrawMoneyModal').modal('hide')
                        vm.getWalletFunc();
                        // vm.getWalletCryptofunction()


                    } else {
                        if (response.message !== 'Incorrect OTP') {

                        }
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

            } //if
        }


        vm.generateWithdrawRequestCrypto = function () {

            if (vm.withdrawFormCrypto.$valid) {
                var data = {
                    "amount": vm.withdrawAmt,
                    "currency_code": vm.currencySelected,
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
                        dashboardService.getWalletInfoByCurrency({ 'id': vm.currencySelected }).then(function (response) {
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



        //   dashboardService.ethBalance(data).then(function(response) {
        //     dashboardService.btcBalance(data).then(function(response) {

        vm.getWalletFunc();
        vm.getWalletCryptofunction();
        //});
        //});
        dashboardService.adminAccountDetail().then(function (response) {
            console.log('reponse', response)
            vm.adminAccountDetails = response.data
        })

        //ui-Grid Call


        //$scope.orderCoulmn = '';
        //$scope.orderDirection = '';

        //Pagination
        $scope.paginationcrypto = {
            paginationPageSizes: [10, 25, 50, 100],
            ddlpageSize: 10,
            pageNumber: 1,
            pageSize: 10,
            totalItems: 0,
            filter_value: '',

            getTotalPages: function () {
                return Math.ceil(this.totalItems / this.pageSize);
            },
            pageSizeChange: function () {
                if (this.ddlpageSize == "All")
                    this.pageSize = $scope.paginationcrypto.totalItems;
                else
                    this.pageSize = this.ddlpageSize

                this.pageNumber = 1
                $scope.getcryptoHistoryTable();
            },
            firstPage: function () {
                if (this.pageNumber > 1) {
                    this.pageNumber = 1
                    $scope.cryptoHistory();
                } else {
                    this.pageNumber = 1
                    $scope.cryptoHistory();
                }
            },
            nextPage: function () {
                if (this.pageNumber < this.getTotalPages()) {
                    this.pageNumber++;
                    $scope.cryptoHistory();
                } else {
                    this.pageNumber = 1
                    $scope.cryptoHistory();
                }
            },
            previousPage: function () {
                if (this.pageNumber > 1) {
                    this.pageNumber--;
                    $scope.cryptoHistory();
                } else {
                    this.pageNumber = 1
                    $scope.cryptoHistory();
                }
            },
            currentPage: function () {
                if (this.pageNumber > 1) {
                    $scope.cryptoHistory();
                } else {
                    $scope.cryptoHistory();
                }
            },
            lastPage: function () {
                if (this.pageNumber >= 1) {
                    this.pageNumber = this.getTotalPages();
                    $scope.cryptoHistory();
                } else {
                    this.pageNumber = 1
                    $scope.cryptoHistory();
                }
            }
        };


        $scope.cryptoHistoryOption = [];
        $scope.getcryptoHistoryTable = function () {
            $scope.cryptoHistoryOption = {
                useExternalPaginationcrypto: true,
                useExternalSorting: true,
                enableFiltering: true,
                enableSorting: true,
                enableRowSelection: false,
                enableSelectAll: false,
                enableColumnMenus: false,
                exporterCsvFilename: 'cryptoHistory.csv',
                exporterPdfDefaultStyle: { fontSize: 9 },
                exporterPdfTableStyle: { margin: [0, 0, 0, 0] },
                exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'black' },
                exporterPdfOrientation: 'landscape',
                exporterPdfPageSize: 'LETTER',
                exporterPdfMaxGridWidth: 600,
                onRegisterApi: function (gridApiCrypto) {
                    $scope.gridApiCrypto = gridApiCrypto;
                    $scope.gridApiCrypto.grid.clearAllFilters = function () {
                        this.columns.forEach(function (column) {
                            column.filters.forEach(function (filter) {
                                filter.term = undefined;
                            });
                        });
                        cryptoHistoryFilter = {};
                        $scope.getcryptoHistoryTable(); // your own custom callback
                    };

                    $scope.gridApiCrypto.core.on.filterChanged($scope, function () {
                        $scope.paginationcrypto.pageNumber = '1';
                        var grid = this.grid;
                        angular.forEach(grid.columns, function (value, key) {
                            if (!value.filters[0].term && value.filters[0].term !== 0) {
                                delete cryptoHistoryFilter[value.colDef.field];
                            } else {
                                cryptoHistoryFilter[value.colDef.field] = value.filters[0].term;
                            }
                        });
                        $scope.cryptoHistory();
                    });

                    $scope.gridApiCrypto.core.on.sortChanged($scope, function (val) {
                        var grid = this.grid;
                        angular.forEach(grid.columns, function (value, key) {
                            if (value.sort.direction) {
                                cryptoHistoryFilter['order_column'] = value.field;
                                cryptoHistoryFilter['order_direction'] = value.sort.direction;

                                $scope.orderCoulmn = value.field;
                                $scope.orderDirection = value.sort.direction;
                            }

                        });
                        $scope.cryptoHistory();

                    });
                },
                columnDefs: [{
                    field: 'created_at', order_column: 'tm.created_at', name: 'Date',
                    type: 'date', cellFilter: 'date:"' + dateFormat + '"', width: '15%',
                    enableFiltering: true,
                    filterHeaderTemplate: 'ui-grid/ui-grid-date-filter',
                    filters: [
                        {
                            condition: function (term, value, row, column) {
                                if (!term) return true;
                                var valueDate = new Date(value);
                                return valueDate >= term;
                            }
                        }]
                    , headerCellClass: 'text-left', cellClass: 'text-right'
                },
                {
                    field: 'currency_code',
                    name: 'Currency Code',
                    filter: {
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: vm.cryptoCurrencies
                    },
                    enableSorting: false,
                    width: '15%',
                    cellTooltip: function (row, col) {
                        return 'Currency: ' + row.entity.currency_code;
                    }
                },
                {
                    field: 'amount',
                    name: 'Amount',
                    width: '12%',
                    enableFiltering: false,
                    cellTooltip: function (row, col) {
                        return 'Amount: ' + row.entity.amount;
                    },
                    cellFilter: 'number :8',
                    cellClass: 'text-right',
                    headerCellClass: 'text-right',
                    exporterPdfAlign: 'right'
                },
                {
                    field: 'platform_value',
                    name: 'Fee ',
                    width: '12%',
                    enableFiltering: false,
                    cellTooltip: function (row, col) {
                        return 'Fee: ' + row.entity.platform_value;
                    },
                    cellFilter: 'number :8',
                    cellClass: 'text-right',
                    headerCellClass: 'text-right',
                    exporterPdfAlign: 'right'
                },
                {
                    field: 'type',
                    name: 'Type',
                    width: '13%',
                    enableSorting: false,
                    filter: {
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: WITHDRAW_DEPOSIT
                    },
                    cellTooltip: function (row, col) {
                        return 'type: ' + row.entity.type;
                    }
                },
                {
                    field: 'status',
                    name: 'Status',
                    width: '15%',
                    enableSorting: false,
                    cellTooltip: function (row, col) {
                        return 'Status: ' + row.entity.status;
                    },
                    filter: {
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: WITHDRAW_DEPOSIT_STATUS
                    },
                    cellFilter: 'mapWithdrawStatus',
                    cellTemplate: '<span ng-if="row.entity.status == 1"  style="font-size:14px; margin-left:1rem;">{{row.entity.status | mapWithdrawStatus}}</span>' +
                        '<span ng-if="row.entity.status == 2"  style="font-size:14px; margin-left:1rem;">{{row.entity.status | mapWithdrawStatus}}</span>' +
                        '<span ng-if="row.entity.status == 0"  style="font-size:14px; margin-left:1rem;">{{row.entity.status | mapWithdrawStatus}}</span>'
                },
                {
                    field: 'comment',
                    name: 'Comment',
                    width: '20%',
                    enableSorting: false,
                    enableFiltering: false,
                    cellTooltip: function (row, col) {
                        return 'Comment: ' + row.entity.comment;
                    }
                },
                ], exporterFieldCallback: function (grid, row, col, input) {
                    if (col.name == 'Status') {
                        //return input = $filter('mapWithdrawStatus');
                        var $return = '';
                        switch (input) {
                            case 0:
                                $return = 'Pending';
                                break; //Pending for Approval
                            case 1:
                                $return = 'Approved';
                                break; //Pending //Approved
                            case 2:
                                $return = 'Not Approved';
                                break; //Pending //Not Approved

                            default:

                        }
                        return $return;
                    }
                    if (col.name == 'Date') {
                        // return $filter('dateFilter')(row.entity.created_at, $rootScope.displayDate);
                        return moment(new Date(row.entity.created_at).getTime()).format("YYYY-MM-DD HH:mm:ss");
                    }
                    return input;
                },
            };

            $scope.cryptoHistory();
        }

        $scope.exportCrypto = function (format) {

            var limit = $scope.paginationcrypto.totalItems;
            var data = { 'limit': limit, 'offset': 0 }
            var result = dashboardService.walletHistoryCrypto(data);
            result.then(
                function (response) {
                    $scope.cryptoHistoryOption.data = response.data;
                });
            if (format == 'csv') {
                $timeout(function () {
                    $scope.gridApiCrypto.exporter.csvExport('all', 'all');
                    $scope.getcryptoHistoryTable();
                }, 100);
            } else if (format == 'pdf') {
                $timeout(function () {
                    $scope.gridApiCrypto.exporter.pdfExport('all', 'all');
                    $scope.getcryptoHistoryTable();
                }, 100);
            }
        };

        var cryptoHistoryFilter = {};
        $scope.cryptoHistory = function () {
            var data = [];
            var NextPage = (($scope.paginationcrypto.pageNumber - 1) * $scope.paginationcrypto.pageSize);
            var NextPageSize = $scope.paginationcrypto.pageSize;
            var object1 = { 'limit': NextPageSize, 'offset': NextPage }
            // var object2 = searchParams;
            //var object3 = { 'currency_code': vm.currencySelected.currency_code };
            var data = angular.merge({}, object1, cryptoHistoryFilter);
            var result = dashboardService.walletHistoryCrypto(data);
            result.then(
                function (response) {
                    $scope.paginationcrypto.totalItems = response.totalcount;
                    $scope.cryptoHistoryOption.data = response.data;
                    // console.log('crypto.............');
                    // console.log(response.data);
                },
                function (error) {
                    console.log("Error: " + error);
                });
        }

        //Pagination
        $scope.paginationinr = {
            paginationPageSizes: [10, 25, 50, 100],
            ddlpageSize: 10,
            pageNumber: 1,
            pageSize: 10,
            totalItems: 0,
            filter_value: '',

            getTotalPages: function () {
                return Math.ceil(this.totalItems / this.pageSize);
            },
            pageSizeChange: function () {
                if (this.ddlpageSize == "All")
                    this.pageSize = $scope.paginationinr.totalItems;
                else
                    this.pageSize = this.ddlpageSize

                this.pageNumber = 1
                $scope.getcryptoHistoryTable();
            },
            firstPage: function () {
                if (this.pageNumber > 1) {
                    this.pageNumber = 1
                    $scope.inrHistory();
                } else {
                    this.pageNumber = 1
                    $scope.inrHistory();
                }
            },
            nextPage: function () {
                if (this.pageNumber < this.getTotalPages()) {
                    this.pageNumber++;
                    $scope.inrHistory();
                } else {
                    this.pageNumber = 1
                    $scope.inrHistory();
                }
            },
            previousPage: function () {
                if (this.pageNumber > 1) {
                    this.pageNumber--;
                    $scope.inrHistory();
                } else {
                    this.pageNumber = 1
                    $scope.inrHistory();
                }
            },
            currentPage: function () {
                if (this.pageNumber > 1) {
                    $scope.inrHistory();
                } else {
                    $scope.inrHistory();
                }
            },
            lastPage: function () {
                if (this.pageNumber >= 1) {
                    this.pageNumber = this.getTotalPages();
                    $scope.inrHistory();
                } else {
                    this.pageNumber = 1
                    $scope.inrHistory();
                }
            }
        };

        $scope.inrHistoryOption = [];
        $scope.getinrHistoryTable = function () {
            $scope.inrHistoryOption = {
                useExternalPaginationinr: true,
                useExternalSorting: true,
                enableFiltering: true,
                enableSorting: true,
                enableRowSelection: false,
                enableSelectAll: false,
                enableColumnMenus: false,
                exporterCsvFilename: 'FiatHistory.csv',
                exporterPdfDefaultStyle: { fontSize: 9 },
                exporterPdfTableStyle: { margin: [0, 0, 0, 0] },
                exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'black' },
                exporterPdfOrientation: 'landscape',
                exporterPdfPageSize: 'LETTER',
                exporterPdfMaxGridWidth: 600,
                onRegisterApi: function (gridApiInr) {
                    $scope.gridApiInr = gridApiInr;
                    $scope.gridApiInr.grid.clearAllFilters = function () {
                        this.columns.forEach(function (column) {
                            column.filters.forEach(function (filter) {
                                filter.term = undefined;
                            });
                        });
                        inrHistoryFilter = {};
                        $scope.getinrHistoryTable(); // your own custom callback
                    };

                    $scope.gridApiInr.core.on.filterChanged($scope, function () {
                        $scope.paginationinr.pageNumber = '1';
                        var grid = this.grid;
                        angular.forEach(grid.columns, function (value, key) {
                            if (!value.filters[0].term && value.filters[0].term !== 0) {
                                delete inrHistoryFilter[value.colDef.field];
                            } else {
                                inrHistoryFilter[value.colDef.field] = value.filters[0].term;
                            }
                        });
                        $scope.inrHistory();
                    });

                    $scope.gridApiInr.core.on.sortChanged($scope, function (val) {
                        var grid = this.grid;
                        angular.forEach(grid.columns, function (value, key) {
                            if (value.sort.direction) {
                                inrHistoryFilter['order_column'] = value.field;
                                inrHistoryFilter['order_direction'] = value.sort.direction;

                                $scope.orderCoulmn = value.field;
                                $scope.orderDirection = value.sort.direction;
                            }
                        });
                        $scope.inrHistory();

                    });
                },
                columnDefs: [{
                    field: 'created_at', order_column: 'tm.created_at', name: 'Date',
                    type: 'date', cellFilter: 'date:"' + dateFormat + '"', width: '15%',
                    enableFiltering: true,
                    filterHeaderTemplate: 'ui-grid/ui-grid-date-filter',
                    filters: [
                        {
                            condition: function (term, value, row, column) {
                                if (!term) return true;
                                var valueDate = new Date(value);
                                return valueDate >= term;
                            }
                        }]
                    , headerCellClass: 'text-left', cellClass: 'text-right'
                },
                {
                    field: 'currency_code',
                    name: 'Currency Code',
                    width: '15%',
                    enableFiltering: false,
                    enableSorting: false,
                    cellTooltip: function (row, col) {
                        return 'Currency: ' + row.entity.currency_code;
                    }
                },
                {
                    field: 'amount',
                    name: 'Amount',
                    width: '10%',
                    cellFilter: 'number :2',
                    enableFiltering: false,
                    cellTooltip: function (row, col) {
                        return 'Amount: ' + row.entity.amount;
                    },
                    cellClass: 'text-right',
                    headerCellClass: 'text-right',
                    exporterPdfAlign: 'right'
                },
                {
                    field: 'platform_value',
                    name: 'Fee',
                    width: '15%',
                    enableFiltering: false,
                    cellFilter: 'number :2',
                    cellTooltip: function (row, col) {
                        return 'Fee: ' + row.entity.platform_value;
                    },
                    cellClass: 'text-right',
                    headerCellClass: 'text-right',
                    exporterPdfAlign: 'right'
                },
                {
                    field: 'type',
                    name: 'Type',
                    width: '12%',
                    enableSorting: false,
                    filter: {
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: WITHDRAW_DEPOSIT
                    },
                    cellTooltip: function (row, col) {
                        return 'type: ' + row.entity.type;
                    }
                },
                {
                    field: 'status',
                    name: 'Status',
                    width: '15%',
                    enableSorting: false,
                    cellTooltip: function (row, col) {
                        return 'Status: ' + row.entity.status;
                    },
                    filter: {
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: WITHDRAW_DEPOSIT_STATUS_INR
                    },
                    cellFilter: 'mapWithdrawStatus',
                    cellTemplate: '<span ng-if="row.entity.status == 1"  style="font-size:14px; margin-left:1rem;">{{row.entity.status | mapWithdrawStatus}}</span>' +
                        '<span ng-if="row.entity.status == 2"  style="font-size:14px; margin-left:1rem;">{{row.entity.status | mapWithdrawStatus}}</span>' +
                        '<span ng-if="row.entity.status == 0"  style="font-size:14px; margin-left:1rem;">{{row.entity.status | mapWithdrawStatus}}</span>'
                },
                {
                    field: 'comment',
                    name: 'Comment',
                    width: '20%',
                    enableSorting: false,
                    enableFiltering: false,
                    cellTooltip: function (row, col) {
                        return 'Comment: ' + row.entity.comment;
                    }
                },
                ], exporterFieldCallback: function (grid, row, col, input) {
                    if (col.name == 'Status') {
                        //return input = $filter('mapWithdrawStatus');
                        var $return = '';
                        switch (input) {
                            case 0:
                                $return = 'Pending';
                                break; //Pending for Approval
                            case 1:
                                $return = 'Approved';
                                break; //Pending //Approved
                            case 2:
                                $return = 'Not Approved';
                                break; //Pending //Not Approved

                            default:

                        }
                        return $return;
                    }
                    if (col.name == 'Date') {
                        //return $filter('dateFilter')(row.entity.created_at, $rootScope.displayDate);
                        return moment(new Date(row.entity.created_at).getTime()).format("YYYY-MM-DD HH:mm:ss");
                    }
                    return input;
                },
            };

            $scope.inrHistory();
        }


        $scope.exportInr = function (format) {

            var limit = $scope.paginationinr.totalItems;
            var data = { 'limit': limit, 'offset': 0 }
            var result = dashboardService.walletHistoryInr(data);
            result.then(

                function (response) {

                    $scope.inrHistoryOption.data = response.data;
                });
            if (format == 'csv') {
                $timeout(function () {
                    $scope.gridApiInr.exporter.csvExport('all', 'all');
                    $scope.getinrHistoryTable();
                }, 100);
            } else if (format == 'pdf') {
                $timeout(function () {
                    $scope.gridApiInr.exporter.pdfExport('all', 'all');
                    $scope.getinrHistoryTable();
                }, 100);
            }
        };

        var inrHistoryFilter = {}
        $scope.inrHistory = function () {
            var data = [];
            var NextPage = (($scope.paginationinr.pageNumber - 1) * $scope.paginationinr.pageSize);
            var NextPageSize = $scope.paginationinr.pageSize;
            var object1 = { 'limit': NextPageSize, 'offset': NextPage }
            var object2 = inrHistoryFilter;
            //var object3 = { 'currency_code': vm.currencySelected.currency_code };
            var data = angular.merge({}, object1, object2);
            var result = dashboardService.walletHistoryInr(data);
            result.then(
                function (response) {
                    //console.log("qweqwe",response.data)
                    $scope.paginationinr.totalItems = response.totalcount;
                    $scope.inrHistoryOption.data = response.data;
                    // console.log('inr.............');
                    // console.log(response.data);
                },
                function (error) {
                    console.log("Error: " + error);
                }).then(() => $('select.ui-grid-filter-select').each(function (i, j) {
                    $(this).find('option:first').text('Show All');
                }));
        }

        $scope.getinrHistoryTable();
        $scope.getcryptoHistoryTable();

        // deposit money code
        $scope.openDepositModal = function (datacurrency) {

            $uibModal.open({
                animation: false,
                templateUrl: 'app/modules/dashboard/views/wallet/depositMoneyModal.html',
                size: 'lg',
                backdrop: 'static',
                controller: function ($scope, $uibModalInstance, tradeService, $stateParams) {
                 
                    $scope.select_ccy = datacurrency.currency_code;
                    $scope.dateOptions = {
                        maxDate: new Date(),
                        //  minDate: new Date(),
                        startingDay: 1,
                        showWeeks: false
                    }

                    $scope.depositdate = {
                        opened: false
                    };

                    $scope.depositMoney = function () {

                        if ($scope.depositForm.$valid) {
                            var date = $scope.deposit.date.getDate();
                            var month = $scope.deposit.date.getMonth(); //Be careful! January is 0 not 1
                            var year = $scope.deposit.date.getFullYear();

                            var dateString = year + "-" + (month + 1) + "-" + date;


                            var data = {
                                "deposit_date": dateString,
                                "amount": $scope.deposit.amount,
                                "mode": $scope.deposit.mode,
                                "currency_code": datacurrency.currency_code,
                                "currency_type": datacurrency.type,
                                "device_ipAddress": sessionStorage.getItem('myIP'),
                                "device_os": sessionStorage.getItem('myOS'),
                                "device_name": sessionStorage.getItem('myDevice'),
                                "device_browser": sessionStorage.getItem('myBrowser'),
                                "reference_no": $scope.deposit.reference_no
                            }
                            console.log(data);

                            dashboardService.depositMoney(data).then(function (response) {
                                if (response.success && $scope.depositFile) {
                                    dashboardService.uploadDepositReceipt($scope.depositFile, data.reference_no).then(function (response) {
                                        if (response.data.success) {
                                            toastr.success('Deposit details saved successfully');
                                            $uibModalInstance.dismiss('cancel');
                                        } else {
                                            toastr.error('Error while uploading document');
                                        }
                                    }, function (err) {
                                        toastr.error('Error while uploading document');
                                    });
                                } else {
                                    toastr.error(response.message);
                                }
                            }, function (err) {
                                toastr.error(response.message);
                            });

                        }
                    }

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    }
                } // controller
            }); // modal

        } // func-end


        vm.depositeStatusvalue = 1;

        vm.clickCurrency = function (data, event) {

            var activeStatus = angular.element(event.target).hasClass("active");

            if (activeStatus == true) {
                return;
            } else {

                resetParams();

                if (data.Cryptotype == 1) {
                    vm.qrcode = undefined;
                    vm.getCryptoAddress = undefined;

                    dashboardService.getQRCodeByCurrency({ 'id': data.currency_code }).then(function (response) {
                        if (response.success) {
                            vm.qrcode = '<img style="height:13rem;" alt="QR Image Loading..." src="' + response.data + '"/>';
                            vm.getCryptoAddress = response.address;
                        } else {
                            vm.qrcode = '<img alt="QR Image Not Available."/>';
                            vm.getCryptoAddress = "Address not available";
                        }
                    }, function (err) {
                        vm.qrcode = '<img alt="QR Image Not Available."/>';
                        vm.getCryptoAddress = "Address not available";
                    });

                }
            }


            // if (vm.depositeStatusvalue != 1) {
            //     return vm.depositeStatusvalue = vm.depositeStatusvalue == 1 ? 0 : 1;;

            // }

            // //console.log(vm.depositeStatusvalue);
            // vm.depositeStatusvalue = vm.depositeStatusvalue == 1 ? 0 : 1;
            // vm.currencySelected = data;
            // resetParams();


            // tradeService.getTradeLimitByCurrencyCode({ 'id': vm.currencySelected.currency_code }).then(function (response) {
            //     for (var i = 0; i < response.data.length; i++) {
            //         if (response.data[i].operation == "Deposit") {
            //             vm.minimumDepositAmt = response.data[i].min_amount;
            //             vm.maxDepositAmt = response.data[i].max_amount;
            //             break;
            //         }
            //     }

            // });


            // dashboardService.getWalletInfoByCurrency({ 'id': vm.currencySelected.currency_code }).then(function (response) {
            //     if (response.success)
            //         vm.depositWalletBalance = response.walletinfo.total_amount;
            // });

            // if (vm.currencySelected.Cryptotype == 1) {
            //     vm.qrcode = undefined;
            //     vm.getCryptoAddress = undefined;
            //     // if (data.currency_code == 'ETH') {
            //     //     dashboardService.getEthAddress().then(function(response) {
            //     //         if (response.success) {
            //     //             vm.qrcode = '<img style="height:13rem;" alt="QR Image Loading..." src="' + response.data + '"/>';
            //     //             vm.getCryptoAddress = response.address;
            //     //         } else {
            //     //             vm.qrcode = '<img alt="QR Image Not Available."/>';
            //     //         }
            //     //     }, function(err) {
            //     //         vm.qrcode = '<img alt="QR Image Not Available."/>';
            //     //     });
            //     // } else
            //     if (data.currency_code == 'BTC') {

            //         dashboardService.getBtcAddress().then(function (response) {
            //             if (response.success) {
            //                 vm.qrcode = '<img style="height:13rem;" alt="QR Image Loading..." src="' + response.data + '"/>';
            //                 vm.getCryptoAddress = response.address;
            //             } else {

            //                 vm.qrcode = "QR Image Not Available."
            //                 vm.getCryptoAddress = "Address not available";
            //             }
            //         }, function (err) {
            //             vm.qrcode = "QR Image Not Available."
            //             vm.getCryptoAddress = "Address not available";
            //         });
            //     }
            //     else if (data.currency_code == 'LTC') {


            //         dashboardService.getLtcAddress().then(function (response) {
            //             if (response.success) {
            //                 vm.qrcode = '<img style="height:13rem;" alt="QR Image Loading..." src="' + response.data + '"/>';
            //                 vm.getCryptoAddress = response.address;
            //             } else {
            //                 vm.qrcode = "QR Image Not Available."
            //                 vm.getCryptoAddress = "Address not available";
            //             }
            //         }, function (err) {
            //             vm.qrcode = "QR Image Not Available."
            //             vm.getCryptoAddress = "Address not available";
            //         });
            //     }
            //     else if (data.currency_code == 'DOGE') {

            //         dashboardService.getDogeAddress().then(function (response) {
            //             if (response.success) {
            //                 vm.qrcode = '<img style="height:13rem;" alt="QR Image Loading..." src="' + response.data + '"/>';
            //                 vm.getCryptoAddress = response.address;
            //             } else {
            //                 vm.qrcode = "QR Image Not Available."
            //                 vm.getCryptoAddress = "Address not available";
            //             }
            //         }, function (err) {
            //             vm.qrcode = "QR Image Not Available."
            //             vm.getCryptoAddress = "Address not available";
            //         });
            //     }
            //     else if (data.currency_code == 'ETH') {

            //         dashboardService.getEthAddress().then(function (response) {
            //             console.log(response)
            //             if (response.success) {
            //                 vm.qrcode = '<img style="height:13rem;" alt="QR Image Loading..." src="' + response.data + '"/>';
            //                 vm.getCryptoAddress = response.address;
            //             } else {

            //                 vm.qrcode = "QR Image Not Available."
            //             }
            //         }, function (err) {
            //             vm.qrcode = "QR Image Not Available."
            //         });
            //     }
            // }
        }

        dashboardService.inActiveBalance(vm.getCurrencyTo).then(function (response) {
            // console.log("balance")
            // console.log(response.result[0].tp)
            if (response.success) {
                //  response.data.sort(sortItems);
                vm.inActive_bal = response.result[0].tp;
            } else {
                toastr.error(response.message);
                //error msg toast
            }
        });

    }
]);
