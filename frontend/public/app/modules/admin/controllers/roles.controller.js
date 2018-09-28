admin.controller("rolesCtrl", ['$rootScope', '$scope', '$window', 'adminService', '$state', 'toastr', 'paginationFactory', '$stateParams', 'uiGridConstants', '$timeout',
    function ($rootScope, $scope, $window, adminService, $state, toastr, paginationFactory, $stateParams, uiGridConstants, $timeout) {

        var vm = this;
        vm.pageHeading = "Add";
        vm.Status = [{ id: '1', 'name': 'Active' }, { id: '0', 'name': 'Inactive' }];
        $scope.gridOptions = [];
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
                exporterCsvFilename: 'Role.csv',
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
                                searchParams['order_column'] = value.field;
                                searchParams['order_direction'] = value.sort.direction;

                                $scope.orderCoulmn = value.field;
                                $scope.orderDirection = value.sort.direction;
                            }
                        });
                        $scope.drawGrid();

                    });
                },
                columnDefs: [
                    { field: 'serial_number', name: 'S.No.', headerCellClass: 'text-center', enableSorting: false, enableFiltering: false, width: '60', headerCellClass: 'text-center', cellClass: 'text-center' },
                    {
                        field: 'name', headerCellClass: 'text-left', width: '*', filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'description', name: 'Description', width: '*', filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'is_active', name: 'Status', filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: [{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }]
                        }, cellFilter: 'mapStatus', headerCellClass: $scope.highlightFilteredHeader, width: 150
                    },
                    { field: 'action', enableSorting: false, cellTemplate: '<div ui-view="_action"></div>', enableFiltering: false, width: '80' }
                ],
                exporterFieldCallback: function (grid, row, col, input) {
                    if (col.field == 'is_active') {
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
            var data = { 'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection }
            var result = adminService.getAllCountryList(data);
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
            var result = adminService.getAllRoleList(data);
            result.then(
                function (response) {
                    $scope.pagination.totalItems = response.result.totalRecords[0].count;
                    $scope.gridOptions.data = response.result.records;
                    paginationFactory.getTableHeight($scope);
                },
                function (error) {
                    console.log("Error: " + error);
                }).then(() => $('select.ui-grid-filter-select').each(function (i, j) {
                    $(this).find('option:first').text('Show All');
                }));;;
        }

        if ($state.is('admin.roleList')) {
            //Default Load
            $scope.getGridData();
        }

        vm.add = function () {
            if (vm.form.$valid) {
                var data = {
                    "roles_name": vm.role_name,
                    "roles_description": vm.role_description,
                    "is_active": vm.is_active.id,
                }
                adminService.addRole(data).then(function (response) {
                    if (response.success) {
                        $state.go('admin.roleList')
                        toastr.success(response.message);

                    } else {
                        toastr.error(response.message);

                    }
                }, function (err) {
                    toastr.error('Something went wrong');

                });
            };
        }

        if ($state.is('admin.editRole')) {
            vm.pageHeading = "Edit";
            var id = $stateParams.id;
            adminService.editRole({ id: id }).then(function (response) {
                if (response.success) {
                    vm.role_name = response.data[0].name;
                    vm.role_description = response.data[0].description;
                    vm.is_active = { id: response.data[0].is_active };
                    vm.id = response.data[0].id;
                }
            });
        }

        if ($state.is('admin.accessDenied')) {
            vm.pageHeading = "Access Denied";
        }

        vm.update = function () {
            if (vm.form.$valid) {
                var data = {
                    "id": vm.id,
                    "roles_name": vm.role_name,
                    "roles_description": vm.role_description,
                    "is_active": vm.is_active.id,
                }

                adminService.updateRole(data).then(function (response) {
                    if (response.success) {
                        $state.go('admin.roleList')
                        toastr.success(response.message);

                    } else {
                        toastr.error(response.message);

                    }
                }, function (err) {
                    toastr.error('Something went wrong');

                });
            };
        };

        vm.deleteRecord = function (row) {
            if (!$window.confirm("Are you sure you want to delete this record ?")) {
                return false;
            }
            var param = { id: row.entity.id };
            adminService.deleteRole(param).then(function (response) {
                if (response.success) {
                    //                    var index = $scope.gridOptions.data.indexOf(row.entity);
                    //                    $scope.gridOptions.data.splice(index, 1);
                    toastr.success(response.message);

                    $state.reload('admin.roleList')

                } else {
                    toastr.error(response.message);

                }
            }, function (err) {
                toastr.error('Something went wrong');

            });
        };
        vm.cancel = function () {
            $state.go('admin.roleList');
        }
    }]);
