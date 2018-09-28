var app = angular.module('app', ['ui.router', 'vcRecaptcha','toastr', 'ngAnimate', 'ngSanitize', 'ngCookies', 'ngTouch', 'ui.bootstrap', 'angularMoment', 'ngIntlTelInput', 'ui.select',
    //main modules
    'login', 'dashboard',
]);
var apiBase = "/api/";

var appConfig = {
    title: "FULEEX Project",
    lang: "en",
    dateFormat: "mm/dd/yy",
    apiBase: apiBase,
    ethTxnHistory: "https://ropsten.etherscan.io/tx/"
};
app.constant('appSettings', appConfig);
app.config(["$stateProvider", "$urlRouterProvider", "$locationProvider", function ($stateProvider, $urlRouterProvider, $locationProvider) {

        $stateProvider.state('app', {
       url: '/',
            views: {
                'contentView': {
                   templateUrl: 'app/modules/login/views/common/home.html',
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

        
         $stateProvider.state('amlpolicy', {
            url: '/aml-policy',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/policy/aml_policy.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });

          $stateProvider.state('feeschedule', {
            url: '/fee-schedule',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/policy/fee_shedule.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });

        $stateProvider.state('privacypolicy', {
            url: '/privacy-policy',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/policy/pravecy_policy.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });

        $stateProvider.state('referalprogramme', {
            url: '/referral-policy',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/policy/referal_programme.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });

        $stateProvider.state('termuse', {
            url: '/terms-of-use',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/policy/term.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });

         $stateProvider.state('transferlimit', {
            url: '/transfer-limit',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/policy/transfer_limit.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });

         $stateProvider.state('faqForUsers', {
            url: '/faq-for-users',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/dashboard/views/faq/faq.html',
                    controller: 'faqController',
                    controllerAs: 'vm'
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });

            $stateProvider.state('contact_us', {
            url: '/contact-us',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/contact-us.html',
                    controller: 'supporthomeController',
                    controllerAs: 'vm'
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });
		$stateProvider.state('fees', {
            url: '/fees',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/fees.html',
                    controller: 'supporthomeController',
                    controllerAs: 'vm'
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });
		$stateProvider.state('Strategic', {
            url: '/Strategic',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/Strategic.html',
                    controller: 'supporthomeController',
                    controllerAs: 'vm'
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });

        $stateProvider.state('aboutUs', {
            url: '/about-us',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/about_us.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });

        $stateProvider.state('Blog', {
            url: '/blog',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/blog.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });

$stateProvider.state('how', {
            url: '/how',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/how.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });
		$stateProvider.state('trading', {
            url: '/trading',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/trading.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });
		$stateProvider.state('disclaimer', {
            url: '/disclaimer',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/disclaimer.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });	
		$stateProvider.state('otctrade', {
            url: '/otctrade',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/otctrade.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });

        $stateProvider.state('faq', {
            url: '/faq',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/faq.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });
        $stateProvider.state('getStart', {
            url: '/Getting-Start',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/get_started.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });
		 $stateProvider.state('identityVerification', {
            url: '/identity-verification-guide',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/identity_verification.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });

            $stateProvider.state('cardVerification', {
            url: '/card-verification-guide',
            views: {
                'contentView': {
                    templateUrl: 'app/modules/webcontent/card_verification.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/common/header.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/common/footer.html'
                }
            },
            onEnter : function($window){
                $window.scroll(0, 0);
            }
        });

        $urlRouterProvider.otherwise('/404');
        $locationProvider.html5Mode(true);
    }]);
    app.config(function(toastrConfig) {
        angular.extend(toastrConfig, {
          autoDismiss: true,
          containerId: 'toast-container',
          closeButton: true,
          maxOpened: 1,
          timeOut: 4000,
          newestOnTop: true,
          positionClass: 'toast-top-center',
          preventDuplicates: false,
          preventOpenDuplicates: true,
          target: 'body'
        });
      });
app.factory('AuthService', ['$http', '$cookies', '$rootScope',
    function ($http, $cookies, $rootScope) {
        var service = {};
        // Checks if it's authenticated
        service.isAuthenticated = function () {
            return !(sessionStorage.getItem('globals') === undefined || sessionStorage.getItem('globals') === null);
        };
        // Clear credentials when logout
        service.clearCredentials = function () {
            $rootScope.globals = undefined;
            sessionStorage.removeItem('globals');
            //$cookies.remove('globals');
            $http.defaults.headers.common.Authorization = 'Bearer ';
        };
        return service;
    }
]);
app.run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    // var lastDigestRun = new Date();
    // $rootScope.$watch(function detectIdle() {
    //   var now = new Date();
    //   if (now - lastDigestRun > 10000) {
    //     $rootScope.globals = undefined;
    //     sessionStorage.removeItem('globals');
    //     //$cookies.remove('globals');
    //     //$http.defaults.headers.common.Authorization = 'Bearer ';
    //      // logout here, like delete cookie, navigate to login ...
    //   }
    //   lastDigestRun = now;
    // });
});
app.service('StateService', function ($rootScope, AuthService, apiService, $state, $timeout, $q, $window) {

    var service = this;
    service.resolveState = function () {
        var deferred = $q.defer();
        $timeout(function () {
            if (!AuthService.isAuthenticated() || sessionStorage.getItem('user_type') == 'A') {
                sessionStorage.removeItem('user_type');
                var origin = window.location.origin;
                // $window.location.href = origin ;
                $window.location.href = origin + '/login'
//                $state.go('login');
                deferred.reject();
            } else
                deferred.resolve();
        });
        return deferred.promise;
    }

});
