admin.controller("currencyPairCtrl", ['$rootScope', '$scope', '$window', 'adminService', '$state', 'toastr', 'paginationFactory', '$stateParams', '$timeout', 'uiGridConstants', 'STATUS',
    function ($rootScope, $scope, $window, adminService, $state, toastr, paginationFactory, $stateParams, $timeout, uiGridConstants, STATUS) {

        var vm = this;

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
                exporterCsvFilename: 'Currency_Pair.csv',
                exporterMenuPdf: false,
                exporterMenuCsv: false,
                editableCellTemplate: "<div><form name=\"inputForm\"><input type=\"INPUT_TYPE\" ng-class=\"'colt' + col.uid\" ui-grid-editor ng-model=\"MODEL_COL_FIELD\" min=\"0\"></form></div>",
                onRegisterApi: function (gridApi) {

                    $scope.gridApi = gridApi;
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                       
                        if(colDef.field ==="order_by"){
                         if ((newValue == null || newValue == '')&& newValue !=0) {
                            rowEntity[colDef.field] = oldValue;
                            return true;
                            }
                          var newVal = newValue; 
                           let valueNumber = function(newVal) {
                            return newValue % 1 === 0;
                         }

                        if(!valueNumber()){
                            toastr.error('Only integer value is allowed.');
                            return 0;
                        }
                        if (!$window.confirm("Are you sure ? You want to update.")) {
                            rowEntity[colDef.field] = oldValue;
                            return false;
                        
                        } else {
                           
                            var updateParam = {
                                'from': rowEntity.from,
                                'to':rowEntity.to,
                                'column_name': colDef.field,
                                'column_value': newValue
                            }
                            console.log('updateParam',updateParam)
                            adminService.updateCurrencyPairOrder(updateParam).then(function (response) {
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
                    }
                    else{
                        if (rowEntity.default == 'true' && newValue == '0') {
                            alert('This pair is default , can not  update');
                            rowEntity[colDef.field] = oldValue;
                            return false;
                        }

                        if (newValue == oldValue) {
                            return false;
                        }

                        if (!$window.confirm("Are you sure ? You want to update.")) {
                            rowEntity[colDef.field] = oldValue;
                            return false;
                        } else {
                            var updateParam = {
                                'id': rowEntity.id,
                                'status': newValue
                            }
                            adminService.updatePairStatus(updateParam).then(function (response) {
                                if (response.success) {
                                    toastr.success(response.message);

                                } else {
                                    toastr.error(response.message);

                                    rowEntity[colDef.field] = oldValue;
                                }
                            }, function (err) {
                                toastr.error('Something went wrong');

                                rowEntity[colDef.field] = oldValue;
                            });
                        }
                        $scope.$apply();
                    }
                })
                        
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
                    {field: 'serial_number', enableCellEdit: false, name: 'S.No.', width: '60', enableSorting: false, enableFiltering: false, headerCellClass: 'text-center', cellClass: 'text-center'},
                    {
                        field: 'default',
                        width: '80',
                        enableCellEdit: false,
                        filter: {
                            placeholder: 'Search...'
                        },
                        cellTemplate: '<div style="padding-top: 6px;" id="default{{row.entity.id}}" ng-if="row.entity.from_type" ><input type="radio" ng-value="row.entity.id" ng-click="grid.appScope.updateDefaultPair(row)" id="default"  ng-checked="row.entity.default==\'true\'" name="default" ><label for="default"></label><input type="hidden" ng-if="row.entity.default==1" ng-model="row.fff" ng-init="{{row.entity.id}}"><input type="hidden" ng-if="row.entity.default==\'true\'" id="default_pair_id"  ng-value="row.entity.id"></div>',
                        enableFiltering: false
                    },
                    {
                        field: 'from',
                        enableCellEdit: false,
                        table: 'pm.from',
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'to',
                        enableCellEdit: false,
                        table: 'pm.to',
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'order_by',
                        name:'Order',
                        width:110,
                        enableSorting: false, 
                        enableFiltering: false , 
                        type: 'number'
                    },
                    {
                        field: 'status',
                        name: 'Status *',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        enableCellEdit: true,
                        editDropdownValueLabel: 'status',
                        editDropdownOptionsArray: [{id: 1, status: 'Active'}, {id: 0, status: 'Inactive'}],
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: STATUS
                        },
                        cellFilter: 'mapStatus',
                        headerCellClass: $scope.highlightFilteredHeader,
                        enableSorting: false,
                        width: 150
                    },
                ],
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
            var data = {'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1}
            var result = adminService.getAllTradeCurrencyPairs(data);
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
            var result = adminService.getAllTradeCurrencyPairs(data);
            result.then(
                    function (response) {
                        $scope.pagination.totalItems = response.result.totalRecords[0].count;
                        $scope.gridOptions.data = response.result.records;
                        paginationFactory.getTableHeight($scope);
                    },
                    function (error) {
                        console.log("Error: " + error);
                    }).then(()=>$('select.ui-grid-filter-select').each(function (i, j) {
                        $(this).find('option:first').text('Show All');
                    }));
        }

        //Default Load
        $scope.getGridData();

        $scope.updateDefaultPair = function (row) {
            if (!$window.confirm("Are you sure ? You want to set this currency pair DEFAULT Pair")) {
                var checked_id = $('#default_pair_id').val();
                $("#default" + checked_id).find('input[type="radio"]').prop('checked', true);
                return false;
            }
            var param = {id: row.entity.id};
            adminService.updateDefaultPair(param).then(function (response) {
                toastr.success(response.message);

            }).then(function(){
                  $scope.getGridData();
            });
//            if (row.entity.status == 0) {
//                $timeout(function () {
//                    vm.getAllTradeCurrencyPairs();
//                }, 500)
//            }

        };

        // Fiat
        adminService.getAdminActiveCurrencyList({id: ''}).then(function (response) {
            if (response.success) {
                $scope.activeCurrencyListFrom = response.result;
            }
        });

        // Crypto Currency List
        adminService.getAdminActiveCurrencyList({id: '1'}).then(function (response) {
            if (response.success) {
                $scope.activeCurrencyListTo = response.result;
            }
        });

        vm.getAllTradeCurrencyPairs = function () {
            adminService.getAllTradeCurrencyPairs().then(function (response) {
                if (response.success) {
                    $scope.gridOptions.data = response.result;
                } else {
                    toastr.error(response.message);

                }
            }, function (err) {
                toastr.error('Something went wrong');

            });
        }

        $scope.saveCurrencyPairs = function () {
            var param = {};
            param.currency_from = $scope.request.currency_from.currency_code;
            param.currency_to = $scope.request.currency_to.currency_code;

            adminService.saveCurrencyPairs(param).then(function (response) {
                if (response.success) {
                $state.go('admin.currencyPairs')
                toastr.success(response.message);
                } else {
                    toastr.error(response.message);
                }
            }, function (err) {
                toastr.error('Something went wrong');

            });
        };
        $scope.deleteCurrencyPair = function (row) {
            if (!$window.confirm("Are you sure ? You want to delete this record.")) {
                return false;
            }
            var param = {id: row.entity.id};
            adminService.deleteCurrencyPair(param).then(function (response) {
                if (response.success) {
                    var index = $scope.gridOptions.data.indexOf(row.entity);
                    $scope.gridOptions.data.splice(index, 1);
                    toastr.success(response.message);

                } else { toastr.error(response.message);

                }
            }, function (err) {
                toastr.error('Something went wrong');

            });
        };
        // vm.cancel = function () {
        //     $state.go('admin.currencyList');
        // }
        vm.cancel1 = function() {
            $state.go('admin.currencyPairs');
        }
    }
]);
