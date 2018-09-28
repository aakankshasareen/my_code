admin.controller("userCtrl", ['$rootScope', '$scope', '$window', 'adminService', '$state', 'toastr', 'paginationFactory', '$stateParams', 'uiGridConstants', '$timeout',
    function ($rootScope, $scope, $window, adminService, $state, toastr, paginationFactory, $stateParams, uiGridConstants, $timeout) {

        var vm = this;
        vm.getUser = {};
        vm.setUser = {};
        vm.roleList = [];
        navigator.sayswho = (function () {
            var ua = navigator.userAgent,
                tem,
                M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                return 'IE ' + (tem[1] || '');
            }
            if (M[1] === 'Chrome') {
                tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
                if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
            return M.join(' ');
        })();

        if (vm.setUser.device_ipAddress == undefined || vm.getUser.device_ipAddress == undefined) {
            $.getJSON('https://api.ipify.org?format=json', function (data) {
                sessionStorage.setItem("myIP", data.ip);
            });
        }

        // for other controllers
        sessionStorage.setItem('myBrowser', navigator.sayswho);
        sessionStorage.setItem('myOS', $window.navigator.platform);
        sessionStorage.setItem('myDevice', "Desktop");

        vm.device_os = $window.navigator.platform;
        vm.device_browser = navigator.sayswho;
        vm.device_name = "Desktop";


        vm.pageHeading = "Add";
        vm.Status = [{ id: '1', 'name': 'Active' }, { id: '0', 'name': 'Inactive' }];
        $scope.gridOptions = [];
        var searchParams = [];

        $scope.orderCoulmn = '';
        $scope.orderDirection = '';

        vm.device_os = sessionStorage.getItem('myOS');
        vm.device_browser = sessionStorage.getItem('myBrowser');
        vm.device_name = sessionStorage.getItem('myDevice');

        // Set the default value of inputType
        vm.inputType = 'password';
        vm.showPassword = false;

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
                exporterCsvFilename: 'users.csv',
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
                        field: 'fullname',
                        headerCellClass: 'text-left',
                        width: '*',
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'email',
                        name: 'email',
                        width: '*',
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'status',
                        headerCellClass: 'text-right',
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: [{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }]
                        },
                        cellFilter: 'mapStatus',
                        width: 150,
                        headerCellClass: $scope.highlightFilteredHeader
                    },
                    { field: 'action', enableSorting: false, cellTemplate: '<div ui-view="_action"></div>', enableFiltering: false, width: '100' }
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
            var data = { 'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection }
            var result = adminService.getAllAdminUserList(data);
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
            var result = adminService.getAllAdminUserList(data);
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

        //Default Load
        $scope.getGridData();

        vm.add = function () {
            if (vm.registrationForm.$valid) {
                var data = {
                    "roles_name": vm.role_name,
                    "roles_description": vm.role_descripotion,
                    "is_active": vm.is_active.id,
                }
                adminService.addRole(data).then(function (response) {
                    if (response.success) {
                        $state.go('admin.adminUserList')
                        toastr.success(response.message);

                    } else {
                        toastr.error(response.message);

                    }
                }, function (err) {
                    toastr.error('Something went wrong');

                });
            };
        }

        if ($state.is('admin.editBackendUser')) {
            vm.pageHeading = "Edit";
            var id = $stateParams.id;
            vm.id = id;
            vm.inputType = 'text';
            vm.showPassword = true;
            adminService.editBackendUser({ id: id }).then(function (response) {
                if (response.success) {
                    vm.setUser.name = response.data[0].fullname;
                    vm.setUser.email = response.data[0].email;
                    vm.setUser.mobileNumber = response.data[0].mobileNumber;
                    vm.setUser.role_id = { id: response.data[0].role_id };
                    vm.setUser.status = { id: response.data[0].status };
                } else {
                    toastr.error('Something went wrong');

                }
            });
        }

        if ($state.is('admin.accessDenied')) {
            vm.pageHeading = "Access Denied";
        }

        // Hide & show password function
        vm.hideShowPassword = function () {
            if (vm.inputType == 'password') {
                vm.inputType = 'text';
                vm.showPassword = true;
            } else {
                vm.inputType = 'password';
                vm.showPassword = false;

            }
        };

        vm.update = function () {
            if (vm.registrationForm.$valid) {
                vm.setUser.role_id = vm.setUser.role_id.id;
                if (vm.setUser.password == undefined) {
                    vm.setUser.password = "";
                }
                vm.setUser.device_ipAddress = sessionStorage.getItem("myIP");
                vm.setUser.user_id = vm.id;
                $rootScope.showSpinner = true;
                vm.setUser.status = vm.setUser.status.id;
                adminService.updateAdminUser(vm.setUser).then(function (response) {
                    if (response.success) {
                        $state.go('admin.adminUserList')
                        toastr.success(response.message);

                    } else {
                        toastr.error(response.message);

                    }
                    $rootScope.showSpinner = false;

                }, function (err) {
                    toastr.error('Something went wrong');

                    $rootScope.showSpinner = false;
                });
            }
        };

        vm.register = function () {
            if (vm.registrationForm.$valid) {
                console.log(vm.setUser.status);
                vm.setUser.device_ipAddress = sessionStorage.getItem("myIP");
                vm.setUser.role_id = vm.setUser.role_id.id;
                vm.setUser.status = vm.setUser.status.id;


                console.log(vm.setUser.status);
                $rootScope.showSpinner = true;
                
                console.log(vm.setUser);
                adminService.registerAdminUser(vm.setUser).then(function (response) {
                    vm.setUser.role_id = { 'id': vm.setUser.role_id };
                    vm.setUser.status = { 'id': vm.setUser.status };

                    if (response.success) {
                        $state.go('admin.adminUserList');
                        toastr.success(response.message);
                    } else {
                        toastr.error(response.message);
                    }
                    $rootScope.showSpinner = false;
                }, function (err) {
                    toastr.error('Something went wrong. Please try again later.');
                    $rootScope.showSpinner = false;
                });
            }

        };

        if ($state.is('admin.addAdminUser') || $state.is('admin.editBackendUser')) {
            adminService.getRoleList().then(function (response) {
                if (response.success) {
                    vm.roleList = response.data;
                }
            });
        }

        vm.deleteRecord = function (row) {
            if (!$window.confirm("Are you sure you want to delete this record ?")) {
                return false;
            }
            var param = { id: row.entity.id };
            adminService.deleteAdminUser(param).then(function (response) {
                if (response.success) {
                    toastr.success(response.message);

                    $state.reload('admin.adminUserList')

                } else {
                    toastr.error(response.message);

                }
            }, function (err) {
                toastr.error('Something went wrong');

            });
        };
        vm.cancel = function () {
            $state.go('admin.adminUserList');
        }
    }
]);
