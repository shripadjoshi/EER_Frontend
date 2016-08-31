'use strict';

angular.module('EERApp.company', ['ngRoute'])

.factory('CompanyDetails', ['$http', function($http) {
    return {
        get: function() {
            return $http.get('http://localhost:1337/company');
        },
        /*getBrowser: function(browserId) {
            return $http.get('http://localhost:1337/browser/' + browserId);
        },
        updateBrowser: function(browserId, name) {
            return $http.put('http://localhost:1337/browser/' + browserId, { name: name })
        },
        deleteBrowser: function(browserId) {
            return $http.delete('http://localhost:1337/browser/' + browserId)
        },
        createNewBrowser: function(name) {
            return $http.post('http://localhost:1337/browser', { name: name })
        }*/
    }
}])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/companies', {
    templateUrl: 'company/companies.html',
    controller: 'CompanyController'
  });
}])

.controller('CompanyController', ['$rootScope', '$scope', '$routeParams', 'CompanyDetails', '$filter',
	function($rootScope, $scope, $routeParams, CompanyDetails, $filter) {
	$rootScope.activeTab = "Company";
	$scope.companies = "";
    $scope.message = "";
    $scope.errMessage = "";
    $scope.isMsg = false;
    $scope.isErr = false;

    //This will fetch all the available browsers
    CompanyDetails.get()
        .success(function(data) {
            $scope.companies = data;
            /*var allCount = [];
            angular.forEach($scope.browsers, function(obj) {
                allCount.push(obj.name);
            });
            $scope.allBrowsers = allCount;*/
        }).error(function(err) {
            $scope.message = "";
            $scope.isMsg = false;
            $scope.errMessage = err.message;
            $scope.isErr = true;
        });
}]);