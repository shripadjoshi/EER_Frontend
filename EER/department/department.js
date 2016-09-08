'use strict';

angular.module('EERApp.department', ['ngRoute'])

.factory('DepartmentDetails', ['$http', function($http) {
    return {
        get: function() {
            return $http.get('http://localhost:1337/department');
        },
        getDepartment: function(departmentId) {
            return $http.get('http://localhost:1337/department/' + departmentId);
        },
        updateDepartment: function(departmentId, departmentObj) {
            return $http.put('http://localhost:1337/department/' + departmentId, departmentObj)
        },
        deleteDepartment: function(departmentId) {
            return $http.delete('http://localhost:1337/department/' + departmentId)
        },
        createNewDepartment: function(departmentObj) {
            return $http.post('http://localhost:1337/department', departmentObj)
        }
    }
}])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/departments', {
    templateUrl: 'department/departments.html',
    controller: 'DepartmentController'
  }).when('/department/new',{
  	templateUrl: 'department/new.html',
    controller: 'DepartmentController'
  }).when('/department/edit/:id', {
        templateUrl: 'department/edit.html',
        controller: 'DepartmentController'
   });
}])

.controller('DepartmentController', ['$rootScope', '$scope', '$routeParams', 'DepartmentDetails', 'CompanyDetails', '$filter',
	function($rootScope, $scope, $routeParams, DepartmentDetails, CompanyDetails, $filter) {
	//This rootScope variable will set the active tab in the menu item
    $rootScope.activeTab = "Department";
	$rootScope.activeTabMaster = "Master";
    $scope.departments = "";
	$scope.companies = "";
    $scope.message = "";
    $scope.errMessage = "";
    $scope.isMsg = false;
    $scope.isErr = false;
    $scope.isDepartmentExist = false;
    $scope.departmentForm = {
        loading: false
    };
    $scope.allDepartments = "";
    $scope.selectedDepartment = "";
    
    //This will fetch all the available departments
    DepartmentDetails.get()
        .success(function(data) {
            $scope.departments = data;
            var allDepts = [];
            angular.forEach($scope.departments, function(obj) {
                allDepts.push($filter('toLowerCase')(obj.name));
            });
            $scope.allDepartments = allDepts;
        }).error(function(err) {
            $scope.message = "";
            $scope.isMsg = false;
            $scope.errMessage = err.message;
            $scope.isErr = true;
    });

    //This will fetch all the available companies
    CompanyDetails.get()
        .success(function(data) {
            $scope.companies = data;            
        }).error(function(err) {
            $scope.message = "";
            $scope.isMsg = false;
            $scope.errMessage = err.message;
            $scope.isErr = true;
    });



    //This method will be used to fill up the edit form
    if ($routeParams.id != undefined) {
        DepartmentDetails.getDepartment($routeParams.id)
            .success(function(departmentData) {
                $scope.selectedDepartment = departmentData;
                $scope.isDepartmentExist = true;
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
            });
    }

    $scope.validateDepartmentExist = function(departmentName){
		if ($scope.allDepartments.indexOf($filter('toLowerCase')(departmentName)) > -1) {
	        $scope.isDepartmentExist = true;
	    } else {
	        $scope.isDepartmentExist = false;
	    }
    },

    $scope.createNewDepartment = function(){
    	$scope.departmentForm.loading = true;
    	DepartmentDetails.createNewDepartment($scope.createDepartmentForm)
            .success(function(data) {
                $scope.isMsg = true;
                $scope.message = $filter('capitalize')($scope.createDepartmentForm.name) + " department successfully created";
                $scope.createDepartmentForm = "";
                $scope.errMessage = "";
                $scope.isErr = false;
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
            });
    },

    $scope.deleteDepartment = function(departmentId, name) {
        DepartmentDetails.deleteDepartment(departmentId)
            .success(function(data) {
                DepartmentDetails.get()
                    .success(function(data) {
                        $scope.departments = data;
                        $scope.isMsg = true;
                        $scope.message = $filter('capitalize')(name) + " department successfully deleted";
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

    $scope.editDepartmentDetails = function(departmentId){
        $scope.departmentForm.loading = true;
        var editFormData = {
            name: $scope.selectedDepartment.name,
            purpose: $scope.selectedDepartment.purpose,
            location: $scope.selectedDepartment.location,
            company: $scope.selectedDepartment.company.id
        }
        DepartmentDetails.updateDepartment(departmentId, editFormData)
            .success(function(data) {
                $scope.isMsg = true;
                $scope.message = $filter('capitalize')(editFormData.name) + " department successfully updated";
                $scope.departmentForm.loading = false;                
                DepartmentDetails.get()
                    .success(function(data) {
			            $scope.departments = data;
			            var allComps = [];
			            var allWebs = [];
			            angular.forEach($scope.departments, function(obj) {
			                allComps.push(obj.name);
			                allWebs.push(obj.website);
			            });
			            $scope.allDepartments = allComps;
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