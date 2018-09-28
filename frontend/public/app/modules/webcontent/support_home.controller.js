dashboard.controller("supporthomeController", ['$rootScope', '$scope', '$window', '$state',
 'toastr', 'faqService', 'AuthService',
    '$interval', 'SUPPORT_TYPE',
    function($rootScope, $scope, $window, $state, toastr,faqService,
        AuthService, $interval, SUPPORT_TYPE) {

        var vm = this;

        vm.support = {};

        vm.supportTypes = SUPPORT_TYPE;

        vm.contact = function(data) {
            if (vm.supportForm.$valid) {

            var sendData = angular.copy(data);
            // sendData.issue = sendData.issue.name;
           // console.log("hfsjfhhhhhh", sendData.issue)

                faqService.showSupportData(sendData).then(function(response) {
                    if (response.success) {

                        // if (files != undefined && files && files.length) {
/*            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              if (!file.$error) {
}}*/
                            // console.log('files ', files)
                            faqService.uploadSupportNoToken(response.id, sendData.email).then(function(response) {
                                    console.log('response is ', response)
                                if (response.data.success == true) {
                                    toastr.success('Thank You For Contacting Us, </br> We Will Get Back To You As Soon As Possible. ', { allowHtml: true});
                                } 
                                // else {
                                //     toastr.error("Please select jpeg, jpg, png, pdf file");
                                // }
                            });
                        // } 
                        {
                        //    toastr.success('Thank you for Contacting Us ,</br> we will get back to you as soon', { allowHtml: true});
                        }

                    } else {
                        toastr.error(response.message[0].msg);
                    }

                }, function(err) {
                    toastr.error('Something went wrong. Please try again later.');
                });
            }

        }

    }
]);