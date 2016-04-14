'use strict';

angular.module('mean.system').controller('headerController', ['$scope', 'Global', '$location', '$rootScope', '$window', '$http', '$modal', function ($scope, Global, $location, $rootScope, $window, $http, $modal) {
	$scope.global = Global;
	$rootScope.$watch('user', function(user) {
		$scope.global.user = user;
	})

    function updatePassword(password, parent, callback) {
        $http({method: 'POST', url: '/api/forms/changePassword', data: {password: password, parent_org: parent}}).
            success(function(data, status, headers, config) {
                callback();
            });
    }

	var query = '/api/home';

    $http({method: 'GET', url: query}).
    success(function(data) {
        if (data === null) {
            $scope.$broadcast('loadError');
        } else {
            $scope.children_user = data.children_user;
        }
    });

	// User Settings Modal
    $scope.userSettings = function () {
        $scope.modalInstance = $modal.open({
            templateUrl: 'userModal.html',
            controller: settingsCtrl,
            resolve: {
                data: function() {
                	if ($scope.global.user.master === 0) {
                    	return {user:$scope.global.user};
                	} else {
                    	return $scope.children_user;
                	}
                },
                user: function() {
                    return $scope.global.user;
                }
            },
        });
    };

    var settingsCtrl = function ($scope, $modalInstance, data, user) {
        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.organizations = data;
        $scope.nullOrg = false;
        $scope.user = user;
        
        $scope.submitForm = function(form) {
        	if (form.org != undefined)  {
        		$scope.nullOrg = false;
	        	if (form.cpassword.$modelValue === form.password.$modelValue) {        		
		            if (form.$valid) {
                        updatePassword(form.password.$modelValue, form.org, function(){
                            $modalInstance.close();
                            delete $window.sessionStorage.token;
                            $location.url('/login');
                        });
			            // $http({method: 'POST', url: '/api/forms/changePassword', data: {password: form.password.$modelValue, parent_org: parent_org}}).
			            //     success(function(data, status, headers, config) {
		            	// 		console.log("true2");
			                    
			            //     });     
		            	// console.log("true3");           
		            } 
	        	} 
        	} else {
        		$scope.nullOrg = true;
        	}
        }
    };

	$scope.logout = function() {
		delete $window.sessionStorage.token;
		$location.url('/login');
	}
}]);