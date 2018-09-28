admin.controller("emailTemplateCtrl", ['$rootScope', '$scope', '$window', 'adminService', '$state', 'toastr', 'paginationFactory', '$stateParams', 'Upload', 'uiGridConstants', '$timeout',
    function ($rootScope, $scope, $window, adminService, $state, toastr, paginationFactory, $stateParams, Upload, uiGridConstants, $timeout) {

        var vm = this;

        vm.pageHeading = "Add";
        vm.Status = [{ id: '1', 'name': 'Active' }, { id: '0', 'name': 'Inactive' }];
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
                exporterCsvFilename: 'Email_template.csv',
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
                        field: 'template_name', headerCellClass: 'text-left', width: '*', filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'template_code', headerCellClass: 'text-left', name: 'Template Code', width: '*', filter: {
                            placeholder: 'Search...'
                        }
                    },
                    {
                        field: 'status', filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: [{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }]
                        }, cellFilter: 'mapStatus', headerCellClass: $scope.highlightFilteredHeader, width: 150
                    },
                    { field: 'action', enableSorting: false, cellTemplate: '<div ui-view="_action"></div>', enableFiltering: false, width: '100' }
                ],
                exporterFieldCallback: function (grid, row, col, input) {
                    if (col.field == 'status') {
                        return input == '1' ? 'Active' : 'Inactive';
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
            var result = adminService.getEmailTemplateList(data);
            result.then(
                function (response) {
                    $scope.gridOptions.data = response.result.records;
                    if (format == 'csv') {
                        $scope.gridApi.exporter.csvExport('all', 'all');
                    } else if (format == 'pdf') {
                        $scope.gridApi.exporter.pdfExport('all', 'all');
                    }
                }).then(function () {
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
            var result = adminService.getEmailTemplateList(data);
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
                }));;
        }

    


        //Default Load
        $scope.getGridData();
        var emailTemplateDoc;
        // $scope.FaqCategoryList;
        vm.uploadTemplateDoc = function () {

            if (vm.file) { //check if from is valid
                adminService.uploadEmailTemplate(vm.file).then(function (response) {

                    emailTemplateDoc = response.data.result.filename;

                });
            } else {

                emailTemplateDoc = vm.uploaded_icon;
            }
        }

        vm.add = function () {
            if (vm.form.$valid) {
                vm.uploadTemplateDoc();
                $timeout(() => {
                    var data = {
                        "template_name": vm.template_name,
                        "template_code": vm.template_code,
                        "template_subject": vm.template_subject,
                        "template_message": CKEDITOR.instances.template_message.getData().replace(/<[^>]+>/i, ''),
                        "cc_email": vm.cc_email,
                        "bcc_email": vm.bcc_email,
                        "status": vm.status.id,
                        "emailTemplateDoc": emailTemplateDoc
                    }


                    adminService.addEmailTemplate(data).then(function (response) {
                        //console.log("bbbb");
                        //console.log(response);
                        if (response.success) {
                            $state.go('admin.EmailTemplateList')
                            toastr.success(response.message);

                        } else {
                            toastr.error(response.message);

                        }
                    }, function (err) {
                        toastr.error('Something went wrong');

                    });
                }, 1000)

            }


        };


        if ($state.is('admin.editEmailTemplate')) {

            vm.pageHeading = "Edit";
            var id = $stateParams.id;
            adminService.editEmailTemplate({ id: id }).then(function (response) {

                if (response.success) {
                    vm.template_name = response.data[0].template_name;
                    vm.template_code = response.data[0].template_code;
                    vm.template_subject = response.data[0].template_subject;
                    vm.template_message = response.data[0].template_message;
                    vm.cc_email = response.data[0].cc_email;
                    vm.bcc_email = response.data[0].bcc_email;
                    vm.status = { id: response.data[0].status };
                    vm.uploadedfile = response.data[0].email_document ? "images/EmailTemplateDoc/" + response.data[0].email_document : '';
                    vm.uploaded_icon = response.data[0].email_document;
                    vm.id = response.data[0].id;
                }
            });
        }

        vm.update = function () {

            if (vm.form.$valid) {
                vm.uploadTemplateDoc();
                $timeout(() => {
                    var data = {
                        "id": vm.id,
                        "template_name": vm.template_name,
                        "template_code": vm.template_code,
                        "template_subject": vm.template_subject,
                        "template_message": CKEDITOR.instances.template_message.getData(),
                        "cc_email": vm.cc_email,
                        "bcc_email": vm.bcc_email,
                        "status": vm.status.id,
                        "emailTemplateDoc": emailTemplateDoc
                    }

                    adminService.updateEmailTemplate(data).then(function (response) {
                        if (response.success) {
                            $state.go('admin.EmailTemplateList')
                            toastr.success(response.message);

                        } else {
                            toastr.error(response.message);

                        }
                    }, function (err) {
                        toastr.error('Something went wrong');

                    });
                }, 1000)

            }
        };

        vm.downloadPdf = function () {

            console.log("Hey i am using data");

            var data = {
                "AA": "65465"
            }



            adminService.downloadPdf().then(function (response) {
                //var fileName = headers('content-disposition');
                //saveAs(response, fileName)
                // window.open('//'+config.global_ip+'/pdf/DownloadPDF?pname='+name+'.pdf');
                // $window.open("http://localhost:4000/admin/downloadPdf/file-1516099149965.pdf");
                var file = new Blob([data], { type: 'application/pdf' });
                saveAs(file, 'filename.pdf');
                if (response.success) {

                    $state.go('admin.EmailTemplateList')
                    toastr.success(response.message);

                } else {
                    toastr.error(response.message);

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
            adminService.deleteEmailTemplate(param).then(function (response) {
                if (response.success) {
                    // var index = $scope.gridOptions.data.indexOf(row.entity);
                    // $scope.gridOptions.data.splice(index, 1);
                    toastr.success(response.message);

                    $state.reload('admin.EmailTemplateList')

                } else {
                    toastr.error(response.message);

                }
            }, function (err) {
                toastr.error('Something went wrong');

            });
        };

        vm.cancel = function () {
            $state.go('admin.EmailTemplateList');
        }
    }])

    .filter('mapCStatus', function () {
        return function (input) {
            return input == '1' ? 'Active' : 'Inactive';
        }
    })
