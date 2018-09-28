admin.controller("feeReportFiatCtrl",  ['$rootScope', '$scope', '$window', 'adminService', '$state', 'toastr', '$stateParams', 'paginationFactory', 'uiGridConstants', 'dashboardService', 'KYC_STATUS', 'STATUS', '$timeout', '$filter', 'IMAGE_TYPE', '$httpParamSerializer', 'ID_TYPE', 'ADDRESS_TYPE', '$interval', '$location',
function ($rootScope, $scope, $window, adminService, $state, toastr, $stateParams, paginationFactory, uiGridConstants, dashboardService, KYC_STATUS, STATUS, $timeout, $filter, IMAGE_TYPE, $httpParamSerializer, ID_TYPE, ADDRESS_TYPE, $interval, $location) {
      var vm = this;
      $scope.orderCoulmn = '';
      $scope.orderDirection = '';
      $scope.gridOptions = [];
      var searchParams = [];
      //ui-Grid Call
        /******USD Fee Details start here******/
         $scope.paginationusd = {
            paginationPageSizes: [10, 25, 50, 100],
            ddlpageSize: 100,
            pageNumber: 1,
            pageSize: 100,
            totalItems: 0,
            filter_value: '',

            getTotalPages: function() {
                return Math.ceil(this.totalItems / this.pageSize);
            },
            pageSizeChange: function() {
                if (this.ddlpageSize == "All")
                    this.pageSize = $scope.paginationusd.totalItems;
                else
                    this.pageSize = this.ddlpageSize

                this.pageNumber = 1
                $scope.getGridData();
            },
            firstPage: function() {
                if (this.pageNumber > 1) {
                    this.pageNumber = 1
                    $scope.drawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawGrid();
                }
            },
            nextPage: function() {
                if (this.pageNumber < this.getTotalPages()) {
                    this.pageNumber++;
                    $scope.drawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawGrid();
                }
            },
            previousPage: function() {
                if (this.pageNumber > 1) {
                    this.pageNumber--;
                    $scope.drawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawGrid();
                }
            },
            currentPage: function() {
                if (this.pageNumber > 1) {
                    $scope.drawGrid();
                } else {
                    $scope.drawGrid();
                }
            },
            lastPage: function() {
                if (this.pageNumber >= 1) {
                    this.pageNumber = this.getTotalPages();
                    $scope.drawGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawGrid();
                }
            }
        }

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
            exporterCsvFilename: 'feeReportUSDBook.csv',
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
                    $scope.paginationusd.pageNumber = '1';
                    var grid = this.grid;
                    angular.forEach(grid.columns, function (value, key) {
                        searchParams['currency_code'] ='USD'
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
                        }
                    });
                    $scope.drawGrid();
                });
            },
            columnDefs: [
                    { field: 'serial_number', name: 'S.No.', width: '50', enableFiltering: false, enableSorting: false, headerCellClass: 'text-center', cellClass: 'text-center' },
                    { field: 'transactionid', 
                    name: 'Order.No.',
                    filter: {
                            placeholder: 'Search...'
                        },
                    enableSorting: false,
                    enableFiltering: false,
                    },
                    {
                    field: 'operation',
                    name:'operation',
                  
                    filter: {
                            placeholder: 'Search...'
                        },
                    enableFiltering: false,
                    },
                    {
                    field: 'currency_code',
                    name: 'currency',
                    filter: {
                            placeholder: 'Search...'
                        },  
                    enableFiltering: false, 
                    },{
                    field: 'amount',
                    name: 'Amount',
                    cellFilter:'number:8',
                    filter: {
                        placeholder: 'Search...'
                        },
                    },
                    //{field: 'state_name'},
                    {
                    field: 'platform_value',
                    name: 'Fee',
                    enableSorting: true,
                    cellFilter:'number:8',
                    order_column: 'Y.member_email',
                    filter: {
                        placeholder: 'Search...'
                        },
                    },
                    {
                    field: 'created_at',
                    name:'Date',
                    filter: {
                        placeholder: 'Search...'
                    },
                    enableFiltering: false,
                     type: 'date',cellFilter: 'date:"dd-MM-yyyy  hh:mm a"'
                    }
            ],
        exporterFieldCallback: function (grid, row, col, input) {
             if (col.field == 'created_at') {
                        return $filter('date')(input, "dd-MM-yyyy HH:mm:a ");
                    }

                    if (col.field == 'platform_value') {
                        return input=row.entity.platform_value.toFixed(8);
                    }
            return input;
        },
        };
        $scope.drawGrid();
    }

    $scope.export = function (format) {
        var limit = $scope.paginationusd.totalItems;
        var data = { 'limit': limit, 'offset': 0,currency_code:'USD' , 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1 }
        var result = adminService.getAllFiatFeeDetails(data);
        result.then(
            function (response) {
                $scope.gridOptions.data = response.result.records;
            });
        if (format == 'csv') {
            $timeout(function () {
                $scope.gridApi.exporter.csvExport('all', 'all');
                $scope.drawGrid();
            }, 200)
        } else if (format == 'pdf') {
            $timeout(function () {
                $scope.gridApi.exporter.pdfExport('all', 'all');
                $scope.drawGrid();
            }, 200);
        }
    };

    $scope.drawGrid = function () {
        var data = [];
        var NextPage = (($scope.paginationusd.pageNumber - 1) * $scope.paginationusd.pageSize);
        var NextPageSize = $scope.paginationusd.pageSize;
        var object1 = { 'limit': NextPageSize, 'offset': NextPage,currency_code:'USD' }
        var object2 = searchParams;
        console.log(searchParams)
        var data = angular.merge({}, object1,object2);
        var result = adminService.getAllFiatFeeDetails(data);
          result.then(
            function (response) {
                $scope.paginationusd.totalItems = response.result.totalRecords[0].count;
                $scope.gridOptions.data = response.result.records;
                //paginationFactory.getTableHeight($scope);
            },
            function (error) {
                console.log("Error: " + error);
            });
    }

    //Default Load

    $scope.getGridData();

    /***SGD Fee Details start here***/

     $scope.paginationsgd = {
            paginationPageSizes: [10, 25, 50, 100],
            ddlpageSize: 100,
            pageNumber: 1,
            pageSize: 100,
            totalItems: 0,
            filter_value: '',

            getTotalPages: function() {
                return Math.ceil(this.totalItems / this.pageSize);
            },
            pageSizeChange: function() {
                if (this.ddlpageSize == "All")
                    this.pageSize = $scope.paginationsgd.totalItems;
                else
                    this.pageSize = this.ddlpageSize

                this.pageNumber = 1
                $scope.getSGDGridData();
            },
            firstPage: function() {
                if (this.pageNumber > 1) {
                    this.pageNumber = 1
                    $scope.drawSGDGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawSGDGrid();
                }
            },
            nextPage: function() {
                if (this.pageNumber < this.getTotalPages()) {
                    this.pageNumber++;
                    $scope.drawSGDGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawSGDGrid();
                }
            },
            previousPage: function() {
                if (this.pageNumber > 1) {
                    this.pageNumber--;
                    $scope.drawSGDGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawSGDGrid();
                }
            },
            currentPage: function() {
                if (this.pageNumber > 1) {
                    $scope.drawSGDGrid();
                } else {
                    $scope.drawSGDGrid();
                }
            },
            lastPage: function() {
                if (this.pageNumber >= 1) {
                    this.pageNumber = this.getTotalPages();
                    $scope.drawSGDGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawSGDGrid();
                }
            }
        }

      $scope.getSGDGridData = function () {
        $scope.gridSGDOptions = {
            useExternalPagination: true,
            useExternalSorting: true,
            enableFiltering: true,
            enableSorting: true,
            enableRowSelection: false,
            enableSelectAll: false,
            enableGridMenu: true,
            enableColumnMenus: false,
            enableColumnResizing: true,
            exporterCsvFilename: 'feeReportSGDBook.csv',
            exporterMenuPdf: false,
            exporterMenuCsv: false,
            onRegisterApi: function (gridSGDApi) {
                $scope.gridSGDApi = gridSGDApi;
                $scope.gridSGDApi.grid.clearAllFilters = function () {
                        this.columns.forEach(function (column) {
                            column.filters.forEach(function (filter) {
                            filter.term = undefined;
                        });
                    });
                    searchParams = undefined;
                    $scope.getSGDGridData(); // your own custom callback
                };
                $scope.gridSGDApi.core.on.filterChanged($scope, function () {
                    $scope.paginationsgd.pageNumber = '1';
                    var grid = this.grid;
                    angular.forEach(grid.columns, function (value, key) {
                        searchParams['currency_code'] ='SGD'
                        searchParams[value.colDef.field] = value.filters[0].term;
                    });
                    $scope.drawSGDGrid();
                });

                $scope.gridSGDApi.core.on.sortChanged($scope, function (val) {
                    var grid = this.grid;
                    angular.forEach(grid.columns, function (value, key) {
                        if (value.sort.direction) {
                            searchParams['order_column'] = value.colDef.order_column == undefined ? value.field : value.colDef.order_column;
                            searchParams['order_direction'] = value.sort.direction;
                        }
                    });
                    $scope.drawSGDGrid();
                });
            },
            columnDefs: [
              { field: 'serial_number', name: 'S.No.', width: '50', enableFiltering: false, enableSorting: false, headerCellClass: 'text-center', cellClass: 'text-center' },
                { field: 'transactionid', 
                name: 'Order.No.',
               
                 filter: {
                    placeholder: 'Search...'
                },
                  enableSorting: false,
                  enableFiltering: false,
                  },
                  {
                    field: 'operation',
                    name:'operation',
                  
                    filter: {
                        placeholder: 'Search...'
                    },
                    enableFiltering: false,
                  },
                 {
                    field: 'currency_code',
                    name: 'currency',
                    
                 filter: {
                        placeholder: 'Search...'
                    },  
                    enableFiltering: false, 
                },{
                    field: 'amount',
                    name: 'Amount',
                    cellFilter:'number:8',
                 filter: {
                        placeholder: 'Search...'
                    },
                   
                },
                //                    {field: 'state_name'},
                {
                    field: 'platform_value',
                    name: 'Fee',
                    enableSorting: true,
                    cellFilter:'number:8',
                    filter: {
                        placeholder: 'Search...'
                    },
                    
                },
                
          {
            field: 'created_at',
            name:'Date',
            filter: {
              placeholder: 'Search...'
            },
            enableFiltering: false,
            type: 'date',cellFilter: 'date:"dd-MM-yyyy  hh:mm a"'
          
            
          }
        ],
            exporterFieldCallback: function (grid, row, col, input) {

                    if (col.field == 'created_at') {
                        return $filter('date')(input, "dd-MM-yyyy HH:mm:a ");
                    }

                    if  (col.field == 'amount') {
                        return input=row.entity.amount.toFixed(8);
                    }
                    if  (col.field == 'platform_value') {
                        return input=row.entity.platform_value.toFixed(8);
                    }
           
                return input;
            },
        };
        $scope.drawSGDGrid();
    }

    $scope.exportSGD = function (format) {
        var limit = $scope.paginationsgd.totalItems;
        var data = { 'limit': limit, 'offset': 0,'currency_code':'SGD', 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1 }
        var result = adminService.getAllFiatFeeDetails(data);
        result.then(
            function (response) {
                $scope.gridSGDOptions.data = response.result.records;
            });
        if (format == 'csv') {
            $timeout(function () {
                $scope.gridSGDApi.exporter.csvExport('all', 'all');
                $scope.drawSGDGrid();
            }, 200)
        } else if (format == 'pdf') {
            $timeout(function () {
                $scope.gridSGDApi.exporter.pdfExport('all', 'all');
                $scope.drawSGDGrid();
            }, 200);
        }
    };

    $scope.drawSGDGrid = function () {
        var data = [];
        var NextPage = (($scope.paginationsgd.pageNumber - 1) * $scope.paginationsgd.pageSize);
        var NextPageSize = $scope.paginationsgd.pageSize;
        var object1 = { 'limit': NextPageSize,'currency_code':'SGD', 'offset': NextPage }
        var object2 = searchParams;
        var data = angular.merge({}, object1,object2);
        var result = adminService.getAllFiatFeeDetails(data);
          result.then(
            function (response) {
                $scope.paginationsgd.totalItems = response.result.totalRecords[0].count;
                $scope.gridSGDOptions.data = response.result.records;
                //paginationFactory.getTableHeight($scope);
            },
            function (error) {
                console.log("Error: " + error);
            });
    }
    
    $scope.getSGDGridData();

    /***HKD Fee Details start here***/

    $scope.paginationhkd = {
        paginationPageSizes: [10, 25, 50, 100],
        ddlpageSize: 100,
        pageNumber: 1,
        pageSize: 100,
        totalItems: 0,
        filter_value: '',

        getTotalPages: function() {
            return Math.ceil(this.totalItems / this.pageSize);
        },
        pageSizeChange: function() {
            if (this.ddlpageSize == "All")
                this.pageSize = $scope.paginationhkd.totalItems;
            else
                this.pageSize = this.ddlpageSize

            this.pageNumber = 1
            $scope.getHKDGridData();
        },
        firstPage: function() {
            if (this.pageNumber > 1) {
                this.pageNumber = 1
                $scope.drawHKDGrid();
            } else {
                this.pageNumber = 1
                $scope.drawHKDGrid();
            }
        },
        nextPage: function() {
            if (this.pageNumber < this.getTotalPages()) {
                this.pageNumber++;
                $scope.drawHKDGrid();
            } else {
                this.pageNumber = 1
                $scope.drawHKDGrid();
            }
        },
        previousPage: function() {
            if (this.pageNumber > 1) {
                this.pageNumber--;
                $scope.drawHKDGrid();
            } else {
                this.pageNumber = 1
                $scope.drawHKDGrid();
            }
        },
        currentPage: function() {
            if (this.pageNumber > 1) {
                $scope.drawHKDGrid();
            } else {
                $scope.drawHKDGrid();
            }
        },
        lastPage: function() {
            if (this.pageNumber >= 1) {
                this.pageNumber = this.getTotalPages();
                $scope.drawHKDGrid();
            } else {
                this.pageNumber = 1
                $scope.drawHKDGrid();
            }
        }
    }

  $scope.getHKDGridData = function () {
    $scope.gridHKDOptions = {
        useExternalPagination: true,
        useExternalSorting: true,
        enableFiltering: true,
        enableSorting: true,
        enableRowSelection: false,
        enableSelectAll: false,
        enableGridMenu: true,
        enableColumnMenus: false,
        enableColumnResizing: true,
        exporterCsvFilename: 'feeReportHKDBook.csv',
        exporterMenuPdf: false,
        exporterMenuCsv: false,
        onRegisterApi: function (gridHKDApi) {
            $scope.gridHKDApi = gridHKDApi;
            $scope.gridHKDApi.grid.clearAllFilters = function () {
                    this.columns.forEach(function (column) {
                        column.filters.forEach(function (filter) {
                        filter.term = undefined;
                    });
                });
                searchParams = undefined;
                $scope.getHKDGridData(); // your own custom callback
            };
            $scope.gridHKDApi.core.on.filterChanged($scope, function () {
                $scope.paginationhkd.pageNumber = '1';
                var grid = this.grid;
                angular.forEach(grid.columns, function (value, key) {
                    searchParams['currency_code'] ='HKD'
                    searchParams[value.colDef.field] = value.filters[0].term;
                });
                $scope.drawHKDGrid();
            });

            $scope.gridHKDApi.core.on.sortChanged($scope, function (val) {
                var grid = this.grid;
                angular.forEach(grid.columns, function (value, key) {
                    if (value.sort.direction) {
                        searchParams['order_column'] = value.colDef.order_column == undefined ? value.field : value.colDef.order_column;
                        searchParams['order_direction'] = value.sort.direction;
                    }
                });
                $scope.drawHKDGrid();
            });
        },
        columnDefs: [
          { field: 'serial_number', name: 'S.No.', width: '50', enableFiltering: false, enableSorting: false, headerCellClass: 'text-center', cellClass: 'text-center' },
            { field: 'transactionid', 
            name: 'Order.No.',
           
             filter: {
                placeholder: 'Search...'
            },
              enableSorting: false,
              enableFiltering: false,
              },
              {
                field: 'operation',
                name:'operation',
              
                filter: {
                    placeholder: 'Search...'
                },
                enableFiltering: false,
              },
             {
                field: 'currency_code',
                name: 'currency',
                
             filter: {
                    placeholder: 'Search...'
                },  
                enableFiltering: false, 
            },{
                field: 'amount',
                name: 'Amount',
                cellFilter:'number:8',
             filter: {
                    placeholder: 'Search...'
                },
               
            },
            //                    {field: 'state_name'},
            {
                field: 'platform_value',
                name: 'Fee',
                enableSorting: true,
                cellFilter:'number:8',
                filter: {
                    placeholder: 'Search...'
                },
                
            },
            
      {
        field: 'created_at',
        name:'Date',
        filter: {
          placeholder: 'Search...'
        },
        enableFiltering: false,
        type: 'date',cellFilter: 'date:"dd-MM-yyyy  hh:mm a"'
      
        
      }
    ],
        exporterFieldCallback: function (grid, row, col, input) {

                if (col.field == 'created_at') {
                    return $filter('date')(input, "dd-MM-yyyy HH:mm:a ");
                }

                if  (col.field == 'amount') {
                    return input=row.entity.amount.toFixed(8);
                }
                if  (col.field == 'platform_value') {
                    return input=row.entity.platform_value.toFixed(8);
                }
       
            return input;
        },
    };
    $scope.drawHKDGrid();
}

