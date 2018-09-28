admin.controller("smsTemplateListCtrl", ['$rootScope', '$scope', '$window', 'adminService', '$state', 'toastr', 'paginationFactory', '$stateParams', 'Upload','uiGridConstants','$timeout',
    function ($rootScope, $scope, $window, adminService, $state, toastr, paginationFactory, $stateParams, Upload,uiGridConstants, $timeout) {

        var vm = this;

        vm.pageHeading = "Add";
        vm.Status = [{id: '1', 'name': 'Active'}, {id: '0', 'name': 'Inactive'}];
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
                exporterCsvFilename: 'sms_template.csv',
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
                    {field: 'serial_number', name: 'S.No.', headerCellClass: 'text-center', enableSorting: false, enableFiltering: false, width: '60',headerCellClass:'text-center',cellClass:'text-center'},
                    {field: 'template_name', headerCellClass: 'text-left', width: '*', filter: {
                            placeholder: 'Search...'
                        }},
                    {field: 'template_code', headerCellClass: 'text-left', name: 'Template Code', width: '*', filter: {
                            placeholder: 'Search...'
                        }},
                    {field: 'status', filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: [{value: '1', label: 'Active'}, {value: '0', label: 'Inactive'}]
                        }, cellFilter: 'mapStatus', headerCellClass: $scope.highlightFilteredHeader,width:150},
                    {field: 'action', enableSorting: false, cellTemplate: '<div ui-view="_action"></div>', enableFiltering: false, width: '100'}
                ],
                exporterFieldCallback: function (grid, row, col, input) {
                    if (col.field == 'status') {
                        return input == '1' ? 'Active' : 'Inactive';
                    }
                    return input;
                },
                exporterSuppressColumns: [ 'action' ],
            };

            $scope.drawGrid();
        }

        $scope.export = function (format) {

            var limit = $scope.pagination.totalItems;
            var data = {'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection}
            var result = adminService.getSmsTemplateList(data);
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
            var result = adminService.getSmsTemplateList(data);
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

    }])

    .filter('mapCStatus', function () {
            return function (input) {
                return input == '1' ? 'Active' : 'Inactive';
            }
        }).controller("editSmsTemplateCtrl", ['$rootScope', '$scope', '$window', 'adminService', '$state', 'toastr', 'paginationFactory', '$stateParams', 'Upload','uiGridConstants','$timeout',
            function ($rootScope, $scope, $window, adminService, $state, toastr, paginationFactory, $stateParams, Upload,uiGridConstants, $timeout) {
              let vm = this;
              vm.template = {}
              vm.pageHeading = 'Add';
              vm.Status = [{id: 1, 'name': 'Active'}, {id: 0, 'name': 'Inactive'}];

              vm.add = function(){
                if(vm.form.$valid){
                  vm.template.status = vm.status.id;
                  adminService.addSmsTemplate(vm.template).then(function(response){
                    if(response.success){
                      toastr.success('New SMS Template Added');
                      $state.go('admin.SmsTemplateList');
                    } else {
                      toastr.error(response.message);
                    }
                  }).catch(function(err){
                    toastr.error('Error while adding template')
                  })
                }
              }

              vm.cancel = function (){
                $state.go('admin.SmsTemplateList')
              }

              if($state.is('admin.editSmsTemplate')){
                vm.pageHeading = 'Edit';
                if(!Number($stateParams.id)){
                  $state.go('admin.SmsTemplateList');
                  return;
                }
                vm.template.id = $stateParams.id;
                adminService.getSmsTemplateById($stateParams.id).then(function(response){
                  if(response.success){
                    vm.template = response.data;
                    vm.status = {id: response.data.status};
                  } else {
                    toastr.error('Error While Fetching Template Data');
                    $state.go('admin.SmsTemplateList');
                  }
                }).catch(function(err){
                  toastr.error('Error While Fetching Template Data');
                  $state.go('admin.SmsTemplateList');
                })

                vm.update = function(){
                  if(vm.form.$valid){
                    vm.template.status = vm.status.id;
                    adminService.updateSmsTemplate(vm.template).then(function(response){
                      if(response.success){
                        toastr.success('Template Updated');
                        $state.go('admin.SmsTemplateList');
                      } else {
                        toastr.error(response.message);
                      }
                    }).catch(function(err){
                      toastr.error('Error While Updating Template Data')
                    });
                  }
                }
              }
            }])
