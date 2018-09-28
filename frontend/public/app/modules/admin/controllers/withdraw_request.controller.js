admin.controller("withdrawRequestCtrl", ['$rootScope', '$scope', '$window', 'adminService', 'dashboardService', '$state', 'toastr', 'paginationFactory', '$stateParams', 'uiGridConstants', '$timeout', '$filter','CURRENCY_TYPE',
    function ($rootScope, $scope, $window, adminService, dashboardService, $state, toastr, paginationFactory, $stateParams, uiGridConstants, $timeout, $filter,CURRENCY_TYPE) {

        var vm = this;
        vm.pageHeading = "Add";
        vm.Status = [{ id: '2', 'name': 'Not Approved' }, { id: '1', 'name': 'Approved' }, { id: '0', 'name': 'Pending' }];
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
                exporterCsvFilename: 'withdraw_request.csv',
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
                    { field: 'serial_number', name: 'S.No.', headerCellClass: 'text-center', enableSorting: false, enableFiltering: false, width: '60', enableCellEdit: false, headerCellClass: 'text-center', cellClass: 'text-center' },
                    {
                        field: 'customer_name',
                        name:'Name',
                        headerCellClass: 'text-left',
                        width: '110',
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
                        width: '75',
                        enableCellEdit: false,
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'currency_type',      
                        name:'Type',                                       
                        headerCellClass: 'text-left',
                        width: '100',                       
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: CURRENCY_TYPE
                        },
                        cellFilter:'mapCurrencyType'
                    },
                    {
                        field: 'amount',
                        headerCellClass: 'text-left',
                        width: '100',
                        enableCellEdit: false,
                        filter: {
                         
                            placeholder: 'Search...'
                        }, headerCellClass: 'text-right', cellClass: 'text-right'
                    },
                    {
                        field: 'reference_number',
                        width: '130',
                        filter: {
                            placeholder: 'Search...'
                        }
                      
                    },
                    {
                        field: 'created_at',
                        headerCellClass: 'text-left',
                        width: '140',
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{row.entity.created_at | adminDateFilter }}</div>',
                        enableFiltering: false,
                        enableSorting: false,
                        enableCellEdit: false,
                        // filter: {
                        //     placeholder: 'Search...'
                        // },
                        headerCellClass: 'text-center', cellClass: 'text-center'
                    },
                    {
                        field: 'status',
                        name: 'Status *',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        cellFilter: 'mapWithdrawStatusAdmin',
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
                exporterFieldCallback: function (grid, row, col, input) {
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

        var cellEditable = function ($scope) {
            if ($scope.row.entity.status == 0)
                return true;
            return false;
        }

        $scope.export = function (format) {

            var limit = $scope.pagination.totalItems;
            var data = { 'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection }
            var result = adminService.getAllWithdrawRequestList(data);
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
            var result = adminService.getAllWithdrawRequestList(data);
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
                }));;;
        }

        //Default Load
        if ($state.is('admin.withdrawRequest')) {
            $scope.getGridData();
        }

        if ($state.is('admin.editWithdrawRequest')) {
            var id = $stateParams.id;
            var param = { id: id };

            adminService.getWithdrawRequestById(param).then(function (response) {
                console.log(response);
                vm.id = id;
                vm.customer_id = response.data[0].customer_id;
                vm.user_id = response.data[0].user_id, // foreign key user table customer
                vm.customer_name = response.data[0].fullname;
                vm.currency_code = response.data[0].currency_code;
                vm.currency_type = response.data[0].type;
                vm.amount = response.data[0].amount;
                vm.platform_value = response.data[0].platform_value;
                vm.status = response.data[0].status;
                vm.old_status=response.data[0].status;
                vm.created_at = response.data[0].created_at;
                vm.comment = response.data[0].comment;
                vm.reference_number = response.data[0].reference_number;
                vm.old_reference_number = response.data[0].reference_number;
                vm.email = response.data[0].email;
                vm.kyc_status = response.data[0].kyc_status;
                vm.crypto_address = response.data[0].receiverAddress;
                vm.qrcode = response.data[0].qrcode;
                if(!vm.currency_type){
                  vm.bankDetails = response.data[0].bankDetails;
                }
            });
        }

        vm.approveWithdrawRequest = function () {
            console.log("fdwfdjywefdjwe")
             if (vm.withdrawForm.$valid) {
                var data = {
                    'id': vm.id,
                    'user_id': vm.user_id,
                    'customer_id': vm.customer_id,
                    'amount': vm.amount,
                    'comment': vm.comment,
                    'reference_number': vm.reference_number,
                    'currency_code': vm.currency_code,
                    //'old_status':vm.old_status,
                    'status': 1,
                    'device_ipAddress': sessionStorage.getItem('myIP'),
                    'device_os': sessionStorage.getItem('myOS'),
                    'device_name': sessionStorage.getItem('myDevice'),
                    'device_browser': sessionStorage.getItem('myBrowser')
                }
                console.log("old",vm.old_status)
                console.log(data);
                adminService.approveWithdrawRequest(data).then(function (response) {
                    if (response.success) {
                        toastr.success(response.message);
                        $state.go('admin.withdrawRequest');
                    } else {
                        toastr.error(response.message);
                    }
                });
            }
        }


        vm.disapproveWithdrawRequest = function () {
            if (vm.withdrawForm.$valid) {
                var data = {
                    'id': vm.id,
                    'user_id': vm.user_id,
                    'customer_id': vm.customer_id,
                    'refund_amount': vm.amount,
                    'platform_value': vm.platform_value,
                    'comment': vm.comment,
                    'reference_number': vm.reference_number,
                    'currency_code': vm.currency_code,
                    //'old_status':vm.old_status,
                    'status': 2,
                    'device_ipAddress': sessionStorage.getItem('myIP'),
                    'device_os': sessionStorage.getItem('myOS'),
                    'device_name': sessionStorage.getItem('myDevice'),
                    'device_browser': sessionStorage.getItem('myBrowser')
                }
                console.log("old",vm.old_status)
                 console.log(data);
                adminService.disapproveWithdrawRequest(data).then(function (response) {
                    if (response.success) {
                        toastr.success(response.message);
                        $state.go('admin.withdrawRequest');
                    } else {
                        toastr.error(response.message);
                    }
                });
            }
        }

        vm.updateWithdrawRequest = function () {
            if (vm.withdrawForm.$valid) {
                var data = {
                    'id': vm.id,
                    'user_id': vm.user_id,
                    'email':vm.email,
                    'customer_id': vm.customer_id,
                    'comment': vm.comment,
                    'old_reference_number':vm.old_reference_number ,
                    'reference_number': vm.reference_number,
                    'currency_code': vm.currency_code,
                    'device_ipAddress': sessionStorage.getItem('myIP'),
                    'device_os': sessionStorage.getItem('myOS'),
                    'device_name': sessionStorage.getItem('myDevice'),
                    'device_browser': sessionStorage.getItem('myBrowser')
                }
                //console.log("old",vm.old_status)
                console.log("wdkhwkle")
                 console.log(data);
                 
                adminService.updateWithdrawRequest(data).then(function (response) {
                    if (response.success) {
                        toastr.success(response.message);
                        $state.go('admin.withdrawRequest');
                    } else {
                        toastr.error(response.message);
                    }
                });
            }
        }

        vm.cancel = function () {
            $state.go('admin.withdrawRequestList');
        }
    }
]);