$scope.exportHKD = function (format) {
    var limit = $scope.paginationhkd.totalItems;
    var data = { 'limit': limit, 'offset': 0,'currency_code':'HKD', 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1 }
    var result = adminService.getAllFiatFeeDetails(data);
    result.then(
        function (response) {
            $scope.gridHKDOptions.data = response.result.records;
        });
    if (format == 'csv') {
        $timeout(function () {
            $scope.gridHKDApi.exporter.csvExport('all', 'all');
            $scope.drawHKDGrid();
        }, 200)
    } else if (format == 'pdf') {
        $timeout(function () {
            $scope.gridHKDApi.exporter.pdfExport('all', 'all');
            $scope.drawHKDGrid();
        }, 200);
    }
};

$scope.drawHKDGrid = function () {
    var data = [];
    var NextPage = (($scope.paginationhkd.pageNumber - 1) * $scope.paginationhkd.pageSize);
    var NextPageSize = $scope.paginationhkd.pageSize;
    var object1 = { 'limit': NextPageSize,'currency_code':'HKD', 'offset': NextPage }
    var object2 = searchParams;
    var data = angular.merge({}, object1,object2);
    var result = adminService.getAllFiatFeeDetails(data);
      result.then(
        function (response) {
            $scope.paginationhkd.totalItems = response.result.totalRecords[0].count;
            $scope.gridHKDOptions.data = response.result.records;
            //paginationFactory.getTableHeight($scope);
        },
        function (error) {
            console.log("Error: " + error);
        });
}

