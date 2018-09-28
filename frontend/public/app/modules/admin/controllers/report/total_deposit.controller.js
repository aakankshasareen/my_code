admin.controller("totalDepositCtrl", ['$rootScope', '$scope', '$timeout', 'loginService', 'dashboardService', 'AuthService', 'adminService', '$state', 'toastr', 'paginationFactory', '$stateParams', '$window', 'uiGridConstants',
    function ($rootScope, $scope, $timeout, loginService, dashboardService, AuthService, adminService, $state, toastr, paginationFactory, $stateParams, $window, uiGridConstants) {

        var vm = this;
        var searchParams = [];
        $scope.pageHeading = "Total Deposits";
        $scope.orderCoulmn = '';
        $scope.orderDirection = '';

        //Pagination
        paginationFactory.showPagination($scope);

        //ui-Grid Call
        $scope.getGridData = function () {
            $scope.gridOptions = {
                useExternalPagination: true,
                useExternalSorting: true,
                enableFiltering: true,
                enableSorting: true,
                enableRowSelection: false,
                enableSelectAll: false,
                enableGridMenu: true,
                enableColumnMenus: false,
                enableColumnResizing: true,
                exporterCsvFilename: 'totalDeposit.csv',
                exporterMenuPdf: false,
                exporterMenuCsv: false,
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
                            searchParams[value.colDef.field] = value.filters[0].term;
                        });

                        $scope.drawGrid();
                    });

                    $scope.gridApi.core.on.sortChanged($scope, function (val) {
                        var grid = this.grid;
                        angular.forEach(grid.columns, function (value, key) {
                            if (value.sort.direction) {
                                searchParams['order_column'] = value.colDef.order_column == undefined ? value.field : value.colDef.order_column;
                                searchParams['order_direction'] = value.sort.direction;

                                $scope.orderCoulmn = value.field;
                                $scope.orderDirection = value.sort.direction;
                            }
                        });
                        $scope.drawGrid();

                    });
                },
                columnDefs: [
                    { field: 'serial_number', name: 'S.No.', width: '80', enableSorting: false, enableFiltering: false, headerCellClass: 'text-center', cellClass: 'text-center' },
                    {
                        field: 'currency_code',
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'total_amount',
                        filter: {
                            placeholder: 'Search...'
                        }, headerCellClass: 'text-right', cellClass: 'text-right'
                    },


                ],
                exporterFieldCallback: function (grid, row, col, input) {
                    if (col.field == 'status') {
                        return input == '1' ? 'Active' : 'Inactive';
                    }
                    if (col.field == 'type') {
                        return input == '1' ? 'Crypto' : 'Fiat';
                    }
                    return input;
                },
            };

            $scope.drawGrid();
        }

        $scope.export = function (format) {

            var limit = $scope.pagination.totalItems;
            var data = { 'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1 }
            var result = adminService.getTotalDeposit(data);
            result.then(
                function (response) {
                    $scope.gridOptions.data = response.result.records;
                    if (format == 'csv') {
                        $scope.gridApi.exporter.csvExport('all', 'all');
                    } else if (format == 'pdf') {
                        $scope.gridApi.exporter.pdfExport('all', 'all');
                    }
                }).then(function () {
                    $scope.getGridData();
                });
        };

        $scope.drawGrid = function () {
            var data = [];
            var NextPage = (($scope.pagination.pageNumber - 1) * $scope.pagination.pageSize);
            var NextPageSize = $scope.pagination.pageSize;

            var object1 = { 'limit': NextPageSize, 'offset': NextPage }
            var object2 = searchParams;
            var data = angular.merge({}, object1, object2);
            var result = adminService.getTotalDeposit(data);
            result.then(
                function (response) {
                    $scope.pagination.totalItems = response.result.totalRecords[0].count;
                    $scope.gridOptions.data = response.result.records;
                    paginationFactory.getTableHeight($scope);
                },
                function (error) {
                    console.log("Error: " + error);
                });
        }

        //Default Load
        $scope.getGridData();

        vm.getCurrency = {};

        $scope.currency_icon = '';
    }
]);
