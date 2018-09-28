admin.controller("stateCtrl", ['$rootScope', '$scope', '$window', 'adminService', '$state', 'toastr', 'paginationFactory', '$stateParams', 'uiGridConstants', '$timeout',
    function($rootScope, $scope, $window, adminService, $state, toastr, paginationFactory, $stateParams, uiGridConstants, $timeout) {

        var vm = this;
        vm.pageHeading = "Add";
        //        $scope.gridOptions = [];
        vm.CountryList = [];

        vm.Status = [{ id: '1', 'name': 'Active' }, { id: '0', 'name': 'Inactive' }];

        $scope.gridOptions = [];
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
                        headerCellClass: 'text-left',
                        width: '*',
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
            var result = adminService.getAllStateList(data);
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
            var result = adminService.getAllStateList(data);
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

        adminService.getCountryList().then(function(response) {
            if (response.success) {
                vm.CountryList = response.data;
            }
        });

        vm.add = function() {
            if (vm.form.$valid) {
                var data = {
                    "country_id": vm.country.id,
                    "state_name": vm.state_name,
                    "status": vm.status.id,
                }
                adminService.addState(data).then(function(response) {
                    if (response.success) {
                        $state.go('admin.stateList')
                        toastr.success(response.message);

                    } else {
                        toastr.error(response.message);

                    }
                }, function(err) {
                    toastr.error('Something went wrong');

                });
            }
        };

        if ($state.is('admin.editState')) {
            vm.pageHeading = "Edit";
            var id = $stateParams.id;
            adminService.editState({ id: id }).then(function(response) {
                if (response.success) {
                    vm.state_name = response.data[0].name;
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
                    "state_name": vm.state_name,
                    "status": vm.status.id,
                }

                adminService.updateState(data).then(function(response) {
                    if (response.success) {
                        $state.go('admin.stateList')
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
            adminService.deleteState(param).then(function(response) {
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
            $state.go('admin.stateList');
        }
    }
]);
