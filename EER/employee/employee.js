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
        updateEmployeeIsDeleted: function(employeeId, isDeletedStatus) {
            return $http.put('http://localhost:1337/employee/' + employeeId, {isDeleted: isDeletedStatus})
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
    $scope.employeesWithUser = "";
    $scope.message = "";
    $scope.errMessage = "";
    $scope.isMsg = false;
    $scope.isErr = false;
    $scope.salutations = ["Miss", "Mrs.", "Smt.", "Mr."];
    $scope.employeeTypes = ["Master", "Admin", "Employee"];
    $scope.companyDepartments = "";
    $scope.departmentDesignations = ""
    $scope.isEmployeeEmailExist = false;
    $scope.maxEmployeeId = 0;
    
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
            var allEmpIds = [];
            var allEmpIdsWithUser = [];
            angular.forEach($scope.employees, function(obj) {
                allEmails.push($filter('toLowerCase')(obj.email_id));
                allEmpIds.push(obj.emp_id);
                if(obj.users.length > 0){
                    allEmpIdsWithUser.push(obj.id)
                }
            });
            $scope.allEmployeeEmails = allEmails;
            $scope.employeesWithUser = allEmpIdsWithUser;
            if(allEmpIds.length > 0)
                $scope.maxEmployeeId = parseInt(Math.max.apply(Math,allEmpIds))+1;
            else
               $scope.maxEmployeeId = 1 
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
                $scope.isEmployeeEmailExist = false;
                if($scope.selectedEmployee.employee_company.id > 0){
                    var company = "";
                    company = $scope.selectedEmployee.employee_company.id;        
                    if(company > 0){
                        CompanyDetails.getCompany(company)
                        .success(function(companyData) {
                            $scope.companyDepartments = companyData.departments;
                            var department = "";
                            department = $scope.selectedEmployee.employee_department.id;        
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
                }
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

    $scope.createNewEmployee = function(){
    	$scope.employeeForm.loading = true;
        
        EmployeeDetails.get()
        .success(function(data) {
            var allEmpIds = [];
            angular.forEach(data, function(obj) {
                allEmpIds.push(obj.emp_id);
            });
            if(allEmpIds.length > 0)
                $scope.maxEmployeeId = parseInt(Math.max.apply(Math,allEmpIds))+1;
            else
               $scope.maxEmployeeId = 1;
            var empId = 0;
            if($scope.createEmployeeForm.employee_type != "Master"){
                empId = $scope.maxEmployeeId;
            }
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
            var formData = {
                salutation: $scope.createEmployeeForm.salutation,
                first_name: $scope.createEmployeeForm.first_name,
                middle_name: $scope.createEmployeeForm.middle_name,
                last_name: $scope.createEmployeeForm.last_name,
                full_name: $scope.createEmployeeForm.full_name,
                emp_id: empId,
                email_id: $scope.createEmployeeForm.email_id,
                address: $scope.createEmployeeForm.address,
                landmark: $scope.createEmployeeForm.landmark,
                country: $scope.createEmployeeForm.country,
                state: $scope.createEmployeeForm.state,
                city: $scope.createEmployeeForm.city,
                pincode: parseInt($scope.createEmployeeForm.pincode),
                phone_no: parseInt($scope.createEmployeeForm.phone_no),
                mobile_no: parseInt($scope.createEmployeeForm.mobile_no),
                employee_type: $scope.createEmployeeForm.employee_type,
                employee_company: $scope.createEmployeeForm.employee_company,
                employee_department: $scope.createEmployeeForm.employee_department,
                employee_designation: $scope.createEmployeeForm.employee_designation,
                isDeleted: $scope.createEmployeeForm.isDeleted
            };
            EmployeeDetails.createNewEmployee(formData)
                .success(function(data) {
                    $scope.isMsg = true;
                    $scope.message = $filter('capitalize')(formData.full_name) + " employee successfully created";
                    $scope.createEmployeeForm = "";
                    $scope.errMessage = "";
                    $scope.isErr = false;
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

    	
    	
    },

    $scope.deleteEmployee = function(employeeId, empName) {
        console.log(employeeId);
        console.log(empName);
        EmployeeDetails.deleteEmployee(employeeId)
            .success(function(data) {
                EmployeeDetails.get()
                    .success(function(data) {
                        $scope.employees = data;
                        $scope.isMsg = true;
                        $scope.message = empName + " employee successfully deleted";
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

    },

    $scope.toggleEmployeeIsDeleted = function(id, full_name, isDeleted) {
        EmployeeDetails.updateEmployeeIsDeleted(id, isDeleted)
            .success(function(data) {
                $scope.isMsg = true;
                $scope.message = $filter('capitalize')(full_name) + " successfully updated"
                $scope.errMessage = "";
                $scope.isErr = false;
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
            });
    },

    $scope.editEmployeeDetails = function(employeeId){
        $scope.employeeForm.loading = true;
        var salutation = "",
            first_name = "",
            middle_name = "",
            last_name = "";
        if("salutation" in $scope.selectedEmployee){
            salutation = ($scope.selectedEmployee.salutation.length > 0 ? $scope.selectedEmployee.salutation : "" )
        }if("first_name" in $scope.selectedEmployee){
            first_name = ($scope.selectedEmployee.first_name.length > 0 ? $scope.selectedEmployee.first_name : "" )
        }if("middle_name" in $scope.selectedEmployee){
            middle_name = ($scope.selectedEmployee.middle_name.length > 0 ? $scope.selectedEmployee.middle_name : "" )
        }if("last_name" in $scope.selectedEmployee){
            last_name = ($scope.selectedEmployee.last_name.length > 0 ? $scope.selectedEmployee.last_name : "" )
        }
        $scope.selectedEmployee.full_name = salutation + " "+first_name+" "+middle_name+" "+last_name;
        var formDataEmployee = {
                salutation: $scope.selectedEmployee.salutation,
                first_name: $scope.selectedEmployee.first_name,
                middle_name: $scope.selectedEmployee.middle_name,
                last_name: $scope.selectedEmployee.last_name,
                full_name: $scope.selectedEmployee.full_name,
                email_id: $scope.selectedEmployee.email_id,
                address: $scope.selectedEmployee.address,
                landmark: $scope.selectedEmployee.landmark,
                country: $scope.selectedEmployee.country,
                state: $scope.selectedEmployee.state,
                city: $scope.selectedEmployee.city,
                pincode: parseInt($scope.selectedEmployee.pincode),
                phone_no: parseInt($scope.selectedEmployee.phone_no),
                mobile_no: parseInt($scope.selectedEmployee.mobile_no),
                employee_type: $scope.selectedEmployee.employee_type,
                employee_company: $scope.selectedEmployee.employee_company.id,
                employee_department: $scope.selectedEmployee.employee_department.id,
                employee_designation: $scope.selectedEmployee.employee_designation.id,
                isDeleted: $scope.selectedEmployee.isDeleted
            };        
        EmployeeDetails.updateEmployee(employeeId, formDataEmployee)
            .success(function(data) {
                $scope.isMsg = true;
                $scope.message = ($scope.selectedEmployee.full_name) + " successfully updated";
                $scope.employeeForm.loading = false;                
                EmployeeDetails.get()
                    .success(function(data) {
			            $scope.employees = data;
			            /*var allComps = [];
			            var allWebs = [];
			            angular.forEach($scope.employees, function(obj) {
			                allComps.push(obj.name);
			                allWebs.push(obj.website);
			            });
			            $scope.allEmployees = allComps;
			            $scope.allWebsites = allWebs;*/
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