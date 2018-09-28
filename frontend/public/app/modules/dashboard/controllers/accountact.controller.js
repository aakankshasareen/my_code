dashboard.controller("AccountActivityController", ['$rootScope', '$scope', '$state', 'dashboardService', 'AuthService', '$interval', '$window', 'loginService', '$uibModal',
    function($rootScope, $scope, $state, dashboardService, AuthService, $interval, $window, loginService, $uibModal) {

       // var vm = this;

        $scope.date = {};

        $scope.dateOptions = {
            maxDate: new Date(),
            //  minDate: new Date(),
            startingDay: 1,
            showWeeks: false
        };

        $scope.fromPopup = {
            opened: false
        };

        $scope.toPopup = {
            opened: false
        };

        $scope.showDateError = false;

        $scope.accountActivityGridOptions = [];

        $scope.orderCoulmn = '';
        $scope.orderDirection = '';

        //Pagination
        $scope.pagination = {
            paginationPageSizes: [10, 25, 50, 100],
            ddlpageSize: 10,
            pageNumber: 1,
            pageSize: 10,
            totalItems: 0,
            filter_value: '',

            getTotalPages: function() {
                return Math.ceil(this.totalItems / this.pageSize);
            },
            pageSizeChange: function() {
                if (this.ddlpageSize == "All")
                    this.pageSize = $scope.pagination.totalItems;
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
        };

        //ui-Grid Call
        $scope.getGridData = function() {
            $scope.accountActivityGridOptions = {
                useExternalPagination: true,
                useExternalSorting: true,
                enableFiltering: false,
                enableSorting: false,
                enableRowSelection: false,
                enableSelectAll: false,
                enableColumnMenus: false,
                enableColumnResizing: true,
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                    $scope.gridApi.grid.clearAllFilters = function() {
                        this.columns.forEach(function(column) {
                            column.filters.forEach(function(filter) {
                                filter.term = undefined;
                            });
                        });
                        searchParams = undefined;
                        $scope.getGridData(); // your own custom callback
                    };

                    $scope.gridApi.core.on.sortChanged($scope, function(val) {
                        var grid = this.grid;
                        angular.forEach(grid.columns, function(value, key) {
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
                columnDefs: [{
                        field: 'activity_description',
                        name: 'Activity',
                        width: '25%',
                        cellTooltip: function(row, col) {
                            return 'Activity: ' + row.entity.activity_description;
                        },

                    },
                    {
                        field: 'device_browser',
                        name: 'Device Browser',
                        width: '*',
                        cellTooltip: function(row, col) {
                            return 'Device Browser: ' + row.entity.device_browser;
                        },
                    },
                    {
                        field: 'device_os',
                        name: 'Device OS',
                        width: '*',
                        cellTooltip: function(row, col) {
                            return 'Device OS: ' + row.entity.device_os;
                        },
                    },
                    {
                        field: 'device_ipAddress',
                        name: 'Device IP',
                        width: '*',
                        cellTooltip: function(row, col) {
                            return 'Device IP: ' + row.entity.device_ipAddress;
                        },
                    },
                    {
                        field: 'created_at',
                        name: 'Activity Date',
                        width: '*',
                        cellFilter: 'dateFilter :  $root.displayDate',
                        filterCellFiltered: true,
                        cellTooltip: true,
                        sort: { direction: 'desc', priority: 0 }
                    }
                ],
            };

            $scope.drawGrid();
        }

        $scope.drawGrid = function() {
            var data = [];
            var NextPage = (($scope.pagination.pageNumber - 1) * $scope.pagination.pageSize);
            var NextPageSize = $scope.pagination.pageSize;
            var object1 = { 'limit': NextPageSize, 'offset': NextPage }

            if (angular.isDefined($scope.date.from) && angular.isDefined($scope.date.to)) {
                var object2 = {
                    'date_to': moment(new Date($scope.date.to).getTime()).add(86340, 's').format("YYYY-MM-DD HH:mm:ss"),
                    'date_from': moment(new Date($scope.date.from).getTime()).format("YYYY-MM-DD HH:mm:ss"),
                }
            }

            var data = angular.merge({}, object1, object2);
            var result = dashboardService.getAccActivity(data);
            result.then(
                function(response) {
                    $scope.pagination.totalItems = response.totalcount;
                    $scope.accountActivityGridOptions.data = response.data;
                },
                function(error) {
                    console.log("Error: " + error);
                });
        }


        $scope.activityOnDate = function() {
            if ($scope.accountActForm.$valid) {
                var data = {
                    "date_from": moment(new Date($scope.date.from).getTime()).format("YYYY-MM-DD HH:mm:ss"),
                    "date_to": moment(new Date($scope.date.to).getTime()).add(86340, 's').format("YYYY-MM-DD HH:mm:ss")
                }
                if (data.date_from <= data.date_to) {
                    $scope.showDateError = false;
                    //  $scope.drawGrid();
                    $scope.pagination.pageNumber = 1;
                    var NextPage = (($scope.pagination.pageNumber - 1) * $scope.pagination.pageSize);
                    var NextPageSize = $scope.pagination.pageSize;

                    var data1 = { 'limit': NextPageSize, 'offset': 0 };
                    var data2 = angular.merge({}, data, data1);
                    var result = dashboardService.getAccActivity(data2);
                    result.then(
                        function(response) {
                            $scope.pagination.totalItems = response.totalcount;
                            $scope.accountActivityGridOptions.data = response.data;
                        });
                } else if (data.date_from > data.date_to) {
                    $scope.showDateError = true;
                }
                $scope.submittedActivity = false;
            } // if form valid
        }

        $scope.clearAll = function() {
            $scope.date = {};
            $scope.pagination.pageNumber = 1;
            var NextPage = (($scope.pagination.pageNumber - 1) * $scope.pagination.pageSize);
            var NextPageSize = $scope.pagination.pageSize;

            var data = { 'limit': NextPageSize, 'offset': 0 };
            var data1 = angular.merge({}, data);
            var result = dashboardService.getAccActivity(data1);
            result.then(
                function(response) {
                    $scope.pagination.totalItems = response.totalcount;
                    $scope.accountActivityGridOptions.data = response.data;
                });

        };

        //Default Load
        $scope.getGridData();
    }
]);