$scope.getHKDGridData();

  /***RMB Fee Details start here***/

  $scope.paginationrmb = {
    paginationPageSizes: [10, 25, 50, 100],
    ddlpageSize: 100,
    pageNumber: 1,
    pageSize: 100,
    totalItems: 0,
    filter_value: '',

    getTotalPages: function() {
        return Math.ceil(this.totalItems / this.pageSize);
    },
    pageSizeChange: function() {
        if (this.ddlpageSize == "All")
            this.pageSize = $scope.paginationrmb.totalItems;
        else
            this.pageSize = this.ddlpageSize

        this.pageNumber = 1
        $scope.getRMBGridData();
    },
    firstPage: function() {
        if (this.pageNumber > 1) {
            this.pageNumber = 1
            $scope.drawRMBGrid();
        } else {
            this.pageNumber = 1
            $scope.drawRMBGrid();
        }
    },
    nextPage: function() {
        if (this.pageNumber < this.getTotalPages()) {
            this.pageNumber++;
            $scope.drawRMBGrid();
        } else {
            this.pageNumber = 1
            $scope.drawRMBGrid();
        }
    },
    previousPage: function() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            $scope.drawRMBGrid();
        } else {
            this.pageNumber = 1
            $scope.drawRMBGrid();
        }
    },
    currentPage: function() {
        if (this.pageNumber > 1) {
            $scope.drawRMBGrid();
        } else {
            $scope.drawRMBGrid();
        }
    },
    lastPage: function() {
        if (this.pageNumber >= 1) {
            this.pageNumber = this.getTotalPages();
            $scope.drawRMBGrid();
        } else {
            this.pageNumber = 1
            $scope.drawRMBGrid();
        }
    }
}

