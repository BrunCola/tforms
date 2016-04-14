'use strict';

angular.module('mean.pages').directive('head', function() {
    // This appends the page head (title and calendar) to all pages, so they can have their own controller
    return {
        restrict: 'A',
        scope : {
            title : '@'
        },
        templateUrl : 'public/pages/views/head.html',
        transclude : true
    };
});


// angular.module('mean.pages').directive('download', function() {
//     return {
//         link: function($scope, element, attrs) {
//             $scope.$on('initDown', function (event, data) {
//             	var a = element
// 				a.href     = 'data:application/csv;charset=utf-8,' + encodeURIComponent(data);
// 				a.target   = '_blank';
// 				a.download = 'myFile.csv';
// 				document.location(a);
//             });
//         }
//     };
// });
