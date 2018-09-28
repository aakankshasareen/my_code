admin.controller('customerCtrl', ['$rootScope', '$scope', '$window', 'adminService', '$state', 'toastr', '$stateParams', 'paginationFactory', 'uiGridConstants', 'dashboardService', 'KYC_STATUS', 'BANK_STATUS', 'STATUS', '$timeout', '$filter', 'IMAGE_TYPE', '$httpParamSerializer', 'ID_TYPE', 'ADDRESS_TYPE', '$interval', '$location',
    function ($rootScope, $scope, $window, adminService, $state, toastr, $stateParams, paginationFactory, uiGridConstants, dashboardService, KYC_STATUS, BANK_STATUS, STATUS, $timeout, $filter, IMAGE_TYPE, $httpParamSerializer, ID_TYPE, ADDRESS_TYPE, $interval, $location) {
        var vm = this;

        vm.pers = {};
        vm.poaRes = {};
        vm.poaP = {};
        vm.idType = {};
        var blockId = [];
        var blockIds = [];
        var difference = [];
        var a1 = [];
        var a2 = [];

        var pdfPath = 'assets/images/pdf.png';
        var docPath = 'assets/images/doc.jpeg';
        var noExtFound = 'assets/images/dummydoc.png';

        vm.pageHeading = "Add";
        $scope.gridOptions = [];
        $scope.token = sessionStorage.getItem('globals');


        vm.Status = [{ id: '1', 'name': 'Active' }, { id: '0', 'name': 'Inactive' }];

        var searchParams = [];

        var locationSearch = $location.search();

        var filterStatusArr = [];
        filterArr = KYC_STATUS.map(function (arr, index) {
            return arr.value;
        })
        var queryParam = parseInt(locationSearch.kyc_status);
        var filterKycStatus = undefined;
        var filterBankStatus = undefined;
        if (angular.isDefined(queryParam) && filterArr.indexOf(queryParam) >= 0) {
            var filterKycStatus = queryParam;
            searchParams['kyc_status'] = queryParam;
        }
        if (angular.isDefined(queryParam) && filterArr.indexOf(queryParam) >= 0) {
            var filterBankStatus = queryParam;
            searchParams['bank_status'] = queryParam;
        }

        $scope.orderCoulmn = '';
        $scope.orderDirection = '';

        paginationFactory.showPagination($scope);

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
                enableRowSelection: true,
                enableSelectAll: true,
                multiSelect: true,
                noUnselect: false,
                enableRowHeaderSelection: true,
                enableGroupHeaderSelection: true,
                enableGridMenu: true,
                enableColumnMenus: false,
                enableColumnResizing: true,
                exporterCsvFilename: 'Customer.csv',
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
                        $scope.drawGrid(); // your own custom callback
                        return false;
                    };
                    gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {

                        rows.forEach((e) => {
                            blockId.push(e.entity.id);
                            difference = blockId;
                        })
                    });

                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {

                        if (row.isSelected) {
                            blockId.push(row.entity.id);
                        } else {
                            blockIds.push(row.entity.id);
                        }

                        a1 = blockId;
                        a2 = blockIds;
                        difference = a1
                            .filter(x => !a2.includes(x))
                            .concat(a2.filter(x => !a1.includes(x)));
                    });

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
                    { field: 'serial_number', name: 'S.No.', width: '60', enableFiltering: false, enableSorting: false, headerCellClass: 'text-center', cellClass: 'text-center' },
                    {
                        field: 'fullname',
                        name: 'Name',
                        filter: {
                            placeholder: 'Search...'
                        },
                        width: '100'
                    },
                    //                    {field: 'state_name'},
                    {
                        field: 'email',
                        enableSorting: true,
                        order_column: 'u.email',
                        filter: {
                            placeholder: 'Search...'
                        },
                        width: '140'
                    },
                    {
                        field: 'id',
                        name: 'Customer_id',
                        enableFiltering: false,
                        enableSorting: false,
                        width: '9%',
                        cellClass: 'text-center'

                    },
                    {
                        field: 'mobileNumber',
                        name: 'Mobile',
                        filter: {
                            placeholder: 'Search...'
                        },
                        width: '150'
                    },
                    {
                        field: 'status',
                        filter: {
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: STATUS
                        },
                        enableCellEdit: true,
                        cellFilter: 'mapStatus',
                        enableSorting: false,
                        width: '110'
                    },
                    {
                        field: 'kyc_status',
                        name: 'KYC Status',
                        displayName: 'KYC Status',
                        filter: {
                            term: filterKycStatus,
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: KYC_STATUS
                        },
                        cellFilter: 'mapKycStatus',
                        enableSorting: false,
                        width: '150'
                    },
                    {
                        field: 'bank_status',
                        name: 'Bank Status',
                        displayName: 'Bank Status',
                        filter: {
                            term: filterBankStatus,
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: BANK_STATUS
                        },
                        cellFilter: 'mapBankStatus',
                        enableSorting: false,
                        width: '100'
                    },
                    {
                        field: 'created_at',
                        displayName: 'Member Since',
                        headerCellClass: 'text-left',
                        width: '100',
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{row.entity.created_at | adminDateFilter }}</div>',
                        enableFiltering: false,
                        enableSorting: false,
                        enableCellEdit: false,
                        filter: {
                            placeholder: 'Search...'
                        },
                        headerCellClass: 'text-center',
                        cellClass: 'text-center'
                    },

                    { field: 'action', enableSorting: false, cellTemplate: '<div ui-view="_action"></div>', width: '100', enableFiltering: false }
                ],
                exporterFieldCallback: function (grid, row, col, input) {
                    if (col.field == 'status') {
                        return input == '1' ? 'Active' : 'Inactive';
                    }
                    if (col.field == 'kyc_status') {
                        var $return = '';
                        switch (input) {
                            case 3:
                                $return = 'Not Verified';
                                break;
                            case 2:
                                $return = 'Verified';
                                break;
                            case 1:
                                $return = 'Pending';
                                break;
                            case 0:
                                $return = 'Incomplete';
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
            console.log(limit);
            var data = { 'limit': limit, 'offset': 0, 'order_column': $scope.orderCoulmn, 'order_direction': $scope.orderDirection, 'exportAs': 1 }
            var result = adminService.getAllCustomerList(data);
            result.then(
                function (response) {
                    $scope.gridOptions.data = response.result.records;

                    if (format == 'csv') {
                        $scope.gridApi.exporter.csvExport('all', 'all');

                    } else if (format == 'pdf') {
                        var s = $scope.gridApi.exporter.pdfExport('all', 'all');

                    }
                }).then(function () {
                    $scope.getGridData();
                });
        };

        vm.blockMultiple = function (blockIdaaaaaa) {

            if (difference.length) {
                if (!$window.confirm("Are you sure you want to block selected users ?")) {
                    return false;
                }
                var param = { id: difference };
                adminService.blockMultiple(param).then(function (response) {
                    if (response.success) {
                        //                    var index = $scope.gridOptions.data.indexOf(row.entity);
                        //                    $scope.gridOptions.data.splice(index, 1);
                        toastr.success(response.message);

                        $state.reload('admin.customerList')

                    } else {
                        toastr.error(response.message);

                    }
                }, function (err) {
                    toastr.error('Something went wrong');

                });
            } else {
                toastr.error('No rows selected');
            }
        };

        vm.unblockMultiple = function (blockIdaaaaaa) {
            if (difference.length) {
                if (!$window.confirm("Are you sure you want to unblock selected users ?")) {
                    return false;
                }
                var param = { id: difference };
                adminService.unblockMultiple(param).then(function (response) {
                    if (response.success) {
                        //                    var index = $scope.gridOptions.data.indexOf(row.entity);
                        //                    $scope.gridOptions.data.splice(index, 1);
                        toastr.success(response.message);

                        $state.reload('admin.customerList')

                    } else {
                        toastr.error(response.message);

                    }
                }, function (err) {
                    toastr.error('Something went wrong');

                });
            } else {
                toastr.error('No rows selected');
            }
        };

        vm.blockCustomer = function(row) {


            if (!$window.confirm("Are you sure you want to block this user ?")) {
                return false;
            }
            var param = { id: row.entity.id };
            adminService.blockCustomer(param).then(function(response) {
                if (response.success) {
                    //                    var index = $scope.gridOptions.data.indexOf(row.entity);
                    //                    $scope.gridOptions.data.splice(index, 1);
                    toastr.success(response.message);

                    $state.reload('admin.customerList')

                } else {
                    toastr.error(response.message);

                }
            }, function(err) {
                toastr.error('Something went wrong');

            });
        };

        vm.unblockCustomer = function(row) {


            if (!$window.confirm("Are you sure you want to unblock this user ?")) {
                return false;
            }
            var param = { id: row.entity.id };
            adminService.unblockCustomer(param).then(function(response) {
                if (response.success) {
                    //                    var index = $scope.gridOptions.data.indexOf(row.entity);
                    //                    $scope.gridOptions.data.splice(index, 1);
                    toastr.success(response.message);

                    $state.reload('admin.customerList')

                } else {
                    toastr.error(response.message);

                }
            }, function(err) {
                toastr.error('Something went wrong');

            });
        };

        $scope.drawGrid = function () {
            var data = [];
            var NextPage = (($scope.pagination.pageNumber - 1) * $scope.pagination.pageSize);
            var NextPageSize = $scope.pagination.pageSize;

            var object1 = { 'limit': NextPageSize, 'offset': NextPage }
            var object2 = searchParams;
            var data = angular.merge({}, object1, object2);
            var result = adminService.getAllCustomerList(data);
            result.then(
                function (response) {

                    $scope.pagination.totalItems = response.result.totalRecords[0].count;
                    $scope.gridOptions.data = response.result.records;
                    paginationFactory.getTableHeight($scope);
                },
                function (error) {
                    console.log("Error: " + error);
                }).then(() => $('select.ui-grid-filter-select').each(function (i, j) {
                    $(this).find('option:first').text('Show All');
                }));


        }

        //Default Load

        $scope.getGridData();


        if ($state.is('admin.addCustomer') || $state.is('admin.editCustomer')) {
            adminService.getCountryList().then(function (response) {
                if (response.success) {
                    vm.CountryList = response.data;
                }
            });
        }

        vm.getStatesByCountryId = function () {
            var data = { id: vm.country.id };
            adminService.getStatesByCountryId(data).then(function (response) {
                if (response.success) {
                    vm.StateList = response.data;
                }
            });
        };

        vm.deleteRecord = function (row) {
            if (!$window.confirm("Are you sure you want to delete this record ?")) {
                return false;
            }
            var param = { id: row.entity.id };
            adminService.deleteCustomer(param).then(function (response) {
                if (response.success) {
                    var index = vm.gridOptions.data.indexOf(row.entity);
                    vm.gridOptions.data.splice(index, 1);
                    toastr.success(response.message);
                    // ngToast.create({
                    //     className: 'success',
                    //     content: response.message
                    // });
                } else {
                    toastr.error(response.message);
                    // ngToast.create({
                    //     className: 'danger',
                    //     content: response.message
                    // });
                }
            }, function (err) {
                toastr.error('Something went wrong');
                // ngToast.create({
                //     className: 'danger',
                //     content: 'Something went wrong'
                // });
            });
        };

        vm.cancel = function () {
            $state.go('admin.customerList');
        }


        vm.showComment = function () {
            //            alert();
            $('[data-toggle="popover"]').popover();
        }

        // Set the default value of inputType
        vm.inputType = 'password';
        vm.showPassword = false;

        dashboardService.getDateFormat().then(function (response) {
            if (response.success && response.data.length != 0) {
                vm.formats = response.data;
                vm.format = vm.formats[0].date_format;
            } else {
                vm.formats = ['yyyy/MM/dd', 'dd-MMMM-yyyy', 'dd.MM.yyyy', 'shortDate'];
                vm.format = vm.formats[0];
            }
        });

        dashboardService.getCountries().then(function (response) {
            if (response.success) {
                vm.getCountry = response.data;
            };
        });

        vm.getCitiesByCountryId = function (country) {
            dashboardService.getCitiesByCountry({ 'id': country.id }).then(function (response) {
                if (response.success)
                    vm.getCitiesByCountry = response.data;
            }, function (err) {
                toastr.error('Something went wrong. Please try again later.');
                // ngToast.create({
                //     className: 'danger',
                //     content: 'Something went wrong. Please try again later.'
                // });
            });
        }


        vm.getStatesByCountryId_Res = function (country) {
            dashboardService.getStates({ 'id': country.id }).then(function (response) {
                if (response.success) {
                    vm.getStatesRes = response.data;
                    $rootScope.showSpinner = false;
                }
            }, function (err) {
                $rootScope.showSpinner = false;
            });

            vm.getAddressProofTypes(country);
        }

        vm.getStatesByCountryId_Per = function (country) {
            dashboardService.getStates({ 'id': country.id }).then(function (response) {
                if (response.success) {
                    vm.getStatesPer = response.data;
                }
            }, function (err) { });
        }

        vm.getCitiesByStateId_Res = function (state) {
            if (angular.isDefined(vm.poaRes.res_state)) {
                dashboardService.getCities({ 'id': vm.poaRes.res_state.id }).then(function (response) {
                    if (response.success)
                        vm.getCitiesRes = response.data;
                }, function (err) { });
            } else
                vm.poaRes.res_city = undefined;
        }

        vm.getCitiesByStateId_Per = function (state) {
            if (angular.isDefined(vm.poaP.state) && vm.poaP.state != null) {
                dashboardService.getCities({ 'id': vm.poaP.state.id }).then(function (response) {
                    if (response.success)
                        vm.getCitiesPer = response.data;
                }, function (err) { });
            } else
                vm.poaP.city = undefined;
        }


        vm.getAddressProofTypes = function (country) {
            adminService.getKYCData({ 'type': 4, 'country_id': country.id }).then(function (response) {
                if (response.success) {
                    if (response.data.length != 0) {
                        response.data.sort(sortItems);
                        vm.getAddrProofTypes = response.data;
                    }
                }
            });
        }

        if ($state.is('admin.editCustomer')) {
            //  $rootScope.showSpinner = true;
            var id = $stateParams.id;
            adminService.editCustomerProfile({ 'id': id }).then(function (response) {
                if (response.success) {
                    vm.profile = response.data;
                    if (response.data.country !== "" && response.data.country != null) {
                        vm.profile.country = { 'id': response.data.country };

                        vm.getCitiesByCountryId(response.data.country);
                        if (response.data.city !== "" && response.data.city != null)
                            vm.profile.city = { 'id': response.data.city };
                    }
                    // $rootScope.showSpinner = false;
                }
            }, function (err) {
                toastr.error('Something went wrong. Please try again later.');
                // ngToast.create({
                //     className: 'danger',
                //     content: 'Something went wrong. Please try again later.'
                // });
                // $rootScope.showSpinner = false;
            });
        }



        vm.saveProfile = function () {

            if (vm.profileForm.$valid) {
                var data = {
                    "device_os": vm.device_os,
                    "device_name": vm.device_name,
                    "device_browser": vm.device_browser,
                    "device_ipAddress": sessionStorage.getItem('myIP'),
                    "fullname": vm.profile.fullname,
                    "city": vm.profile.city.id,
                    "country": vm.profile.country.id,
                    "address": vm.profile.address,
                    "postal_code": vm.profile.postal_code,
                    "id": $stateParams.id
                }

                $rootScope.showSpinner = true;
                adminService.updateCustomerProfile(data).then(function (response) {
                    if (response.success) {
                        toastr.success('Profile Information is updated successfully.');
                        // ngToast.create({
                        //     className: 'success',
                        //     content: 'Profile Information is updated successfully.'
                        // });
                        $state.go('admin.customerList');
                    } else {
                        toastr.error(response.message);

                        // ngToast.create({
                        //     className: 'danger',
                        //     content: response.message
                        // });
                    }
                    $rootScope.showSpinner = false;
                }, function (err) {
                    toastr.error('Something went wrong. Please try again later.');
                    // ngToast.create({
                    //     className: 'danger',
                    //     content: 'Something went wrong. Please try again later.'
                    // });
                    $rootScope.showSpinner = false;
                });
            }
        }

        //kyc code

        vm.getIDTypesList = function (country) {
            adminService.getKYCData({ 'type': 2, 'country_id': country }).then(function (response) {
                if (response.success) {
                    response.data.sort(sortItems);
                    vm.getIDType = response.data;
                }
            });
        }

        vm.changeCountry = function (country) {
            vm.getIDTypesList(country.id);
            vm.idType.doc_name = undefined;
            vm.idType.doc_reference = undefined;
            vm.idType.issue_date = undefined;
            vm.idType.expiration_date = undefined;
        }

        vm.issueDate = {
            opened: false
        };

        vm.issueDate = {
            opened: false
        };
        vm.expDate = {
            opened: false
        }
        vm.dob = {
            opened: false
        }

        vm.dateExpiryOptions = {
            // maxDate: new Date(),
            //  minDate: new Date(),
            startingDay: 1,
            showWeeks: false
        };

        var sortItems = function (a, b) {
            var nameA = a.name.toUpperCase();
            var nameB = b.name.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            // names must be equal
            return 0;
        }

        if ($state.includes('admin.editCustomerKYC')) {

            var customer_id = $stateParams.id;

            adminService.getKycDetais({ id: customer_id }).then(function (response) {
                if (response.success) {
                    console.log('gggggggggggggggggg', response)
                    vm.path = response.data[0].kyc_form;
                    /*var data= {
                        'kyc_form':vm.kyc_form,
                        'selfie_photo': vm.selfie_photo,
                        'identity_doc': vm.identity_doc,
                        'address_doc': vm.address_doc,
                        'fund_source': vm.fund_source, //Source Of Funds Document
                        'transfer_purpose': vm.transfer_purpose //Intended Purpose Of Fund Transfer
                    }*/
                    /**
                     * vm.id for Identity Document
                     * vm.ad for Address Document
                     * vm.sp for Selfie Photo
                     * vm.sofd for Source Of Funds Document
                     * vm.ipoft for Intended Purpose Of Fund Transfer
                     */
                    vm.id = response.data[0].identity_doc;
                    vm.ad = response.data[0].address_doc;
                    vm.sp = response.data[0].selfie_photo;
                    vm.sofd = response.data[0].fund_source;
                    vm.ipoft = response.data[0].transfer_purpose;
                    vm.comment = response.result[0].kyc_status_comment;

                    /**
                     * For displaying on the admin panel.
                     */
                    $scope.kyc_text = vm.path.split('/')[vm.path.split('/').length - 1].split('.')[0];
                    $scope.id_text = vm.id.split('/')[vm.path.split('/').length - 1].split('.')[0];
                    $scope.ad_text = vm.ad.split('/')[vm.path.split('/').length - 1].split('.')[0];
                    $scope.sp_text = vm.sp.split('/')[vm.path.split('/').length - 1].split('.')[0];
                    $scope.sofd_text = vm.sofd ? vm.sofd.split('/')[vm.path.split('/').length - 1].split('.')[0] : "";
                    $scope.ipoft_text = vm.ipoft ? vm.ipoft.split('/')[vm.path.split('/').length - 1].split('.')[0] : "";
                    console.log("$scope.kyc_text", $scope.kyc_text, $scope.id_text, $scope.ad_text, $scope.sp_text, $scope.sofd_text, $scope.ipoft_text);
                } else {
                    console.log('errrorrr', response)
                }
            })

            vm.downloadDoc = function (url, event) {

                downloadForm.path.value = url;
                downloadForm.submit();
                event.preventDefault();

            }

            adminService.getKYCData({ type: 1, country_id: 101 }).then(function (response) {
                vm.getKycTabs = response.data;
                for (var i = 0; i < vm.getKycTabs.length; i++) {
                    if (vm.getKycTabs[i].id == 2)
                        vm.showIdTab = true;
                    if (vm.getKycTabs[i].id == 1)
                        vm.showPersTab = true;
                    if (vm.getKycTabs[i].id == 3)
                        vm.showAddrTab = true;
                }
            });



            adminService.editCustomerProfile({ id: customer_id }).then(function (response) {
                if (response.success) {

                    vm.pers = response.data;
                    var param_data = { path: response.data.document_path };
                    vm.photo_uploaded_href = adminService.downloadFile(param_data);

                    var cie = checkImageExtension(response.data.filename1);

                    if (angular.isDefined(cie)) {
                        if (cie.index !== -1) {
                            adminService.getImageData({ path: response.data.document_path }).then(function (response) {
                                vm.profilePhoto = response.data;
                            });
                        } else {
                            if (cie.ext == 'pdf') {
                                vm.profilePhoto = pdfPath;
                            } else if (cie.ext == 'doc' || cie.ext == 'docx') {
                                vm.profilePhoto = docPath;
                            } else
                                vm.profilePhoto = noExtFound;
                        }
                    }

                    if (vm.pers.date_of_birth != null) {
                        vm.pers.date_of_birth = new Date(vm.pers.date_of_birth);
                    }
                }
            }, function (err) {
                toastr.error('Something went wrong. Please try again later.');
                // ngToast.create({
                //     className: 'danger',
                //     content: 'Something went wrong. Please try again later.'
                // });
            });

            var checkImageExtension = function (param) {
                if (angular.isDefined(param) && param !== null) {
                    var ext = $filter('extension')(param);
                    ext = ext.toLowerCase();
                    var rt = IMAGE_TYPE.indexOf(ext);

                    return { index: rt, ext: ext };
                }
            }

            vm.changeIdType = function (data) {
                var dataId = vm.idType.doc_name.id;
                var dataName = $.grep(vm.getIDType, function (data) {
                    return data.id == dataId;
                })[0].name;
                vm.idType.doc_name.name = dataName;
            }

            adminService.getKycAddressById({ id: customer_id }).then(function (response) {
                if (response.success) {
                    for (var i = 0; i < response.data.length; i++) {
                        if (response.data[i].type == 1) {

                            if (response.data[i].f_b_type == 1) {
                                vm.poaP = response.data[i];

                                var param_data = { path: response.data[i].document_path };
                                vm.permanent_uploaded_href = adminService.downloadFile(param_data);

                                var cie = checkImageExtension(response.data[i].filename1);
                                if (angular.isDefined(cie)) {
                                    if (cie.index !== -1) {
                                        adminService.getImageData({ path: response.data[i].document_path }).then(function (response) {
                                            vm.permanentUploaded = response.data;
                                        });
                                    } else {
                                        if (cie.ext == 'pdf') {
                                            vm.permanentUploaded = pdfPath;
                                        } else if (cie.ext == 'doc' || cie.ext == 'docx') {
                                            vm.permanentUploaded = docPath;
                                        } else
                                            vm.permanentUploaded = noExtFound;
                                    }
                                }

                                // if (response.data[i].document_path) {
                                //     dashboardService.getImageFile({ 'path': response.data[i].document_path }).then(function(response) {
                                //         vm.permanentUploaded = response;
                                //     }, function(err) {});
                                // }

                                if (response.data[i].country !== "") {
                                    vm.poaP.country = { 'id': response.data[i].country };

                                    vm.getStatesByCountryId_Per(vm.poaP.country);

                                    vm.poaP.state = { 'id': response.data[i].state };
                                    vm.getCitiesByStateId_Per(vm.poaP.state);

                                    vm.poaP.city = { 'id': response.data[i].city };
                                } else {
                                    vm.poaP.country = undefined;
                                    // vm.poaP.state = undefined;
                                    //  vm.poaP.city = undefined;
                                }

                                if (vm.poaP.pin_code == 'undefined')
                                    vm.poaP.pin_code = undefined;
                                if (vm.poaP.address == 'undefined')
                                    vm.poaP.address = undefined;
                                if (response.data[i].doc_name)
                                    vm.poaP.doc_name = { 'id': response.data[i].doc_name };
                            }

                            if (response.data[i].f_b_type == 2) {
                                var param_data = { path: response.data[i].document_path };
                                vm.permanentBack_uploaded_href = adminService.downloadFile(param_data);

                                var cie = checkImageExtension(response.data[i].filename1);
                                if (cie.index !== -1) {
                                    adminService.getImageData({ path: response.data[i].document_path }).then(function (response) {
                                        vm.permanentBackUploaded = response.data;
                                    })
                                } else {
                                    if (cie.ext == 'pdf') {
                                        vm.permanentBackUploaded = pdfPath;
                                    } else if (cie.ext == 'doc' || cie.ext == 'docx') {
                                        vm.permanentBackUploaded = docPath;
                                    } else
                                        vm.permanentBackUploaded = noExtFound;
                                }
                            }

                        } else if (response.data[i].type == 2) {
                            if (response.data[i].f_b_type == 1) {

                                var param_data = { path: response.data[i].document_path };
                                vm.residential_uploaded_href = adminService.downloadFile(param_data);

                                var cie = checkImageExtension(response.data[i].filename1);
                                if (cie.index !== -1) {
                                    adminService.getImageData({ path: response.data[i].document_path }).then(function (response) {
                                        vm.residentialUploaded = response.data;
                                    });
                                } else {
                                    if (cie.ext == 'pdf') {
                                        vm.residentialUploaded = pdfPath;
                                    } else if (cie.ext == 'doc' || cie.ext == 'docx') {
                                        vm.residentialUploaded = docPath;
                                    } else
                                        vm.residentialUploaded = noExtFound;
                                }

                                // if (response.data[i].document_path) {
                                //     dashboardService.getImageFile({ 'path': response.data[i].document_path }).then(function(response) {
                                //         vm.residentialUploaded = response;
                                //     }, function(err) {});
                                // }

                                if (angular.isDefined(response.data[i].country)) {
                                    vm.poaRes.res_country = { 'id': response.data[i].country };
                                    vm.getStatesByCountryId_Res(vm.poaRes.res_country);
                                    vm.poaRes.res_state = { 'id': response.data[i].state };

                                    vm.getCitiesByStateId_Res(vm.poaRes.res_state);
                                    vm.poaRes.res_city = { 'id': response.data[i].city };
                                }

                                vm.poaRes.res_address = response.data[i].address;
                                vm.poaRes.res_pin_code = response.data[i].pin_code;
                                //   vm.poaRes.doc_name = response.data[i].doc_name;
                                if (response.data[i].doc_name) {
                                    vm.poaRes.doc_name = { 'id': response.data[i].doc_name };
                                    vm.getAddressProofTypes(response.data[i].country);
                                }
                            }

                            if (response.data[i].f_b_type == 2) {
                                var param_data = { path: response.data[i].document_path };
                                vm.residentialBack_uploaded_href = adminService.downloadFile(param_data);

                                var cie = checkImageExtension(response.data[i].filename1);
                                if (cie.index !== -1) {
                                    adminService.getImageData({ path: response.data[i].document_path }).then(function (response) {
                                        vm.residentialBackUploaded = response.data;
                                    });
                                } else {
                                    if (cie.ext == 'pdf') {
                                        vm.residentialBackUploaded = pdfPath;
                                    } else if (cie.ext == 'doc' || cie.ext == 'docx') {
                                        vm.residentialBackUploaded = docPath;
                                    } else
                                        vm.residentialBackUploaded = noExtFound;
                                }

                            }
                        } // if type == 2
                    }
                    console.log("poaP", vm.poaP);
                    console.log("poaRes", vm.poaRes);
                    if (vm.poaP.address === vm.poaRes.res_address &&
                        vm.poaP.pin_code === vm.poaRes.res_pin_code &&
                        vm.poaP.country.id === vm.poaRes.res_country.id &&
                        vm.poaP.state.id === vm.poaRes.res_state.id &&
                        vm.poaP.city.id === vm.poaRes.res_city.id) {
                        console.log("DId i find it out!")
                        vm.check = true;
                    }
                }
            }, function (err) {
                toastr.error('Something went wrong. Please try again later.');

                // ngToast.create({
                //     className: 'danger',
                //     content: 'Something went wrong. Please try again later.'
                // });
            });

            //download pdf and images
            vm.downloadDoc = function (url) {
                downloadForm.path.value = url;
                downloadForm.submit();
            }

            // Identification Tab

            adminService.getKycIdInfoById({ id: customer_id }).then(function (response) {
                if (response.success) {
                    vm.idType = response.data[0];

                    vm.idType.issue_date = new Date(vm.idType.issue_date); //resetting date string to date object
                    if (vm.idType.expiration_date)
                        vm.idType.expiration_date = new Date(vm.idType.expiration_date);
                    for (var i = 0; i < response.data.length; i++) {
                        if (response.data[i].doc_type == 1) {

                            if (response.data[i].f_b_type == 1) { // country is available only in fb type 1
                                vm.idType.issuing_country = { 'id': response.data[i].issuing_country };
                                vm.idType.doc_name = { 'id': response.data[i].doc_name };

                                adminService.getKYCData({ id: customer_id, 'type': 2, 'country_id': response.data[i].issuing_country.id }).then(function (response) {
                                    if (response.success) {
                                        if (response.data.length != 0) {
                                            response.data.sort(sortItems);
                                            vm.getIDType = response.data;
                                        } else {
                                            vm.getIDType = ID_TYPE;
                                        }
                                    } else {
                                        vm.getIDType = ID_TYPE;
                                    }
                                    vm.changeIdType(vm.idType.doc_name);
                                });

                                if (response.data[i].document_path) {

                                    var param_data = { path: response.data[i].document_path };
                                    vm.idProofFront_uploaded_href = adminService.downloadFile(param_data);

                                    var cie = checkImageExtension(response.data[i].filename1);
                                    console.log(cie);
                                    if (cie.index !== -1) {
                                        adminService.getImageData({ path: response.data[i].document_path }).then(function (response) {
                                            vm.idProofUploaded = response.data;
                                        });
                                    } else {
                                        if (cie.ext == 'pdf') {
                                            vm.idProofUploaded = pdfPath;
                                        } else if (cie.ext == 'doc' || cie.ext == 'docx') {
                                            vm.idProofUploaded = docPath;
                                        } else
                                            vm.idProofUploaded = noExtFound;
                                    }
                                }
                            } // if fbtype 1

                            if (response.data[i].document_path && response.data[i].f_b_type == 2) {
                                var param_data = { path: response.data[i].document_path };
                                vm.idProofBack_uploaded_href = adminService.downloadFile(param_data);

                                var cie = checkImageExtension(response.data[i].filename1);
                                if (cie.index !== -1) {
                                    adminService.getImageData({ path: response.data[i].document_path }).then(function (response) {
                                        vm.idProofBackUploaded = response.data;
                                    });
                                } else {
                                    if (cie.ext == 'pdf') {
                                        vm.idProofBackUploaded = pdfPath;
                                    } else if (cie.ext == 'doc' || cie.ext == 'docx') {
                                        vm.idProofBackUploaded = docPath;
                                    } else
                                        vm.idProofBackUploaded = noExtFound;
                                }
                            }
                        } else if (response.data[i].doc_type == 4) {
                            if (response.data[i].document_path) {
                                var param_data = { path: response.data[i].document_path };
                                vm.selfie_uploaded_href = adminService.downloadFile(param_data);

                                var cie = checkImageExtension(response.data[i].filename1);
                                if (cie.index !== -1) {
                                    adminService.getImageData({ path: response.data[i].document_path }).then(function (response) {
                                        vm.selfieUploaded = response.data;
                                    });
                                } else {
                                    if (cie.ext == 'pdf') {
                                        vm.selfieUploaded = pdfPath;
                                    } else if (cie.ext == 'doc' || cie.ext == 'docx') {
                                        vm.selfieUploaded = docPath;
                                    } else
                                        vm.selfieUploaded = noExtFound;
                                }
                            }
                        }
                    }
                }
            }, function (err) {
                toastr.error('Something went wrong. Please try again later.');
                // ngToast.create({
                //     className: 'danger',
                //     content: 'Something went wrong. Please try again later.'
                // });
            });
        }

        vm.sameAsRes = function () {

            if (vm.check) {
                if (angular.isDefined(vm.poaRes.res_country)) {
                    vm.poaP.country = angular.copy(vm.poaRes.res_country);
                    vm.getStatesByCountryId_Per(vm.poaRes.res_country);

                    vm.poaP.state = angular.copy(vm.poaRes.res_state);

                    vm.getCitiesByStateId_Per(vm.poaRes.res_state);
                    vm.poaP.city = angular.copy(vm.poaRes.res_city);
                }

                vm.poaP.address = angular.copy(vm.poaRes.res_address);
                vm.poaP.pin_code = angular.copy(vm.poaRes.res_pin_code);
                vm.poaP.doc_name = angular.copy(vm.poaRes.doc_name);

            } else if (!vm.check) {
                vm.poaP.country = undefined;
                vm.poaP.state = undefined;
                vm.poaP.city = undefined;
                vm.poaP.address = undefined;
                vm.poaP.pin_code = undefined;
            }
        }

        //save user data - kyc verification

        vm.saveData = function (form, data, file_front, doc_type, selfie, file_back) { // ID INFO

            if (form.$valid) {
                $rootScope.showSpinner = true;
                var customer_id = $stateParams.id;
                var myIdData = angular.copy(data); // to prevent date from nullifying on form submit
                myIdData.issue_date = moment(new Date(myIdData.issue_date).getTime()).format("YYYY-MM-DD");

                if (myIdData.expiration_date)
                    myIdData.expiration_date = moment(new Date(myIdData.expiration_date).getTime()).format("YYYY-MM-DD");
                // else delete myIdData.expiration_date;
                myIdData.issuing_country = myIdData.issuing_country.id;
                myIdData.doc_name = myIdData.doc_name.id;
                myIdData.id = customer_id;
                delete myIdData.f_b_type;

                adminService.kycData(myIdData).then(function (response) {
                    if (response.success) {
                        if (file_front || selfie || file_back) {
                            if (file_front) {
                                console.log('file_front')
                                adminService.uploadKyc(file_front, customer_id, doc_type, '1').then(function (response) {
                                    $rootScope.showSpinner = false;

                                    if (response.data.success) {

                                        toastr.success('Data saved successfully.');
                                        // ngToast.create({
                                        //     className: 'success',
                                        //     content: 'Data saved successfully.'
                                        // });
                                        $(".tab-navigation .nav-link[data-tab='#3']").trigger("click");
                                    } else {
                                        toastr.error(response.data.message);
                                        // ngToast.create({
                                        //     className: 'danger',
                                        //     content: response.data.message
                                        // });
                                    }
                                }, function (err) {
                                    toastr.error('Something went wrong. Please try again later.');
                                    // ngToast.create({
                                    //     className: 'danger',
                                    //     content: 'Something went wrong. Please try again later.'
                                    // });
                                    $rootScope.showSpinner = false;
                                });
                            }
                            if (file_back) {
                                console.log('file_back')
                                adminService.uploadKyc(file_back, customer_id, doc_type, '2').then(function (response) {
                                    $rootScope.showSpinner = false;

                                    if (response.data.success) {
                                        toastr.success('Data saved successfully.');
                                        // ngToast.create({
                                        //     className: 'success',
                                        //     content: 'Data saved successfully.'
                                        // });
                                        $(".tab-navigation .nav-link[data-tab='#3']").trigger("click");
                                    } else {
                                        toastr.error(response.data.message);
                                        // ngToast.create({
                                        //     className: 'danger',
                                        //     content: response.data.message
                                        // });
                                    }
                                }, function (err) {
                                    toastr.error('Something went wrong. Please try again later.');
                                    // ngToast.create({
                                    //     className: 'danger',
                                    //     content: 'Something went wrong. Please try again later.'
                                    // });
                                    $rootScope.showSpinner = false;
                                });
                            }
                            if (selfie) {
                                console.log('selfie');
                                adminService.uploadKyc(selfie, customer_id, '4', '1').then(function (response) {
                                    $rootScope.showSpinner = false;
                                    if (response.data.success) {
                                        toastr.success('Data saved successfully.');
                                        // ngToast.create({
                                        //     className: 'success',
                                        //     content: 'Data saved successfully.'
                                        // });
                                        $(".tab-navigation .nav-link[data-tab='#3']").trigger("click");
                                    } else {
                                        toastr.error(response.data.message);
                                        // ngToast.create({
                                        //     className: 'danger',
                                        //     content: response.data.message
                                        // });
                                    }
                                }, function (err) {
                                    toastr.error('Something went wrong. Please try again later.');
                                    // ngToast.create({
                                    //     className: 'danger',
                                    //     content: 'Something went wrong. Please try again later.'
                                    // });
                                    $rootScope.showSpinner = false;
                                });
                            } //if - selfie
                        } else {
                            toastr.success('Data saved successfully.');
                            // ngToast.create({

                            //     className: 'success',
                            //     content: 'Data saved successfully.'
                            // });
                            $(".tab-navigation .nav-link[data-tab='#3']").trigger("click");
                        }
                        $rootScope.showSpinner = false;
                    } // if-response-success
                    else {
                        toastr.error(response.message);
                        // ngToast.create({
                        //     className: 'danger',
                        //     content: response.message
                        // });
                        $rootScope.showSpinner = false;
                    }
                }, function (err) {
                    toastr.error('Something went wrong. Please try again later.');
                    // ngToast.create({
                    //     className: 'danger',
                    //     content: 'Something went wrong. Please try again later.'
                    // });
                    $rootScope.showSpinner = false;
                });
            }
        }



        vm.savePersonalInfo = function (form, data, file, doc_type) {
            if (form.$valid) {
                var customer_id = $stateParams.id;

                data.doc_type = '3';

                $rootScope.showSpinner = true;

                var myPersonalData = angular.copy(data); // for date - to prevent date from nullifying on form submit
                myPersonalData.date_of_birth = moment(new Date(myPersonalData.date_of_birth).getTime()).format("YYYY-MM-DD");
                myPersonalData.id = customer_id;

                delete myPersonalData.f_b_type;
                delete myPersonalData.document_path;

                adminService.kycData(myPersonalData).then(function (response) {
                    if (response.success) {
                        if (file) {
                            adminService.uploadKyc(file, customer_id, doc_type, '1').then(function (response) { // doc_side for photo - 1
                                $rootScope.showSpinner = false;
                                if (response.data.success) {
                                    toastr.success('Data saved successfully.');
                                    // ngToast.create({
                                    //     className: 'success',
                                    //     content: 'Data saved successfully.'
                                    // });
                                    // dashboardService.userProfile().then(function (response) {
                                    //    $rootScope.userName = response.data.fullname;
                                    // });
                                    // $(".tab-navigation .nav-link[data-tab='#2']").trigger("click");
                                } else {
                                    toastr.error(response.data.message);
                                    // ngToast.create({
                                    //     className: 'danger',
                                    //     content: response.data.message
                                    // });
                                }
                            }, function (err) {
                                toastr.error('Something went wrong. Please try again later.');
                                // ngToast.create({
                                //     className: 'danger',
                                //     content: 'Something went wrong. Please try again later.'
                                // });
                                $rootScope.showSpinner = false;
                            });
                        } //if-file
                        else {
                            toastr.success('Data saved successfully.');
                            // ngToast.create({
                            //     className: 'success',
                            //     content: 'Data saved successfully.'
                            // });
                            $(".tab-navigation .nav-link[data-tab='#2']").trigger("click");
                        }
                        $rootScope.showSpinner = false;
                    } else {
                        toastr.error(response.message);
                        // ngToast.create({
                        //     className: 'danger',
                        //     content: response.message
                        // });
                        $rootScope.showSpinner = false;
                    }

                }, function (err) {
                    toastr.error('Something went wrong. Please try again later.');
                    // ngToast.create({
                    //     className: 'danger',
                    //     content: 'Something went wrong. Please try again later.'
                    // });
                    $rootScope.showSpinner = false;
                });
            } // form - valid

        }

        vm.saveAddressInfo = function (form, perData, file, fileBack, doc_type, resData, resFile, resFileBack, res_doc_type) {
            if (form.$valid) {
                $rootScope.showSpinner = true;

                var data = angular.copy(resData);
                var customer_id = $stateParams.id;
                data.res_country = data.res_country.id;
                data.res_state = data.res_state.id;
                data.res_city = data.res_city.id;
                data.doc_name = data.doc_name.id;
                data.id = customer_id;
                adminService.kycData(data).then(function (response) {
                    console.log(response);
                    if (response.success) {
                        if (resFile) {
                            adminService.uploadKyc(resFile, customer_id, res_doc_type, '1').then(function (response) {
                                if (response.data.success) {
                                    toastr.success('Data saved successfully.');
                                    // ngToast.create({
                                    //     className: 'success',
                                    //     content: 'Data saved successfully.'
                                    // });
                                } else {
                                    toastr.error(response.data.message);
                                    // ngToast.create({
                                    //     className: 'danger',
                                    //     content: response.data.message
                                    // });
                                }
                            }, function (err) {
                                toastr.error('Something went wrong. Please try again later.');
                                // ngToast.create({
                                //     className: 'danger',
                                //     content: 'Something went wrong. Please try again later.'
                                // });
                                $rootScope.showSpinner = false;
                            });
                        }
                        if (resFileBack) {
                            adminService.uploadKyc(resFileBack, customer_id, res_doc_type, '2').then(function (response) {
                                if (response.data.success) {
                                    toastr.success('Data saved successfully.');
                                    // ngToast.create({
                                    //     className: 'success',
                                    //     content: 'Data saved successfully.'
                                    // });
                                } else {
                                    toastr.error(response.data.message);
                                    // ngToast.create({
                                    //     className: 'danger',
                                    //     content: response.data.message
                                    // });
                                }
                            }, function (err) {
                                toastr.error('Something went wrong. Please try again later.');
                                // ngToast.create({
                                //     className: 'danger',
                                //     content: 'Something went wrong. Please try again later.'
                                // });
                                $rootScope.showSpinner = false;
                            });
                        }
                        $rootScope.showSpinner = false;
                    } else {
                        toastr.error(response.message);
                        // ngToast.create({

                        //     className: 'danger',
                        //     content: response.message
                        // });
                        $rootScope.showSpinner = false;
                    }

                }, function (err) {
                    toastr.error('Something went wrong. Please try again later.');
                    // ngToast.create({
                    //     className: 'danger',
                    //     content: 'Something went wrong. Please try again later.'
                    // });
                    $rootScope.showSpinner = false;
                })

                var permanentData = angular.copy(perData);

                //console.log(permanentData);

                if (angular.isUndefined(permanentData.country))
                    permanentData.country = "";
                else
                    permanentData.country = permanentData.country.id;
                if (angular.isUndefined(permanentData.state))
                    permanentData.state = "";
                else
                    permanentData.state = permanentData.state.id;
                if (angular.isUndefined(permanentData.city))
                    permanentData.city = "";
                else
                    permanentData.city = permanentData.city.id;

                if (angular.isUndefined(permanentData.doc_name))
                    permanentData.doc_name = "";
                else
                    permanentData.doc_name = permanentData.doc_name.id;

                permanentData.id = customer_id;
                adminService.kycData(permanentData).then(function (response) {
                    if (response.success) {
                        if (file) {
                            adminService.uploadKyc(file, customer_id, doc_type, '1').then(function (response) {
                                if (response.data.success) {
                                    toastr.success('Data saved successfully.');
                                    // ngToast.create({
                                    //     className: 'success',
                                    //     content: 'Data saved successfully.'
                                    // });
                                } else {
                                    toastr.error(response.data.message);
                                    // ngToast.create({
                                    //     className: 'danger',
                                    //     content: response.data.message
                                    // });
                                }
                            }, function (err) {
                                toastr.error('Something went wrong. Please try again later.');
                                // ngToast.create({
                                //     className: 'danger',
                                //     content: 'Something went wrong. Please try again later.'
                                // });
                                $rootScope.showSpinner = false;
                            });
                        }
                        if (fileBack) {
                            adminService.uploadKyc(fileBack, customer_id, doc_type, '2').then(function (response) {
                                if (response.data.success) {
                                    toastr.success('Data saved successfully.');
                                    // ngToast.create({
                                    //     className: 'success',
                                    //     content: 'Data saved successfully.'
                                    // });
                                } else {
                                    toastr.error(response.data.message);
                                    // ngToast.create({
                                    //     className: 'danger',
                                    //     content: response.data.message
                                    // });
                                }
                            }, function (err) {
                                toastr.error('Something went wrong. Please try again later.');
                                // ngToast.create({
                                //     className: 'danger',
                                //     content: 'Something went wrong. Please try again later.'
                                // });
                                $rootScope.showSpinner = false;
                            });
                        }
                        $rootScope.showSpinner = false;
                    } else {
                        /*  ngToast.create({
                         className: 'danger',
                         content: response.message
                         });*/
                        $rootScope.showSpinner = false;
                    }

                }, function (err) {
                    toastr.error('Something went wrong. Please try again later.');
                    // ngToast.create({
                    //     className: 'danger',
                    //     content: 'Something went wrong. Please try again later.'
                    // });
                    $rootScope.showSpinner = false;
                });

            } // form - valid
        }

        //Selected Call
        $scope.GetByID = function (model) {
            $scope.SelectedRow = model;
        };

        vm.approveKYC = function (param) {
            //            console.log(vm.kyc_status_comment);
            var kyc_status_comment = angular.isDefined(vm.kyc_status_comment) ? vm.kyc_status_comment : '';
            var kyc_status = 0;
            var data = [];
            if (param == "approve") {
                kyc_status = 2;
            }
            if (param == "disapprove") {
                kyc_status = 3;
            }
            var customer_id = $stateParams.id;

            data = { id: customer_id, kyc_status: kyc_status, kyc_status_comment: kyc_status_comment };

            adminService.approveKYC(data).then(function (response) {
                if (response.success) {

                    vm.pers.kyc_status_comment = kyc_status_comment;
                    $('#disapproveModal').modal('hide');
                    $('#approveModal').modal('hide');
                    if (param == "approve") {
                        vm.pers.kyc_status = 2;
                    } else {
                        vm.pers.kyc_status = 3;
                    }
                    vm.kyc_status_comment = "";
                    //                     $state.reload();
                    toastr.success(response.message);
                    // ngToast.create({
                    //     className: 'success',
                    //     content: response.message
                    // });
                } else {
                    console.log('fch')
                    toastr.error(response.message);
                    // ngToast.create({
                    //     className: 'danger',
                    //     content: response.message
                    // });
                }
            }, function (err) {
                toastr.error('Something went wrong. Please try again later.');
                // ngToast.create({
                //     className: 'danger',
                //     content: 'Something went wrong. Please try again later.'
                // });
                $rootScope.showSpinner = false;
            });
        }
    }
]).filter('mapKycStatus', function () {
    return function (input) {
        var $return = '';
        switch (input) {
            case 3:
                $return = 'Not Verified';
                break;
            case 2:
                $return = 'Verified';
                break;
            case 1:
                $return = 'Pending';
                break;
            case 0:
                $return = 'Incomplete';
                break;
            default:
                $return = '';
        }
        return $return;
    }
}).filter('mapBankStatus', function () {
    return function (input) {
        var $return = '';
        switch (input) {
            case 3:
                $return = 'Not Verified';
                break;
            case 2:
                $return = 'Verified';
                break;
            case 1:
                $return = 'Pending';
                break;
            case 0:
                $return = 'Incomplete';
                break;
            default:
                $return = '';
        }
        return $return;
    }
});