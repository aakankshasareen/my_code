app.controller('transactionCtrl',['$rootScope','$scope','$window','adminService','$state', 'toastr', 'paginationFactory', '$stateParams',
            'uiGridConstants','dashboardService',  'STATUS', '$filter','TRANSACTION_TYPE', 'TRADE_TYPE', 'STATUS_TYPE', '$timeout', function ($rootScope, $scope,
                $window, adminService, $state, toastr, paginationFactory, $stateParams, uiGridConstants, dashboardService,
                STATUS, $filter,TRANSACTION_TYPE, TRADE_TYPE, STATUS_TYPE, $timeout) {

               var vm = this;
                vm.pageHeading = "Add";
                $scope.gridOptions = [];

                vm.Status = STATUS;
                var searchParams = [];
                $scope.orderCoulmn = '';
                $scope.orderDirection = '';
                vm.customer = [];
                vm.pair = []
                adminService.transactionReportCustomerAdmin().then(function(response){
                    vm.customer.push({ 'name': 'All customer', 'id': '' });
                    var data = response.result;
                    for(var i = 0; i < data.length; i++) {
                      vm.customer.push({ 'name': data[i].fullname, 'id':data[i].id});
                    }
                })

                adminService.marketCurrencypairadmin().then(function(response){


                    vm.pair.push({'name': 'All Pairs', 'id': '' });
                    var data = response.result;
                    for(var i = 0; i < data.length; i++) {
                      vm.pair.push({'name': data[i].pair, 'id':data[i].id});
                    }
                })

                vm.txnType = TRANSACTION_TYPE;
                vm.tradeType = TRADE_TYPE;
                vm.statusType = STATUS_TYPE;

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

                vm.filter.trade.selected = { 'name': 'All Trade Types', 'value': '' };
                vm.filter.txn.selected = { 'name': 'All Transaction Types', 'value': '' };
                vm.filter.pair.selected = { 'name': 'All Pairs', 'id': '' }
                vm.filter.status.selected = { 'name': 'All Status', 'value': '' };
                vm.filter.customer.selected = { 'name': 'All customer', 'id': '' };

                vm.showToDateError = false;
                vm.showFromDateError = false;
                vm.showDateError = false;

                vm.transactionFilter = function(){
                    var array = [];

                     if ((angular.isUndefined(vm.transaction.toDate) && angular.isUndefined(vm.transaction.fromDate)) || (vm.transaction.toDate == null && vm.transaction.fromDate == null)) {
                     array.push({
                         'type': vm.filter.trade.selected.value,
                         'trade_type': vm.filter.txn.selected.value,
                         'pair_id': vm.filter.pair.selected.id,
                         'status': vm.filter.status.selected.value,
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
                             'type': vm.filter.trade.selected.value,
                             'trade_type': vm.filter.txn.selected.value,
                             'pair_id': vm.filter.pair.selected.id,
                             'status': vm.filter.status.selected.value,
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
                 vm.filter.trade.selected = { 'name': 'All Trade Types', 'value': '' };
                 vm.filter.txn.selected = { 'name': 'All Transaction Types', 'value': '' };
                 vm.filter.pair.selected = { 'name': 'All Pairs', 'id': '' }
                 vm.filter.status.selected = { 'name': 'All Statuses', 'value': '' };
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
                        enableGridMenu: true,
                        enableColumnMenus: false,
                        enableColumnResizing: true,
                        exporterCsvFilename: 'transaction.csv',
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
                            {field: 'serial_number', name: 'S.No.', width: '60', enableCellEdit: false, enableFiltering: false, enableSorting: false,headerCellClass:'text-center',cellClass:'text-center'},
                            {field: 'email', enableCellEdit: false, filter: {
                                    placeholder: 'Search..'
                                },width: 150},
                            {field: 'fullname', name: 'Name', enableCellEdit: false, width: 150, filter: {
                                    placeholder: 'Search..'
                                }},
                            {field: 'currency', name: 'Currency',  enableCellEdit: false, filter: {
                                    placeholder: 'Search..'
                                },headerCellClass:'text-right',cellClass:'text-right',width: 100},
                            {field: 'total_amount', name: 'Amount', enableCellEdit: false, width: 120, filter: {
                                    placeholder: 'Search..'
                                },headerCellClass:'text-right',cellClass:'text-right'},
                            {field: 'created_at', name:'Date', type: 'date', width: 150, filter: {
                                    placeholder: 'Search..'
                                },headerCellClass:'text-right',cellClass:'text-right'},
                                {field: 'status', name:'Status', width: 100, filter: {
                                    placeholder: 'Search..'
                                },headerCellClass:'text-right',cellClass:'text-right'},
                                {field: 'trade_type',  name:'type', type: 'date', width: 100, filter: {
                                    placeholder: 'Search..'
                                },headerCellClass:'text-right',cellClass:'text-right'},
                        ]
                        ,
                        exporterFieldCallback: function (grid, row, col, input) {
                            if (col.field == 'created_at') {
                                return $filter('date')(input, "dd-M-yyyy H:mm a");
                            }
                            if (col.name == 'Status') {
                                //return input = $filter('mapWithdrawStatus');
                                var $return = '';
                                 switch (input) {
                                      case 'Fully Executed':
                                          $return = 'Fully Executed';
                                              break;
                                      case 'Partially Executed':
                                          $return = 'Partially Executed';
                                      break;
                                      case 'Not Executed':
                                      $return = 'Not Executed';
                                  break;
  
                                      default:
  
                                  }
                                  return $return;
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
                    var result = adminService.transactionReportAdmin(data);
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
                    var result = adminService.transactionReportAdmin(data);
                    result.then(
                            function (response) {
                                $scope.pagination.totalItems = response.result.totalRecords[0].count;
                                console.log("response.result.recordsresponse.result.records");
                                console.log(response.result.records);
                                $scope.gridOptions.data = response.result.records;
                                paginationFactory.getTableHeight($scope);
                            },
                            function (error) {
                                console.log("Error: " + error);
                            }).then(()=>$('select.ui-grid-filter-select').each(function (i, j) {
                                $(this).find('option:first').text('Show All');
                            }));
                }
                //Default Load
                $scope.getGridData();
            }]
        );
