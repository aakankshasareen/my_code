dashboard.controller("faqController", ['$rootScope', '$scope', '$sce', '$state', 'toastr','faqService','AuthService', '$interval', function($rootScope, $scope, $sce, $state,toastr, faqService, AuthService, $interval) {

        var vm = this;
  
     
        // to get username 
       
        vm.getAllfaqList = function() {
            
            $rootScope.showSpinner = true;
            faqService.getAllfaqList().then(function(response) {

            if (response.success)
                    //console.log("hehehe");
                    $scope.data = response.data;
                    $rootScope.showSpinner = false;
            }, function(err) {
                toastr.error('Something went wrong. Please try again later.');
                // ngToast.create({
                //     className: 'danger',
                //     content: 'Something went wrong. Please try again later.'
                // });
                $rootScope.showSpinner = false;
            });
        }
        
        vm.getAllfaqList();

        vm.getAllFaqCat=function(){
            
            $rootScope.showSpinner = true;
            faqService.getAllfaqCat().then(function(response) {

            if (response.success)
                    //
                    $scope.dataCat = response.dataCat;
                    $rootScope.showSpinner = false;
            }, function(err) {
                toastr.error('Something went wrong. Please try again later.');
                // ngToast.create({
                //     className: 'danger',
                //     content: 'Something went wrong. Please try again later.'
                // });
                $rootScope.showSpinner = false;
            });
        }
        
        vm.getAllFaqCat();


        vm.getFaqById=function(event){

            //alert("hi how are you" + event.target.id );
            let data={"id":event.target.id}
            

            $rootScope.showSpinner = true;
            faqService.getAllfaqByCat(data).then(function(response) {

            if (response.success)
                    //
                    $scope.data = response.data;
                    $rootScope.showSpinner = false;
            }, function(err) {
                toastr.error('Something went wrong. Please try again later.');
                // ngToast.create({
                //     className: 'danger',
                //     content: 'Something went wrong. Please try again later.'
                // });
                $rootScope.showSpinner = false;
            });

        }


        vm.addSupportData = function(data, file,){
             var myIdData = angular.copy(data);
            var data = {
                            'issue': myIdData.issue.$viewValue,
                            'email': myIdData.email.$viewValue,
                            'subject': myIdData.subject.$viewValue,
                            'desc': myIdData.desc.$viewValue,
                            'query': myIdData.query.$viewValue,
                            //"file":  vm.uploadAttachment.name                         
                        }

            $rootScope.showSpinner = true;
            faqService.addSupportData(data).then(function(response) {
                //console.log("44646465");
               // console.log(response);
                if (response.success) {
                    //console.log("1312")
                    faqService.uploadSupport(file, response.id).then(function(response) {
                    $rootScope.showSpinner = false;
                    toastr.success('Support Information is updated successfully.');
                        // ngToast.create({
                        //     className: 'success',
                        //     content: 'Support Information is updated successfully.'
                        // });
                    });
                    $state.reload('dashboard.support')
                    } else {
                        toastr.error(response.message);
                        // ngToast.create({
                        //     className: 'danger',
                        //     content: response.message
                        // });

                    }
                
                    $rootScope.showSpinner = false;
            }, function(err) {
                toastr.error('Something went wrong. Please try again later.');
                // ngToast.create({
                //     className: 'danger',
                //     content: 'Something went wrong. Please try again later.'
                // });
                $rootScope.showSpinner = false;
            });
        }

        $rootScope.call_download = function(value){
            test_call_download.doc.value = value;
            test_call_download.submit();
        }
        
    
        
    }])
    

    

