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

.controller('EmployeeController', ['$rootScope', '$scope', '$routeParams', 'EmployeeDetails', 'CompanyDetails', 'DepartmentDetails', '$filter',
	function($rootScope, $scope, $routeParams, EmployeeDetails, CompanyDetails, DepartmentDetails, $filter) {
	//This rootScope variable will set the active tab in the menu item
	$rootScope.activeTab = "Employee";
    $rootScope.activeTabMaster = "Master";

	$scope.employees = "";
    $scope.message = "";
    $scope.errMessage = "";
    $scope.isMsg = false;
    $scope.isErr = false;
    $scope.salutations = ["Miss", "Mrs.", "Smt.", "Mr."];
    $scope.employeeTypes = ["Master", "Admin", "Employee"];
    $scope.companyDepartments = "";
    $scope.departmentDesignations = ""
    $scope.isEmployeeEmailExist = false;
    
    $scope.employeeForm = {
        loading: false
    };
    $scope.allEmployeeEmails = "";    
    $scope.selectedEmployee = "";
    

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

    //This will fetch all the available employees
    EmployeeDetails.get()
        .success(function(data) {
            $scope.employees = data;
            var allEmails = [];
            //var allWebs = [];
            angular.forEach($scope.employees, function(obj) {
                allEmails.push($filter('toLowerCase')(obj.email_id));
                //allWebs.push($filter('toLowerCase')(obj.website));
            });
            $scope.allEmployeeEmails = allEmails;
            //$scope.allWebsites = allWebs;
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

    $scope.validateEmailExist = function(employeeEmail){
        if ($scope.allEmployeeEmails.indexOf($filter('toLowerCase')(employeeEmail)) > -1) {
	        $scope.isEmployeeEmailExist = true;
	    } else {
	        $scope.isEmployeeEmailExist = false;
	    }
    },

    $scope.generateFullName = function(){
        var salutation = "",
            first_name = "",
            middle_name = "",
            last_name = "";
        if("salutation" in $scope.createEmployeeForm){
            salutation = ($scope.createEmployeeForm.salutation.length > 0 ? $scope.createEmployeeForm.salutation : "" )
        }if("first_name" in $scope.createEmployeeForm){
            first_name = ($scope.createEmployeeForm.first_name.length > 0 ? $scope.createEmployeeForm.first_name : "" )
        }if("middle_name" in $scope.createEmployeeForm){
            middle_name = ($scope.createEmployeeForm.middle_name.length > 0 ? $scope.createEmployeeForm.middle_name : "" )
        }if("last_name" in $scope.createEmployeeForm){
            last_name = ($scope.createEmployeeForm.last_name.length > 0 ? $scope.createEmployeeForm.last_name : "" )
        }
        $scope.createEmployeeForm.full_name = salutation + " "+first_name+" "+middle_name+" "+last_name
    },

    $scope.createNewEmployee = function(){
    	$scope.employeeForm.loading = true;
    	console.log($scope.createEmployeeForm)
    	/*var formData = {
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
            });*/
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
    },

     $scope.fetchCompanyDepartments = function(formName){
        var company = "";
        if(formName == "create"){
            company = $scope.createEmployeeForm.employee_company

        }else{
            company = $scope.selectedEmployee.employee_company.id
        }
        if(company > 0){
            CompanyDetails.getCompany(company)
            .success(function(companyData) {
                $scope.companyDepartments = companyData.departments;                
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
            });
        }
        else{
            $scope.companyDepartments = "";
        }
        
    },

    $scope.fetchDepartmentDesignations = function(formName){
        var department = "";
        if(formName == "create"){
            department = $scope.createEmployeeForm.employee_department

        }else{
            department = $scope.selectedEmployee.employee_department.id
        }
        if(department > 0){
            DepartmentDetails.getDepartment(department)
            .success(function(departmentData) {
                $scope.departmentDesignations = departmentData.designations;
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
            });
        }
        else{
            $scope.departmentDesignations = "";
        }
        
    }
}]);