admin.controller("supportCtrl", ['$rootScope', '$scope', '$window','SUPPORT_TYPE', 'adminService', '$state', 'toastr', 'paginationFactory', '$stateParams', 'Upload', 'uiGridConstants', '$timeout',
    function ($rootScope, $scope, $window, SUPPORT_TYPE, adminService, $state, toastr, paginationFactory, $stateParams, Upload, uiGridConstants, $timeout) {


        var vm = this;
        vm.pageHeading = "Change";
        vm.Status = [{ id: '1', 'name': 'Open' }, { id: '0', 'name': 'Close' }];
        $scope.gridOptions = [];
        var searchParams = [];
        vm.FaqCategoryList = [];
        $scope.orderCoulmn = '';
        $scope.orderDirection = '';
        $scope.maindataArray = [];
        var dataValueMain = "";
        var maindata = "";
        $scope.page = 1;
        var limit = 0;
        var offset = 0;
        $scope.token = sessionStorage.getItem('globals');
        vm.time = moment(new Date().getTime()).format("YYYY-MM-DD HH:mm:ss")
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
                exporterCsvFilename: 'support.csv',
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
                        field: 'issue', headerCellClass: 'text-left', width: '*', filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: SUPPORT_TYPE,
                        },
                        enableSorting: false,
                        cellFilter:'supportIssueFilter'
                    },
                    {
                        field: 'email', headerCellClass: 'text-left', name: 'email', width: '*', filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'subject', headerCellClass: 'text-left', name: 'subject', width: '*', filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'doc_name ', headerCellClass: 'text-left', name: 'Document', width: '*',cellTemplate: '<a ng-if=\"row.entity.doc_name\"  ng-click=\"grid.appScope.downloadDoc(row.entity.document_path)\"><span class=\"currency-icon fa fa-download\"></span></a>', cellClass:'text-center', enableFiltering: false, enableSorting: false,
                    },
                    {
                        field: 'status', filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: [{ value: '1', label: 'Open' }, { value: '0', label: 'Closed' }]
                        }, cellFilter: 'mapSupportStatus', headerCellClass: $scope.highlightFilteredHeader, width: 110
                    },
                    { field: 'action', enableSorting: false, cellTemplate: '<div ui-view="_action"></div>', enableFiltering: false, width: '100' }
                ],
                exporterFieldCallback: function (grid, row, col, input) {
                    if (col.field == 'status') {
                        return input == '1' ? 'Open' : 'Closed';
                    }
                    if(col.field == 'issue'){
                        switch (input) {
                            case '1':
                                $return = 'Cryptocurrency Deposits';
                                break;
                            case '2':
                                $return = 'Cryptocurrency Withdrawals';
                                break;
                            case '3':
                                $return = 'USD Deposits';
                                break;
                            case '4':
                                $return = 'USD Withdrawals';
                                break;
                            case '5':
                                $return = 'Trading';
                                break;
                            case '6':
                                $return = 'Account Access/ Security';
                                break;
                            case '7':
                                $return = 'Account/ Bank verification';
                                break;
                            case '8':
                                $return = 'Google Authenticator 2FA';
                                break;
                            case '9':
                                $return = 'Change of Contact Details (email, mobile number)';
                                break;
                            default:
                                $return = ''
                        }
                        return $return;
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
            var result = adminService.getSupportListAdmin(data);
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
            var result = adminService.getSupportListAdmin(data);
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

        // $scope.FaqCategoryList;
        if ($state.is('admin.ticketStatus')) {
            var id = $stateParams.id;
            data = { id: id }
            adminService.changeStatus(data).then(function (response) {
                //console.log("$scope.maindataArray");
                //console.log($scope.maindataArray);
                if (response.success) {
                    /* vm.issue            = response.data[0].issue;
                     vm.subject          = response.data[0].subject;*/
                    vm.description = response.result[0].description;
                   
                    //vm.query_type       = response.data[0].query_type;
                    vm.status = { id: response.result[0].status };
                    vm.id = response.result[0].id;
                    console.log("fhhhhhhhhhhhhhhhhhhhhj",vm.time)
                }

            });
        }

        vm.update = function () {


            var data = {
                "id": vm.id,
                "status": vm.status.id,
            }

            adminService.updateSupportStatus(data).then(function (response) {
                if (response.success) {
                    $state.go('admin.supportList')
                    toastr.success(response.message);
                } else {
                    toastr.error(response.message);

                }
            }, function (err) {
                toastr.error('Something went wrong');

            });
        };



        if ($state.is('admin.repplySupport')) {


            $scope.coomentalldata = function () {
                // alert("this is a testing");
                vm.pageHeading = "Reply";

                //if () {}
                offset = $scope.page == 1 ? 0 : offset + limit;
                limit = $scope.page == 1 ? 10 : offset + 2;

                var data = {
                    "id": $stateParams.id,
                    "offset": offset,
                    "limit": limit,
                }
                var id = $stateParams.id;
                adminService.repplySupport(data).then(function (response) {
                    //console.log("$scope.maindataArray");
                    //console.log($scope.maindataArray);
                    if (response.success) {

                        for (var i = 0; i < response.data.length; i++) {

                            $scope.maindataArray.push(response.data[i])
                        }
                        //console.log("$scope.maindataArray.push(response.data[i])");
                        //console.log($scope.maindataArray)
                        //return;
                        vm.issue = response.data[0].issue;
                        vm.subject = response.data[0].subject;
                        vm.description = response.data[0].description;
                        vm.query_type = response.data[0].query_type;
                        vm.status = { id: response.data[0].status };
                        vm.id = response.data[0].id;
                        vm.assignId = response.data[0].assign_to;
                        vm.receiverId = response.data[0].created_by;
                        $scope.maindata = $scope.maindataArray;

                        //console.log("$scope.maindata");
                        //console.log($scope.maindata);
                        //$scope.maindataArray = response.data;
                        //$scope.getMoreData();

                        $scope.page++;

                    }

                });
            }
            $scope.coomentalldata()
        }

        //


        //$scope.commentData=$scope.maindataArray.slice(0, 1);

        // console.log("$scope.commentData");

        // console.log($scope.commentData);


        /* $scope.getMoreData = function () {
                     $scope.numberToDisplay = 1;
                       alert("132132131")
                     console.log("$scope.maindataArray");
                         console.log($scope.maindataArray);
     
                        console.log("$scope.commentData.length");
                        console.log($scope.commentData.length);
     
                         $scope.maindata = $scope.maindataArray;
     
                         console.log("$scope.maindata");
                         console.log($scope.maindata);
     
                     }
     
                        //$scope.getMoreData();
         */

        vm.add = function () {
            if (vm.form.$valid) {
                var data = {
                    "comment": vm.answer,
                    "support_id": vm.id,
                    "receiver_id": vm.receiverId,
                    //"status": vm.status.id,
                }

                adminService.addSupportComment(data).then(function (response) {
                    if (response.success) {
                        $state.reload()
                        toastr.success(response.message);
                    } else {
                        toastr.error(response.message);

                    }
                }, function (err) {
                    toastr.error('Something went wrong');
                });
            };
        };

        vm.updateSupportStatus = function (row) {

            if (!$window.confirm("Are you sure you want to change status of  this record ?")) {
                return false;
            }
            var data = {
                id: row.entity.id,
                status: row.entity.status == 1 ? 0 : 1,
            };

            //return;

            adminService.updateSupportStatus(data).then(function (response) {
                if (response.success) {
                    //                    var index = $scope.gridOptions.data.indexOf(row.entity);
                    //                    $scope.gridOptions.data.splice(index, 1);
                    toastr.success(response.message);
                    $state.reload('admin.supportList')

                } else {
                    toastr.error(response.message);

                }
            }, function (err) {
                toastr.success('Something went wrong');

            });
        };



        vm.reOpenTicket = function () {
            alert('52465')

            var param = { id: vm.id };
            adminService.reOpenTicket(param).then(function (response) {
                if (response.success) {
                    //                    var index = $scope.gridOptions.data.indexOf(row.entity);
                    //                    $scope.gridOptions.data.splice(index, 1);
                    toastr.success(response.message);

                    $state.reload('admin.repplySupport')

                } else {
                    toastr.success(response.message);

                }
            }, function (err) {
                toastr.error('Something went wrong');
            });
        };




        vm.deleteRecord = function (row) {

            if (!$window.confirm("Are you sure you want to delete this record ?")) {
                return false;
            }
            var param = { id: row.entity.id };
            adminService.deleteSupport(param).then(function (response) {
                if (response.success) {
                    //                    var index = $scope.gridOptions.data.indexOf(row.entity);
                    //                    $scope.gridOptions.data.splice(index, 1);

                    toastr.success(response.message);

                    $state.reload('admin.supportList')

                } else {
                    toastr.error(response.message);
                }
            }, function (err) {
                toastr.error('Something went wrong');
            });
        };

        vm.cancel = function () {
            $state.go('admin.supportList');
        }

    $scope.downloadDoc = function(url) {
        downloadForm.path.value = url;
        downloadForm.submit();
    }


    }])
    .filter('mapCStatus', function () {
        return function (input) {
            return input == '1' ? 'Active' : 'Inactive';
        }
    })
