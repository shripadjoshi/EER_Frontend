'use strict';

angular.module('EERApp.employee', ['ngRoute'])

.factory('EmployeeDetails', ['$http', function($http) {
    return {
        get: function() {
            return $http.get('http://localhost:1337/employee');
        },
        getEmployee: function(employeeId) {
            return $http.get('http://localhost:1337/employee/' + employeeId);
        },
        updateEmployee: function(employeeId, employeeObj) {
            return $http.put('http://localhost:1337/employee/' + employeeId, employeeObj)
        },
        deleteEmployee: function(employeeId) {
            return $http.delete('http://localhost:1337/employee/' + employeeId)
        },
        createNewEmployee: function(employeeObj) {
            return $http.post('http://localhost:1337/employee', employeeObj)
        }
    }
}])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/employees', {
    templateUrl: 'employee/employees.html',
    controller: 'EmployeeController'
  }).when('/employee/new',{
  	templateUrl: 'employee/new.html',
    controller: 'EmployeeController'
  }).when('/employee/edit/:id', {
        templateUrl: 'employee/edit.html',
        controller: 'EmployeeController'
   });
}])

.controller('EmployeeController', ['$rootScope', '$scope', '$routeParams', 'EmployeeDetails', '$filter',
	function($rootScope, $scope, $routeParams, EmployeeDetails, $filter) {
	//This rootScope variable will set the active tab in the menu item
	$rootScope.activeTab = "Employee";
    $rootScope.activeTabMaster = "Master";

	$scope.employees = "";
    $scope.message = "";
    $scope.errMessage = "";
    $scope.isMsg = false;
    $scope.isErr = false;
    $scope.salutations = ["Miss", "Mrs.", "Smt.", "Mr."];
    $scope.isEmployeeExist = false;
    $scope.isEmployeeWebsiteExist = false;
    $scope.isValidWebsite = false;
    $scope.employeeForm = {
        loading: false
    };
    $scope.allEmployees = "";
    $scope.allWebsites = "";
    $scope.selectedEmployee = "";
    $scope.urlRegex = new RegExp(
            "^" +
            // protocol identifier
            "(?:(?:https?|ftp)://)" +
            // user:pass authentication
            "(?:\\S+(?::\\S*)?@)?" +
            "(?:" +
            // IP address exclusion
            // private & local networks
            "(?!10(?:\\.\\d{1,3}){3})" +
            "(?!127(?:\\.\\d{1,3}){3})" +
            "(?!169\\.254(?:\\.\\d{1,3}){2})" +
            "(?!192\\.168(?:\\.\\d{1,3}){2})" +
            "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
            // IP address dotted notation octets
            // excludes loopback network 0.0.0.0
            // excludes reserved space >= 224.0.0.0
            // excludes network & broacast addresses
            // (first & last IP address of each class)
            "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
            "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
            "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
            "|" +
            // IPv6 RegEx - http://stackoverflow.com/a/17871737/273668
            "\\[(" +
            "([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|" + // 1:2:3:4:5:6:7:8
            "([0-9a-fA-F]{1,4}:){1,7}:|" + // 1::                              1:2:3:4:5:6:7::
            "([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|" + // 1::8             1:2:3:4:5:6::8  1:2:3:4:5:6::8
            "([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|" + // 1::7:8           1:2:3:4:5::7:8  1:2:3:4:5::8
            "([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|" + // 1::6:7:8         1:2:3:4::6:7:8  1:2:3:4::8
            "([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|" + // 1::5:6:7:8       1:2:3::5:6:7:8  1:2:3::8
            "([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|" + // 1::4:5:6:7:8     1:2::4:5:6:7:8  1:2::8
            "[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|" + // 1::3:4:5:6:7:8   1::3:4:5:6:7:8  1::8  
            ":((:[0-9a-fA-F]{1,4}){1,7}|:)|" + // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8 ::8       ::  
            "fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|" + // fe80::7:8%eth0   fe80::7:8%1     (link-local IPv6 addresses with zone index)
            "::(ffff(:0{1,4}){0,1}:){0,1}" +
            "((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}" +
            "(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|" + // ::255.255.255.255   ::ffff:255.255.255.255  ::ffff:0:255.255.255.255  (IPv4-mapped IPv6 addresses and IPv4-translated addresses)
            "([0-9a-fA-F]{1,4}:){1,4}:" +
            "((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}" +
            "(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])" + // 2001:db8:3:4::192.0.2.33  64:ff9b::192.0.2.33 (IPv4-Embedded IPv6 Address)
            ")\\]" +
            "|" +
            "localhost" +
            "|" +
            // host name
            "(?:xn--[a-z0-9\\-]{1,59}|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?){0,62}[a-z\\u00a1-\\uffff0-9]{1,63}))" +
            // domain name
            "(?:\\.(?:xn--[a-z0-9\\-]{1,59}|(?:[a-z\\u00a1-\\uffff0-9]+-?){0,62}[a-z\\u00a1-\\uffff0-9]{1,63}))*" +
            // TLD identifier
            "(?:\\.(?:xn--[a-z0-9\\-]{1,59}|(?:[a-z\\u00a1-\\uffff]{2,63})))" +
            ")" +
            // port number
            "(?::\\d{2,5})?" +
            // resource path
            "(?:/[^\\s]*)?" +
            "$", "i"
        );


    //This will fetch all the available employees
    EmployeeDetails.get()
        .success(function(data) {
            $scope.employees = data;
            var allComps = [];
            var allWebs = [];
            /*angular.forEach($scope.employees, function(obj) {
                allComps.push($filter('toLowerCase')(obj.name));
                allWebs.push($filter('toLowerCase')(obj.website));
            });
            $scope.allEmployees = allComps;
            $scope.allWebsites = allWebs;*/
        }).error(function(err) {
            $scope.message = "";
            $scope.isMsg = false;
            $scope.errMessage = err.message;
            $scope.isErr = true;
    });

    //This method will be used to fill up the edit form
    if ($routeParams.id != undefined) {
        EmployeeDetails.getEmployee($routeParams.id)
            .success(function(employeeData) {
                $scope.selectedEmployee = employeeData;
                $scope.isValidWebsite = true;
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
                $scope.isValidWebsite = false;
            });
    }

    $scope.validateEmployeeExist = function(employeeName){
		if ($scope.allEmployees.indexOf($filter('toLowerCase')(employeeName)) > -1) {
	        $scope.isEmployeeExist = true;
	    } else {
	        $scope.isEmployeeExist = false;
	    }
    },

    $scope.validateEmployeeWebsiteExist = function(employeeWebsite){
		if ($scope.allWebsites.indexOf($filter('toLowerCase')(employeeWebsite)) > -1) {
	        $scope.isEmployeeWebsiteExist = true;
	    } else {
	        $scope.isEmployeeWebsiteExist = false;
	    }
    },

    $scope.validateEmployeeWebsite = function(employeeWebsite){
		if($scope.urlRegex.test(employeeWebsite)) {
            $scope.isValidWebsite = true;
        } else {
            $scope.isValidWebsite = false;
        }
    },

    $scope.createNewEmployee = function(){
    	$scope.employeeForm.loading = true;
    	console.log($scope.createEmployeeForm)
    	var formData = {
    		name: $scope.createEmployeeForm.name,
    		website: $scope.createEmployeeForm.website,
    		address: $scope.createEmployeeForm.address,
    		country: $scope.createEmployeeForm.country,
    		state: $scope.createEmployeeForm.state,
    		city: $scope.createEmployeeForm.city,
    		pincode: parseInt($scope.createEmployeeForm.pincode),
    		phone_no: parseInt($scope.createEmployeeForm.phone_no),
    		mobile_no: parseInt($scope.createEmployeeForm.mobile_no),
    		EmployeeType: $scope.createEmployeeForm.EmployeeType,
    		industryType: $scope.createEmployeeForm.industryType
    	};
    	EmployeeDetails.createNewEmployee(formData)
            .success(function(data) {
                $scope.isMsg = true;
                $scope.message = $filter('capitalize')(formData.name) + " employee successfully created";
                $scope.createEmployeeForm = "";
                $scope.errMessage = "";
                $scope.isErr = false;
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
            });
    },

    $scope.deleteEmployee = function(employeeId, name) {
        EmployeeDetails.deleteEmployee(employeeId)
            .success(function(data) {
                EmployeeDetails.get()
                    .success(function(data) {
                        $scope.employees = data;
                        $scope.isMsg = true;
                        $scope.message = $filter('capitalize')(name) + " employee successfully deleted";
                    }).error(function(err) {
                        $scope.message = "";
                        $scope.isMsg = false;
                        $scope.errMessage = err.message;
                        $scope.isErr = true;
                    });
            }).error(function(data) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
            });

    },

    $scope.editEmployeeDetails = function(employeeId){
        $scope.employeeForm.loading = true;
        EmployeeDetails.updateEmployee(employeeId, $scope.selectedEmployee)
            .success(function(data) {
                $scope.isMsg = true;
                $scope.message = $filter('capitalize')($scope.selectedEmployee.name) + " employee successfully updated";
                $scope.employeeForm.loading = false;                
                EmployeeDetails.get()
                    .success(function(data) {
			            $scope.employees = data;
			            var allComps = [];
			            var allWebs = [];
			            angular.forEach($scope.employees, function(obj) {
			                allComps.push(obj.name);
			                allWebs.push(obj.website);
			            });
			            $scope.allEmployees = allComps;
			            $scope.allWebsites = allWebs;
			        }).error(function(err) {
			            $scope.message = "";
			            $scope.isMsg = false;
			            $scope.errMessage = err.message;
			            $scope.isErr = true;
                    })
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
            });
    }
}]);