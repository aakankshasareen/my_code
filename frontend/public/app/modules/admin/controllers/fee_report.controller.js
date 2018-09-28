admin.controller("feeReportCtrl",  ['$rootScope', '$scope', '$window', 'adminService', '$state', 'toastr', '$stateParams', 'paginationFactory', 'uiGridConstants', 'dashboardService', 'KYC_STATUS', 'STATUS', '$timeout', '$filter', 'IMAGE_TYPE', '$httpParamSerializer', 'ID_TYPE', 'ADDRESS_TYPE', '$interval', '$location',
function ($rootScope, $scope, $window, adminService, $state, toastr, $stateParams, paginationFactory, uiGridConstants, dashboardService, KYC_STATUS, STATUS, $timeout, $filter, IMAGE_TYPE, $httpParamSerializer, ID_TYPE, ADDRESS_TYPE, $interval, $location) {
      var vm = this;
      $scope.orderCoulmn = '';
      $scope.orderDirection = '';
      $scope.gridOptions = [];
      //paginationFactory.showPagination($scope);
      var searchParams = [];
      //ui-Grid Call
        /******BTC Fee Details start here******/
         $scope.paginationbtc = {
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
                    this.pageSize = $scope.paginationbtc.totalItems;
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
            exporterCsvFilename: 'feeReportBTCBook.csv',
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
                    $scope.paginationbtc.pageNumber = '1';
                    var grid = this.grid;
                    angular.forEach(grid.columns, function (value, key) {
                        searchParams['currency_code'] ='BTC'
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
        var limit = $scope.paginationbtc.totalItems;
        var data = { 'limit': limit, 'offset': 0,currency_code:'BTC' , 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1 }
        var result = adminService.getAllCryptoFeeDetails(data);
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
        var NextPage = (($scope.paginationbtc.pageNumber - 1) * $scope.paginationbtc.pageSize);
        var NextPageSize = $scope.paginationbtc.pageSize;
        var object1 = { 'limit': NextPageSize, 'offset': NextPage,currency_code:'BTC' }
        var object2 = searchParams;
        console.log(searchParams)
        var data = angular.merge({}, object1,object2);
        var result = adminService.getAllCryptoFeeDetails(data);
          result.then(
            function (response) {
                $scope.paginationbtc.totalItems = response.result.totalRecords[0].count;
                $scope.gridOptions.data = response.result.records;
                //paginationFactory.getTableHeight($scope);
            },
            function (error) {
                console.log("Error: " + error);
            });
    }

    //Default Load

    $scope.getGridData();

    /***LTC Fee Details start here***/

     $scope.paginationltc = {
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
                    this.pageSize = $scope.paginationltc.totalItems;
                else
                    this.pageSize = this.ddlpageSize

                this.pageNumber = 1
                $scope.getLTCGridData();
            },
            firstPage: function() {
                if (this.pageNumber > 1) {
                    this.pageNumber = 1
                    $scope.drawLTCGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawLTCGrid();
                }
            },
            nextPage: function() {
                if (this.pageNumber < this.getTotalPages()) {
                    this.pageNumber++;
                    $scope.drawLTCGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawLTCGrid();
                }
            },
            previousPage: function() {
                if (this.pageNumber > 1) {
                    this.pageNumber--;
                    $scope.drawLTCGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawLTCGrid();
                }
            },
            currentPage: function() {
                if (this.pageNumber > 1) {
                    $scope.drawLTCGrid();
                } else {
                    $scope.drawLTCGrid();
                }
            },
            lastPage: function() {
                if (this.pageNumber >= 1) {
                    this.pageNumber = this.getTotalPages();
                    $scope.drawLTCGrid();
                } else {
                    this.pageNumber = 1
                    $scope.drawLTCGrid();
                }
            }
        }

      $scope.getLTCGridData = function () {
        $scope.gridLTCOptions = {
            useExternalPagination: true,
            useExternalSorting: true,
            enableFiltering: true,
            enableSorting: true,
            enableRowSelection: false,
            enableSelectAll: false,
            enableGridMenu: true,
            enableColumnMenus: false,
            enableColumnResizing: true,
            exporterCsvFilename: 'feeReportLTCBook.csv',
            exporterMenuPdf: false,
            exporterMenuCsv: false,
            onRegisterApi: function (gridLTCApi) {
                $scope.gridLTCApi = gridLTCApi;
                $scope.gridLTCApi.grid.clearAllFilters = function () {
                        this.columns.forEach(function (column) {
                            column.filters.forEach(function (filter) {
                            filter.term = undefined;
                        });
                    });
                    searchParams = undefined;
                    $scope.getLTCGridData(); // your own custom callback
                };
                $scope.gridLTCApi.core.on.filterChanged($scope, function () {
                    $scope.paginationltc.pageNumber = '1';
                    var grid = this.grid;
                    angular.forEach(grid.columns, function (value, key) {
                        searchParams['currency_code'] ='LTC'
                        searchParams[value.colDef.field] = value.filters[0].term;
                    });
                    $scope.drawLTCGrid();
                });

                $scope.gridLTCApi.core.on.sortChanged($scope, function (val) {
                    var grid = this.grid;
                    angular.forEach(grid.columns, function (value, key) {
                        if (value.sort.direction) {
                            searchParams['order_column'] = value.colDef.order_column == undefined ? value.field : value.colDef.order_column;
                            searchParams['order_direction'] = value.sort.direction;
                        }
                    });
                    $scope.drawLTCGrid();
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
        $scope.drawLTCGrid();
    }

    $scope.exportLTC = function (format) {
        var limit = $scope.paginationltc.totalItems;
        var data = { 'limit': limit, 'offset': 0,'currency_code':'LTC', 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1 }
        var result = adminService.getAllCryptoFeeDetails(data);
        result.then(
            function (response) {
                $scope.gridLTCOptions.data = response.result.records;
            });
        if (format == 'csv') {
            $timeout(function () {
                $scope.gridLTCApi.exporter.csvExport('all', 'all');
                $scope.drawLTCGrid();
            }, 200)
        } else if (format == 'pdf') {
            $timeout(function () {
                $scope.gridLTCApi.exporter.pdfExport('all', 'all');
                $scope.drawLTCGrid();
            }, 200);
        }
    };

    $scope.drawLTCGrid = function () {
        var data = [];
        var NextPage = (($scope.paginationltc.pageNumber - 1) * $scope.paginationltc.pageSize);
        var NextPageSize = $scope.paginationltc.pageSize;
        var object1 = { 'limit': NextPageSize,'currency_code':'LTC', 'offset': NextPage }
        var object2 = searchParams;
        var data = angular.merge({}, object1,object2);
        var result = adminService.getAllCryptoFeeDetails(data);
          result.then(
            function (response) {
                $scope.paginationltc.totalItems = response.result.totalRecords[0].count;
                $scope.gridLTCOptions.data = response.result.records;
                //paginationFactory.getTableHeight($scope);
            },
            function (error) {
                console.log("Error: " + error);
            });
    }
    
    $scope.getLTCGridData();

    /***ETH Fee Details start here***/

    $scope.paginationeth = {
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
                this.pageSize = $scope.paginationeth.totalItems;
            else
                this.pageSize = this.ddlpageSize

            this.pageNumber = 1
            $scope.getETHGridData();
        },
        firstPage: function() {
            if (this.pageNumber > 1) {
                this.pageNumber = 1
                $scope.drawETHGrid();
            } else {
                this.pageNumber = 1
                $scope.drawETHGrid();
            }
        },
        nextPage: function() {
            if (this.pageNumber < this.getTotalPages()) {
                this.pageNumber++;
                $scope.drawETHGrid();
            } else {
                this.pageNumber = 1
                $scope.drawETHGrid();
            }
        },
        previousPage: function() {
            if (this.pageNumber > 1) {
                this.pageNumber--;
                $scope.drawETHGrid();
            } else {
                this.pageNumber = 1
                $scope.drawETHGrid();
            }
        },
        currentPage: function() {
            if (this.pageNumber > 1) {
                $scope.drawETHGrid();
            } else {
                $scope.drawETHGrid();
            }
        },
        lastPage: function() {
            if (this.pageNumber >= 1) {
                this.pageNumber = this.getTotalPages();
                $scope.drawETHGrid();
            } else {
                this.pageNumber = 1
                $scope.drawETHGrid();
            }
        }
    }

  $scope.getETHGridData = function () {
    $scope.gridETHOptions = {
        useExternalPagination: true,
        useExternalSorting: true,
        enableFiltering: true,
        enableSorting: true,
        enableRowSelection: false,
        enableSelectAll: false,
        enableGridMenu: true,
        enableColumnMenus: false,
        enableColumnResizing: true,
        exporterCsvFilename: 'feeReportETHBook.csv',
        exporterMenuPdf: false,
        exporterMenuCsv: false,
        onRegisterApi: function (gridETHApi) {
            $scope.gridETHApi = gridETHApi;
            $scope.gridETHApi.grid.clearAllFilters = function () {
                    this.columns.forEach(function (column) {
                        column.filters.forEach(function (filter) {
                        filter.term = undefined;
                    });
                });
                searchParams = undefined;
                $scope.getETHGridData(); // your own custom callback
            };
            $scope.gridETHApi.core.on.filterChanged($scope, function () {
                $scope.paginationeth.pageNumber = '1';
                var grid = this.grid;
                angular.forEach(grid.columns, function (value, key) {
                    searchParams['currency_code'] ='ETH'
                    searchParams[value.colDef.field] = value.filters[0].term;
                });
                $scope.drawETHGrid();
            });

            $scope.gridETHApi.core.on.sortChanged($scope, function (val) {
                var grid = this.grid;
                angular.forEach(grid.columns, function (value, key) {
                    if (value.sort.direction) {
                        searchParams['order_column'] = value.colDef.order_column == undefined ? value.field : value.colDef.order_column;
                        searchParams['order_direction'] = value.sort.direction;
                    }
                });
                $scope.drawETHGrid();
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
    $scope.drawETHGrid();
}

$scope.exportETH = function (format) {
    var limit = $scope.paginationeth.totalItems;
    var data = { 'limit': limit, 'offset': 0,'currency_code':'ETH', 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1 }
    var result = adminService.getAllCryptoFeeDetails(data);
    result.then(
        function (response) {
            $scope.gridETHOptions.data = response.result.records;
        });
    if (format == 'csv') {
        $timeout(function () {
            $scope.gridETHApi.exporter.csvExport('all', 'all');
            $scope.drawETHGrid();
        }, 200)
    } else if (format == 'pdf') {
        $timeout(function () {
            $scope.gridETHApi.exporter.pdfExport('all', 'all');
            $scope.drawETHGrid();
        }, 200);
    }
};

$scope.drawETHGrid = function () {
    var data = [];
    var NextPage = (($scope.paginationeth.pageNumber - 1) * $scope.paginationeth.pageSize);
    var NextPageSize = $scope.paginationeth.pageSize;
    var object1 = { 'limit': NextPageSize,'currency_code':'ETH', 'offset': NextPage }
    var object2 = searchParams;
    var data = angular.merge({}, object1,object2);
    var result = adminService.getAllCryptoFeeDetails(data);
      result.then(
        function (response) {
            $scope.paginationeth.totalItems = response.result.totalRecords[0].count;
            $scope.gridETHOptions.data = response.result.records;
            //paginationFactory.getTableHeight($scope);
        },
        function (error) {
            console.log("Error: " + error);
        });
}

$scope.getETHGridData();

  /***FULX Fee Details start here***/

  $scope.paginationfulx = {
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
            this.pageSize = $scope.paginationfulx.totalItems;
        else
            this.pageSize = this.ddlpageSize

        this.pageNumber = 1
        $scope.getFULXGridData();
    },
    firstPage: function() {
        if (this.pageNumber > 1) {
            this.pageNumber = 1
            $scope.drawFULXGrid();
        } else {
            this.pageNumber = 1
            $scope.drawFULXGrid();
        }
    },
    nextPage: function() {
        if (this.pageNumber < this.getTotalPages()) {
            this.pageNumber++;
            $scope.drawFULXGrid();
        } else {
            this.pageNumber = 1
            $scope.drawFULXGrid();
        }
    },
    previousPage: function() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            $scope.drawFULXGrid();
        } else {
            this.pageNumber = 1
            $scope.drawFULXGrid();
        }
    },
    currentPage: function() {
        if (this.pageNumber > 1) {
            $scope.drawFULXGrid();
        } else {
            $scope.drawFULXGrid();
        }
    },
    lastPage: function() {
        if (this.pageNumber >= 1) {
            this.pageNumber = this.getTotalPages();
            $scope.drawFULXGrid();
        } else {
            this.pageNumber = 1
            $scope.drawFULXGrid();
        }
    }
}

$scope.getFULXGridData = function () {
$scope.gridFULXOptions = {
    useExternalPagination: true,
    useExternalSorting: true,
    enableFiltering: true,
    enableSorting: true,
    enableRowSelection: false,
    enableSelectAll: false,
    enableGridMenu: true,
    enableColumnMenus: false,
    enableColumnResizing: true,
    exporterCsvFilename: 'feeReportFULXBook.csv',
    exporterMenuPdf: false,
    exporterMenuCsv: false,
    onRegisterApi: function (gridFULXApi) {
        $scope.gridFULXApi = gridFULXApi;
        $scope.gridFULXApi.grid.clearAllFilters = function () {
                this.columns.forEach(function (column) {
                    column.filters.forEach(function (filter) {
                    filter.term = undefined;
                });
            });
            searchParams = undefined;
            $scope.getFULXGridData(); // your own custom callback
        };
        $scope.gridFULXApi.core.on.filterChanged($scope, function () {
            $scope.paginationfulx.pageNumber = '1';
            var grid = this.grid;
            angular.forEach(grid.columns, function (value, key) {
                searchParams['currency_code'] ='FULX';
                searchParams[value.colDef.field] = value.filters[0].term;
            });
            $scope.drawFULXGrid();
        });

        $scope.gridFULXApi.core.on.sortChanged($scope, function (val) {
            var grid = this.grid;
            angular.forEach(grid.columns, function (value, key) {
                if (value.sort.direction) {
                    searchParams['order_column'] = value.colDef.order_column == undefined ? value.field : value.colDef.order_column;
                    searchParams['order_direction'] = value.sort.direction;
                }
            });
            $scope.drawFULXGrid();
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
$scope.drawFULXGrid();
}

$scope.exportFULX = function (format) {
var limit = $scope.paginationfulx.totalItems;
var data = { 'limit': limit, 'offset': 0,'currency_code':'FULX',  'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1 }
var result = adminService.getAllCryptoFeeDetails(data);
result.then(
    function (response) {
        $scope.gridFULXOptions.data = response.result.records;
    });
if (format == 'csv') {
    $timeout(function () {
        $scope.gridFULXApi.exporter.csvExport('all', 'all');
        $scope.drawFULXGrid();
    }, 200)
} else if (format == 'pdf') {
    $timeout(function () {
        $scope.gridFULXApi.exporter.pdfExport('all', 'all');
        $scope.drawFULXGrid();
    }, 200);
}
};

$scope.drawFULXGrid = function () {
var data = [];
var NextPage = (($scope.paginationfulx.pageNumber - 1) * $scope.paginationfulx.pageSize);
var NextPageSize = $scope.paginationfulx.pageSize;
var object1 = { 'limit': NextPageSize,'currency_code':'FULX', 'offset': NextPage }
var object2 = searchParams;
var data = angular.merge({}, object1,object2);
var result = adminService.getAllCryptoFeeDetails(data);
  result.then(
    function (response) {
        $scope.paginationfulx.totalItems = response.result.totalRecords[0].count;
        $scope.gridFULXOptions.data = response.result.records;
        //paginationFactory.getTableHeight($scope);
    },
    function (error) {
        console.log("Error: " + error);
    });
}

$scope.getFULXGridData();

  /***ABC Fee Details start here***/

  $scope.paginationabc = {
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
            this.pageSize = $scope.paginationabc.totalItems;
        else
            this.pageSize = this.ddlpageSize

        this.pageNumber = 1
        $scope.getABCGridData();
    },
    firstPage: function() {
        if (this.pageNumber > 1) {
            this.pageNumber = 1
            $scope.drawABCGrid();
        } else {
            this.pageNumber = 1
            $scope.drawABCGrid();
        }
    },
    nextPage: function() {
        if (this.pageNumber < this.getTotalPages()) {
            this.pageNumber++;
            $scope.drawABCGrid();
        } else {
            this.pageNumber = 1
            $scope.drawABCGrid();
        }
    },
    previousPage: function() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            $scope.drawABCGrid();
        } else {
            this.pageNumber = 1
            $scope.drawABCGrid();
        }
    },
    currentPage: function() {
        if (this.pageNumber > 1) {
            $scope.drawABCGrid();
        } else {
            $scope.drawABCGrid();
        }
    },
    lastPage: function() {
        if (this.pageNumber >= 1) {
            this.pageNumber = this.getTotalPages();
            $scope.drawABCGrid();
        } else {
            this.pageNumber = 1
            $scope.drawABCGrid();
        }
    }
}

$scope.getABCGridData = function () {
$scope.gridABCOptions = {
    useExternalPagination: true,
    useExternalSorting: true,
    enableFiltering: true,
    enableSorting: true,
    enableRowSelection: false,
    enableSelectAll: false,
    enableGridMenu: true,
    enableColumnMenus: false,
    enableColumnResizing: true,
    exporterCsvFilename: 'feeReportABCBook.csv',
    exporterMenuPdf: false,
    exporterMenuCsv: false,
    onRegisterApi: function (gridABCApi) {
        $scope.gridABCApi = gridABCApi;
        $scope.gridABCApi.grid.clearAllFilters = function () {
                this.columns.forEach(function (column) {
                    column.filters.forEach(function (filter) {
                    filter.term = undefined;
                });
            });
            searchParams = undefined;
            $scope.getABCGridData(); // your own custom callback
        };
        $scope.gridABCApi.core.on.filterChanged($scope, function () {
            $scope.paginationabc.pageNumber = '1';
            var grid = this.grid;
            angular.forEach(grid.columns, function (value, key) {
                searchParams['currency_code'] = 'ABC'
                searchParams[value.colDef.field] = value.filters[0].term;
            });
            $scope.drawABCGrid();
        });

        $scope.gridABCApi.core.on.sortChanged($scope, function (val) {
            var grid = this.grid;
            angular.forEach(grid.columns, function (value, key) {
                if (value.sort.direction) {
                    searchParams['order_column'] = value.colDef.order_column == undefined ? value.field : value.colDef.order_column;
                    searchParams['order_direction'] = value.sort.direction;
                }
            });
            $scope.drawABCGrid();
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
$scope.drawABCGrid();
}

$scope.exportABC = function (format) {
var limit = $scope.paginationabc.totalItems;
var data = { 'limit': limit, 'offset': 0,'currency_code':'ABC', 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1 }
var result = adminService.getAllCryptoFeeDetails(data);
result.then(
    function (response) {
        $scope.gridABCOptions.data = response.result.records;
    });
if (format == 'csv') {
    $timeout(function () {
        $scope.gridABCApi.exporter.csvExport('all', 'all');
        $scope.drawABCGrid();
    }, 200)
} else if (format == 'pdf') {
    $timeout(function () {
        $scope.gridABCApi.exporter.pdfExport('all', 'all');
        $scope.drawABCGrid();
    }, 200);
}
};

$scope.drawABCGrid = function () {
var data = [];
var NextPage = (($scope.paginationabc.pageNumber - 1) * $scope.paginationabc.pageSize);
var NextPageSize = $scope.paginationabc.pageSize;
var object1 = { 'limit': NextPageSize,'currency_code':'ABC', 'offset': NextPage }
var object2 = searchParams;
var data = angular.merge({}, object1,object2);
var result = adminService.getAllCryptoFeeDetails(data);
  result.then(
    function (response) {
        $scope.paginationabc.totalItems = response.result.totalRecords[0].count;
        $scope.gridABCOptions.data = response.result.records;
        //paginationFactory.getTableHeight($scope);
    },
    function (error) {
        console.log("Error: " + error);
    });
}

$scope.getABCGridData();
     }
  ])
