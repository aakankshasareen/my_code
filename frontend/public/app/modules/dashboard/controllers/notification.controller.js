dashboard.controller("notificationController", ['$rootScope', '$scope', '$window', '$state','toastr','uiGridConstants','$stateParams', 'dashboardService','AuthService', '$interval', function($rootScope, $scope, $window, $state,toastr,uiGridConstants, $stateParams, dashboardService, AuthService, $interval) {

        
        var vm = this;

        // var data ={
        //     'limit':0,
        //     'offset':0
        // }
        vm.allNotifications=[];
        dashboardService.getAllCustomerNotificationList().then(function(response){

            console.log("notification Data", response);
            vm.allNotifications = response.result.records
        });
        // vm.pageHeading = "Add";
        // vm.Status = [{id: '1', 'name': 'Open'}, {id: '0', 'name': 'close'}];
        // $scope.gridOptions = [];
        // var searchParams = [];
        // vm.FaqCategoryList=[];
        // $scope.orderCoulmn = '';
        // $scope.orderDirection = '';
        // $scope.maindataArray = [];
        // var dataValueMain = "";
        // var maindata="";
        // $scope.page = 1;
        // var limit=0;
        // var offset=0;

        // //Pagination
        // $scope.pagination = {
        //     paginationPageSizes: [10, 25, 50, 100],
        //     ddlpageSize: 10,
        //     pageNumber: 1,
        //     pageSize: 10,
        //     totalItems: 0,
        //     filter_value: '',

        //     getTotalPages: function () {
        //         return Math.ceil(this.totalItems / this.pageSize);
        //     },
        //     pageSizeChange: function () {
        //         if (this.ddlpageSize == "All")
        //             this.pageSize = $scope.pagination.totalItems;
        //         else
        //             this.pageSize = this.ddlpageSize

        //         this.pageNumber = 1
        //         $scope.getGridData();
        //     },
        //     firstPage: function () {
        //         if (this.pageNumber > 1) {
        //             this.pageNumber = 1
        //             $scope.drawGrid();
        //         } else {
        //             this.pageNumber = 1
        //             $scope.drawGrid();
        //         }
        //     },
        //     nextPage: function () {
        //         if (this.pageNumber < this.getTotalPages()) {
        //             this.pageNumber++;
        //             $scope.drawGrid();
        //         } else {
        //             this.pageNumber = 1
        //             $scope.drawGrid();
        //         }
        //     },
        //     previousPage: function () {
        //         if (this.pageNumber > 1) {
        //             this.pageNumber--;
        //             $scope.drawGrid();
        //         } else {
        //             this.pageNumber = 1
        //             $scope.drawGrid();
        //         }
        //     },
        //     currentPage: function () {
        //         if (this.pageNumber > 1) {
        //             $scope.drawGrid();
        //         } else {
        //             $scope.drawGrid();
        //         }
        //     },
        //     lastPage: function () {
        //         if (this.pageNumber >= 1) {
        //             this.pageNumber = this.getTotalPages();
        //             $scope.drawGrid();
        //         } else {
        //             this.pageNumber = 1
        //             $scope.drawGrid();
        //         }
        //     }
        // };

   
        // //ui-Grid Call
        // $scope.getGridData = function () {
        //     $scope.gridOptions = {
        //         useExternalPagination: true,
        //         useExternalSorting: true,
        //         enableFiltering: true,
        //         enableSorting: true,
        //         enableRowSelection: false,
        //         enableSelectAll: false,
        //         enableGridMenu: false,
        //         enableColumnMenus: false,
        //         enableColumnResizing: true,
        //         exporterCsvFilename: 'faq.csv',
        //         exporterMenuPdf: false,
        //         exporterMenuCsv: false,
        //         onRegisterApi: function (gridApi) {
        //             $scope.gridApi = gridApi;
        //             $scope.gridApi.grid.clearAllFilters = function () {
        //                 this.columns.forEach(function (column) {
        //                     column.filters.forEach(function (filter) {
        //                         filter.term = undefined;
        //                     });
        //                 });
        //                 searchParams = undefined;
        //                 $scope.getGridData(); // your own custom callback
        //             };

        //             $scope.gridApi.core.on.filterChanged($scope, function () {
        //                 $scope.pagination.pageNumber = '1';
        //                 var grid = this.grid;
        //                 angular.forEach(grid.columns, function (value, key) {
        //                     searchParams[value.colDef.field] = value.filters[0].term;
        //                 });

        //                 $scope.drawGrid();
        //             });

        //             $scope.gridApi.core.on.sortChanged($scope, function (val) {
        //                 var grid = this.grid;
        //                 angular.forEach(grid.columns, function (value, key) {
        //                     if (value.sort.direction) {
        //                         searchParams['order_column'] = value.field;
        //                         searchParams['order_direction'] = value.sort.direction;

        //                         $scope.orderCoulmn = value.field;
        //                         $scope.orderDirection = value.sort.direction;
        //                     }
        //                 });
        //                 $scope.drawGrid();

        //             });
        //         },
        //         columnDefs: [
        //             {field: 'serial_number', name: 'S.No.', headerCellClass: 'text-center', enableSorting: false, enableFiltering: false, width: '8%'},
        //             {field: 'title', cellTemplate: '<a href= "{{row.entity.link}}">{{row.entity.title}}</a>', headerCellClass: 'text-left', width: '*'},
        //         ],
                
        //     };

        //     $scope.drawGrid();
        // }

        // $scope.export = function (format) {

        //     var limit = $scope.pagination.totalItems;
        //     var data = {'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection}
        //     var result = dashboardService.getAllCustomerNotificationList(data);
        //     result.then(
        //             function (response) {
        //                 $scope.gridOptions.data = response.result.records;
        //             });
        //     if (format == 'csv') {
        //         $scope.gridApi.exporter.csvExport('all', 'all');
        //         $scope.getGridData();
        //     } else if (format == 'pdf') {
        //         $timeout(function () {
        //             $scope.gridApi.exporter.pdfExport('all', 'all');
        //             $scope.getGridData();
        //         }, 100);
        //     }
        // };

        // $scope.drawGrid = function () {
        //     var data = [];
        //     var NextPage = (($scope.pagination.pageNumber - 1) * $scope.pagination.pageSize);
        //     var NextPageSize = $scope.pagination.pageSize;

        //     var object1 = {'limit': NextPageSize, 'offset': NextPage}
        //     var object2 = searchParams;
        //     var data = angular.merge({}, object1, object2);
        //     var result = dashboardService.getAllCustomerNotificationList(data);
        //     result.then(
        //             function (response) {
        //                 $scope.pagination.totalItems = response.result.totalRecords[0].count;
        //                 $scope.gridOptions.data = response.result.records;
        //                 console.log(JSON.stringify(response.result.records));
        //             },
        //             function (error) {
        //                 console.log("Error: " + error);
        //             });
        // }
        // //Default Load
        // $scope.getGridData();
        
    }])
    

      
