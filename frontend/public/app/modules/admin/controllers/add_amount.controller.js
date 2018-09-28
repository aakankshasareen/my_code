admin.controller("addAmountCtrl", ['$rootScope', '$scope', 'adminService', '$state', 'toastr', '$stateParams',
    function ($rootScope, $scope, adminService, $state, toastr, $stateParams,) {
      var vm = this;
      vm.wallet = {};
      adminService.getAdminActiveCurrencyList({'id':''}).then((response)=>{
        if(response.success){
          vm.currencies = response.result;
        } else {
          toastr.error(response.message)
        }
      }).catch((err)=>{
        toastr.error('Error while fetching active currencies')
      })
      vm.addAmountToWallet = function() {
        if(vm.addAmountForm.$valid){
          var data = {
            wallet: vm.wallet,
            cust_email: vm.cust_email
          }
          adminService.addAmountToWallet(data).then(function(response){
              if(response.success)
                toastr.success(response.message)
              else {
                toastr.error(response.message)
              }
          }).catch((err)=>{
            toastr.error('Error while making the request')
          })
        }
      }
      
       if($state.is('admin.addAmountFiat')){
        adminService.getAdminActiveCurrencyListFiat({'id':''}).then((response)=>{
          if(response.success){
            console.log(response)
            vm.fiatCurrencies = response.result;
          } else {
            toastr.error(response.message)
          }
        }).catch((err)=>{
          toastr.error('Error while fetching active currencies')
        })

        vm.addAmountToWallet = function() {
          if(vm.addAmountForm.$valid){
            var data = {
              wallet: vm.wallet,
              cust_email: vm.cust_email
            }
            adminService.addAmountToWallet(data).then(function(response){
                if(response.success){
                  toastr.success(response.message)
                  $state.go('admin.dashboard');
                }
                else {
                  toastr.error(response.message)
                }
            }).catch((err)=>{
              toastr.error('Error while making the request')
            })
          }
        }
        
      }

    }
  ]
)
