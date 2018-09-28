dashboard.controller("DepositController", ['$rootScope', '$scope', '$state', 'toastr','dashboardService', 'AuthService', 'tradeService', '$window', '$timeout', '$stateParams', 'appSettings',
    function($rootScope, $scope, $state, toastr,dashboardService, AuthService, tradeService, $window, $timeout, $stateParams, appSettings) {

        var vm = this;

        vm.addNewCard = function() {
            $state.go('dashboard.addNewCard');
        }

        var sortItems = function(a, b) {
            var nameA = a.currency_name.toUpperCase();
            var nameB = b.currency_name.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            // names must be equal
            return 0;
        }

        dashboardService.getCurrencyList().then(function(response) {
            response.result.sort(sortItems);
            vm.selectCurrency = response.result;
            /* vm.currencySelected = vm.selectCurrency[0];*/
            var is_currency_available = 0;
            if ($stateParams.currency_to_deposit) {
                for (var i = 0; i < vm.selectCurrency.length; i++) {
                    if (vm.selectCurrency[i].currency_code == $stateParams.currency_to_deposit) {
                        vm.currencySelected = vm.selectCurrency[i];
                        is_currency_available = 1;
                        break;
                    }
                }
                // set condition when no currency matches. 
                if (!is_currency_available) {
                    vm.currencySelected = vm.selectCurrency[0];
                }
            } else {
                vm.currencySelected = vm.selectCurrency[0];
            }
            vm.clickCurrency(vm.currencySelected);

        }, function(err) {
            toastr.error('Something went wrong. Please try again later.');
            // ngToast.create({
            // className: 'danger',
            // content: 'Something went wrong. Please try again later.'
            // });
        });

        vm.getCurrencyName = function(type) {
            if (type == '1') {
                type = "Crypto"
            } else type = "Fiat"
            return type;
        }

        vm.showMinDepositErr = false;
        vm.showCommissionAmt = false;
        vm.showMaxDepositErr = false;
        vm.showZeroAmtErr = false;

        var resetParams = function() {
            vm.amount = '';
            vm.totalAmount = undefined;
            vm.showMinDepositErr = false;
            vm.showCommissionAmt = false;
            vm.showMaxDepositErr = false;
            vm.showZeroAmtErr = false;
            vm.depositAmt = undefined;
            vm.commissionFee = undefined;
        }

        vm.refreshTxnHistory = function() {
            $scope.drawGrid();
        }

        vm.refreshCryptoTxnHistory = function() {
            if (vm.currencySelected.currency_code == 'BTC') {
                dashboardService.btcDepositHistory().then(function(response) {
                    if (response.success) {
                        vm.btcGridOptions.data = response.data;

                    }
                });
            } else if (vm.currencySelected.currency_code == 'ETH') {
                dashboardService.ethDepositHistory().then(function(response) {
                    if (response.success) {
                        vm.ethGridOptions.data = response.data;
                    }
                });
            }
        }

        vm.changeAmount = function() {

            if (vm.depositForm.amount.$invalid) {
                vm.totalAmount = 0.00;
                vm.showMinDepositErr = false;
                vm.showZeroAmtErr = false;
                vm.showMaxDepositErr = false;
                vm.depositAmt = 0.00;
                vm.commissionFee = undefined;
            } else if (vm.amount == 0 && vm.minimumDepositAmt == 0) {
                vm.showZeroAmtErr = true;
                vm.showMinDepositErr = false;
                vm.depositForm.$valid = false;
                vm.showMaxDepositErr = false;
            } else if (vm.amount < vm.minimumDepositAmt) {
                vm.showMinDepositErr = true;
                vm.depositForm.$valid = false;
                vm.showMaxDepositErr = false;
                vm.showZeroAmtErr = false;
            } else if (vm.amount > vm.maxDepositAmt) {
                vm.showMinDepositErr = false;
                vm.depositForm.$valid = false;
                vm.showMaxDepositErr = true;
                vm.showZeroAmtErr = false;
            } else {
                vm.showMinDepositErr = false;
                vm.depositForm.$valid = true;
                vm.showMaxDepositErr = false;
                vm.showZeroAmtErr = false;

                var calcAmount = (vm.amount * (vm.minCommissionPercentage / 100));
                vm.depositAmt = vm.amount;
                if (calcAmount < vm.minCommissionAmount) {
                    vm.showCommissionAmt = true;
                    vm.commissionFee = vm.minCommissionAmount;
                    // feeValue = vm.minCommissionAmount;
                    // feePercent = 0;
                    vm.totalAmount = (vm.commissionFee * 1) + (vm.amount * 1);
                } else {
                    vm.showCommissionAmt = false;
                    vm.commissionFee = calcAmount;
                    // feeValue = calcAmount;
                    // feePercent = vm.minCommissionPercentage;
                    vm.totalAmount = (vm.commissionFee * 1) + (vm.amount * 1);
                }
            }
        }

        vm.clickCurrency = function(data) {
            
            vm.currencySelected = data;
            resetParams();
            tradeService.getCommission({ 'id': vm.currencySelected.currency_code }).then(function(response) {
                for (var i = 0; i < response.data.length; i++) {
                    if (response.data[i].operation == "Deposit") {
                        vm.minCommissionPercentage = response.data[i].min_percentage;
                        vm.minCommissionAmount = response.data[i].min_amount;
                        break;
                    }
                }
            });

            tradeService.getTradeLimitByCurrencyCode({ 'id': vm.currencySelected.currency_code }).then(function(response) {
                for (var i = 0; i < response.data.length; i++) {
                    if (response.data[i].operation == "Deposit") {
                        vm.minimumDepositAmt = response.data[i].min_amount;
                        vm.maxDepositAmt = response.data[i].max_amount;
                        break;
                    }
                }

            });

            //Default Load
            if (vm.currencySelected.type == 0) $scope.getGridData();
            vm.refreshCryptoTxnHistory();

            dashboardService.getWalletInfoByCurrency({ 'id': vm.currencySelected.currency_code }).then(function(response) {
                if (response.success)
                    vm.depositWalletBalance = response.walletinfo.total_amount;
            });

            if (vm.currencySelected.type == 1) {
                vm.qrcode = undefined;
                vm.getCryptoAddress = undefined;
                if (data.currency_code == 'ETH') {
                    dashboardService.getEthAddress().then(function(response) {
                        if (response.success) {
                            vm.qrcode = '<img style="height:13rem;" alt="QR Image Loading..." src="' + response.data + '"/>';
                            vm.getCryptoAddress = response.address;
                        } else {
                            vm.qrcode = '<img alt="QR Image Not Available."/>';
                        }
                    }, function(err) {
                        vm.qrcode = '<img alt="QR Image Not Available."/>';
                    });
                } else if (data.currency_code == 'BTC') {
                    dashboardService.getBtcAddress().then(function(response) {
                        if (response.success) {
                            vm.qrcode = '<img style="height:13rem;" alt="QR Image Loading..." src="' + response.data + '"/>';
                            vm.getCryptoAddress = response.address;
                        } else {
                            vm.qrcode = '<img alt="QR Image Not Available."/>';
                            vm.getCryptoAddress = "Address not available";
                        }
                    }, function(err) {
                        vm.qrcode = '<img alt="QR Image Not Available."/>';
                        vm.getCryptoAddress = "Address not available";
                    });
                }
            }
        }


        vm.depositMoney = function(data) {
    
            if(vm.depositForm.$valid) {
                var commissionPercentage = 0;
                var commissionAmount = 0;
                tradeService.getCommission({ 'id': vm.currencySelected.currency_code }).then(function(response) {
                    for (var i = 0; i < response.data.length; i++) {
                        if (response.data[i].operation == "Deposit") {
                            commissionPercentage = response.data[i].min_percentage;
                            commissionAmount = response.data[i].min_amount;

                            var totalAmount = 0;
                            var calcAmount = (vm.amount * (commissionPercentage / 100));
                            vm.depositAmt = vm.amount;
                            if (calcAmount < commissionAmount) {
                                // vm.showCommissionAmt = true;
                                // feeValue = commissionAmount;
                                // feePercent = 0;
                                totalAmount = (commissionAmount * 1) + (vm.amount * 1);
                                vm.minCommissionAmount = commissionAmount;
                                vm.commissionFee = commissionAmount;
                                vm.totalAmount = totalAmount;
                            } else {
                                vm.showCommissionAmt = false;
                                // feeValue = calcAmount;
                                // feePercent = commissionPercentage;
                                totalAmount = (calcAmount * 1) + (vm.amount * 1);
                                vm.commissionFee = calcAmount;
                                vm.minCommissionPercentage = commissionPercentage;
                                vm.totalAmount = totalAmount;
                            }
                            var data = {
                                "amount": vm.amount,
                                "currency_code": vm.currencySelected.currency_code,
                                "device_ipAddress": sessionStorage.getItem('myIP'),
                                "device_os": sessionStorage.getItem('myOS'),
                                "device_name": sessionStorage.getItem('myDevice'),
                                "device_browser": sessionStorage.getItem('myBrowser'),
                                
                            }

                            dashboardService.depositMoney(data).then(function(response) {
                                if (response.success) {
                                    toastr.success(response.message);
                                    //ngToast.create({
                                    //className: 'success',
                                    //content: response.message
                                    //});
                                    resetParams();
                                    vm.depositForm.$submitted = false;
                                    $window.scroll(0, 0);
                                    dashboardService.getWalletInfoByCurrency({ 'id': vm.currencySelected.currency_code }).then(function(response) {
                                        if (response.success)
                                            vm.depositWalletBalance = response.walletinfo.total_amount;
                                    });
                                    $scope.drawGrid();
                                } else {
                                    toastr.error(response.message);
                                    //ngToast.create({
                                    //className: 'danger',
                                    //content: response.message
                                    // });
                                }
                            }, function(err) {
                                toastr.error('Something went wrong. Please try again later.');
                                //ngToast.create({
                                //className: 'danger',
                                //content: 'Something went wrong. Please try again later.'
                                //});
                            });

                            break;
                        } // if 
                    }
                });
            } //if
        } // func end

        // grid code - server side pagination
        var searchParams = [];
        $scope.gridOptions = [];

        $scope.orderCoulmn = '';
        $scope.orderDirection = '';

        //Pagination
        $scope.pagination = {
            paginationPageSizes: [10, 25, 50, 100],
            ddlpageSize: 10,
            pageNumber: 1,
            pageSize: 10,
            totalItems: 0,
            filter_value: '',

            getTotalPages: function() {
                return Math.ceil(this.totalItems / this.pageSize);
            },
            pageSizeChange: function() {
                if (this.ddlpageSize == "All")
                    this.pageSize = $scope.pagination.totalItems;
                else
                    this.pageSize = this.ddlpageSize

                this.pageNumber = 1
                $scope.getGridData();
            },
            firstPage: function() {
                if (this.pageNumber > 1) {
                    this.pageNumber = 1
                    $scope.drawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawGrid();
                }
            },
            nextPage: function() {
                if (this.pageNumber < this.getTotalPages()) {
                    this.pageNumber++;
                    $scope.drawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawGrid();
                }
            },
            previousPage: function() {
                if (this.pageNumber > 1) {
                    this.pageNumber--;
                    $scope.drawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawGrid();
                }
            },
            currentPage: function() {
                if (this.pageNumber > 1) {
                    $scope.drawGrid();
                } else {
                    $scope.drawGrid();
                }
            },
            lastPage: function() {
                if (this.pageNumber >= 1) {
                    this.pageNumber = this.getTotalPages();
                    $scope.drawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawGrid();
                }
            }
        };

        //ui-Grid Call
        $scope.getGridData = function() {
            $scope.gridOptions = {
                //  useExternalPagination: true,
                //  useExternalSorting: true,
                enableFiltering: false,
                enableSorting: false,
                enableRowSelection: false,
                enableSelectAll: false,
                enableColumnMenus: false,
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                    $scope.gridApi.grid.clearAllFilters = function() {
                        this.columns.forEach(function(column) {
                            column.filters.forEach(function(filter) {
                                filter.term = undefined;
                            });
                        });
                        searchParams = undefined;
                        $scope.getGridData(); // your own custom callback
                    };

                    $scope.gridApi.core.on.sortChanged($scope, function(val) {
                        var grid = this.grid;
                        angular.forEach(grid.columns, function(value, key) {
                            if (value.sort.direction) {
                                searchParams['order_column'] = value.field;
                                searchParams['order_direction'] = value.sort.direction;

                                $scope.orderCoulmn = value.field;
                                $scope.orderDirection = value.sort.direction;
                            }
                        });
                        $scope.drawGrid();

                    });
                },
                columnDefs: [{
                        field: 'created_at',
                        name: 'Date',
                        width: '*',
                        cellFilter: 'dateFilter :  $root.displayDate',
                        filterCellFiltered: true,
                        cellTooltip: true,
                       // sort: { direction: 'desc', priority: 0 }
                    },
                    {
                        field: 'currency_code',
                        name: 'Currency',
                        width: '*',
                        cellTooltip: function(row, col) {
                            return 'Currency: ' + row.entity.currency_code;
                        }
                    },
                    {
                        field: 'amount',
                        name: 'Amount',
                        width: '*',
                        cellTooltip: function(row, col) {
                            return 'Amount: ' + row.entity.amount;
                        }
                    },
                    {
                        field: 'platform_value',
                        name: 'Fee',
                        width: '*',
                        cellTooltip: function(row, col) {
                            return 'Fee: ' + row.entity.platform_value;
                        }
                    },
                    {
                        field: 'status',
                        name: 'Status',
                        width: '*',
                        cellTooltip: function(row, col) {
                            return 'Status: ' + row.entity.status;
                        },
                        cellFilter: 'mapDepositStatus',
                        cellTemplate: '<span ng-if="row.entity.status == 1" class="badge badge-success" style="font-size:14px; margin-left:1rem;">{{row.entity.status | mapDepositStatus}}</span>' +
                            '<span ng-if="row.entity.status !== 1" class="badge badge-danger" style="font-size:14px; margin-left:1rem;">{{row.entity.status | mapDepositStatus}}</span>'
                    },
                    {
                        field: 'comment',
                        name: 'Comment',
                        width: '*',
                        cellTooltip: function(row, col) {
                            return 'Comment: ' + row.entity.comment;
                        }
                    },
                ]
            };

            $scope.drawGrid();
        }

        $scope.drawGrid = function() {
            var data = [];
            var NextPage = (($scope.pagination.pageNumber - 1) * $scope.pagination.pageSize);
            var NextPageSize = $scope.pagination.pageSize;
            var object1 = { 'limit': NextPageSize, 'offset': NextPage }
            var object2 = searchParams;
            var object3 = { 'currency_code': vm.currencySelected.currency_code };

            var data = angular.merge({}, object1, object2, object3);
            var result = dashboardService.fiatDepositHistory(data);

            result.then(
                function(response) {
                    $scope.pagination.totalItems = response.totalcount;
                    $scope.gridOptions.data = response.data;
                },
                function(error) {
                    console.log("Error: " + error);
                });
        }

        $scope.eth_url = appSettings.ethTxnHistory;
        vm.ethGridOptions = {
            enableFiltering: false,
            enableSorting: false,
            enableRowSelection: false,
            enableSelectAll: false,
            enableColumnMenus: false,
            enableColumnResizing: true,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 10,
            columnDefs: [{
                    field: 'timeStamp',
                    name: 'Date',
                    width: '25%',
                    cellFilter: 'moment1: $root.displayDate',
                    filterCellFiltered: true,
                    cellTooltip: true,
                    sort: { direction: 'desc', priority: 0 }
                },
                {
                    field: 'hash',
                    name: 'Transaction Id',
                    width: '40%',
                    cellTooltip: function(row, col) {
                        return 'Transaction Id: ' + row.entity.hash;
                    },
                    cellTemplate: '<span><a ng-href={{grid.appScope.eth_url+row.entity.hash}} target="_blank" rel="noopener" class="link" style="padding-left:1rem;">{{row.entity.hash}}</span>'
                },
                {
                    field: 'value',
                    name: 'Amount (in Wei)',
                    width: '*',
                    cellTooltip: function(row, col) {
                        return 'Amount: ' + row.entity.value;
                    },
                }
            ],
            data: []
        };

        vm.btcGridOptions = {
            enableFiltering: false,
            enableSorting: false,
            enableRowSelection: false,
            enableSelectAll: false,
            enableColumnMenus: false,
            enableColumnResizing: true,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 10,
            columnDefs: [{
                    field: 'time',
                    name: 'Date',
                    width: '25%',
                    cellFilter: 'moment1: $root.displayDate',
                    filterCellFiltered: true,
                    cellTooltip: true,
                    sort: { direction: 'desc', priority: 0 }

                },
                {
                    field: 'txid',
                    name: 'Transaction Id',
                    width: '*',
                    cellTooltip: function(row, col) {
                        return 'Transaction Id: ' + row.entity.txid;
                    },
                },
                {
                    field: 'amount',
                    name: 'Amount',
                    width: '*',
                    cellTooltip: function(row, col) {
                        return 'Amount: ' + row.entity.amount;
                    },
                }
            ],
            data: []
        };

    }
]);