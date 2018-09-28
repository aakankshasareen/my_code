admin.controller("permissionsCtrl", ['$rootScope', '$scope', '$window', 'adminService', '$state', 'toastr', 'paginationFactory', '$stateParams', 'uiGridConstants', '$timeout',
    function ($rootScope, $scope, $window, adminService, $state, toastr, paginationFactory, $stateParams, uiGridConstants, $timeout) {

        var vm = this;
        vm.pageHeading = "Add";
        vm.Status = [{ id: '1', 'name': 'Active' }, { id: '0', 'name': 'Inactive' }];
        $scope.gridOptions = [];
        var searchParams = [];
        $scope.permissions = [];
        $scope.allPermissions = [];
        $scope.subItems = [];
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
                exporterCsvFilename: 'Permissions.csv',
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
                        field: 'is_active', enableSorting: false, name: 'Status', filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: [{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }]
                        }, cellFilter: 'mapCStatus', headerCellClass: $scope.highlightFilteredHeader, width: 150
                    },
                    { field: 'action', enableSorting: false, cellTemplate: '<div ui-view="_action"></div>', enableFiltering: false, width: '100' }
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
            var result = adminService.getAllRoleList(data);
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
                    console.log(error);
                }).then(() => $('select.ui-grid-filter-select').each(function (i, j) {
                    $(this).find('option:first').text('Show All');
                }));;;
        }

        if ($state.is('admin.rolePermissionList')) {
            //Default Load
            $scope.getGridData();
        }


        vm.assign = function () {
            var id = $stateParams.id;
            var data = {
                "permissions": vm.assign_permissions,
                "role_id": id,
            }
            adminService.addRolePermission(data).then(function (response) {
                if (response.success) {
                    $state.go('admin.rolePermissionList')
                    toastr.success(response.message);

                } else {
                    toastr.error(response.message);

                }
            }, function (err) {
                toastr.error('Something went wrong');

            });
        };

        if ($state.is('admin.assignPermission')) {
            vm.pageHeading = "Assign Permission";
            var id = $stateParams.id;
            adminService.getAllPermission({ id: id }).then(function (response) {
                if (response.success) {
                    response.records.permissions.sort(function (a, b) {
                        return a.order - b.order;
                    });
                    vm.permissions = response.records.permissions;
                    vm.permissions_has = response.records.permission_has;
                    vm.allPermissions = response.records.allpermissions;
                    vm.assign_permissions = vm.permissions_has;
                    vm.subItems = [];
                    vm.id = 1;

                    console.log(vm.subItems);
                }
            });
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

        vm.update = function () {
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

        vm.checkAll = function () {
            vm.assign_permissions = vm.allPermissions;
            console.log(vm.assign_permissions);
        };

        vm.uncheckAll = function () {
            vm.assign_permissions = [];
        };

        vm.cancel = function () {
            $state.go('admin.roleList');
        };


        vm.checkAllChildNodes = function (theObject) {
            var $this = $(theObject);
            var parentNodeId = $this[0].$parent.pm.id;
            // console.log(parentNodeId);
            var childrenArray = $this[0].$parent.pm.children;
            var childIdsArr = [];
            childrenArray.forEach(function (value, i) {
                childIdsArr.push(value.id);
                console.log(typeof value.children);
                if (value.children.length > 0) {
                    var childrenObject = value.children;
                    childrenObject.forEach(function (value, i) {
                        // var res = vm.getChildren(value);
                        // console.log("dd"+value.id);
                        childIdsArr.push(value.id);
                    });

                }
            });

            var checkboxProp = $this.prop('checked');
            childIdsArr = childIdsArr.concat(parentNodeId);
            if (checkboxProp) {
                vm.assign_permissions = vm.assign_permissions.concat(childIdsArr);
                // console.log(vm.assign_permissions);
            } else {
                vm.assign_permissions = vm.assign_permissions.filter(function (el) {
                    return childIdsArr.indexOf(el) < 0;
                });
                // console.log(vm.assign_permissions);
            }
            var parentNodeId1 = $this[0].$parent.pm.parent_permission_id;
            console.log(parentNodeId1);
            if (parentNodeId1 > 0) {
                vm.checkParentNode($this);
            }
        };

        vm.checkParentNode = function (theObject) {

            var $this = $(theObject);
            var currentNodeId = $this[0].$parent.pm.id;
            var parentNodeId = $this[0].$parent.pm.parent_permission_id;
            var checkboxProp = $this.prop('checked');
            var parentChildIdsArr = $this[0].$parent.$parent.subItems;
            var defaultId = '';
            var checkedChildNodes = [];

            parentChildIdsArr.forEach(function (value) {
                if (value.is_default == 1) {
                    defaultId = value.id;
                }
            });
            if (vm.assign_permissions.indexOf(defaultId) < 0 && currentNodeId !== defaultId) {
                vm.assign_permissions = vm.assign_permissions.concat(defaultId);
            }
            parentChildIdsArr = parentChildIdsArr.map(function (value, i) {
                return value.id
            });

            if (checkboxProp) {
                vm.assign_permissions = vm.assign_permissions.concat(currentNodeId);
                var index = vm.assign_permissions.indexOf(parentNodeId);

                if (index < 0) {
                    vm.assign_permissions = vm.assign_permissions.concat(parentNodeId);
                }

                checkedChildNodes = vm.assign_permissions.filter(function (el) {
                    console.log(parentChildIdsArr.indexOf(el));
                    return parentChildIdsArr.indexOf(el) > -1;
                });
                var superParentCheck = $this[0].$parent.$parent.$parent.$parent.$parent.$parent.$parent;
                if (superParentCheck.pm !== undefined) {
                    vm.assign_permissions = vm.assign_permissions.concat(superParentCheck.pm.id);
                }

            } else {
                checkedChildNodes = vm.assign_permissions.filter(function (el) {
                    return parentChildIdsArr.indexOf(el) > -1;
                });
                if (checkedChildNodes.length > 1 && defaultId == currentNodeId) {
                    $this[0].checked = true;
                    return false;
                } else {
                    var index = vm.assign_permissions.indexOf(currentNodeId);
                    vm.assign_permissions.splice(index, 1);
                }
            }
            checkedChildNodes = vm.assign_permissions.filter(function (el) {
                return parentChildIdsArr.indexOf(el) > -1;
            });
            if (checkedChildNodes.length > 0) {
                var index = vm.assign_permissions.indexOf(parentNodeId);
                if (index < 0) {
                    vm.assign_permissions = vm.assign_permissions.concat(parentNodeId);
                }
            } else {
                var index = vm.assign_permissions.indexOf(parentNodeId);
                vm.assign_permissions.splice(index, 1);
            }
        };
    }])
    .filter('mapCStatus', function () {
        return function (input) {
            return input == '1' ? 'Active' : 'Inactive';
        }
    })
