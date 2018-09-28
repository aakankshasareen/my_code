admin.controller("adminDashboardCtrl", ['$rootScope', '$scope', 'loginService', 'dashboardService', 'AuthService', 'adminService', '$state', 'toastr', '$stateParams', 'socket', 
    function ($rootScope, $scope, loginService, dashboardService, AuthService, adminService, $state, toastr, $stateParams, socket) {

        var vm = this;
        var totalUsers = 0;
        var currencyIcons = {};        
        adminService.getTotalUsers().then(function (response) {
            if (response.success) {
                
                vm.totalUsers = response.data[0].count;
            }
        });

        adminService.getTotalActiveCurrencies().then(function (response) {
            if (response.success) {
                vm.totalCurrencies = response.data[0].total_currencies;
            }
        });

        adminService.getActiveCurrencyIcons().then(function (response) {
            if (response.success) {
                vm.currencyIcons = response.data;
            }
        });
        
        adminService.getNewCustomers().then(function (response) {
            if (response.success) {
                vm.customersData = response.data;
            }
        });

        adminService.getTradeCurrencyPairs().then(function (response) {
            if (response.success) {
                vm.tradeCurrencyPairs = response.result;
            }
        });

        adminService.getTotalCustomerByKycStatus({kyc_status:1}).then(function (response) {
            if (response.success) {
                vm.totalPendingKyc = response.data[0].total_count;
            }
        });

        adminService.getAllLastTradePrice().then(function (response) {
            if (response.success) {
                vm.tradeCurrencyPairs = response.result;
            }
        });

        vm.function1=function(){
            var currency_code = 'BTC' 
            adminService.getTotalFee({currency_code}).then(function(response){
                if (response.success) {
                    vm.totalFeeBTC = response.data[0].totalFee
                   }
            })
        }
       
       
        
       

        vm.function2=function(){
           
        var currency_code = 'ETH' 
        adminService.getTotalFee({currency_code}).then(function(response){
            if (response.success) {
                vm.totalFeeETH = response.data[0].totalFee
               }
          })
        }

        vm.function3=function(){
           var currency_code = 'LTC' 
           adminService.getTotalFee({currency_code}).then(function(response){
            if (response.success) {
                vm.totalFeeLTC = response.data[0].totalFee
               }
          })
        }


        vm.function4=function(){
            var currency_code = 'FULX' 
            adminService.getTotalFee({currency_code}).then(function(response){
            if (response.success) {
                vm.totalFeeFULX = response.data[0].totalFee
               }
          })
        }


         vm.function5=function(){
            var currency_code = 'ABC' 
            adminService.getTotalFee({currency_code}).then(function(response){
            if (response.success) {
                vm.totalFeeABC = response.data[0].totalFee
               }
          })
        }
        vm.function6=function(){
            var currency_code = 'USD' 
            adminService.getTotalFee({currency_code}).then(function(response){
            if (response.success) {
                vm.totalFeeUSD = response.data[0].totalFee
               }
           })
        }

        vm.function7=function(){
            var currency_code = 'HKD' 
            adminService.getTotalFee({currency_code}).then(function(response){
     
            if (response.success) {
                vm.totalFeeHKD = response.data[0].totalFee
               }
          })
        }


        vm.function8=function(){
            var currency_code = 'RMB' 
            adminService.getTotalFee({currency_code}).then(function(response){
            if (response.success) {
                vm.totalFeeRMB = response.data[0].totalFee
               }
           })
         }


        vm.function9=function(){
            var currency_code = 'SGD' 
            adminService.getTotalFee({currency_code}).then(function(response){
      
            if (response.success) {
                vm.totalFeeSGD = response.data[0].totalFee
               }
          })
        }

        vm.function10=function(){
            var currency_code = 'TWD' 
            adminService.getTotalFee({currency_code}).then(function(response){
            if (response.success) {
                vm.totalFeeTWD = response.data[0].totalFee
               }
          })
        }

        vm.function1();
        vm.function2();
        vm.function3();
        vm.function4();
        vm.function5();
        vm.function6();
        vm.function7();
        vm.function8();
        vm.function9();
        vm.function10();

        // get Date Settings if $rootScope.displayDateFormat is not defined
        if(!sessionStorage.getItem('displayDateFormat')){
          adminService.getAdminSettings().then(function(response){
            if(response.success && response.data[0].display_date_format){
              sessionStorage.setItem('displayDateFormat', response.data[0].display_date_format);
            }
          });
        }
        vm.liveUsersUpdate = function(){
          adminService.getLiveUsers().then(function(response){
          if (response.success)
            vm.liveUsers = response.liveUsers;
        });}

        vm.liveUsersUpdate();
    }
]);
