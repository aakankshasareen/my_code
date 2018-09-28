dashboard.controller("supportController", ['$rootScope', '$scope', '$window', '$state', 'toastr', 'uiGridConstants', '$stateParams', 'faqService', 'AuthService', '$interval', 'SUPPORT_TYPE', function($rootScope, $scope, $window, $state, toastr, uiGridConstants, $stateParams, faqService, AuthService, $interval, SUPPORT_TYPE) {

    var vm = this;
    vm.pageHeading = "Add";
    vm.Status = [{ id: '1', 'name': 'Open' }, { id: '0', 'name': 'close' }];
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

    var vm = this;

    vm.pageHeading = "Add";
    vm.Status = [{ id: '1', 'name': 'Open' }, { id: '0', 'name': 'close' }];

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

    vm.getAllTicketList = function() {

        $rootScope.showSpinner = true;
        faqService.getSupportList().then(function(response) {


            if (response.success)

                $scope.data = response != null ? response.result.records : "";
            $rootScope.showSpinner = false;
        }, function(err) {
            toastr.error('Something went wrong. Please try again later.');
            // ngToast.create({
            //     className: 'danger',
            //     content: 'Something went wrong. Please try again later.'
            // });
            $rootScope.showSpinner = false;
        });
    }
    vm.getAllTicketList();

    if ($state.is('dashboard.support')) {

        faqService.getUserProfile().then(function(response) {

            if (response.success) {
                vm.email = response.userData[0].email;
            } else {
                toastr.error(response.message);
                // ngToast.create({
                //     className: 'danger',
                //     content: response.message
                // });
            }
            $rootScope.showSpinner = false;
        }, function(err) {
            toastr.error('Something went wrong. Please try again later.');
            // ngToast.create({
            //     className: 'danger',
            //     content: 'Something went wrong. Please try again later.'
            // });
            $rootScope.showSpinner = false;
        });
    }

    vm.supportTypes = SUPPORT_TYPE;

    vm.addSupportData = function(data, file) {

        var myIdData = angular.copy(data);

        console.log(myIdData)

        var data1 = {
            'issue': myIdData.issue.$viewValue.value,
            'email': myIdData.email.$viewValue,
            'subject': myIdData.subject.$viewValue,
            'desc': myIdData.desc.$viewValue,
        }

        $rootScope.showSpinner = true;
        faqService.addSupportData(data1).then(function(response) {
            if (response.success) {
                if (file != undefined) {
                    faqService.uploadSupport(file, response.id).then(function(response) {
                        $rootScope.showSpinner = false;
                        // console.log(data)
                        if (response.data.success == true) {
                            toastr.success('Support Information is Added successfully.');

                            $state.reload('dashboard.support')
                        } else {
                            toastr.error("please select jpeg, jpg, png, pdf, file");

                        }
                    });
                } else {
                    toastr.success('Support Information is Added successfully.');

                    $state.reload('dashboard.support')

                }

            } else {
                toastr.error(response.message);
            }

            $rootScope.showSpinner = false;
        }, function(err) {
            toastr.error('Something went wrong. Please try again later.');

            $rootScope.showSpinner = false;
        });
    }



    if ($state.is('dashboard.repplySupport')) {

        $scope.coomentalldata = function() {
            vm.pageHeading = "Reply";
            offset = $scope.page == 1 ? 0 : offset + limit;
            limit = $scope.page == 1 ? 10 : offset + 2;

            var data = {
                "id": $stateParams.id,
                "offset": offset,
                "limit": limit,
            }
            var id = $stateParams.id;
            faqService.repplySupport(data).then(function(response) {

                if (response.success) {
                    for (var i = 0; i < response.data.length; i++) {
                        $scope.maindataArray.push(response.data[i])
                    }
                    console.log(response.data[0]);


                    vm.issue = response.data[0].issue;
                    vm.subject = response.data[0].subject;
                    vm.description = response.data[0].description;
                    vm.query_type = response.data[0].query_type;
                    vm.status = { id: response.data[0].status };
                    vm.id = response.data[0].id;
                    vm.assignId = response.data[0].assign_to;
                    vm.receiverId = response.data[0].created_by;
                    $scope.maindata = $scope.maindataArray;

                    $scope.page++;

                }
            });
        }
        $scope.coomentalldata()
    }

    vm.add = function() {

        var data = {
            "comment": vm.answer,
            "support_id": vm.id,
            "receiver_id": vm.assignId,
            //"status": vm.status.id,
        }

        faqService.addSupportComment(data).then(function(response) {
            if (response.success) {
                $state.reload()
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
        }, function(err) {
            toastr.error('Something went wrong');
            // ngToast.create({
            //     className: 'danger',
            //     content: 'Something went wrong'
            // });
        });
    };

    vm.update = function() {

        var data = {
            "id": vm.id,
            "status": vm.status.id,
        }

        faqService.updateSupportStatusCu(data).then(function(response) {
            if (response.success) {
                $state.go('dashboard.supportticket')
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
        }, function(err) {
            toastr.error('Something went wrong');
            // ngToast.create({
            //     className: 'danger',
            //     content: 'Something went wrong'
            // });
        });
    };


    vm.updateSupportStatusCu = function(row, statusdata) {
        var status = statusdata == 1 ? 'Close' : 'Open';
        if (!$window.confirm("Are you sure you want to " + status + " this Ticket ?")) {
            return false;
        }
        var data = {
            id: row,
            status: statusdata == 1 ? 0 : 1,
        };

        faqService.updateSupportStatusCu(data).then(function(response) {
            if (response.success) {
                toastr.success(response.message);
                // ngToast.create({
                //     className: 'success',
                //     content: response.message
                // });
                $state.reload('dashboard.support')

            } else {
                toastr.error(response.message);
                // ngToast.create({
                //     className: 'danger',
                //     content: response.message
                // });
            }
        }, function(err) {
            toastr.error('Something went wrong');
            // ngToast.create({
            //     className: 'danger',
            //     content: 'Something went wrong'
            // });
        });
    };



    vm.reOpenTicketCu = function() {

        var param = { id: vm.id };
        faqService.reOpenTicketCu(param).then(function(response) {
            if (response.success) {
                toastr.success(response.message);
                // ngToast.create({
                //     className: 'success',
                //     content: response.message
                // });
                $state.reload('dashboard.repplySupport')

            } else {
                toastr.error(response.message);
                // ngToast.create({
                //     className: 'danger',
                //     content: response.message
                // });
            }


        }, function(err) {
            toastr.error('Something went wrong');
            // ngToast.create({
            //     className: 'danger',
            //     content: 'Something went wrong'
            // });
        });
    };

    vm.cancel = function() {
        $state.go('dashboard.support');
    }

    vm.downloadDoc = function(url) {

        downloadForm.path.value = url;
        downloadForm.submit();
    }

}])