$scope.getRMBGridData = function () {
$scope.gridRMBOptions = {
    useExternalPagination: true,
    useExternalSorting: true,
    enableFiltering: true,
    enableSorting: true,
    enableRowSelection: false,
    enableSelectAll: false,
    enableGridMenu: true,
    enableColumnMenus: false,
    enableColumnResizing: true,
    exporterCsvFilename: 'feeReportRMBBook.csv',
    exporterMenuPdf: false,
    exporterMenuCsv: false,
    onRegisterApi: function (gridRMBApi) {
        $scope.gridRMBApi = gridRMBApi;
        $scope.gridRMBApi.grid.clearAllFilters = function () {
                this.columns.forEach(function (column) {
                    column.filters.forEach(function (filter) {
                    filter.term = undefined;
                });
            });
            searchParams = undefined;
            $scope.getRMBGridData(); // your own custom callback
        };
        $scope.gridRMBApi.core.on.filterChanged($scope, function () {
            $scope.paginationrmb.pageNumber = '1';
            var grid = this.grid;
            angular.forEach(grid.columns, function (value, key) {
                searchParams['currency_code'] ='RMB';
                searchParams[value.colDef.field] = value.filters[0].term;
            });
            $scope.drawRMBGrid();
        });

        $scope.gridRMBApi.core.on.sortChanged($scope, function (val) {
            var grid = this.grid;
            angular.forEach(grid.columns, function (value, key) {
                if (value.sort.direction) {
                    searchParams['order_column'] = value.colDef.order_column == undefined ? value.field : value.colDef.order_column;
                    searchParams['order_direction'] = value.sort.direction;
                }
            });
            $scope.drawRMBGrid();
        });
    },
    columnDefs: [
      { field: 'serial_number', name: 'S.No.', width: '50', enableFiltering: false, enableSorting: false, headerCellClass: 'text-center', cellClass: 'text-center' },
        { field: 'transactionid', 
        name: 'Order.No.',
       
         filter: {
            placeholder: 'Search...'
        },
          enableSorting: false,
          enableFiltering: false,
          },
          {
            field: 'operation',
            name:'operation',
          
            filter: {
                placeholder: 'Search...'
            },
            enableFiltering: false,
          },
         {
            field: 'currency_code',
            name: 'currency',
            
         filter: {
                placeholder: 'Search...'
            },  
            enableFiltering: false, 
        },{
            field: 'amount',
            name: 'Amount',
            cellFilter:'number:8',
         filter: {
                placeholder: 'Search...'
            },
           
        },
        //                    {field: 'state_name'},
        {
            field: 'platform_value',
            name: 'Fee',
            enableSorting: true,
            cellFilter:'number:8',
            filter: {
                placeholder: 'Search...'
            },
            
        },
        
  {
    field: 'created_at',
    name:'Date',
    filter: {
      placeholder: 'Search...'
    },
    enableFiltering: false,
    type: 'date',cellFilter: 'date:"dd-MM-yyyy  hh:mm a"'
  
    
  }
],
    exporterFieldCallback: function (grid, row, col, input) {

            if (col.field == 'created_at') {
                return $filter('date')(input, "dd-MM-yyyy HH:mm:a ");
            }

            if  (col.field == 'amount') {
                return input=row.entity.amount.toFixed(8);
            }
            if  (col.field == 'platform_value') {
                return input=row.entity.platform_value.toFixed(8);
            }
   
        return input;
    },
};
$scope.drawRMBGrid();
}

