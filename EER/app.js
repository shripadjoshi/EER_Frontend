'use strict';

// Declare app level module which depends on views, and components
angular.module('EERApp', [
    'ngRoute',
    'EERApp.home',
    'EERApp.company'
]).
config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'home/home.html',
            controller: 'HomeController'
        });
}]);
