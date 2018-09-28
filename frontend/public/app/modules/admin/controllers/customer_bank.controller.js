admin.controller("customerBankDetails", ['$rootScope', '$scope', 'adminService', '$state', 'toastr', '$stateParams',
    function($rootScope, $scope, adminService, $state, toastr, $stateParams) {
        var vm = this;
        $scope.token = sessionStorage.getItem('globals');
        $scope.custId = $stateParams.id
        adminService.getBankDetails($stateParams.id).then((response) => {
            if (response.success) {

                vm.bankDetails = response.data;
                if (response.data.accountType == 1) {
                    vm.bankDetails.accountType = 'Saving'
                } else {
                    vm.bankDetails.accountType = 'Current'
                }
                if (response.data.documents && response.data.documents.length) {
                    vm.documents = []
                    response.data.documents.forEach(function(doc_url) {
                        vm.documents.push({
                            docURL: doc_url,
                            docName: doc_url.split('/').pop()
                        })
                    })
                }
            } else {
                // toastr.error(response.message)
            }
        }).catch((err) => {
            console.log(err)
            toastr.error('Error fetching bank details')
        })

        vm.updateBankStatus = function(status) {
            if (vm.bankDetails.id) {
                if (status === 3 && !vm.remark) {
                    vm.remarkRequired = true;
                    return;
                }
                var data = {
                    bankId: vm.bankDetails.id,
                    status: status,
                    remark: vm.remark,
                    customer_id: $scope.custId,
                    old_status:vm.bankDetails.status
                }
                adminService.updateBankDetailsStatus(data).then((response) => {
                    if (response.success) {
                        toastr.success(response.message);
                        $state.reload();
                    } else {
                        toastr.error(response.message);
                    }
                }).catch((err) => {
                    toastr.error('Error while making request');
                })
            } else {
                toastr.error('No bank details found');
            }
        }

        vm.downloadDoc = function(url) {
            downloadForm.path.value = url;
            downloadForm.submit();
        }

        vm.cancel = function() {
            $state.go('admin.customerList');
        }
    }
])