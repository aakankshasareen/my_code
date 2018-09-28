admin.controller("orderBookCtrl",  ['$rootScope', '$scope', '$window', 'adminService', '$state', 'toastr', '$stateParams', 'paginationFactory', 'uiGridConstants', 'dashboardService', 'KYC_STATUS', 'STATUS', '$timeout', '$filter', 'IMAGE_TYPE', '$httpParamSerializer', 'ID_TYPE', 'ADDRESS_TYPE', '$interval', '$location',
function ($rootScope, $scope, $window, adminService, $state, toastr, $stateParams, paginationFactory, uiGridConstants, dashboardService, KYC_STATUS, STATUS, $timeout, $filter, IMAGE_TYPE, $httpParamSerializer, ID_TYPE, ADDRESS_TYPE, $interval, $location) {
      var vm = this;

      $scope.orderCoulmn = '';
      $scope.orderDirection = '';

      $scope.gridOptions = [];
      paginationFactory.showPagination($scope);
      var searchParams = [];
      //ui-Grid Call
      $scope.getGridData = function () {
        //            $scope.loaderMore = true;
        //            $scope.lblMessage = 'loading please wait....!';
        //            $scope.result = "color-green";

        $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
            if (col.filters[0].term) {
                return 'header-filtered';
            } else {
                return '';
            }
        };
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
            exporterCsvFilename: 'orderbook.csv',
            exporterMenuPdf: false,
            exporterMenuCsv: false,
            exporterPdfOrientation: 'landscape',
            exporterPdfMaxGridWidth: 600,
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.clearAllFilters = function () {
                    alert();
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
                            searchParams['order_column'] = value.colDef.order_column == undefined ? value.field : value.colDef.order_column;
                            searchParams['order_direction'] = value.sort.direction;
                        }
                    });
                    $scope.drawGrid();

                });
            },
            columnDefs: [
              { field: 'serial_number', name: 'S.No.', width: '50', enableFiltering: false, enableSorting: false, headerCellClass: 'text-center', cellClass: 'text-center' },
                { field: 'order_num', 
                name: 'Order.No.',
                 width: '80',
                 filter: {
                    placeholder: 'Search...'
                },
                  enableSorting: false,
                  },
                  {
                    field: 'trade_type',
                    name:'trade_type',
                  
                    filter: {
                        placeholder: 'Search...'
                    },
                    width: '90'
                  },
                //  {
                //     field: 'member_id',
                //     name: 'Member_id ',
                //     order_column: 'Y.member_id',
                //  filter: {
                //         placeholder: 'Search...'
                //     },   width: '90'
                // },
                {
                    field: 'member_name',
                    order_column: 'Y.member_name',
                    name: 'Name',
                 filter: {
                        placeholder: 'Search...'
                    },
                    width: '90'
                },
                //                    {field: 'state_name'},
                {
                    field: 'member_email',
                    name: 'email',
                    enableSorting: true,
                    order_column: 'Y.member_email',
                    filter: {
                        placeholder: 'Search...'
                    },
                    width: '25%'
                },
                {
                    field: 'type',
                    name: 'type',
                    filter: {
                        placeholder: 'Search...'
                    },
                    width: '80'
                },
                {
                    field: 'status',
                    name:'Status',
                    filter: {                        
                      placeholder: 'Search...'
                    },
                    width: '110',
                    cellFilter: 'orderBookFilter : row.entity.status'
                },
                {
                    field: 'pair',
                    name:"Pair",
                    enableSorting: false,
                    enableFiltering: false,
                 // filter: {
                 //      placeholder: 'Search...'
                 //    },
                    //cellFilter: 'number: 8',
                  
                    width: '90'
                },
                {
                  field: 'btc_price',
                  displayName:"Price",
                 filter: {
                    placeholder: 'Search...'
                  },
                  cellFilter: 'number: 8',
                  width: '90'
                },
              {
                field: 'quantity',
                displayName:"Quantity",
                 filter: {
                  placeholder: 'Search...'
                },
                cellFilter: 'number: 8',
                width: '90'
             },
             {
              field: 'btc_amount',
              name:'amount',
              filter: {
                placeholder: 'Search...'
              },
              cellFilter: 'number: 8',
            
              width: '90'
            },
       /*   {
            field: 'status',
            name:'status', 
            filter: {
              placeholder: 'Search...'
            },
          
            width: '90'

          }*/
        ],
        exporterFieldCallback: function (grid, row, col, input) {
            if (col.field == 'btc_price') {
                return input=row.entity.btc_price.toFixed(8);
            }
                 if (col.name == 'Status') {
                            
                              var $return = '';
                               switch (input) {
                                    case 'Executed':
                                        $return = 'Open';
                                        break; 
                                    case 'Partially Executed':
                                        $return = 'Partially Executed';
                                        break; 

                                default:

                                }
                                return $return;
                        }
            return input;
        },
        };
        $scope.drawGrid();
    }

    $scope.export = function (format) {

        var limit = $scope.pagination.totalItems;
        var data = { 'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1 }
        var result = adminService.getOrderBookList(data);
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
        var NextPage = (($scope.pagination.pageNumber - 1) * $scope.pagination.pageSize);
        var NextPageSize = $scope.pagination.pageSize;

        var object1 = { 'limit': NextPageSize, 'offset': NextPage }
        var object2 = searchParams;
        var data = angular.merge({}, object1,object2);
        var result = adminService.getOrderBookList(data);
        console.log("resultvnnnnnnb",result);
        result.then(
            function (response) {
                $scope.pagination.totalItems = response.result.totalRecords[0].count;
                $scope.gridOptions.data = response.result.record;
                paginationFactory.getTableHeight($scope);
            },
            function (error) {
                console.log("Error: " + error);
            });
    }

    //Default Load

    $scope.getGridData();
    //   adminService.getTradeCurrencyPairsFrontend().then((response)=>{
    //     if(response.success){
    //       vm.currencyPairs = response.result;
    //       vm.currencyPair = response.result[0];
    //       socket.emit('pair_id', vm.currencyPair.id);
    //       socket.pairId = vm.currencyPair.id;
    //     } else {
    //       toastr.error(response.message);
    //     }
    //   }).catch((err)=>{
    //     toastr.error('Error while fetching Currency List');
    //   })

    //   vm.updateCurrencyPair = function  (currencyPair){
    //       vm.currencyPair = currencyPair;
    //       socket.pairId = currencyPair.id;
    //       socket.emit('pair_id', currencyPair.id);
    //   }

    //  socket.unSubscribe('sell_buy');
    //  socket.unSubscribe('connect');
    //  socket.on('sell_buy', function(data) {
    //   if(data.id == vm.currencyPair.id){
    //      $scope.buyOrder = data.obj.buy;
    //      $scope.sellOrder = data.obj.sell;
    //      console.log(data.id)
    //    }
    //  });

    //  socket.on('connect', function(){
    //    socket.emit('pair_id', vm.currencyPair.id)
    //  })


     }
  ])
