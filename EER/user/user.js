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
        },
        checkCurrentPassword: function(userObj) {
            return $http.post('http://localhost:1337/user/checkUserPass', userObj)
        },

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
	$scope.employees = "";
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
    $scope.updatePassword = false;
    $scope.currentPasswordMatched = false;

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

    //This will fetch all the available employees who are not having the users
    EmployeeDetails.getUnassignedEmployees()
        .success(function(data) {
            $scope.employees = data;            
        }).error(function(err) {
            $scope.message = "";
            $scope.isMsg = false;
            $scope.errMessage = err.message;
            $scope.isErr = true;
    });

    //This will fetch the employee data
    if($location.search().employee){
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
        UserDetails.getUser($routeParams.id)
            .success(function(userData) {
                $scope.selectedUser = userData;
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
                $scope.isUserExist = true;
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
                $scope.isUserExist = false;
            });
           
    }

/*    $scope.toggleUpdatePassword = function(){
       //$scope.updatePassword = !$scope.updatePassword;
       //alert($scope.updatePassword);
    }*/

    $scope.validateUserExist = function(userName){
        if ($scope.allUsers.indexOf($filter('toLowerCase')(userName)) > -1) {
	        $scope.isUserExist = true;
	    } else {
	        $scope.isUserExist = false;
	    }
    },

    $scope.checkCurrentPassword = function(){
        
        if($scope.hasOwnProperty("passwordForm") && $scope.passwordForm.hasOwnProperty("current_password")){
            //var decrypted = CryptoJS.AES.decrypt($scope.selectedUser.password, $scope.selectedUser.password_key);
            //var data = CryptoJS.enc.Utf8.stringify(decrypted);
            //console.log("called..........");
            console.log($scope.passwordForm.current_password)
            var userObj = {
                user_name: $scope.selectedUser.user_name,
                password: $scope.passwordForm.current_password
            }
            //console.log(userObj)
            UserDetails.checkCurrentPassword(userObj)
            .success(function(data) {
                //console.log(data);
                 if(data.message == "Logged In Successfully"){
                    $scope.currentPasswordMatched = true;
                }else{
                    $scope.currentPasswordMatched = false;
                }
            }).error(function(err) {
                //console.log(err);
            });
           
        }
    }

    $scope.editUserDetails = function(userId){
        $scope.userForm.loading = true;
        var passwordField = "",
            passwordKey = "";
        if($scope.hasOwnProperty("passwordForm") && $scope.passwordForm.hasOwnProperty("current_password")){
            var randomText = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 5; i++ )
                randomText += possible.charAt(Math.floor(Math.random() * possible.length));

            var encryptedPassword = CryptoJS.AES.encrypt($scope.passwordForm.password, randomText);
            passwordField = encryptedPassword.toString();
            passwordKey = randomText.toString();
        }else{
            passwordField = $scope.selectedUser.password;
            passwordKey = $scope.selectedUser.password_key;

        }
        var formData = {
            user_name: $scope.selectedUser.user_name,
            password: passwordField,
            password_key: passwordKey
        };
        UserDetails.updateUser(userId, formData)
            .success(function(data) {
                $scope.isMsg = true;
                $scope.message = $filter('capitalize')($scope.selectedUser.user_name) + " successfully updated";
                $scope.userForm.loading = false;                
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
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
            });
    }

    $scope.createNewUser = function(){
        /*var randomText = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 5; i++ )
            randomText += possible.charAt(Math.floor(Math.random() * possible.length));
        var encryptedPassword = CryptoJS.AES.encrypt($scope.createUserForm.password, randomText);*/


    	$scope.userForm.loading = true;
        var employeeData = "";
        //console.log($scope.createUserForm);
        if($scope.createUserForm.hasOwnProperty("employee")){
            employeeData = $scope.createUserForm.employee
        }else{
            employeeData = $scope.selectedEmployee.id
        }
        //console.log(employeeData);
    	var formData = {
    		user_name: $scope.createUserForm.user_name,
    		password: $scope.createUserForm.password,
    		employee: employeeData
    	};
    	UserDetails.createNewUser(formData)
            .success(function(data) {
                $scope.isMsg = true;
                $scope.message = $filter('capitalize')(formData.user_name) + " user successfully created";
                $scope.createUserForm = "";
                $scope.errMessage = "";
                $scope.isErr = false;
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
            });
    },

    $scope.deleteUser = function(userId, name) {
        UserDetails.deleteUser(userId)
            .success(function(data) {
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
                $scope.isMsg = true;
                $scope.message = name + " user successfully deleted";
            }).error(function(data) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
            });

    }

    
}]);