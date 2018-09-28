app.controller('customerReportCtrl',['$rootScope','$scope','$window','adminService','$state', 'toastr', 'paginationFactory', '$stateParams',
            'uiGridConstants','dashboardService',  'STATUS', '$filter', 'Email_Verify', 'KYC_STATUS', '$timeout', function ($rootScope, $scope,
                $window, adminService, $state, toastr, paginationFactory, $stateParams, uiGridConstants, dashboardService,
                STATUS, $filter,Email_Verify,KYC_STATUS, $timeout) {

               var vm = this;
                vm.pageHeading = "Add";
                $scope.gridOptions = [];

                vm.Status = STATUS;
                var searchParams = [];
                $scope.orderCoulmn = '';
                $scope.orderDirection = '';
                vm.customer = [];
                vm.pair = []
                vm.customer.push({ 'name': 'All customer', 'id': '' });
                vm.statusType = KYC_STATUS;
                vm.filter = {};
                vm.filter.trade = {};
                vm.filter.txn = {};
                vm.filter.pair = {};
                vm.filter.status = {};
                vm.filter.customer = {};
                vm.transaction = {};
                vm.dateOptions = {
                 maxDate: new Date(),
                 //minDate: new Date(),
                 startingDay: 1,
                 showWeeks: false
                };


                vm.filter.status.selected = { 'name': 'All KYC Status', 'id': '' };
                vm.filter.customer.selected = { 'name': 'All customer', 'id': '' };

                vm.showToDateError = false;
                vm.showFromDateError = false;
                vm.showDateError = false;

                vm.transactionFilter = function(){
                    var array = [];

                     if ((angular.isUndefined(vm.transaction.toDate) && angular.isUndefined(vm.transaction.fromDate)) || (vm.transaction.toDate == null && vm.transaction.fromDate == null)) {
                    
                        console.log("vm.filtervm.filter", vm.filter);
                     array.push({

                        'kyc_status': vm.filter.status.selected.value,
                         'customer_id':vm.filter.customer.selected.id,
                         //'date_to': moment(new Date(vm.finance.toDate).getTime()).format("YYYY-MM-DD HH:mm:ss"),
                         // 'date_from': moment(new Date(vm.finance.fromDate).getTime()).format("YYYY-MM-DD HH:mm:ss")
                     });
                     searchParams = array[0];
                     $scope.drawGrid();

                 } else {
                     var isDateValid = false;
                     if (vm.transaction.fromDate) {
                         if (vm.transaction.toDate) {
                             //  isDateValid = true;
                             if (vm.transaction.fromDate <= vm.transaction.toDate) isDateValid = true;
                             else {
                                 isDateValid = false;
                                 vm.showDateError = true;
                             }
                         } else {
                             vm.showToDateError = true;
                             isDateValid = false;
                         }
                     } else if (vm.transaction.toDate) {
                         if (vm.transaction.fromDate) {
                             if (vm.transaction.fromDate <= vm.transaction.toDate) isDateValid = true;
                             else {
                                 isDateValid = false;
                                 vm.showDateError = true;
                             }
                         } else {
                             vm.showFromDateError = true;
                             isDateValid = false;
                         }
                     }

                     if (isDateValid) {
                         vm.showDateError = false;
                         array.push({
                             'kyc_status': vm.filter.status.selected.value,
                             'customer_id':vm.filter.customer.selected.id,
                             'date_to': moment(new Date(vm.transaction.toDate).getTime()).add(86340, 's').format("YYYY-MM-DD HH:mm:ss"),
                             'date_from': moment(new Date(vm.transaction.fromDate).getTime()).format("YYYY-MM-DD HH:mm:ss")
                         });

                         searchParams = array[0];
                         $scope.drawGrid();

                     }
                 }
                }

               vm.clearFilters = function() {
                 vm.filter.status.selected = { 'name': 'All KYC Status', 'id': '' };
                 vm.filter.customer.selected = { 'name': 'All customer', 'value': '' };
                 searchParams = undefined;
                 vm.transaction = {};
                 $scope.drawGrid();
             }

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
                        enableGridMenu: false,
                        enableColumnMenus: false,
                        enableColumnResizing: true,
                        exporterCsvFilename: 'Customer_report.csv',
                        exporterMenuPdf: false,
                        exporterMenuCsv: false,
                       // editableCellTemplate: "<div><form name=\"inputForm\"><input type=\"INPUT_TYPE\" ng-class=\"'colt' + col.uid\" ui-grid-editor ng-model=\"MODEL_COL_FIELD\" min=\"0\"></form></div>",
                        onRegisterApi: function (gridApi) {
                            $scope.gridApi = gridApi;
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
                            {field: 'serial_number', name: 'S.No.', width:'5%', enableCellEdit: false, enableFiltering: false, enableSorting: false,headerCellClass:'text-center',cellClass:'text-center'},
                            {field: 'fullname', name: 'Name', enableCellEdit: false, width: '20%', filter: {
                                    placeholder: 'Search..'
                                }},
                            {field: 'email', enableCellEdit: false, filter: {
                                    placeholder: 'Search..'
                                },headerCellClass:'text-right',cellClass:'text-left',width:'20%'},

                            {field: 'emailVerify', name: 'Email Status',  enableCellEdit: false, width:'20%', filter: {
                                type: uiGridConstants.filter.SELECT,
                                selectOptions: Email_Verify
                                },headerCellClass:'text-right',cellClass:'text-right',  cellFilter: 'emailVerificationStatus', width: 100},
                            {field: 'kyc_status', name: 'KYC Status', displayName: 'KYC Status', enableCellEdit: false, width: '18%',  filter: {
                                type: uiGridConstants.filter.SELECT,
                                selectOptions: KYC_STATUS
                                },headerCellClass:'text-right',cellFilter: 'kycStatusAdmin',cellClass:'text-right'},
                            {field: 'created_at', name:'Date', type: 'date', width: '16%', filter: {
                                    placeholder: 'Search..'
                                },headerCellClass:'text-right',cellClass:'text-right'},
                                {
                            field: 'status',
                            filter: {
                                type: uiGridConstants.filter.SELECT,
                                selectOptions: STATUS
                            },
                            cellFilter: 'mapStatus',
                            width:'11%',
                            headerCellClass: $scope.highlightFilteredHeader
                        }

                        ]
                        ,
                        exporterFieldCallback: function (grid, row, col, input) {
                           
                            if (col.field == 'status') {
                                return input == '1' ? 'Active' : 'Inactive';
                            }
                            if (col.field == 'kyc_status') {
                                 var $return = '';
                                 switch (input) {
                                    case 0:
                                        $return = 'Incomplete';
                                        break;
                                    case 1:
                                        $return = 'Pending';
                                        break;
                                    case 2:
                                        $return = 'Verified';
                                        break;
                                    case 3:
                                        $return = 'Not Verified';
                                        break;
                                    default:
                                        $return = ''
                                    }
                                    return $return;
                            }

                             if (col.field == 'emailVerify') {
                                return input == '1' ? 'Verified' : ' Not Verified';
                            }

                            return input;
                        },
                        exporterSuppressColumns: [ 'action' ],

                    };
                    $scope.drawGrid();
                }

                $scope.export = function (format) {
                    var limit = $scope.pagination.totalItems;
                    var data = {'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1}
                    var result = adminService.customerReportAdmin(data);
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
                    var result = adminService.customerReportAdmin(data);
                    result.then(
                            function (response) {
                                $scope.pagination.totalItems = response.result.totalRecords[0].count;
                                $scope.gridOptions.data = response.result.records;
                                 for(var i = 0; i < response.result.records.length; i++) {
                                        vm.customer.push({ 'name': response.result.records[i].fullname, 'id':response.result.records[i].id});
                                    }
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
            }]
        );
