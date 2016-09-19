'use strict';

angular.module('EERApp.user', ['ngRoute','ngPassword'])

.factory('UserDetails', ['$http', function($http) {
    return {
        get: function() {
            return $http.get('http://localhost:1337/user');
        },
        getUser: function(userId) {
            return $http.get('http://localhost:1337/user/' + userId);
        },
        updateUser: function(userId, userObj) {
            return $http.put('http://localhost:1337/user/' + userId, userObj)
        },
        deleteUser: function(userId) {
            return $http.delete('http://localhost:1337/user/' + userId)
        },
        createNewUser: function(userObj) {
            return $http.post('http://localhost:1337/user', userObj)
        }
    }
}])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/users', {
    templateUrl: 'user/users.html',
    controller: 'UserController'
  }).
  when('/user/new/?employee=:id',{
    templateUrl: 'user/new.html',
    controller: 'UserController'
  }).
  when('/user/new',{
  	templateUrl: 'user/new.html',
    controller: 'UserController'
  }).when('/user/edit/:id', {
        templateUrl: 'user/edit.html',
        controller: 'UserController'
   });
}])

.controller('UserController', ['$rootScope', '$scope', '$routeParams','$location', 'UserDetails', 'EmployeeDetails', '$filter',
	function($rootScope, $scope, $routeParams, $location, UserDetails, EmployeeDetails, $filter) {
	//This rootScope variable will set the active tab in the menu item
	$rootScope.activeTab = "User";
    $rootScope.activeTabMaster = "Master";

	$scope.users = "";
    $scope.message = "";
    $scope.errMessage = "";
    $scope.isMsg = false;
    $scope.isErr = false;
    $scope.isUserExist = false;
    $scope.userForm = {
        loading: false
    };
    $scope.allUsers = "";
    $scope.selectedUser = "";
    $scope.selectedEmployee = "";

    //This will fetch all the available users
    UserDetails.get()
        .success(function(data) {
            $scope.users = data;
            var allUsersData = [];
            angular.forEach($scope.users, function(obj) {
                allUsersData.push($filter('toLowerCase')(obj.user_name));
            });
            $scope.allUsers = allUsersData;
        }).error(function(err) {
            $scope.message = "";
            $scope.isMsg = false;
            $scope.errMessage = err.message;
            $scope.isErr = true;
    });

    //This will fetch the employee data
    if($location.search().employee){
        console.log($location.search().employee);
         EmployeeDetails.getEmployee($location.search().employee)
            .success(function(employeeData) {
                $scope.selectedEmployee = employeeData;
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
            });
    }
    //This method will be used to fill up the edit form
    if ($routeParams.id != undefined) {
        console.log($routeParams)
        UserDetails.getUser($routeParams.id)
            .success(function(userData) {
                $scope.selectedUser = userData;
                //$scope.isValidWebsite = true;
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
                //$scope.isValidWebsite = false;
            });
           
    }

    $scope.validateUserExist = function(userName){
		if ($scope.allUsers.indexOf($filter('toLowerCase')(userName)) > -1) {
	        $scope.isUserExist = true;
	    } else {
	        $scope.isUserExist = false;
	    }
    },


    $scope.createNewUser = function(){
        console.log($scope.createUserForm)
        console.log($scope.selectedEmployee.id)
        var decrypted = CryptoJS.AES.decrypt($scope.createUserForm.password, "pass");
        var data = CryptoJS.enc.Utf8.stringify(decrypted);
        //console.log(decrypted);  // output : myMessage
        console.log(data);  // output : myMessage
    	/*$scope.companyForm.loading = true;
    	console.log($scope.createCompanyForm)
    	var formData = {
    		name: $scope.createCompanyForm.name,
    		website: $scope.createCompanyForm.website,
    		address: $scope.createCompanyForm.address,
    		country: $scope.createCompanyForm.country,
    		state: $scope.createCompanyForm.state,
    		city: $scope.createCompanyForm.city,
    		pincode: parseInt($scope.createCompanyForm.pincode),
    		phone_no: parseInt($scope.createCompanyForm.phone_no),
    		mobile_no: parseInt($scope.createCompanyForm.mobile_no),
    		companyType: $scope.createCompanyForm.companyType,
    		industryType: $scope.createCompanyForm.industryType
    	};
    	CompanyDetails.createNewCompany(formData)
            .success(function(data) {
                $scope.isMsg = true;
                $scope.message = $filter('capitalize')(formData.name) + " company successfully created";
                $scope.createCompanyForm = "";
                $scope.errMessage = "";
                $scope.isErr = false;
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
            });*/
    },

    $scope.deleteCompany = function(companyId, name) {
        CompanyDetails.deleteCompany(companyId)
            .success(function(data) {
                CompanyDetails.get()
                    .success(function(data) {
                        $scope.companies = data;
                        $scope.isMsg = true;
                        $scope.message = $filter('capitalize')(name) + " company successfully deleted";
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

    $scope.editCompanyDetails = function(companyId){
        $scope.companyForm.loading = true;
        CompanyDetails.updateCompany(companyId, $scope.selectedCompany)
            .success(function(data) {
                $scope.isMsg = true;
                $scope.message = $filter('capitalize')($scope.selectedCompany.name) + " company successfully updated";
                $scope.companyForm.loading = false;                
                CompanyDetails.get()
                    .success(function(data) {
			            $scope.companies = data;
			            var allComps = [];
			            var allWebs = [];
			            angular.forEach($scope.companies, function(obj) {
			                allComps.push(obj.name);
			                allWebs.push(obj.website);
			            });
			            $scope.allCompanies = allComps;
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