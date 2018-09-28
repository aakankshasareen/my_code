app.controller('customerReportDetailsCtrl', ['$rootScope', '$scope', '$window', 'adminService', '$state', 'toastr', 'paginationFactory', '$stateParams',
    'uiGridConstants', 'dashboardService', 'TRANSACTION_TYPE', 'STATUS_TYPE', 'STATUS', '$filter', 'KYC_STATUS', '$timeout',
    function($rootScope, $scope,
        $window, adminService, $state, toastr, paginationFactory, $stateParams, uiGridConstants, dashboardService,
        TRANSACTION_TYPE, STATUS_TYPE, STATUS, $filter, KYC_STATUS, $timeout) {

        var vm = this;
        vm.pageHeading = "Add";
        $scope.gridOptions = [];
        vm.Status = STATUS;
        var searchParams = [];
        $scope.orderCoulmn = '';
        $scope.orderDirection = '';
        //vm.customer = [];
        vm.pair = []
        vm.showToDateError = false;
        vm.showFromDateError = false;
        vm.showDateError = false;
        var id = $stateParams.id;
        adminService.getUserInfoData({ 'id': id }).then(function(response) {
            if (response.success) {
                vm.profile = response.data;

                $rootScope.showSpinner = false;
            }
        }, function(err) {
            toastr.error('Something went wrong. Please try again later.');

        });
        //Pagination for deposite
        //paginationFactory.showPagination($scope);
        $scope.paginationdeposite = {
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
                    this.pageSize = $scope.paginationdeposite.totalItems;
                else
                    this.pageSize = this.ddlpageSize

                this.pageNumber = 1
                $scope.getDepositeGridData();
            },
            firstPage: function() {
                if (this.pageNumber > 1) {
                    this.pageNumber = 1
                    $scope.depositeDrawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.depositeDrawGrid();
                }
            },
            nextPage: function() {
                if (this.pageNumber < this.getTotalPages()) {
                    this.pageNumber++;
                    $scope.depositeDrawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.depositeDrawGrid();
                }
            },
            previousPage: function() {
                if (this.pageNumber > 1) {
                    this.pageNumber--;
                    $scope.depositeDrawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.depositeDrawGrid();
                }
            },
            currentPage: function() {
                if (this.pageNumber > 1) {
                    $scope.depositeDrawGrid();
                } else {
                    $scope.depositeDrawGrid();
                }
            },
            lastPage: function() {
                if (this.pageNumber >= 1) {
                    this.pageNumber = this.getTotalPages();
                    $scope.depositeDrawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.depositeDrawGrid();
                }
            }
        }

        $scope.getDepositeGridData = function() {
            $scope.depositeGridOptions = {
                useExternalPagination: true,
                useExternalSorting: true,
                enableFiltering: true,
                enableSorting: true,
                enableRowSelection: false,
                enableSelectAll: false,
                enableGridMenu: true,
                enableColumnMenus: false,
                enableColumnResizing: true,
                exporterCsvFilename: 'CustomerDepositeData.csv',
                exporterMenuPdf: false,
                exporterMenuCsv: false,
                exporterPdfOrientation: 'landscape',
                exporterPdfMaxGridWidth: 600,
                onRegisterApi: function(depositeGridApi) {
                    $scope.depositeGridApi = depositeGridApi;
                    $scope.depositeGridApi.grid.clearAllFilters = function() {
                        this.columns.forEach(function(column) {
                            column.filters.forEach(function(filter) {
                                filter.term = undefined;
                            });
                        });
                        searchParams = undefined;
                        $scope.getDepositeGridData(); // your own custom callback
                    };
                    $scope.depositeGridApi.core.on.filterChanged($scope, function() {
                        $scope.paginationdeposite.pageNumber = '1';
                        var grid = this.grid;
                        angular.forEach(grid.columns, function(value, key) {
                            searchParams[value.colDef.field] = value.filters[0].term;
                        });
                        $scope.depositeDrawGrid();
                    });
                    $scope.depositeGridApi.core.on.sortChanged($scope, function(val) {
                        var grid = this.grid;
                        angular.forEach(grid.columns, function(value, key) {
                            if (value.sort.direction) {
                                searchParams['order_column'] = value.field;
                                searchParams['order_direction'] = value.sort.direction;
                                $scope.orderCoulmn = value.field;
                                $scope.orderDirection = value.sort.direction;
                            }
                        });
                        $scope.depositeDrawGrid();
                    });
                },
                columnDefs: [
                    { field: 'serial_number', name: 'S.No.', headerCellClass: 'text-center', enableSorting: false, enableFiltering: false, width: '60', enableCellEdit: false, headerCellClass: 'text-center', cellClass: 'text-center' },
                    {
                        field: 'currency_code',
                        headerCellClass: 'text-left',
                        width: '*',
                        enableCellEdit: false,
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'amount',
                        headerCellClass: 'text-left',
                        width: '*',
                        enableCellEdit: false,
                        filter: {
                            placeholder: 'Search...'
                        },
                        headerCellClass: 'text-right',
                        cellClass: 'text-right'
                    },
                    {
                        field: 'transaction_hash',
                        headerCellClass: 'text-left',
                        width: '150',
                        enableCellEdit: false,
                        cellTemplate: '<p>' +
                            '<a ng-if="row.entity.currency_code==\'CMD\'" href="https://blocks.coinmd.io/?hash={{row.entity.transaction_hash}}#blockchain_transaction" target="_blank">{{row.entity.transaction_hash}}</a>' +
                            '<a ng-if="row.entity.currency_code==\'DOGE\'" href="https://chain.so/tx/DOGE/{{row.entity.transaction_hash}}" target="_blank">{{row.entity.transaction_hash}}</a>' +
                            '<a ng-if="row.entity.currency_code==\'BTC\'" href="https://chain.so/tx/BTC/{{row.entity.transaction_hash}}" target="_blank">{{row.entity.transaction_hash}}</a>' +
                            '</p>',
                        // filter: {
                        //     placeholder: 'Search...'
                        // },

                        headerCellClass: 'text-right',
                        cellClass: 'text-right'
                    },
                    {
                        field: 'created_at',
                        headerCellClass: 'text-left',
                        width: '200',
                        cellTemplate: '<p>{{row.entity.created_at | adminDateFilter }}</p>',
                        enableFiltering: true,
                        enableSorting: false,
                        enableCellEdit: false,
                        filter: {
                            placeholder: 'Search...'
                        },
                        headerCellClass: 'text-center',
                        cellClass: 'text-center'
                    },
                    {
                        field: 'status',
                        name: 'Status',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        cellFilter: 'mapDepositStatusAdmin',
                        editDropdownValueLabel: 'status',
                        editDropdownOptionsArray: [{ id: 2, 'status': 'Not Approved' }, { id: 1, 'status': 'Approved' }, { id: 0, 'status': 'Pending' }],
                        enableCellEdit: true,
                        width: 110,
                        cellEditableCondition: cellEditable,
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: [{ value: '2', label: 'Not Approved' }, { value: '1', label: 'Approved' }, { value: '0', label: 'Pending' }]
                        }
                    },
                ],
                exporterFieldCallback: function(grid, row, col, input) {
                    if (col.field == 'created_at') {
                        return $filter('date')(input, "dd-MM-yyyy HH:mm:a");
                    }
                    if (col.field == 'status') {
                        var $return = '';
                        switch (input) {
                            case 2:
                                $return = 'Not Approved';
                                break;
                            case 1:
                                $return = 'Approved';
                                break;
                            case 0:
                                $return = 'Pending';
                                break;
                            default:
                                $return = ''
                        }
                        return $return;
                    }
                    return input;
                },
                exporterSuppressColumns: ['action'],
            };

            $scope.depositeDrawGrid();
        }
        var cellEditable = function($scope) {
            if ($scope.row.entity.status == 0)
                return true;
            return false;
        }

        $scope.depositeExport = function(format) {
            var limit = $scope.paginationdeposite.totalItems;
            var data = { 'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, "id": id, "exportAs": 1 }
            var result = adminService.getUserDepositRequestList(data);
            result.then(
                function(response) {
                    $scope.depositeGridOptions.data = response.result.records;
                });

            console.log($scope.gridApi);
            if (format == 'csv') {
                $timeout(function() {
                    $scope.depositeGridApi.exporter.csvExport('all', 'all');
                    $scope.getDepositeGridData();
                }, 200);
            } else if (format == 'pdf') {
                $timeout(function() {
                    $scope.depositeGridApi.exporter.pdfExport('all', 'all');
                    $scope.getDepositeGridData();
                }, 200);
            }
        };

        $scope.depositeDrawGrid = function() {
            var data = [];
            var NextPage = (($scope.paginationdeposite.pageNumber - 1) * $scope.paginationdeposite.pageSize);
            var NextPageSize = $scope.paginationdeposite.pageSize;

            var object1 = { 'limit': NextPageSize, 'offset': NextPage, "id": id }
            var object2 = searchParams;
            var data = angular.merge({}, object1, object2);
            var result = adminService.getUserDepositRequestList(data);
            result.then(
                function(response) {
                    // console.log("rerererere", response);
                    $scope.paginationdeposite.totalItems = response.result.totalRecords[0].count;
                    $scope.depositeGridOptions.data = response.result.records;
                    //paginationFactory.getTableHeight($scope);
                },
                function(error) {
                    console.log("Error: " + error);
                });
        }

        $scope.getDepositeGridData();


        //pagination for withdrawal
        $scope.paginationwithdrawal = {
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
                    this.pageSize = $scope.paginationwithdrawal.totalItems;
                else
                    this.pageSize = this.ddlpageSize

                this.pageNumber = 1
                $scope.getWithdrawalGridData();
            },
            firstPage: function() {
                if (this.pageNumber > 1) {
                    this.pageNumber = 1
                    $scope.withdrawDrawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.withdrawDrawGrid();
                }
            },
            nextPage: function() {
                if (this.pageNumber < this.getTotalPages()) {
                    this.pageNumber++;
                    $scope.withdrawDrawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.withdrawDrawGrid();
                }
            },
            previousPage: function() {
                if (this.pageNumber > 1) {
                    this.pageNumber--;
                    $scope.withdrawDrawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.withdrawDrawGrid();
                }
            },
            currentPage: function() {
                if (this.pageNumber > 1) {
                    $scope.withdrawDrawGrid();
                } else {
                    $scope.withdrawDrawGrid();
                }
            },
            lastPage: function() {
                if (this.pageNumber >= 1) {
                    this.pageNumber = this.getTotalPages();
                    $scope.withdrawDrawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.withdrawDrawGrid();
                }
            }
        }


        $scope.getWithdrawalGridData = function() {
            $scope.withdrawalGridOptions = {
                useExternalPagination: true,
                useExternalSorting: true,
                enableFiltering: true,
                enableSorting: true,
                enableRowSelection: false,
                enableSelectAll: false,
                enableGridMenu: true,
                enableColumnMenus: false,
                enableColumnResizing: true,
                exporterCsvFilename: 'CustomerWithdrawalData.csv',
                exporterMenuPdf: false,
                exporterMenuCsv: false,
                exporterPdfOrientation: 'landscape',
                exporterPdfMaxGridWidth: 600,
                onRegisterApi: function(withdrawGridApi) {
                    $scope.withdrawGridApi = withdrawGridApi;
                    $scope.withdrawGridApi.grid.clearAllFilters = function() {
                        this.columns.forEach(function(column) {
                            column.filters.forEach(function(filter) {
                                filter.term = undefined;
                            });
                        });
                        searchParams = undefined;
                        $scope.getWithdrawalGridData(); // your own custom callback
                    };

                    $scope.withdrawGridApi.core.on.filterChanged($scope, function() {
                        $scope.paginationwithdrawal.pageNumber = '1';
                        var grid = this.grid;
                        angular.forEach(grid.columns, function(value, key) {
                            searchParams[value.colDef.field] = value.filters[0].term;
                        });

                        $scope.withdrawDrawGrid();
                    });

                    $scope.withdrawGridApi.core.on.sortChanged($scope, function(val) {
                        var grid = this.grid;
                        angular.forEach(grid.columns, function(value, key) {
                            if (value.sort.direction) {
                                searchParams['order_column'] = value.field;
                                searchParams['order_direction'] = value.sort.direction;
                                $scope.orderCoulmn = value.field;
                                $scope.orderDirection = value.sort.direction;
                            }
                        });
                        $scope.withdrawDrawGrid();
                    });
                },
                columnDefs: [
                    { field: 'serial_number', name: 'S.No.', headerCellClass: 'text-center', enableSorting: false, enableFiltering: false, width: '60', enableCellEdit: false, headerCellClass: 'text-center', cellClass: 'text-center' },
                    {
                        field: 'currency_code',
                        name: 'Currency',
                        headerCellClass: 'text-left',
                        width: '85',
                        enableCellEdit: false,
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'amount',
                        headerCellClass: 'text-left',
                        width: '120',
                        enableCellEdit: false,
                        filter: {
                            placeholder: 'Search...'
                        },
                        headerCellClass: 'text-right',
                        cellClass: 'text-right'
                    },
                    {
                        field: 'platform_value',
                        name: 'Fee',
                        headerCellClass: 'text-left',
                        width: '120',
                        enableCellEdit: false,
                        filter: {
                            placeholder: 'Search...'
                        },
                        headerCellClass: 'text-right',
                        cellClass: 'text-right'
                    },
                    // {
                    //     field: 'btc_address',
                    //     name: 'Customer BTC Address',
                    //     headerCellClass: 'text-left',
                    //     width: '120',
                    //     enableCellEdit: false,
                    //     cellTemplate: '<p>' +
                    //         '<a href="https://chain.so/address/BTC/{{row.entity.btc_address}}" target="_blank">{{row.entity.btc_address}}</a>' +
                    //         '</p>',
                    //     filter: {
                    //         placeholder: 'Search...'
                    //     },
                    //     headerCellClass: 'text-right',
                    //     cellClass: 'text-right'
                    // },
                    {

                        field: 'receiverAddress',
                        name: 'Receiver Address',
                        headerCellClass: 'text-left',
                        width: '120',
                        enableCellEdit: false,
                        cellTemplate: '<p>' +
                            '<a href="https://chain.so/address/BTC/{{row.entity.receiverAddress}}" target="_blank">{{row.entity.receiverAddress}}</a>' +
                            '</p>',
                        filter: {
                            placeholder: 'Search...'
                        },
                        headerCellClass: 'text-right',
                        cellClass: 'text-right'
                    },

                    {
                        field: 'comment',
                        width: '100',
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'created_at',
                        headerCellClass: 'text-left',
                        width: '150',
                        cellTemplate: '<p>{{row.entity.created_at | adminDateFilter }}</p>',
                        enableFiltering: true,
                        enableSorting: false,
                        enableCellEdit: false,
                        filter: {
                            placeholder: 'Search...'
                        },
                        headerCellClass: 'text-center',
                        cellClass: 'text-center'
                    },
                    {
                        field: 'status',
                        name: 'Status *',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        cellFilter: 'mapWithdrawStatusAdmin',
                        editDropdownValueLabel: 'status',
                        editDropdownOptionsArray: [{ id: 2, 'status': 'Not Approved' }, { id: 1, 'status': 'Approved' }, { id: 0, 'status': 'Pending' }],
                        enableCellEdit: true,
                        width: 90,
                        cellEditableCondition: cellEditable,
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: [{ value: '2', label: 'Not Approved' }, { value: '1', label: 'Approved' }, { value: '0', label: 'Pending' }]
                        }
                    },
                ],
                exporterFieldCallback: function(grid, row, col, input) {
                    if (col.field == 'created_at') {
                        return $filter('date')(input, "dd-MM-yyyy HH:mm:a");
                    }
                    if (col.field == 'status') {
                        var $return = '';
                        switch (input) {
                            case 2:
                                $return = 'Not Approved';
                                break;
                            case 1:
                                $return = 'Approved';
                                break;
                            case 0:
                                $return = 'Pending';
                                break;
                            default:
                                $return = ''
                        }
                        return $return;
                    }
                    return input;
                },
                exporterSuppressColumns: ['action'],
            };

            $scope.withdrawDrawGrid();
        }

        var cellEditable = function($scope) {
            if ($scope.row.entity.status == 0)
                return true;
            return false;
        }
        $scope.withdraawExport = function(format) {
            var limit = $scope.paginationwithdrawal.totalItems;
            var data = { 'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, "id": id, "exportAs": 1 }
            var result = adminService.getUserWithdrawRequestList(data);
            result.then(
                function(response) {
                    $scope.withdrawalGridOptions.data = response.result.records;
                });

            console.log($scope.gridApi);
            if (format == 'csv') {
                $timeout(function() {
                    $scope.withdrawGridApi.exporter.csvExport('all', 'all');
                    $scope.getWithdrawalGridData();
                }, 200);
            } else if (format == 'pdf') {
                $timeout(function() {
                    $scope.withdrawGridApi.exporter.pdfExport('all', 'all');
                    $scope.getWithdrawalGridData();
                }, 200);
            }
        };

        $scope.withdrawDrawGrid = function() {
            var data = [];
            var NextPage = (($scope.paginationwithdrawal.pageNumber - 1) * $scope.paginationwithdrawal.pageSize);
            var NextPageSize = $scope.paginationwithdrawal.pageSize;
            var object1 = { 'limit': NextPageSize, 'offset': NextPage, "id": id }
            var object2 = searchParams;
            var data = angular.merge({}, object1, object2);
            var result = adminService.getUserWithdrawRequestList(data);
            result.then(
                function(response) {
                    $scope.paginationwithdrawal.totalItems = response.result.totalRecords[0].count;
                    $scope.withdrawalGridOptions.data = response.result.records;
                    //paginationFactory.getTableHeight($scope);
                },
                function(error) {
                    console.log("Error: " + error);
                });
        }

        $scope.getWithdrawalGridData();
        adminService.getCustomerWalletReport({ 'id': id }).then(function(response) {
            if (response.success) {
                vm.userWalletDetails = response.walletdata;
            }
        }, function(err) {
            toastr.error('Something went wrong. Please try again later.');
        });


        //pagination for Trade
        $scope.paginationtrade = {
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
                    this.pageSize = $scope.paginationtrade.totalItems;
                else
                    this.pageSize = this.ddlpageSize

                this.pageNumber = 1
                $scope.getTradeGridData();
            },
            firstPage: function() {
                if (this.pageNumber > 1) {
                    this.pageNumber = 1
                    $scope.tradeDrawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.tradeDrawGrid();
                }
            },
            nextPage: function() {
                if (this.pageNumber < this.getTotalPages()) {
                    this.pageNumber++;
                    $scope.tradeDrawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.tradeDrawGrid();
                }
            },
            previousPage: function() {
                if (this.pageNumber > 1) {
                    this.pageNumber--;
                    $scope.tradeDrawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.tradeDrawGrid();
                }
            },
            currentPage: function() {
                if (this.pageNumber > 1) {
                    $scope.tradeDrawGrid();
                } else {
                    $scope.tradeDrawGrid();
                }
            },
            lastPage: function() {
                if (this.pageNumber >= 1) {
                    this.pageNumber = this.getTotalPages();
                    $scope.tradeDrawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.tradeDrawGrid();
                }
            }
        }

        $scope.getTradeGridData = function() {
            $scope.tradeGridOptions = {
                useExternalPagination: true,
                useExternalSorting: true,
                enableFiltering: true,
                enableSorting: true,
                enableRowSelection: false,
                enableSelectAll: false,
                enableGridMenu: true,
                enableColumnMenus: false,
                enableColumnResizing: true,
                exporterCsvFilename: 'CustomerTradeData.csv',
                exporterMenuPdf: false,
                exporterMenuCsv: false,
                exporterPdfOrientation: 'landscape',
                exporterPdfMaxGridWidth: 600,
                onRegisterApi: function(tradeGridApi) {
                    $scope.tradeGridApi = tradeGridApi;
                    $scope.tradeGridApi.grid.clearAllFilters = function() {
                        this.columns.forEach(function(column) {
                            column.filters.forEach(function(filter) {
                                filter.term = undefined;
                            });
                        });
                        searchParams = undefined;
                        $scope.getTradeGridData(); // your own custom callback
                    };

                    $scope.tradeGridApi.core.on.filterChanged($scope, function() {
                        $scope.paginationtrade.pageNumber = '1';
                        var grid = this.grid;
                        angular.forEach(grid.columns, function(value, key) {
                            searchParams[value.colDef.field] = value.filters[0].term;
                        });

                        $scope.tradeDrawGrid();
                    });

                    $scope.tradeGridApi.core.on.sortChanged($scope, function(val) {
                        var grid = this.grid;
                        angular.forEach(grid.columns, function(value, key) {
                            if (value.sort.direction) {
                                searchParams['order_column'] = value.field;
                                searchParams['order_direction'] = value.sort.direction;
                                $scope.orderCoulmn = value.field;
                                $scope.orderDirection = value.sort.direction;
                            }
                        });
                        $scope.tradeDrawGrid();
                    });
                },
                columnDefs: [{
                        field: 'transactionid',
                        name: 'Order No.',
                        width: '10%',
                        enableFiltering: false,
                        cellTooltip: function(row, col) {
                            return 'Order No.: ' + row.entity.id;
                        },
                    }, {
                        field: 'created_at',
                        name: 'Date',
                        type: 'date',
                        width: '10%',
                        //  enableFiltering: true,
                        cellFilter: 'date : "dd-MM-yyyy HH:mm:a"',
                        filterCellFiltered: true,
                        cellTooltip: true,
                        // sort: { direction: 'desc', priority: 0 }
                    },
                    {
                        field: 'trade_type',
                        name: 'Transaction Type',
                        width: '12%',
                        // enableFiltering: true,
                        cellTooltip: function(row, col) {
                            return 'Transaction Type: ' + row.entity.trade_type;
                        },

                    },
                    {
                        field: 'type',
                        name: 'Trade Type',
                        width: '12%',
                        // enableFiltering: true,
                        cellTooltip: function(row, col) {
                            return 'Transaction Type: ' + row.entity.trade_type;
                        },
                    },
                    {
                        field: 'pair_id',
                        name: 'Pair',
                        width: '12%',
                        // enableFiltering: true,
                        cellTemplate: '<div title="Pair: {{row.entity.pair_idfrom + \'/\'+row.entity.pair_idto}}">{{row.entity.pair_idfrom + "/" + row.entity.pair_idto }}</div>',
                        cellTooltip: true,
                        filterCellFiltered: false,
                        enableFiltering: false,

                    },
                    {
                        field: 'price',
                        name: 'Price',
                        width: '10%',
                        cellFilter: 'number:8',
                        //  enableFiltering: true,
                        cellTooltip: function(row, col) {
                            return 'Price: ' + row.entity.price;
                        },
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        exporterPdfAlign: 'right',
                        enableFiltering: false,
                    },
                    // {
                    //     field: 'usd_price',
                    //     displayName: 'USD Price',
                    //     name: 'USD Price',
                    //     width: '10%',
                    //     cellFilter: 'number:4',
                    //     cellTooltip: function(row, col) {
                    //         return 'Price: ' + row.entity.usd_price;
                    //     },
                    //     cellClass: 'text-right',
                    //     headerCellClass: 'text-right',
                    //     exporterPdfAlign: 'right',
                    //     enableFiltering: false,
                    // },
                    // {
                    //     field: 'avg_price',
                    //     name: 'Avg. Price',
                    //     cellFilter:'number:8',
                    //     width: '12%',
                    //     //  enableFiltering: true,
                    //     cellTooltip: function(row, col) {
                    //         return 'Avg. Price: ' + row.entity.avg_price;
                    //     },
                    //     cellClass: 'text-right',
                    //     headerCellClass: 'text-right',
                    //     exporterPdfAlign: 'right',
                    //     enableFiltering: false,
                    // },
                    {
                        field: 'quantity',
                        name: 'Quantity',
                        width: '10%',
                        //  enableFiltering: true,
                        cellTooltip: function(row, col) {
                            return 'Quantity: ' + row.entity.quantity;
                        },
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        exporterPdfAlign: 'right',
                        enableFiltering: false,
                    },
                    {
                        field: 'platform_value',
                        name: 'Fee',
                        width: '10%',
                        cellFilter: 'number:8',
                        //   enableFiltering: true,
                        cellTooltip: function(row, col) {
                            return 'Fee: ' + row.entity.platform_value;
                        },
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        exporterPdfAlign: 'right',
                        enableFiltering: false,
                    },
                    {
                        field: 'total_amount',
                        name: 'Total Amount',
                        cellFilter: 'number:8',
                        width: '13%',
                        //   enableFiltering: true,
                        cellTooltip: function(row, col) {
                            return 'Total Amount: ' + row.entity.total_amount;
                        },
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        exporterPdfAlign: 'right',
                        enableFiltering: false,
                    },
                    {
                        field: 'status',
                        name: 'Status',
                        width: '15%',
                        cellFilter: 'tradeDetailFilter : row.entity.status',
                        //   enableFiltering: true,
                        cellTooltip: function(row, col) {
                            return 'Status: ' + row.entity.status;
                        },
                    },
                ],
                exporterFieldCallback: function(grid, row, col, input) {
                    if (col.field == 'created_at') {
                        return $filter('date')(input, "dd-MM-yyyy HH:mm:a ");
                    }
                    if (col.field == 'pair_id') {
                        return "CMD/BTC";
                    }
                    if (col.field == 'price') {
                        return input = row.entity.price.toFixed(8);
                    }
                    // if (col.field == 'usd_price') {
                    //     return input = row.entity.usd_price.toFixed(8);
                    // }

                    if (col.field == 'avg_price') {
                        return input = row.entity.avg_price.toFixed(8);
                    }

                    if (col.field == 'status') {
                        var $return = '';
                        switch (input) {
                            case 'Partially Executed':
                                $return = 'Partially Executed';
                                break;
                            case 'Fully Executed':
                                $return = 'Fully Executed';
                                break;
                            case 'Partially Cancelled':
                                $return = 'Partially Cancelled';
                                break;
                            case 'Not Executed':
                                $return = 'Not Executed';
                                break;
                            default:
                                $return = ''
                        }
                        return $return;
                    }
                    return input;
                },
                exporterSuppressColumns: ['action'],
            };

            $scope.tradeDrawGrid();
        }

        var cellEditable = function($scope) {
            if ($scope.row.entity.status == 0)
                return true;
            return false;
        }
        $scope.export = function(format) {
            var limit = $scope.paginationtrade.totalItems;
            var data = { 'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, "id": id, "exportAs": 1 }
            var result = adminService.getCustomerTradeDetails(data);
            result.then(
                function(response) {
                    $scope.tradeGridOptions.data = response.result.records;
                });
            if (format == 'csv') {
                $timeout(function() {
                    $scope.tradeGridApi.exporter.csvExport('all', 'all');
                    $scope.tradeDrawGrid();
                }, 200);
            } else if (format == 'pdf') {
                $timeout(function() {
                    $scope.tradeGridApi.exporter.pdfExport('all', 'all');
                    $scope.tradeDrawGrid();
                }, 200);
            }
        };

        $scope.tradeDrawGrid = function() {
            var data = [];
            var NextPage = (($scope.paginationtrade.pageNumber - 1) * $scope.paginationtrade.pageSize);
            var NextPageSize = $scope.paginationtrade.pageSize;
            var object1 = { 'limit': NextPageSize, 'offset': NextPage, "id": id }
            var object2 = searchParams;
            var data = angular.merge({}, object1, object2);
            var result = adminService.getCustomerTradeDetails(data);
            result.then(
                function(response) {

                    $scope.paginationtrade.totalItems = response.result.totalRecords[0].count;
                    $scope.tradeGridOptions.data = response.result.records;
                    //paginationFactory.getTableHeight($scope);
                },
                function(error) {
                    console.log("Error: " + error);
                });
        }

        $scope.getTradeGridData();


        //pagination for Open Order
        $scope.paginationopenOrder = {
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
                    this.pageSize = $scope.paginationopenOrder.totalItems;
                else
                    this.pageSize = this.ddlpageSize

                this.pageNumber = 1
                $scope.getOpenTradeGridData();
            },
            firstPage: function() {
                if (this.pageNumber > 1) {
                    this.pageNumber = 1
                    $scope.openTradeDrawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.openTradeDrawGrid();
                }
            },
            nextPage: function() {
                if (this.pageNumber < this.getTotalPages()) {
                    this.pageNumber++;
                    $scope.openTradeDrawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.openTradeDrawGrid();
                }
            },
            previousPage: function() {
                if (this.pageNumber > 1) {
                    this.pageNumber--;
                    $scope.openTradeDrawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.openTradeDrawGrid();
                }
            },
            currentPage: function() {
                if (this.pageNumber > 1) {
                    $scope.openTradeDrawGrid();
                } else {
                    $scope.openTradeDrawGrid();
                }
            },
            lastPage: function() {
                if (this.pageNumber >= 1) {
                    this.pageNumber = this.getTotalPages();
                    $scope.openTradeDrawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.openTradeDrawGrid();
                }
            }
        }


        $scope.getOpenTradeGridData = function() {
            $scope.openTradeGridOptions = {
                useExternalPagination: true,
                useExternalSorting: true,
                enableFiltering: true,
                enableSorting: true,
                enableRowSelection: false,
                enableSelectAll: false,
                enableGridMenu: true,
                enableColumnMenus: false,
                enableColumnResizing: true,
                exporterCsvFilename: 'OpenTradeData.csv',
                exporterMenuPdf: false,
                exporterMenuCsv: false,
                exporterPdfOrientation: 'landscape',
                exporterPdfMaxGridWidth: 600,
                onRegisterApi: function(opentradeGridApi) {
                    $scope.opentradeGridApi = opentradeGridApi;
                    $scope.opentradeGridApi.grid.clearAllFilters = function() {
                        this.columns.forEach(function(column) {
                            column.filters.forEach(function(filter) {
                                filter.term = undefined;
                            });
                        });
                        searchParams = undefined;
                        $scope.getOpenTradeGridData(); // your own custom callback
                    };

                    $scope.opentradeGridApi.core.on.filterChanged($scope, function() {
                        $scope.paginationtrade.pageNumber = '1';
                        var grid = this.grid;
                        angular.forEach(grid.columns, function(value, key) {
                            searchParams[value.colDef.field] = value.filters[0].term;
                        });

                        $scope.openTradeDrawGrid();
                    });

                    $scope.opentradeGridApi.core.on.sortChanged($scope, function(val) {
                        var grid = this.grid;
                        angular.forEach(grid.columns, function(value, key) {
                            if (value.sort.direction) {
                                searchParams['order_column'] = value.field;
                                searchParams['order_direction'] = value.sort.direction;
                                $scope.orderCoulmn = value.field;
                                $scope.orderDirection = value.sort.direction;
                            }
                        });
                        $scope.openTradeDrawGrid();
                    });
                },
                columnDefs: [{
                        field: 'transactionid',
                        name: 'Order No.',
                        width: '10%',
                        enableFiltering: false,
                        cellTooltip: function(row, col) {
                            return 'Order No.: ' + row.entity.id;
                        },
                    }, {
                        field: 'created_at',
                        name: 'Date',
                        type: 'date',
                        width: '10%',
                        //  enableFiltering: true,
                        cellFilter: 'date : "dd-MM-yyyy HH:mm:a"',
                        filterCellFiltered: true,
                        cellTooltip: true,
                        // sort: { direction: 'desc', priority: 0 }
                    },
                    {
                        field: 'trade_type',
                        name: 'Transaction Type',
                        width: '12%',
                        // enableFiltering: true,
                        cellTooltip: function(row, col) {
                            return 'Transaction Type: ' + row.entity.trade_type;
                        },

                    },
                    {
                        field: 'type',
                        name: 'Trade Type',
                        width: '12%',
                        // enableFiltering: true,
                        cellTooltip: function(row, col) {
                            return 'Transaction Type: ' + row.entity.trade_type;
                        },
                    },
                    {
                        field: 'pair_id',
                        name: 'Pair',
                        width: '12%',
                        // enableFiltering: true,
                        cellTemplate: '<div title="Pair: {{row.entity.pair_idfrom + \'/\'+row.entity.pair_idto}}">{{row.entity.pair_idfrom + "/" + row.entity.pair_idto }}</div>',
                        cellTooltip: true,
                        filterCellFiltered: false,
                        enableFiltering: false,

                    },
                    {
                        field: 'price',
                        name: 'Price',
                        width: '10%',
                        cellFilter: 'number:8',
                        //  enableFiltering: true,
                        cellTooltip: function(row, col) {
                            return 'Price: ' + row.entity.price;
                        },
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        exporterPdfAlign: 'right',
                        enableFiltering: false,
                    },
                    // {
                    //     field: 'usd_price',
                    //     displayName: 'USD Price',
                    //     name: 'USD Price',
                    //     width: '10%',
                    //     cellFilter: 'number:4',
                    //     cellTooltip: function(row, col) {
                    //         return 'Price: ' + row.entity.usd_price;
                    //     },
                    //     cellClass: 'text-right',
                    //     headerCellClass: 'text-right',
                    //     exporterPdfAlign: 'right',
                    //     enableFiltering: false,
                    // },
                    // {
                    //     field: 'avg_price',
                    //     name: 'Avg. Price',
                    //     cellFilter:'number:8',
                    //     width: '12%',
                    //     //  enableFiltering: true,
                    //     cellTooltip: function(row, col) {
                    //         return 'Avg. Price: ' + row.entity.avg_price;
                    //     },
                    //     cellClass: 'text-right',
                    //     headerCellClass: 'text-right',
                    //     exporterPdfAlign: 'right',
                    //     enableFiltering: false,
                    // },
                    {
                        field: 'quantity',
                        name: 'Quantity',
                        width: '10%',
                        //  enableFiltering: true,
                        cellTooltip: function(row, col) {
                            return 'Quantity: ' + row.entity.quantity;
                        },
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        exporterPdfAlign: 'right',
                        enableFiltering: false,
                    },
                    {
                        field: 'platform_value',
                        name: 'Fee',
                        width: '10%',
                        // cellFilter:'number:8',
                        //   enableFiltering: true,
                        cellTooltip: function(row, col) {
                            return 'Fee: ' + row.entity.platform_value;
                        },
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        exporterPdfAlign: 'right',
                        enableFiltering: false,
                    },
                    // {
                    //     field: 'total_amount',
                    //     name: 'Total Amount',
                    //     cellFilter:'number:8',
                    //     width: '13%',
                    //     //   enableFiltering: true,
                    //     cellTooltip: function(row, col) {
                    //         return 'Total Amount: ' + row.entity.total_amount;
                    //     },
                    //     cellClass: 'text-right',
                    //     headerCellClass: 'text-right',
                    //     exporterPdfAlign: 'right',
                    //     enableFiltering: false,
                    // },
                    {
                        field: 'status',
                        name: 'Status',
                        width: '15%',
                        //   enableFiltering: true,
                        cellFilter: 'orderBookFilter : row.entity.status',
                        cellTooltip: function(row, col) {
                            return 'Status: ' + row.entity.status;
                        },
                    },
                ],
                exporterFieldCallback: function(grid, row, col, input) {
                    if (col.field == 'created_at') {
                        return $filter('date')(input, "dd-MM-yyyy HH:mm:a ");
                    }
                    if (col.field == 'pair_id') {
                        return "CMD/BTC";
                    }
                    // if (col.field == 'price') {
                    //         return input = row.entity.price.toFixed(8);
                    //     }
                    // if (col.field == 'usd_price') {
                    //     return input = row.entity.usd_price.toFixed(8);
                    // }

                    if (col.field == 'status') {
                        var $return = '';
                        switch (input) {
                            case 'Partially Executed':
                                $return = 'Partially Executed';
                                break;
                            case 'Executed':
                                $return = 'Open';
                                break;
                            default:
                                $return = ''
                        }
                        return $return;
                    }
                    return input;
                },
                exporterSuppressColumns: ['action'],
            };

            $scope.openTradeDrawGrid();
        }

        var cellEditable = function($scope) {
            if ($scope.row.entity.status == 0)
                return true;
            return false;
        }
        $scope.exportOpenTrade = function(format) {
            var limit = $scope.paginationopenOrder.totalItems;
            var data = { 'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, "id": id, "exportAs": 1 }
            var result = adminService.customerOpenOrder(data);
            result.then(
                function(response) {
                    $scope.openTradeGridOptions.data = response.result.records;
                });
            if (format == 'csv') {
                $timeout(function() {
                    $scope.opentradeGridApi.exporter.csvExport('all', 'all');
                    $scope.getOpenTradeGridData();
                }, 100);
            } else if (format == 'pdf') {
                $timeout(function() {
                    $scope.opentradeGridApi.exporter.pdfExport('all', 'all');
                    $scope.getOpenTradeGridData();
                }, 100);
            }
        };

        $scope.openTradeDrawGrid = function() {
            var data = [];
            var NextPage = (($scope.paginationopenOrder.pageNumber - 1) * $scope.paginationopenOrder.pageSize);
            var NextPageSize = $scope.paginationopenOrder.pageSize;
            var object1 = { 'limit': NextPageSize, 'offset': NextPage, "id": id }
            var object2 = searchParams;
            var data = angular.merge({}, object1, object2);
            var result = adminService.customerOpenOrder(data);
            result.then(
                function(response) {
                    console.log("response", response);

                    $scope.paginationopenOrder.totalItems = response.result.totalRecords[0].count;
                    $scope.openTradeGridOptions.data = response.result.records;
                    //paginationFactory.getTableHeight($scope);
                },
                function(error) {
                    console.log("Error: " + error);
                });
        }

        $scope.getOpenTradeGridData();

        vm.getCitiesByCountryId = function(country) {
            dashboardService.getCitiesByCountry({ 'id': country.id }).then(function(response) {
                if (response.success)
                    vm.getCitiesByCountry = response.data;
            }, function(err) {
                toastr.error('Something went wrong. Please try again later.');

            });
        }
    }
]);