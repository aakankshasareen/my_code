admin.controller('myprofileCtrl', ['$rootScope', '$scope', '$window', 'adminService', '$state', 'toastr', '$stateParams', 'uiGridConstants', 'dashboardService', 'KYC_STATUS', 'STATUS', '$timeout', '$filter', 'IMAGE_TYPE', '$httpParamSerializer', 'ID_TYPE', 'ADDRESS_TYPE', 'vcRecaptchaService',
    function ($rootScope, $scope, $window, adminService, $state, toastr, $stateParams, uiGridConstants, dashboardService, KYC_STATUS, STATUS, $timeout, $filter, IMAGE_TYPE, $httpParamSerializer, ID_TYPE, ADDRESS_TYPE, vcRecaptchaService) {
        var vm = this;

         navigator.sayswho = (function() {
                var ua = navigator.userAgent,
                    tem,
                    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
                if (/trident/i.test(M[1])) {
                    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                    return 'IE ' + (tem[1] || '');
                }
                if (M[1] === 'Chrome') {
                    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
                    if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
                }
                M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
                if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
                return M.join(' ');
            })();

            if (vm.setUser == undefined || vm.getUser == undefined) {
                $.getJSON('https://api.ipify.org?format=json', function(data) {
                    sessionStorage.setItem("myIP", data.ip);
                });
            }

            // for other controllers
            sessionStorage.setItem('myBrowser', navigator.sayswho);
            sessionStorage.setItem('myOS', $window.navigator.platform);
            sessionStorage.setItem('myDevice', "Desktop");

            vm.device_os = $window.navigator.platform;
            vm.device_browser = navigator.sayswho;
            vm.device_name = "Desktop";
            vm.inputType = 'password';
            vm.showPassword = false;


        //Pagination
        vm.hideShowPassword = function() {

           if (vm.inputType == 'password') {
                vm.inputType = 'text';
                vm.showPassword = true;
            } else {
                vm.inputType = 'password';
                vm.showPassword = false;

            }
        };

        if ($state.is('admin.editMyProfile')) {
            adminService.getCountryList().then(function (response) {
                if (response.success) {
                    vm.CountryList = response.data;
                }
            });
        }

        vm.getStatesByCountryId = function () {
            var data = {id: vm.country.id};
            adminService.getStatesByCountryId(data).then(function (response) {
                if (response.success) {
                    vm.StateList = response.data;
                }
            });
        };

        /*vm.cancel = function () {
            $state.go('admin.customerList');
        }*/

        if ($state.is('admin.editMyProfile')) {
            dashboardService.getCountries().then(function (response) {
                if (response.success) {
                    vm.getCountry = response.data;
                };
            });
        }
        vm.getCitiesByCountryId = function (country) {
            dashboardService.getCitiesByCountry({'id': country.id}).then(function (response) {
                if (response.success)
                    vm.getCitiesByCountry = response.data;
            }, function (err) {
                toastr.error( 'Something went wrong. Please try again later.');

            });
        }


        vm.getStatesByCountryId_Res = function (country) {
            dashboardService.getStates({'id': country.id}).then(function (response) {
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
            dashboardService.getStates({'id': country.id}).then(function (response) {
                if (response.success) {
                    vm.getStatesPer = response.data;
                }
            }, function (err) {});
        }

        vm.getCitiesByStateId_Res = function (state) {
            if (angular.isDefined(vm.poaRes.res_state)) {
                dashboardService.getCities({'id': vm.poaRes.res_state.id}).then(function (response) {
                    if (response.success)
                        vm.getCitiesRes = response.data;
                }, function (err) {});
            } else
                vm.poaRes.res_city = undefined;
        }

        vm.getCitiesByStateId_Per = function (state) {
            if (angular.isDefined(vm.poaP.state) && vm.poaP.state != null) {
                dashboardService.getCities({'id': vm.poaP.state.id}).then(function (response) {
                    if (response.success)
                        vm.getCitiesPer = response.data;
                }, function (err) {});
            } else
                vm.poaP.city = undefined;
        }


        vm.getAddressProofTypes = function (country) {
            dashboardService.getKYCData({'type': 4, 'country_id': country.id}).then(function (response) {
                if (response.success) {
                    if (response.data.length != 0) {
                        response.data.sort(sortItems);
                        vm.getAddrProofTypes = response.data;
                    }
                }
            });
        }

        if ($state.is('admin.editMyProfile')) {
            //  $rootScope.showSpinner = true;
            //var id = $stateParams.id;
            adminService.editMyProfile().then(function (response) {

                if (response.success) {
                    vm.profile = response.data[0];
                    if (response.data[0].country !== "" && response.data[0].country != null) {
                        vm.profile.country = {'id': response.data[0].country};

                        vm.getCitiesByCountryId(response.data[0].country);
                        vm.profile.city = {'id': response.data[0].city};
                    }
                    // $rootScope.showSpinner = false;
                }
            }, function (err) {
                toastr.error( 'Something went wrong. Please try again later.');

                // $rootScope.showSpinner = false;
            });
        }



        vm.saveProfile = function () {
            if (vm.profileForm.$valid) {
                var data = {
                    "device_os": sessionStorage.getItem('myOS'),
                    "device_name": sessionStorage.getItem('myDevice'),
                    "device_browser": sessionStorage.getItem('myBrowser'),
                    "device_ipAddress": sessionStorage.getItem('myIP'),
                    "fullname": vm.profile.fullname,
                    "city": vm.profile.city.id,
                    "country": vm.profile.country.id,
                    "address": vm.profile.address,
                    "postal_code": vm.profile.postal_code,
                    "mobileNumber": vm.profile.mobileNumber,

                }

                $rootScope.showSpinner = true;
                adminService.updateMyProfile(data).then(function (response) {
                    if (response.success) {
                        toastr.success('Profile Information is updated successfully.');
                        $state.go('admin.dashboard');
                    } else {
                        toastr.error(response.message);

                    }
                    $rootScope.showSpinner = false;
                }, function (err) {
                    toastr.error('Something went wrong. Please try again later.');

                    $rootScope.showSpinner = false;
                });
            }
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



    //forgot password Email Check
        vm.sendForgotPassEmail = function(data) {
                if (vm.loginForm1.$valid /*&& vm.getAdminUser.g_recaptcha_response !== undefined*/) {
                    //$rootScope.showSpinner = true;
                    adminService.sendMailLinkForgotPs(data).then(function(response) {

                        if (response.success) {
                            $state.reload('adminforgotpass');
                            toastr.success(response.message);

                    } else {
                            // vcRecaptchaService.reload();
                            toastr.error(response.message);

                        }
                        //$rootScope.showSpinner = false;
                    }, function(err) {
                        // vcRecaptchaService.reload();
                        toastr.error('Something went wrong. Please try again later.');

                        //$rootScope.showSpinner = false;
                    });
                }  /*else if(vm.getAdminUser.g_recaptcha_response == undefined) {
                    toastr.error('Captcha is required.');

                }*/
        }


     //forgot password
        vm.resetAdminPassword = function() {

                 if (vm.passwordForm.$valid) {
                    vm.forgotPswd.token = $stateParams.token;
                    vm.forgotPswd.device_os = sessionStorage.getItem('myOS'),
                    vm.forgotPswd.device_name = sessionStorage.getItem('myDevice'),
                    vm.forgotPswd.device_browser = sessionStorage.getItem('myBrowser'),
                    vm.forgotPswd.device_ipAddress = sessionStorage.getItem('myIP'),
                    //$rootScope.showSpinner = true;
                    adminService.resetAdminPassword(vm.forgotPswd).then(function(response) {
                        if (response.success) {
                            toastr.success('Password Reset Successful.');

                           //var origin = window.location.origin;
                           //$window.location.href = origin + '/admin';
                           $state.go("adminpaswordsuccess");
                        } else {
                            toastr.error(response.message);

                        }
                        //$rootScope.showSpinner = false;
                    }, function(err) {
                        toastr.error('Something went wrong. Please try again later.');

                        //$rootScope.showSpinner = false;
                    });
                }
        }

        vm.resetPassLoginAdmin=function(){

                var origin = window.location.origin;
                $window.location.href = origin + '/admin';
        }

        vm.adminChangePassword= function () {

            //  if ($state.is('admin.changePassword')) {
              if(vm.changeForm.$valid){

                var data={
                    "verify2FA":vm.verCode,
                    "currentPassword" : vm.currentPassword,
                    "newPassword": vm.newPassword,
                    // "confirm" : vm.confirmPassword,
                    "device_ipAddress": sessionStorage.getItem('myIP'),
                    "device_os": sessionStorage.getItem('myOS'),
                    "device_name": sessionStorage.getItem('myDevice'),
                    "device_browser": sessionStorage.getItem('myBrowser'),

                }
                console.log(data.current);
                adminService.adminChangePassword(data).then(function (response) {
                     if (response.success) {
                        toastr.success('Password Changed Successful.');
                        $state.go('admin.dashboard');

                        vm.changeForm = response.data[0];
                        if (response.data[0].current !== "" && response.data[0].current != null) {
                            vm.changeForm.current = {'id': response.data[0].current};
                            vm.changeForm.new = {'id': response.data[0].new};
                            // vm.changeForm.confirm = {'id': response.data[0].confirm};
                        }
                    } else{
                      toastr.error(response.message);
                    }
                }, function (err) {
                    // console.log("err");
                    toastr.error('Something went wrong. Please try again later.');

                    // $rootScope.showSpinner = false;
                });
            // }

        }
      }
            //save user data - kyc verification
    }
])
