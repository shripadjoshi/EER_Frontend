'use strict';

angular.module('EERApp.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'home/home.html',
    controller: 'HomeController'
  });
}])

.controller('HomeController', ['$rootScope', '$scope', '$routeParams',function($rootScope, $scope, $routeParams) {
	$rootScope.activeTab = "Home";
}]);