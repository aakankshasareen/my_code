admin.controller("adminCtrl", ['$rootScope', '$scope', 'loginService', 'dashboardService', 'AuthService', 'adminService', '$state', 'toastr', '$stateParams', '$window', 'vcRecaptchaService','socket',
    function ($rootScope, $scope, loginService, dashboardService, AuthService, adminService, $state, toastr, $stateParams, $window, vcRecaptchaService, socket) {

        
        var vm = this;
        vm.fiatBalance = [{'currencyCode': 'USD', 'currencySymbol': '$', 'balance': '5.00', 'order': '5.00', 'total': '10.00'},
            {'currencyCode': 'USD2', 'currencySymbol': '$', 'balance': '5.00', 'order': '5.00', 'total': '10.00'}
        ];
        vm.getAdminUser = {}
        vm.getUser = {};
        vm.setUser = {};
        vm.notify_counter = 0;
        
         // Set the default value of inputType
         vm.inputType = 'password';
         vm.showPassword = false;
        vm.hideShowPassword = function() {
            if (vm.inputType == 'password') {
                vm.inputType = 'text';
                vm.showPassword = true;
            } else {
                vm.inputType = 'password';
                vm.showPassword = false;
            }
        };
        
        navigator.sayswho = (function () {
            var ua = navigator.userAgent,
                    tem,
                    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                return 'IE ' + (tem[1] || '');
            }
            if (M[1] === 'Chrome') {
                tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
                if (tem != null)
                    return tem.slice(1).join(' ').replace('OPR', 'Opera');
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null)
                M.splice(1, 1, tem[1]);
            return M.join(' ');
        })();

        if (vm.setUser.device_ipAddress == undefined || vm.getUser.device_ipAddress == undefined) {
            $.getJSON('https://api.ipify.org?format=json', function (data) {
                sessionStorage.setItem("myIP", data.ip);
            });
        }
        
        // for other controllers
        sessionStorage.setItem('myBrowser', navigator.sayswho);
        sessionStorage.setItem('myOS', $window.navigator.platform);
        sessionStorage.setItem('myDevice', "Desktop");

        // console.log(sessionStorage.getItem('myBrowser'));
        // console.log(sessionStorage.getItem('myOS'));
        // console.log(sessionStorage.getItem('myDevice'));
        // console.log(sessionStorage.getItem('myIP'));
        
        
        if (AuthService.isAuthenticated()) {
            vm.adminNotification = function () {
                adminService.getAllNotification().then(function (response) {         
                if (response.success) {
                        vm.allNotifications = response.data;
                        vm.notify_counter = response.notify_data;

                    }
                });
            }
            vm.adminNotification();

            socket.on('new_notification', function(message){
              vm.notify_counter = parseInt(vm.notify_counter) + 1;
              toastr.success('You got new notification, please check.');          
              vm.adminNotification();
            })
            
        }
        
        vm.resetAdminNotification =  function (data) {
            if(vm.notify_counter > 0) {
                vm.notify_counter = 0;
                adminService.resetAdminNotification().then(function (response) {         
                    if (response.success) {

                    }
                });
            }
            
        };
       
        vm.markNotificationRead =  function (notify_id, index) {            
            if(vm.allNotifications[index].is_read == 0) {
                vm.allNotifications[index].is_read = 1;
                var data = {
                   "notify_id": notify_id,             
                }
                adminService.markNotificationRead(data).then(function (response) {
                    if (response.success) {

                    }
                });   
            }            
        };
        
        vm.adminLogin = function (data) {
            if (vm.loginForm1.$valid /*&& vm.getAdminUser.g_recaptcha_response !== undefined*/) {
                adminService.accessLogin(data).then(function (response) {
                    
                    if (response.success) {
                      // sessionStorage.setItem('adminEmail', vm.getAdminUser.email);
                      // sessionStorage.setItem('adminRoleId', response.role_id);
                      // sessionStorage.setItem('user_type', 'A');
                      // sessionStorage.setItem('isSuperAdmin', response.is_super_admin);
                      if (angular.isDefined(response.FA_status) && response.FA_status == 1) {
                         $state.go('admin_login2FA', { 'response': response });
                      } else {
                        $state.go('configure2FA', {'response': response});

                      }
                    } else {
                        // vcRecaptchaService.reload();
                        toastr.error(response.message);
                    }

                }, function (err) {
                    // vcRecaptchaService.reload();
                    toastr.error('Something went wrong. Please try again later.');
               });
            }/*else if(vm.getAdminUser.g_recaptcha_response == undefined) {
                toastr.error("Captcha is required");
                
            }*/
        };
        
        vm.adminLogout = function () {
            adminService.adminLogout().then(function (response) {
                AuthService.clearCredentials();
//                console.log(window.location);
                var origin = window.location.origin;
                $window.location.href = origin + '/admin';
            }, function (err) {
                toastr.error('Something went wrong. Please try again later.');
            
            });
        }

        vm.verifyToke = function () {
            var data = {
                "verifyCode": vm.verCode,
                "logintoken": $stateParams.response.token
            }
            //  $rootScope.showSpinner = true;
            loginService.verifyAdminToken(data).then(function (response) {
                if (response.success) {
                    sessionStorage.setItem('adminEmail', vm.getAdminUser.email);
                    sessionStorage.setItem('adminRoleId', $stateParams.response.role_id);
                    sessionStorage.setItem('user_type', 'A');
                    sessionStorage.setItem('isSuperAdmin', $stateParams.response.is_super_admin);
                    $state.go('admin.dashboard');
                } else {
                    toastr.error(response.message);
                    if(response.status == -2){
                      $state.go('admin_login')
                    }
                }
                //  $rootScope.showSpinner = false;
            }, function (err) {
                toastr.error('Something went wrong. Please try again later.');
                
                // $rootScope.showSpinner = false;
            });
        };

        if ($state.includes('admin')) {
            adminService.userProfileAdmin().then(function (response) {
                if (response.success) {
                   vm.userName = response.data.fullname;
                }
            });
        }




//         if ($state.is('admin.settings')) {
//            adminService.getAdminSettings().then(function (response) {
//                if (response.success) {
//                    console.log(response.data);
//                    vm.settings = response.data;
//                }
//            });
//        }


//        vm.updateSettings = function () {
//
//            var data = {
//                'date_format': vm.settings.date_format
//            }
//            adminService.updateSettings(data).then(function (response) {
//                if (response.success) {
//                    $state.go('admin.settings')
//                    ngToast.create({
//                        className: 'success',
//                        content: response.message
//                    });
//                } else {
//                    ngToast.create({
//                        className: 'danger',
//                        content: response.message
//                    });
//                }
//            }, function (err) {
//                ngToast.create({
//                    className: 'danger',
//                    content: 'Something went wrong'
//                });
//            });
//        }
		vm.highlightMenuSelection = function() {
			$("body").on("click", ".sidebar-menu .treeview", function() {
                $(".sidebar-menu .treeview").removeClass("active");
                $(".sidebar-menu .treeview.open").removeClass("open").find(".submenu").slideUp();
            });

            $("body").on("click", ".treeview a", function() {
                sessionStorage.setItem('Current Menu', "none");
                $(".sidebar-menu .treeview").removeClass("active");
            });


            $("body").on("click", ".sidebar-menu .treeview", function() {
                var menuText = $(this).find(".menu-text").text();
                sessionStorage.setItem('Current Menu', menuText);
            });

            var menutoActive = sessionStorage.getItem("Current Menu");

            $(".sidebar-menu .treeview").each(function() {
                var $this = $(this);

                var textToMatch = $this.find(".menu-text").text();

                if (textToMatch === menutoActive) {
                    $(".sidebar-menu .treeview").removeClass("active");
                    $this.addClass("active");

                }

                if (menutoActive === "none") {
                    $(".sidebar-menu .treeview").removeClass("active");
                }

            });
        }
    }
]).controller('config2FActrl',['$rootScope', '$scope', '$state', 'loginService', 'adminService', '$stateParams', 'toastr', 'FileSaver', 'Blob',
  function($rootScope, $scope, $state, login, adminService, $stateParams, toastr, FileSaver, Blob){
  let vm = this;
    vm.backupKey = '';
  var data = {
    "logintoken": $stateParams.response.token
  }

  //download 2FA Backup Key
  vm.download = function() {
      var data = new Blob([vm.backupKey], { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(data, '2fa-backup-key.txt');
  };

  adminService.getQRCode(data).then(function(response) {
    if (response.success) {
      vm.qrcode = '<img src="' + response.data + '"/>';
      vm.backupKey =  response.secretKey
   } else {
    toastr.error(response.message);
     
    }
    if(response.status == -2)
      $state.go('admin_login')
  })

  vm.verifyToken = function () {
      var data = {
          "verifyCode": vm.verCode,
          "logintoken": $stateParams.response.token,
          "status": 1
      }
      //  $rootScope.showSpinner = true;
      adminService.setFaStatus(data).then(function (response) {
          if (response.success) {
              sessionStorage.setItem('adminRoleId', $stateParams.response.role_id);
              sessionStorage.setItem('user_type', 'A');
              sessionStorage.setItem('isSuperAdmin', $stateParams.response.is_super_admin);
              $state.go('admin.dashboard');
          } else {
            toastr.error(response.message);
          }
          if(response.status == -2){
            $state.go('admin.admin_login')
          }
          //  $rootScope.showSpinner = false;
      });
  }

}]);
