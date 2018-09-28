admin.controller("settingsCtrl", ['$rootScope', '$scope', 'loginService', 'dashboardService', 'AuthService', 'adminService', '$state', 'toastr', '$stateParams',
    function ($rootScope, $scope, loginService, dashboardService, AuthService, adminService, $state, toastr, $stateParams) {

        var vm = this;


        vm.settings = {};
        vm.date_format= [{ id: '1', 'name': 'MM-dd-yyyy' }, { id: '2', 'name': 'dd-MM-yyyy ' },{id:'3' , 'name':'yyyy-MM-dd'}];
        vm.display_date_format= [{ id: 'DD-MM-YYYY HH:mm a', 'name': 'DD-MM-YYYY HH:mm a' }];

        adminService.getAdminSettings().then(function (response) {
            if (response.success) {
                vm.settings.date_format = {'name':response.data[0].date_format};
                vm.settings.display_date_format = {'name':response.data[0].display_date_format};
            }
        });

        vm.updateSettings = function () {            
            if (vm.settingsForm.$valid) {
            var data = {
                'date_format': vm.settings.date_format.name,
                'display_date_format': vm.settings.display_date_format.name,
            }
            console.log(data)
            adminService.updateSettings(data).then(function (response) {
                if (response.success) {
                    $state.go('admin.settings')
                    toastr.success(response.message);
                       
                  
                } else {
                    toastr.error(response.message);
                       
                  
                }
            }, function (err) {
                toastr.error('Something went wrong');
                       
                
            });
        }

        
    }

    vm.cancel = function () {
           
            $state.go('admin.dashboard');
        }
}
]);