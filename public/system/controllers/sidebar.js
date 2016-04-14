'use strict';

angular.module('mean.system').controller('sidebarController', ['$scope', 'Global', '$location', '$modal', '$http', function ($scope, Global, $location, $modal, $http) {
    $scope.global = Global;

    var query = '/api/home';

    $http({method: 'GET', url: query}).
    success(function(data) {
        if (data === null) {
            $scope.$broadcast('loadError');
        } else {
            $scope.children = data.children;
        }
    });

    // User Settings Modal
    $scope.chooseForm = function () {
        $scope.modalInstance = $modal.open({
            templateUrl: 'formModal.html',
            controller: settingsCtrl,
            resolve: {
                data: function() {
                    if ($scope.global.user.master === 0) {
                        return {child_org:{child_org:$scope.global.user.parent_org}};
                    } else {
                        return $scope.children;
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

        $scope.user = user;
        $scope.organizations = data;
        
        $scope.submitForm = function(form) {
            $location.path("create").search("child_org="+form.org);
            $modalInstance.close();
            location.reload();
        }
    };



    $scope.select = function(url){
        if (url !== '') {
            $location.path(url);
            $.noty.closeAll();
        }
    };
    $scope.display = function (accessLevel) {
        if ((accessLevel === undefined) || (accessLevel.length === 0)) {
            return true;
        } else if (accessLevel.length > 0) {
            if (accessLevel.indexOf($scope.global.user.level) !== -1) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };
    $scope.parentClass = function (link) {
        var currentRoute = $location.path().substring(1) || 'home';
        // return page === currentRoute ? 'start active' : '';
        var linkClass = '';
        if (link.url === currentRoute) {
            linkClass = 'start active';
        }
        if (link.children.length >0) {
            link.children.forEach(function(d){
                if (d.url === currentRoute) {
                    linkClass = 'start active open';
                }
                if (d.orphans.length > 0) {
                    d.orphans.forEach(function(e){
                        if (e === currentRoute) {
                            linkClass = 'start active open';
                        }
                    });
                }
            });
        }
        return linkClass;
    };
    $scope.parentClassSelected = function (page) {
        var currentRoute = $location.path().substring(1) || 'home';
        return page === currentRoute ? 'selected' : '';
    };
    $scope.childClass = function (link) {
        var currentRoute = $location.path().substring(1) || 'home';
        var linkClass = '';
        if (link.url === currentRoute){
            linkClass = 'active';
        }
        if (link.orphans.length >0) {
            link.orphans.forEach(function(d){
                if (d === currentRoute) {
                    linkClass = 'active';
                }
            });
        }
        return linkClass;
    };
    $scope.sidebaritems = [
        { // IOC NOTIFICATIONS
            'title': 'Home',
            'url': 'home',
            'icon': 'fa-home',
            'children': []
        }
    ];
}]);