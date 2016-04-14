'use strict';

angular.module('mean.pages').controller('tFormClient', ['$scope', '$location', 'Global', '$http', function ($scope, $location, Global, $http) {
    $scope.global = Global;

    // $(window).scrollTop(0);

    // $http({method: 'GET', url: "api/client/client/getClient"}).
    // success(function(data) {
    //     if (data === null) {
    //         $scope.$broadcast('loadError');
    //     } else {
    //         $scope.clients = data;
    //     }
    //     $scope.$broadcast('drawUser');
    // });
    $scope.formMode = false;

    $scope.clientInfo = {
        area : {},
        type : {},
        repair : {},
    };

    let client_id = $location.$$search.id;


    $scope.wordClick = function (obj, field) {
        if ((typeof $scope.clientInfo[obj][field] === "undefined") || ($scope.clientInfo[obj][field] === 0) || ($scope.clientInfo[obj][field] === "0")) {
            $scope.clientInfo[obj][field] = 1
        } else {
            $scope.clientInfo[obj][field] = 0;
        } 
    }
    $scope.handleSubmit = function(form) {
        // switch ($scope.formMode) {
        //     case 'edit':
        editUser(form);
        //         return;
        //     default:
        //         createUser(form);
        //         return;
        // }
    }

    function editUser (form) {
        console.log(form)
        form.client_id = client_id;
        $http({method: 'POST', url: '/api/client/client/editClientInfo', data: form })
        .success(function() {
            // $scope.clients.map(function(d, i){
            //     if (d.id === form.id) {
            //         $scope.clients[i] = form;
            //     }
            // })
            // clearForm();
        })
        .error(function(data, status, headers, config) {
            alert("Something went wrong! \n1- Try putting a number for age");
        });
    }

    function createUser (form) {
        console.log(form)
        // if ($scope.userForm.$valid) {
        //     $http({method: 'POST', url: '/api/home/createClient', data: form })
        //     .success(function() {
        //         $scope.clients.push(form);
        //         clearForm();
        //     })
        //     .error(function(data, status, headers, config) {
        //         alert("Something went wrong! \n1- Try putting a number for age");
        //     });
        // }
    }

    // $scope.editClient = function(client) {
    //     $scope.formMode = "edit";
    //     $scope.createClient = angular.copy(client);
    //     $scope.userForm.$setPristine();
    // }

    // $scope.deleteClient = function(client) {
    //     $http({method: 'POST', url: '/api/home/deleteClient', data: client})
    //     .success(function() {
    //         $scope.clients.map(function(d, i){
    //             if (d.id === client.id) {
    //                 $scope.clients.splice(i, 1);
    //             }
    //         })
    //         clearForm();
    //         // send alert to browser
    //     })
    // }

    function clearForm () {
        $scope.formMode = false;
        $scope.createClient = angular.copy(initialCreate);
        $scope.userForm.$setPristine();
    }



    // $scope.checkContains = function (child_name) {
    //     var cleared = true;
    //     $scope.all_org.map(function(d) {
    //         if (d.child_org == child_name) {
    //             cleared = false;
    //         }
    //     })
    //     return cleared;
    // }

    // $scope.createOrg = function (child, level) {
    //     if (child.$valid) {
    //         if ($scope.checkContains(child.org_name)) {
    //             $scope.nameOk = false;
    //             $scope.nullRegion = false;
    //             if (level == 0) {
    //                 if ($scope.global.user.master === 1){
    //                     child.parent_org = $scope.global.user.parent_org;
    //                 }
    //                 $http({method: 'POST', url: '/api/home?type=createBlank', data: {child_org: child.org_name, email: child.parent_org, level: level}});
    //             }else {
    //                 $http({method: 'POST', url: '/api/home?type=createBlank', data: {child_org: child.org_name, level: level}});
    //             }
    //             $http({method: 'POST', url: '/api/forms/create?type=createBlank', data: {child_org: child.org_name}});
    //             location.reload();                
    //         } else {
    //             $scope.nameOk = true;
    //         }
    //     } else {
    //         $scope.nullRegion = true;
    //     }
    // }

    // $scope.childLink = function (url, child) {
    //     if (url !== '') {
    //         $location.path(url).search("child_org="+child.child_org);
    //     }
    // }

    // $scope.deleteOrganization = function (child) {
    //     var conf = confirm('Are you sure you want to delete this?');
    //     if(conf){$scope.deleteOrganization2(child);}
    // }

    // $scope.deleteOrganization2 = function (child) {
    //     var count = 0;
    //     $scope.children.map(function(d){
    //         if (d.child_org == child.child_org){
    //             count++;
    //         }
    //     })
    //     if (count > 1) {
    //         $http({method: 'POST', url: '/api/home?type=deleteOrgs', data: {child_org: child.child_org, parent_org: child.parent_org}});
    //         location.reload();
    //     } else{
    //         $http({method: 'POST', url: '/api/home?type=deleteOrg', data: {child_org: child.child_org}});
    //         location.reload();
    //     }

     
    // }

    // $scope.createLogin = function (fields) {
    //     $http({method: 'GET', url: query+"?type=createUser&email="+fields.email})
    //         .success(function(data) {
    //             if (data.length > 0) {
    //                 alert("Login Email already taken")
    //             } else {
    //                 $scope.crLogin(fields)
    //             }
    //         });
    // }

    // $scope.crLogin = function (fields) {
    //     if (fields.$valid) {
    //         var org  = eval('(' + fields.org + ')');
    //         $scope.nullOrg = false;
    //         $http({method: 'POST', url: '/api/forms/addLogin', data: { email: fields.email, password: fields.password, org_name: org.child_org, master: org.level }})
    //         .success(function() {
    //             location.reload();
    //         })
    //     } else {
    //         $scope.nullOrg = true;
    //     }
    // }

    // $scope.programInsert = function (form) { 
    //     if (form.$valid) {
    //         $http({method: 'POST', url: '/api/forms/edit?program_type='+form.type+'&type=insert'})
    //         .success(function(){
    //             $scope.programTypes.push({ type: form.type });
    //             $scope.programForm.type = '';
    //         })
    //     }
    // }    
    // $scope.programDelete = function (type, index) {
    //     $http({method: 'POST', url: '/api/forms/edit?program_type='+type+'&type=delete'})
    //     .success(function(){
    //         $scope.programTypes.map(function(d, i){
    //             if (d.type === type) {
    //                 $scope.programTypes.splice(i, 1);
    //             }
    //         })
    //     })
    // }

}]);