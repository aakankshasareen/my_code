var app = angular.module('app', ['ui.router', 'ngAnimate','toastr' ,'vcRecaptcha','ngSanitize', 'ngCookies', 'ngTouch', 'ui.bootstrap', 'angularMoment','ui.select',
    //main modules
    'login', 'dashboard', 'admin'
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
                    templateUrl: 'app/modules/login/views/home.html',
                },
                'navbarView': {
                    templateUrl: 'app/modules/login/views/navbar.html'
                },
                'footer': {
                    templateUrl: 'app/modules/login/views/footer.html'
                }
            }
        });
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
    }]);

// app.config(['ngToastProvider', function (ngToast) {
//         ngToast.configure({
//             verticalPosition: 'top',
//             horizontalPosition: 'center',
//             maxNumber: 1,
//             animation: 'slide',
//             dismissButton: true,
//             dismissOnTimeout: true,
//             timeout: 3000
//         });
//     }]);

app.config(function(toastrConfig) {
    angular.extend(toastrConfig, {
      autoDismiss: true,
      containerId: 'toast-container',
      closeButton: true,
      maxOpened: 1,
      timeOut: 3000,
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
});
app.service('StateService', function ($rootScope, apiService, AuthService, $state, $timeout, $q, $window) {

    var service = this;
    service.resolveState = function () {
        var deferred = $q.defer();
        $timeout(function () {
            if (!AuthService.isAuthenticated()) {
                location.href = '/';
                deferred.reject();
            } else
                deferred.resolve();
        });
        return deferred.promise;
    }
    service.resolveAdminMenu = function () {
        var deferred = $q.defer();
        $timeout(function () {
            if (AuthService.isAuthenticated()) {
                var parameters = {};
                parameters['role_id'] =  sessionStorage.getItem('adminRoleId');
                apiService.create("getAdminUserPermission", parameters, sessionStorage.getItem('globals')).then(function (response) {
                    if (response) {
                        deferred.resolve(response.allowed_permissions);
                    }
                    else {
                        var origin = window.location.origin;
                        $window.location.href = origin + '/login';
                        deferred.reject();
                    }
                },
                function (response) {
                    deferred.reject(response);
                });

            } else {
                deferred.reject();
            }
        });
        return deferred.promise;
    }


});
