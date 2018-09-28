dashboard.controller("UserController", ['$rootScope', '$scope', '$state', 'dashboardService', 'AuthService', 'toastr', '$interval', '$window', 'loginService', '$uibModal', '$stateParams',
    function ($rootScope, $scope, $state, dashboardService, AuthService, toastr, $interval, $window, loginService, $uibModal, $stateParams) {

        var vm = this;

        vm.profile = {};

        vm.device_os = sessionStorage.getItem('myOS');
        vm.device_browser = sessionStorage.getItem('myBrowser');
        vm.device_name = sessionStorage.getItem('myDevice');
        $scope.token = sessionStorage.getItem('globals');
        console.log("get the user ctrl value for stateParams", $state.current)
        // Set the default value of inputType
        // vm.inputType = 'password';
        // vm.showPassword = false;

        // Hide & show password function

        //    $scope.hideShowPassword = function() {
        //                 if ($scope.inputType == 'password') {
        //                     $scope.inputType = 'text';
        //                     $scope.showPassword = true;
        //                 } else {
        //                     $scope.inputType = 'password';
        //                     $scope.showPassword = false;

        //                 }
        //             };
        vm.kyc_form_exists = 1;
        vm.selfie_photo_exists = false;
        vm.identity_doc_exists = false;
        vm.address_doc_exists = false;
        vm.fund_source_exists = false;
        vm.transfer_purpose_exists = false;
        vm.saveStatus = true;
        vm.getDataFromKYC = () => {

            dashboardService.getKycDetails().then(function (response) {
                if (response.success) {
                    /**
                     * kyc_form
                     * selfie_photo
                     * identity_doc
                     * address_doc
                     * fund_source
                     * transfer_purpose
                     * && response.result[0].selfie_photo && response.result[0].identity_doc && response.result[0].address_doc && response.result[0].fund_source && response.result[0].transfer_purpose
                     */
                    if (response.kycStatus != 3) {

                        if (response.result[0].kyc_form) {
                            vm.kyc_form_exists = 0;
                            vm.kyc_form = response.result[0].kyc_form;

                            vm.selfie_photo_exists = true;
                            vm.selfie_photo = response.result[0].selfie_photo;
                            
                            /**Additional part as per suggesstion from team */
                            vm.is_selfie_doc = (vm.selfie_photo.split('.')[vm.selfie_photo.split('.').length - 1] == 'doc' || vm.selfie_photo.split('.')[vm.selfie_photo.split('.').length - 1] == 'docx') ? true : false

                            vm.identity_doc_exists = true;
                            vm.identity_doc = response.result[0].identity_doc;

                            /**Additional part as per suggesstion from team */
                            vm.is_id_doc = (vm.identity_doc.split('.')[vm.identity_doc.split('.').length - 1] == 'doc' || vm.identity_doc.split('.')[vm.identity_doc.split('.').length - 1] == 'docx') ? true : false

                            vm.address_doc_exists = true;
                            vm.address_doc = response.result[0].address_doc;

                            /**Additional part as per suggesstion from team */
                            vm.is_addr_doc = (vm.address_doc.split('.')[vm.address_doc.split('.').length - 1] == 'doc' || vm.address_doc.split('.')[vm.address_doc.split('.').length - 1] == 'docx') ? true : false
                        }
                        else {
                            vm.kyc_form_exists = 1;
                        }

                        if (response.result[0].fund_source) {
                            vm.fund_source_exists = true;
                            vm.fund_source = response.result[0].fund_source;

                            /**Additional part as per suggesstion from team */
                            vm.is_fs_doc = (vm.fund_source.split('.')[vm.fund_source.split('.').length - 1] == 'doc' || vm.fund_source.split('.')[vm.fund_source.split('.').length - 1] == 'docx') ? true : false
                        }
                        if (response.result[0].transfer_purpose) {
                            vm.transfer_purpose_exists = true;
                            vm.transfer_purpose = response.result[0].transfer_purpose;

                            /**Additional part as per suggesstion from team */
                            vm.is_tp_doc = (vm.transfer_purpose.split('.')[vm.transfer_purpose.split('.').length - 1] == 'doc' || vm.transfer_purpose.split('.')[vm.transfer_purpose.split('.').length - 1] == 'docx') ? true : false
                        }

                        if (vm.kyc_form && vm.fund_source && vm.transfer_purpose && $rootScope.kycStatus != 3) {
                            vm.saveStatus = false;
                        }
                    }
                }

            })

        }
        vm.getDataFromKYC();
        vm.downloadDoc = function (url) {
            downloadKYCForm.path.value = url;
            downloadKYCForm.submit();
        }

        vm.savekycStatus = function (status, adminAprovalStatus) {
            /*            var data= {
                            'kyc_form':vm.kyc_form,
                            'selfie_photo': vm.selfie_photo,
                            'identity_doc': vm.identity_doc,
                            'address_doc': vm.address_doc,
                            'fund_source': vm.fund_source, //Source Of Funds Document
                            'transfer_purpose': vm.transfer_purpose //Intended Purpose Of Fund Transfer
                        }*/
            var data = {};
            if (adminAprovalStatus == 0 || adminAprovalStatus == 3) {
                if (vm.kyc_form && vm.selfie_photo && vm.identity_doc && vm.address_doc) {
                    data['kyc_form'] = vm.kyc_form;

                    data['selfie_photo'] = vm.selfie_photo;

                    data['identity_doc'] = vm.identity_doc;

                    data['address_doc'] = vm.address_doc;

                    if (vm.fund_source) {
                        data['fund_source'] = vm.fund_source;
                    }
                    if (vm.transfer_purpose) {
                        data['transfer_purpose'] = vm.transfer_purpose;
                    }
                }
                else {
                    return toastr.error("Please upload all required docs.")
                }
            }
            else {
                let error = true;
                if (vm.fund_source && vm.fund_source.type) {
                    data['fund_source'] = vm.fund_source;
                    error = false;
                }
                if (vm.transfer_purpose && vm.transfer_purpose.type) {
                    data['transfer_purpose'] = vm.transfer_purpose;
                    error = false;
                }
                if (error) {
                    return toastr.error("Please upload atleast one of the remaining docs.");
                }
            }

            /*        var data= {
                        'kyc_form':vm.kyc_form,
                        'selfie_photo': vm.selfie_photo,
                        'identity_doc': vm.identity_doc,
                        'address_doc': vm.address_doc,
                        'fund_source': vm.fund_source, //Source Of Funds Document
                        'transfer_purpose': vm.transfer_purpose //Intended Purpose Of Fund Transfer
                    }            */
            dashboardService.uploadKYCFields(data, adminAprovalStatus).then(function (response) {
                if (response.success == true) {
                    toastr.success("KYC form upload successfully");
                    dashboardService.getKycDetails().then(function (response) {
                        if (response.success) {
                            //vm.kyc_form =response.result[0].doc_name;
                            //if(response.result[0].doc_name)
                            // vm.value = 0;
                            vm.getDataFromKYC();
                            getKycStatusFn();
                        }

                    })
                }
                else if (response.success == 'wait') {
                }
                else {
                    // return toastr.error("KYC form not uploaded please try again ")
                    return toastr.error(response.message);
                }
            })
        }


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

        dashboardService.getAuthenticationStatus().then(function (response) {
            if (response.success) {
                vm.enable2FaButton = response.data.FA;
                vm.isEmailVerified = response.data.email;
                vm.showResendLink = false;
            } else {
                vm.enable2FaButton = 0;
            }
        });

        let getKycStatusFn = () => {
            dashboardService.getKycStatus().then(function (response) {
                $rootScope.kycStatus = response.completeinfo;
                $rootScope.kycComment = response.comment;
            }, function (err) { });
        }
        getKycStatusFn();

        dashboardService.getBankStatus().then(function (response) {
            $rootScope.bankStatus = response.status;
            $rootScope.bankComment = response.comment;
        }, function (err) { });

        vm.showResendLink = false;
        vm.sendEmailLink = function () {
            dashboardService.userProfileEmailVerification().then(function (response) {
                if (response.success) {
                    vm.showResendLink = true;
                    toastr.success('An email verification link has been sent to your email address.');
                    // ngToast.create({
                    //     className: 'success',
                    //     content: 'An email verification link has been sent to your email address.'
                    // });
                } else {
                    vm.showResendLink = false;
                    toastr.error(response.message);
                    // ngToast.create({
                    //     className: 'danger',
                    //     content: response.message
                    // });
                }
            });
        }

        var backupKey = '';

        vm.enable2FA = function () {
            //get QR code and 2FA backup key
            $uibModal.open({
                animation: false,
                templateUrl: 'app/modules/dashboard/views/userProfile/configure2FA.html',
                size: 'lg',
                //    backdrop: 'static',
                // windowClass: 'authentication-modal',
                controller: function ($scope, $uibModalInstance, FileSaver, Blob) {
                    loginService.getQR({ 'token': sessionStorage.getItem('globals') }).then(function (response) {
                        if (response.success) {
                            $scope.qrcode = '<img alt="QR Code" src="' + response.data + '"/>';
                            $scope.val = {
                                text: response.secretKey
                            }
                            backupKey = response.secretKey;
                        }

                    }, function (err) {
                        toastr.error('Something went wrong. Please try again later.');
                        // ngToast.create({
                        //     className: 'danger',
                        //     content: 'Something went wrong. Please try again later.'
                        // });
                    });

                    $scope.auth = {};

                    $scope.cancelConfig = function () {
                        $uibModalInstance.dismiss('cancel');
                    }

                    $scope.download = function () {
                        var data = new Blob([backupKey], { type: 'text/plain;charset=utf-8' });
                        FileSaver.saveAs(data, '2fa-backup-key.txt');
                    }

                    /*  $scope.input2fachanged = function() {
                        if (angular.isDefined($scope.auth.verifyCode) && $scope.auth.verifyCode.length == 6) {
                            $scope.verifyToken();
                        }
                    }
*/
                    $scope.verifyToken = function () {
                        if ($scope.authForm.$valid) {
                            var verifyData = {
                                "verifyCode": $scope.auth.verifyCode,
                                "status": 1
                            }

                            /*loginService.verifyToken(verifyData).then(function(response) {
                                if (response.success) {*/
                            dashboardService.faStatus(verifyData).then(function (response1) {
                                if (response1.success) {
                                    dashboardService.getAuthenticationStatus().then(function (response) {
                                        if (response.success) {
                                            vm.enable2FaButton = response.data.FA;
                                            toastr.success(response1.message);
                                            // ngToast.create({
                                            //     className: 'success',
                                            //     content: response1.message
                                            // });
                                        } else vm.enable2FaButton = 0;
                                    }, function (err) {
                                        vm.enable2FaButton = 0;
                                        toastr.error('Something went wrong. Please try again later.');
                                        // ngToast.create({
                                        //     className: 'danger',
                                        //     content: 'Something went wrong. Please try again later.'
                                        // });
                                    });
                                    $uibModalInstance.dismiss('cancel');
                                } else {
                                    toastr.error(response.message);
                                    // ngToast.create({
                                    //     className: 'danger',
                                    //     content: response1.message
                                    // });
                                }
                                // $uibModalInstance.dismiss('cancel');
                            }, function (err) {
                                toastr.error('Something went wrong. Please try again later.');
                                // ngToast.create({
                                //     className: 'danger',
                                //     content: 'Something went wrong. Please try again later.'
                                // });
                                $uibModalInstance.dismiss('cancel');
                            });

                            /*    } else {
                                    ngToast.create({
                                        className: 'danger',
                                        content: response.message
                                    });
                                    $uibModalInstance.dismiss('cancel');
                                }*/
                            /*  }, function(err) {
                                  ngToast.create({
                                      className: 'danger',
                                      content: 'Something went wrong. Please try again later.'
                                  });
                              });*/
                        }
                    }

                } // controller
            }); // modal
        }

        vm.disable2FA = function () {
            $uibModal.open({
                animation: false,
                templateUrl: 'app/modules/dashboard/views/userProfile/disable2FA.html',
                size: 'md',
                //backdrop: 'static',
                // windowClass: 'authentication-modal',
                controller: function ($scope, $uibModalInstance) {

                    $scope.verifyToken = function (verifycode) {
                        if ($scope.disable2FA.$valid) {

                            var verifyData = {
                                "verifyCode": verifycode,
                                "status": 0
                            }

                            /*  loginService.verifyToken(verifyData).then(function(response) {
                                  if (response.success) {*/
                            dashboardService.faStatus(verifyData).then(function (response1) {
                                if (response1.success) {
                                    dashboardService.getAuthenticationStatus().then(function (response) {
                                        if (response.success) {
                                            vm.enable2FaButton = response.data.FA;
                                            toastr.success(response.message);
                                            // ngToast.create({
                                            //     className: 'success',
                                            //     content: response1.message
                                            // });
                                        } else vm.enable2FaButton = 0;
                                    }, function (err) {
                                        toastr.error('Something went wrong. Please try again later.');
                                        // ngToast.create({
                                        //     className: 'danger',
                                        //     content: 'Something went wrong. Please try again later.'
                                        // });
                                    });
                                    $uibModalInstance.dismiss('cancel');
                                } else {
                                    toastr.error(response.message);
                                    // ngToast.create({
                                    //     className: 'danger',
                                    //     content: response1.message
                                    // });
                                }
                                // $uibModalInstance.dismiss('cancel');
                            }, function (err) {
                                toastr.error('Something went wrong. Please try again later.');
                                // ngToast.create({
                                //     className: 'danger',
                                //     content: 'Something went wrong. Please try again later.'
                                // });
                                $uibModalInstance.dismiss('cancel');
                            });
                            /*} else {
                                ngToast.create({
                                    className: 'danger',
                                    content: response.message
                                });
                            }
                            $uibModalInstance.dismiss('cancel');*/
                            /*  }, function(err) {
                                  ngToast.create({
                                      className: 'danger',
                                      content: 'Something went wrong. Please try again later.'
                                  });
                                  $uibModalInstance.dismiss('cancel');
                              });*/
                        }

                    } //verify token

                    $scope.cancelConfig = function () {
                        $uibModalInstance.dismiss('cancel');
                    }

                } // controller
            }); // modal
        }

        dashboardService.userProfile().then(function (response) {
            if (response.success) {
                vm.profile = response.data;
                if (response.data.country !== "" && response.data.country != null) {
                    vm.profile.country = { 'id': response.data.country };
                    vm.getCitiesByCountryId(response.data.country);
                    if (response.data.city != null) vm.profile.city = { 'id': response.data.city };
                }
                if (vm.profile.profileImage) {
                    getProfileImage(vm.profile.profileImage)
                }
                if (response.data.address !== "null") {
                    vm.profile.address = response.data.address;
                } else vm.profile.address = '';

                /**
                 * Reminder for KYC added at user end.
                 */
                console.log("var reminder", $rootScope.reminder);
                if(response.kycStatus === 0 && $state.current.url === '/profile' && $rootScope.reminder === 0){
                    $uibModal.open({
                        animation: false,
                        templateUrl: 'app/modules/dashboard/views/userProfile/KYCReminder.html',
                        size: 'md',
                        //    backdrop: 'static',
                        // windowClass: 'authentication-modal',
                        controller: function ($scope, $uibModalInstance, FileSaver, Blob) {        
                            $scope.auth = {};
        
                            $scope.cancelConfig = function () {
                                $rootScope.reminder++;
                                $uibModalInstance.dismiss('cancel');
                            }        
                        }
                    });
                }
            }
        }, function (err) {
            toastr.error('Something went wrong. Please try again later.');
            // ngToast.create({
            //     className: 'danger',
            //     content: 'Something went wrong. Please try again later.'
            // });
        });
        dashboardService.getKycIdInfo().then(function (response) {
            if (response.success && response.data.length) {
                vm.sumsubimages = response.data;
            }
        }, function (err) {
            toastr.error('Something went wrong. Please try again later.');
            // ngToast.create({
            //     className: 'danger',
            //     content: 'Something went wrong. Please try again later.'
            // });
        })
        dashboardService.getKycAddress().then(function (response) {
            if (response.success && response.data.length) {
                var address = response.data.find(function (element, index, arr) {
                    return element.doc_type == 5;
                });
                if (address) {
                    vm.streetAddress = address.address;
                    vm.zipCode = address.pin_code;
                }
            }
        }, function (err) {
            toastr.error('Something went wrong. Please try again later.');
            // ngToast.create({
            //     className: 'danger',
            //     content: 'Something went wrong. Please try again later.'
            // });
        })

        dashboardService.getBankDetails().then(function (response) {
            if (response.success && response.data.id)
            vm.bank = response.data;
        }).catch(function (err) {
            toastr.error('Error while fetching bank details.');
            // ngToast.create({
            //     className: 'danger',
            //     content: 'Error while fetching bank details.'
            // });
        })


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
                    "postal_code": vm.profile.postal_code
                }

                dashboardService.profileUpdate(data).then(function (response) {
                    if (response.success) {
                        dashboardService.userProfile().then(function (response) {
                            $rootScope.userName = response.data.fullname;
                        })
                        toastr.success('Profile Information is updated successfully.');
                        // ngToast.create({
                        //     className: 'success',
                        //     content: 'Profile Information is updated successfully.'
                        // });
                    } else {
                        toastr.error(response.message);
                        // ngToast.create({
                        //     className: 'danger',
                        //     content: response.message
                        // });
                    }
                }, function (err) {
                    toastr.error('Authentication Code Not Verified.');
                    // ngToast.create({
                    //     className: 'danger',
                    //     content: 'Something went wrong. Please try again later.'
                    // });
                });
            }
        }

        vm.changePasswordModal = function () {

            $uibModal.open({
                animation: false,
                templateUrl: 'app/modules/dashboard/views/userProfile/changePassword.html',
                size: 'lg',

                controller: function ($scope, $uibModalInstance) {

                    $scope.pswd = {};
                    $scope.inputType = 'password';
                    $scope.showPassword = false;

                    dashboardService.getAuthenticationStatus().then(function (response) {
                        if (response.success) {
                            $scope.enable2F = response.data.FA;
                        } else {
                            $scope.enable2F = 0;
                        }
                    });


                    $scope.showSendButton = true;
                    $scope.OTPSent = false;

                    //send otp to customer
                    $scope.sendCustomerOTP = function () {

                        dashboardService.sendCustomerOTP({ otp: $scope.otp, smsTemplateCode: 'CHANGE_PASSWORD' }).then(function (response) {
                            if (response.success) {
                                toastr.success(response.message);
                                $scope.OTPSent = true;
                                try {
                                    otpTimer(response.data.seconds);
                                } catch (e) {
                                    otpTimer();
                                }
                            }
                            else
                                toastr.error(response.message);
                        }).catch(function () {
                            toastr.error('Error while sending OTP');
                        })
                    }

                    $scope.changeCustomerOTP = function () {

                        dashboardService.changeCustomerOTP({ otp: $scope.otp, smsTemplateCode: 'CHANGE_PASSWORD' }).then(function (response) {
                            if (response.success) {
                                toastr.success(response.message);
                                $scope.OTPSent = true;
                                try {
                                    otpTimer(response.data.seconds);
                                } catch (e) {
                                    otpTimer();
                                }
                            }
                            else
                                toastr.error(response.message);
                        }).catch(function () {
                            toastr.error('Error while sending OTP');
                        })
                    }

                    function otpTimer(seconds) {
                        $interval.cancel($scope.timerInterval);
                        $scope.showSendButton = false;
                        $scope.timer = seconds ? seconds : 120;
                        $scope.timerInterval = $interval(function () {
                            if ($scope.timer <= 0) {
                                $scope.showSendButton = true;
                                $interval.cancel($scope.timerInterval);
                                return;
                            }
                            $scope.timer--;
                        }, 1000)
                    }

                    vm.resetOTP = function () {
                        $scope.showSendButton = true;
                        delete $scope.otp;
                        $scope.OTPSent = false;
                        $interval.cancel($scope.timerInterval);
                    }



                    $scope.changePassword = function (data) {
                        if ($scope.changePwdForm.$valid) {
                            dashboardService.getAuthenticationStatus().then(function (response) {
                                if (response.success) {
                                    if (response.data.FA == 1) {
                                        var verifyData = {
                                            "verifyCode": $scope.pswd.facode
                                        }
                                        loginService.verifyToken(verifyData).then(function (response) {
                                            if (response.success) {
                                                changePasswordFunc(data);
                                            } else {
                                                toastr.error('Authentication Code Not Verified.');
                                                // ngToast.create({
                                                //     className: 'danger',
                                                //     content: 'Authentication Code Not Verified.'
                                                // });
                                            }
                                        }, function (err) {
                                            toastr.error('Something went wrong. Please try again later.');
                                            // ngToast.create({
                                            //     className: 'danger',
                                            //     content: 'Something went wrong. Please try again later.'
                                            // });
                                        });
                                    } // if-response-FA
                                    else {
                                        changePasswordFunc(data);
                                    }
                                } // if-response-success
                            }, function (err) {
                                toastr.error('Something went wrong. Please try again later.');
                                // ngToast.create({
                                //     className: 'danger',
                                //     content: 'Something went wrong. Please try again later.'
                                // });
                            });

                        } // form-valid
                    }
                    var changePasswordFunc = function (data) {
                        data.device_ipAddress = sessionStorage.getItem('myIP');
                        data.device_os = sessionStorage.getItem('myOS');
                        data.device_name = sessionStorage.getItem('myDevice');
                        data.device_browser = sessionStorage.getItem('myBrowser');

                        delete data.facode;

                        dashboardService.changePassword(data).then(function (response) {
                            if (response.success) {
                                // $uibModalInstance.dismiss('cancel');
                                // $state.go('app');
                                // dashboardService.logout().then(function(response) {}, function(err) {});
                                AuthService.clearCredentials();
                                toastr.success('Password Changed Successfully. Please login again with your new password.');
                                // ngToast.create({
                                //     className: 'success',
                                //     content: 'Password Changed Successfully. Please login again with your new password.'
                                // });
                                // vm.logout();
                                $uibModalInstance.dismiss('cancel');
                                $state.go('app');
                                dashboardService.logout().then(function (response) { }, function (err) { });
                            } else {
                                toastr.error('Your current password is incorrect. Please enter again.');

                                // ngToast.create({
                                //     className: 'danger',
                                //     content: 'Your current password is incorrect. Please enter again.'
                                // });
                            }
                        }, function (err) {
                            toastr.error('Something went wrong. Please try again later.');
                            // ngToast.create({
                            //     className: 'danger',
                            //     content: 'Something went wrong. Please try again later.'
                            // });
                        });
                    }

                    $scope.cancelChangePage = function () {
                        $uibModalInstance.dismiss('cancel');
                    }

                    $scope.hideShowPassword = function () {
                        if ($scope.inputType == 'password') {
                            $scope.inputType = 'text';
                            $scope.showPassword = true;
                        } else {
                            $scope.inputType = 'password';
                            $scope.showPassword = false;

                        }
                    };
                }
            });
        }

        // dashboardService.getKycDetails().then(function (response) {

        //     vm.res = response.result;
        //     if (response.result.length > 0) {
        //         vm.panName = response.result[0].doc_name == "pan" ? "Pan" : "";
        //         vm.panNum = response.result[0].number;
        //         vm.panimg = response.result[0].front_img;
        //         vm.panDob = response.result[0].dob;
        //         vm.adharName = response.result[1].doc_name == "adhar" ? "Adhar" : "";
        //         vm.adharNum = response.result[1].number;
        //         vm.adharFrontimg = response.result[1].front_img;
        //         vm.adharBackimg = response.result[1].back_img;
        //         $scope.userKycDetail = response.result;
        //         vm.status = response.result[0].status == 1 && response.result[1].status == 1 ? 1 : 0;
        //     }
        // })

        function getProfileImage(path) {
            dashboardService.getImageFile({ path: path }).then(function (response) {
                if (response.success) {
                    vm.profileImage = response.data;
                }
            })
        }

        vm.uploadProfileImage = function () {

            if (!vm.inputImage)
                return;
            dashboardService.uploadProfileImage(vm.inputImage).then(function (response) {
                if (response.success) {
                    toastr.success('Image uploaded');
                    $("#cancel").click();
                    vm.uploadCancel();
                    setTimeout($state.reload, 1000);
                    return;
                }
                toastr.error(response.message);
            }, function (err) {
                toastr.error('Image upload failed. Please try again')
            })
        }


        vm.uploadCancel = function () {
            vm.inputImage = null;
        }
    }]);
