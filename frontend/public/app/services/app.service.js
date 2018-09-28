app.service('apiService', ['$http', '$q', 'appSettings', '$cookies', function ($http, $q, appSettings, $cookies) {

        var apiService = {};
        var apiBase = appSettings.apiBase;

        //===========================GET RESOURCE==============================
        var get = function (module, header) {
            var deferred = $q.defer();
            $http.get(apiBase + module, {headers: {'Content-Type': 'application/json', 'token': header}}).success(function (response) {
                deferred.resolve(response);
            }).catch(function (data, status, headers, config) {
                deferred.reject(data.statusText);
            });

            return deferred.promise;
        };

        var getQ = function (module, parameter, header) {
            var qs = '';
            angular.forEach(parameter, function (value, key) {
                qs += key + '=' + value + '&';
            });
            var deferred = $q.defer();
            $http.get(apiBase + module + '?' + qs, {headers: {'Content-Type': 'application/xml', 'token': header}}).success(function (response) {
                deferred.resolve(response);
            }).catch(function (data, status, headers, config) {
                deferred.reject(data.statusText);
            });

            return deferred.promise;
        };

        //===========================CREATE RESOURCE==============================
        var create = function (module, parameter, header) {

            var deferred = $q.defer();

            $http.post(apiBase + module, parameter, {headers: {'Content-Type': 'application/json', 'token': header}}).success(function (response) {

                deferred.resolve(response);

            }).catch(function (data, status, headers, config) {
                deferred.reject(data.statusText);
            });

            return deferred.promise;
        };



        //===========================UPDATE RESOURCE==============================
        var update = function (module, parameter, header) {

            var deferred = $q.defer();

            $http.post(apiBase + module + '/' + parameter.id, parameter, {headers: {'Content-Type': 'application/json', 'token': header}}).success(function (response) {

                deferred.resolve(response);

            }).catch(function (data, status, headers, config) {
                deferred.reject(data.statusText);
            });

            return deferred.promise;
        };


        //===========================DELETE RESOURCE==============================
        var delet = function (module, parameter, header) {

            var deferred = $q.defer();

            $http.post(apiBase + module + '/' + parameter.id, parameter, {headers: {'Content-Type': 'application/json', 'token': header}}).success(function (response) {

                deferred.resolve(response);

            }).catch(function (data, status, headers, config) {
                deferred.reject(data.statusText);
            });

            return deferred.promise;
        };

        //===========================EDIT RESOURCE==============================
        var edit = function (module, parameter, header) {
//            alert(header);
            var deferred = $q.defer();
            $http.get(apiBase + module + '/' + parameter.id, {headers: {'Content-Type': 'application/json', 'token': header}}).success(function (response) {
                deferred.resolve(response);
            }).catch(function (data, status, headers, config) {
                deferred.reject(data.statusText);
            });

            return deferred.promise;
        };

        apiService.get = get;
        apiService.getQ = getQ;
        apiService.create = create;
        apiService.edit = edit;
        apiService.update = update;
        apiService.delet = delet;

        return apiService;

    }]);