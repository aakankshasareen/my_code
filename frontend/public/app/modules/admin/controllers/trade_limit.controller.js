app.controller('tradeLimitCtrl',
    [
        '$rootScope',
        '$scope',
        '$window',
        'adminService',
        '$state',
        'toastr',
        'paginationFactory',
        '$stateParams',
        'uiGridConstants',
        'dashboardService',
        'KYC_STATUS',
        'STATUS',
        '$timeout',
        '$filter',
        'IMAGE_TYPE',
        '$httpParamSerializer',
        'ID_TYPE',
        'ADDRESS_TYPE',
        function ($rootScope,
            $scope,
            $window,
            adminService,
            $state,
            toastr,
            paginationFactory,
            $stateParams,
            uiGridConstants,
            dashboardService,
            KYC_STATUS,
            STATUS,
            $timeout,
            $filter,
            IMAGE_TYPE,
            $httpParamSerializer,
            ID_TYPE,
            ADDRESS_TYPE) {
            var vm = this;

            vm.pageHeading = "Add";
            $scope.gridOptions = [];

            vm.Status = STATUS;
            var searchParams = [];
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
                    exporterCsvFilename: 'TradeLimit.csv',
                    exporterMenuPdf: false,
                    exporterMenuCsv: false,
                    editableCellTemplate: "<div><form name=\"inputForm\"><input type=\"INPUT_TYPE\" ng-class=\"'colt' + col.uid\" ui-grid-editor ng-model=\"MODEL_COL_FIELD\" min=\"0\"></form></div>",
                    onRegisterApi: function (gridApi) {
                        $scope.gridApi = gridApi;
                        gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                            if ((newValue == null || newValue == '')&& newValue !=0) {
                                rowEntity[colDef.field] = oldValue;
                                return true;
                            }

                            if (!$window.confirm("Are you sure ? You want to update.")) {
                                rowEntity[colDef.field] = oldValue;
                                return false;
                            } else {
                                var updateParam = {
                                    'currency_code': rowEntity.currency_code,
                                    'operation': rowEntity.operation,
                                    'column_name': colDef.field,
                                    'column_value': newValue,
                                    'old_column_value':oldValue
                                }
                                adminService.updateTradeLimit(updateParam).then(function (response) {
                                    if (response.success) {
                                        toastr.success(response.message);

                                    } else {
                                        toastr.error(response.message);

                                    }
                                }, function (err) {
                                    toastr.error('Something went wrong');

                                });
                            }
                            $scope.$apply();
                        });
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
                        { field: 'serial_number', name: 'S.No.', width: '90', enableCellEdit: false, enableFiltering: false, enableSorting: false, headerCellClass: 'text-center', cellClass: 'text-center' },
                        {
                            field: 'currency_code', enableCellEdit: false, filter: {
                                placeholder: 'Search..',
                                width :'150'
                            }
                        },
                        {
                            field: 'operation', enableCellEdit: false, width: '200', filter: {
                                placeholder: 'Search..'
                            }
                        },
                        {
                            field: 'min_amount', type: 'number', min: '0', filter: {
                                placeholder: 'Search..'
                            }, headerCellClass: 'text-right', cellClass: 'text-right', width: 150
                        },
                        {
                            field: 'max_amount', type: 'number', width: 150, filter: {
                                placeholder: 'Search..'
                            }, headerCellClass: 'text-right', cellClass: 'text-right'
                        },
                        {
                            field: 'daily_max_amount', type: 'number', width: 150, filter: {
                                placeholder: 'Search..'
                            }, headerCellClass: 'text-right', cellClass: 'text-right'
                        },
                        // {field: 'currency_icon',headerCellClass:'text-center',cellClass:'text-center', enableCellEdit: false,cellTemplate: '<span><img class=\"currency-icon\" ng-if=\"row.entity.currency_icon\" width=\"50px\" src=\"images/currencyimage/{{row.entity.currency_icon}}\" lazy-src></span>', enableSorting: false, enableFiltering: false}
                    ]
                    ,
                    exporterFieldCallback: function (grid, row, col, input) {
                        if (col.field == 'status') {
                            return input == '1' ? 'Active' : 'Inactive';
                        }
                        return input;
                    },
                    exporterSuppressColumns: ['action'],

                };
                $scope.drawGrid();
            }

            $scope.export = function (format) {
                var limit = $scope.pagination.totalItems;
                var data = { 'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1 }
                var result = adminService.getTradeLimits(data);
                result.then(
                    function(response) {
                        $scope.gridOptions.data = response.result.records;
                        if (format == 'csv') {
                          $scope.gridApi.exporter.csvExport('all', 'all');
                        } else if (format == 'pdf') {
                          $scope.gridApi.exporter.pdfExport('all', 'all');
                        }
                    }).then(function(){
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
                var result = adminService.getTradeLimits(data);
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
        }]
);
