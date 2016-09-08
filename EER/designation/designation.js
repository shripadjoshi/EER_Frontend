'use strict';

angular.module('EERApp.designation', ['ngRoute'])

.factory('DesignationDetails', ['$http', function($http) {
    return {
        get: function() {
            return $http.get('http://localhost:1337/designation');
        },
        getDesignation: function(designationId) {
            return $http.get('http://localhost:1337/designation/' + designationId);
        },
        updateDesignation: function(designationId, designationObj) {
            return $http.put('http://localhost:1337/designation/' + designationId, designationObj)
        },
        deleteDesignation: function(designationId) {
            return $http.delete('http://localhost:1337/designation/' + designationId)
        },
        createNewDesignation: function(designationObj) {
            return $http.post('http://localhost:1337/designation', designationObj)
        }
    }
}])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/designations', {
    templateUrl: 'designation/designations.html',
    controller: 'DesignationController'
  }).when('/designation/new',{
  	templateUrl: 'designation/new.html',
    controller: 'DesignationController'
  }).when('/designation/edit/:id', {
        templateUrl: 'designation/edit.html',
        controller: 'DesignationController'
   });
}])

.controller('DesignationController', ['$rootScope', '$scope', '$routeParams', 'DesignationDetails', 'CompanyDetails', '$filter',
	function($rootScope, $scope, $routeParams, DesignationDetails, CompanyDetails, $filter) {
	//This rootScope variable will set the active tab in the menu item
	$rootScope.activeTab = "Designation";
    $rootScope.activeTabMaster = "Master";
    $scope.designations = "";
    $scope.companyDepartments = "";
	$scope.companies = "";
    $scope.message = "";
    $scope.errMessage = "";
    $scope.isMsg = false;
    $scope.isErr = false;
    $scope.isDesignationExist = false;
    $scope.designationForm = {
        loading: false
    };
    $scope.allDesignations = "";
    $scope.selectedDesignation = "";
    
    //This will fetch all the available designations
    DesignationDetails.get()
        .success(function(data) {
            $scope.designations = data;
            var allDesi = [];
            angular.forEach($scope.designations, function(obj) {
                allDesi.push([$filter('toLowerCase')(obj.name), obj.company.id, obj.department.id]);
            });
            $scope.allDesignations = allDesi;            
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
        DesignationDetails.getDesignation($routeParams.id)
            .success(function(designationData) {
                $scope.selectedDesignation = designationData;
                $scope.isDesignationExist = true;
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
        });
    }

    $scope.validateDesignationExist = function(designationName, companyId, departmentId){
        for(var i=0; i< $scope.allDesignations.length; i++){
            if (($scope.allDesignations[i][0].indexOf($filter('toLowerCase')(designationName)) > -1) && ($scope.allDesignations[i][1] == companyId) && ($scope.allDesignations[i][2] == departmentId)) {
                $scope.isDesignationExist = true;
                return;
            } else {
                $scope.isDesignationExist = false;
            }
        }
		
    },

    $scope.createNewDesignation = function(){
    	$scope.designationForm.loading = true;
    	DesignationDetails.createNewDesignation($scope.createDesignationForm)
            .success(function(data) {
                $scope.isMsg = true;
                $scope.message = $filter('capitalize')($scope.createDesignationForm.name) + " designation successfully created";
                $scope.createDesignationForm = "";
                $scope.errMessage = "";
                $scope.isErr = false;
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
            });
    },

    $scope.deleteDesignation = function(designationId, name) {
        DesignationDetails.deleteDesignation(designationId)
            .success(function(data) {
                DesignationDetails.get()
                    .success(function(data) {
                        $scope.designations = data;
                        $scope.isMsg = true;
                        $scope.message = $filter('capitalize')(name) + " designation successfully deleted";
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

    $scope.editDesignationDetails = function(designationId){
        $scope.designationForm.loading = true;
        var editFormData = {
            name: $scope.selectedDesignation.name,
            purpose: $scope.selectedDesignation.purpose,
            location: $scope.selectedDesignation.location,
            company: $scope.selectedDesignation.company.id
        }
        DesignationDetails.updateDesignation(designationId, editFormData)
            .success(function(data) {
                $scope.isMsg = true;
                $scope.message = $filter('capitalize')(editFormData.name) + " designation successfully updated";
                $scope.designationForm.loading = false;                
                DesignationDetails.get()
                    .success(function(data) {
			            $scope.designations = data;
			            var allComps = [];
			            var allWebs = [];
			            angular.forEach($scope.designations, function(obj) {
			                allComps.push(obj.name);
			                allWebs.push(obj.website);
			            });
			            $scope.allDesignations = allComps;
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

    $scope.fetchCompanyDepartments = function(){
        if($scope.createDesignationForm.company > 0){
            CompanyDetails.getCompany($scope.createDesignationForm.company)
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
        
    }
}]);