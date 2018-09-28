var dashboard = angular.module('dashboard', ['ngclipboard', 'ngFileUpload', 'ui.grid', 'ui.grid.exporter', 'ui.grid.resizeColumns', 'ui.grid.pagination', 'ui.grid.autoResize', 'ui.grid.selection']);

dashboard.config(["$stateProvider", "$httpProvider", function($stateProvider, $httpProvider) {

        //dashboard home page state
        $stateProvider.state('dashboard', {
            url: '/dashboard',
            abstract: true,
            views: {
                'contentView': {
                    templateUrl: 'app/modules/dashboard/views/dashboard.html',
                    controller: 'DashboardController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
        });

        $stateProvider.state('dashboard.home', {
            url: '/trade',
            pageTitle: 'Trade',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/trade/trade.html',
                    controller: 'TradeController',
                    controllerAs: 'vm'
                }
            },
            params: {
                pair_id: undefined,
                currency_from: undefined,
                currency_to: undefined,
                currency_from_symbol: undefined,
                currency_to_symbol: undefined
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                },
                data1: function(storageFactory) {
                    storageFactory.setData(sessionStorage.getItem('pairId'), sessionStorage.getItem('curFrom'), sessionStorage.getItem('curTo'), sessionStorage.getItem('curFromSymbol'), sessionStorage.getItem('curToSymbol'));
                    pair_id = storageFactory.getPairId();
                    currency_from = storageFactory.getCurFrom();
                    currency_to = storageFactory.getCurTo();
                    currency_from_symbol = storageFactory.getCurFromSymbol();
                    currency_to_symbol = storageFactory.getCurToSymbol();

                }
            },
            //donot DELETE this code
            onExit: function(socket){
              socket.emit('leave_pair_id', socket.pairId);
              socket.unSubscribe('sell_buy')
              delete socket.pairId;
            }
        });

         $stateProvider.state('dashboard.userProfile', {
            url: '/profile',
            pageTitle: 'Profile',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/home.html',
                    controller: 'UserController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
         });

         $stateProvider.state('dashboard.userProfileKYC', {
            url: '/verify-kyc',
            pageTitle: 'KYC',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/KYC.html',
                    controller: 'UserController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
         });
        $stateProvider.state('dashboard.bankDetails', {
            url: '/bank-details',
            pageTitle: 'Bank Details',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/userProfile/bankDetails.html',
                    controller: 'BankDetails',
                   controllerAs: 'vm'
                }
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
        });

        $stateProvider.state('dashboard.kyc', {
            url: '/kyc',
            pageTitle: 'KYC',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/userProfile/kyc.html',
                    controller: 'KycController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
        });


        $stateProvider.state('dashboard.deposit', {
            url: '/deposit',
            pageTitle: 'Deposit',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/deposit/main.html',
                    controller: 'DepositController',
                    controllerAs: 'vm'
                }
            },
            params: {
                currency_to_deposit: undefined,
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
        });

        $stateProvider.state('dashboard.addNewCard', {
            url: '/AddNewCard',
            pageTitle: 'Add New Card',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/deposit/addNewCard.html',
                    controller: 'DepositController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
        });

        $stateProvider.state('dashboard.withdraw', {
            url: '/withdraw',
            pageTitle: 'Withdraw',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/withdraw/main.html',
                    controller: 'WithdrawController',
                    controllerAs: 'vm'
                }
            },
            params: {
                currency_to_withdraw: undefined,
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
        });

        $stateProvider.state('dashboard.trade', { //new trade
            url: '/trade',
            pageTitle: 'Trade',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/trade/trade.html',
                    controller: 'TradeController',
                    controllerAs: 'vm'
                }
            },
            params: {
                pair_id: undefined,
                currency_from: undefined,
                currency_to: undefined,
                currency_from_symbol: undefined,
                currency_to_symbol: undefined
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                },
                data1: function(storageFactory) {
                    storageFactory.setData(sessionStorage.getItem('pairId'), sessionStorage.getItem('curFrom'), sessionStorage.getItem('curTo'), sessionStorage.getItem('curFromSymbol'), sessionStorage.getItem('curToSymbol'));
                    pair_id = storageFactory.getPairId();
                    currency_from = storageFactory.getCurFrom();
                    currency_to = storageFactory.getCurTo();
                    currency_from_symbol = storageFactory.getCurFromSymbol();
                    currency_to_symbol = storageFactory.getCurToSymbol();
                   // console.log("pair"+pair_id+"from"+currency_from+"to"+currency_to);

                }
            }
        });

        $stateProvider.state('dashboard.portfolio',{
            url: '/portfolio',
            pageTitle: 'Portfolio',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/portfolio/portfolio.html',
                    controller: 'portfolioController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
        });



        $stateProvider.state('dashboard.history',{
            url: '/history',
            pageTitle: 'History',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/history/history.html',
                    controller: 'historyController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
        });

        $stateProvider.state('dashboard.support', {
            url: '/support',
            pageTitle: 'Support',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/support/support.html',
                    controller: 'supportController',
                    controllerAs: 'vm'
                },

            },

            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
        });

        $stateProvider.state('dashboard.supportticket', {
            url: '/support_ticket',
            pageTitle: 'Support',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/support/support_list.html',
                    controller: 'supportController',
                    controllerAs: 'vm'
                },
                '_action@dashboard.supportticket': {
                    templateUrl: 'app/modules/dashboard/views/support/_action.html',
                },
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
        });
        
        $stateProvider.state('dashboard.NotificationList', {
            url: '/notifications',
            pageTitle: 'Notifications',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/notification/notification_list.html',
                    controller: 'notificationController',
                    controllerAs: 'vm'
                },
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
        });

        $stateProvider.state('dashboard.accessDenied', {
            url: '/permission-denied',
            pageTitle: 'Permission Denied',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/exception/401.html',
                }
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
        });

        $stateProvider.state('dashboard.faq', {
            url: '/faq',
            pageTitle: 'FAQ',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/faq/faq.html',
                    controller: 'faqController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
        });


        $stateProvider.state('dashboard.repplySupport', {
            url: '/repply-support/{id:int}',
            pageTitle: 'Support',
            params: {
                id: { dynamic: true }
            },
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/support/add.html',
                    controller: 'supportController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
        });

         $stateProvider.state('dashboard.wallet', {
            url: '/wallet',
            pageTitle: 'Wallet',
            views: {
                'section@dashboard': {
                    templateUrl: 'app/modules/dashboard/views/wallet/main.html',
                    controller: 'WithdrawController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
        });


        $httpProvider.interceptors.push('APIInterceptor');

    }])
    .factory('socket', ['$rootScope', function($rootScope) {

      var socket;

        return {
            init: function(){                
                if(!socket)
                    socket = io('/')
                },
            on: function(eventName, callback) {
                this.init();
                socket.on(eventName, function() {
                    var args = arguments;
                    $rootScope.$applyAsync(function() {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function(eventName, data, callback) {
                this.init();
                socket.emit(eventName, data, function() {
                    var args = arguments;
                    $rootScope.$applyAsync(function() {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                });
            },
            unSubscribe: function(listener) {
                socket.removeAllListeners(listener);
            },
            close: function(listener) {
                socket.close();
                socket = null;
            }
        };
    }])
    .factory("storageFactory", function($window) {
        return {
            setData: function(val1, val2, val3, val4, val5) {
                $window.sessionStorage && $window.sessionStorage.setItem('pair_id', val1);
                $window.sessionStorage && $window.sessionStorage.setItem('currency_from', val2);
                $window.sessionStorage && $window.sessionStorage.setItem('currency_to', val3);
                $window.sessionStorage && $window.sessionStorage.setItem('currency_from_symbol', val4);
                $window.sessionStorage && $window.sessionStorage.setItem('currency_to_symbol', val5);
                return this;
            },
            getPairId: function() {
                return $window.sessionStorage && $window.sessionStorage.getItem('pair_id');
            },
            getCurFrom: function() {
                return $window.sessionStorage && $window.sessionStorage.getItem('currency_from');
            },
            getCurTo: function() {
                return $window.sessionStorage && $window.sessionStorage.getItem('currency_to');
            },
            getCurFromSymbol: function() {
                return $window.sessionStorage && $window.sessionStorage.getItem('currency_from_symbol');
            },
            getCurToSymbol: function() {
                return $window.sessionStorage && $window.sessionStorage.getItem('currency_to_symbol');
            }

        };
    })
    .service('APIInterceptor', ['$rootScope', '$state', '$cookies', '$injector', function($rootScope, $state, $cookies, $injector) {
        var service = this;

        service.request = function(config) {
            $rootScope.showSpinner = true;
            // Successful request method
            return config; // or $q.when(config);
        }

        service.response = function(response) {
            $rootScope.showSpinner = false;
            // successful response
            return response; // or $q.when(config);
        }

        service.requestError = function(response) {
            $rootScope.showSpinner = false;
            // an error happened on the request
            // if we can recover from the error
            // we can return a new request
            // or promise
            return response; // or new promise
            // Otherwise, we can reject the next
            // by returning a rejection
            // return $q.reject(rejection);
        }

        service.responseError = function(response) {
            // console.log("response error : "+JSON.stringify(response));
            if (response.status === 404) {
                location.href = '/404';
                return $q(function() { return null; })
            }
            if (response.status === 401 || response.status === 403) {
                if (response['data']['customer'] == 0) {
                    location.href = '/admin/permission-denied';
                    return $q(function() { return null; })
                } else {
                    $state.go('app');
                    // for clearing out cookies - because even after token expires , cookies have the value
                    $rootScope.globals = undefined;
                    sessionStorage.removeItem('globals');
                    // $cookies.remove('globals');
                    var http = $injector.get('$http');
                    http.defaults.headers.common.Authorization = 'Bearer ';
                }

            }

            $rootScope.showSpinner = false;
            return response;
        };
    }]);