$scope.exportRMB = function (format) {
var limit = $scope.paginationrmb.totalItems;
var data = { 'limit': limit, 'offset': 0,'currency_code':'RMB',  'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1 }
var result = adminService.getAllFiatFeeDetails(data);
result.then(
    function (response) {
        $scope.gridRMBOptions.data = response.result.records;
    });
if (format == 'csv') {
    $timeout(function () {
        $scope.gridRMBApi.exporter.csvExport('all', 'all');
        $scope.drawRMBGrid();
    }, 200)
} else if (format == 'pdf') {
    $timeout(function () {
        $scope.gridRMBApi.exporter.pdfExport('all', 'all');
        $scope.drawRMBGrid();
    }, 200);
}
};

$scope.drawRMBGrid = function () {
var data = [];
var NextPage = (($scope.paginationrmb.pageNumber - 1) * $scope.paginationrmb.pageSize);
var NextPageSize = $scope.paginationrmb.pageSize;
var object1 = { 'limit': NextPageSize,'currency_code':'RMB', 'offset': NextPage }
var object2 = searchParams;
var data = angular.merge({}, object1,object2);
var result = adminService.getAllFiatFeeDetails(data);
  result.then(
    function (response) {
        $scope.paginationrmb.totalItems = response.result.totalRecords[0].count;
        $scope.gridRMBOptions.data = response.result.records;
        //paginationFactory.getTableHeight($scope);
    },
    function (error) {
        console.log("Error: " + error);
    });
}

$scope.getRMBGridData();

  /***TWD Fee Details start here***/

  $scope.paginationtwd = {
    paginationPageSizes: [10, 25, 50, 100],
    ddlpageSize: 100,
    pageNumber: 1,
    pageSize: 100,
    totalItems: 0,
    filter_value: '',

    getTotalPages: function() {
        return Math.ceil(this.totalItems / this.pageSize);
    },
    pageSizeChange: function() {
        if (this.ddlpageSize == "All")
            this.pageSize = $scope.paginationtwd.totalItems;
        else
            this.pageSize = this.ddlpageSize

        this.pageNumber = 1
        $scope.getTWDGridData();
    },
    firstPage: function() {
        if (this.pageNumber > 1) {
            this.pageNumber = 1
            $scope.drawTWDGrid();
        } else {
            this.pageNumber = 1
            $scope.drawTWDGrid();
        }
    },
    nextPage: function() {
        if (this.pageNumber < this.getTotalPages()) {
            this.pageNumber++;
            $scope.drawTWDGrid();
        } else {
            this.pageNumber = 1
            $scope.drawTWDGrid();
        }
    },
    previousPage: function() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            $scope.drawTWDGrid();
        } else {
            this.pageNumber = 1
            $scope.drawTWDGrid();
        }
    },
    currentPage: function() {
        if (this.pageNumber > 1) {
            $scope.drawTWDGrid();
        } else {
            $scope.drawTWDGrid();
        }
    },
    lastPage: function() {
        if (this.pageNumber >= 1) {
            this.pageNumber = this.getTotalPages();
            $scope.drawTWDGrid();
        } else {
            this.pageNumber = 1
            $scope.drawTWDGrid();
        }
    }
}

