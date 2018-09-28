dashboard.controller("BankDetails", ['$rootScope', '$scope', '$state', 'toastr','dashboardService', 'AuthService', '$interval', '$window', 'loginService', '$uibModal',
    function($rootScope, $scope, $state,toastr, dashboardService, AuthService, $interval, $window, loginService, $uibModal) {
      var vm = this;
      vm.dateOptions = {
        maxDate: new Date(),
        //  minDate: new Date(),
        startingDay: 1,
        showWeeks: false
    };

//     function checkAccountMatch() {
// var account = $("#accountNumber").val();
// var confirmAccount = $("#accountNumberConf").val();

// if (account != confirmAccount) {
//   $("#divCheckPasswordMatch").html("Bank account number not matched!");

// }
// else{
//   $("#divCheckPasswordMatch").html("Bank account number matched!");
// }
// }
   
      $scope.token = sessionStorage.getItem('globals');
      vm.bank = {};
      $window.scrollTo(0, 0);
      
      dashboardService.getBankDetails().then(function(response){
        if(response.success && response.message == "User Bank Account details"){
          vm.bank = response.data;
          //var type ={'id': response.data.accountType}
          vm.bank.accountType = response.data.accountType;
          // vm.bank.accountType =type.id?'Saving':'Current';
          vm.bank.confirmAccount = response.data.accountNumber;
          vm.bankDetailsUploaded = true;
          vm.documents = []
          response.data.documents.forEach(function(doc_url){
            vm.documents.push({
              docURL: doc_url,
              docName: doc_url.split('/').pop()
            })
          })
        }
      }).catch(function(err){
        $state.go('dashboard.userProfile');
        toastr.error('Error fetching bank details.');
          // ngToast.create({
          //     className: 'danger',
          //     content: 'Error fetching bank details.'
          // });
      })

      vm.getAccountTypes = [{'id':1, 'name':'Savings'}, {'id':2, 'name':'Current'}];

      vm.downloadDoc = function(url){
          downloadForm.path.value = url;
          downloadForm.submit();
      }

      dashboardService.getKycStatus().then(function(response) {
        $rootScope.kycStatus = response.completeinfo;
        $rootScope.kycComment = response.comment;
    }, function(err) {});


      vm.updateBankDetails = function(){

             
        if(vm.bankDetails.$valid){
         if(vm.bank.accountNumber === vm.bank.accountNumberConf) {
          var data = {
            bankName: vm.bank.bankName,
            accountHolderName: vm.bank.holderName,
            ifscCode: vm.bank.ifscCode,
            bankBranch: vm.bank.bankBranch,
            bankAccountNo: vm.bank.accountNumber,
            accountType: vm.bank.accountType
          }
         
          

                 
          dashboardService.updateBankDetails(data).then(function(response){
            if(response.success && vm.file){
              dashboardService.uploadBankDocument( vm.file, response.data.id).then(function(response){
                 //response = 
                if(response.data.success){
                  toastr.success('Bank details saved successfully');
                    $state.go('dashboard.userProfile');
                  // ngToast.create({
                  //     className: 'success',
                  //     content: 'Bank details saved successfully'
                  // });
                } else {
                  
                        toastr.error(response.message);
                       
                    }
              }).catch(function(err){
                toastr.error('Error while uploading documents');
                // ngToast.create({
                //     className: 'success',
                //     content: 'Error while uploading documents'
                // });
              })
            }
            else if(response.success){
              toastr.success('Bank details saved successfully');
              $state.go('dashboard.userProfile');
            } else{
              toastr.error(response.message);
                       
                    
            }

          }).catch(function(err){
            toastr.error('Error submitting bank details.');
            // ngToast.create({
            //     className: 'danger',
            //     content: 'Error submitting bank details.'
            // });
          })
        }else {
          toastr.error('Bank account number not matched')
        }
        }
        return false;
      }

      dashboardService.getKycDetails().then(function(response){
      
        vm.res = response.result ;
        vm.status = 0
      if(response.result.length>0){
    
      //console.log( vm.res)
      vm.pan_name=response.result[0].name;
      vm.pan_dob=moment(new Date(response.result[0].dob).getTime()).format("YYYY-MM-DD");
      vm.pan_num=response.result[0].number;
      vm.adhar_num=response.result[1].number;
      vm.adhar_name=response.result[1].name;
      vm.status = response.result[0].status==1 && response.result[1].status==1?1:0;
    }
         //$scope.userKycDetail= response.result;

     })

    }])
