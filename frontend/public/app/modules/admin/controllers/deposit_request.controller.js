admin.controller("depositRequestCtrl", ['$rootScope', '$scope', '$window', 'adminService', 'dashboardService', '$state', 'toastr', 'paginationFactory', '$stateParams', 'uiGridConstants', '$timeout', '$filter',
    function($rootScope, $scope, $window, adminService, dashboardService, $state, toastr, paginationFactory, $stateParams, uiGridConstants, $timeout, $filter) {

        var vm = this;
        vm.pageHeading = "Add";
        vm.Status = [{ id: '2', 'name': 'Not Approved' }, { id: '1', 'name': 'Approved' }, { id: '0', 'name': 'Pending' }];
        $scope.gridOptions = [];
        var searchParams = [];

        $scope.orderCoulmn = '';
        $scope.orderDirection = '';
        $scope.token = sessionStorage.getItem('globals');

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
                exporterCsvFilename: 'deposit_request.csv',
                exporterMenuPdf: false,
                exporterMenuCsv: false,
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;

                    // gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                    //     if (newValue == oldValue) {
                    //         return false;
                    //     }
                    //     var prompt_text = '';
                    //     if (colDef.field == 'comment') {
                    //         prompt_text = newValue;
                    //     }

                    //     var remark = $window.prompt("Are you sure ? You want to update status. Enter Remark below", prompt_text);
                    //     if (remark == null) {
                    //         rowEntity[colDef.field] = oldValue;
                    //         return false;
                    //     } else {
                    //         rowEntity['comment'] = remark;


                    //         var updateParam = {
                    //             'id': rowEntity.id,
                    //             user_id: rowEntity.user_id,
                    //             customer_id: rowEntity.customer_id,
                    //             'status': newValue,
                    //             'comment': remark,
                    //             'amount': rowEntity.amount,
                    //             'currency_code': rowEntity.currency_code,
                    //             'device_ipAddress': sessionStorage.getItem('myIP'),
                    //             'device_os': sessionStorage.getItem('myOS'),
                    //             'device_name': sessionStorage.getItem('myDevice'),
                    //             'device_browser': sessionStorage.getItem('myBrowser')
                    //         }

                    //         var disParam = {
                    //             'amount': rowEntity.amount,
                    //             customer_id: rowEntity.customer_id,
                    //             user_id: rowEntity.user_id,
                    //             refund_amount: rowEntity.refund_amount,
                    //             currency_code: rowEntity.currency_code,
                    //             'device_ipAddress': sessionStorage.getItem('myIP'),
                    //             'device_os': sessionStorage.getItem('myOS'),
                    //             'device_name': sessionStorage.getItem('myDevice'),
                    //             'device_browser': sessionStorage.getItem('myBrowser')
                    //         }

                    //         adminService.approveDepositRequest(updateParam).then(function (response) {
                    //             if (response.success) {

                    //                 if (rowEntity['status'] == 2) {
                    //                     adminService.disapproveDepositRequest(disParam).then(function (response) {
                    //                         if (response.success) {
                    //                             toastr.success(response.message);

                    //                         } else {
                    //                             toastr.error(response.message);

                    //                         }
                    //                     });
                    //                 } else {
                    //                     toastr.success(response.message);

                    //                 }
                    //             } else {
                    //                 toastr.error(response.message);

                    //                 rowEntity[colDef.field] = oldValue;
                    //             }
                    //         }, function (err) {
                    //             toastr.error( 'Something went wrong');

                    //         });
                    //     }
                    //     $scope.$apply();
                    // });

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
                    { field: 'serial_number', name: 'S.No.', headerCellClass: 'text-center', enableSorting: false, enableFiltering: false, width: '60', enableCellEdit: false, headerCellClass: 'text-center', cellClass: 'text-center' },
                    {
                        field: 'customer_name',
                        headerCellClass: 'text-left',
                        width: '120',
                        enableCellEdit: false,
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'email',
                        headerCellClass: 'text-left',
                        width: '150',
                        enableCellEdit: false,
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'currency_code',
                        name: 'Currency',
                        headerCellClass: 'text-left',
                        width: '*',
                        enableCellEdit: false,
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'amount',
                        headerCellClass: 'text-left',
                        width: '*',
                        enableCellEdit: false,
                        filter: {
                            placeholder: 'Search...'
                        },
                        headerCellClass: 'text-right',
                        cellClass: 'text-right'
                    },
                    {
                        field: 'created_at',
                        headerCellClass: 'text-left',
                        width: '150',
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{row.entity.created_at | adminDateFilter }}</div>',
                        enableFiltering: true,
                        enableSorting: false,
                        enableCellEdit: false,
                        filter: {
                            placeholder: 'Search...'
                        },
                        headerCellClass: 'text-center',
                        cellClass: 'text-center'
                    },
                    {
                        field: 'status',
                        name: 'Status *',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        cellFilter: 'mapDepositStatusAdmin',
                        editDropdownValueLabel: 'status',
                        editDropdownOptionsArray: [{ id: 2, 'status': 'Not Approved' }, { id: 1, 'status': 'Approved' }, { id: 0, 'status': 'Pending' }],
                        enableCellEdit: true,
                        width: 110,
                        cellEditableCondition: cellEditable,
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: [{ value: '2', label: 'Not Approved' }, { value: '1', label: 'Approved' }, { value: '0', label: 'Pending' }]
                        }
                    },

                    // {
                    //     field: 'comment',
                    //     name: 'Remark',
                    //     width: '100',
                    //     filter: {
                    //         placeholder: 'Search...'
                    //     }
                    // },
                    { field: 'action', enableSorting: false, enableFiltering: false, cellTemplate: '<div ui-view="_action"></div>', width: '70' }

                ],
                exporterFieldCallback: function(grid, row, col, input) {
                    if (col.field == 'created_at') {
                        return $filter('date')(input, "dd-M-yyyy H:mm a");
                    }
                    if (col.field == 'status') {
                        var $return = '';
                        switch (input) {
                            case 2:
                                $return = 'Not Approved';
                                break;
                            case 1:
                                $return = 'Approved';
                                break;
                            case 0:
                                $return = 'Pending';
                                break;
                            default:
                                $return = ''
                        }
                        return $return;
                    }
                    return input;
                },
                exporterSuppressColumns: ['action'],
            };

            $scope.drawGrid();
        }

        var cellEditable = function($scope) {
            if ($scope.row.entity.status == 0)
                return true;
            return false;
        }

        $scope.export = function(format) {

            var limit = $scope.pagination.totalItems;
            var data = { 'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection }
            var result = adminService.getAllDepositRequestList(data);
            result.then(
                function(response) {
                    $scope.gridOptions.data = response.result.records;
                    if (format == 'csv') {
                        $scope.gridApi.exporter.csvExport('all', 'all');
                    } else if (format == 'pdf') {
                        $scope.gridApi.exporter.pdfExport('all', 'all');
                    }
                }).then(function() {
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
            var result = adminService.getAllDepositRequestList(data);
            result.then(
                function(response) {
                    $scope.pagination.totalItems = response.result.totalRecords[0].count;
                    $scope.gridOptions.data = response.result.records;
                    paginationFactory.getTableHeight($scope);
                },
                function(error) {
                    console.log("Error: " + error);
                }).then(() => $('select.ui-grid-filter-select').each(function(i, j) {
                $(this).find('option:first').text('Show All');
            }));;;
        }

        //Default Load
        if ($state.is('admin.depositRequest')) {
            $scope.getGridData();
        }

        if ($state.is('admin.editDepositRequest')) {
            var id = $stateParams.id;
            var param = { id: id };

            adminService.getDepositRequestById(param).then(function(response) {
                console.log(response);
                vm.id = id;
                vm.customer_id = response.data[0].customer_id;
                vm.user_id = response.data[0].user_id, // foreign key user table customer
                    vm.customer_name = response.data[0].fullname;
                vm.currency_code = response.data[0].currency_code;
                vm.currency_type = response.data[0].type;
                vm.amount = response.data[0].amount;
                vm.status = response.data[0].status;
                vm.old_status = response.data[0].status;
                vm.created_at = response.data[0].created_at;
                vm.comment = response.data[0].comment;
                vm.reference_number = response.data[0].reference_number;
                vm.old_reference_number = response.data[0].reference_number;
                vm.email = response.data[0].email;
                if (response.data[0].document) {
                    vm.docName = response.data[0].document.split('/').pop();
                    vm.docUrl = response.data[0].document;
                }
            });
        }

        vm.approveDepositRequest = function() {
            if (vm.depositForm.$valid) {
                var data = {
                    'id': vm.id,
                    'user_id': vm.user_id,
                    'customer_id': vm.customer_id,
                    'amount': vm.amount,
                    'comment': vm.comment,
                    'reference_number': vm.reference_number,
                    'currency_code': vm.currency_code,
                    'status': 1,
                    'device_ipAddress': sessionStorage.getItem('myIP'),
                    'device_os': sessionStorage.getItem('myOS'),
                    'device_name': sessionStorage.getItem('myDevice'),
                    'device_browser': sessionStorage.getItem('myBrowser')
                }
                console.log("old", vm.old_status)
                // console.log(data);
                adminService.approveDepositRequest(data).then(function(response) {
                    if (response.success) {
                        toastr.success(response.message);
                        $state.go('admin.depositRequest');
                    } else {
                        toastr.error(response.message);
                    }
                });
            }
        }


        vm.disapproveDepositRequest = function() {
            if (vm.depositForm.$valid) {
                var data = {
                    'id': vm.id,
                    'user_id': vm.user_id,
                    'customer_id': vm.customer_id,
                    'refund_amount': vm.amount,
                    'comment': vm.comment,
                    'reference_number': vm.reference_number,
                    'currency_code': vm.currency_code,
                    'status': 2,
                    'device_ipAddress': sessionStorage.getItem('myIP'),
                    'device_os': sessionStorage.getItem('myOS'),
                    'device_name': sessionStorage.getItem('myDevice'),
                    'device_browser': sessionStorage.getItem('myBrowser')
                }
                console.log("old", vm.old_status)
                // console.log(data);
                adminService.disapproveDepositRequest(data).then(function(response) {
                    if (response.success) {
                        toastr.success(response.message);
                        $state.go('admin.depositRequest');
                    } else {
                        toastr.error(response.message);
                    }
                });
            }
        }

        vm.updateDepositRequest = function() {
            if (vm.depositForm.$valid) {
                var data = {
                    'id': vm.id,
                    'user_id': vm.user_id,
                    'email': vm.email,
                    'customer_id': vm.customer_id,
                    'comment': vm.comment,
                    'reference_number': vm.reference_number,
                    'old_reference_number': vm.old_reference_number,
                    'currency_code': vm.currency_code,
                    'device_ipAddress': sessionStorage.getItem('myIP'),
                    'device_os': sessionStorage.getItem('myOS'),
                    'device_name': sessionStorage.getItem('myDevice'),
                    'device_browser': sessionStorage.getItem('myBrowser')
                }
                console.log("old", vm.old_status)
                console.log("dede", data);
                adminService.updateDepositRequest(data).then(function(response) {
                    if (response.success) {
                        toastr.success(response.message);
                        $state.go('admin.depositRequest');
                    } else {
                        toastr.error(response.message);
                    }
                });

            }
        }

        vm.downloadDoc = function(url) {
            downloadForm.path.value = vm.docUrl;
            downloadForm.submit();
        }

        vm.cancel = function() {
            $state.go('admin.depositRequestList');
        }
    }
]);