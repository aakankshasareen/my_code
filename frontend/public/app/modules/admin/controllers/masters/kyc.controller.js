admin.controller("kycCtrl", ['$rootScope', '$scope', '$window', 'adminService', '$state', 'toastr', 'paginationFactory', '$stateParams', 'uiGridConstants', '$timeout', 'KYC_MASTER_TYPE', 'STATUS', '$filter',
    function ($rootScope, $scope, $window, adminService, $state, toastr, paginationFactory, $stateParams, uiGridConstants, $timeout, KYC_MASTER_TYPE, STATUS, $filter) {

        var vm = this;
        vm.pageHeading = "Add";
        vm.Status = STATUS;
        $scope.gridOptions = [];
        var searchParams = [];

        $scope.orderCoulmn = '';
        $scope.orderDirection = '';


        if ($state.is('admin.addKYC') || $state.is('admin.editKYC')) {
            adminService.getCountryList().then(function (response) {
                if (response.success) {
                    vm.CountryList = response.data;
                }
            });
        }

        vm.kycMasterType = KYC_MASTER_TYPE;

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
                exporterCsvFilename: 'KycMaster.csv',
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
                        field: 'country_name',
                        headerCellClass: 'text-left',
                        width: '*',
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'name',
                        headerCellClass: 'text-left',
                        width: '*',
                        filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'type',
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: KYC_MASTER_TYPE
                        },
                        cellFilter: 'KycMasterType',
                        headerCellClass: $scope.highlightFilteredHeader
                    },
                    {
                        field: 'status',
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: STATUS
                        },
                        cellFilter: 'mapStatus',
                        width: 110,
                        headerCellClass: $scope.highlightFilteredHeader
                    },
                    { field: 'action', enableSorting: false, cellTemplate: '<div ui-view="_action"></div>', enableFiltering: false, width: '100' }
                ],
                exporterFieldCallback: function (grid, row, col, input) {

                    if (col.field == 'status') {
                        return input == '1' ? 'Active' : 'Inactive';
                    }
                    if (col.field == 'type') {
                        return input = $filter('KycMasterType')(input);

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
            var result = adminService.getAllKYCMasterList(data);
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
        $scope.getGridData();

        vm.add = function () {
            if (vm.form.$valid) {
                var data = {
                    "country_id": vm.country.id,
                    "type": vm.kyc_master_type.id,
                    "name": vm.name,
                    "icon_name": vm.icon_name,
                    "status": vm.status.id
                }
                adminService.addKYC(data).then(function (response) {
                    if (response.success) {
                        $state.go('admin.kycList')
                        toastr.success(response.message);

                    } else {
                        toastr.error(response.message);

                    }
                }, function (err) {
                    toastr.error('Something went wrong');

                });
            }
        };

        if ($state.is('admin.editKYC')) {
            vm.pageHeading = "Edit";
            var id = $stateParams.id;

            adminService.editKYC({ id: id }).then(function (response) {
                if (response.success) {
                    //                    console.log(response);
                    vm.country = { id: response.data[0].country_id };
                    vm.name = response.data[0].name;
                    vm.kyc_master_type = { id: response.data[0].type };
                    vm.icon_name = response.data[0].icon_name;
                    vm.status = { id: response.data[0].status };
                    vm.id = response.data[0].id;
                }
            });
        }

        vm.update = function () {
            if (vm.form.$valid) {
                var data = {
                    "id": vm.id,
                    "country_id": vm.country.id,
                    "type": vm.kyc_master_type.id,
                    "name": vm.name,
                    "icon_name": vm.icon_name,
                    "status": vm.status.id
                }
                console.log(data);
                adminService.updateKYC(data).then(function (response) {
                    if (response.success) {
                        $state.go('admin.kycList')
                        toastr.success(response.message);

                    } else {
                        toastr.error(response.message);

                    }
                }, function (err) {
                    toastr.error('Something went wrong');

                });
            }
        };

        vm.deleteRecord = function (row) {
            if (!$window.confirm("Are you sure you want to delete this record ?")) {
                return false;
            }
            var param = { id: row.entity.id };
            adminService.deleteCountry(param).then(function (response) {
                if (response.success) {
                    //                    var index = $scope.gridOptions.data.indexOf(row.entity);
                    //                    $scope.gridOptions.data.splice(index, 1);
                    toastr.success(response.message);

                    $state.reload('admin.kycList')

                } else {
                    toastr.error(response.message);

                }
            }, function (err) {
                toastr.error('Something went wrong');

            });
        };
        vm.cancel = function () {
            $state.go('admin.kycList');
        };
    }
])
