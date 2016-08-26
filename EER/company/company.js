'use strict';

angular.module('EERApp.company', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/companies', {
    templateUrl: 'company/companies.html',
    controller: 'CompanyController'
  });
}])

.controller('CompanyController', ['$rootScope', '$scope', '$routeParams',function($rootScope, $scope, $routeParams) {
	$rootScope.activeTab = "Company";
}]);