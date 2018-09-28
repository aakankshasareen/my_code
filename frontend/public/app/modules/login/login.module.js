var login = angular.module('login', ['ngFileSaver']);
login.config(["$stateProvider", "$httpProvider", function($stateProvider, $httpProvider) {
   $stateProvider.state('404', {
        url: '/404',
        views: {
            'contentView': {
                templateUrl: 'app/modules/login/views/common/404.html',
                controller: 'loginCtrl',
                controllerAs: 'vm'
            },
            'navbarView': {
                templateUrl: 'app/modules/login/views/common/header.html'
            },
            'footer': {
                templateUrl: 'app/modules/login/views/common/footer.html'
            }
        }
    });

        //two-factor authentication at registration
        $stateProvider.state('auth', {
            url: '/register/authenticate',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/login/views/registration/auth.html',
                    controller: 'authRegistrationCtrl',
                    controllerAs: 'vm'
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            }
        });


        $stateProvider.state('login', {
            url: '/login',
            views: {
                'contentView': {
                    // templateUrl: 'app/modules/login/views/signIn/login.html',
                    templateUrl: 'app/modules/login/views/signIn/login.html',
                    controller: 'loginCtrl',
                    controllerAs: 'vm'
                },
                 'navbarView': {
                     templateUrl: 'app/modules/login/views/common/header.html'
                },
                 'footer': {
                     templateUrl: 'app/modules/login/views/common/footer.html'
                 }
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService) {
                    AuthService.clearCredentials();
                    //  return StateService.resolveState();
                }
            }

        });

        $stateProvider.state('register', {
            url: '/register',
            views: {
                'contentView': {
                    // templateUrl: 'app/modules/login/views/signIn/login.html',
                    templateUrl: 'app/modules/login/views/registration/registration.html',
                    controller: 'loginCtrl',
                    controllerAs: 'vm'
                },
                 'navbarView': {
                     templateUrl: 'app/modules/login/views/common/header.html'
                 },
                 'footer': {
                     templateUrl: 'app/modules/login/views/common/footer.html'
                 }
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService) {
                    AuthService.clearCredentials();
                    //  return StateService.resolveState();
                }
            }

        });
        
        $stateProvider.state('login2FA', {
            url: '/login/authenticate',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/login/views/signIn/login2FA.html',
                    controller: 'loginCtrl',
                    controllerAs: 'vm'
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            params: {
                token: undefined,
            },
            resolve: {
                data: function($q, $state, $stateParams) {
                    var deferred = $q.defer();
                    if (angular.isDefined($stateParams.token)) {
                        deferred.resolve();
                    } else {
                        $state.go('app');
                        deferred.reject();
                    }
                    return deferred.promise;
                }
            }

        });


        $stateProvider.state('loginOTP', {
            url: '/login/authenticateotp',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/login/views/signIn/loginOTP.html',
                    controller: 'loginCtrl',
                    controllerAs: 'vm'
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            params: {
                token: undefined,
                status: undefined,
                },
            resolve: {
                data: function($q, $state, $stateParams) {
                    var deferred = $q.defer();

                    if (angular.isDefined($stateParams.token && $stateParams.status)) {
                        deferred.resolve();
                    } else {
                        $state.go('app');
                        deferred.reject();
                    }
                    return deferred.promise;
                }
            }

        });





        $stateProvider.state('forgotPwd', { //Forgot Password Email Page
            url: '/forgotPwd',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/login/views/forgotPswd/forgotPassEmail.html',
                    controller: 'loginCtrl',
                    controllerAs: 'vm'
                },
                 'navbarView': {
                     templateUrl: 'app/modules/login/views/common/header.html'
                 },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            }

        });

        $stateProvider.state('forgotPwdEmailLink', { //Forgot Password Email Link Page - Step 2
            
            views: {
                'contentView': {
                    templateUrl: 'app/modules/login/views/forgotPswd/forgotPassEmailLink.html',
                    //controller: 'loginCtrl',
                    //controllerAs: 'vm'
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            }

        });

        $stateProvider.state('forgotPassword', {
            url: '/forgotPassword?token',
            resolve: {
                query: ($transition$) => $transition$.params(),
                data: function($q, loginService, $state, $stateParams) {
                    var deferred = $q.defer();
                    loginService.checkLinkExpiry({ 'token': $stateParams.token }).then(function(response) {
                        if (response.status == -2) {
                            $state.go('passwordResetExpiry');
                            deferred.reject();
                        } else {
                            deferred.resolve();
                        }
                    }, function(err) {
                        $state.go('passwordResetExpiry');
                        deferred.reject();
                    });

                    return deferred.promise;
                }
            },
            params: {
                token: { dynamic: true }
            },
            views: {
                'contentView': {
                    templateUrl: 'app/modules/login/views/forgotPswd/forgotPass.html',
                    controller: 'loginCtrl',
                    controllerAs: 'vm'
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                 },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
               
            }

        });

        $stateProvider.state('passwordResetExpiry', {            
            views: {
                'contentView': {
                    templateUrl: 'app/modules/login/views/forgotPswd/linkExpired.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            }

        });

        //email verification- sent mail and verifying the email link. - at registration
        $stateProvider.state('emailVerify', {
            url: '/emailVerify?token',
            resolve: {
                query: ($transition$) => $transition$.params(),
                data: function($q, loginService, $state, $stateParams, toastr) {
                    var deferred = $q.defer();
                    loginService.checkEmailLinkExpiry({ 'token': $stateParams.token }).then(function(response) {
                        if (response.status == -2) {                            
                            $state.go('app');
                            toastr.error(response.message);
                            // ngToast.create({
                            //     className: 'danger',
                            //     content: response.message
                            // });
                            //return deferred.reject();
                            
                        } else {                            
                            sessionStorage.setItem('validToken', response.token);
                            deferred.resolve();
                        }
                    }, function(err) {
                        $state.go('app');
                        return deferred.reject();
                    });

                    return deferred.promise;
                }
            },
            params: {
                token: { dynamic: true }
            },
            views: {
                'contentView': {
                    templateUrl: 'app/modules/login/views/registration/verifyEmail.html',
                    controller: 'loginCtrl',
                    controllerAs: 'vm'
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            }

        });

        $stateProvider.state('emailVerifyProfile', { // email verification from My Profile 
            url: '/emailLinkVerify?token',
            resolve: {
                query: ($transition$) => $transition$.params(),
                data: function($q, loginService, $state, $stateParams) {
                    var deferred = $q.defer();
                    loginService.checkLinkExpiry({ 'token': $stateParams.token }).then(function(response) {
                        if (response.status == -2) {
                            $state.go('emailLinkExpiry');
                            deferred.reject();
                        } else {
                            deferred.resolve();
                        }
                    }, function(err) {
                        $state.go('emailLinkExpiry');
                        deferred.reject();
                    });

                    return deferred.promise;
                }
            },
            params: {
                token: { dynamic: true }
            },
            views: {
                'contentView': {
                    templateUrl: 'app/modules/dashboard/views/userProfile/emailVerification.html',
                    controller: 'loginCtrl',
                    controllerAs: 'vm'
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            }

        });

        $stateProvider.state('emailLinkExpiry', {
            
            views: {
                'contentView': {
                    templateUrl: 'app/modules/login/views/registration/emailLinkExpired.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            }

        });


        // $stateProvider.state('registerOTP', {
            
        //     views: {
        //         'contentView': {
        //             templateUrl: 'app/modules/login/views/registration/registerModel.html',
        //             controller: 'loginCtrl',
        //             controllerAs: 'vm'
        //         },
        //         // 'navbarView': {
        //         //     templateUrl: 'app/modules/login/views/common/header.html'
        //         // },
        //         // 'footer': {
        //         //     templateUrl: 'app/modules/login/views/common/footer.html'
        //         // }
        //     }

        // });

        $stateProvider.state('registerStep2', {
            
            views: {
                'contentView': {
                    templateUrl: 'app/modules/login/views/registration/checkEmail.html',
                    // controller: 'loginCtrl',
                    //controllerAs: 'vm'
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            }

        });

      
  

        $httpProvider.interceptors.push('LoginInterceptor');

    }])
    .factory('LoginInterceptor', ['$q', '$rootScope',
        function($q, $rootScope) {
            var interceptor = {
                'request': function(config) {
                    $rootScope.showSpinner = true;
                    // Successful request method
                    return config; // or $q.when(config);
                },
                'response': function(response) {
                    $rootScope.showSpinner = false;
                    // $rootScope.showSpinner = false;
                    // successful response
                    return response; // or $q.when(config);
                },
                'requestError': function(response) {
                    $rootScope.showSpinner = false;
                    // an error happened on the request
                    // if we can recover from the error
                    // we can return a new request
                    // or promise
                    return response; // or new promise
                    // Otherwise, we can reject the next
                    // by returning a rejection
                    // return $q.reject(rejection);
                },
                'responseError': function(response) {
                    if (response.status === 401 || response.status === 403) {
                        if (response['data']['customer'] == 0) {
                            location.href = '/admin/permission-denied';
                            return $q(function() { return null; })
                        } else {
                            $state.go('app');
                           // $state.go('login');
                            // for clearing out cookies - because even after token expires , cookies have the value
                            $rootScope.globals = undefined;
                            sessionStorage.removeItem('globals');
                            // $cookies.remove('globals');
                            var http = $injector.get('$http');
                            http.defaults.headers.common.Authorization = 'Bearer ';
                        }

                    }
                    $rootScope.showSpinner = false;
                    return rejection;
                }
            };
            return interceptor;
        }
    ]).run(($transitions, $state) => {
	$transitions.onError({}, ($transition$) => {

        //    	if ($transition$.$to().name !== 'init' && $transition$.$from().name !== 'error') {
        //            $state.go('error');
        //        }
    });
});;
