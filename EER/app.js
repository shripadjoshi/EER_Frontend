'use strict';

// Declare app level module which depends on views, and components
angular.module('EERApp', [
    'ngRoute',
    'datatables',
    'EERApp.home',
    'EERApp.company',
    'EERApp.department'
])

.filter('capitalize', function() {

    // In the return function, we must pass in a single parameter which will be the data we will work on.
    // We have the ability to support multiple other parameters that can be passed into the filter optionally
    return function(input, optional1, optional2) {
        //return JSON.stringify(JSON.parse(input), null, 2);
        var firstChar = input.charAt(0).toUpperCase();
        return (input.replace(input.charAt(0), firstChar))
    }

})

.filter('toLowerCase', function(){
    return function(input, optional1, optional2) {
        return ((angular.lowercase(input)))
    }
})

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'home/home.html',
            controller: 'HomeController'
        });
}]);
