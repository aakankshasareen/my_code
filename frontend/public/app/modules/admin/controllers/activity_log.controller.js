app.controller('activityLogCtrl', [
    '$rootScope',
    '$scope',
    '$window',
    'adminService',
    '$state',
    'toastr',
    'paginationFactory',
    '$stateParams',
    'uiGridConstants',
    'dashboardService',
    'KYC_STATUS',
    'STATUS',
    '$timeout',
    '$filter',
    'IMAGE_TYPE',
    '$httpParamSerializer',
    'ID_TYPE',
    'ADDRESS_TYPE',
    function($rootScope,
        $scope,
        $window,
        adminService,
        $state,
        toastr,
        paginationFactory,
        $stateParams,
        uiGridConstants,
        dashboardService,
        KYC_STATUS,
        STATUS,
        $timeout,
        $filter,
        IMAGE_TYPE,
        $httpParamSerializer,
        ID_TYPE,
        ADDRESS_TYPE) {
        var vm = this;

        vm.pageHeading = "Add";
        $scope.gridOptions = [];

        vm.Status = STATUS;
        var searchParams = [];
        $scope.orderCoulmn = '';
        $scope.orderDirection = '';

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
                exporterPdfOrientation: 'landscape',
                exporterPdfPageSize: 'LETTER',
                exporterPdfMaxGridWidth: 600,
                exporterCsvFilename: 'Activity.csv',
                exporterMenuPdf: false,
                exporterMenuCsv: false,
                editableCellTemplate: "<div><form name=\"inputForm\"><input type=\"INPUT_TYPE\" ng-class=\"'colt' + col.uid\" ui-grid-editor ng-model=\"MODEL_COL_FIELD\" min=\"0\"></form></div>",
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                    gridApi.edit.on.afterCellEdit($scope, function(rowEntity, colDef, newValue, oldValue) {
                        if ((newValue == null || newValue == '') && newValue != 0) {
                            rowEntity[colDef.field] = oldValue;
                            return true;
                        }

                        if (!$window.confirm("Are you sure ? You want to update.")) {
                            rowEntity[colDef.field] = oldValue;
                            return false;
                        } else {
                            var updateParam = {
                                'currency_code': rowEntity.currency_code,
                                'operation': rowEntity.operation,
                                'column_name': colDef.field,
                                'column_value': newValue,
                                'old_column_value': oldValue
                            }
                            adminService.updateTradeLimit(updateParam).then(function(response) {
                                if (response.success) {
                                    toastr.success(response.message);

                                } else {
                                    toastr.error(response.message);

                                }
                            }, function(err) {
                                toastr.error('Something went wrong');

                            });
                        }
                        $scope.$apply();
                    });
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
                                searchParams['order_column'] = value.colDef.order_column == undefined ? value.field : value.colDef.order_column;
                                searchParams['order_direction'] = value.sort.direction;

                                $scope.orderCoulmn = value.field;
                                $scope.orderDirection = value.sort.direction;
                            }
                        });
                        $scope.drawGrid();

                    });
                },
                columnDefs: [{
                        field: 'id',
                        name: 'S.No',
                        width: '80',
                        enableSorting: false,
                        enableFiltering: false,
                       // headerCellClass: 'text-center',

                        //cellTemplate: '<span>{{rowRenderIndex+1}}</span>',
                        cellClass: 'text-center'
                    },
                    {
                        field: 'updated_by_email',
                        name: 'Admin User',
                        enableCellEdit: false,
                        width: '200',
                        cellClass: 'text-center',
                        filter: {
                            placeholder: 'Search..'
                        }
                    },
                    {
                        field: 'operation',
                        enableCellEdit: false,
                        width: '200',
                        enableFiltering: false,
                        cellClass: 'text-center'


                    },
                    {
                        field: 'email',
                        name: 'Customer',
                        enableCellEdit: false,
                        width: '200',
                        filter: {
                            placeholder: 'Search..'
                        },
                        cellClass: 'text-center',
                        cellTemplate: '<div>{{row.entity.email=="" ||row.entity.email== null ?"-":row.entity.email}}</div>'


                    },
                    {
                        field: 'currency_code',
                        enableCellEdit: false,
                        enableFiltering: false,
                        cellClass: 'text-center',
                        cellTemplate: '<div>{{row.entity.currency_code=="" ||row.entity.currency_code== null ?"-":row.entity.currency_code}}</div>'

                    },
                    {
                        field: 'column_name',
                        name: 'Change Key',
                        enableFiltering: false,
                        enableCellEdit: false,
                        cellClass: 'text-center',
                        cellTemplate: '<div>{{row.entity.column_name=="" ||row.entity.column_name== null ?"-":row.entity.column_name}}</div>'


                    },

                    {
                        field: 'old_value',
                        name: 'Old Value',
                        enableFiltering: false,
                        enableCellEdit: false,
                        cellClass: 'text-center',
                        cellTemplate: '<div>{{row.entity.old_value=="" ||row.entity.old_value== null ?"-":row.entity.old_value}}</div>'

                    },
                    {
                        field: 'new_value',
                        name: 'New Value',
                        enableFiltering: false,
                        enableCellEdit: false,
                        cellClass: 'text-center',
                        cellTemplate: '<div>{{row.entity.new_value=="" ||row.entity.new_value== null ?"-":row.entity.new_value}}</div>'


                    },
                    {
                        field: 'comment',
                        name: 'Comment',
                        enableFiltering: false,
                        enableCellEdit: false,
                        cellClass: 'text-center',
                        cellTemplate: '<div>{{row.entity.comment=="" ||row.entity.comment== null ?"-":row.entity.comment}}</div>'

                    },
                    // {field: 'currency_icon',headerCellClass:'text-center',cellClass:'text-center', enableCellEdit: false,cellTemplate: '<span><img class=\"currency-icon\" ng-if=\"row.entity.currency_icon\" width=\"50px\" src=\"images/currencyimage/{{row.entity.currency_icon}}\" lazy-src></span>', enableSorting: false, enableFiltering: false}
                ],
                exporterFieldCallback: function(grid, row, col, input) {
                    //console.log("row",row)
                    // if (col.name == 'S.No.') {
                    //     return input = '<span>{{rowRenderIndex+1}}</span>';
                    // }
                    // if (col.name == 'S.No.') {
                    //     return input = rowRenderIndex + 1;
                    // }
                    if (col.name == 'Comment') {
                        return input = row.entity.comment == "" || row.entity.comment == null ? "-" : row.entity.comment;
                    }
                    if (col.name == 'New Value') {
                        return input = row.entity.new_value == "" || row.entity.new_value == null ? "-" : row.entity.new_value;
                    }
                    if (col.name == 'Old Value') {
                        return input = row.entity.old_value == "" || row.entity.old_value == null ? "-" : row.entity.old_value;
                    }
                    if (col.name == 'Change Key') {
                        return input = row.entity.column_name == "" || row.entity.column_name == null ? "-" : row.entity.column_name;
                    }
                    if (col.name == 'Customer') {
                        return input = row.entity.email == "" || row.entity.email == null ? "-" : row.entity.email;
                    }
                    return input;
                },
                //  exporterSuppressColumns: ['action'],

            };
            $scope.drawGrid();
        }

        $scope.export = function(format) {
            var limit = $scope.pagination.totalItems;
            var data = { 'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1 }
            var result = adminService.getActivityDetails(data);
            result.then(
                function(response) {
                    $scope.gridOptions.data = response.data;
                    if (format == 'csv') {
                        $scope.gridApi.exporter.csvExport('all', 'all');
                        $scope.drawGrid();
                    } else if (format == 'pdf') {
                        $scope.gridApi.exporter.pdfExport('all', 'all');
                        $scope.drawGrid();
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
            var result = adminService.getActivityDetails(data);
            result.then(
                function(response) {
                    console.log("gdgewjgd", response)
                    $scope.pagination.totalItems = response.count;
                    $scope.gridOptions.data = response.data;
                    paginationFactory.getTableHeight($scope);
                },
                function(error) {
                    console.log("Error: " + error);
                });
        }
        //Default Load
        $scope.getGridData();
    }
]);