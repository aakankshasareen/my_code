admin.controller('cityCtrl', ['$rootScope', '$scope', '$window', 'adminService', '$state', 'toastr', 'paginationFactory', '$stateParams', 'uiGridConstants', '$timeout',
    function($rootScope, $scope, $window, adminService, $state, toastr, paginationFactory, $stateParams, uiGridConstants, $timeout) {
        var vm = this;
        vm.pageHeading = "Add";
        $scope.gridOptions = [];

        vm.Status = [{ id: '1', 'name': 'Active' }, { id: '0', 'name': 'Inactive' }];

        var searchParams = [];

        $scope.orderCoulmn = '';
        $scope.orderDirection = '';

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
                exporterCsvFilename: 'Country.csv',
                exporterMenuPdf: false,
                exporterMenuCsv: false,
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
                    { field: 'serial_number', name: 'S.No.', headerCellClass: 'text-center', enableSorting: false, enableFiltering: false, width: '60',headerCellClass:'text-center',cellClass:'text-center' },
                    {
                        field: 'name',
                        name: 'City Name',
                        order_column: 'c.name',
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'state_name',
                        order_column: 's.name',
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'country_name',
                        order_column: 'cy.name',
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'status',
                        enableSorting: false,
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: [{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }]
                        },
                        cellFilter: 'mapStatus',
			width:150,
                        headerCellClass: $scope.highlightFilteredHeader
                    },
                    { field: 'action', enableSorting: false, cellTemplate: '<div ui-view="_action"></div>', enableFiltering: false, width: '100' }
                ],
                exporterFieldCallback: function(grid, row, col, input) {
                    if (col.field == 'status') {
                        return input == '1' ? 'Active' : 'Inactive';
                    }
                    return input;
                },
                exporterSuppressColumns: [ 'action' ],
            };
            $scope.drawGrid();
        }

        $scope.export = function(format) {

            var limit = $scope.pagination.totalItems;
            var data = { 'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection }
            var result = adminService.getAllCityList(data);
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
            var result = adminService.getAllCityList(data);
            result.then(
                function(response) {
                    $scope.pagination.totalItems = response.result.totalRecords[0].count;
                    $scope.gridOptions.data = response.result.records;
                    paginationFactory.getTableHeight($scope);
                },
                function(error) {
                    console.log("Error: " + error);
                }).then(()=>$('select.ui-grid-filter-select').each(function (i, j) {
                    $(this).find('option:first').text('Show All');
                }));;;
        }

        //Default Load
        $scope.getGridData();

        if ($state.is('admin.addCity') || $state.is('admin.editCity')) {
            adminService.getCountryList().then(function(response) {
                if (response.success) {
                    vm.CountryList = response.data;
                }
            });
        }

        vm.getStatesByCountryId = function() {
            var data = { id: vm.country.id };
            adminService.getStatesByCountryId(data).then(function(response) {
                if (response.success) {
                    vm.StateList = response.data;
                }
            });
        };

        vm.add = function() {
            if (vm.form.$valid) {
                var data = {
                    "country_id": vm.country.id,
                    "state_id": vm.state.id,
                    "city_name": vm.city_name,
                    "status": vm.status.id,
                }
                adminService.addCity(data).then(function(response) {
                    if (response.success) {
                        $state.go('admin.cityList')
                        toastr.success(response.message);

                    } else {
                        toastr.error(response.message);

                    }
                }, function(err) {
                    toastr.error('Something went wrong');

                });
            }
        };

        if ($state.is('admin.editCity')) {
            vm.pageHeading = "Edit";
            var id = $stateParams.id;
            adminService.editCity({ id: id }).then(function(response) {
                adminService.getStatesByCountryId({ id: response.data[0].country_id }).then(function(response) {
                    if (response.success) {
                        vm.StateList = response.data;
                    }
                });

                if (response.success) {
                    vm.city_name = response.data[0].name;
                    vm.state = { id: response.data[0].state_id };
                    vm.country = { id: response.data[0].country_id };
                    vm.status = { id: response.data[0].status };
                    vm.id = response.data[0].id;
                }
            });
        }

        vm.update = function() {
            if (vm.form.$valid) {
                var data = {
                    "id": vm.id,
                    "country_id": vm.country.id,
                    "state_id": vm.state.id,
                    "city_name": vm.city_name,
                    "status": vm.status.id
                }

                adminService.updateCity(data).then(function(response) {
                    if (response.success) {
                        $state.go('admin.cityList')
                        toastr.success(response.message);

                    } else {
                        toastr.error(response.message);

                    }
                }, function(err) {
                    toastr.error('Something went wrong');

                });
            }
        };

        vm.deleteRecord = function(row) {
            if (!$window.confirm("Are you sure you want to delete this record ?")) {
                return false;
            }
            var param = { id: row.entity.id };
            adminService.deleteCity(param).then(function(response) {
                if (response.success) {
                    $scope.drawGrid();
                    //                    var index = $scope.gridOptions.data.indexOf(row.entity);
                    //                    $scope.gridOptions.data.splice(index, 1);
                    toastr.success(response.message);

                } else {
                    toastr.error(response.message);

                }
            }, function(err) {
                toastr.error('Something went wrong');

            });
        };

        vm.cancel = function() {
            $state.go('admin.cityList');
        }
        //Selected Call
        $scope.GetByID = function(model) {
            $scope.SelectedRow = model;
        };
    }
]);
