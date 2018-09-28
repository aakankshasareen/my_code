dashboard.service('faqService', ['$http', '$q', 'apiService', 'appSettings', '$cookies', 'Upload', function($http, $q, apiService, appSettings, $cookies, Upload) {

    var faqService = {};

    //from Admin
    var getAllfaqList = function() {

        var deferred = $q.defer();
        apiService.get("getAllfaqList").then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }


    var getAllfaqCat = function() {

        var deferred = $q.defer();
        apiService.get("getAllfaqCat").then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var getAllfaqByCat = function(parameters) {


        var deferred = $q.defer();
        apiService.create("getAllfaqByCat", parameters).then(function(response) {
                if (response)

                    deferred.resolve(response);
                else

                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };


    var getSupportList = function(parameters) {
        var deferred = $q.defer();
        apiService.create("getSupportList", parameters, sessionStorage.getItem('globals')).then(function(response) {

                if (response) {
                    deferred.resolve(response);
                } else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };


    var uploadSupport = function(file, id) {
        var deferred = $q.defer();
        Upload.upload({
            url: appSettings.apiBase + 'uploadSupport/' + id, //webAPI exposed to upload the file
            data: { photo: file },
            headers: { 'token': sessionStorage.getItem('globals') } //pass file as data, should be user ng-model
        }).then(function(resp) { //upload function returns a promise
            if (resp) {
                deferred.resolve(resp);
            } else {
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            }
        }, function(resp) { //catch error
            deferred.reject(resp);
        });
        return deferred.promise;
    };

    var repplySupport = function(parameters) {

        var deferred = $q.defer();
        apiService.update("repplySupport", parameters, sessionStorage.getItem('globals')).then(function(response) {
                if (response) {
                    deferred.resolve(response);
                } else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    var addSupportComment = function(parameters) {

        var deferred = $q.defer();
        apiService.create("addSupportComment", parameters, sessionStorage.getItem('globals')).then(function(response) {
                if (response) {
                    deferred.resolve(response);
                } else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };



    var addSupportData = function(parameters) {

        var deferred = $q.defer();
        apiService.create("addSupportData", parameters, sessionStorage.getItem('globals')).then(function(response) {
                if (response)

                    deferred.resolve(response);
                else

                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    var addSupportComment = function(parameters) {

        var deferred = $q.defer();
        apiService.create("addSupportComment", parameters, sessionStorage.getItem('globals')).then(function(response) {
                if (response) {
                    deferred.resolve(response);
                } else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    var getUserProfile = function() {
        var deferred = $q.defer();
        apiService.get("getUserProfile", sessionStorage.getItem('globals')).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }


    var updateSupportStatusCu = function(parameters) {
        var deferred = $q.defer();
        apiService.update("updateSupportStatusCu", parameters, sessionStorage.getItem('globals')).then(function(response) {
                if (response) {
                    deferred.resolve(response);
                } else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    var reOpenTicketCu = function(parameters) {
        var deferred = $q.defer();
        apiService.update("reOpenTicketCu", parameters, sessionStorage.getItem('globals')).then(function(response) {
                if (response) {
                    deferred.resolve(response);
                } else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

  var showSupportData = function(parameters) {
        var deferred = $q.defer();
        apiService.create("showSupportData", parameters).then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    // var showContacttData = function(parameters) {
    //     var deferred = $q.defer();
    //     apiService.create("showContacttData", parameters).then(function(response) {
    //             if (response)
    //                 deferred.resolve(response);
    //             else
    //                 deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
    //         },
    //         function(response) {
    //             deferred.reject(response);
    //         });
    //     return deferred.promise;
    // }
  var uploadSupportNoToken = function(file, id, email) {
        var deferred = $q.defer();
        console.log('files are......... ', file)
        length = file.length;
        console.log('length is ', length)
            console.log(file)

        Upload.upload({
            url: appSettings.apiBase + 'uploadSupportUser/' + id + '/' + email + 'length/' + length, //webAPI exposed to upload the file
            data: { photo: file },
       
        }).then(function(resp) { //upload function returns a promise
            if (resp) {
                console.log('resp is ', resp);
                deferred.resolve(resp);
            } else {
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            }
        }, function(resp) { //catch error
            deferred.reject(resp);
        });
/*        Upload.upload({
            url: appSettings.apiBase + 'uploadSupportUser/' + id + '/' + email, //webAPI exposed to upload the file
            data: { photo: file },
       
        }).then(function(resp) { //upload function returns a promise
            if (resp) {
                deferred.resolve(resp);
            } else {
                deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            }
        }, function(resp) { //catch error
            deferred.reject(resp);
        });*/
        return deferred.promise;
    };

    var call_download = function() {

        var deferred = $q.defer();
        apiService.get("call_download").then(function(response) {
                if (response)
                    deferred.resolve(response);
                else
                    deferred.reject("Something went wrong while processing your request. Please Contact Administrator.");
            },
            function(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    }

    faqService.getAllfaqList = getAllfaqList;
    faqService.addSupportData = addSupportData;
    faqService.getAllfaqCat = getAllfaqCat;
    faqService.getAllfaqByCat = getAllfaqByCat;
    faqService.uploadSupport = uploadSupport;
    faqService.getSupportList = getSupportList;
    faqService.repplySupport = repplySupport;
    faqService.addSupportComment = addSupportComment;
    faqService.getUserProfile = getUserProfile;
    faqService.updateSupportStatusCu = updateSupportStatusCu;
    faqService.reOpenTicketCu = reOpenTicketCu;
    faqService.showSupportData = showSupportData;
    // faqService.showContactData = showContactData;
    faqService.uploadSupportNoToken = uploadSupportNoToken;

    faqService.call_download = call_download;

    return faqService;

}]);