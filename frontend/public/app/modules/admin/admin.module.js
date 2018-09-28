var admin = angular.module('admin', ['ui.grid',
    'ui.grid.edit',
    'ui.grid.pagination', //data grid Pagination
    'ui.grid.resizeColumns', //data grid Resize column
    'ui.grid.moveColumns', //data grid Move column
    'ui.grid.pinning', //data grid Pin column Left/Right
    'ui.grid.selection', //data grid Select Rows
    'ui.grid.autoResize', //data grid Enabled auto column Size
    'ui.grid.exporter', //data grid Export Data
    'ngFileUpload',
    'checklist-model',
    'ngFileSaver',
    'oc.lazyLoad',
    'pascalprecht.translate',
    'ncy-angular-breadcrumb',
    'angular-loading-bar',
    'ngIntlTelInput',
    'ngSanitize'

]);

admin.config(["$stateProvider", "$httpProvider", "$breadcrumbProvider", function($stateProvider, $httpProvider, $breadcrumbProvider) {
    $breadcrumbProvider.setOptions({
        prefixStateName: 'admin.dashboard',
        includeAbstract: true,
        template: '<li class="breadcrumb-item" ng-repeat="step in steps" ng-class="{active: $last}" ng-switch="$last || !!step.abstract"><a ng-switch-when="false" href="{{step.ncyBreadcrumbLink}}">{{step.ncyBreadcrumbLabel}}</a><span ng-switch-when="true">{{step.ncyBreadcrumbLabel}}</span></li>'
    });
    //login page state


    $stateProvider.state('admin_login', {
        url: '/admin',
        views: {
            'contentView': {
                templateUrl: 'app/modules/admin/views/signIn/login.html',
                controller: 'adminCtrl',
                controllerAs: 'vm'
            },
            'navbarView': {
                //                    templateUrl: 'app/modules/login/views/navbar.html'
            },
            'footer': {
                //                    templateUrl: 'app/modules/login/views/footer.html'
            }
        }

    });

    $stateProvider.state('admin_login2FA', {
        url: '/admin/login_2fa',
        params: {
            response: { dynamic: true }
        },
        views: {
            'contentView': {
                templateUrl: 'app/modules/admin/views/signIn/2fa.html',
                controller: 'adminCtrl',
                controllerAs: 'vm'
            },
            'navbarView': {
                //                    templateUrl: 'app/modules/login/views/navbar.html'
            },
            'footer': {
                //                    templateUrl: 'app/modules/login/views/footer.html'
            },
        }
        /*   resolve: {
         data: function($q, $state, $timeout, AuthService) {
         var deferred = $q.defer();
         $timeout(function() {
         if (!AuthService.isAuthenticated()) {
         $state.go('login');
         deferred.reject();
         } else if (AuthService.isAuthenticated()) {
         if ($state.is('login')) {
         deferred.resolve();
         } else if (!$state.is('login')) {
         $state.go('login');
         deferred.reject();
         }
         }
         });
         return deferred.promise;
         }
         }*/
    });

    $stateProvider.state('configure2FA', {
        url: '/admin/config2fa',
        params: {
            response: { dynamic: true }
        },
        views: {
            'contentView': {
                templateUrl: 'app/modules/admin/views/signIn/configure2fa.html',
                controller: 'config2FActrl',
                controllerAs: 'vm'
            }
        },
    });

    $stateProvider.state('admin', {
        url: '/admin',
        abstract: true,
        views: {
            'contentView': {
                templateUrl: 'app/modules/admin/views/dashboard/dashboard.html',
                controller: 'adminCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Root',
            skip: true
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService, $rootScope) {
                return StateService.resolveAdminMenu().then(function(response) {
                    $rootScope.allowedPermission = response;
                    $rootScope.isSuperAdmin = sessionStorage.getItem('isSuperAdmin');

                });

            }
        }
    });

    $stateProvider.state('admin.dashboard', {
        url: '/dashboard',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/dashboard/home.html',
                controller: 'adminDashboardCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Dashboard',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.currencyList', {
        url: '/currency-list?status',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/currency/list.html',
                controller: 'currencyCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.currencyList': {
                templateUrl: 'app/modules/admin/views/currency/_action.html',
                //                    controller: 'currencyCtrl',
                //                    controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Manage Currency',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.addCurrency', {
        url: '/add-currency',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/currency/add.html',
                controller: 'currencyCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Add Currency',
            parent: 'admin.currencyList'
        },

        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.editCurrency', {
        url: '/edit-currency/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/currency/add.html',
                controller: 'currencyCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Edit Currency',
            parent: 'admin.currencyList'
        },
        // ncyBreadcrumb: {
        //     label: 'Add Currency',
        // },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.currencyPairs', {
        url: '/currency-pairs',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/currency_pair/list.html',
                controller: 'currencyPairCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.currencyPairs': {
                templateUrl: 'app/modules/admin/views/currency_pair/_action.html',
            },

            resolve: {
                data: function($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
        },
        ncyBreadcrumb: {
            label: 'Manage Currency Pairs',
        },
    });

    $stateProvider.state('admin.platformCommission', {
        url: '/platform-commission',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/commission/set_commission.html',
                controller: 'commissionCtrl',
                controllerAs: 'vm'
            }
            //                ,
            //                '_action@admin.currencyPairs': {
            //                    templateUrl: 'app/modules/admin/views/currency_pair/_action.html',
            //                    controller: 'commissionCtrl',
            //                    controllerAs: 'vm'
            //                }
        },
        ncyBreadcrumb: {
            label: 'Manage Platform Commission',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });
    $stateProvider.state('admin.tradeLimit', {
        url: '/trade-limit',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/trade_limit/set_limit.html',
                controller: 'tradeLimitCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Manage Trading Limit',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.countryList', {
        url: '/country-list',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/masters/country/list.html',
                controller: 'countryCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.countryList': {
                templateUrl: 'app/modules/admin/views/masters/country/_action.html',
                //                    controller: 'countryCtrl',
                //                    controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Manage Country',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.notificationList', {
        url: '/notification-list',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/notification/list.html',
                controller: 'notificationCtrl',
                controllerAs: 'vm'
            },

        },
        ncyBreadcrumb: {
            label: 'View Notification',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.roleList', {
        url: '/role-list',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/roles/list.html',
                controller: 'rolesCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.roleList': {
                templateUrl: 'app/modules/admin/views/roles/_action.html',

            }
        },
        ncyBreadcrumb: {
            label: 'Manage Roles',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.addRole', {
        url: '/add-role',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/roles/add.html',
                controller: 'rolesCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Add Role',
            parent: 'admin.roleList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.accessDenied', {
        url: '/permission-denied',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/exception/401.html',
                controller: 'rolesCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Access Denied',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.editRole', {
        url: '/edit-role/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/roles/add.html',
                controller: 'rolesCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Edit Role',
            parent: 'admin.roleList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });


    $stateProvider.state('admin.assignPermission', {
        url: '/assign-permission/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/permissions/assign.html',
                controller: 'permissionsCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Assign Permission Role',
            parent: 'admin.rolePermissionList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.rolePermissionList', {
        url: '/role-permission',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/permissions/list.html',
                controller: 'permissionsCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.rolePermissionList': {
                templateUrl: 'app/modules/admin/views/permissions/_action.html',
                //                    controller: 'countryCtrl',
                //                    controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Manage Permissions',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.adminUserList', {
        url: '/manage-user',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/users/list.html',
                controller: 'userCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.adminUserList': {
                templateUrl: 'app/modules/admin/views/users/_action.html',
                //                    controller: 'countryCtrl',
                //                    controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Manage Admin Users',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.addAdminUser', {
        url: '/add-user',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/users/add.html',
                controller: 'userCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Add User',
            parent: 'admin.adminUserList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.editBackendUser', {
        url: '/edit-user/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/users/add.html',
                controller: 'userCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Edit User',
            parent: 'admin.adminUserList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });


    $stateProvider.state('admin.addCountry', {
        url: '/add-country',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/masters/country/add.html',
                controller: 'countryCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Add Country',
            parent: 'admin.countryList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.editCountry', {
        url: '/edit-country/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/masters/country/add.html',
                controller: 'countryCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Edit Country',
            parent: 'admin.countryList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.stateList', {
        url: '/state-list',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/masters/state/list.html',
                controller: 'stateCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.stateList': {
                templateUrl: 'app/modules/admin/views/masters/state/_action.html',
                //                    controller: 'stateCtrl',
                //                    controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Manage State',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.addState', {
        url: '/add-state',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/masters/state/add.html',
                controller: 'stateCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Add State',
            parent: 'admin.stateList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.editState', {
        url: '/edit-state/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/masters/state/add.html',
                controller: 'stateCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Edit State',
            parent: 'admin.stateList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.cityList', {
        url: '/city-list',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/masters/city/list.html',
                controller: 'cityCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.cityList': {
                templateUrl: 'app/modules/admin/views/masters/city/_action.html',
            }
        },
        ncyBreadcrumb: {
            label: 'Manage City',
        },

        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });



    $stateProvider.state('admin.addCity', {
        url: '/add-city',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/masters/city/add.html',
                controller: 'cityCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Add City',
            parent: 'admin.cityList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.editCity', {
        url: '/edit-city/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/masters/city/add.html',
                controller: 'cityCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Edit City',
            parent: 'admin.cityList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.customerList', {
        url: '/customer-list?kyc_status',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/customer/list.html',
                controller: 'customerCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.customerList': {
                templateUrl: 'app/modules/admin/views/customer/_action.html',
            }
        },
        ncyBreadcrumb: {
            label: 'Manage Customers',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.editCustomer', {
        url: '/edit-customer/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/customer/edit.html',
                controller: 'customerCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Edit Customer Profile',
            parent: 'admin.customerList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.editCustomerKYC', {
        url: '/edit-customer-kyc/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/customer/kycNew.html',
                controller: 'customerCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Verify / Edit Customer KYC',
            parent: 'admin.customerList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.editCustomerBankDetail', {
        url: '/edit-customer-bank/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/customer/bank_details.html',
                controller: 'customerBankDetails',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Verify Customer Bank Details',
            parent: 'admin.customerList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.settings', {
        url: '/settings',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/settings.html',
                controller: 'settingsCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Admin Settings',
        },

        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.withdrawRequest', {
        url: '/withdraw-requests',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/withdraw_request/list.html',
                controller: 'withdrawRequestCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.withdrawRequest': {
                templateUrl: 'app/modules/admin/views/withdraw_request/_action.html',
            }
        },
        ncyBreadcrumb: {
            label: 'Manage Withdraw Requests',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.kycList', {
        url: '/kyc-master-list',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/masters/kyc/list.html',
                controller: 'kycCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.kycList': {
                templateUrl: 'app/modules/admin/views/masters/kyc/_action.html',
            }
        },
        ncyBreadcrumb: {
            label: 'Manage KYC',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });
    $stateProvider.state('admin.addKYC', {
        url: '/kyc-add',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/masters/kyc/add.html',
                controller: 'kycCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Add KYC',
            parent: 'admin.kycList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.editKYC', {
        url: '/edit-kyc/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/masters/kyc/add.html',
                controller: 'kycCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Edit KYC',
            parent: 'admin.kycList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    //           $stateProvider.state('admin.downloadAdminFile', {
    //             url: '/download?file_path',
    //             params: {
    //                 file_path: {dynamic: true}
    //             },
    //             views: {
    //                 'section@admin': {
    //                     templateUrl: 'app/modules/admin/views/masters/kyc/add.html',
    //                     controller: 'adminCtrl',
    //                     controllerAs: 'vm'
    //                 }
    //             },
    //             resolve: {
    //                 data: function ($q, $state, $timeout, AuthService, StateService) {
    //                     return StateService.resolveState();
    //                 }
    //             }
    //         });



    $stateProvider.state('admin.faqList', {
        url: '/faq-list',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/faq/list.html',
                controller: 'faqCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.faqList': {
                templateUrl: 'app/modules/admin/views/faq/_action.html',
                //                    controller: 'currencyCtrl',
                //                    controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Manage FAQ',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.addFaq', {
        url: '/add-faq',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/faq/add.html',
                controller: 'faqCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Add FAQ',
            parent: 'admin.faqList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.editFaq', {
        url: '/edit-faq/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/faq/add.html',
                controller: 'faqCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Edit FAQ',
            parent: 'admin.faqList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.EmailTemplateList', {
        url: '/email-template',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/email_template/list.html',
                controller: 'emailTemplateCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.EmailTemplateList': {
                templateUrl: 'app/modules/admin/views/email_template/_action.html',
                //                    controller: 'currencyCtrl',
                //                    controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Manage Email Template',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.addEmailTemplate', {
        url: '/add-email-template',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/email_template/add.html',
                controller: 'emailTemplateCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Add Email Template',
            parent: 'admin.EmailTemplateList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });



    $stateProvider.state('admin.editEmailTemplate', {

        url: '/edit-email-template/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/email_template/add.html',
                controller: 'emailTemplateCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Edit Email Template',
            parent: 'admin.EmailTemplateList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.SmsTemplateList', {
        url: '/sms-template',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/sms_template/list.html',
                controller: 'smsTemplateListCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.SmsTemplateList': {
                templateUrl: 'app/modules/admin/views/sms_template/_action.html',
                //                    controller: 'currencyCtrl',
                //                    controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Manage SMS Template',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.editSmsTemplate', {

        url: '/edit-sms-template/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/sms_template/add.html',
                controller: 'editSmsTemplateCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Edit SMS Template',
            parent: 'admin.SmsTemplateList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.addSmsTemplate', {

        url: '/add-sms-template',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/sms_template/add.html',
                controller: 'editSmsTemplateCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Add SMS Template',
            parent: 'admin.SmsTemplateList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.supportList', {
        url: '/support-list',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/support/list.html',
                controller: 'supportCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.supportList': {
                templateUrl: 'app/modules/admin/views/support/_action.html',
                //                    controller: 'currencyCtrl',
                //                    controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Manage Support',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.repplySupport', {
        url: '/repply-support/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/support/add.html',
                controller: 'supportCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Reply Support',
            parent: 'admin.supportList'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });


    $stateProvider.state('admin.ticketStatus', {
        url: '/ticket-status/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/support/change_status.html',
                controller: 'supportCtrl',
                controllerAs: 'vm'
            }
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });


    $stateProvider.state('admin.contact', {
        url: '/ContactUs',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/contact/list.html',
                controller: 'contactCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.contact': {
                templateUrl: 'app/modules/admin/views/contact/_action.html',

            }
        },
        ncyBreadcrumb: {
            label: 'Manage Contact',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.repplyContact', {
        url: '/repply-contact/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/contact/add.html',
                controller: 'contactCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Reply contact',
            parent: 'admin.contact'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });


    // $stateProvider.state('admin.ticketStatus', {
    //     url: '/ticket-status/{id:int}',
    //     params: {
    //         id: {dynamic: true}
    //     },
    //     views: {
    //         'section@admin': {
    //             templateUrl: 'app/modules/admin/views/contact/change_status.html',
    //             controller: 'contactCtrl',
    //             controllerAs: 'vm'
    //         }
    //     },
    //     resolve: {
    //         data: function ($q, $state, $timeout, AuthService, StateService) {
    //             return StateService.resolveState();
    //         }
    //     }
    // });

    $stateProvider.state('admin.totalDeposits', {

        url: '/total-deposits',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/report/total_deposit.html',
                controller: 'totalDepositCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Total Deposits'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.totalWithdrawals', {
        url: '/total-withdrawals',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/report/total_withdrawal.html',
                controller: 'totalWithdrawCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Total Withdrawals'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.addCurrencyPair', {

        url: '/addcurrency-pair',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/currency_pair/add.html',
                controller: 'currencyPairCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Add Currency Pairs',
            parent: 'admin.currencyPairs'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.editMyProfile', {
        url: '/edit-myprofile',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/my_profile/edit.html',
                controller: 'myprofileCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Edit Profile',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.adminchangePassword', {
        url: '/adminchangePassword',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/my_profile/changepassword.html',
                controller: 'myprofileCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Change Password',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });


    // by returning a rejection
    $stateProvider.state('adminforgotpass', {
        url: '/adminforgotpass',
        views: {
            'contentView': {
                templateUrl: 'app/modules/admin/views/signIn/forgotPass.html',
                controller: 'myprofileCtrl',
                controllerAs: 'vm'
            },
            'navbarView': {
                //                    templateUrl: 'app/modules/login/views/navbar.html'
            },
            'footer': {
                //                    templateUrl: 'app/modules/login/views/footer.html'
            }
        }

    });


    $stateProvider.state('adminforgotpasslink', {
        url: '/adminforgotpasslink?token',
        resolve: {
            data: function($q, adminService, $state, $stateParams) {
                var deferred = $q.defer();
                adminService.checkForgotPassLinkExpiry({ 'token': $stateParams.token }).then(function(response) {

                    if (response.status == -2) {
                        $state.go('adminPasswordResetExpiry');
                        deferred.reject();
                    } else {
                        deferred.resolve();
                    }
                }, function(err) {
                    $state.go('adminPasswordResetExpiry');
                    deferred.reject();
                });

                return deferred.promise;
            }

        },
        views: {
            'contentView': {
                templateUrl: 'app/modules/admin/views/signIn/changeAdminPass.html',
                controller: 'myprofileCtrl',
                controllerAs: 'vm'
            },
            'navbarView': {
                //                    templateUrl: 'app/modules/login/views/navbar.html'
            },
            'footer': {
                //                    templateUrl: 'app/modules/login/views/footer.html'
            }
        }

    });

    $stateProvider.state('adminPasswordResetExpiry', {
        views: {
            'contentView': {
                templateUrl: 'app/modules/admin/views/signIn/linkExpired.html',
                controller: 'myprofileCtrl',
                controllerAs: 'vm'
            },
            'navbarView': {
                //                    templateUrl: 'app/modules/login/views/navbar.html'
            },
            'footer': {
                //                    templateUrl: 'app/modules/login/views/footer.html'
            }
        }

    });


    $stateProvider.state('adminpaswordsuccess', {
        views: {
            'contentView': {
                templateUrl: 'app/modules/admin/views/signIn/sucessforgot.html',
                controller: 'myprofileCtrl',
                controllerAs: 'vm'
            },
            'navbarView': {
                //                    templateUrl: 'app/modules/login/views/navbar.html'
            },
            'footer': {
                //                    templateUrl: 'app/modules/login/views/footer.html'
            }
        }

    });

    $stateProvider.state('admin.transactionreport', {
        url: '/transaction-report',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/report/transaction.html',
                controller: 'transactionCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Manage Transation Report',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.feereport', {
        url: '/fee-report',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/fee_report/fee_report.html',
                controller: 'feeReportCtrl',
                controllerAs: 'vm'
            },
        },
        ncyBreadcrumb: {
            label: 'Fee Report',
        },
        resolve: {
            data: function ($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        },
       
    });

    $stateProvider.state('admin.feereportFiat', {
        url: '/fee-report-fiat',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/fee_report/feeReport_fiat.html',
                controller: 'feeReportFiatCtrl',
                controllerAs: 'vm'
            },
        },
        ncyBreadcrumb: {
            label: 'Fee Report',
        },
        resolve: {
            data: function ($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        },
       
    });


    $stateProvider.state('admin.editWithdrawRequest', {
        url: '/edit-withdraw-request/{id:int}',
        params: {
            id: { dynamic: true }
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/withdraw_request/edit.html',
                controller: 'withdrawRequestCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Edit Withdraw Request',
            parent: 'admin.withdrawRequest'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });


    $stateProvider.state('admin.customerreport', {
        url: '/customer-report',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/report/transaction_cutormer.html',
                controller: 'customerReportCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.customerreport': {
                templateUrl: 'app/modules/admin/views/report/_action.html',
            }
        },
        ncyBreadcrumb: {
            label: 'Manage Customer Report',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    })

    $stateProvider.state('admin.depositRequest', {
        url: '/deposit-requests',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/deposit_request/list.html',
                controller: 'depositRequestCtrl',
                controllerAs: 'vm'
            },
            '_action@admin.depositRequest': {
                templateUrl: 'app/modules/admin/views/deposit_request/_action.html',
            }
        },
        ncyBreadcrumb: {
            label: 'Manage Deposit Requests',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.editDepositRequest', {
        url: '/edit-deposit-request/{id:int}',
        params: {
            id: { dynamic: true }
        },
        ncyBreadcrumb: {
            label: 'Edit Deposit Request',
            parent: 'admin.depositRequest'
        },
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/deposit_request/edit.html',
                controller: 'depositRequestCtrl',
                controllerAs: 'vm'

            }
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.addAmountFiat', {
        url: '/addAamount',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/add_amount/addAmountFiat.html',
                controller: 'addAmountCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Add Amount',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    })

    $stateProvider.state('admin.addAmount', {
        url: '/add-amount',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/add_amount/add_amount.html',
                controller: 'addAmountCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Add Amount',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    })

    $stateProvider.state('admin.orderBook', {
        url: '/order-book',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/order_book/order_book.html',
                controller: 'orderBookCtrl',
                controllerAs: 'vm'
            },
        },
        ncyBreadcrumb: {
            label: 'Order Book',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        },
        onExit: function(socket) {
            socket.emit('leave_pair_id', socket.pairId);
            delete socket.pairId;
        }
    });
    $stateProvider.state('admin.customerdetails', {
            url: '/customer-report-details/{id:int}',
            views: {
              'section@admin': {
                templateUrl: 'app/modules/admin/views/customer_report_details/report_detail.html',
                controller: 'customerReportDetailsCtrl',
                controllerAs: 'vm'
              }
            },
            ncyBreadcrumb: {
                label: 'Customer Details Report',
            },
            resolve: {
                data: function ($q, $state, $timeout, AuthService, StateService) {
                    return StateService.resolveState();
                }
            }
          });

    $stateProvider.state('admin.depositsReport', {
        url: '/deposits',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/report/deposit_report.html',
                controller: 'depositReportCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Deposit Report'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });

    $stateProvider.state('admin.withdrawalReport', {

        url: '/withdrawal',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/report/withdrawal_report.html',
                controller: 'widthdrawalReportCtrl',
                controllerAs: 'vm'
            }
        },
        ncyBreadcrumb: {
            label: 'Withdraw Report'
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });
    $stateProvider.state('admin.activityLog', {
        url: '/activity-log',
        views: {
            'section@admin': {
                templateUrl: 'app/modules/admin/views/activity_log/activity.html',
                controller: 'activityLogCtrl',
                controllerAs: 'vm'
            }
            //                ,
            //                '_action@admin.currencyPairs': {
            //                    templateUrl: 'app/modules/admin/views/currency_pair/_action.html',
            //                    controller: 'commissionCtrl',
            //                    controllerAs: 'vm'
            //                }
        },
        ncyBreadcrumb: {
            label: 'Activity Log',
        },
        resolve: {
            data: function($q, $state, $timeout, AuthService, StateService) {
                return StateService.resolveState();
            }
        }
    });


    $httpProvider.interceptors.push('myInterceptor');
}]).factory('myInterceptor', ['$q', '$rootScope',
    function($q, $rootScope) {
        var interceptor = {
            'request': function(config) {
                $rootScope.showSpinner = true;
                // Successful request method
                return config; // or $q.when(config);
            },
            'response': function(response) {
                $rootScope.showSpinner = false;
                //                    $rootScope.showSpinner = false;
                // successful response
                return response; // or $q.when(config);
            },
            'requestError': function(rejection) {
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
            'responseError': function(rejection) {
                if (rejection.status === 404) {
                    location.href = '/404';
                    return $q(function() { return null; })
                }

                if (rejection != null && rejection['data'] != null && rejection['data']['customer'] === 1) {
                    location.href = '/dashboard/permission-denied';
                    return $q(function() { return null; })
                } else
                if (rejection != null && rejection['status'] == 401) {
                    location.href = '/admin/permission-denied';
                    return $q(function() { return null; })
                } else {
                    $rootScope.globals = undefined;
                    sessionStorage.removeItem('globals');
                }
                $rootScope.showSpinner = false;
                return rejection;
            }
        };
        return interceptor;
    }
]).factory('socket', ['$rootScope', function($rootScope) {

    // var socket = io.connect('https://exchange-dev.sofodev.co');
    // var socket = io.connect('http://localhost:4000');
    var socket;

    return {
        init: function() {
            if (!socket)
                socket = io('/admin')
        },
        socket: socket,
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
}]);;