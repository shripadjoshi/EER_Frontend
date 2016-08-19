'use strict';

// Declare app level module which depends on views, and components
angular.module('EERApp', [
  'ngRoute',
  'EERApp.view1',
  'EERApp.view2'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
