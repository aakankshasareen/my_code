login.controller("loginCtrl", ['$rootScope', '$scope', '$state', '$interval', 'loginService', 'apiService', 'toastr', '$stateParams', '$window', 'dashboardService', 'vcRecaptchaService', '$location', '$uibModal',
        function($rootScope, $scope, $state, $interval, loginService, apiService, toastr, $stateParams, $window, dashboardService, vcRecaptchaService, $location, $uibModal) {

            var vm = this;

            if ($state.current.name == "loginOTP") {
                otpTimer();
                vm.OTPSent = true;

            }
            
            $scope.active_users_nw = 144;

            vm.getUser = {};
            vm.setUser = {};
            vm.forgotPswd = {};
            vm.authLogin = {};
            var widgetId;
            $rootScope.widgetIdL = 0;
            $rootScope.widgetIdR = 0;

            $scope.loginV = '';

            vm.cryptocurrency = {};

            vm.selectCryptoCurrency = [{ 'name': 'BTC', 'id': 1 }, { 'name': 'ETH', 'id': 2 }, { 'name': 'LTC', 'id': 3 }];
            vm.cryptocurrency.selected = { 'name': 'BTC', 'id': 1 };

            vm.setWidgetIdR = function(widgetId) {

                $rootScope.widgetIdL = widgetId;
            }
            vm.setWidgetIdL = function(widgetId) {

                $rootScope.widgetIdR = widgetId;
            }

            var timeSpan = '1M';

            var currency = 'BTC';

            $window.scrollTo(0, 0);
            // DEVICE_IP , OS, NAME , BROWSER
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

            if (vm.setUser.device_ipAddress == undefined || vm.getUser.device_ipAddress == undefined) {
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

            // Set the default value of inputType
            vm.inputType = 'password';
            vm.showPassword = false;
            // Hide & show password function
            vm.hideShowPassword = function() {
                if (vm.inputType == 'password') {
                    vm.inputType = 'text';
                    vm.showPassword = true;
                } else {
                    vm.inputType = 'password';
                    vm.showPassword = false;
                }
            };

            var sortItems = function(a, b) {
                var nameA = a.currency_code.toUpperCase();
                var nameB = b.currency_code.toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }

                // names must be equal
                return 0;
            }


            $("#phone").on("countrychange", function(e, countryData) {
                // do something with countryData
                $('#phone').val('');
                vm.setUser.mobileNumber = undefined;

            });

            //variable to show send otp button
            vm.showSendButton = true;
            //vm.OTPSent = $stateParams.status==undefined?false:true;
            // console.log("status",$stateParams.status);
            //send otp to mobile number
            vm.sendRegistrationOTP = function() {
                if (vm.registrationForm.tel.$valid) {
                    // vm.setUser.otp = '';
                    loginService.sendRegistrationOTP({ mobileNumber: vm.setUser.mobileNumber, email: vm.setUser.email }).then(function(response) {
                        if (response.success) {
                            $uibModal.open({
                                animation: false,
                                templateUrl: 'app/modules/login/views/registration/registerModel.html',
                                size: 'lg',
                                backdrop: 'static',
                                controller: function($scope, $uibModalInstance, loginService, $stateParams) {
                                    $scope.setWidgetIdR = function(widgetId) {
                                        $rootScope.widgetIdL = widgetId;
                                    }
                                    otpTimer();
                                    $scope.sendRegistrationOTP = function() {
                                        console.log("mobileNumber", vm.setUser.mobileNumber)
                                        loginService.sendRegistrationOTP({ mobileNumber: vm.setUser.mobileNumber, email: vm.setUser.email }).then(function(response) {
                                            if (response.success) {
                                                // toastr.success(response.message);
                                                $scope.OTPSent = true;
                                                // $state.go('registerOTP');
                                                otpTimer();
                                            } else {
                                                toastr.error(response.message);
                                            }
                                        })
                                    }
                                    $scope.register = function() {
                                        //  console.log("captcha response",$scope.setUser.g_recaptcha_response )
                                        // vm.setUser.g_recaptcha_response = $scope.setUser.g_recaptcha_response;
                                        if (vm.registrationForm.$valid /*&& vm.setUser.g_recaptcha_response !== undefined*/ /*&& vm.OTPSent*/ ) {
                                            var countryData = $("#phone").intlTelInput("getSelectedCountryData");
                                            var n = countryData.name.indexOf("(");

                                            if (n !== -1) var country = countryData.name.substring(0, n);
                                            else var country = countryData.name;
                                            vm.setUser.otp = $scope.setUser.otp;
                                            vm.setUser.country = country;
                                            vm.setUser.sortName = countryData.iso2.toUpperCase();
                                            vm.setUser.dialCode = countryData.dialCode;
                                            vm.setUser.device_ipAddress = sessionStorage.getItem("myIP");

                                            if (vm.setUser.referral_id == "") delete vm.setUser.referral_id;
                                            //$rootScope.showSpinner = true;
                                            console.log(vm.setUser)
                                            loginService.registerVerifyOTP({ mobileNumber: vm.setUser.mobileNumber, otp: vm.setUser.otp }).then(function(response) {
                                                console.log("otp response", response)
                                                if (response.success) {
                                                    loginService.registerUser(vm.setUser).then(function(response) {
                                                        // console.log(response)
                                                        if (response.success) {
                                                            $uibModalInstance.dismiss('cancel');
                                                            $state.go('registerStep2');
                                                            toastr.success(response.message)
                                                        } else {
                                                            if (response.message == 'Error') {
                                                                $uibModalInstance.dismiss('cancel');
                                                            }
                                                            /*vcRecaptchaService.reload($rootScope.widgetIdL);
                                                            vcRecaptchaService.reload($rootScope.widgetIdR);*/
                                                            toastr.error(response.message);
                                                        }
                                                        //$rootScope.showSpinner = false;
                                                    }, function(err) {
                                                        $uibModalInstance.dismiss('cancel');
                                                        vcRecaptchaService.reload($rootScope.widgetIdL);
                                                        vcRecaptchaService.reload($rootScope.widgetIdR);
                                                        toastr.error('Something went wrong. Please try again later.');
                                                        //$rootScope.showSpinner = false;
                                                    });
                                                } else {
                                                    toastr.error('Incorrect OTP');
                                                }
                                            })

                                        } /*else if (vm.setUser.g_recaptcha_response == undefined) {
                                            toastr.error('Captcha is required.');
                                        }*/
                                    };

                                    $scope.resetOTP = function() {
                                        $scope.showSendButton = true;
                                        delete vm.otp;
                                        $scope.OTPSent = false;
                                        $interval.cancel($scope.timerInterval);
                                    }

                                    function otpTimer() {
                                        $scope.showSendButton = false;
                                        setTimeout(function() {
                                            $scope.showSendButton = true
                                        }, 120000);
                                        $scope.timer = 120;
                                        $scope.timerInterval = $interval(function() {
                                            if ($scope.timer <= 0) {
                                                $interval.cancel(vm.timerInterval)
                                                return;
                                            }
                                            $scope.timer--;
                                        }, 1000)
                                    }
                                    $scope.dismissCancelOrder = function() {
                                        $uibModalInstance.dismiss('cancel');
                                    }

                                    $scope.cancel = function(){
                                        $uibModalInstance.dismiss('cancel');
                                    }
                                } // controller
                            });
                            // toastr.success(response.message);
                            $scope.OTPSent = true;
                            // $state.go('registerOTP');
                            otpTimer();
                        } else
                            toastr.error(response.message);
                    }).catch(function() {
                        toastr.error('Error while sending OTP');
                    })
                } else {
                    toastr.error('Mobile number not valid');
                }
            }


            vm.register = function() {
                if (vm.registrationForm.$valid /*&& vm.setUser.g_recaptcha_response !== undefined*/ /*&& vm.OTPSent*/ ) {

                    // var countryData = $("#phone").intlTelInput("getSelectedCountryData");
                    // var n = countryData.name.indexOf("(");

                    // if (n !== -1) var country = countryData.name.substring(0, n);
                    // else var country = countryData.name;

                    vm.setUser.country = "United States";
                    vm.setUser.sortName = 'US'//countryData.iso2.toUpperCase();
                    vm.setUser.dialCode = +1//countryData.dialCode;
                    vm.setUser.device_ipAddress = sessionStorage.getItem("myIP");

                    //$rootScope.showSpinner = true;

                    loginService.registerUser(vm.setUser).then(function(response) {
                        if (response.success) {
                            $state.go('registerStep2');
                        } else {
                            if (response.message !== 'Incorrect OTP') {
                                vm.resetOTP();
                            }
/*                            vcRecaptchaService.reload($rootScope.widgetIdL);
                            vcRecaptchaService.reload($rootScope.widgetIdR);*/
                            toastr.error(response.message);
                        }
                        //$rootScope.showSpinner = false;
                    }, function(err) {

/*                        vcRecaptchaService.reload($rootScope.widgetIdL);
                        vcRecaptchaService.reload($rootScope.widgetIdR);*/
                        toastr.error('Something went wrong. Please try again later.');

                        //$rootScope.showSpinner = false;
                    });
                } /*else if (vm.setUser.g_recaptcha_response == undefined) {
                    // toastr.error('Captcha is required.');


                }*/
            };


            function otpTimer() {

                vm.showSendButton = false;
                setTimeout(function() {
                    vm.showSendButton = true
                }, 120000);
                vm.timer = 120;
                vm.timerInterval = $interval(function() {

                    if (vm.timer <= 0) {
                        $interval.cancel(vm.timerInterval)
                        return;
                    }
                    vm.timer--;
                }, 1000)
            }

            vm.resetOTP = function() {
                vm.showSendButton = true;
                delete vm.otp;
                vm.OTPSent = false;
                $interval.cancel(vm.timerInterval);
            }
            //get registration details


            if ($state.is('emailVerifyProfile')) {
                var param1 = $stateParams.token; // query parameter in URL
                loginService.emailLinkVerifyFromProfile({ 'token': param1 }).then(function(response) {});
            }


            //access login
            vm.login = function() {
                if (vm.loginForm.$valid /*&& vm.getUser.g_recaptcha_response !== undefined*/) {
                    vm.getUser.device_ipAddress = sessionStorage.getItem("myIP");
                      loginService.accessLogin(vm.getUser).then(function(response) {
                        if (response.success) {
                            if (angular.isDefined(response.FA_status) && response.FA_status == 1) {
                                $state.go('login2FA', { 'token': response.logintoken });
                            } else {

                                dashboardService.sendCustomerOTP({ 'token': response.logintoken, smsTemplateCode: 'LOGIN' }).then(function(res) {

                                    if (res.success) {

                                        toastr.success(res.message);
                                        $scope.send = 1;
                                        $state.go('loginOTP', { 'token': response.logintoken, 'status': true });
                                        // try{
                                        //     otpTimer(res.data.seconds);
                                        // } catch(e){
                                        // otpTimer();
                                        // }
                                    } else {

                                        toastr.error(res.message);
                                        $state.go('login');
                                    }

                                }).catch(function(error) {
                                    toastr.error('Error while sending OTP');
                                })


                                //     var data1 = {
                                //         "device_ipAddress": sessionStorage.getItem('myIP'),
                                //         "device_os": vm.device_os,
                                //         "device_name": vm.device_name,
                                //         "device_browser": vm.device_browser
                                //     }
                                //     // loginService.ethBalance(data1).then(function(response) {});
                                //     loginService.btcBalance(data1).then(function(response) {});
                                //     loginService.ltcBalance(data1).then(function(response) {});
                                //     loginService.dogeBalance(data1).then(function(response) {});
                                //     $("body").addClass("exchange-view-activated");
                                //     $("body").removeClass("remove-exchange-list");
                                //     $state.go('dashboard.home');
                            }


                        } else {

/*                            vcRecaptchaService.reload($rootScope.widgetIdL);
                            vcRecaptchaService.reload($rootScope.widgetIdR);*/
                            toastr.error(response.message);
                            if (response.attempts) {
                                if (response.attempts <= 0)
                                    vm.isUserBlocked = "Account Blocked.";
                                else
                                    vm.isUserBlocked = "Attempts Left " + ': ' + response.attempts;
                            } else {
                                delete vm.isUserBlocked;
                            }

                        }
                        //$rootScope.showSpinner = false;
                    }, function(err) {
/*                        vcRecaptchaService.reload($rootScope.widgetIdL);
                        vcRecaptchaService.reload($rootScope.widgetIdR);*/
                        toastr.error('Something went wrong. Please try again later.');


                        //$rootScope.showSpinner = false;
                    });
                } /*else if (vm.getUser.g_recaptcha_response == undefined) {

                    // toastr.error('Captcha is required.');

                }*/
           };

           vm.login = function() {
            if (vm.loginForm.$valid /*&& vm.getUser.g_recaptcha_response !== undefined*/) {
                vm.getUser.device_ipAddress = sessionStorage.getItem("myIP");

                //$rootScope.showSpinner = true;
                loginService.accessLogin(vm.getUser).then(function(response) {
                    if (response.success) {
                        if (angular.isDefined(response.FA_status) && response.FA_status == 1) {
                            $state.go('login2FA', { 'token': response.logintoken });
                        } else {

                            var data1 = {
                                "device_ipAddress": sessionStorage.getItem('myIP'),
                                "device_os": vm.device_os,
                                "device_name": vm.device_name,
                                "device_browser": vm.device_browser
                            }
                            loginService.ethBalance(data1).then(function(response) {});
                            loginService.btcBalance(data1).then(function(response) {}); 
                            loginService.ltcBalance(data1).then(function(response) {});
                            // loginService.dogeBalance(data1).then(function(response) {});
                            
                            $("body").addClass("exchange-view-activated");
                            $("body").removeClass("remove-exchange-list");
                            if(response.kyc!=2)
                            $state.go('dashboard.userProfile');
                            else
                            $state.go('dashboard.home');
                        }


                    } else {

/*                        vcRecaptchaService.reload($rootScope.widgetIdL);
                        vcRecaptchaService.reload($rootScope.widgetIdR);*/
                        toastr.error(response.message);
                        if (response.attempts) {
                            if (response.attempts <= 0)
                                vm.isUserBlocked = "Account Blocked.";
                            else
                                vm.isUserBlocked = "Attempts Left " + ': ' + response.attempts;
                        } else {
                            delete vm.isUserBlocked;
                        }

                    }
                    //$rootScope.showSpinner = false;
                }, function(err) {
/*                    vcRecaptchaService.reload($rootScope.widgetIdL);
                    vcRecaptchaService.reload($rootScope.widgetIdR);*/
                    toastr.error('Something went wrong. Please try again later.');


                    //$rootScope.showSpinner = false;
                });
            } /*else if (vm.getUser.g_recaptcha_response == undefined) {

                // toastr.error('Captcha is required.');

            }*/
        };


            //forgot password Email Check
            vm.checkPswdEmail = function(data) {
                if (vm.chckPswdForm.$valid) {
                    //$rootScope.showSpinner = true;
                    loginService.emailLinkForgotPs(data).then(function(response) {
                        if (response.success) {
                            $state.go('forgotPwdEmailLink');
                        } else {
                            // vcRecaptchaService.reload($rootScope.widgetId);
                            // toastr.error(response.message);
                            $state.go('forgotPwdEmailLink');

                        }
                        //$rootScope.showSpinner = false;
                    }, function(err) {
                        toastr.error('Something went wrong. Please try again later.');

                        //$rootScope.showSpinner = false;
                    });
                }
            }

            //forgot password
            vm.generateNewPassword = function() {
                if (vm.passwordForm.$valid) {
                    vm.forgotPswd.token = $stateParams.token;
                    vm.forgotPswd.device_ipAddress = sessionStorage.getItem("myIP");
                    //$rootScope.showSpinner = true;
                    loginService.forgotPassword(vm.forgotPswd).then(function(response) {
                        if (response.success) {
                            toastr.success('Password Reset Successful.');
                            $state.go('app');
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

            if ($state.is('forgotPassword') || $state.is('forgotPwdEmailLink')) { //to prevent user from going to other screens from forgot password screen
                window.onpopstate = function() {
                    window.history.forward(1);
                };
            }

            //verify 2FA token
            vm.verifyLoginToken = function() {
                if (vm.login2FA.$valid) {
                    var data = {
                        "device_ipAddress": sessionStorage.getItem('myIP'),
                        "device_os": vm.device_os,
                        "device_name": vm.device_name,
                        "device_browser": vm.device_browser,
                        "verifyCode": vm.authLogin.verifyCode,
                        "token": $stateParams.token
                    }

                    //$rootScope.showSpinner = true;
                    loginService.loginVerifyCodeWhen2FA(data).then(function(response) {
                        if (response.success) {
                            var data1 = {
                                "device_ipAddress": sessionStorage.getItem('myIP'),
                                "device_os": vm.device_os,
                                "device_name": vm.device_name,
                                "device_browser": vm.device_browser
                            }
                            //  loginService.ethBalance(data1).then(function(response) {});
                            loginService.btcBalance(data1).then(function(response) {});
                            loginService.ltcBalance(data1).then(function(response) {});
                            // loginService.dogeBalance(data1).then(function(response) {});
                            $("body").addClass("exchange-view-activated");
                            $state.go('dashboard.home');
                        } else {
                            toastr.error(response.message);

                            if (response.status == -2) {
                                $state.go('app');
                            }
                        }
                        //$rootScope.showSpinner = false;
                    }, function(err) {
                        toastr.error('Something went wrong. Please try again later.');

                        $state.go('app');
                        //$rootScope.showSpinner = false;
                    });
                }
            }

            vm.verifyLoginOTP = function() {

                if (vm.loginOTP.$valid) {
                    var data = {
                        "device_ipAddress": sessionStorage.getItem('myIP'),
                        "device_os": vm.device_os,
                        "device_name": vm.device_name,
                        "device_browser": vm.device_browser,
                        "otp": vm.otp,
                        "token": $stateParams.token
                    }

                    //$rootScope.showSpinner = true;
                    loginService.loginVerifyCodeWhenOTP(data).then(function(response) {


                        if (response.success) {
                            var data1 = {
                                "device_ipAddress": sessionStorage.getItem('myIP'),
                                "device_os": vm.device_os,
                                "device_name": vm.device_name,
                                "device_browser": vm.device_browser
                            }
                            //  loginService.ethBalance(data1).then(function(response) {});
                            loginService.btcBalance(data1).then(function(response) {});
                            loginService.ltcBalance(data1).then(function(response) {});
                            // loginService.dogeBalance(data1).then(function(response) {});
                            $("body").addClass("exchange-view-activated");

                            $state.go('dashboard.home');
                            console.log("xcvvbbcvbv")
                        } else {
                            toastr.error(response.message);
                            $state.go('login');
                            if (response.status == -2) {
                                $state.go('app');
                            }
                        }
                        //$rootScope.showSpinner = false;
                    }, function(err) {
                        toastr.error('Something went wrong. Please try again later.');

                        $state.go('app');
                        //$rootScope.showSpinner = false;
                    });
                }
            }

            vm.cancel = function() {
                $state.go('app');
            }

            vm.input2fachanged = function() {
                if (angular.isDefined(vm.authLogin.verifyCode) && vm.authLogin.verifyCode.length == 6) {
                    vm.verifyLoginToken();
                }
            }

            $scope.getCurrencyPrice = function() {
                // get currencies list 
                // loginService.getActiveCurrencyListHome({ 'id': 1 }).then(function(response) {
                //     if (response.success) {
                //         response.result.sort(sortItems);
                //         vm.getCurrencies = response.result;
                //         // for (var i = 0; i < vm.getCurrencies.length; i++) {
                //         //     if (vm.getCurrencies[i].currency_code == 'BTC') {
                //         //         vm.currencyHome = vm.getCurrencies[i];
                //         //         return;
                //         //     }
                //         // }
                //     } else {
                //         // toastr.error(response.message);
                //         //error msg toast
                //     }
                // }).then(function(response) {
                dashboardService.getTradeCurrencyPairsFrontend().then(function(response) {
                    if (response.success) {
                        for (var i = 0; i < response.result.length; i++) {
                            if (vm.currencyHome.currency_code == response.result[i].from) {
                                vm.priceHome = response.result[i].last_trade_price;
                                return;
                            }
                        }
                    }
                });
                // });

            } // getCurrencyPrice

            

            loginService.getActiveCurrencyListHome({ 'id': 1 }).then(function(response) {
                if (response.success) {
                    response.result.sort(sortItems);
                    vm.getCurrencies = response.result;
                    for (var i = 0; i < vm.getCurrencies.length; i++) {
                        if (vm.getCurrencies[i].currency_code == 'BTC') {
                            vm.currencyHome = vm.getCurrencies[i];
                            return;
                        }
                    }
                }
            }).then(function(response) {
                dashboardService.getTradeCurrencyPairsFrontend().then(function(response) {
                vm.allCurrencyCurrentPrice=response.result
                console.log(vm.allCurrencyCurrentPrice)
                    if (response.success) {
                        vm.btc = response.result.find(function(d){
                            return d.from === 'BTC' && d.to==='USD';
                        })
                        vm.eth = response.result.find(function(d){
                            return d.from === 'ETH' && d.to==='USD';
                        })
                        vm.xrp = response.result.find(function(d){
                            return d.from === 'XRP' && d.to==='USD';
                        })
                        vm.ltc = response.result.find(function(d){
                            return d.from === 'LTC' && d.to==='USD';
                        })
                        vm.fulx = response.result.find(function(d){
                            return d.from === 'FULX' && d.to==='USD';
                        })

                    }
                });
            });

            vm.timeSpan = function(t) {
                timeSpan = t;
                vm.getGraph(currency);
            }

            vm.getGraph = function(data) {
                var value, tmp;
                var time;
                var service = dashboardService.histData

                switch (timeSpan) {
                    case '1Y':
                        time = moment().add(-1, 'year').valueOf();
                        break;
                    case '6M':
                        time = moment().add(-6, 'months').valueOf();
                        break;
                    case '3M':
                        time = moment().add(-3, 'months').valueOf();
                        break;
                    case '1M':
                        time = moment().add(-1, 'months').valueOf();
                        break;
                        // case 'AllTime' :time = moment().startOf('year').valueOf();break;
                    case 'Alltime':
                        time = 1521808497054;
                        break;
                    case 'Today':
                        service = dashboardService.histToday;
                        break;
                }

                service(data, time).then(function(response) {
                    $('#homeGraph').html('');
                    var graphData = response.data;
                    var graphNewData = [];
                    graphData.forEach(function(i, j) {
                        dateString = moment.unix(i.time).format("YYYY-MM-DD");
                        // graphData[j].time = dateString;
                        tmp = [];
                        tmp.push(dateString);
                        tmp.push(i.price);
                        graphNewData.push(tmp);
                    });
                    var dataTable = anychart.data.table('time');
                    dataTable.addData(graphData);
                    table = anychart.data.table('x');
                    table.addData(graphData);
                    var dataSet = anychart.data.set(graphNewData);
                    var seriesData_1 = dataSet.mapAs({
                        'x': 0,
                        'value': 1
                    });
                    var chart = anychart.line();
                    chart.animation(true);
                    chart.xScroller(true);
                    var series;
                    series = chart.line(seriesData_1);
                    series.name(data);
                    series.stroke('3 #1489fd');
                    chart.legend(false);

                    // set container id for the chart
                    chart.container('homeGraph');
                    // initiate chart drawing
                    chart.draw();

                });
            }

            vm.getGraph('BTC');

            vm.resendCustomerOTP = function() {
                dashboardService.sendCustomerOTP({ 'token': $stateParams.token, smsTemplateCode: 'LOGIN' }).then(function(res) {

                    if (res.success) {
                        toastr.success(res.message);
                        otpTimer();
                        //$scope.send = 1;
                        //$state.go('loginOTP', { 'token': $stateParams.token, 'status':true});
                        // try{
                        //     otpTimer(res.data.seconds);
                        // } catch(e){
                        // otpTimer();
                        // }
                    } else {

                        toastr.error(res.message);
                        $state.go('login');
                    }

                });
            }

            vm.liveUsersUpdate = function(){
              dashboardService.getLiveCustomers().then(function(response){
                  console.log("Test value for active user",response);
              if (response.success){
                // vm.liveUsers = response.liveUsers;
                $scope.active_users_nw = response.liveUsers;
              }
            });}
    
            vm.liveUsersUpdate();

            //to get default pair id and display trade page based on default pair id
            // dashboardService.getTradePairList().then(function(response) {
            //     console.log("response is ", response);
            //     if (response.success) {
            //         var data = response.result;

            //         // vm.pairList = response.result;
        
            //     //     var isDefault = false;
            //     //     for (var i = 0; i < data.length; i++) {
            //     //         if (data[i].default == 'true') {
            //     //             vm.default = data[i];
            //     //             isDefault = true;
            //     //             break;
            //     //         }
            //     //     }
            //     //     if (!isDefault) {
            //     //         vm.default = data[0];
            //     //     }
            //     // } else {
            //     //     toastr.error('Cannot get default pair. Please try again later.');
            //     //     // ngToast.create({
            //     //     //     className: 'danger',
            //     //     //     content: 'Cannot get default pair. Please try again later.'
            //     //     // });

            //     /**changes */
            //         let fcex_usd_price = 0;
            //         data.forEach((crypto_pair, index)=>{
            //             if(crypto_pair.from_currency_code === "FCEX" && crypto_pair.to_currency_code === "USD"){
            //                 usd_price = crypto_pair.last_trade_price
            //             }
            //         })
            //     }
            // }, function(err) {
            //     toastr.error('Something went wrong. Please try again later.');
            //     // ngToast.create({
            //     //     className: 'danger',
            //     //     content: 'Something went wrong. Please try again later.'
            //     // });
            // });
        }
    ])
    .controller("authRegistrationCtrl", ['$scope', '$state', 'loginService', 'toastr', 'FileSaver', 'Blob', '$rootScope',
        function($scope, $state, loginService, toastr, FileSaver, Blob, $rootScope) {
            var vm = this;
            vm.auth = {};

            var backupKey = '';

            if ($state.is('auth')) {
                window.onpopstate = function() {
                    window.history.forward(1);
                };
            }

            var qrData = {
                "token": sessionStorage.getItem('validToken')
            }


            //get QR code and 2FA backup key
            loginService.getQR(qrData).then(function(response) {
                vm.qrcode = '<img src="' + response.data + '"/>';
                vm.val = {
                    text: response.secretKey
                }
                backupKey = response.secretKey;
            }, function(err) {

                toastr.error('Something went wrong. Please try again later.');

            });

            //download 2FA Backup Key
            vm.download = function() {
                var data = new Blob([backupKey], { type: 'text/plain;charset=utf-8' });
                FileSaver.saveAs(data, '2fa-backup-key.txt');
            };

            vm.input2fachanged = function() {
                if (angular.isDefined(vm.auth.verifyCode) && vm.auth.verifyCode.length == 6) {
                    vm.verifyToken();
                }
            }

            //verify 2FA token
            vm.verifyToken = function() {
                if (vm.authForm.$valid) {
                    var data = {
                        "token": sessionStorage.getItem('validToken'),
                        "verifyCode": vm.auth.verifyCode
                    }
                    //$rootScope.showSpinner = true;
                    loginService.verifyRegistrationToken(data).then(function(response) {
                        if (response.success) {
                            toastr.success('Two-Factor Authentication Successful.');

                            $state.go('dashboard.home');
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


        }
    ]);