admin.controller("currencyCtrl", ['$rootScope', '$scope', '$window', 'adminService', '$state','toastr', 'paginationFactory', '$stateParams', 'Upload', '$timeout', 'uiGridConstants', 'CURRENCY_TYPE', 'STATUS','$location',
    function($rootScope, $scope, $window, adminService, $state,toastr, paginationFactory, $stateParams, Upload, $timeout, uiGridConstants, CURRENCY_TYPE, STATUS,$location) {

        var vm = this;
        $scope.pageHeading = "Add";

        vm.currencyType = CURRENCY_TYPE;
        vm.status = STATUS;


        var searchParams = [];

        var locationSearch = $location.search();
        
        var filterStatusArr = [];
        filterArr = STATUS.map(function (arr, index) {
            return arr.value;
        })
        var queryParam = parseInt(locationSearch.status);
        var filterStatus = undefined;
        if(angular.isDefined(queryParam) && filterArr.indexOf(queryParam) >=0){
            var filterStatus = queryParam;
            searchParams['status'] = queryParam;
        }   


        $scope.orderCoulmn = '';
        $scope.orderDirection = '';

        //

        //Pagination
        paginationFactory.showPagination($scope);

        //ui-Grid Call
        $scope.getGridData = function() {
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
                exporterCsvFilename: 'Currency.csv',
                exporterMenuPdf: false,
                exporterMenuCsv: false,
                editableCellTemplate: "<div><form name=\"inputForm\"><input type=\"INPUT_TYPE\" ng-class=\"'colt' + col.uid\" ui-grid-editor ng-model=\"MODEL_COL_FIELD\" min=\"0\"></form></div>",
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if ((newValue == null || newValue == '')&& newValue !=0) {
                            rowEntity[colDef.field] = oldValue;
                            return true;
                        }
                        var newVal = newValue;
                        var valueNumber = function(newVal) {
                             return parseInt(newValue) === newValue
                         }
                        if(!valueNumber()){
                            toastr.error('Only integer value is allowed.');
                            return 0;
                        }
                        if (!$window.confirm("Are you sure ? You want to update.")) {
                            rowEntity[colDef.field] = oldValue;
                            return false;
                        } else {
                            // console.log( typeof(newValue))
 
                            var updateParam = {
                                'currency_code': rowEntity.currency_code,
                                'column_name': colDef.field,
                                'column_value': newValue
                            }
                           // console.log('updateParam',updateParam)
                            adminService.updateCurrencyPairsOrder(updateParam).then(function (response) {
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
                    $scope.gridApi.grid.clearAllFilters = function() {
                        this.columns.forEach(function(column) {
                            column.filters.forEach(function(filter) {
                                filter.term = undefined;
                            });
                        });
                        searchParams = undefined;
                        $scope.getGridData(); // your own custom callback
                    };

                    $scope.gridApi.core.on.filterChanged($scope, function() {
                        $scope.pagination.pageNumber = '1';
                        var grid = this.grid;
                        angular.forEach(grid.columns, function(value, key) {
                            searchParams[value.colDef.field] = value.filters[0].term;
                        });

                        $scope.drawGrid();
                    });

                    $scope.gridApi.core.on.sortChanged($scope, function(val) {
                        var grid = this.grid;
                        angular.forEach(grid.columns, function(value, key) {
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
                    { field: 'serial_number', name: 'S.No.', width: '60', enableSorting: false, enableFiltering: false,headerCellClass:'text-center',cellClass:'text-center' },
                    {
                        field: 'currency_name',
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'currency_code',
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    { field: 'currency_icon', cellTemplate: '<span><img class=\"currency-icon\" ng-if=\"row.entity.currency_icon\" width=\"50px\" src=\"images/currencyimage/{{row.entity.currency_icon}}\" lazy-src></span>', enableSorting: false, enableFiltering: false,headerCellClass:'text-center',cellClass:'text-center' },
                    {
                        field: 'type',
                        cellFilter: 'mapCurrencyType',
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: CURRENCY_TYPE,
                        },
                        enableSorting: false
                    },
                    {
                        field: 'status',
                        filter: {
                            term:filterStatus,
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: STATUS,
                        },
                        cellFilter: 'mapStatus',
                        headerCellClass: $scope.highlightFilteredHeader,
                        enableSorting: false,
			            width:110
                    },
                    {
                        field: 'order_by',
                        name:'Order',
                      width:110,
                      enableSorting: false, 
                        enableFiltering: false , 
                        type: 'number'
                    },
                    { field: 'action', enableSorting: false, enableFiltering: false, cellTemplate: '<div ui-view="_action"></div>', width: '70' }
                ],
                exporterFieldCallback: function(grid, row, col, input) {
                    if (col.field == 'status') {
                        return input == '1' ? 'Active' : 'Inactive';
                    }
                    if (col.field == 'type') {
                        return input == '1' ? 'Crypto' : 'Fiat';
                    }
                    return input;
                },
                exporterSuppressColumns: [ 'action' ],
            };

            $scope.drawGrid();
        }

        $scope.export = function(format) {

            var limit = $scope.pagination.totalItems;
            var data = { 'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1 }
            var result = adminService.getAllCurrencyList(data);
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

        $scope.drawGrid = function() {
            var data = [];
            var NextPage = (($scope.pagination.pageNumber - 1) * $scope.pagination.pageSize);
            var NextPageSize = $scope.pagination.pageSize;

            var object1 = { 'limit': NextPageSize, 'offset': NextPage }
            var object2 = searchParams;
            var data = angular.merge({}, object1, object2);
            var result = adminService.getAllCurrencyList(data);
            result.then(
                function(response) {
                    $scope.pagination.totalItems = response.result.totalRecords[0].count;
                    $scope.gridOptions.data = response.result.records;
                    paginationFactory.getTableHeight($scope);
                },
                function(error) {
                    // console.log("Error: " + error);
                }).then(()=>$('select.ui-grid-filter-select').each(function (i, j) {
                    $(this).find('option:first').text('Show All');
                }));;
        }

        //Default Load
        $scope.getGridData();

        vm.getCurrency = {};

        $scope.currency_icon = '';

        vm.uploadCurrencyIcon = function() {
            //console.log("Currency Controller");

            if (vm.currencyForm.file.$valid && vm.getCurrency.file) { //check if from is valid
                return adminService.upload(vm.getCurrency.file).then(function(response) {

                    $scope.currency_icon = response.data.result.filename;
                });
            } else {
                $scope.currency_icon = vm.getCurrency.uploaded_icon;
                return Promise.resolve();
            }
        }

        vm.addCurrency = function() {
            if(vm.currencyForm.$valid){
            vm.uploadCurrencyIcon().then(function() {
                var data = {
                    "currency_name": vm.getCurrency.currency_name,
                    "currency_code": vm.getCurrency.currency_code,
                    "currency_symbol": vm.getCurrency.currency_symbol,
                    'currency_type': vm.getCurrency.currency_type.id,
                    'currency_status': vm.getCurrency.currency_status.id,
                    'currency_icon': $scope.currency_icon
                }

                adminService.addCurrency(data).then(function(response) {
                    if (response.success) {
                        $state.go('admin.currencyList')
                        toastr.success(response.message);

                    } else {
                        toastr.error(response.message);

                    }
                }, function(err) {
                    toastr.error('Something went wrong');

                });
            });
        }
        }

        if ($state.is('admin.editCurrency')) {
            $scope.pageHeading = "Edit";
            var id = $stateParams.id;
            adminService.editCurrency({ id: id }).then(function(response) {
                if (response.success) {
                    vm.getCurrency.currency_name = response.result[0].currency_name;
                    vm.getCurrency.currency_code = response.result[0].currency_code;
                    vm.getCurrency.currency_symbol = response.result[0].symbol;
                    vm.getCurrency.currency_type = { id: response.result[0].type, name: 'Fiat Currency' };
                    vm.getCurrency.currency_status = { id: response.result[0].status };
                    vm.getCurrency.uploadedfile = response.result[0].currency_icon ? "images/currencyimage/" + response.result[0].currency_icon : '';
                    vm.getCurrency.uploaded_icon = response.result[0].currency_icon;
                    vm.getCurrency.id = response.result[0].id;
                }
            });
        }

        vm.updateCurrency = function() {
             if(vm.currencyForm.$valid){
            vm.uploadCurrencyIcon();

            $timeout(function() {
                var data = {
                    "id": vm.getCurrency.id,
                    "currency_name": vm.getCurrency.currency_name,
                    "currency_code": vm.getCurrency.currency_code,
                    "currency_symbol": vm.getCurrency.currency_symbol,
                    'currency_type': vm.getCurrency.currency_type.id,
                    'currency_status': vm.getCurrency.currency_status.id,
                    'currency_icon': $scope.currency_icon
                }
                adminService.updateCurrency(data).then(function(response) {

                    if (response.success) {
                        $state.go('admin.currencyList')
                        toastr.success(response.message);
                    } else {
                        toastr.error(response.message);
                    }
                }, function(err) {
                    toastr.error("Something went wrong.");
                });
            }, 3000);
        };
        };

        $scope.deleteCurrency = function(row) {
            if (!$window.confirm("Are you sure ? You want to delete this record.")) {
                return false;
            }
            var param = { id: row.entity.id };
            adminService.deleteCurrency(param).then(function(response) {
                if (response.success) {
                    var index = $scope.gridOptions.data.indexOf(row.entity);
                    $scope.gridOptions.data.splice(index, 1);
                    toastr.success(response.message);

                } else {
                    toastr.error(response.message);

                }
            }, function(err) {
                toastr.error('Something went wrong');

            });
        };
        vm.cancel = function() {
            $state.go('admin.currencyList');
        }
    }
])