$scope.getTWDGridData = function () {
$scope.gridTWDOptions = {
    useExternalPagination: true,
    useExternalSorting: true,
    enableFiltering: true,
    enableSorting: true,
    enableRowSelection: false,
    enableSelectAll: false,
    enableGridMenu: true,
    enableColumnMenus: false,
    enableColumnResizing: true,
    exporterCsvFilename: 'feeReportTWDBook.csv',
    exporterMenuPdf: false,
    exporterMenuCsv: false,
    onRegisterApi: function (gridTWDApi) {
        $scope.gridTWDApi = gridTWDApi;
        $scope.gridTWDApi.grid.clearAllFilters = function () {
                this.columns.forEach(function (column) {
                    column.filters.forEach(function (filter) {
                    filter.term = undefined;
                });
            });
            searchParams = undefined;
            $scope.getTWDGridData(); // your own custom callback
        };
        $scope.gridTWDApi.core.on.filterChanged($scope, function () {
            $scope.paginationtwd.pageNumber = '1';
            var grid = this.grid;
            angular.forEach(grid.columns, function (value, key) {
                searchParams['currency_code'] = 'TWD'
                searchParams[value.colDef.field] = value.filters[0].term;
            });
            $scope.drawTWDGrid();
        });

        $scope.gridTWDApi.core.on.sortChanged($scope, function (val) {
            var grid = this.grid;
            angular.forEach(grid.columns, function (value, key) {
                if (value.sort.direction) {
                    searchParams['order_column'] = value.colDef.order_column == undefined ? value.field : value.colDef.order_column;
                    searchParams['order_direction'] = value.sort.direction;
                }
            });
            $scope.drawTWDGrid();
        });
    },
    columnDefs: [
      { field: 'serial_number', name: 'S.No.', width: '50', enableFiltering: false, enableSorting: false, headerCellClass: 'text-center', cellClass: 'text-center' },
        { field: 'transactionid', 
        name: 'Order.No.',
       
         filter: {
            placeholder: 'Search...'
        },
          enableSorting: false,
          enableFiltering: false,
          },
          {
            field: 'operation',
            name:'operation',
          
            filter: {
                placeholder: 'Search...'
            },
            enableFiltering: false,
          },
         {
            field: 'currency_code',
            name: 'currency',
            
         filter: {
                placeholder: 'Search...'
            },  
            enableFiltering: false, 
        },{
            field: 'amount',
            name: 'Amount',
            cellFilter:'number:8',
         filter: {
                placeholder: 'Search...'
            },
           
        },
        //                    {field: 'state_name'},
        {
            field: 'platform_value',
            name: 'Fee',
            enableSorting: true,
            cellFilter:'number:8',
            filter: {
                placeholder: 'Search...'
            },
            
        },
        
  {
    field: 'created_at',
    name:'Date',
    filter: {
      placeholder: 'Search...'
    },
    enableFiltering: false,
    type: 'date',cellFilter: 'date:"dd-MM-yyyy  hh:mm a"'
  
    
  }
],
    exporterFieldCallback: function (grid, row, col, input) {

            if (col.field == 'created_at') {
                return $filter('date')(input, "dd-MM-yyyy HH:mm:a ");
            }

            if  (col.field == 'amount') {
                return input=row.entity.amount.toFixed(8);
            }
            if  (col.field == 'platform_value') {
                return input=row.entity.platform_value.toFixed(8);
            }
   
        return input;
    },
};
$scope.drawTWDGrid();
}

