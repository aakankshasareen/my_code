app.controller('commissionCtrl',
        [
            '$rootScope',
            '$scope',
            '$window',
            'adminService',
            '$state',
            'toastr',
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
            'paginationFactory',
            function ($rootScope,
                    $scope,
                    $window,
                    adminService,
                    $state,
                    toastr,
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
                    ADDRESS_TYPE,
                    paginationFactory) {
                var vm = this;

                vm.pageHeading = "Add";
                $scope.gridOptions = [];

                vm.Status = STATUS;
                var searchParams = [];
                $scope.orderCoulmn = '';
                $scope.orderDirection = '';

                //Pagination
                $scope.pagination = {
                    paginationPageSizes: [10, 25, 50, 100],
                    ddlpageSize: 10,
                    pageNumber: 1,
                    series:1,
                    pageSize: 10,
                    totalItems: 0,
                    limitStart: 0,
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
                        alert(this.ddlpageSize, this.pageSize)
                        $scope.pagination.limitStart = this.ddlpageSize * this.pageSize;
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

                $scope.pagination = paginationFactory.showPagination($scope);
                //ui-Grid Call
                $scope.getGridData = function () {
//            $scope.loaderMore = true;
//            $scope.lblMessage = 'loading please wait....!';
//            $scope.result = "color-green";

                    $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
                        if (col.filters[0].term) {
                            return 'header-filtered';
                        } else {
                            return '';
                        }
                    };
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
                        exporterCsvFilename: 'Commission.csv',
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
                                    adminService.updateCommission(updateParam).then(function (response) {
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
                            {field: 'serial_number', name: 'S.No.', width: '60', enableCellEdit: false, enableFiltering: false, enableSorting: false,headerCellClass:'text-center',cellClass:'text-center'},
                            {field: 'currency_code', enableCellEdit: false, filter: {
                                    placeholder: 'Search...'
                                }},
                            {field: 'operation', enableCellEdit: false, filter: {
                                    placeholder: 'Search...'
                                }},
                            {field: 'min_percentage', name: 'Min (%)', type: 'number', min: '0', filter: {
                                    placeholder: 'Search...'
                                },headerCellClass:'text-right',cellClass:'text-right'},
                            // {field: 'max_percentage', name: 'Max (%)', type: 'number', filter: {
                            //         placeholder: 'Search...'
                            //     },headerCellClass:'text-right',cellClass:'text-right'},
                            {field: 'min_amount', name: 'Min Amount', type: 'number',  filter: {
                                    placeholder: 'Search...'
                                },headerCellClass:'text-right',cellClass:'text-right'},
                            // {field: 'currency_icon', cellTemplate: '<span><img class=\"currency-icon\" ng-if=\"row.entity.currency_icon\" width=\"50px\" src=\"images/currencyimage/{{row.entity.currency_icon}}\" lazy-src></span>', enableSorting: false, enableFiltering: false, enableCellEdit: false,headerCellClass:'text-center',cellClass:'text-center'}
//                    {field: 'symbol', name: 'Currency Icon', enableCellEdit: false, enableFiltering: false, enableSorting: false, width: 140}
                ]
                ,
                exporterFieldCallback: function (grid, row, col, input) {
                    if (col.field == 'status') {
                        return input == '1' ? 'Active' : 'Inactive';
                    }                  
                    return input;
                },
                exporterSuppressColumns: [ 'action' ],
            };
            $scope.drawGrid();
        }

                $scope.export = function (format) {

                    var limit = $scope.pagination.totalItems;
                    var data = {'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1}
                    var result = adminService.getCommissions(data);
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

                    var object1 = {'limit': NextPageSize, 'offset': NextPage}
                    var object2 = searchParams;
                    var data = angular.merge({}, object1, object2);
                    var result = adminService.getCommissions(data);
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
