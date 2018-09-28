dashboard.controller("historyController", ['$rootScope', '$templateCache', '$scope', 'dashboardService', 'tradeService', 'uiGridConstants', 'uiGridExporterService', 'uiGridExporterConstants', '$timeout', '$filter', 'TRANSACTION_TYPE', 'TRADE_TYPE', 'STATUS_TYPE', 'ORDER_STATUS', 'WITHDRAW_DEPOSIT_STATUS', 'WITHDRAW_DEPOSIT',
    function ($rootScope, $templateCache, $scope, dashboardService, tradeService, uiGridConstants, uiGridExporterService, uiGridExporterConstants, $timeout, $filter, TRANSACTION_TYPE, TRADE_TYPE, STATUS_TYPE, ORDER_STATUS, WITHDRAW_DEPOSIT_STATUS, WITHDRAW_DEPOSIT) {

        var vm = this;

        vm.getTradePairs = [];
        vm.tradePairs = [];
        vm.cryptoCurrencies = [];
        var searchParams = [];

        vm.filter = {};
        vm.filter.trade = {};
        vm.filter.txn = {};
        vm.filter.pair = {};
        vm.filter.status = {};

        vm.finance = {};
        //$scope.format = 'YYYY-MM-DD';
        //$scope.date = new Date();

        /**date filter for ui grid**/
        // Set Bootstrap DatePickerPopup config

        //console.log("44456");
        //console.log();
        var dateFormat = sessionStorage.getItem("DateFormat") != undefined ? sessionStorage.getItem("DateFormat") : 'dd-MM-yyyy HH:mm a';

        $scope.datePicker = {

            options: {
                formatMonth: 'MM',
                startingDay: 1
            },
            format: "yyyy-MM-dd"
        };

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

        dashboardService.getTradePairList().then(function (response) {
            var data = response.result;
            vm.getTradePairs.push({ 'name': 'All Pairs', 'id': '' });
            for (var i = 0; i < data.length; i++) {
                vm.getTradePairs.push({ 'name': data[i].from + '/' + data[i].to, 'id': data[i].id });
                // vm.cryptoCurrencies.push({ name: data[i].from, value: data[i].from, label: data[i].from })
            }
            for (var i = 1; i < vm.getTradePairs.length; i++) {
                vm.tradePairs.push({ name: vm.getTradePairs[i].name, value: vm.getTradePairs[i].id, label: vm.getTradePairs[i].name })
            }
        });

        /** Added for only cryptocurrencies. existing resources used. */

        dashboardService.getCurrencyList().then(function (response) {
            var data = response.result;
            for (var i = 0; i < data.length; i++) {
                if(data[i].status === 1 && data[i].type === 1){
                    vm.cryptoCurrencies.push({ name: data[i].currency_code, value: data[i].currency_code, label: data[i].currency_code });
                }
            }
        }, function (err) {
            toastr.error('Something went wrong. Please try again later.');
        });

        vm.txnType = TRANSACTION_TYPE;

        vm.tradeType = TRADE_TYPE;

        vm.statusType = STATUS_TYPE;
        vm.dateOptions = {
            maxDate: new Date(),
            //  minDate: new Date(),
            startingDay: 1,
            showWeeks: false
        };



        $scope.gridOptions = [];

        $scope.orderCoulmn = '';
        $scope.orderDirection = '';

        //trade book detail start here//
        //Pagination2
        $scope.pagination = {
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
                    this.pageSize = $scope.pagination.totalItems;
                else
                    this.pageSize = this.ddlpageSize

                this.pageNumber = 1
                $scope.getGridData();
            },
            firstPage: function () {
                if (this.pageNumber > 1) {
                    this.pageNumber = 1
                    $scope.drawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawGrid();
                }
            },
            nextPage: function () {
                if (this.pageNumber < this.getTotalPages()) {
                    this.pageNumber++;
                    $scope.drawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawGrid();
                }
            },
            previousPage: function () {
                if (this.pageNumber > 1) {
                    this.pageNumber--;
                    $scope.drawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawGrid();
                }
            },
            currentPage: function () {
                if (this.pageNumber > 1) {
                    $scope.drawGrid();
                } else {
                    $scope.drawGrid();
                }
            },
            lastPage: function () {
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
        $scope.getGridData = function () {

            $scope.gridOptions = {
                useExternalPagination: true,
                useExternalSorting: true,
                enableFiltering: true,
                enableSorting: true,
                enableRowSelection: false,
                enableSelectAll: false,
                enableColumnMenus: false,
                enableColumnResizing: true,
                exporterCsvFilename: 'TradeList.csv',
                exporterPdfDefaultStyle: { fontSize: 9 },
                exporterPdfTableStyle: { margin: [0, 0, 0, 0] },
                exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'black' },
                exporterPdfOrientation: 'landscape',
                exporterPdfPageSize: 'LETTER',
                exporterPdfMaxGridWidth: 600,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    $scope.gridApi.grid.clearAllFilters = function () {
                        this.columns.forEach(function (column) {
                            column.filters.forEach(function (filter) {
                                filter.term = undefined;
                            });
                        });
                        searchParams = undefined;
                        $scope.getGridData(); // your own custom callback
                    };

                    $scope.gridApi.core.on.filterChanged($scope, function () {
                        $scope.pagination.pageNumber = '1';
                        var grid = this.grid;
                        angular.forEach(grid.columns, function (value, key) {
                            if (!value.filters[0].term) {
                                delete tradeBookFilter[value.colDef.field];
                            } else {
                                tradeBookFilter[value.colDef.field] = value.filters[0].term;
                            }
                        });
                        $scope.drawGrid();
                    });

                    $scope.gridApi.core.on.sortChanged($scope, function (val) {
                        var grid = this.grid;
                        angular.forEach(grid.columns, function (value, key) {
                            if (value.sort.direction) {
                                tradeBookFilter['order_column'] = value.field;
                                tradeBookFilter['order_direction'] = value.sort.direction;

                                $scope.orderCoulmn = value.field;
                                $scope.orderDirection = value.sort.direction;
                            }
                        });
                        $scope.drawGrid();

                    });
                },
                columnDefs: [
                    {
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
                    /*                     {
                                                field: 'created_at',
                                                name: 'Date',
                                                width: '15%',
                                                enableFiltering: true,
                                                cellFilter: 'dateFilter :  $root.displayDate',
                                                filterCellFiltered: true,
                                                cellTooltip: true,
                                                sort: { direction: 'desc', priority: 0 },
                                                cellTemplate: 'ui-grid/date-cell',
                                                filterHeaderTemplate: 'ui-grid/ui-grid-date-filter',
                                                filters: [
                                                {
                                                    condition: function(term, value, row, column){
                                                    if (!term) return true;
                                                    var valueDate = new Date(value);
                                                    return valueDate >= term;
                                                },
                                  
                                            },
                               
                                                ],
                                            headerCellClass: $scope.highlightFilteredHeader
                                             },
                    */
                    {
                        field: 'trade_type',
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: TRANSACTION_TYPE
                        },
                        name: 'Trade Type',
                        enableSorting: false,
                        width: '12%',
                        // enableFiltering: true,
                        cellTooltip: function (row, col) {
                            return 'Transaction Type: ' + row.entity.trade_type;
                        },

                    },
                    {
                        field: 'pair_id',
                        name: 'Pair',
                        width: '10%',
                        enableSorting: false,
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: vm.tradePairs
                        },
                        cellTemplate: '<div title="Pair: {{row.entity.pair_idfrom + \'/\'+row.entity.pair_idto}}">{{row.entity.pair_idfrom + "/" + row.entity.pair_idto }}</div>',
                        cellTooltip: true,

                    },
                    {
                        field: 'price',
                        name: 'Price',
                        width: '10%',
                        enableFiltering: false,
                        cellTooltip: function (row, col) {
                            return 'Price: ' + row.entity.price;
                        },
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        exporterPdfAlign: 'right',
                        cellFilter: 'number :4'
                    },
                    {
                        field: 'avg_price',
                        name: 'Avg. Price',
                        width: '12%',
                        enableFiltering: false,
                        cellTooltip: function (row, col) {
                            return 'Avg. Price: ' + row.entity.avg_price;
                        },
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        exporterPdfAlign: 'right',
                        cellFilter: 'number :2'
                    },
                    {
                        field: 'quantity',
                        name: 'Quantity',
                        width: '10%',
                        enableFiltering: false,
                        cellTooltip: function (row, col) {
                            return 'Quantity: ' + row.entity.quantity;
                        },
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        exporterPdfAlign: 'right',
                        cellFilter: 'number :8'
                    },
                    {
                        field: 'platform_value',
                        name: 'Fee',
                        width: '10%',
                        enableFiltering: false,
                        cellTooltip: function (row, col) {
                            return 'Fee: ' + row.entity.platform_value;
                        },
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        cellFilter: 'number :8',
                        exporterPdfAlign: 'right'
                    },
                    {
                        field: 'total_amount',
                        name: 'Total Amount',
                        width: '13%',
                        enableFiltering: false,
                        cellTooltip: function (row, col) {
                            return 'Total Amount: ' + row.entity.total_amount;
                        },
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        cellFilter: 'number :2',
                        exporterPdfAlign: 'right'
                    },
                    {
                        field: 'status',
                        name: 'Status',
                        width: '15%',
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: STATUS_TYPE
                        },
                        cellTooltip: function (row, col) {
                            return 'Status: ' + row.entity.status;
                        },
                    },
                ],
                exporterFieldCallback: function (grid, row, col, input) {
                    if (col.name == 'Status') {
                        //return input = $filter('mapWithdrawStatus');
                        var $return = '';
                        switch (input) {
                            case 'Fully Executed':
                                $return = 'Fully Executed';
                                break;
                            case 'Partially Executed':
                                $return = 'Partially Executed';
                                break;

                            default:

                        }
                        return $return;
                    }
                    if (col.name == 'Date') {
                        //return $filter('dateFilter')(row.entity.created_at, $rootScope.displayDate);
                       // return moment(new Date(row.entity.created_at).getTime()).format("YYYY-MM-DD HH:mm:ss");
                       return $filter('date')(input, "dd-M-yyyy H:mm a");
                    }
                    if (col.name == 'Pair') {
                        return (row.entity.pair_idfrom + '/' + row.entity.pair_idto);

                    }

                    return input;
                },
            };

            $scope.drawGrid();
        }

        $scope.exportTradeBook = function (format) {

            var limit = $scope.pagination.totalItems;
            var data = { 'limit': limit, 'offset': 0 }
            var result = tradeService.filterTxnList(data);
            result.then(
                function (response) {
                    $scope.gridOptions.data = response.data;
                });
            if (format == 'csv') {
                $timeout(function () {
                    $scope.gridApi.exporter.csvExport('all', 'all');
                    $scope.getGridData();
                }, 100);
            } else if (format == 'pdf') {
                $timeout(function () {
                    $scope.gridApi.exporter.pdfExport('all', 'all');
                    $scope.getGridData();
                }, 100);
            }
        };

        var tradeBookFilter = {}
        $scope.drawGrid = function () {
            var data = [];
            var NextPage = (($scope.pagination.pageNumber - 1) * $scope.pagination.pageSize);
            var NextPageSize = $scope.pagination.pageSize;

            var object1 = { 'limit': NextPageSize, 'offset': NextPage }
            var object2 = tradeBookFilter;
            var data = angular.merge({}, object1, object2);
            var result = tradeService.filterTxnList(data);
            result.then(
                function (response) {
                    $scope.pagination.totalItems = response.totalcount;
                    $scope.gridOptions.data = response.data;
                    //console.log(response.data);
                },
                function (error) {
                    console.log("Error: " + error);
                }).then(() => $('select.ui-grid-filter-select').each(function (i, j) {
                    $(this).find('option:first').text('Show All');
                }));
        }

        //Default Load
        $scope.getGridData();
        $scope.orderOptions = [];

        //trade book detail End here//
        //Order book detail start here//

        //PaginationorderBook
        $scope.paginationOrder = {
            paginationOrderPageSizes: [10, 25, 50, 100],
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
                    this.pageSize = $scope.paginationOrder.totalItems;
                else
                    this.pageSize = this.ddlpageSize

                this.pageNumber = 1
                $scope.getOrderBookData();
            },
            firstPage: function () {
                if (this.pageNumber > 1) {
                    this.pageNumber = 1
                    $scope.order();
                } else {
                    this.pageNumber = 1
                    $scope.order();
                }
            },
            nextPage: function () {
                if (this.pageNumber < this.getTotalPages()) {
                    this.pageNumber++;
                    $scope.order();
                } else {
                    this.pageNumber = 1
                    $scope.order();
                }
            },
            previousPage: function () {
                if (this.pageNumber > 1) {
                    this.pageNumber--;
                    $scope.order();
                } else {
                    this.pageNumber = 1
                    $scope.order();
                }
            },
            currentPage: function () {
                if (this.pageNumber > 1) {
                    $scope.order();
                } else {
                    $scope.order();
                }
            },
            lastPage: function () {
                if (this.pageNumber >= 1) {
                    this.pageNumber = this.getTotalPages();
                    $scope.order();
                } else {
                    this.pageNumber = 1
                    $scope.order();
                }
            }
        };
        $scope.getOrderBookData = function () {

            $scope.orderOptions = {
                useExternalPaginationOrder: true,
                useExternalSorting: true,
                enableFiltering: true,
                enableSorting: true,
                enableRowSelection: false,
                enableSelectAll: false,
                enableColumnMenus: false,
                enableColumnResizing: true,
                exporterCsvFilename: 'OrderBook.csv',
                exporterPdfDefaultStyle: { fontSize: 9 },
                exporterPdfTableStyle: { margin: [0, 0, 0, 0] },
                exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'black' },
                exporterPdfOrientation: 'landscape',
                exporterPdfPageSize: 'LETTER',
                exporterPdfMaxGridWidth: 600,
                onRegisterApi: function (gridApiOrderBook) {
                    $scope.gridApiOrderBook = gridApiOrderBook;
                    $scope.gridApiOrderBook.grid.clearAllFilters = function () {
                        this.columns.forEach(function (column) {
                            column.filters.forEach(function (filter) {
                                filter.term = undefined;
                            });
                        });
                        orderBookFilter = {};
                        $scope.getOrderBookData(); // your own custom callback
                    };

                    $scope.gridApiOrderBook.core.on.filterChanged($scope, function () {
                        $scope.pagination.pageNumber = '1';
                        var grid = this.grid;
                        angular.forEach(grid.columns, function (value, key) {
                            orderBookFilter[value.colDef.field] = value.filters[0].term;
                        });

                        $scope.order();
                    });

                    $scope.gridApiOrderBook.core.on.sortChanged($scope, function (val) {
                        var grid = this.grid;
                        angular.forEach(grid.columns, function (value, key) {
                            if (value.sort.direction) {
                                orderBookFilter['order_column'] = value.field;
                                orderBookFilter['order_direction'] = value.sort.direction;

                                $scope.orderCoulmn = value.field;
                                $scope.orderDirection = value.sort.direction;
                            }
                        });
                        $scope.order();

                    });
                },
                columnDefs: [
                    {
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
                            }],
                        headerCellClass: 'text-left', cellClass: 'text-right'
                    },

                    /*                    {
                                                field: 'created_at',
                                                name: 'Date',
                                                width: '15%',
                                                cellFilter: 'dateFilter :  $root.displayDate',
                                                filterCellFiltered: true,
                                                enableCellEdit: true,
                                                cellTooltip: true,
                                                enableFiltering: true,
                                                //filterHeaderTemplate: '<div><form name="inputForm"><div ui-grid-edit-datepicker datepicker-options="datepickerOptions" ng-class="\'colt\' + col.uid"></div></form></div>',
                                                //editableCellTemplate: '<input type="text" class="form-control" uib-datepicker-popup="{{format}}" ng-model="date" />',
                                                sort: { direction: 'desc', priority: 0 },
                                                //filterHeaderTemplate: '<div class="ui-grid-filter-container"><input style="display:inline; width:100%"  class="ui-grid-filter-input" date-picker type="text" ng-model="col.filters[0].term"/></div>',
                                                cellTemplate: 'ui-grid/date-cell',
                                                filterHeaderTemplate: 'ui-grid/ui-grid-date-filter',
                                                filters: [
                                {
                                  condition: function(term, value, row, column){
                                        if (!term) return true;
                                        var valueDate = new Date(value);
                                        return valueDate >= term;
                                    },
                                  
                                },
                               
                            ],
                            headerCellClass: $scope.highlightFilteredHeader
                    
                                            },*/

                    {
                        field: 'type',
                        name: 'Type',
                        width: '8%',
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: TRADE_TYPE
                        },
                        enableSorting: false,
                        cellTooltip: function (row, col) {
                            return 'Type: ' + row.entity.type;
                        },
                    },
                    {
                        field: 'trade_type',
                        name: 'Trade Type',
                        width: '12%',
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: TRANSACTION_TYPE
                        },
                        enableSorting: false,
                        cellTooltip: function (row, col) {
                            return 'Trade Type: ' + row.entity.trade_type;
                        },

                    },
                    {
                        field: 'pair_id',
                        name: 'Pair',
                        width: '10%',
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: vm.tradePairs
                        },
                        enableSorting: false,
                        cellTemplate: '<div title="Pair: {{row.entity.pair_idfrom + \'/\'+row.entity.pair_idto}}">{{row.entity.pair_idfrom + "/" + row.entity.pair_idto }}</div>',
                        cellTooltip: true,
                    },
                    {
                        field: 'price',
                        name: 'Price',
                        width: '10%',
                        cellTooltip: function (row, col) {
                            return 'Price: ' + row.entity.price;
                        },
                        enableFiltering: false,
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        exporterPdfAlign: 'right'
                    },
                    {
                        field: 'quantity',
                        name: 'Quantity',
                        width: '10%',
                        enableFiltering: false,
                        cellTooltip: function (row, col) {
                            return 'Quantity: ' + row.entity.quantity;
                        },
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        exporterPdfAlign: 'right'
                    },
                    // {
                    //     field: 'platform_fee',
                    //     name: 'Fee',
                    //     width: '8%',
                    //     enableFiltering: false,
                    //     cellTooltip: function(row, col) {
                    //         return 'Fee: ' + row.entity.platform_fee;
                    //     },
                    //     cellClass: 'text-right',
                    //     headerCellClass: 'text-right',
                    //     exporterPdfAlign: 'right'
                    // },
                    {
                        field: 'platform_value',
                        name: 'Fee',
                        width: '10%',
                        enableFiltering: false,
                        cellTooltip: function (row, col) {
                            return 'Fee: ' + row.entity.platform_value;
                        },
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        exporterPdfAlign: 'right'
                    },
                    {
                        field: 'totalprice',
                        name: 'Total Amount',
                        width: '13%',
                        enableFiltering: false,
                        cellTooltip: function (row, col) {
                            return 'Total Amount: ' + row.entity.totalprice;
                        },
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        exporterPdfAlign: 'right'
                    },
                    {
                        field: 'status',
                        name: 'Status',
                        width: '13%',
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: ORDER_STATUS
                        },
                        cellTooltip: function (row, col) {
                            return 'Status: ' + row.entity.status;
                        },
                        cellFilter: 'tradeStatusFilter : row.entity.status'
                    },
                ],
                exporterFieldCallback: function (grid, row, col, input) {
                    if (col.name == 'Status') {
                        //return input = $filter('mapWithdrawStatus');
                        var $return = '';
                        switch (input) {
                            case 'Executed':
                                $return = 'Pending';
                                break;
                            case 'Partially Executed':
                                $return = 'Exchanging';
                                break;

                            default:

                        }

                        return $return;
                    }
                    if (col.name == 'Date') {
                        return $filter('date')(input, "dd-M-yyyy H:mm a");
                       // return $filter('dateFilter')(row.entity.created_at, $rootScope.displayDate);
                        //return moment(new Date(row.entity.created_at).getTime()).format("YYYY-MM-DD HH:mm:ss");
                    }
                    if (col.name == 'Pair') {
                        return (row.entity.pair_idfrom + '/' + row.entity.pair_idto);

                    }
                    return input;
                },
            };

            $scope.order();
        };


        $scope.exportOrder = function (format) {

            var limit = $scope.paginationOrder.totalItems;
            var data = { 'limit': limit, 'offset': 0 }
            var result = tradeService.orderBook(data);
            result.then(
                function (response) {

                    $scope.orderOptions.data = response.data;
                });
            if (format == 'csv') {
                $timeout(function () {
                    $scope.gridApiOrderBook.exporter.csvExport('all', 'all');
                    $scope.getOrderBookData();
                }, 100);
            } else if (format == 'pdf') {
                $timeout(function () {
                    $scope.gridApiOrderBook.exporter.pdfExport('all', 'all');
                    $scope.getOrderBookData();
                }, 100);
            }
        };
        var orderBookFilter = {};

        $scope.order = function () {
            var data = [];
            var NextPage = (($scope.paginationOrder.pageNumber - 1) * $scope.paginationOrder.pageSize);
            var NextPageSize = $scope.paginationOrder.pageSize;

            var object1 = { 'limit': NextPageSize, 'offset': NextPage }
            var object2 = orderBookFilter;
            var data = angular.merge({}, object1, object2);
            var result = tradeService.orderBook(data);
            result.then(
                function (response) {
                    // $scope.pagination.totalItems = 100;
                    $scope.paginationOrder.totalItems = response.totalcount;
                    $scope.orderOptions.data = response.activeorderdata;
                    // console.log(response.activeorderdata);
                },
                function (error) {
                    console.log("Error: " + error);
                }).then(() => $('select.ui-grid-filter-select').each(function (i, j) {
                    $(this).find('option:first').text('Show All');
                }));
        }
        //Default Load
        $scope.getOrderBookData();

        //Order book detail end here//

        //INR History detail start here//
        //Pagination Deposite/Withdrawl(INR)
        $scope.paginationinr = {
            paginationinrPageSizes: [10, 25, 50, 100],
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
                exporterCsvFilename: 'inrHistory.csv',
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
                        $scope.pagination.pageNumber = '1';
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
                columnDefs: [
                    {
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

                    /*                {
                                            field: 'created_at',
                                            name: 'Date',
                                            width: '15%',
                                            cellFilter: 'dateFilter :  $root.displayDate',
                                            // filterCellFiltered: true,
                                            enableFiltering: true,
                                            cellTooltip: true,
                                            sort: { direction: 'desc', priority: 0 },
                                            cellTemplate: 'ui-grid/date-cell',
                                            filterHeaderTemplate: 'ui-grid/ui-grid-date-filter',
                                            filters: [
                                             {
                                            condition: function(term, value, row, column){
                                            if (!term) return true;
                                            var valueDate = new Date(value);
                                            return valueDate >= term;
                                            },
                                            },
                               
                                                ],
                                            headerCellClass: $scope.highlightFilteredHeader
                                        },*/
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
                                $return = 'Success';
                                break; //Pending //Approved
                            case 2:
                                $return = 'Failed';
                                break; //Pending //Not Approved

                            default:

                        }
                        return $return;
                    }
                    if (col.name == 'Date') {
                       // return $filter('dateFilter')(row.entity.created_at, $rootScope.displayDate);
                        // if (col.field == 'created_at') {
                            return $filter('date')(input, "dd-M-yyyy H:mm a");
                        //}
                   // return moment(new Date(row.entity.created_at).getTime()).format("YYYY-MM-DD HH:mm:ss");
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
        //default call
        $scope.getinrHistoryTable();

        //INR history detail end here//

        //Crypto history detail start here//
        $scope.paginationcrypto = {
            paginationcryptoPageSizes: [10, 25, 50, 100],
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
                        $scope.pagination.pageNumber = '1';
                        var grid = this.grid;
                        angular.forEach(grid.columns, function (value, key) {
                            if (!value.filters[0].term && value.filters[0].term !== 0) {
                                delete cryptoHistoryFilter[value.colDef.field];
                            } else {
                                cryptoHistoryFilter[value.colDef.field] = value.filters[0].term;
                            }
                        });
                        $scope.cryptoHistory();
                        // $scope.getTransactionHistory();
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
                columnDefs: [

                    {
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

/*                {
                        field: 'created_at',
                        name: 'Date',
                        width: '15%',
                        enableFiltering: true,
                        cellFilter: 'dateFilter :  $root.displayDate',
                        // filterCellFiltered: true,
                        cellTooltip: true,
                        sort: { direction: 'desc', priority: 0 },
                        cellTemplate: 'ui-grid/date-cell',
                        filterHeaderTemplate: 'ui-grid/ui-grid-date-filter',
                        filters: [
                        {
                            condition: function(term, value, row, column){
                            if (!term) return true;
                            var valueDate = new Date(value);
                            return valueDate >= term;
                            },
                        },
                        ],
                        headerCellClass: $scope.highlightFilteredHeader
                    },
*/                    {
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
                                $return = 'Success';
                                break; //Pending //Approved
                            case 2:
                                $return = 'Failed';
                                break; //Pending //Not Approved

                            default:

                        }
                        return $return;
                    }
                    if (col.name == 'Date') {
                        return $filter('date')(input, "dd-M-yyyy H:mm a");
                        //return $filter('dateFilter')(row.entity.created_at, $rootScope.displayDate);
                        //return moment(new Date(row.entity.created_at).getTime()).format("YYYY-MM-DD HH:mm:ss");
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
        ////////////////////////
        $scope.getTransactionHistory = function () {
            var data = [];
            // data = angular.merge({},searchParams);

            dashboardService.transactionHistory().then(function (response) {
                if (response.success) {
                    $scope.transaction_history.data = response.data;
                }
            });
        }
        //////////////////////
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
                }).then(() => $('select.ui-grid-filter-select').each(function (i, j) {
                    $(this).find('option:first').text('Show All');
                }));
        }
        //default call
        $scope.getcryptoHistoryTable();

        //Crypto history detail end here//
    }
]);
