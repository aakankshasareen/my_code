dashboard.controller("KycController", ['$rootScope', '$scope', 'dashboardService','toastr', 'ID_TYPE', 'ADDRESS_TYPE', '$httpParamSerializer', '$filter', 'IMAGE_TYPE', '$state',
    function($rootScope, $scope, dashboardService, toastr, ID_TYPE, ADDRESS_TYPE, $httpParamSerializer, $filter, IMAGE_TYPE, $state) {

        var vm = this;

        vm.pers = {};
        vm.poaRes = {};
        vm.poaP = {};
        vm.idType = {};

        vm.test_fn = ()=>{
        }
        var pdfPath = 'assets/images/pdf.png';
        var docPath = 'assets/images/doc.jpeg';
        var noExtFound = 'assets/images/dummydoc.png';

        vm.device_os = sessionStorage.getItem('myOS');
        vm.device_browser = sessionStorage.getItem('myBrowser');
        vm.device_name = sessionStorage.getItem('myDevice');
        $scope.token = sessionStorage.getItem('globals');

        var sortItems = function(a, b) {
            var nameA = a.name.toUpperCase();
            var nameB = b.name.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            // names must be equal
            return 0;
        }

        vm.dateOptions = {
            maxDate: new Date(),
            //  minDate: new Date(),
            startingDay: 1,
            showWeeks: false
        };

        dashboardService.getCountries().then(function(response) {
            if (response.success) {
                vm.getCountry = response.data;
            };
        });

        vm.getStatesByCountryId_Res = function(country) {
            dashboardService.getStates({ 'id': country.id }).then(function(response) {
                if (response.success) {
                    vm.getStatesRes = response.data;
                }
            }, function(err) {});

            vm.getAddressProofTypes(country);
        }

        vm.getStatesByCountryId_Per = function(country) {
            dashboardService.getStates({ 'id': country.id }).then(function(response) {
                if (response.success) {
                    vm.getStatesPer = response.data;
                }
            }, function(err) {});
        }

        vm.getCitiesByStateId_Res = function(state) {
            if (angular.isDefined(vm.poaRes.res_state)) {
                dashboardService.getCities({ 'id': vm.poaRes.res_state.id }).then(function(response) {
                    if (response.success)
                        vm.getCitiesRes = response.data;
                }, function(err) {});
            } else vm.poaRes.res_city = undefined;
        }

        vm.getCitiesByStateId_Per = function(state) {
            if (angular.isDefined(vm.poaP.state) && vm.poaP.state != null) {
                dashboardService.getCities({ 'id': vm.poaP.state.id }).then(function(response) {
                    if (response.success)
                        vm.getCitiesPer = response.data;
                }, function(err) {});
            } else vm.poaP.city = undefined;
        }


        vm.getAddressProofTypes = function(country) {
            dashboardService.getKYCData({ 'type': 4, 'country_id': country.id }).then(function(response) {
                if (response.success) {
                    if (response.data.length != 0) {
                        response.data.sort(sortItems);
                        vm.getAddrProofTypes = response.data;
                        vm.getPerAddrProofTypes = response.data;
                    } else {
                        vm.getAddrProofTypes = ADDRESS_TYPE;
                        vm.getPerAddrProofTypes = ADDRESS_TYPE;
                    }
                } else {
                    vm.getAddrProofTypes = ADDRESS_TYPE;
                }
            });
        }

        vm.getIDTypesList = function(country) {
            dashboardService.getKYCData({ 'type': 2, 'country_id': country }).then(function(response) {
                if (response.success) {
                    if (response.data.length != 0) {
                        response.data.sort(sortItems);
                        vm.getIDType = response.data;
                    } else {
                        vm.getIDType = ID_TYPE;
                    }
                } else {
                    vm.getIDType = ID_TYPE;
                }
            });
        }

        vm.changeCountry = function(country) {
            vm.getIDTypesList(country.id);
            vm.idType.doc_name = undefined;
            vm.idType.doc_reference = undefined;
            vm.idType.issue_date = undefined;
            vm.idType.expiration_date = undefined;
        }

        vm.issueDate = {
            opened: false
        };
        vm.expDate = {
            opened: false
        }
        vm.dob = {
            opened: false
        }

        vm.dateExpiryOptions = {
            // maxDate: new Date(),
            //  minDate: new Date(),
            startingDay: 1,
            showWeeks: false
        };

        var checkImageExtension = function(param) {
            if (angular.isDefined(param) && param !== null) {
                var ext = $filter('extension')(param);
                ext = ext.toLowerCase();
                var rt = IMAGE_TYPE.indexOf(ext);

                return { index: rt, ext: ext };
            }
        }

        dashboardService.getKycStatus().then(function(response) {
            vm.kycPersonalStatus = response.personalinfo;
            vm.kycIdStatus = response.idinfo;
            vm.kycAddrStatus = response.addressinfo;
            vm.kycCompleteStatus = response.completeinfo;

            dashboardService.userDefaultCountry().then(function(response) {
                if (response.success) {

                    if (!vm.kycIdStatus) {
                        if (angular.isDefined(response.data.country) && response.data.country != null) {
                            vm.idType.issuing_country = { 'id': response.data.country }; //default country
                            vm.getIDTypesList(response.data.country);
                        }
                    } // if-kycIdStatus
                    if (!vm.kycAddrStatus) {
                        if (angular.isDefined(response.data.country) && response.data.country != null) {
                            vm.poaRes.res_country = { 'id': response.data.country }; //default country
                            vm.getStatesByCountryId_Res(vm.poaRes.res_country);
                            // vm.getAddressProofTypes(response.data.country);
                        }
                    }
                }
            }); // service- userDefaultCountry

        }, function(err) {});

        dashboardService.getKYCData({ 'type': 1 }).then(function(response) {
            vm.getKycTabs = response.data;
            for (var i = 0; i < vm.getKycTabs.length; i++) {
                if (vm.getKycTabs[i].id == 2) vm.showIdTab = true;
                if (vm.getKycTabs[i].id == 1) vm.showPersTab = true;
                if (vm.getKycTabs[i].id == 3) vm.showAddrTab = true;
            }
        });

        dashboardService.getUserProfile().then(function(response) {
            if (response.success) {

                vm.pers = response.data;

                var param_data = { path: response.data.document_path };
                vm.photo_uploaded_href = dashboardService.downloadFile(param_data);

                var cie = checkImageExtension(response.data.filename1);

                if (angular.isDefined(cie)) {
                    if (cie.index !== -1) {
                        dashboardService.getImageFile({ path: response.data.document_path }).then(function(response) {
                            vm.profilePhoto = response.data;
                        });
                    } else {
                        if (cie.ext == 'pdf') {
                            vm.profilePhoto = pdfPath;
                        } else if (cie.ext == 'doc' || cie.ext == 'docx') {
                            vm.profilePhoto = docPath;
                        } else vm.profilePhoto = noExtFound;
                    }
                }

                if (vm.pers.date_of_birth != null) {
                    vm.pers.date_of_birth = new Date(vm.pers.date_of_birth);
                }

            }
        }, function(err) {
            toastr.error('Something went wrong. Please try again later.');
            // ngToast.create({
            //     className: 'danger',
            //     content: 'Something went wrong. Please try again later.'
            // });
        });

        dashboardService.getKycAddress().then(function(response) {
            if (response.success) {
                for (var i = 0; i < response.data.length; i++) {
                    if (response.data[i].type == 1) {

                        if (response.data[i].f_b_type == 1) {
                            // vm.poaP = response.data[i];

                            var param_data = { path: response.data[i].document_path };
                            vm.permanent_uploaded_href = dashboardService.downloadFile(param_data);

                            var cie = checkImageExtension(response.data[i].filename1);
                            if (angular.isDefined(cie)) {
                                if (cie.index !== -1) {
                                    dashboardService.getImageFile({ path: response.data[i].document_path }).then(function(response) {
                                        vm.permanentUploaded = response.data;
                                    });
                                } else {
                                    if (cie.ext == 'pdf') {
                                        vm.permanentUploaded = pdfPath;
                                    } else if (cie.ext == 'doc' || cie.ext == 'docx') {
                                        vm.permanentUploaded = docPath;
                                    } else vm.permanentUploaded = noExtFound;
                                }
                            }

                            if (response.data[i].country !== "" && response.data[i].country !== null) {
                                vm.poaP.country = { 'id': response.data[i].country };

                                vm.getStatesByCountryId_Per(vm.poaP.country);

                                if (response.data[i].state !== "" && response.data[i].state !== null) {
                                    vm.poaP.state = { 'id': response.data[i].state };
                                    vm.getCitiesByStateId_Per(vm.poaP.state);
                                }

                                if (response.data[i].city !== "" && response.data[i].city !== null) vm.poaP.city = { 'id': response.data[i].city };
                            }

                            if (response.data[i].pin_code == 'undefined' || response.data[i].pin_code == 'null') vm.poaP.pin_code = undefined;
                            else vm.poaP.pin_code = response.data[i].pin_code;

                            if (response.data[i].address == 'undefined' || response.data[i].address == 'null') vm.poaP.address = undefined;
                            else vm.poaP.address = response.data[i].address;

                            if (response.data[i].doc_name) vm.poaP.doc_name = { 'id': response.data[i].doc_name };
                        }

                        if (response.data[i].f_b_type == 2) {
                            var param_data = { path: response.data[i].document_path };
                            vm.permanentBack_uploaded_href = dashboardService.downloadFile(param_data);

                            var cie = checkImageExtension(response.data[i].filename1);
                            if (angular.isDefined(cie)) {
                                if (cie.index !== -1) {
                                    dashboardService.getImageFile({ path: response.data[i].document_path }).then(function(response) {
                                        vm.permanentBackUploaded = response.data;
                                    })
                                } else {
                                    if (cie.ext == 'pdf') {
                                        vm.permanentBackUploaded = pdfPath;
                                    } else if (cie.ext == 'doc' || cie.ext == 'docx') {
                                        vm.permanentBackUploaded = docPath;
                                    } else vm.permanentBackUploaded = noExtFound;
                                }
                            }
                        }

                    } else if (response.data[i].type == 2) {
                        if (response.data[i].f_b_type == 1) {

                            var param_data = { path: response.data[i].document_path };
                            vm.residential_uploaded_href = dashboardService.downloadFile(param_data);

                            var cie = checkImageExtension(response.data[i].filename1);
                            if (angular.isDefined(cie)) {
                                if (cie.index !== -1) {
                                    dashboardService.getImageFile({ path: response.data[i].document_path }).then(function(response) {
                                        vm.residentialUploaded = response.data;
                                    });
                                } else {
                                    if (cie.ext == 'pdf') {
                                        vm.residentialUploaded = pdfPath;
                                    } else if (cie.ext == 'doc' || cie.ext == 'docx') {
                                        vm.residentialUploaded = docPath;
                                    } else vm.residentialUploaded = noExtFound;
                                }
                            }

                            // if (response.data[i].document_path) {
                            //     dashboardService.getImageFile({ 'path': response.data[i].document_path }).then(function(response) {
                            //         vm.residentialUploaded = response;
                            //     }, function(err) {});
                            // }

                            if (angular.isDefined(response.data[i].country)) {
                                vm.poaRes.res_country = { 'id': response.data[i].country };
                                vm.getStatesByCountryId_Res(vm.poaRes.res_country);
                                vm.poaRes.res_state = { 'id': response.data[i].state };

                                vm.getCitiesByStateId_Res(vm.poaRes.res_state);
                                vm.poaRes.res_city = { 'id': response.data[i].city };
                            }

                            vm.poaRes.res_address = response.data[i].address;
                            vm.poaRes.res_pin_code = response.data[i].pin_code;
                            //   vm.poaRes.doc_name = response.data[i].doc_name;
                            if (response.data[i].doc_name) {
                                vm.poaRes.doc_name = { 'id': response.data[i].doc_name };
                                var country = { 'id': response.data[i].country };
                                vm.getAddressProofTypes(country);
                            }
                        }

                        if (response.data[i].f_b_type == 2) {
                            var param_data = { path: response.data[i].document_path };
                            vm.residentialBack_uploaded_href = dashboardService.downloadFile(param_data);

                            var cie = checkImageExtension(response.data[i].filename1);
                            if (angular.isDefined(cie)) {
                                if (cie.index !== -1) {
                                    dashboardService.getImageFile({ path: response.data[i].document_path }).then(function(response) {
                                        vm.residentialBackUploaded = response.data;
                                    });
                                } else {
                                    if (cie.ext == 'pdf') {
                                        vm.residentialBackUploaded = pdfPath;
                                    } else if (cie.ext == 'doc' || cie.ext == 'docx') {
                                        vm.residentialBackUploaded = docPath;
                                    } else vm.residentialBackUploaded = noExtFound;
                                }
                            }

                        }
                    } // if type == 2
                }
            }
        }, function(err) {
            toastr.error('Something went wrong. Please try again later.');
            // ngToast.create({
            //     className: 'danger',
            //     content: 'Something went wrong. Please try again later.'
            // });
        });

        /*vm.changeIdType = function(data){
            angular.element('#docName').triggerHandler('change');
        }*/

        vm.changeIdType = function(data) {
            var dataId = vm.idType.doc_name.id;
            var dataName = $.grep(vm.getIDType, function(data) {
                return data.id == dataId;
            })[0].name;
            vm.idType.doc_name.name = dataName;
        }

        //////for download image
        vm.downloadDoc = function(url){
            downloadForm.path.value = url;
            downloadForm.submit();
          }
        /////
        dashboardService.getKycIdInfo().then(function(response) {
            if (response.success) {
                vm.idType = response.data[0];

                vm.idType.issue_date = new Date(vm.idType.issue_date); //resetting date string to date object
                if (vm.idType.expiration_date) vm.idType.expiration_date = new Date(vm.idType.expiration_date);
                for (var i = 0; i < response.data.length; i++) {
                    if (response.data[i].doc_type == 1) {

                        if (response.data[i].f_b_type == 1) { // country is available only in fb type 1
                            vm.idType.issuing_country = { 'id': response.data[i].issuing_country };
                            vm.idType.doc_name = { 'id': response.data[i].doc_name };

                            dashboardService.getKYCData({ 'type': 2, 'country_id': response.data[i].issuing_country.id }).then(function(response) {
                                if (response.success) {
                                    if (response.data.length != 0) {
                                        response.data.sort(sortItems);
                                        vm.getIDType = response.data;
                                    } else {
                                        vm.getIDType = ID_TYPE;
                                    }
                                } else {
                                    vm.getIDType = ID_TYPE;
                                }
                                vm.changeIdType(vm.idType.doc_name);
                            });

                            if (response.data[i].document_path) {

                                var param_data = { path: response.data[i].document_path };
                                vm.idProofFront_uploaded_href = dashboardService.downloadFile(param_data);

                                var cie = checkImageExtension(response.data[i].filename1);
                                if (cie.index !== -1) {
                                    dashboardService.getImageFile({ path: response.data[i].document_path }).then(function(response) {
                                        vm.idProofUploaded = response.data;
                                    });
                                } else {
                                    if (cie.ext == 'pdf') {
                                        vm.idProofUploaded = pdfPath;
                                    } else if (cie.ext == 'doc' || cie.ext == 'docx') {
                                        vm.idProofUploaded = docPath;
                                    } else vm.idProofUploaded = noExtFound;
                                }
                            }
                        } // if fbtype 1

                        if (response.data[i].document_path && response.data[i].f_b_type == 2) {
                            var param_data = { path: response.data[i].document_path };
                            vm.idProofBack_uploaded_href = dashboardService.downloadFile(param_data);

                            var cie = checkImageExtension(response.data[i].filename1);
                            if (cie.index !== -1) {
                                dashboardService.getImageFile({ path: response.data[i].document_path }).then(function(response) {
                                    vm.idProofBackUploaded = response.data;
                                });
                            } else {
                                if (cie.ext == 'pdf') {
                                    vm.idProofBackUploaded = pdfPath;
                                } else if (cie.ext == 'doc' || cie.ext == 'docx') {
                                    vm.idProofBackUploaded = docPath;
                                } else vm.idProofBackUploaded = noExtFound;
                            }
                        }
                    } else if (response.data[i].doc_type == 4) {
                        if (response.data[i].document_path) {
                            var param_data = { path: response.data[i].document_path };
                            vm.selfie_uploaded_href = dashboardService.downloadFile(param_data);

                            var cie = checkImageExtension(response.data[i].filename1);
                            if (cie.index !== -1) {
                                dashboardService.getImageFile({ path: response.data[i].document_path }).then(function(response) {
                                    vm.selfieUploaded = response.data;
                                });
                            } else {
                                if (cie.ext == 'pdf') {
                                    vm.selfieUploaded = pdfPath;
                                } else if (cie.ext == 'doc' || cie.ext == 'docx') {
                                    vm.selfieUploaded = docPath;
                                } else vm.selfieUploaded = noExtFound;
                            }
                        }
                    }
                }
            }
        }, function(err) {
            toastr.error('Something went wrong. Please try again later.');
            // ngToast.create({
            //     className: 'danger',
            //     content: 'Something went wrong. Please try again later.'
            // });
        });
        // }

        vm.sameAsRes = function() {
            
            if (vm.check) {
                if (angular.isDefined(vm.poaRes.res_country)) {
                    vm.poaP.country = angular.copy(vm.poaRes.res_country);
                    vm.getStatesByCountryId_Per(vm.poaRes.res_country);

                    vm.poaP.state = angular.copy(vm.poaRes.res_state);

                    vm.getCitiesByStateId_Per(vm.poaRes.res_state);
                    vm.poaP.city = angular.copy(vm.poaRes.res_city);
                }

                vm.poaP.address = angular.copy(vm.poaRes.res_address);
                vm.poaP.pin_code = angular.copy(vm.poaRes.res_pin_code);
                vm.poaP.doc_name = angular.copy(vm.poaRes.doc_name);

            } else if (!vm.check) {
                vm.poaP.country = undefined;
                vm.poaP.state = undefined;
                vm.poaP.city = undefined;
                vm.poaP.address = undefined;
                vm.poaP.pin_code = undefined;
                vm.poaP.doc_name = undefined;
            }
        }
        //save user data - kyc verification

        vm.saveData = function(form, data, file_front, doc_type, selfie, file_back) { // ID INFO
            if (form.$valid) {

                var myIdData = angular.copy(data); // to prevent date from nullifying on form submit
                /*     myIdData.issue_date = moment(new Date(myIdData.issue_date).getTime()).format("YYYY-MM-DD");

                     if (myIdData.expiration_date) myIdData.expiration_date = moment(new Date(myIdData.expiration_date).getTime()).format("YYYY-MM-DD");
                     // else delete myIdData.expiration_date;
                     myIdData.issuing_country = myIdData.issuing_country.id;
                     myIdData.doc_name = myIdData.doc_name.id;*/

                //sending only required 6 parameters
                myIdData = {
                    'doc_type': doc_type,
                    'doc_name': myIdData.doc_name.id,
                    'doc_reference': myIdData.doc_reference,
                    'issue_date': moment(new Date(myIdData.issue_date).getTime()).format("YYYY-MM-DD"),
                    'issuing_country': myIdData.issuing_country.id,
                    'expiration_date': myIdData.expiration_date ? moment(new Date(myIdData.expiration_date).getTime()).format("YYYY-MM-DD") : undefined

                }

                dashboardService.kycData(myIdData).then(function(response) {
                    if (response.success) {
                        if (file_front || selfie || file_back) {
                            if (file_front) {
                                dashboardService.upload(file_front, doc_type, '1').then(function(response) {

                                    if (response.data.success) {
                                        toastr.success('Data saved successfully.');
                                        // ngToast.create({
                                        //     className: 'success',
                                        //     content: 'Data saved successfully.'
                                        // });
                                        $(".tab-head-item[data-tab='.kycAddress']").trigger("click");
                                    } else {
                                        toastr.error(response.data.message);
                                        // ngToast.create({
                                        //     className: 'danger',
                                        //     content: response.data.message
                                        // });
                                    }
                                }, function(err) {
                                    toastr.error('Something went wrong. Please try again later.');
                                    // ngToast.create({
                                    //     className: 'danger',
                                    //     content: 'Something went wrong. Please try again later.'
                                    // });
                                });
                            }
                            if (file_back) {
                                dashboardService.upload(file_back, doc_type, '2').then(function(response) {

                                    if (response.data.success) {
                                        toastr.success('Data saved successfully.');
                                        // ngToast.create({
                                        //     className: 'success',
                                        //     content: 'Data saved successfully.'
                                        // });
                                        $(".tab-head-item[data-tab='.kycAddress']").trigger("click");
                                    } else {
                                        toastr.error(response.data.message);
                                        // ngToast.create({
                                        //     className: 'danger',
                                        //     content: response.data.message
                                        // });
                                    }
                                }, function(err) {
                                    toastr.error( 'Something went wrong. Please try again later.');
                                    // ngToast.create({
                                    //     className: 'danger',
                                    //     content: 'Something went wrong. Please try again later.'
                                    // });
                                });
                            }
                            if (selfie) {
                                dashboardService.upload(selfie, '4', '1').then(function(response) {
                                    if (response.data.success) {
                                        toastr.success('Data saved successfully.');
                                        // ngToast.create({
                                        //     className: 'success',
                                    //     content: 'Data saved successfully.'
                                        // });
                                        $(".tab-head-item[data-tab='.kycAddress']").trigger("click");
                                    } else {
                                        toastr.error(response.data.message);
                                        // ngToast.create({
                                        //     className: 'danger',
                                        //     content: response.data.message
                                        // });
                                    }
                                }, function(err) {
                                    toastr.error('Something went wrong. Please try again later.');

                                    // ngToast.create({
                                    //     className: 'danger',
                                    //     content: 'Something went wrong. Please try again later.'
                                    // });
                                });
                            } //if - selfie
                        } else {
                            toastr.success('Data saved successfully.');
                            // ngToast.create({
                            //     className: 'success',
                            //     content: 'Data saved successfully.'
                            // });
                            $(".tab-head-item[data-tab='.kycAddress']").trigger("click");
                        }
                         dashboardService.getKycStatus().then(function(response) {
                            $rootScope.kycStatus = response.completeinfo;
                            $rootScope.kycComment = response.comment;
                        }, function(err) {});
                    } // if-response-success
                    else {
                        toastr.error(response.message);
                        // ngToast.create({
                        //     className: 'danger',
                        //     content: response.message
                        // });
                    }

                }, function(err) {
                    toastr.error( 'Something went wrong. Please try again later.');
                    // ngToast.create({
                    //     className: 'danger',
                    //     content: 'Something went wrong. Please try again later.'
                    // });
                });
            }

        }
        vm.sendBack =function(){
            $(".tab-head-item[data-tab='.kycIdentification']").trigger("click");
        }
        vm.sendPrevious = function(){
            $(".tab-head-item[data-tab='.kycPersonal']").trigger("click");
        }

        vm.savePersonalInfo = function(form, data, file, doc_type) {
            if (form.$valid) {

                data.doc_type = '3';

                var myPersonalData = angular.copy(data); // for date - to prevent date from nullifying on form submit
                // myPersonalData.date_of_birth = moment(new Date(myPersonalData.date_of_birth).getTime()).format("YYYY-MM-DD");

                // sending only required six parameters.
                myPersonalData = {
                    'birth_place':myPersonalData.birth_place,
                    'date_of_birth':moment(new Date(myPersonalData.date_of_birth).getTime()).format("YYYY-MM-DD"),
                    'doc_type':myPersonalData.doc_type,
                    'fullname':myPersonalData.fullname,
                    'gender':myPersonalData.gender,
                    'mobileNumber':myPersonalData.mobileNumber
                }

                dashboardService.kycData(myPersonalData).then(function(response) {
                    if (response.success) {
                        if (file) {

                            dashboardService.upload(file, doc_type, '1').then(function(response) { // doc_side for photo - 1
                                if (response.data.success) {
                                    toastr.success('Data saved successfully.');
                                    // ngToast.create({
                                    //     className: 'success',
                                    //     content: 'Data saved successfully.'
                                    // });
                                    dashboardService.userProfile().then(function(response) {
                                        $rootScope.userName = response.data.fullname;
                                    });
                                    $(".tab-head-item[data-tab='.kycIdentification']").trigger("click");
                                } else {
                                    toastr.error(response.data.message);
                                    // ngToast.create({
                                    //     className: 'danger',
                                    //     content: response.data.message
                                    // });
                                }
                            }, function(err) {
                                toastr.error('Something went wrong. Please try again later.');
                                // ngToast.create({
                                //     className: 'danger',
                                //     content: 'Something went wrong. Please try again later.'
                                // });
                            });
                        } //if-file
                        else {
                            toastr.success('Data saved successfully.');
                            // ngToast.create({
                            //     className: 'success',
                            //     content: 'Data saved successfully.'
                            // });
                            $(".tab-head-item[data-tab='.kycIdentification']").trigger("click");
                        }
                         dashboardService.getKycStatus().then(function(response) {
                            $rootScope.kycStatus = response.completeinfo;
                            $rootScope.kycComment = response.comment;
                        }, function(err) {});
                    } else {
                        toastr.error(response.message);
                        // ngToast.create({
                        //     className: 'danger',
                        //     content: response.message
                        // });
                    }

                }, function(err) {
                    toastr.error('Something went wrong. Please try again later.');
                    // ngToast.create({
                    //     className: 'danger',
                    //     content: 'Something went wrong. Please try again later.'
                    // });
                });
            } // form - valid

        }

        vm.saveAddressInfo = function(form, perData, file, fileBack, doc_type, resData, resFile, resFileBack, res_doc_type, ) {
           
            // alert(sameAsAddress);
            if (form.$valid) {
                // var check =sameAsAddress;
                var data = angular.copy(resData);
                var promises = [];

                data.res_country = data.res_country.id;
                data.res_state = data.res_state.id;
                data.res_city = data.res_city.id;
                data.doc_name = data.doc_name.id;
                var promise1 = dashboardService.kycData(data).then(function(response) {
                    if (response.success) {

                         dashboardService.getKycStatus().then(function(response) {
                            $rootScope.kycStatus = response.completeinfo;
                            $rootScope.kycComment = response.comment;
                        }, function(err) {});
                        toastr.success('Data saved successfully.');
                        //  ngToast.create({
                        //     className: 'success',
                        //     content: 'Data saved successfully.'
                        // });

                    } else {
                        toastr.error(response.message);
                        // ngToast.create({
                        //     className: 'danger',
                        //     content: response.message
                        // });
                    }

                }, function(err) {
                    toastr.error('Something went wrong. Please try again later.');
                    // ngToast.create({
                    //     className: 'danger',
                    //     content: 'Something went wrong. Please try again later.'
                    // });
                });

                promises.push(promise1)

                if (resFile) {
                    var promise2 = dashboardService.upload(resFile, res_doc_type, '1').then(function(response) {
                        if (response.data.success) {
                            toastr.success('Data saved successfully.');
                            // ngToast.create({
                            //     className: 'success',
                            //     content: 'Data saved successfully.'
                            // });
                        } else {
                            toastr.error(response.data.message);
                            // ngToast.create({
                            //     className: 'danger',
                            //     content: response.data.message
                            // });
                        }
                    }, function(err) {
                        toastr.error('Something went wrong. Please try again later.');
                        // ngToast.create({
                        //     className: 'danger',
                        //     content: 'Something went wrong. Please try again later.'
                        // });
                    });
                    promises.push(promise2)
                }

                if (resFileBack) {
                    var promise3 = dashboardService.upload(resFileBack, res_doc_type, '2').then(function(response) {
                        if (response.data.success) {
                            toastr.success( 'Data saved successfully.');
                            // ngToast.create({
                            //     className: 'success',
                            //     content: 'Data saved successfully.'
                            // });
                        } else {
                            toastr.error(response.data.message);
                            // ngToast.create({
                            //     className: 'danger',
                            //     content: response.data.message
                            // });
                        }
                    }, function(err) {
                        toastr.error('Something went wrong. Please try again later.');
                        // ngToast.create({
                        //     className: 'danger',
                        //     content: 'Something went wrong. Please try again later.'
                        // });
                    });
                    promises.push(promise3)
                }

                var permanentData = angular.copy(perData);

                permanentData.country = permanentData.country ? permanentData.country.id : '';
                permanentData.state = permanentData.state ? permanentData.state.id : '';
                permanentData.city = permanentData.city ? permanentData.city.id : '';
                permanentData.doc_name = permanentData.doc_name ? permanentData.doc_name.id : '';
                permanentData.address = permanentData.address ? permanentData.address : '';
                permanentData.pin_code = permanentData.pin_code ? permanentData.pin_code : '';


                // if (angular.isUndefined(permanentData.country)) permanentData.country = "";
                // else permanentData.country = permanentData.country.id;
                // if (angular.isUndefined(permanentData.state)) permanentData.state = "";
                // else permanentData.state = permanentData.state.id;
                // if (angular.isUndefined(permanentData.city)) permanentData.city = "";
                // else permanentData.city = permanentData.city.id;

                // if (angular.isUndefined(permanentData.doc_name)) permanentData.doc_name = "";
                // else permanentData.doc_name = permanentData.doc_name.id;

                var promise4 = dashboardService.kycData(permanentData).then(function(response) {
                    if (response.success) {
                    } else {
                        toastr.error(response.message);
                        /*  ngToast.create({
                              className: 'danger',
                              content: response.message
                          });*/
                    }

                }, function(err) {
                    toastr.error('Something went wrong. Please try again later.');
                    // ngToast.create({
                    //     className: 'danger',
                    //     content: 'Something went wrong. Please try again later.'
                    // });
                });

                promises.push(promise4)

                if (file) {
                    var promise5 = dashboardService.upload(file, doc_type, '1').then(function(response) {
                        if (response.data.success) {
                            toastr.success('Data saved successfully.');
                            // ngToast.create({
                            //     className: 'success',
                            //     content: 'Data saved successfully.'
                            // });
                        } else {
                            toastr.error(response.data.message);
                            // ngToast.create({
                            //     className: 'danger',
                            //     content: response.data.message
                            // });
                        }
                    }, function(err) {
                        toastr.error('Something went wrong. Please try again later.');
                        // ngToast.create({
                        //     className: 'danger',
                        //     content: 'Something went wrong. Please try again later.'
                        // });
                    });
                    promises.push(promise5)
                }

                if (fileBack) {
                    var promise6 = dashboardService.upload(fileBack, doc_type, '2').then(function(response) {
                        if (response.data.success) {
                            toastr.success('Data saved successfully.');
                            // ngToast.create({
                            //     className: 'success',
                            //     content: 'Data saved successfully.'
                            // });
                        } else {
                            toastr.error(response.data.message);
                            // ngToast.create({
                            //     className: 'danger',
                            //     content: response.data.message
                            // });
                        }
                    }, function(err) {
                        toastr.error('Something went wrong. Please try again later.');
                        // ngToast.create({
                        //     className: 'danger',
                        //     content: 'Something went wrong. Please try again later.'
                        // });
                    });
                    promises.push(promise6)
                }
                Promise.all(promises).then(function(){
                  $state.go('dashboard.userProfile');
                })
            } // form - valid
        }
    }
]);
