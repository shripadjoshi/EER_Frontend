'use strict';

angular.module('EERApp.company', ['ngRoute'])

.factory('CompanyDetails', ['$http', function($http) {
    return {
        get: function() {
            return $http.get('http://localhost:1337/company');
        },
        getCompany: function(companyId) {
            return $http.get('http://localhost:1337/company/' + companyId);
        },
        /*updateBrowser: function(browserId, name) {
            return $http.put('http://localhost:1337/browser/' + browserId, { name: name })
        },*/
        deleteCompany: function(companyId) {
            return $http.delete('http://localhost:1337/company/' + companyId)
        },
        createNewCompany: function(companyObj) {
            return $http.post('http://localhost:1337/company', companyObj)
        }
    }
}])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/companies', {
    templateUrl: 'company/companies.html',
    controller: 'CompanyController'
  }).when('/company/new',{
  	templateUrl: 'company/new.html',
    controller: 'CompanyController'
  }).when('/company/edit/:id', {
        templateUrl: 'company/edit.html',
        controller: 'CompanyController'
   });
}])

.controller('CompanyController', ['$rootScope', '$scope', '$routeParams', 'CompanyDetails', '$filter',
	function($rootScope, $scope, $routeParams, CompanyDetails, $filter) {
	//This rootScope variable will set the active tab in the menu item
	$rootScope.activeTab = "Company";

	$scope.companies = "";
    $scope.message = "";
    $scope.errMessage = "";
    $scope.isMsg = false;
    $scope.isErr = false;
    $scope.isCompanyExist = false;
    $scope.isCompanyWebsiteExist = false;
    $scope.isValidWebsite = false;
    $scope.companyForm = {
        loading: false
    };
    $scope.allCompanies = "";
    $scope.allWebsites = "";
    $scope.selectedCompany = "";
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


    //This will fetch all the available companies
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
    });

    //This method will be used to fill up the edit form
    if ($routeParams.id != undefined) {
        CompanyDetails.getCompany($routeParams.id)
            .success(function(companyData) {
                $scope.selectedCompany = companyData;
            }).error(function(err) {
                $scope.message = "";
                $scope.isMsg = false;
                $scope.errMessage = err.message;
                $scope.isErr = true;
            });
    }

    $scope.validateCompanyExist = function(companyName){
		if ($scope.allCompanies.indexOf(companyName) > -1) {
	        $scope.isCompanyExist = true;
	    } else {
	        $scope.isCompanyExist = false;
	    }
    },

    $scope.validateCompanyWebsiteExist = function(companyWebsite){
		if ($scope.allWebsites.indexOf(companyWebsite) > -1) {
	        $scope.isCompanyWebsiteExist = true;
	    } else {
	        $scope.isCompanyWebsiteExist = false;
	    }
    },

    $scope.validateCompanyWebsite = function(companyWebsite){
		if($scope.urlRegex.test(companyWebsite)) {
            $scope.isValidWebsite = true;
        } else {
            $scope.isValidWebsite = false;
        }
    },

    $scope.createNewCompany = function(){
    	$scope.companyForm.loading = true;
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
            });
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

    }

    




}]);