$scope.exportTWD = function (format) {
var limit = $scope.paginationtwd.totalItems;
var data = { 'limit': limit, 'offset': 0,'currency_code':'TWD', 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1 }
var result = adminService.getAllFiatFeeDetails(data);
result.then(
    function (response) {
        $scope.gridTWDOptions.data = response.result.records;
    });
if (format == 'csv') {
    $timeout(function () {
        $scope.gridTWDApi.exporter.csvExport('all', 'all');
        $scope.drawTWDGrid();
    }, 200)
} else if (format == 'pdf') {
    $timeout(function () {
        $scope.gridTWDApi.exporter.pdfExport('all', 'all');
        $scope.drawTWDGrid();
    }, 200);
}
};

$scope.drawTWDGrid = function () {
var data = [];
var NextPage = (($scope.paginationtwd.pageNumber - 1) * $scope.paginationtwd.pageSize);
var NextPageSize = $scope.paginationtwd.pageSize;
var object1 = { 'limit': NextPageSize,'currency_code':'TWD', 'offset': NextPage }
var object2 = searchParams;
var data = angular.merge({}, object1,object2);
var result = adminService.getAllFiatFeeDetails(data);
  result.then(
    function (response) {
        $scope.paginationtwd.totalItems = response.result.totalRecords[0].count;
        $scope.gridTWDOptions.data = response.result.records;
        //paginationFactory.getTableHeight($scope);
    },
    function (error) {
        console.log("Error: " + error);
    });
}

$scope.getTWDGridData();
     }
  ])
