'use strict';
// var wait = (function () {
//     var timers = {};
//     return function (callback, ms, uniqueId) {
//         if (!uniqueId) {
//             uniqueId = "filterWait"; //Don't call this twice without a uniqueId
//         }
//         if (timers[uniqueId]) {
//             clearTimeout (timers[uniqueId]);
//         }
//         timers[uniqueId] = setTimeout(callback, ms);
//     };
// })();
angular.module('mean.pages').factory('searchFilter', ['$rootScope',
    function($rootScope) {
        var searchFilter = function(dimension, sort) {
            // $rootScope.waitForFinalEvent = (function () {
                // var timers = {};
                // return function (callback, ms, uniqueId) {
                    // if (!uniqueId) {
                        // uniqueId = "filterWait"; //Don't call this twice without a uniqueId
                    // }
                    // if (timers[uniqueId]) {
                        // clearTimeout (timers[uniqueId]);
                    // }
                    // timers[uniqueId] = setTimeout(callback, ms);
                // };
            // })();
            // our filter function
            function filtah(obj) {
                for (var i in obj) {
                    // continue if value is defined
                    if ((obj[i] !== undefined) && (obj[i] !== null)){
                        var name = obj[i].toString().toLowerCase();
                        if (name.toLowerCase().indexOf($rootScope.search.toLowerCase()) > -1) {
                            // jump out if search is defined
                            return true;
                        }
                    }
                    // one reached the end of the object, return
                    if (i === obj[obj.length-1]) {
                        return false;
                    }
                }
            }
            // clears existing filter
            // wait(function(){
                dimension.filterAll(null);
                if ($rootScope.search.length > 0) {
                    dimension.filter(filtah);
                }
            // }, 200, "filtertWait");
        }
        return searchFilter;
    }
]);






angular.module('mean.pages').factory('iocIcon', [
    function() {
        var iocIcon = function(severity) {
            switch(severity){
                case 1:
                    return 'fa-flag';
                case 2:
                    return 'fa-bullhorn';
                case 3:
                    return 'fa-bell';
                case 4:
                    return 'fa-exclamation-circle';
                default:
                    return 'fa-question';
            }
        };
        return iocIcon;
    }
]);

angular.module('mean.pages').factory('timeFormat', [
    function() {
        var timeFormat = function(time, format) {
            // console.log(moment().unix(time))
            switch(format){
                case 'strdDateObj':
                    return new Date(time*1000);
                break;
                case 'tables':
                    return moment(time*1000).format('YYYY/MM/DD HH:mm:ss');
                break;
                case 'laneGraphExpanded':
                    return moment(time*1000).format('YYYY/MM/DD HH:mm:ss.SS');
                break;
                case 'laneGraphPreview':
                    return moment(time*1000).format('YYYY/MM/DD HH:mm:ss.SS');
                break;
                case 'iochits':
                    return moment(time*1000).format('YYYY-MM-DD HH:mm:ss');
                break;
            }
        };
        return timeFormat;
    }
]);

angular.module('mean.pages').factory('dictionary', [
    function() {
        var dictionary = function(word) {
            switch(word){
                case 'lan_zone':
                    return 'LAN Zone';
                case 'lan_user':
                    return 'LAN User';
                case 'lan_ip':
                    return 'LAN IP';
                case 'remote_user':
                    return 'Remote User';
                case 'remote_ip':
                    return 'Remote IP';
                case 'type':
                    return 'Type';
                default:
                    return word;
            }
        };
        return dictionary;
    }
]);

angular.module('mean.pages').factory('laneRowSymbols', [
    function() {
        var laneRowSymbols = function(type, element, color1, color2) {
            switch(type){
                case 'Conn':  
                    element.append('svg:polygon')
                        .attr('points', '24.585,6.299 24.585,9.064 11.195,9.064 11.195,14.221 24.585,14.221 24.585,16.986 31.658,11.643 ')
                        .attr('fill', color1);
                    element.append('svg:polygon')
                        .attr('points', '10.99,17.822 3.916,23.166 10.99,28.51 10.99,25.744 24.287,25.744 24.287,20.59 10.99,20.59 ')
                        .attr('fill', color1);
                    return;
                case 'IOC Severity':    
                    element.append('svg:polygon')
                        .attr('transform', 'translate(0, 3)')
                        .attr('points', '18.155,3.067 5.133,26.932 31.178,26.932 ')
                        .attr('fill', color1);
                    element.append('svg:polygon')
                        .attr('transform', 'translate(0, 3)')
                        .attr('points', '19.037,21.038 19.626,12.029 15.888,12.029 16.477,21.038 ')
                        .attr('fill', color2);
                    element.append('rect')
                        .attr('transform', 'translate(0, 3)')
                        .attr('x', 16.376)
                        .attr('y', 22.045)
                        .attr('fill', color2)
                        .attr('width', 2.838)
                        .attr('height', 2.448);
                    return;
                case 'DNS': 
                    element.append('svg:path')
                        .attr('d', 'M20.909,13.115c0-0.07,0-0.106-0.071-0.106c-0.283,0-6.022,0.813-7.935,0.956'+
                            'c-0.036,0.955-0.071,2.053-0.071,3.009l2.267,0.106v8.707c0,0.071-0.035,0.143-0.142,0.178l-1.877,0.07'+
                            'c-0.035,0.92-0.035,1.982-0.035,2.938c1.452,0,3.33-0.036,4.818-0.036h4.888V26l-1.949-0.07'+
                            'C20.801,22.39,20.874,16.938,20.909,13.115z')
                        .attr('fill', color1);
                    element.append('svg:path')
                        .attr('d', 'M17.473,10.921c1.771,0,3.329-1.274,3.329-3.187c0-1.486-1.098-2.867-3.152-2.867'+
                            'c-1.948,0-3.259,1.451-3.259,2.938C14.391,9.611,15.949,10.921,17.473,10.921z')
                        .attr('fill', color1);
                    return;
                case 'HTTP': 
                    element.append('svg:path')
                        .attr('d', 'M24.715,19.976l-2.057-1.122l-1.384-0.479l-1.051,0.857l-1.613-0.857l0.076-0.867l-1.062-0.325l0.31-1.146'+
                            'l-1.692,0.593l-0.724-1.616l0.896-1.049l1.108,0.082l0.918-0.511l0.806,1.629l0.447,0.087l-0.326-1.965l0.855-0.556l0.496-1.458'+
                            'l1.395-1.011l1.412-0.155l-0.729-0.7L22.06,9.039l1.984-0.283l0.727-0.568L22.871,6.41l-0.912,0.226L21.63,6.109l-1.406-0.352'+
                            'l-0.406,0.596l0.436,0.957l-0.485,1.201L18.636,7.33l-2.203-0.934l1.97-1.563L17.16,3.705l-2.325,0.627L8.91,3.678L6.39,6.285'+
                            'l2.064,1.242l1.479,1.567l0.307,2.399l1.009,1.316l1.694,2.576l0.223,0.177l-0.69-1.864l1.58,2.279l0.869,1.03'+
                            'c0,0,1.737,0.646,1.767,0.569c0.027-0.07,1.964,1.598,1.964,1.598l1.084,0.52L19.456,21.1l-0.307,1.775l1.17,1.996l0.997,1.242'+
                            'l-0.151,2.002L20.294,32.5l0.025,2.111l1.312-0.626c0,0,2.245-3.793,2.368-3.554c0.122,0.238,2.129-2.76,2.129-2.76l1.666-1.26'+
                            'l0.959-3.195l-2.882-1.775L24.715,19.976z')
                        .attr('fill', color1);
                    return;
                case 'SSL':
                    element.append('svg:path')
                        .attr('fill', color1)
                        .attr('d', 'M25.5,16.1v-2.7h0c0,0,0,0,0,0c0-4.1-3.3-7.4-7.4-7.4c-4.1,0-7.4,3.3-7.4,7.4c0,0,0,0,0,0v2.7H9.3'+
                        'v11.8h17.8V16.1H25.5z M22.9,13.7v2.4h-9.4v-2.4c0,0,0,0,0,0c0-2.6,1.5-5,4.7-5C21.3,8.8,22.9,11.1,22.9,13.7'+
                        'C22.9,13.7,22.9,13.7,22.9,13.7z');
                    return;
                case 'Endpoint': 
                    element.append('svg:path')
                        .attr('d', 'M28.649,8.6H7.351c-0.684,0-1.238,0.554-1.238,1.238v14.363c0,0.684,0.554,1.238,1.238,1.238h7.529'+
                            'l-1.09,3.468v0.495h8.419v-0.495l-1.09-3.468h7.529c0.684,0,1.237-0.555,1.237-1.238V9.838C29.887,9.153,29.333,8.6,28.649,8.6z'+
                            'M28.477,22.072H7.635V10.074h20.842V22.072z')
                        .attr('fill', color1);
                    return;
                case 'Stealth':
                    element.append('svg:path')
                        .attr('fill', color1)
                        .attr('d', 'M23.587,26.751c-0.403,0.593-1.921,4.108-5.432,4.108c-3.421,0-5.099-3.525-5.27-3.828'+
                            'c-2.738-4.846-4.571-9.9-4.032-17.301c6.646,0,9.282-4.444,9.291-4.439c0.008-0.005,3.179,4.629,9.313,4.439'+
                            'C28.014,15.545,26.676,21.468,23.587,26.751z');
                    element.append('svg:path')
                        .attr('fill', '#3f3f3f')
                        .attr('d', 'M13.699,23.661c1.801,3.481,2.743,4.875,4.457,4.875l0.011-19.85c0,0-2.988,2.794-7.09,3.251'+
                            'C11.076,16.238,11.938,20.26,13.699,23.661z');
                    return;
                case 'Stealth_drop':
                    element.append('svg:path')
                        .attr('fill', color1)
                        .attr('d', 'M23.587,26.751c-0.403,0.593-1.921,4.108-5.432,4.108c-3.421,0-5.099-3.525-5.27-3.828'+
                            'c-2.738-4.846-4.571-9.9-4.032-17.301c6.646,0,9.282-4.444,9.291-4.439c0.008-0.005,3.179,4.629,9.313,4.439'+
                            'C28.014,15.545,26.676,21.468,23.587,26.751z');
                    element.append('svg:path')
                        .attr('fill', '#D8464A')
                        .attr('d', 'M13.699,23.661c1.801,3.481,2.743,4.875,4.457,4.875l0.011-19.85c0,0-2.988,2.794-7.09,3.251'+
                            'C11.076,16.238,11.938,20.26,13.699,23.661z');
                    return;
                case 'Email':
                    element.append('polygon')
                        .style('fill', color1)
                        .attr('points', '18,17.3 8.7,11.6 27.3,11.6 ');
                    element.append('polygon')
                        .style('fill', color1)
                        .attr('points', '28.4,24.4 7.6,24.4 7.6,13.1 18,19.7 28.4,13.1 ');
                    return;
                case 'File':
                    element.append('svg:path')
                        .attr('d', 'M13.702,12.807h13.189c-0.436-0.655-1.223-1.104-2.066-1.104c0,0-7.713,0-8.361,0'+
                            'c-0.386-0.796-1.278-1.361-2.216-1.361H7.562c-1.625,0-1.968,0.938-1.839,2.025l2.104,11.42c0.146,0.797,0.791,1.461,1.594,1.735'+
                            'c0,0,2.237-10.702,2.378-11.308C12.005,13.334,12.403,12.807,13.702,12.807z')
                        .attr('fill', color1);
                    element.append('svg:path')
                        .attr('d', 'M29.697,13.898c0,0-14.47-0.037-14.68-0.037c-1.021,0-1.435,0.647-1.562,1.289l-2.414,10.508h16.716'+
                            'c1.146,0,2.19-0.821,2.383-1.871l1.399-7.859C31.778,14.706,31.227,13.848,29.697,13.898z')
                        .attr('fill', color1);
                    return;
                case 'Applications': 
                    element.append('rect')
                        .attr('x', 10)
                        .attr('y', 10)
                        .attr('height', 4)
                        .attr('width', 17)
                        .style('fill', color1);
                    element.append('rect')
                        .attr('x', 10)
                        .attr('y', 16)
                        .attr('height', 4)
                        .attr('width', 17)
                        .style('fill', color1);
                    element.append('rect')
                        .attr('x', 10)
                        .attr('y', 22)
                        .attr('height', 4)
                        .attr('width', 17)
                        .style('fill', color1);
                    return;
                default:
                    return;
            }
        }
        return laneRowSymbols;
    }
]);

// angular.module('mean.pages').factory('appIcon', [
//  function() {
//      var appIcon = function(app) {
//          var app = app.toLowerCase();
//          switch(app) {
//              case 'http':
//                  return '<svg version="1.1" id="Layer_1" x="0px" y="0px" width="42.794px" height="42.795px" viewBox="0 0 42.794 42.795" enable-background="new 0 0 42.794 42.795" xml:space="preserve"> <g> <g> <defs> <circle id="SVGID_1_" cx="21.397" cy="21.398" r="21.397"/> </defs> <use xlink:href="#SVGID_1_"  overflow="visible" fill="#BBBDBF"/> <clipPath id="SVGID_2_"> <use xlink:href="#SVGID_1_"  overflow="visible"/> </clipPath> </g> <g> <g> <path fill-rule="evenodd" clip-rule="evenodd" fill="#F3BD5D" d="M16.223,4.356h-4c-0.333,0-0.607,0.278-0.607,0.617v4.056 c0,0.339,0.274,0.615,0.607,0.615h4c0.335,0,0.609-0.276,0.609-0.615V4.974C16.832,4.635,16.558,4.356,16.223,4.356z M23.398,4.356h-4.001c-0.334,0-0.607,0.278-0.607,0.617v4.056c0,0.339,0.273,0.615,0.607,0.615h4.001 c0.334,0,0.607-0.276,0.607-0.615V4.974C24.005,4.635,23.732,4.356,23.398,4.356z M30.572,4.356h-4 c-0.336,0-0.609,0.278-0.609,0.617v4.056c0,0.339,0.273,0.615,0.609,0.615h4c0.334,0,0.607-0.276,0.607-0.615V4.974 C31.179,4.635,30.906,4.356,30.572,4.356z M16.223,33.629h-4c-0.333,0-0.607,0.277-0.607,0.617v4.053 c0,0.34,0.274,0.618,0.607,0.618h4c0.335,0,0.609-0.278,0.609-0.618v-4.053C16.832,33.906,16.558,33.629,16.223,33.629z M23.398,33.629h-4.001c-0.334,0-0.607,0.277-0.607,0.617v4.053c0,0.34,0.273,0.618,0.607,0.618h4.001 c0.334,0,0.607-0.278,0.607-0.618v-4.053C24.005,33.906,23.732,33.629,23.398,33.629z M30.572,33.629h-4 c-0.336,0-0.609,0.277-0.609,0.617v4.053c0,0.34,0.273,0.618,0.609,0.618h4c0.334,0,0.607-0.278,0.607-0.618v-4.053 C31.179,33.906,30.906,33.629,30.572,33.629z"/> </g> </g> <text transform="matrix(1 0 0 1 7.4443 26.3291)" fill="#939393" font-family="ITCAvantGardeStd-Bk" font-size="14">http</text> </g> </svg>';
//          }
//      }
//      return appIcon;
//  }
// ]);
// 
// 

angular.module('mean.pages').factory('treeIcon', [
    function() {
        // this accepts an element parameter because the icons are used soley in a d3 chart
        var treeIcon = function(val, elm) {
            if (val !== null) {
                var val = val.toLowerCase();
            }
            switch(val) {
                case 'network':
                    //RapidPHIRE logo
                    elm.append('rect')
                        .attr('x', -30)
                        .attr('y', -40)
                        .attr('height', 80)
                        .attr('width', 80)
                        .style('fill', '#383E4D')
                        .style('fill-opacity', 1);

                    elm.append('path') //chevron
                        .attr('d', 'M1.6,21.2l13.4-10.7l13.5,10.7L14.9,5.9L1.6,21.2z')
                        .attr('fill', '#ED1F24')
                        .attr('transform', 'translate(-28,-35) scale(2.5,2.5)');
                        break;
                case 'linux':
                    elm.append('path')
                        .style('fill', '#000000')
                        .attr('d', 'M26.3,0c2.2-0.1,5.4,1.9,5.7,4.2c0.3,1.4,0.1,3,0.1,4.4c0,1.6,0,3.3,0.2,4.9'+
                        'c0.3,2.9,2.4,4.8,3.7,7.2c0.6,1.2,1.4,2.4,1.7,3.8c0.4,1.5,0.7,3.1,1,4.6c0.2,1.5,0.4,2.9,0.3,4.4c0,0.6,0.1,1.3-0.1,2'+
                        'c-0.2,0.8-0.6,1.3-0.3,2.1c0.2,0.7,0.1,1.2,0.9,1.3c0.7,0.1,1.3-0.2,2-0.1c1.4,0.1,2.8,0.7,2.3,2.3c-1.6,2.3-3.3,4.8-5.6,6.5'+
                        'c-0.9,0.7-1.8,1.9-3,2.1c-1.2,0.4-2.8,0.3-3.9-0.6c-0.4-0.3-0.7-0.7-0.9-1.1c-0.1-0.3-0.2-0.5-0.3-0.8c0-0.5,0-0.5-0.5-0.5'+
                        'c-1.7,0.1-3.4,0.2-5,0c-1.5-0.2-3-0.4-4.5-0.9c-0.6-0.3-1.2-0.5-1.8-0.8c-0.5-0.2-1,1.1-1.2,1.5c-0.5,0.9-1.3,1.9-2.4,2'+
                        'c-0.6,0-1.1,0.1-1.7-0.1c-0.8-0.3-1.4-0.7-2.2-1.1c-1.3-0.7-2.5-1.6-3.6-2.6c-1.2-1-2.8-1.9-3.1-3.5c0.4-1.1,0.9-1.6,2.1-1.7'+
                        'c0.4,0,1.1-0.1,1.4-0.5c0.2-0.2,0.1-0.5,0.1-0.8c-0.1-0.5,0-0.8,0.2-1.3c0.5-1.2,2.3-0.3,3.1-0.2c0.4-0.3,0.6-0.9,0.9-1.3'+
                        'c0.4-0.6,0.7-0.6,0.6-1.4c-0.6-6.4,3-11.9,5.9-17.3c0.4-0.8,0.9-1.6,1.4-2.4c0.4-0.6,0.3-1.6,0.3-2.3c0-2-0.1-4-0.1-6'+
                        'c0-1.7,0.3-3,1.7-4.2C22.9,0.9,24.5,0,26.3,0z')
                        .attr('transform', 'translate(-30,-25)');
                    elm.append('path')
                        .style('fill', '#FFF')
                        .attr('d', 'M28.5,7.6c0.3,0.2,0.8,0.4,0.8,0.8c0,0.4,0,0.9-0.1,1.3'+
                        'c-0.1,0.3-0.2,0.7-0.5,1c-0.4,0.5-0.9,0.3-1.4,0.1c1.1-0.4,1.7-1.9,0.6-2.7c-0.5-0.4-1.1-0.3-1.5,0.3c-0.4,0.7-0.3,1.4,0.1,2.1'+
                        'c-0.2-0.2-0.6-0.2-0.7-0.5c-0.2-0.5-0.3-1.1-0.2-1.7c0.1-0.8,0.5-0.8,1.2-0.9C27.4,7.4,28,7.4,28.5,7.6z M22.4,7.6c0.2,0.1,0.5,0.1'+
                        ',0.6,0.3c0.2,0.4,0.2,0.8,0.3,1.3'+
                        'c0,0.3,0,0.6-0.1,1c-0.1,0-0.4,0.4-0.5,0.2c0.3-0.8,0-2.8-1.2-2.1c-1,0.6-0.6,2.3,0.3,2.7c-0.6,0.3-0.7,0.3-1-0.3'+
                        'c-0.2-0.6-0.4-1.1-0.3-1.7c0-0.6,0-0.8,0.6-1.2C21.6,7.6,21.9,7.6,22.4,7.6z M28.7,14.3c0.3,0.9,0.4,1.9,0.8,2.9c0.4,1,0.8,1.9,1.3,2.8'+
                        'c0.9,1.9,1.9,3.9,2.7,5.9c0.7,1.9,1.4,3.8,0.9,5.9c-0.2,0.9-0.4,2-0.9,2.8c-0.1,0.2-0.4,0.3-0.5,0.5c-0.3,0.4-0.4,1-0.4,1.5'+
                        'c-0.7-0.1-1.3-0.7-2.1-0.5c-0.8,0.2-0.8,1.6-0.9,2.2c-0.1,1.1-0.1,2.2-0.2,3.3c0,0.2,0,0.5,0,0.7c-0.3,0.2-0.6,0.3-0.9,0.5'+
                        'c-0.5,0.2-1,0.4-1.4,0.5c-2,0.5-4.4,0.4-6.3-0.1c-0.4-0.1-0.9-0.2-1.3-0.4c-0.6-0.2-1-0.3-0.8-1c0.2-1-0.7-2.3-1.1-3.2'+
                        'c-1-2.1-1.6-4.3-2.5-6.5c-0.2-0.5-0.4-0.9-0.5-1.4c-0.2-0.3,0.1-1,0.2-1.2c0.3-1.1,0.8-2.1,1.3-3.2c0.5-0.9,1.1-1.9,1.5-2.8'+
                        'c0.4-1,0.5-2.1,1-3.1c0.4-0.9,0.9-1.8,1.4-2.7c0.5-0.9,0.8-2,1.3-2.9c1.2,1.1,2.2,1.1,3.8,1.1c0.7-0.1,1.3-0.3,1.9-0.5'+
                        'C27.2,15,28.6,14.1,28.7,14.3z')
                        .attr('transform', 'translate(-30,-25)');
                    elm.append('path')
                        .style('fill', '#f5c055')
                        .attr('d', 'M24.7,9.6c0.9,0.3,1.5,0.9,2.4,1.3c0.9,0.4,2.1,0.2,2.5,1.2'+
                        'c0.4,1.1-0.7,1.6-1.5,2.1c-1,0.6-2,1-3.1,1.2c-1.2,0.1-2.3,0.2-3.3-0.5c-0.7-0.5-1.5-1.1-1.5-2.1c0.1-1.2,1.1-1.3,2-1.8'+
                        'C22.9,10.6,23.9,9.4,24.7,9.6z M13.7,34.6c0.6,0.2,0.9,1.1,1.2,1.7c0.4,1,0.8,2.1,1.1,3.1'+
                        'c0.6,1.9,1,3.9,1,6c0,1.7-1.3,2.9-3,2.9c-1,0-1.8-0.5-2.6-0.9c-1-0.5-1.8-1.1-2.7-1.7c-1.5-1.1-3.7-2.4-4.3-4.1'+
                        'C4,40.8,5,39.9,5.9,39.9c0.7-0.2,1.5,0,1.9-0.8c0.3-0.5-0.1-1.3,0.2-1.9c0.4-0.8,1.5-0.4,2.2-0.2c0.4,0.1,0.6,0.3,0.9-0.1'+
                        'c0.4-0.4,0.6-0.9,0.9-1.4C12.2,35.3,13.6,34.1,13.7,34.6z M31.6,36.3c0.3,0,0.6,0.3,0.9,0.3c0.1,0.5-0.1,0.9,0.1,1.4'+
                        'c0.2,0.9,1.2,1.5,2,1.7c2,0.7,2.6-1.1,3.4-2.6c0.5,0.2,0.4,1.1,0.6,1.6c0.3,0.7,1.1,0.7,1.8,0.5c1.5-0.2,3.9-0.1,3.2,2'+
                        'c-1,1.4-2,2.7-3.1,4c-0.6,0.5-1,1.2-1.6,1.7c-0.6,0.5-1.2,0.9-1.8,1.4c-1.4,1.1-2.7,1.8-4.5,1.3c-2-0.5-2.3-2.6-2.6-4.3'+
                        'c-0.4-1.9-0.4-3.9-0.3-5.9c0.1-0.9,0.2-1.7,0.3-2.6C30.1,36.2,31,35.8,31.6,36.3z')
                        .attr('transform', 'translate(-30,-25)');
                        break;
                case 'macos':
                    elm.append('path')
                        .style('fill', '#828487')
                        .style('stroke-width', 0.8)
                        .style('stroke', 'white')
                        .attr('d', 'M28.8,13.7c0.9-1.2,1.6-2.8,1.3-4.5c-1.5,0.1-3.2,1-4.2,2.3c-0.9,1.1-1.7,2.8-1.4,4.4'+
                        'C26.2,15.9,27.9,15,28.8,13.7z M33.2,21.7c0.4-1.3,1.4-2.4,2.7-3.2c-1.4-1.8-3.4-2.8-5.3-2.8c-2.5,0-3.5,1.2-5.2,1.2'+
                        'c-1.8,0-3.1-1.2-5.3-1.2c-2.1,0-4.3,1.3-5.8,3.5c-0.5,0.8-0.9,1.8-1.1,2.9c-0.5,3.1,0.3,7.2,2.7,10.9c1.2,1.8,2.7,3.8,4.7,3.8'+
                        'c1.8,0,2.3-1.2,4.8-1.2c2.4,0,2.9,1.2,4.7,1.2c2,0,3.6-2.2,4.8-4c0.8-1.3,1.1-1.9,1.8-3.3C33.5,28.2,32.2,24.6,33.2,21.7z')
                        .attr('transform', 'translate(-40,-40) scale(1.5)');
                        break;
                case 'windows':
                    elm.append('polygon')
                    .style('fill', '#fff')
                    .attr('points', '9,14 37,9 37,40 9,35 ')
                    .attr('transform', 'translate(-36,-32) scale(1.2)');

                    elm.append('polygon')
                    .style('fill', '#00AEEF')
                    .attr('points', '36.1,24.4 36.1,11.9 21.7,14 21.7,24.4 ')
                    .attr('transform', 'translate(-36,-32) scale(1.2)');

                    elm.append('polygon')
                    .style('fill', '#00AEEF')
                    .attr('points', '20.7,14.1 10.2,15.6 10.2,24.4 20.7,24.4 ')
                    .attr('transform', 'translate(-36,-32) scale(1.2)');

                    elm.append('polygon')
                    .style('fill', '#00AEEF')
                    .attr('points', '10.2,25.4 10.2,34.3 20.7,35.9 20.7,25.4 ')
                    .attr('transform', 'translate(-36,-32) scale(1.2)');

                    elm.append('polygon')
                    .style('fill', '#00AEEF')
                    .attr('points', '21.7,36 36.1,38.1 36.1,25.4 21.7,25.4 ')
                    .attr('transform', 'translate(-36,-32) scale(1.2)');
                    break;
                case 'windows vista/server 2008':
                    elm.append('path')
                        .style('fill', '#FFFFFF')
                        .attr('d', 'M42.5,12.8c-4,2.3-9.3,3-13.9-0.4c-5.2-4.1-10.4-2.6-13.6-0.9c0,0-6.7,23-7.5,25.9'+
                        'c3.3-2.1,9.2-3.1,13.7,0.3c5.2,4.2,10.8,2.6,13.8,0.9C35.2,38.6,41.8,15.7,42.5,12.8z')
                        .attr('transform', 'translate(-30,-25)');

                    elm.append('path')
                        .style('fill', '#D76D27')
                        .attr('d', 'M15.8,12.1c2.3-1,7.4-2.8,11.9,0.8c-0.6,1.8-2.2,8-3.1,10.8c-3.9-2.9-9-2.2-11.9-0.6'+
                        'C13.3,20.6,15.8,12.1,15.8,12.1z')
                        .attr('transform', 'translate(-30,-25)');

                    elm.append('path')
                        .style('fill', '#0891C9')
                        .attr('d', 'M12.2,24.7c2.3-1,7.4-2.8,11.9,0.8c-0.6,1.8-2.2,8-3.1,10.8c-3.9-2.9-9-2.2-11.9-0.6'+
                        'C9.7,33.2,12.2,24.7,12.2,24.7z')
                        .attr('transform', 'translate(-30,-25)');

                    elm.append('path')
                        .style('fill', '#88B33F')
                        .attr('d', 'M37.8,25.6c-2.3,1-7.4,2.8-11.9-0.8c0.6-1.8,2.2-8,3.1-10.8c3.9,2.9,9,2.2,11.9,0.6'+
                        'C40.3,17.1,37.8,25.6,37.8,25.6z')
                        .attr('transform', 'translate(-30,-25)');

                    elm.append('path')
                        .style('fill', '#FDCF33')
                        .attr('d', 'M34.4,37.9c-2.3,1-7.4,2.8-11.9-0.8c0.6-1.8,2.2-8,3.1-10.8c3.9,2.9,9,2.2,11.9,0.6'+
                        'C36.8,29.4,34.4,37.9,34.4,37.9z')
                        .attr('transform', 'translate(-30,-25)');
                    break;
                case 'windows 7/server 2008r2':
                    elm.append('path')
                        .style('fill', '#FFFFFF')
                        .attr('d', 'M42.5,12.8c-4,2.3-9.3,3-13.9-0.4c-5.2-4.1-10.4-2.6-13.6-0.9c0,0-6.7,23-7.5,25.9'+
                        'c3.3-2.1,9.2-3.1,13.7,0.3c5.2,4.2,10.8,2.6,13.8,0.9C35.2,38.6,41.8,15.7,42.5,12.8z')
                        .attr('transform', 'translate(-30,-25)');
                    elm.append('path')
                        .style('fill', '#D76D27')
                        .attr('d', 'M15.8,12.1c2.3-1,7.4-2.8,11.9,0.8c-0.6,1.8-2.2,8-3.1,10.8c-3.9-2.9-9-2.2-11.9-0.6'+
                        'C13.3,20.6,15.8,12.1,15.8,12.1z')
                        .attr('transform', 'translate(-30,-25)');
                    elm.append('path')
                        .style('fill', '#0891C9')
                        .attr('d', 'M12.2,24.7c2.3-1,7.4-2.8,11.9,0.8c-0.6,1.8-2.2,8-3.1,10.8c-3.9-2.9-9-2.2-11.9-0.6'+
                        'C9.7,33.2,12.2,24.7,12.2,24.7z')
                        .attr('transform', 'translate(-30,-25)');
                    elm.append('path')
                        .style('fill', '#88B33F')
                        .attr('d', 'M37.8,25.6c-2.3,1-7.4,2.8-11.9-0.8c0.6-1.8,2.2-8,3.1-10.8c3.9,2.9,9,2.2,11.9,0.6'+
                        'C40.3,17.1,37.8,25.6,37.8,25.6z')
                        .attr('transform', 'translate(-30,-25)');
                    elm.append('path')
                        .style('fill', '#FDCF33')
                        .attr('d', 'M34.4,37.9c-2.3,1-7.4,2.8-11.9-0.8c0.6-1.8,2.2-8,3.1-10.8c3.9,2.9,9,2.2,11.9,0.6'+
                        'C36.8,29.4,34.4,37.9,34.4,37.9z')
                        .attr('transform', 'translate(-30,-25)');
                    break;
                case 'windows 95':
                    elm.append('path')
                        .style('fill', '#000')
                        .attr('d', 'M41.3,12v25.1c-3.5-2.2-8.2-2.6-12.4-1.8c-1.5,0.4-3,0.7-4.3,1.3V11.7'+
                        'c4-1.7,9.2-2.4,13.5-1.1C39.3,11,40.3,11.4,41.3,12L41.3,12z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '24.2,15.4 20.9,16.7 20.9,13.5 24.2,11.9 24.2,15.4 24.2,15.4 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '10.1,14 8.3,14.6 8.3,13.3 10.1,12.7 10.1,14 10.1,14 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '20.4,15.8 17.3,17 17.3,14.5 20.4,13.2 20.4,15.8 20.4,15.8 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '13.9,16.6 13.9,14.6 16.7,13.5 16.7,15.4 13.9,16.6 13.9,16.6 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '13.3,15.1 11,15.9 11,14.5 13.3,13.5 13.3,15.1 13.3,15.1 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '24.2,18.8 20.9,20.3 20.9,17.2 24.2,15.9 24.2,18.8 24.2,18.8 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '24.2,22.3 20.9,23.8 20.9,20.7 24.2,19.3 24.2,22.3 24.2,22.3 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '20.9,27.3 20.9,24.3 24.2,22.7 24.2,25.9 20.9,27.3 20.9,27.3 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '10.1,24.8 8.3,25.4 8.3,24.1 10.1,23.5 10.1,24.8 10.1,24.8 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '20.4,26.5 17.3,27.7 17.3,25.1 20.4,24 20.4,26.5 20.4,26.5 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '16.7,26.2 14.1,27.3 13.9,27.3 13.9,25.4 16.7,24.3 16.7,26.2 16.7,26.2 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '13.3,25.9 11,26.7 11,25.2 13.3,24.3 13.3,25.9 13.3,25.9 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '20.9,30.9 20.9,27.7 24.2,26.4 24.2,29.4 20.9,30.9 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '24.2,33 20.9,34.4 20.9,31.4 24.2,29.9 24.2,33 24.2,33 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '24.2,36.8 20.9,38.1 20.9,34.9 24.2,33.5 24.2,36.8 24.2,36.8 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '10.1,35.5 8.3,36.2 8.3,35.1 10.1,34.3 10.1,35.5 10.1,35.5 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '20.4,37.2 17.3,38.4 17.3,35.9 20.4,34.6 20.4,37.2 20.4,37.2 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '13.9,38 13.9,36 16.7,34.9 16.7,36.8 13.9,38 13.9,38 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#000')
                        .attr('points', '13.3,36.5 11,37.3 11,35.9 13.3,34.9 13.3,36.5 13.3,36.5 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#118ACB')
                        .attr('points', '9.9,28.3 8.6,28.9 8.6,27.7 9.9,27.2 9.9,28.3 9.9,28.3 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#118ACB')
                        .attr('points', '20.2,30.1 17.6,31 17.6,28.8 20.2,27.8 20.2,30.1 20.2,30.1 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#118ACB')
                        .attr('points', '16.5,29.8 14.3,30.7 14.3,28.9 16.5,28 16.5,29.8 16.5,29.8 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#118ACB')
                        .attr('points', '13.1,29.4 11.2,30.1 11.2,28.8 13.1,28 13.1,29.4 13.1,29.4 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#118ACB')
                        .attr('points', '9.9,32 8.6,32.5 8.6,31.4 9.9,30.9 9.9,32 9.9,32 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#118ACB')
                        .attr('points', '20.2,31.4 20.2,33.5 17.6,34.6 17.6,32.3 20.2,31.4 20.2,31.4 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#118ACB')
                        .attr('points', '16.5,33.3 14.3,34.1 14.3,32.3 16.5,31.5 16.5,33.3 16.5,33.3 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#118ACB')
                        .attr('points', '13.1,32.8 11.4,33.6 11.2,32.3 13.1,31.5 13.1,32.8 13.1,32.8 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('path')
                        .style('fill', '#118ACB')
                        .attr('d', 'M24.6,33.3c1.8-0.6,3.6-1.1,5.5-1.4h0.2l-0.2-8c-1.9,0.3-3.7,1-5.5,1.8V33.3L24.6,33.3z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#F4793B')
                        .attr('points', '9.9,17.5 8.6,18.2 8.6,16.9 9.9,16.4 9.9,17.5 9.9,17.5 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#F4793B')
                        .attr('points', '20.2,19.3 17.6,20.3 17.6,18.2 20.2,17 20.2,19.3 20.2,19.3 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#F4793B')
                        .attr('points', '16.5,19 14.3,19.9 14.3,18.2 16.5,17.2 16.5,19 16.5,19 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#F4793B')
                        .attr('points', '13.1,18.6 11.2,19.3 11.2,18 13.1,17.2 13.1,18.6 13.1,18.6 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#F4793B')
                        .attr('points', '9.9,21.2 8.6,21.7 8.6,20.6 9.9,20.1 9.9,21.2 9.9,21.2 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#F4793B')
                        .attr('points', '20.2,22.7 17.6,23.8 17.6,21.5 20.2,20.6 20.2,22.7 20.2,22.7 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#F4793B')
                        .attr('points', '14.3,23.5 14.3,21.7 16.5,20.7 16.5,22.7 14.3,23.5 14.3,23.5 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#F4793B')
                        .attr('points', '13.1,22.2 11.2,23 11.2,21.5 13.1,20.9 13.1,22.2 13.1,22.2 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('polygon')
                        .style('fill', '#F4793B')
                        .attr('points', '13.1,22.2 11.2,23 11.2,21.5 13.1,20.9 13.1,22.2 13.1,22.2 ')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('path')
                        .style('fill', '#F4793B')
                        .attr('d', 'M24.6,22.8c1.8-0.7,3.6-1.3,5.5-1.4v-0.2v-7.7c-1.9,0.4-3.7,1-5.5,1.8V22.8L24.6,22.8z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('path')
                        .style('fill', '#6DC067')
                        .attr('d', 'M38.2,14.1v7.7c-1.8-0.6-3.7-0.8-5.6-0.8v-7.9 C34.5,13.1,36.5,13.3,38.2,14.1L38.2,14.1z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('path')
                        .style('fill', '#FFCB05')
                        .attr('d', 'M38.2,24.4v7.9c-1.8-0.5-3.7-0.7-5.6-0.6v-8 C34.5,23.5,36.5,23.7,38.2,24.4L38.2,24.4z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    break;
                case 'stealth':
                    elm.append('path')
                        .style('fill', '#828487')
                        .style('stroke-width', 0.8)
                        .style('stroke', 'white')
                        .attr('d', 'M34.7,15.7c-6.5,0.2-9.8-4.7-9.8-4.7c0,0-2.8,4.7-9.8,4.7c-0.6,7.8,1.4,13.2,4.3,18.3'+
                        'c0.2,0.3,2,4,5.6,4c3.7,0,5.3-3.7,5.7-4.3C33.9,28.1,35.3,21.8,34.7,15.7z M24.9,35.6c-1.8,0-2.8-1.5-4.7-5.1'+
                        'c-1.9-3.6-2.8-7.8-2.8-12.4c4.3-0.5,7.5-3.4,7.5-3.4L24.9,35.6z')
                        .attr('transform', 'translate(-40,-36) scale(1.5)');
                    elm.append('path')
                        .style('fill', '#ccc')
                        .attr('d', 'M24.9,35.6c-1.8,0-2.8-1.5-4.7-5.1c-1.9-3.6-2.8-7.8-2.8-12.4c4.3-0.5,7.5-3.4,7.5-3.4L24.9,35.6z')
                        .attr('transform', 'translate(-40,-36) scale(1.5)');
                        break;
                case 'stealth dropped':
                    elm.append('path')
                        .style('fill', '#828487')
                        .style('stroke-width', 0.8)
                        .style('stroke', 'white')
                        .attr('d', 'M34.7,15.7c-6.5,0.2-9.8-4.7-9.8-4.7c0,0-2.8,4.7-9.8,4.7c-0.6,7.8,1.4,13.2,4.3,18.3'+
                        'c0.2,0.3,2,4,5.6,4c3.7,0,5.3-3.7,5.7-4.3C33.9,28.1,35.3,21.8,34.7,15.7z M24.9,35.6c-1.8,0-2.8-1.5-4.7-5.1'+
                        'c-1.9-3.6-2.8-7.8-2.8-12.4c4.3-0.5,7.5-3.4,7.5-3.4L24.9,35.6z')
                        .attr('transform', 'translate(-40,-36) scale(1.5)');
                    elm.append('path')
                        .style('fill', '#ccc')
                        .attr('d', 'M24.9,35.6c-1.8,0-2.8-1.5-4.7-5.1c-1.9-3.6-2.8-7.8-2.8-12.4c4.3-0.5,7.5-3.4,7.5-3.4L24.9,35.6z')
                        .attr('transform', 'translate(-40,-36) scale(1.5)');
                        elm.append('polygon')
                        .style('fill', '#828487')
                        .attr('points', '42.4,36.5 39.7,33.7 36.8,36.7 33.8,33.7 31.1,36.5 34,39.4 31.1,42.4 33.8,45.1 36.8,42.2'+
                        ' 39.7,45.1 42.4,42.4 39.5,39.4 ')
                        .attr('transform', 'translate(-40,-36) scale(1.5)');
                        break;
                case 'connections':
                    elm.append('path')
                        .style('fill', '#828487')
                        .style('stroke-width', 0.8)
                        .style('stroke', 'white')
                        .attr('d', 'M37.8,35.3c-1.1,0-2.1,0.7-2.5,1.7h-9v-6.5'+
                        'c1.4-0.2,2.6-1.1,3.3-2.2c0.8,0.6,1.8,0.9,2.8,0.9c2.7,0,4.8-2.2,4.8-4.8c1.2-0.9,1.9-2.3,1.9-3.8c0-1.9-1.1-3.6-2.7-4.3'+
                        'c-0.3-2.3-2.3-4.1-4.8-4.1c-0.4,0-0.9,0.1-1.3,0.2c-0.8-1.4-2.4-2.3-4.1-2.3c-1.5,0-2.8,0.7-3.7,1.7c-0.8-0.5-1.7-0.8-2.6-0.8'+
                        'c-2.3,0-4.2,1.6-4.7,3.7C12.8,15,11,17,11,19.4c0,0.4,0.1,0.8,0.2,1.2c-0.3,0.7-0.5,1.4-0.5,2.2c0,2.5,1.9,4.5,4.3,4.8'+
                        'c0.8,1.4,2.4,2.3,4.1,2.3c1.1,0,2-0.3,2.8-0.9c0.5,0.5,1.2,0.9,1.9,1.2V37h-9.1c-0.4-1-1.4-1.7-2.5-1.7c-1.5,0-2.8,1.2-2.8,2.8'+
                        's1.2,2.8,2.8,2.8c1.2,0,2.2-0.8,2.6-1.8h20.4c0.4,1.1,1.4,1.8,2.6,1.8c1.5,0,2.8-1.2,2.8-2.8S39.3,35.3,37.8,35.3z')
                        .attr('transform', 'translate(-40,-36) scale(1.5)');
                        break;
                case 'connections dropped':
                    elm.append('path')
                        .style('fill', '#828487')
                        .style('stroke-width', 0.8)
                        .style('stroke', 'white')
                        .attr('d', 'M37.8,35.3c-1.1,0-2.1,0.7-2.5,1.7h-9v-6.5'+
                        'c1.4-0.2,2.6-1.1,3.3-2.2c0.8,0.6,1.8,0.9,2.8,0.9c2.7,0,4.8-2.2,4.8-4.8c1.2-0.9,1.9-2.3,1.9-3.8c0-1.9-1.1-3.6-2.7-4.3'+
                        'c-0.3-2.3-2.3-4.1-4.8-4.1c-0.4,0-0.9,0.1-1.3,0.2c-0.8-1.4-2.4-2.3-4.1-2.3c-1.5,0-2.8,0.7-3.7,1.7c-0.8-0.5-1.7-0.8-2.6-0.8'+
                        'c-2.3,0-4.2,1.6-4.7,3.7C12.8,15,11,17,11,19.4c0,0.4,0.1,0.8,0.2,1.2c-0.3,0.7-0.5,1.4-0.5,2.2c0,2.5,1.9,4.5,4.3,4.8'+
                        'c0.8,1.4,2.4,2.3,4.1,2.3c1.1,0,2-0.3,2.8-0.9c0.5,0.5,1.2,0.9,1.9,1.2V37h-9.1c-0.4-1-1.4-1.7-2.5-1.7c-1.5,0-2.8,1.2-2.8,2.8'+
                        's1.2,2.8,2.8,2.8c1.2,0,2.2-0.8,2.6-1.8h20.4c0.4,1.1,1.4,1.8,2.6,1.8c1.5,0,2.8-1.2,2.8-2.8S39.3,35.3,37.8,35.3z')
                        .attr('transform', 'translate(-40,-36) scale(1.5)');
                        elm.append('polygon')
                        .style('fill', '#828487')
                        .attr('points', '42.4,36.5 39.7,33.7 36.8,36.7 33.8,33.7 31.1,36.5 34,39.4 31.1,42.4 33.8,45.1 36.8,42.2'+
                        ' 39.7,45.1 42.4,42.4 39.5,39.4 ')
                        .attr('transform', 'translate(-40,-38) scale(1.5)');
                        break;
                case 'network connections':
                    elm.append('path')
                        .style('fill', '#333333')
                        .style('stroke-width', 0.8)
                        .style('stroke', 'white')
                        .attr('d', 'M37.8,35.3c-1.1,0-2.1,0.7-2.5,1.7h-9v-6.5'+
                        'c1.4-0.2,2.6-1.1,3.3-2.2c0.8,0.6,1.8,0.9,2.8,0.9c2.7,0,4.8-2.2,4.8-4.8c1.2-0.9,1.9-2.3,1.9-3.8c0-1.9-1.1-3.6-2.7-4.3'+
                        'c-0.3-2.3-2.3-4.1-4.8-4.1c-0.4,0-0.9,0.1-1.3,0.2c-0.8-1.4-2.4-2.3-4.1-2.3c-1.5,0-2.8,0.7-3.7,1.7c-0.8-0.5-1.7-0.8-2.6-0.8'+
                        'c-2.3,0-4.2,1.6-4.7,3.7C12.8,15,11,17,11,19.4c0,0.4,0.1,0.8,0.2,1.2c-0.3,0.7-0.5,1.4-0.5,2.2c0,2.5,1.9,4.5,4.3,4.8'+
                        'c0.8,1.4,2.4,2.3,4.1,2.3c1.1,0,2-0.3,2.8-0.9c0.5,0.5,1.2,0.9,1.9,1.2V37h-9.1c-0.4-1-1.4-1.7-2.5-1.7c-1.5,0-2.8,1.2-2.8,2.8'+
                        's1.2,2.8,2.8,2.8c1.2,0,2.2-0.8,2.6-1.8h20.4c0.4,1.1,1.4,1.8,2.6,1.8c1.5,0,2.8-1.2,2.8-2.8S39.3,35.3,37.8,35.3z')
                        .attr('transform', 'translate(-40,-36) scale(1.5)');
                        break;
                case 'dns':
                    elm.append('path')
                        .style('fill', '#333333')
                        .attr('d', 'M43.1,24.5c0-2.4-1.4-4.4-3.4-5.4c-0.4-2.9-2.9-5.1-5.9-5.1'+
                        'c-0.6,0-1.1,0.1-1.6,0.2c-1-1.7-2.9-2.8-5.1-2.8c-1.8,0-3.5,0.8-4.6,2.2c-0.9-0.6-2.1-1-3.3-1c-2.8,0-5.2,1.9-5.8,4.6'+
                        'c-2.9,0.4-5.1,2.9-5.1,5.9c0,0.5,0.1,1,0.2,1.5C8.3,25.4,8,26.4,8,27.4c0,3.1,2.4,5.6,5.4,5.9c1,1.7,2.9,2.9,5.1,2.9'+
                        'c1.3,0,2.5-0.4,3.5-1.2c1.1,1.1,2.6,1.9,4.3,1.9c2.1,0,4-1.1,5-2.8c1,0.7,2.2,1.1,3.5,1.1c3.3,0,5.9-2.7,5.9-5.9'+
                        'C42.2,28.2,43.1,26.4,43.1,24.5z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('path')
                        .style('fill', '#9D9D9D')
                        .attr('d', 'M12.3,20h3.2c1.3,0,3.1,0.1,4.3,1.7c0.7,0.9,1,2,1,3.3c0,2.8-1.5,5.1-5.2,5.1h-3.3V20z M14.4,28.3'+
                        'h1.4c2.2,0,3-1.4,3-3.2c0-0.8-0.2-1.6-0.7-2.3c-0.4-0.5-1.1-1-2.3-1h-1.4V28.3z '+
                        'M28.7,26.9l0-7h1.9V30h-1.8l-4.6-7l0,7h-1.9V20h1.8L28.7,26.9z'+
                        'M34,26.9c0.1,1.4,1,1.6,1.4,1.6c0.8,0,1.4-0.6,1.4-1.3c0-0.9-0.7-1.1-2.1-1.6'+
                        'c-0.8-0.3-2.5-0.9-2.5-2.8c0-1.9,1.7-3,3.3-3c1.3,0,3.1,0.7,3.2,2.9h-2c-0.1-0.5-0.3-1.2-1.3-1.2c-0.7,0-1.2,0.5-1.2,1.1'+
                        'c0,0.7,0.5,0.9,2.2,1.6c1.5,0.7,2.4,1.4,2.4,2.8c0,1.6-1,3.1-3.4,3.1c-2.3,0-3.5-1.4-3.5-3.3H34z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                        break;
                case 'ssl':
                    elm.append('path')
                        .style('fill', '#333333')
                        .attr('d', 'M43.1,24.5c0-2.4-1.4-4.4-3.4-5.4c-0.4-2.9-2.9-5.1-5.9-5.1'+
                        'c-0.6,0-1.1,0.1-1.6,0.2c-1-1.7-2.9-2.8-5.1-2.8c-1.8,0-3.5,0.8-4.6,2.2c-0.9-0.6-2.1-1-3.3-1c-2.8,0-5.2,1.9-5.8,4.6'+
                        'c-2.9,0.4-5.1,2.9-5.1,5.9c0,0.5,0.1,1,0.2,1.5C8.3,25.4,8,26.4,8,27.4c0,3.1,2.4,5.6,5.4,5.9c1,1.7,2.9,2.9,5.1,2.9'+
                        'c1.3,0,2.5-0.4,3.5-1.2c1.1,1.1,2.6,1.9,4.3,1.9c2.1,0,4-1.1,5-2.8c1,0.7,2.2,1.1,3.5,1.1c3.3,0,5.9-2.7,5.9-5.9'+
                        'C42.2,28.2,43.1,26.4,43.1,24.5z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('path')
                        .style('fill', '#9D9D9D')
                        .attr('d', 'M16.5,27.3c0.1,1.4,1,1.7,1.5,1.7c0.8,0,1.4-0.6,1.4-1.4c0-0.9-0.7-1.1-2.2-1.7'+
                        'c-0.8-0.3-2.6-0.9-2.6-2.9c0-2,1.8-3.1,3.4-3.1c1.4,0,3.2,0.7,3.3,3h-2.1c-0.1-0.5-0.3-1.3-1.3-1.3c-0.7,0-1.3,0.5-1.3,1.2'+
                        'c0,0.8,0.5,1,2.3,1.7c1.6,0.7,2.5,1.4,2.5,2.9c0,1.7-1,3.2-3.5,3.2c-2.4,0-3.6-1.4-3.6-3.4H16.5z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('path')
                        .style('fill', '#9D9D9D')
                        .attr('d', 'M24.3,27.3c0.1,1.4,1,1.7,1.5,1.7c0.8,0,1.4-0.6,1.4-1.4c0-0.9-0.7-1.1-2.2-1.7'+
                        'c-0.8-0.3-2.6-0.9-2.6-2.9c0-2,1.8-3.1,3.4-3.1c1.4,0,3.2,0.7,3.3,3h-2.1c-0.1-0.5-0.3-1.3-1.3-1.3c-0.7,0-1.3,0.5-1.3,1.2'+
                        'c0,0.8,0.5,1,2.3,1.7c1.6,0.7,2.5,1.4,2.5,2.9c0,1.7-1,3.2-3.5,3.2c-2.4,0-3.6-1.4-3.6-3.4H24.3z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('path')
                        .style('fill', '#9D9D9D')
                        .attr('d', 'M30.7,20.1h2.1v8.5h3.4v1.8h-5.5V20.1z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                        break;
                case 'ssh':
                    elm.append('path')
                        .style('fill', '#333333')
                        .attr('d', 'M43.1,24.5c0-2.4-1.4-4.4-3.4-5.4c-0.4-2.9-2.9-5.1-5.9-5.1'+
                        'c-0.6,0-1.1,0.1-1.6,0.2c-1-1.7-2.9-2.8-5.1-2.8c-1.8,0-3.5,0.8-4.6,2.2c-0.9-0.6-2.1-1-3.3-1c-2.8,0-5.2,1.9-5.8,4.6'+
                        'c-2.9,0.4-5.1,2.9-5.1,5.9c0,0.5,0.1,1,0.2,1.5C8.3,25.4,8,26.4,8,27.4c0,3.1,2.4,5.6,5.4,5.9c1,1.7,2.9,2.9,5.1,2.9'+
                        'c1.3,0,2.5-0.4,3.5-1.2c1.1,1.1,2.6,1.9,4.3,1.9c2.1,0,4-1.1,5-2.8c1,0.7,2.2,1.1,3.5,1.1c3.3,0,5.9-2.7,5.9-5.9'+
                        'C42.2,28.2,43.1,26.4,43.1,24.5z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('path')
                        .style('fill', '#9D9D9D')
                        .attr('d', 'M14.5,27.3c0.1,1.4,1,1.7,1.5,1.7c0.8,0,1.4-0.6,1.4-1.4c0-0.9-0.7-1.1-2.2-1.7'+
                        'c-0.8-0.3-2.6-0.9-2.6-2.9c0-2,1.8-3.1,3.4-3.1c1.4,0,3.2,0.7,3.3,3h-2.1c-0.1-0.5-0.3-1.3-1.3-1.3c-0.7,0-1.3,0.5-1.3,1.2'+
                        'c0,0.8,0.5,1,2.3,1.7c1.6,0.7,2.5,1.4,2.5,2.9c0,1.7-1,3.2-3.5,3.2c-2.4,0-3.6-1.4-3.6-3.4H14.5z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('path')
                        .style('fill', '#9D9D9D')
                        .attr('d', 'M22.5,27.3c0.1,1.4,1,1.7,1.5,1.7c0.8,0,1.4-0.6,1.4-1.4c0-0.9-0.7-1.1-2.2-1.7'+
                        'c-0.8-0.3-2.6-0.9-2.6-2.9c0-2,1.8-3.1,3.4-3.1c1.4,0,3.2,0.7,3.3,3h-2.1c-0.1-0.5-0.3-1.3-1.3-1.3c-0.7,0-1.3,0.5-1.3,1.2'+
                        'c0,0.8,0.5,1,2.3,1.7c1.6,0.7,2.5,1.4,2.5,2.9c0,1.7-1,3.2-3.5,3.2c-2.4,0-3.6-1.4-3.6-3.4H22.5z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('path')
                        .style('fill', '#9D9D9D')
                        .attr('d', 'M28.9,30.5V20.1H31v4.2h4v-4.2h2.1v10.4H35v-4.4h-4v4.4H28.9z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                        break;
                case 'irc':
                    elm.append('path')
                        .style('fill', '#333333')
                        .attr('d', 'M43.1,24.5c0-2.4-1.4-4.4-3.4-5.4c-0.4-2.9-2.9-5.1-5.9-5.1'+
                        'c-0.6,0-1.1,0.1-1.6,0.2c-1-1.7-2.9-2.8-5.1-2.8c-1.8,0-3.5,0.8-4.6,2.2c-0.9-0.6-2.1-1-3.3-1c-2.8,0-5.2,1.9-5.8,4.6'+
                        'c-2.9,0.4-5.1,2.9-5.1,5.9c0,0.5,0.1,1,0.2,1.5C8.3,25.4,8,26.4,8,27.4c0,3.1,2.4,5.6,5.4,5.9c1,1.7,2.9,2.9,5.1,2.9'+
                        'c1.3,0,2.5-0.4,3.5-1.2c1.1,1.1,2.6,1.9,4.3,1.9c2.1,0,4-1.1,5-2.8c1,0.7,2.2,1.1,3.5,1.1c3.3,0,5.9-2.7,5.9-5.9'+
                        'C42.2,28.2,43.1,26.4,43.1,24.5z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('path')
                        .style('fill', '#9D9D9D')
                        .attr('d', 'M14,20.1h2.1v10.4H14V20.1z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('path')
                        .style('fill', '#9D9D9D')
                        .attr('d', 'M18.1,20.1h3.1c1.6,0,2.5,0.3,3.1,0.7c0.9,0.6,1.3,1.7,1.3,2.8c0,0.8-0.2,1.4-0.6,1.9'+
                        'c-0.4,0.7-1,1-1.7,1.1l2.3,3.8h-2.2l-2.8-4.8h0.4c0.7,0,1.4,0,1.9-0.4c0.4-0.3,0.7-0.9,0.7-1.5s-0.3-1.2-0.8-1.5'+
                        'c-0.4-0.2-0.9-0.3-1.5-0.3h-1.2v8.5h-2.1V20.1z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                    elm.append('path')
                        .style('fill', '#9D9D9D')
                        .attr('d', 'M37.2,27c-0.6,2.1-2.6,3.7-5.1,3.7c-3.2,0-5.4-2.5-5.4-5.4c0-2.8,2.1-5.4,5.4-5.4'+
                        'c3,0,4.7,2.2,5.1,3.7H35c-0.3-0.7-1.2-1.9-2.9-1.9c-2,0-3.3,1.7-3.3,3.5c0,1.9,1.4,3.6,3.3,3.6c1.8,0,2.7-1.5,2.9-1.8H37.2z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                        break;
                case 'http':
                    elm.append('circle')
                        .attr('r', 18)
                        .attr('cx', -6)
                        .attr('cy', -2)
                        .style('fill', 'white');
                    elm.append('path')
                        .style('fill', '#333333')
                        .attr('d', 'M24,15.9v-4.4c-1,0.1-3.1,0.5-4.4,1.1c-0.5,1.3-1,2.6-1.3,4C20.1,16.2,22,16,24,15.9z'+
                        'M16.4,14.6c-1.1,0.9-2,2-2.8,3.2c0.7-0.2,1.4-0.5,2.1-0.7C15.9,16.3,16.1,15.5,16.4,14.6z'+
                        'M18.5,34c0.4,1.2,0.8,2.4,1.3,3.5c1.3,0.5,3.2,0.9,4.2,1v-3.9C22,34.5,20.2,34.3,18.5,34z'+
                        'M15.9,33.4c-0.6-0.2-1.2-0.4-1.9-0.6c0.7,1,1.6,1.9,2.5,2.7C16.3,34.8,16.1,34.1,15.9,33.4z'+
                        'M26,11.5V16c2,0.1,3.6,0.3,5.4,0.6c-0.4-1.4-0.9-2.8-1.4-4.1C28.7,11.9,28,11.6,26,11.5z'+
                        'M34,17.1c0.9,0.2,1.8,0.5,2.7,0.8c-0.9-1.5-2.1-2.8-3.5-3.8C33.5,15.2,33.7,16.1,34,17.1z'+
                        'M26,34.6v3.9c2-0.1,2.6-0.4,3.8-0.8c0.5-1.2,0.9-2.4,1.3-3.6C29.4,34.3,28,34.5,26,34.6z'+
                        'M33,36c1.2-0.9,2.3-2,3.2-3.2c-0.8,0.3-1.6,0.5-2.4,0.7C33.5,34.3,33.3,35.1,33,36z'+
                        'M38.5,25c0-2-0.2-2.6-0.5-3.8c-1.1-0.5-2.3-0.8-3.5-1.2c0.2,1.6,0.4,2.9,0.4,4.9H38.5z'+
                        'M34.8,27c-0.1,1-0.2,2.7-0.5,4c1.2-0.4,2.3-0.7,3.4-1.2c0.3-0.9,0.6-1.8,0.7-2.8H34.8z'+
                        'M32.6,25c0-2-0.3-3.9-0.7-5.7c-1.9-0.4-3.9-0.9-5.9-1V25H32.6z'+
                        'M26,27v5.3c2-0.1,3.9-0.2,5.7-0.6c0.3-1.6,0.7-2.7,0.8-4.7H26z'+
                        'M24,25v-6.8c-2,0.1-4.3,0.6-6.3,1.1c-0.3,1.8-0.5,3.7-0.5,5.7H24z'+
                        'M17.3,27c0.1,2,0.3,3.1,0.6,4.6c1.9,0.4,4.1,0.6,6.1,0.6V27H17.3z'+
                        'M14.9,25c0-2,0.1-3.5,0.4-5c-1,0.3-2.1,0.8-3.1,1.3c-0.4,1.2-0.6,1.8-0.7,3.8H14.9z'+
                        'M11.6,27c0.1,1,0.4,1.9,0.8,2.9c1,0.4,2,0.8,3,1.2c-0.2-1.3-0.4-3-0.5-4H11.6z')
                        .attr('transform', 'translate(-36,-32) scale(1.2)');
                        break;
                case 'files':
                        elm.append('polygon')
                        .style('fill', '#828487')
                        .attr('points', '24.2,15 12,15 12,36 37.8,36 37.8,17.9 27.2,17.9 ')
                        .attr('transform', 'translate(-38,-34) scale(1.3)');
                        break;
                case 'ftp':
                    elm.append('polygon')
                        .style('fill', '#828487')
                        .attr('points', '24.2,15 12,15 12,36 37.8,36 37.8,17.9 27.2,17.9 ')
                        .attr('transform', 'translate(-40,-38) scale(1.3)');
                    elm.append('path')
                        .style('fill', '#333333')
                        .attr('d', 'M23,27.7l-3-1.9V32h-2v-6.2l-3,1.9v-2.8l4-2.6l4,2.6V27.7z'+
                        'M34,29.1l-4,2.6l-4-2.6v-2.8l3,1.9V23h2v5.1l3-1.9V29.1z')
                        .attr('transform', 'translate(-40,-38) scale(1.3)');
                        break;
                default:
                    elm.append("rect")
                        .attr('x', -6)
                        .attr('y', -6)
                        .attr('height', 12)
                        .attr('width', 12)
                        .style('fill-opacity', 1)
                        .attr("id", function(d) { return d.value; })
                        .style("fill", function(d) { return d._children ? "red" : "#000"; });
                        break;
            }
        }
        return treeIcon;
    }
]);


angular.module('mean.pages').factory('appIcon', [
    function() {
        var appIcon = function(app) {
            // make input lowercase
            var app = app.toLowerCase();
            // create an empty div
            var div = $('<div></div>');
            // split app into array
            // var match = app.match(/(\w+)\/(.*)/);
            // append base svg
            var elm = d3.select(div[0])
                .append('svg')
                .attr('x',0)
                .attr('y',0)
                .attr('width','42.795px')
                .attr('height','42.795px')
                .attr('viewBox','0 0 42.795 42.795')
                .attr('enable-background','new 0 0 42.795 42.795')
                .attr('xml:space','preserve');
            var tip = d3.tip()
                .attr('class', 't-tip')
                .offset([-30, 0])
                .html(function(d) {
                    return app;
                });
            elm.call(tip);
            elm
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            var em = elm.append('g');
            var bg = em.append('circle').attr('cx', 21.398).attr('cy', 21.398).attr('r', 21.398);

            if (!app) return appIcon;
            // background color generated here
            bg.style('fill', '#dddddd');
            em
                .append('path')
                .style('fill', '#c2c2c2')
                .attr('d', 'M21.378,42.795c10.232,0,18.773-7.187,20.884-16.785h-0.793v-1.613h-1.748v5.251h-1.746v-2.003h-1.748v4.3'+
                'h-1.746v1.411h-1.748v-1.411h-1.746v4.371h-1.748v-1.589h-1.746v-4.411h-1.748v1.7h-1.746v-3.997h-1.748v2.749h-1.747v3.613h-1.747'+
                'v1.297H17.01v4.612h-1.747V37.04h-1.747v-3.996h-1.747v-1.301h-1.747v4.781H8.274v-2.702H6.527v-3.388H4.78v-3.489H3.033v1.411'+
                'H1.286V28.7C4.274,36.917,12.129,42.795,21.378,42.795z');
            // switch between text
            switch(app) {
                case 'http':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 8 22)')
                        .style('fill', '#f2bc5d')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 14)
                        .text('http');
                    return div;
                case 'http_connect':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 8 22)')
                        .style('fill', '#f2bc5d')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 14)
                        .text('http');
                    return div;
                case 'ssl':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 11 22)')
                        .style('fill', '#D97373')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 14)
                        .text('SSL');
                    return div;
                case 'ssl_no_cert':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 8 22)')
                        .style('fill', '#D97373')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 14)
                        .text('SSL*');
                    return div;
                case 'unknown':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 16 22)')
                        .style('fill', '#D8464A')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 20)
                        .text('?');
                    return div;
                case 'google':
                    em
                        .append('path')
                        .style('fill', '#0C75BC')
                        .attr('d', 'M10.785,22.308l-1.771,0.409c-0.719,0.111-1.363,0.21-2.045,0.21'+
                        'c-3.42,0-4.721-2.515-4.721-4.485c0-2.403,1.847-4.634,5.006-4.634c0.67,0,1.314,0.1,1.896,0.261'+
                        'c0.929,0.26,1.363,0.582,1.635,0.769l-1.028,0.979l-0.433,0.099l0.309-0.495c-0.421-0.409-1.189-1.164-2.65-1.164'+
                        'c-1.959,0-3.434,1.486-3.434,3.654c0,2.329,1.686,4.522,4.387,4.522c0.793,0,1.202-0.161,1.574-0.31v-1.995l-1.871,0.099'+
                        'l0.99-0.532h2.627l-0.321,0.311c-0.087,0.073-0.1,0.099-0.124,0.197c-0.013,0.111-0.025,0.471-0.025,0.595V22.308L10.785,22.308z');
                    em
                        .append('path')
                        .style('fill', '#EF4035')
                        .attr('d', 'M14.851,22.769c-2.102,0-3.226-1.639-3.226-3.119'+
                        'c0-1.73,1.415-3.211,3.424-3.211c1.942,0,3.158,1.52,3.158,3.119C18.207,21.116,17.005,22.769,14.851,22.769L14.851,22.769z'+
                        'M16.502,21.698c0.318-0.423,0.396-0.951,0.396-1.467c0-1.163-0.555-3.383-2.193-3.383c-0.436,0-0.872,0.172-1.189,0.449'+
                        'C13,17.76,12.908,18.341,12.908,18.91c0,1.308,0.646,3.462,2.246,3.462C15.67,22.372,16.199,22.121,16.502,21.698L16.502,21.698z');
                    em
                        .append('path')
                        .style('fill', '#F9A600')
                        .attr('d', 'M21.881,22.769c-2.101,0-3.225-1.639-3.225-3.119'+
                        'c0-1.73,1.415-3.211,3.424-3.211c1.943,0,3.158,1.52,3.158,3.119C25.239,21.116,24.036,22.769,21.881,22.769L21.881,22.769z'+
                        ' M23.534,21.698c0.316-0.423,0.396-0.951,0.396-1.467c0-1.163-0.555-3.383-2.193-3.383c-0.436,0-0.874,0.172-1.19,0.449'+
                        'c-0.516,0.462-0.607,1.043-0.607,1.612c0,1.308,0.646,3.462,2.247,3.462C22.702,22.372,23.229,22.121,23.534,21.698L23.534,21.698z');
                    em
                        .append('path')
                        .style('fill', '#0C75BC')
                        .attr('d', 'M30.077,17.086c0.303,0.251,0.937,0.779,0.937,1.784'+
                        'c0,0.979-0.554,1.44-1.108,1.877c-0.172,0.171-0.371,0.357-0.371,0.647c0,0.291,0.199,0.449,0.344,0.568l0.477,0.37'+
                        'c0.581,0.488,1.108,0.938,1.108,1.85c0,1.243-1.202,2.498-3.476,2.498c-1.916,0-2.84-0.912-2.84-1.89'+
                        'c0-0.477,0.236-1.149,1.018-1.613c0.818-0.501,1.93-0.567,2.523-0.607c-0.186-0.237-0.396-0.488-0.396-0.898'+
                        'c0-0.225,0.066-0.356,0.133-0.516c-0.146,0.014-0.291,0.027-0.424,0.027c-1.4,0-2.193-1.045-2.193-2.075'+
                        'c0-0.608,0.277-1.282,0.846-1.771c0.754-0.621,1.652-0.727,2.365-0.727h2.722l-0.846,0.476H30.077L30.077,17.086z M29.137,22.954'+
                        'c-0.105-0.014-0.172-0.014-0.303-0.014c-0.119,0-0.834,0.026-1.389,0.211c-0.291,0.106-1.137,0.424-1.137,1.362'+
                        's0.912,1.612,2.326,1.612c1.27,0,1.942-0.608,1.942-1.428C30.578,24.024,30.143,23.667,29.137,22.954L29.137,22.954z'+
                        ' M29.522,20.443c0.303-0.305,0.33-0.728,0.33-0.966c0-0.951-0.568-2.432-1.666-2.432c-0.344,0-0.713,0.172-0.926,0.437'+
                        'c-0.225,0.277-0.291,0.635-0.291,0.979c0,0.885,0.516,2.352,1.652,2.352C28.952,20.812,29.309,20.654,29.522,20.443L29.522,20.443z');
                    em
                        .append('path')
                        .style('fill', '#2FB357')
                        .attr('d', 'M34.41,22.597h-2.338c0.303-0.396,0.355-0.436,0.355-0.699v-2.155'+
                        'c0-1.03,0.014-2.498,0.053-3.872c0.014-0.674,0.066-1.52,0.08-2.128h-1.031l0.992-0.476h1.889'+
                        'c-0.408,0.238-0.541,0.317-0.594,0.779c-0.105,1.018-0.119,2.63-0.119,4.507v3.053c0,0.516,0.092,0.596,0.529,0.635'+
                        'c0.225,0.026,0.449,0.04,0.674,0.066L34.41,22.597L34.41,22.597z');
                    em
                        .append('path')
                        .style('fill', '#EF4035')
                        .attr('d', 'M39.552,22.307c-0.146,0.079-0.291,0.171-0.438,0.238'+
                        'c-0.436,0.197-0.885,0.25-1.281,0.25c-0.424,0-1.084-0.026-1.758-0.515c-0.938-0.661-1.348-1.798-1.348-2.789'+
                        'c0-2.049,1.664-3.053,3.025-3.053c0.477,0,0.965,0.119,1.361,0.37c0.662,0.436,0.834,1.004,0.926,1.309l-3.105,1.255l-1.018,0.079'+
                        'c0.33,1.679,1.467,2.657,2.723,2.657c0.674,0,1.162-0.238,1.611-0.463L39.552,22.307L39.552,22.307z M38.31,18.368'+
                        'c0.25-0.093,0.383-0.172,0.383-0.357c0-0.528-0.596-1.137-1.309-1.137c-0.529,0-1.52,0.41-1.52,1.838'+
                        'c0,0.224,0.025,0.462,0.039,0.7L38.31,18.368L38.31,18.368z');
                    return div;
                case 'bittorrent':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 8 20)')
                        .style('fill', '#F68D55')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 13)
                        .text('BiTor');
                    return div;
                case 'apple':
                    em
                        .append('path')
                        .style('fill', '#727272')
                        .attr('d', 'M28.5,13.481c-0.915-1.139-2.196-1.798-3.407-1.798'+
                        'c-1.602,0-2.278,0.76-3.389,0.76c-1.145,0-2.016-0.759-3.401-0.759c-1.36,0-2.807,0.826-3.724,2.238'+
                        'c-1.291,1.987-1.072,5.725,1.021,8.909c0.748,1.139,1.748,2.419,3.055,2.431c1.162,0.011,1.49-0.741,3.066-0.749'+
                        'c1.576-0.01,1.874,0.758,3.035,0.747c1.308-0.013,2.361-1.431,3.11-2.57c0.536-0.815,0.735-1.228,1.151-2.15'+
                        'C25.992,19.397,25.505,15.122,28.5,13.481z');
                    em
                        .append('path')
                        .style('fill', '#727272')
                        .attr('d', 'M23.878,10.41c0.582-0.747,1.023-1.801,0.863-2.878'+
                        'c-0.951,0.065-2.062,0.67-2.711,1.458c-0.589,0.715-1.075,1.776-0.886,2.808C22.182,11.83,23.255,11.21,23.878,10.41z');
                    return div;
                case 'facebook':
                    em
                        .append('path')
                        .style('fill', '#3C5A98')
                        .attr('d', 'M30.697,24.701V8.094c0-0.469-0.379-0.85-0.848-0.85h-1.514H14.459h-1.514'+
                        'c-0.467,0-0.846,0.379-0.848,0.846v15.098v1.516c0,0.467,0.38,0.848,0.848,0.848h9.388v-7.35H19.91v-2.533h2.423v-2.75'+
                        'c0-1.646,1.494-2.754,2.699-2.754h2.713v2.305h-1.251c-0.617,0-1.439,0.5-1.439,1.115v2.084H27.5v2.533h-2.445v7.35h3.281h1.514'+
                        'C30.318,25.551,30.697,25.17,30.697,24.701z');
                    return div;
                case 'dns':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 7 22)')
                        .style('fill', '#A0BB71')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 14)
                        .text('DNS');
                    return div;
                case 'llmnr':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 4.7 22)')
                        .style('fill', '#8C8C8C')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 11)
                        .text('LLMNR');
                    return div;
                case 'youtube':
                    em
                        .append('path')
                        .style('fill', '#EB2629')
                        .attr('d', 'M38.016,21.517c0,1.798-1.458,3.257-3.258,3.257H21.867c-1.799,0-3.258-1.459-3.258-3.257v-6.292'+
                        'c0-1.801,1.459-3.259,3.258-3.259h12.891c1.8,0,3.258,1.458,3.258,3.259V21.517z');
                    em
                        .append('path')
                        .style('fill', '#FFFFFF')
                        .attr('d', 'M21.848,22.183v-6.802h-1.346v-1.343h3.856v1.343h-1.346v6.802H21.848z');
                    em
                        .append('path')
                        .style('fill', '#FFFFFF')
                        .attr('d', 'M28.004,16.065v6.118h-1.069v-0.609c-0.225,0.514-0.555,0.771-0.99,0.771'+
                        'c-0.698,0-1.048-0.491-1.048-1.476v-4.804h1.052v3.995c0,0.33,0.019,0.564,0.055,0.705c0.068,0.244,0.203,0.366,0.406,0.366'+
                        'c0.218,0,0.364-0.132,0.438-0.397c0.04-0.152,0.061-0.404,0.061-0.761v-3.907H28.004z');
                    em
                        .append('path')
                        .style('fill', '#FFFFFF')
                        .attr('d', 'M28.942,22.183v-8.146h1.091v2.545c0.181-0.454,0.49-0.681,0.924-0.681c0.553,0,0.917,0.395,1.087,1.184'+
                        'c0.088,0.399,0.13,1.087,0.13,2.066c0,0.952-0.047,1.632-0.141,2.041c-0.18,0.767-0.547,1.152-1.1,1.152'+
                        'c-0.461,0-0.779-0.268-0.955-0.8v0.639H28.942z M30.569,17.09c-0.297,0-0.481,0.315-0.549,0.941'+
                        'C30.008,18.159,30,18.607,30,19.379c0,0.597,0.013,0.968,0.037,1.116c0.071,0.456,0.248,0.683,0.532,0.683'+
                        'c0.266,0,0.427-0.28,0.483-0.836c0.015-0.117,0.021-0.516,0.021-1.2c0-0.708-0.006-1.113-0.017-1.21'+
                        'C30.999,17.37,30.838,17.09,30.569,17.09z');
                    em
                        .append('path')
                        .style('fill', '#FFFFFF')
                        .attr('d', 'M35.067,20.082h1.023c0,0.029,0.002,0.07,0.005,0.121c0.002,0.051,0.004,0.089,0.004,0.119'+
                        'c0,0.703-0.13,1.215-0.39,1.539c-0.26,0.322-0.664,0.484-1.214,0.484c-0.566,0-0.973-0.195-1.224-0.588'+
                        'c-0.198-0.31-0.322-0.762-0.379-1.358c-0.024-0.26-0.037-0.752-0.037-1.473c0-0.582,0.013-0.996,0.037-1.243'+
                        'c0.05-0.5,0.157-0.88,0.322-1.14c0.272-0.427,0.708-0.641,1.31-0.641c0.58,0,1.005,0.23,1.272,0.692'+
                        'c0.218,0.371,0.325,1.125,0.325,2.26v0.463h-2.139c-0.008,0.069-0.012,0.199-0.012,0.393c0,0.454,0.019,0.78,0.058,0.974'+
                        'c0.078,0.399,0.241,0.597,0.488,0.597C34.883,21.281,35.067,20.882,35.067,20.082z M33.975,18.349h1.055v-0.26'+
                        'c0-0.352-0.024-0.601-0.073-0.75c-0.075-0.234-0.229-0.353-0.46-0.353c-0.191,0-0.329,0.081-0.409,0.243'+
                        'c-0.098,0.201-0.14,0.487-0.123,0.86l0.006,0.084C33.973,18.232,33.975,18.292,33.975,18.349z');
                    em
                        .append('path')
                        .style('fill', '#595A5C')
                        .attr('d', 'M6.736,22.229v-3.474l-1.652-4.718h1.299l0.954,3.08l0.94-3.08h1.265l-1.623,4.718v3.474H6.736z');
                    em
                        .append('path')
                        .style('fill', '#595A5C')
                        .attr('d', 'M9.946,19.154c0-1.058,0.08-1.81,0.241-2.254c0.24-0.657,0.714-0.988,1.424-0.988'+
                        'c0.709,0,1.185,0.331,1.426,0.988c0.161,0.441,0.242,1.193,0.242,2.254c0,1.063-0.081,1.815-0.242,2.253'+
                        'c-0.241,0.657-0.717,0.984-1.426,0.984c-0.71,0-1.184-0.329-1.424-0.988C10.026,20.964,9.946,20.214,9.946,19.154z M11.07,19.235'+
                        'c0,0.761,0.003,1.175,0.013,1.243c0.057,0.549,0.23,0.825,0.52,0.825c0.291,0,0.469-0.238,0.532-0.708'+
                        'c0.015-0.103,0.021-0.487,0.021-1.153v-0.598c0-0.624-0.008-1.001-0.023-1.127c-0.068-0.468-0.242-0.701-0.521-0.701'+
                        'c-0.271,0-0.44,0.205-0.509,0.615c-0.021,0.132-0.032,0.478-0.032,1.038V19.235z');
                    em
                        .append('path')
                        .style('fill', '#595A5C')
                        .attr('d', 'M17.206,16.076v6.153h-1.072v-0.613c-0.227,0.518-0.559,0.776-0.995,0.776'+
                        'c-0.705,0-1.057-0.494-1.057-1.482v-4.833h1.058v4.021c0,0.33,0.021,0.564,0.057,0.707c0.068,0.245,0.205,0.366,0.408,0.366'+
                        'c0.22,0,0.366-0.132,0.441-0.399c0.038-0.15,0.061-0.406,0.061-0.765v-3.929H17.206z');
                    return div;
                case 'yahoo':
                    em
                        .append('path')
                        .style('fill', '#5D499E')
                        .attr('d', 'M39.635,14.437L39.635,14.437L39.635,14.437c0,0-0.071-0.01-0.121-0.01c-0.276,0-0.552,0.163-0.552,0.579'+
                        'c-0.164,2.086-0.336,4.18-0.618,6.171l-0.001,0h0.001l0,0h0.001c0.171-0.029,0.303,0.015,0.432,0.067l-0.001-0.001'+
                        'c0.319-2.023,1.079-5.052,1.274-5.909c0.027-0.121,0.069-0.264,0.069-0.365C40.119,14.663,39.925,14.485,39.635,14.437z');
                    em
                        .append('path')
                        .style('fill', '#5D499E')
                        .attr('d', 'M19.545,15.26c0.057,1.078,0.086,2.156,0.091,3.236c-1.294,0.029-2.587,0.032-3.877,0h-0.001'+
                        'c0.006-1.08,0.035-2.159,0.091-3.236c-0.379,0.091-0.764,0.094-1.156,0c0.102,2.315,0.092,4.626,0,6.934'+
                        'c0.376-0.09,0.761-0.094,1.155,0l-0.003-0.001l0.004,0.001c-0.057-1.077-0.086-2.151-0.091-3.226l0.001,0'+
                        'c1.292-0.019,2.584-0.019,3.877-0.001c-0.005,1.074-0.034,2.149-0.091,3.226l0.004-0.001l-0.002,0.001'+
                        'c0.395-0.094,0.778-0.09,1.153,0c-0.092-2.308-0.101-4.618,0-6.934C20.31,15.354,19.923,15.352,19.545,15.26z');
                    em
                        .append('path')
                        .style('fill', '#5D499E')
                        .attr('d', 'M11.302,15.258L11.302,15.258L11.302,15.258c-0.288,0.1-0.521,0.094-0.806,0v0'+
                        'c-0.932,2.335-2.004,4.971-2.967,6.937l0,0l-0.001,0.001l0.004-0.001l-0.003,0l0.007-0.003l-0.004,0.002'+
                        'c0.441-0.11,0.861-0.076,1.141,0c-0.002,0-0.003-0.001-0.003-0.001h0.003c0.245-0.62,0.524-1.324,0.806-2.033l0.001,0.001'+
                        'c0.947-0.027,1.896-0.031,2.842,0l0,0c0.271,0.678,0.541,1.356,0.803,2.034v0c0.424-0.11,0.843-0.08,1.154-0.002h-0.001'+
                        'C13.582,20.895,12.188,17.5,11.302,15.258z M10.897,16.453c0.383,1.068,0.806,2.145,1.232,3.224l-0.002-0.001'+
                        'c-0.819,0.028-1.64,0.028-2.459,0H9.668C10.17,18.404,10.646,17.177,10.897,16.453z');
                    em
                        .append('path')
                        .style('fill', '#5D499E')
                        .attr('d', 'M9.202,14.335L9.202,14.335L9.202,14.335c-0.417,0.094-0.793,0.098-1.166,0'+
                        'c-0.328,0.612-1.538,2.592-2.311,3.86c-0.781-1.295-1.708-2.791-2.311-3.86c-0.479,0.102-0.679,0.108-1.156,0'+
                        'c0.947,1.428,2.465,4.146,2.981,5.039l-0.069,3.721c0,0,0.333-0.055,0.556-0.055c0.247,0,0.554,0.055,0.554,0.055l-0.069-3.721'+
                        'C7.175,17.684,8.766,14.926,9.202,14.335z');
                    em
                        .append('path')
                        .style('fill', '#5D499E')
                        .attr('d', 'M24.771,15.167c-2.451,0-3.737,1.555-3.737,3.569c0,2.206,1.404,3.551,3.734,3.551'+
                        'c2.519,0,3.75-1.517,3.75-3.528C28.519,16.516,27.048,15.167,24.771,15.167z M24.779,21.894c-1.634,0-2.595-1.171-2.595-3.146'+
                        'c0-2.234,1.184-3.133,2.527-3.161c0.021,0,0.043,0,0.064,0c1.499,0,2.6,1.021,2.6,3.155C27.376,20.873,26.276,21.894,24.779,21.894z');
                    em
                        .append('path')
                        .style('fill', '#5D499E')
                        .attr('d', 'M33.235,14.749c-2.441,0-4.308,1.386-4.308,3.963c0,2.125,1.241,3.994,4.328,3.994'+
                        'c2.612,0,4.319-1.438,4.319-3.956C37.575,16.375,35.983,14.749,33.235,14.749z M30.082,18.697c0-2.714,1.669-3.517,3.156-3.517'+
                        'c1.834,0,3.184,1.114,3.184,3.57c0,2.67-1.634,3.537-3.181,3.537C31.588,22.287,30.082,21.316,30.082,18.697z');
                    em
                        .append('path')
                        .style('fill', '#5D499E')
                        .attr('d', 'M38.309,22.014c-0.364,0-0.546,0.278-0.546,0.577c0,0.352,0.282,0.531,0.629,0.531'+
                        'c0.251,0,0.525-0.152,0.525-0.566C38.917,22.223,38.656,22.014,38.309,22.014z');
                    return div;
                case 'appleitunes':
                    em
                        .append('circle')
                        .style('fill', '#3A7DC0')
                        .attr('cx', 21.433)
                        .attr('cy', 16.194)
                        .attr('r', 9.683);
                    em
                        .append('path')
                        .style('fill', '#DFDFDE')
                        .attr('d', 'M19.175,18.717v-7.776c0,0,1.59-0.672,3.131-0.955c1.543-0.283,3.869-0.413,3.869-0.413v9.564'+
                        'c0,0-0.238,1.595-2.168,1.543c-1.927-0.051-2.45-2.108-1.113-2.982s2.281-0.283,2.281-0.283v-4.321c0,0-3,0.155-5,0.978'+
                        'c0,0,0,5.631,0,6.376s-1.095,1.646-2.509,1.594c-1.414-0.051-2.019-1.363-1.35-2.494C16.983,18.418,18.175,18.527,19.175,18.717z');
                    return div;
                case 'gmail':
                    em
                        .append('path')
                        .style('fill', '#2BACE2')
                        .attr('d', 'M34.036,16.171h-1.469v6.42h1.469V16.171L34.036,16.171z M33.229,15.292c-0.469,0-0.85-0.38-0.85-0.85'+
                        'c0-0.473,0.381-0.854,0.85-0.854c0.473,0,0.854,0.38,0.854,0.854C34.083,14.913,33.702,15.292,33.229,15.292z');
                    em
                        .append('path')
                        .style('fill', '#F79421')
                        .attr('d', 'M26.568,16.709c0.079,0.27,0.157,0.539,0.236,0.809'+
                        'c1.001-0.662,2.73-0.598,2.73,0.878c0,0.339-1.271,0.294-1.6,0.371c-0.596,0.14-1.24,0.488-1.533,1.046'+
                        'c-0.687,1.306,0.046,3.052,1.674,2.872c0.479-0.053,0.91-0.271,1.221-0.644c0.129-0.155,0.344-0.337,0.398-0.007'+
                        'c0.036,0.221-0.024,0.52,0.227,0.52c0.324,0,0.647,0,0.972,0c-0.251-1.708,0.346-3.656-0.365-5.271'+
                        'C29.905,15.869,27.65,16.04,26.568,16.709L26.568,16.709z M27.939,19.704c0.41-0.257,0.911-0.303,1.385-0.293'+
                        'c0.465,0.01,0.3,0.72,0.262,1.067c-0.056,0.505-0.253,0.95-0.74,1.176C27.528,22.268,26.771,20.344,27.939,19.704z');
                    em
                        .append('path')
                        .style('fill', '#2BACE2')
                        .attr('d', 'M13.045,13.833c0.417-0.413,0.833-0.825,1.249-1.237'+
                        'c-2.212-1.775-6.159-1.8-8.328,0.025c-2.654,2.233-2.805,6.55-0.203,8.914c1.48,1.346,3.631,1.398,5.504,1.155'+
                        'c0.501-0.064,0.986-0.165,1.478-0.282c0.545-0.129,1.549-0.069,1.549-0.702c0-0.681-0.036-1.375,0.012-2.055'+
                        'c0.034-0.487,0.208-0.57,0.566-0.915c-0.846,0-1.691,0-2.537,0c-0.779,0-1.183,0.29-1.879,0.672'+
                        'c0.761-0.042,1.523-0.085,2.284-0.127c0,0.583,0,1.166,0,1.748c0,0.54,0.102,0.631-0.287,0.872'+
                        'c-0.343,0.213-0.888,0.262-1.284,0.287c-1.521,0.096-3.086-0.457-4.099-1.616c-2.26-2.586-2.272-8.053,1.933-8.67'+
                        'c0.87-0.127,1.775-0.039,2.56,0.37c0.35,0.182,0.684,0.417,0.975,0.683c0.45,0.414,0.295,0.474-0.022,1.004'+
                        'C12.691,13.917,12.868,13.875,13.045,13.833z');
                    em
                        .append('rect')
                        .style('fill', '#08A650')
                        .attr('x', 35.6)
                        .attr('y', 12.9)
                        .attr('width', 1.3)
                        .attr('height', 9.68);
                    em
                        .append('polygon')
                        .style('fill', '#EC2227')
                        .attr('points', '22.926,16.321 20.339,18.913 17.725,16.311 16.12,16.316 '+ 
                        '16.12,22.629 17.428,22.629 17.432,17.672 20.37,20.168 23.363,17.631 23.363,22.629 24.576,22.629 24.576,16.316 ');
                    return div;
                case 'amazon':
                    em
                        .append('path')
                        .style('fill', '#F8991D')
                        .attr('d', 'M25.484,23.57c-2.128,1.571-5.212,2.405-7.868,2.405'+
                        'c-3.723,0-7.075-1.375-9.611-3.667c-0.199-0.18-0.022-0.426,0.218-0.286c2.736,1.593,6.121,2.551,9.616,2.551'+
                        'c2.358,0,4.951-0.489,7.335-1.501C25.535,22.921,25.836,23.312,25.484,23.57z'+
                        'M26.369,22.56c-0.271-0.349-1.798-0.165-2.483-0.082'+
                        'c-0.208,0.024-0.24-0.157-0.053-0.289c1.217-0.855,3.213-0.608,3.444-0.322c0.233,0.289-0.061,2.29-1.202,3.245'+
                        'c-0.176,0.147-0.344,0.068-0.265-0.126C26.067,24.345,26.641,22.909,26.369,22.56z');
                    em
                        .append('path')
                        .style('fill', '#010101')
                        .attr('d', 'M23.932,16.146v-0.831c0.001-0.127,0.097-0.211,0.211-0.211'+
                        'l3.726,0c0.12,0,0.215,0.087,0.216,0.209l-0.001,0.713c-0.001,0.12-0.102,0.275-0.28,0.523l-1.93,2.755'+
                        'c0.716-0.016,1.475,0.091,2.125,0.457c0.146,0.083,0.187,0.205,0.197,0.325v0.887c0,0.122-0.134,0.263-0.274,0.189'+
                        'c-1.146-0.601-2.668-0.666-3.937,0.007c-0.129,0.069-0.264-0.07-0.264-0.193v-0.843c0-0.135,0.002-0.366,0.138-0.571l2.235-3.207'+
                        'l-1.945,0C24.03,16.355,23.933,16.271,23.932,16.146z'+
                        'M10.344,21.337H9.21c-0.107-0.007-0.194-0.088-0.203-0.191'+
                        'l0.001-5.817c0-0.117,0.098-0.21,0.219-0.21l1.055,0c0.11,0.006,0.199,0.09,0.207,0.197v0.759h0.021'+
                        'c0.275-0.734,0.793-1.077,1.491-1.077c0.709,0,1.153,0.343,1.471,1.077c0.274-0.734,0.899-1.077,1.565-1.077'+
                        'c0.476,0,0.995,0.195,1.312,0.637c0.36,0.49,0.286,1.199,0.286,1.824l-0.001,3.67c0,0.116-0.098,0.209-0.219,0.209h-1.131'+
                        'c-0.114-0.007-0.204-0.098-0.204-0.208l0-3.084c0-0.245,0.021-0.856-0.031-1.089c-0.085-0.391-0.338-0.501-0.667-0.501'+
                        'c-0.275,0-0.561,0.184-0.677,0.478s-0.106,0.784-0.106,1.113v3.083c0,0.116-0.098,0.209-0.218,0.209h-1.132'+
                        'c-0.114-0.007-0.203-0.098-0.203-0.208l-0.001-3.084c0-0.648,0.105-1.604-0.699-1.604c-0.814,0-0.783,0.931-0.783,1.604l0,3.083'+
                        'C10.562,21.244,10.465,21.337,10.344,21.337z'+
                        'M31.291,14.997c1.683,0,2.592,1.444,2.592,3.281'+
                        'c0,1.774-1.005,3.182-2.592,3.182c-1.65,0-2.55-1.444-2.55-3.243C28.741,16.405,29.651,14.997,31.291,14.997z M31.301,16.184'+
                        'c-0.836,0-0.889,1.139-0.889,1.848c0,0.71-0.011,2.228,0.878,2.228c0.879,0,0.921-1.224,0.921-1.971'+
                        'c0-0.49-0.021-1.077-0.169-1.542C31.916,16.344,31.661,16.184,31.301,16.184z'+
                        'M36.064,21.337h-1.129c-0.113-0.007-0.203-0.098-0.203-0.208'+
                        'L34.73,15.31c0.009-0.106,0.104-0.19,0.217-0.19l1.052,0c0.1,0.006,0.182,0.074,0.201,0.163v0.89h0.021'+
                        'c0.317-0.795,0.762-1.175,1.545-1.175c0.507,0,1.005,0.184,1.322,0.685c0.296,0.466,0.296,1.249,0.296,1.812v3.66'+
                        'c-0.012,0.104-0.104,0.184-0.217,0.184h-1.137c-0.104-0.006-0.188-0.084-0.201-0.184v-3.158c0-0.637,0.074-1.567-0.709-1.567'+
                        'c-0.274,0-0.529,0.183-0.655,0.465c-0.158,0.355-0.181,0.71-0.181,1.102v3.132C36.282,21.244,36.186,21.337,36.064,21.337z'+
                        'M20.963,18.56c0,0.441,0.011,0.81-0.211,1.202'+
                        'c-0.181,0.319-0.467,0.516-0.785,0.516c-0.434,0-0.689-0.331-0.689-0.822c0-0.965,0.867-1.141,1.686-1.141V18.56z M22.106,21.323'+
                        'c-0.075,0.068-0.183,0.072-0.268,0.026c-0.376-0.312-0.443-0.457-0.65-0.755c-0.622,0.634-1.062,0.824-1.868,0.824'+
                        'c-0.954,0-1.696-0.589-1.696-1.767c0-0.919,0.499-1.545,1.208-1.853c0.616-0.27,1.475-0.319,2.131-0.393v-0.147'+
                        'c0-0.27,0.021-0.589-0.137-0.822c-0.138-0.209-0.403-0.295-0.637-0.295c-0.432,0-0.816,0.222-0.911,0.681'+
                        'c-0.02,0.103-0.094,0.204-0.197,0.208l-1.098-0.119c-0.093-0.021-0.195-0.096-0.169-0.237c0.252-1.333,1.456-1.735,2.535-1.735'+
                        'c0.551,0,1.271,0.147,1.707,0.564c0.551,0.515,0.498,1.203,0.498,1.951v1.766c0,0.532,0.221,0.764,0.428,1.05'+
                        'c0.072,0.103,0.089,0.226-0.004,0.301c-0.23,0.194-0.643,0.552-0.868,0.752L22.106,21.323z'+
                        'M6.105,18.56c0,0.441,0.011,0.81-0.211,1.202'+
                        'c-0.181,0.319-0.466,0.516-0.784,0.516c-0.435,0-0.689-0.331-0.689-0.822c0-0.965,0.866-1.141,1.685-1.141V18.56z M7.249,21.323'+
                        'c-0.075,0.068-0.184,0.072-0.268,0.026c-0.376-0.312-0.444-0.457-0.649-0.755c-0.623,0.634-1.063,0.824-1.869,0.824'+
                        'c-0.954,0-1.696-0.589-1.696-1.767c0-0.919,0.498-1.545,1.208-1.853c0.615-0.27,1.474-0.319,2.13-0.393v-0.147'+
                        'c0-0.27,0.021-0.589-0.137-0.822c-0.138-0.209-0.403-0.295-0.636-0.295c-0.432,0-0.816,0.222-0.911,0.681'+
                        'c-0.02,0.103-0.095,0.204-0.197,0.208l-1.099-0.119c-0.093-0.021-0.196-0.096-0.169-0.237c0.252-1.333,1.456-1.735,2.534-1.735'+
                        'c0.551,0,1.272,0.147,1.708,0.564c0.551,0.515,0.498,1.203,0.498,1.951v1.766c0,0.532,0.221,0.764,0.428,1.05'+
                        'c0.073,0.103,0.088,0.226-0.004,0.301c-0.231,0.194-0.643,0.552-0.869,0.752L7.249,21.323z');
                    return div;
                case 'skype':
                    em
                        .append('path')
                        .style('fill', '#33A7DF')
                        .attr('d', 'M29.863,17.329c0.129-0.592,0.197-1.205,0.197-1.836c0-4.732-3.836-8.566-8.567-8.566'+
                        'c-0.5,0-0.989,0.041-1.465,0.123c-0.766-0.48-1.672-0.762-2.645-0.762c-2.744,0-4.969,2.227-4.969,4.969'+
                        'c0,0.918,0.25,1.777,0.684,2.514c-0.113,0.555-0.173,1.133-0.173,1.723c0,4.73,3.836,8.566,8.567,8.566'+
                        'c0.536,0,1.061-0.049,1.569-0.143c0.699,0.375,1.5,0.59,2.35,0.59c2.744,0,4.969-2.227,4.969-4.971'+
                        'C30.38,18.745,30.193,17.995,29.863,17.329z');
                    em
                        .append('path')
                        .style('fill', '#F9F9FA')
                        .attr('d', 'M18.876,9.862c-2.751,1.006-2.982,4.511-0.219,5.68c0.858,0.365,6.875,1.208,4.66,3.266'+
                        'c-0.771,0.715-2.263,0.853-3.201,0.41c-1.157-0.546-1.201-2.661-2.727-2.403c-1.553,0.262-0.916,2.113-0.255,2.92'+
                        'c0.88,1.076,2.229,1.516,3.574,1.617c2.315,0.174,5.486-0.585,5.72-3.379c0.264-3.149-3.175-3.608-5.485-4.187'+
                        'c-0.917-0.23-2.617-1.143-1.202-2.071c0.955-0.629,2.593-0.541,3.331,0.371c0.588,0.727,1.375,2.249,2.482,1.086'+
                        'c1.128-1.166-0.498-2.732-1.53-3.204C22.487,9.265,20.451,9.278,18.876,9.862z');
                    return div;
                case 'dropbox':
                    em
                        .append('polygon')
                        .style('fill', '#397ABE')
                        .attr('points', '21.397,19.972 17.047,23.173 14.833,21.833 14.833,22.849 21.382,27.224 28.08,22.878 28.08,21.833 '+ 
                        '25.794,23.298 ');
                    em
                        .append('path')
                        .style('fill', '#397ABE')
                        .attr('d', 'M32.64,10.535l-6.637-4.239l-4.562,3.825l-4.459-3.825l-6.828,4.447l4.702,3.577l-4.702,3.577l6.828,4.045'+
                        'l4.459-3.423l4.458,3.423l6.74-4.045l-4.354-3.732L32.64,10.535z M21.397,18.326l-6.459-4.069l6.518-3.938l6.44,3.7L21.397,18.326z');
                    return div;
                case 'viber':
                    em
                        .append('path')
                        .style('fill', '#7D539D')
                        .attr('d', 'M24.729,22.746c-0.356-0.023-0.549,0.285-0.754,0.514'+
                        'c-0.875,0.982-1.752,1.959-2.64,2.93c-0.14,0.154-0.271,0.434-0.523,0.33c-0.251-0.105-0.143-0.395-0.145-0.605'+
                        'c-0.009-0.82-0.04-1.641,0.008-2.457c0.038-0.639-0.119-0.926-0.831-0.943c-0.889-0.025-1.787-0.137-2.655-0.326'+
                        'c-3.063-0.672-5.081-2.346-5.368-5.762c-0.125-1.488-0.214-2.971,0.02-4.449c0.49-3.088,2.269-4.84,5.337-5.346'+
                        'c4.206-0.691,6.849-0.307,9.083,0.164c2.68,0.566,4.514,2.627,4.739,5.416c0.129,1.604,0.158,3.223-0.083,4.826'+
                        'c-0.321,2.139-1.132,4.285-3.151,5.025C26.391,22.566,25.323,22.773,24.729,22.746z M23.393,20.332'+
                        'c0.799,0.008,1.736-0.763,2.006-1.527c0.262-0.737-0.289-1.029-0.725-1.378c-0.32-0.26-0.663-0.491-1.001-0.727'+
                        'c-0.673-0.474-1.288-0.51-1.79,0.251c-0.281,0.427-0.677,0.446-1.089,0.257c-1.137-0.515-2.016-1.31-2.53-2.465'+
                        'c-0.228-0.512-0.225-0.969,0.308-1.333c0.282-0.191,0.565-0.417,0.543-0.834c-0.03-0.547-1.353-2.367-1.875-2.56'+
                        'c-0.218-0.079-0.432-0.075-0.652,0c-1.226,0.414-1.733,1.419-1.247,2.613c1.45,3.561,4.003,6.04,7.515,7.551'+
                        'C23.056,20.265,23.281,20.302,23.393,20.332z M21.072,8.179c-0.269,0.04-0.823-0.182-0.859,0.42C20.191,9,20.658,8.935,20.964,8.981'+
                        'c3.699,0.571,5.403,2.327,5.874,6.052c0.044,0.342-0.084,0.861,0.406,0.871c0.512,0.013,0.389-0.5,0.393-0.846'+
                        'C27.683,11.552,24.625,8.302,21.072,8.179z M25.816,14.432c0.017-2.175-1.847-4.154-4.127-4.429'+
                        'c-0.357-0.043-0.826-0.21-0.909,0.284c-0.087,0.518,0.436,0.463,0.773,0.54c2.284,0.51,3.08,1.343,3.454,3.608'+
                        'c0.056,0.331-0.054,0.842,0.508,0.759C25.928,15.129,25.78,14.691,25.816,14.432z M24.08,14.021c0.017-1.052-1.168-2.265-2.183-2.24'+
                        'c-0.237,0.006-0.47,0.031-0.559,0.287c-0.129,0.38,0.146,0.469,0.427,0.513c0.937,0.152,1.431,0.704,1.522,1.639'+
                        'c0.027,0.253,0.188,0.459,0.432,0.429C24.059,14.607,24.089,14.309,24.08,14.021z');
                    return div;
                case 'h323':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 6 21)')
                        .style('fill', '#6FBF9B')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 13)
                        .text('H323');
                    return div;
                case 'netbios':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 6.5 21)')
                        .style('fill', '#67AAB5')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 12)
                        .text('NBios');
                    return div;
                case 'smtp':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 4.5 22)')
                        .style('fill', '#67AAB5')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 14)
                        .text('smtp');
                    return div;
                case 'smtps':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 4.5 22)')
                        .style('fill', '#67AAB5')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 14)
                        .text('smtp');
                    return div;
                case 'ntp':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 9 21)')
                        .style('fill', '#F3BD5D')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 14)
                        .text('NTP');
                    return div;
                case 'twitter':
                    em
                        .append('path')
                        .style('fill', '#2BA9E0')
                        .attr('d', 'M30.872,10.52c-0.697,0.31-1.445,0.52-2.232,0.612c0.803-0.479,1.42-1.243,1.709-2.15'+
                        'c-0.75,0.445-1.582,0.769-2.469,0.943c-0.709-0.756-1.719-1.228-2.838-1.228c-2.146,0-3.886,1.741-3.886,3.887'+
                        'c0,0.306,0.033,0.602,0.1,0.887c-3.23-0.162-6.096-1.71-8.013-4.062c-0.335,0.575-0.526,1.243-0.526,1.955'+
                        'c0,1.349,0.687,2.539,1.729,3.236c-0.637-0.02-1.237-0.195-1.761-0.487c0,0.017,0,0.034,0,0.049c0,1.885,1.34,3.455,3.118,3.812'+
                        'c-0.326,0.09-0.669,0.138-1.024,0.138c-0.25,0-0.494-0.025-0.731-0.07c0.495,1.544,1.931,2.669,3.632,2.699'+
                        'c-1.33,1.042-3.008,1.664-4.828,1.664c-0.314,0-0.623-0.019-0.928-0.053c1.721,1.103,3.764,1.745,5.959,1.745'+
                        'c7.152,0,11.062-5.924,11.062-11.061c0-0.168-0.004-0.336-0.012-0.503C29.692,11.984,30.35,11.301,30.872,10.52z');
                    return div;
                case 'ftp_data':
                    em
                        .append('path')
                        .style('fill', '#9fba70')
                        .attr('d', 'M31.184,10.75H20.405v-0.524c0-1.021-0.821-1.848-1.834-1.848'+
                        'h-6.96c-1.012,0-1.835,0.826-1.835,1.848v12.344c0,1.021,0.823,1.848,1.835,1.848h19.574c1.013,0,1.836-0.826,1.836-1.848v-9.973'+
                        'C33.02,11.577,32.197,10.75,31.184,10.75z M20.397,17.885l-2.563-1.531v4.605h-1.993v-4.605l-2.563,1.531v-2.257l3.56-2.126'+
                        'l3.56,2.126V17.885z M29.624,18.989l-3.56,2.126l-3.56-2.126v-2.257l2.611,1.56v-4.654h1.994v4.596l2.514-1.501V18.989z');
                    return div;
                case 'ftp_control':
                    em
                        .append('path')
                        .style('fill', '#efa986')
                        .attr('d', 'M31.184,10.75H20.405v-0.524c0-1.021-0.821-1.848-1.834-1.848'+
                        'h-6.96c-1.012,0-1.835,0.826-1.835,1.848v12.344c0,1.021,0.823,1.848,1.835,1.848h19.574c1.013,0,1.836-0.826,1.836-1.848v-9.973'+
                        'C33.02,11.577,32.197,10.75,31.184,10.75z M20.397,17.885l-2.563-1.531v4.605h-1.993v-4.605l-2.563,1.531v-2.257l3.56-2.126'+
                        'l3.56,2.126V17.885z M29.624,18.989l-3.56,2.126l-3.56-2.126v-2.257l2.611,1.56v-4.654h1.994v4.596l2.514-1.501V18.989z');
                    return div;
                case 'mdns':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 3.5 22)')
                        .style('fill', '#708EBC')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 12)
                        .text('MDNS');
                    return div;
                case 'wikipedia':
                    em
                        .append('path')
                        .style('fill', '#096497')
                        .attr('d', 'M21.058,2.153c0.016-0.003,0.018,0.007,0.018,0.02'+
                        'c0.851,1.418,1.688,2.824,2.49,4.314c0.264,0.488,0.572,0.988,0.666,1.559c-0.264-0.108-0.412-0.345-0.646-0.494'+
                        'c-0.23-0.147-0.499-0.244-0.875-0.266c0.193,1.215,0.936,1.826,1.863,2.261c0.924,0.435,1.948,0.788,2.812,1.351'+
                        'c1.595,1.036,2.814,2.842,3.384,4.923c0.677,2.471,0.161,5.151-0.778,6.9c-0.967,1.797-2.436,3.152-4.277,4.029'+
                        'c-0.961,0.458-2.045,0.777-3.308,0.854c-1.327,0.083-2.561-0.096-3.65-0.475c-1.985-0.69-3.625-2.027-4.694-3.612'+
                        'c-1.104-1.634-1.863-3.947-1.502-6.614c0.32-2.36,1.474-4.08,2.871-5.436c0.682,0.619,1.467,1.448,2.186,2.167'+
                        'c0.048,0.047,0.284,0.303,0.304,0.304c0.079,0.003,0.329-0.312,0.362-0.343c0.146-0.134,0.218-0.23,0.361-0.322'+
                        'c0.217,0.86,0.458,1.697,0.685,2.547c-0.843-0.229-1.689-0.452-2.528-0.685c-0.025-0.056,0.064-0.116,0.115-0.171'+
                        'c0.052-0.056,0.111-0.111,0.171-0.17c0.072-0.073,0.341-0.289,0.341-0.362c0-0.057-0.262-0.278-0.304-0.323'+
                        'c-0.12-0.127-0.196-0.212-0.304-0.305c-0.921,1.019-1.591,2.286-1.71,4.106c0.247,0.044,0.576,0.006,0.855,0.019'+
                        'c0.052-0.29,0.04-0.644,0.057-0.969c0.763,0.435,1.52,0.876,2.281,1.312c-0.746,0.464-1.511,0.909-2.299,1.331'+
                        'c0-0.318,0-0.635,0-0.951c-0.261-0.044-0.602-0.007-0.894-0.02c0.1,1.834,0.799,3.066,1.673,4.125'+
                        'c0.246-0.172,0.417-0.419,0.646-0.608c-0.194-0.261-0.455-0.457-0.646-0.722c0.852-0.226,1.693-0.46,2.547-0.685'+
                        'c-0.229,0.842-0.444,1.698-0.685,2.528c-0.054,0.027-0.12-0.067-0.171-0.114c-0.163-0.149-0.375-0.354-0.532-0.513'+
                        'c-0.167,0.146-0.298,0.287-0.476,0.475c-0.028,0.029-0.153,0.124-0.152,0.152c0.002,0.051,0.328,0.287,0.399,0.342'+
                        'c0.931,0.712,2.23,1.291,3.707,1.368c0.044-0.26,0.007-0.601,0.019-0.893c-0.336,0.013-0.614-0.031-0.951-0.02'+
                        'c-0.01-0.091,0.068-0.186,0.114-0.266c0.372-0.645,0.798-1.365,1.16-2.033c0.467,0.729,0.932,1.563,1.331,2.299'+
                        'c-0.338-0.013-0.615,0.031-0.951,0.02c-0.044,0.253-0.006,0.589-0.019,0.874c1.79-0.072,3.104-0.786,4.124-1.691'+
                        'c-0.191-0.22-0.416-0.407-0.607-0.627c-0.246,0.197-0.496,0.492-0.723,0.646c-0.232-0.845-0.457-1.697-0.684-2.548'+
                        'c0.852,0.225,1.695,0.459,2.547,0.685c-0.194,0.257-0.436,0.465-0.646,0.703c0.201,0.217,0.41,0.425,0.627,0.627'+
                        'c0.898-1.034,1.578-2.287,1.691-4.105c-0.253-0.045-0.588-0.006-0.873-0.02c-0.045,0.286-0.007,0.652-0.02,0.971'+
                        'c-0.792-0.412-1.529-0.879-2.301-1.312c0.729-0.469,1.523-0.871,2.262-1.33c0.051,0.292,0.033,0.651,0.059,0.969'+
                        'c0.291,0,0.582,0,0.873,0c-0.105-1.832-0.797-3.08-1.691-4.125c-0.22,0.192-0.407,0.417-0.627,0.608'+
                        'c0.185,0.261,0.504,0.483,0.646,0.723c-0.855,0.222-1.695,0.46-2.547,0.685c0.227-0.85,0.467-1.688,0.684-2.547'+
                        'c0.18,0.133,0.342,0.306,0.532,0.493c0.021,0.021,0.165,0.172,0.171,0.172c0.098,0.004,0.244-0.259,0.305-0.323'+
                        'c0.119-0.131,0.222-0.186,0.304-0.305c-1.13-0.878-2.702-1.176-3.858-1.977c-1.175-0.812-1.878-1.945-2.262-3.555'+
                        'c-0.612,0.148-1.113,0.511-1.768,0.552c0.058-0.274,0.281-0.456,0.437-0.665C19.869,6.2,20.43,4.12,21.058,2.153');
                    em
                        .append('path')
                        .style('fill', '#961A1E')
                        .attr('d', 'M18.719,17.663c0.169-0.812,0.661-1.487,1.236-1.9'+
                        'c0.54-0.389,1.489-0.725,2.452-0.531c0.812,0.163,1.475,0.627,1.901,1.216c0.43,0.595,0.708,1.562,0.531,2.451'+
                        'c-0.164,0.833-0.599,1.451-1.217,1.901c-0.575,0.422-1.438,0.745-2.432,0.551c-0.797-0.153-1.494-0.61-1.92-1.197'+
                        'C18.864,19.594,18.502,18.705,18.719,17.663');
                    return div;
                case 'ebay':
                    em
                        .append('path')
                        .style('fill', '#EF3C40')
                        .attr('d', 'M8.631,13.584c-4.307,0-4.474,3.353-4.452,4.223c0,0-0.21,3.919,4.347,3.919'+
                        'c3.916,0,4.108-2.459,4.108-2.459l-1.802,0.003c0,0-0.351,1.355-2.3,1.318c-2.505-0.046-2.602-2.474-2.602-2.474h6.94'+
                        'C12.871,18.114,13.397,13.585,8.631,13.584z M5.988,16.926c0,0,0.123-2.194,2.6-2.195c2.468,0,2.468,2.195,2.468,2.195H5.988z');
                    em
                        .append('path')
                        .style('fill', '#0668B2')
                        .attr('d', 'M17.691,13.584c-2.166-0.012-3.097,1.283-3.097,1.283v-4.331h-1.735l0.029,9.153c0,0-0.01,1.064-0.076,1.77'+
                        'h1.686l0.073-1.028c0,0,0.787,1.295,3.084,1.295c2.299,0,4.114-1.416,4.162-4.04C21.864,15.06,19.856,13.597,17.691,13.584z'+
                        ' M17.293,20.555c-2.735,0.035-2.69-2.899-2.69-2.899s-0.099-2.825,2.686-2.897c2.785-0.072,2.694,2.958,2.694,2.958'+
                        'S20.027,20.521,17.293,20.555z');
                    em
                        .append('path')
                        .style('fill', '#F8AC1C')
                        .attr('d', 'M29.836,19.652c0.004-1.184,0.038-2.24,0-2.987c-0.047-0.864,0.035-2.95-3.702-3.105'+
                        'c0,0-3.584-0.325-3.956,2.341h1.834c0,0,0.143-1.222,2.002-1.186c1.76,0.032,2.08,0.896,2.071,1.957c0,0-1.51,0.004-2.013,0.007'+
                        'c-0.907,0.005-4.082,0.105-4.378,2.038c-0.353,2.3,1.699,3.018,3.306,3.009s2.521-0.489,3.203-1.352l0.072,1.07l1.596-0.01'+
                        'C29.872,21.435,29.832,20.837,29.836,19.652z M25.299,20.618c0,0-1.739,0.003-1.842-1.388c-0.108-1.483,2.677-1.394,2.677-1.394'+
                        'l1.967-0.003C28.101,17.834,28.42,20.66,25.299,20.618z');
                    em
                        .append('polygon')
                        .style('fill', '#6BB845')
                        .attr('points', '28.886,13.875 30.901,13.875 33.845,19.747 36.797,13.875 38.619,13.875 33.29,24.345 31.341,24.345 32.884,21.435 ');
                    return div;
                case 'googlemaps':
                    em
                        .append('polygon')
                        .style('fill', '#C9C9C9')
                        .attr('points', '23.968,5.673 17.475,4.549 10.607,5.208 10.607,23.683 17.475,25.45 23.968,23.169 31.639,24.932 31.639,4.788 ');
                    em
                        .append('polygon')
                        .style('fill', '#A2C064')
                        .attr('points', '11.184,23.831 17.535,18.057 23.897,10.118 29.411,5.045 23.968,5.673 17.475,4.549 10.607,5.208 10.607,23.683 12.765,24.238 12.765,24.238 ');
                    em
                        .append('polygon')
                        .style('fill', '#6886C4')
                        .attr('points', '20.361,18.246 17.589,21.104 13.704,24.479 12.044,24.053 12.043,24.053 17.475,25.45 '+
                        '23.968,23.169 31.639,24.932 31.639,23.65 23.897,19.299 ');
                    em
                        .append('polygon')
                        .style('fill', '#EEE959')
                        .attr('points', '31.639,20.64 23.897,16.741 21.818,15.838 23.897,13.352 31.639,6.574 31.639,4.788 29.411,5.045 '+
                        '23.897,10.118 17.535,18.057 11.184,23.831 13.704,24.479 17.589,21.104 20.361,18.246 23.897,19.299 31.639,23.65 ');
                    em
                        .append('path')
                        .style('fill', '#D62F28')
                        .attr('d', 'M30.735,10.193L30.735,10.193c-0.079-1.804-1.544-3.247-3.356-3.291c-1.813,0.044-3.278,1.487-3.357,3.291'+
                        'l0,0c-0.003,0.051-0.004,0.102-0.004,0.153c0,1.383,1.133,2.211,2.003,3.344c1.01,1.315,1.358,3.718,1.358,3.718'+
                        's0.348-2.402,1.357-3.718c0.87-1.133,2.003-1.961,2.003-3.344C30.739,10.295,30.737,10.244,30.735,10.193z');
                    em
                        .append('circle')
                        .style('fill', '#2A1A1D')
                        .attr('cx', 27.378)
                        .attr('cy', 10.211)
                        .attr('r', 1.018);
                    em
                        .append('path')
                        .style('fill', '#FFFEFE')
                        .attr('d', 'M21.818,7.268h-5.71c-1.497,0-3.383,0.222-4.963,1.524'+
                        'c-0.198,0.171-0.374,0.355-0.538,0.545v6.188c0.783,0.799,1.918,1.334,3.366,1.334c0.277,0,0.582-0.027,0.888-0.055'+
                        'c-0.14,0.332-0.278,0.609-0.278,1.082c0,0.858,0.443,1.385,0.831,1.884c-1.133,0.075-3.156,0.205-4.807,1.017v2.094'+
                        'c0.457-1.226,1.706-1.711,2.201-1.891c1.165-0.389,2.662-0.443,2.911-0.443c0.277,0,0.416,0,0.638,0.026'+
                        'c2.107,1.497,3.022,2.246,3.022,3.66c0,0.196-0.023,0.385-0.06,0.568l1.784-0.627c0.086-0.338,0.133-0.681,0.133-1.023'+
                        'c0-1.912-1.108-2.854-2.328-3.881l-0.998-0.775c-0.305-0.25-0.721-0.583-0.721-1.192c0-0.61,0.416-0.998,0.775-1.358'+
                        'c1.165-0.915,2.33-1.886,2.33-3.938c0-2.106-1.332-3.216-1.969-3.742h1.719L21.818,7.268z M17.162,15.308'+
                        'c-0.444,0.443-1.193,0.775-1.886,0.775c-2.385,0-3.466-3.077-3.466-4.935c0-0.72,0.139-1.469,0.61-2.051'+
                        'c0.444-0.555,1.22-0.915,1.941-0.915c2.301,0,3.492,3.104,3.492,5.101C17.854,13.782,17.798,14.669,17.162,15.308z');
                    return div;
                case 'ssh':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 9.5 20.5)')
                        .style('fill', '#708EBC')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 14)
                        .text('SSH');
                    return div;
                case 'ssdp':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 6.3 21.6)')
                        .style('fill', '#6FBF9B')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 13)
                        .text('SSDP');
                    return div;
                case 'appleicloud':
                    em
                        .append('path')
                        .style('fill', '#64A2D8')
                        .attr('d', 'M31.191,22.593c0,1.831-1.484,3.316-3.316,3.316H14.66c-1.832,0-3.316-1.485-3.316-3.316V9.379'+
                        'c0-1.832,1.485-3.316,3.316-3.316h13.214c1.832,0,3.316,1.484,3.316,3.316V22.593z');
                    em
                        .append('path')
                        .style('fill', '#FFFFFF')
                        .attr('d', 'M16.154,20.95c-1.95,0-3.536-1.586-3.536-3.536c0-1.402,0.848-2.666,2.093-3.228'+
                        'c0.047-1.331,1.145-2.4,2.488-2.4c0.41,0,0.805,0.1,1.156,0.284c0.843-1.395,2.358-2.273,4.048-2.273'+
                        'c2.486,0,4.531,1.927,4.721,4.367c0.201,0.044,0.398,0.106,0.592,0.188c1.316,0.443,2.199,1.668,2.199,3.062'+
                        'c0,0.657-0.195,1.288-0.566,1.827c-0.418,0.717-1.689,1.709-2.381,1.702C24.277,20.916,16.154,20.95,16.154,20.95z');
                    em
                        .append('path')
                        .style('fill', '#64A2D8')
                        .attr('d', 'M28.687,18.823c0.281-0.398,0.447-0.884,0.447-1.409c0-1.09-0.711-2.014-1.695-2.331'+
                        'c-0.324-0.141-0.682-0.22-1.059-0.22c-0.014,0-0.027,0.001-0.039,0.001c0.01-0.11,0.016-0.221,0.016-0.332'+
                        'c0-2.185-1.77-3.954-3.953-3.954c-1.77,0-3.269,1.163-3.772,2.767c-0.305-0.468-0.832-0.777-1.432-0.777'+
                        'c-0.944,0-1.709,0.766-1.709,1.709c0,0.155,0.022,0.307,0.062,0.449C14.32,15,13.399,16.1,13.399,17.414'+
                        'c0,1.521,1.233,2.755,2.755,2.755h7.602h1.174h1.785v-0.021C27.562,20.041,28.285,19.534,28.687,18.823z');
                    return div;
                case 'imaps':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 5.5 22)')
                        .style('fill', '#7E9E7B')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 13)
                        .text('iMAP');
                    return div;
                case 'imap':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 5.5 22)')
                        .style('fill', '#7E9E7B')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 13)
                        .text('iMAP');
                    return div;
                case 'openvpn':
                    em
                        .append('path')
                        .style('fill', '#F58220')
                        .attr('d', 'M26.288,24.972l-0.68-4.351c0.944-1.022,1.521-2.389,1.521-3.89'+
                        'c0-3.167-2.565-5.733-5.732-5.733s-5.733,2.566-5.733,5.733c0,1.501,0.579,2.867,1.523,3.89l-0.602,4.396'+
                        'c-2.852-1.66-4.771-4.748-4.771-8.286c0-5.294,4.29-9.583,9.583-9.583s9.583,4.289,9.583,9.583'+
                        'C30.98,20.236,29.096,23.302,26.288,24.972z');
                    em
                        .append('path')
                        .style('fill', '#1B3867')
                        .attr('d', 'M22.408,19.297l1.149,6.35h-4.32l1.176-6.34'+
                        'c-1.148-0.406-1.971-1.502-1.971-2.788c0-1.633,1.324-2.955,2.956-2.955s2.957,1.322,2.957,2.955'+
                        'C24.354,17.797,23.542,18.885,22.408,19.297z');
                    return div;
                case 'pop3':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 6 22)')
                        .style('fill', '#D97373')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 12)
                        .text('POP3');
                    return div;
                case 'dhcp':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 5 22)')
                        .style('fill', '#A0BB71')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 12)
                        .text('DHCP');
                    return div;
                case 'dhcpv6':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 5 22)')
                        .style('fill', '#A0BB71')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 12)
                        .text('DHCP');
                    return div;
                case 'irc':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 11 21)')
                        .style('fill', '#B572AB')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 14)
                        .text('IRC');
                    return div;
                case 'unencryped_jabber':
                    em
                        .append('path')
                        .style('fill', '#FCB415')
                        .attr('d', 'M26.334,16.472c0-0.284-0.053-0.595-0.219-0.834c-0.332-0.479-1.043-0.631-1.539-0.329'+
                        'c-0.25,0.152-0.391,0.419-0.469,0.692c-0.156,0.543-0.084,1.163,0.025,1.708c0.035,0.175,0.07,0.35,0.119,0.521'+
                        'c0.018,0.062,0.025,0.151,0.066,0.203c0.07,0.09,0.24,0.116,0.346,0.099c0.314-0.054,0.236-0.572,0.227-0.793'+
                        'c-0.025-0.516-0.178-1.018-0.029-1.531c0.062-0.218,0.182-0.462,0.402-0.557c0.197-0.085,0.398,0.02,0.477,0.213'+
                        'c0.127,0.313,0.096,0.676,0.174,1.002c0.027,0.11,0.057,0.22,0.107,0.323c0.014,0.03,0.035,0.093,0.076,0.089'+
                        'c0.102-0.01,0.248-0.18,0.324-0.243c0.246-0.204,0.5-0.423,0.785-0.574c0.135-0.071,0.354-0.186,0.49-0.064'+
                        'c0.035,0.03,0.064,0.067,0.088,0.106c0.162,0.251,0.002,0.447-0.104,0.687c-0.135,0.31-0.273,0.617-0.469,0.895'+
                        'c-0.168,0.237-0.398,0.446-0.533,0.706c-0.088,0.168-0.137,0.352-0.1,0.54c0.029,0.153,0.146,0.245,0.303,0.21'+
                        'c0.117-0.027,0.195-0.127,0.262-0.219c0.119-0.166,0.229-0.336,0.348-0.502c0.227-0.318,0.496-0.618,0.688-0.962'+
                        'c0.232-0.414,0.344-0.883,0.342-1.354c0-0.387-0.139-0.975-0.588-1.057c-0.084-0.014-0.182-0.006-0.266,0.009'+
                        'c-0.104,0.018-0.209,0.052-0.305,0.099c-0.254,0.123-0.475,0.307-0.666,0.517c-0.117,0.132-0.225,0.296-0.365,0.402');
                    em
                        .append('path')
                        .style('fill', '#CB2026')
                        .attr('d', 'M25.91,6.934c-0.354,0.046-0.713,0.041-1.068,0.096c-0.682,0.106-1.336,0.317-1.975,0.573'+
                        'c-0.232,0.093-0.461,0.196-0.687,0.306c-0.084,0.041-0.212,0.072-0.279,0.139C21.866,8.08,21.87,8.16,21.866,8.205'+
                        'c-0.013,0.128-0.028,0.255-0.04,0.383c-0.048,0.493-0.082,1.001-0.012,1.493c0.023,0.159,0.072,0.447,0.268,0.478'+
                        'c0.301,0.047,0.534-0.322,0.682-0.527c0.346-0.477,0.736-0.921,1.303-1.134c0.664-0.252,1.426-0.311,2.129-0.359'+
                        'c1.975-0.135,4.133,0.226,5.588,1.681c0.207,0.206,0.402,0.426,0.568,0.667c0.65,0.943,0.996,2.016,1.162,3.142'+
                        'c0.078,0.529,0.131,1.063,0.01,1.591c-0.209,0.913-0.758,1.708-1.389,2.386c-0.432,0.463-0.916,0.883-1.424,1.263'+
                        'c-0.281,0.213-0.598,0.393-0.863,0.625c-0.305,0.268-0.559,0.603-0.752,0.959c-0.52,0.962-0.66,2.118-0.506,3.192'+
                        'c0.029,0.219,0.059,0.439,0.109,0.657c0.014,0.064,0.016,0.176,0.059,0.229c0.078,0.099,0.293,0.153,0.412,0.159'+
                        'c0.125,0.006,0.209-0.09,0.24-0.202c0.053-0.192,0.021-0.405-0.01-0.6c-0.062-0.396-0.119-0.795-0.102-1.197'+
                        'c0.033-0.743,0.32-1.435,0.834-1.974c0.523-0.548,1.23-0.863,1.826-1.321c1.199-0.925,2.273-2.173,2.686-3.656'+
                        'c0.148-0.531,0.197-1.094,0.129-1.64c-0.084-0.691-0.338-1.381-0.576-2.032c-0.725-1.984-1.969-3.871-3.947-4.779'+
                        'c-0.783-0.359-1.604-0.523-2.453-0.642C27.398,6.99,27,6.956,26.598,6.938C26.375,6.93,26.133,6.904,25.91,6.934');
                    em
                        .append('path')
                        .style('fill', '#CB2026')
                        .attr('d', 'M22.818,19.775c-0.385,0.056-0.498,0.364-0.426,0.713c0.092,0.445,0.441,0.785,0.789,1.054'+
                        'c0.891,0.687,2.041,1.058,3.162,1.008c0.438-0.019,0.914-0.091,1.314-0.277c0.215-0.1,0.441-0.457,0.148-0.611'+
                        'c-0.041-0.021-0.094-0.034-0.139-0.04c-0.127-0.022-0.271,0.032-0.393,0.067c-0.215,0.062-0.428,0.124-0.648,0.16'+
                        'c-0.656,0.105-1.369-0.045-1.914-0.436c-0.439-0.314-0.797-0.73-1.133-1.151C23.375,20.005,23.189,19.723,22.818,19.775');
                    em
                        .append('path')
                        .style('fill', '#CB2026')
                        .attr('d', 'M22.318,21.955c-0.099,0.013-0.211,0.009-0.295,0.07c-0.175,0.129,0.019,0.388,0.11,0.505'+
                        'c0.267,0.339,0.619,0.621,0.97,0.869c0.979,0.692,2.086,1.092,3.279,1.174c0.342,0.023,0.691-0.001,1.031-0.058'+
                        'c0.123-0.021,0.277-0.03,0.393-0.083c0.324-0.152,0.23-0.765-0.061-0.9c-0.125-0.06-0.328,0.02-0.461,0.037'+
                        'c-0.312,0.044-0.627,0.048-0.941,0.041c-0.826-0.021-1.707-0.275-2.426-0.677c-0.283-0.158-0.543-0.35-0.785-0.563'+
                        'c-0.148-0.13-0.299-0.343-0.492-0.408C22.553,21.931,22.41,21.942,22.318,21.955');
                    em
                        .append('path')
                        .style('fill', '#CB2026')
                        .attr('d', 'M22.514,23.791c-0.139,0.016-0.245,0.089-0.336,0.191c-0.063,0.072-0.123,0.137-0.159,0.227'+
                        'c-0.2,0.495,0.333,0.963,0.703,1.197c0.41,0.261,0.859,0.453,1.314,0.616c1.031,0.367,2.24,0.601,3.309,0.273'+
                        'c0.318-0.098,0.633-0.275,0.865-0.517c0.129-0.135,0.219-0.341-0.02-0.428c-0.143-0.051-0.314,0.08-0.441,0.132'+
                        'c-0.305,0.122-0.617,0.215-0.943,0.254c-0.43,0.053-0.814-0.043-1.227-0.146c-0.354-0.088-0.711-0.177-1.051-0.304'+
                        'c-0.291-0.108-0.58-0.237-0.836-0.417c-0.074-0.055-0.166-0.102-0.229-0.172c-0.203-0.229-0.357-0.498-0.576-0.717'+
                        'C22.793,23.889,22.658,23.774,22.514,23.791');
                    em
                        .append('path')
                        .style('fill', '#D97373')
                        .attr('d', 'M10.398,16.795v-1.558c0-0.002,0-0.004,0-0.006'+
                        'c0-1.677,0.942-3.209,2.992-3.209c2.008,0,3.039,1.532,3.039,3.209c0,0.002,0,0.004,0,0.006l1.665-0.17c0-0.002,0-0.004,0-0.006'+
                        'c0-2.626-2.113-4.755-4.723-4.755c-2.607,0-4.722,2.129-4.722,4.755c0,0.002,0,0.004,0,0.006v1.728H7.683v7.598h11.413v-7.598'+
                        'H10.398z');
                    return div;
                case 'edonkey':
                    em
                        .append('circle')
                        .style('fill', '#74AA64')
                        .attr('cx', 25)
                        .attr('cy', 23)
                        .attr('r', 0.86);
                    em
                        .append('circle')
                        .style('fill', '#74AA64')
                        .attr('cx', 18)
                        .attr('cy', 23)
                        .attr('r', 0.86);
                    em
                        .append('polygon')
                        .style('fill', '#74AA64')
                        .attr('points', '24.658,7.511 26.215,9.664 31.838,9.664 36.146,8.707 30.283,8.169 ');
                    em
                        .append('polygon')
                        .style('fill', '#74AA64')
                        .attr('points', '18.137,7.511 16.581,9.664 10.958,9.664 6.649,8.707 12.513,8.169 ');
                    em
                        .append('polygon')
                        .style('fill', '#74AA64')
                        .attr('points', '15.146,13.674 17.792,14.212 21.487,14.393 25.047,14.212 27.59,13.674 23.582,7.584 21.368,7.032 19.154,7.619 ');
                    em
                        .append('path')
                        .style('fill', '#D1A047')
                        .attr('d', 'M20.28,6.253L20.25,6.294l1.109-0.295l1.187,0.297l-0.031-0.043l5.729,0.671'+
                        'c-1.848-1.59-4.248-2.555-6.876-2.555c-2.633,0-5.037,0.97-6.887,2.563L20.28,6.253z');
                    em
                        .append('path')
                        .style('fill', '#D1A047')
                        .attr('d', 'M26.807,10.664l2.426,3.685l-1.402,0.297l0.256,1.484v0.086c0,2.234-0.494,4.408-1.383,6.156'+
                        'c0.131,0.255,0.211,0.539,0.211,0.845c0,0.296-0.074,0.571-0.197,0.819c3.119-1.834,5.211-5.227,5.211-9.106'+
                        'c0-1.522-0.338-2.959-0.916-4.266H26.807z');
                    em
                        .append('path')
                        .style('fill', '#D1A047')
                        .attr('d', 'M16.18,23.217c0-0.207,0.042-0.403,0.104-0.589c-0.97-1.793-1.506-4.066-1.506-6.412v-0.075L15,14.665'+
                        'l-1.507-0.307l2.446-3.694h-4.215c-0.579,1.307-0.917,2.743-0.917,4.266c0,4.093,2.333,7.632,5.736,9.384'+
                        'C16.317,24.005,16.18,23.628,16.18,23.217z');
                    em
                        .append('path')
                        .style('fill', '#74AA64')
                        .attr('d', 'M26.812,14.882l-1.508,0.255l-3.818,0.343l-4.139-0.361l-1.331-0.236l-0.239,1.334'+
                        'c0,2.074,0.451,3.963,1.181,5.489c0.307-0.222,0.681-0.356,1.088-0.356c1.03,0,1.868,0.838,1.868,1.868'+
                        'c0,0.548-0.242,1.037-0.62,1.38c0.66,0.432,1.378,0.684,2.137,0.684c0.808,0,1.572-0.285,2.269-0.776'+
                        'c-0.32-0.335-0.521-0.787-0.521-1.287c0-1.03,0.838-1.868,1.867-1.868c0.332,0,0.641,0.094,0.91,0.247'+
                        'c0.699-1.508,1.129-3.356,1.129-5.38L26.812,14.882z');
                    return div;
                case 'steam':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 2.6 22)')
                        .style('fill', '#ffffff')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 12)
                        .text('Steam');
                    return div;
                case 'socks5':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 2.82 22.24)')
                        .style('fill', '#EFAA86')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 11)
                        .text('Socks5');
                    return div;
                case 'ssdp':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 5.5 20.5)')
                        .style('fill', '#B572AB')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 14)
                        .text('ssdp');
                    return div;
                case 'cnn':
                    em
                        .append('path')
                        .style('fill', '#CA2027')
                        .attr('d', 'M32.661,22.437c-0.805,0-1.549-0.401-1.992-1.072l-3.289-5.188c-0.019-0.029-0.051-0.046-0.084-0.046'+
                        'c-0.01,0-0.02,0.001-0.028,0.004c-0.043,0.012-0.072,0.051-0.072,0.096l0.001,3.819c0,1.315-1.071,2.387-2.388,2.387'+
                        'c-0.804,0-1.548-0.401-1.991-1.072l-3.29-5.188c-0.019-0.029-0.051-0.046-0.084-0.046c-0.009,0-0.019,0.001-0.028,0.004'+
                        'c-0.043,0.012-0.072,0.051-0.072,0.096l-0.003,4.137c0,1.135-0.926,2.059-2.064,2.059l-4.76,0.004c-3.686,0-6.685-2.999-6.685-6.685'+
                        'c0-3.687,2.999-6.686,6.685-6.686c0,0,2.319-0.002,2.431-0.001v1.493l-2.431,0.002c-2.862,0-5.191,2.329-5.191,5.191'+
                        's2.329,5.19,5.191,5.19l4.76,0.003c0.315,0,0.571-0.256,0.571-0.571l0.001-8.928c0-0.11,0.09-0.2,0.2-0.2'+
                        'c0.065,0,0.127,0.033,0.165,0.088l5.854,9.22c0.168,0.249,0.444,0.396,0.741,0.396c0.493,0,0.894-0.4,0.894-0.893l-0.002-8.61'+
                        'c0-0.11,0.09-0.2,0.2-0.2c0.065,0,0.128,0.033,0.165,0.088l5.854,9.22c0.168,0.249,0.444,0.396,0.742,0.396'+
                        'c0.492,0,0.893-0.4,0.893-0.893V9.054h1.493l0.001,10.996C35.047,21.365,33.976,22.437,32.661,22.437z'+
                        'M12.516,20.258c-2.48,0-4.498-2.024-4.498-4.513s2.018-4.514,4.498-4.514c0,0,2.32-0.004,2.431-0.003v1.514'+
                        'l-2.431-0.002c-1.657,0-3.005,1.348-3.005,3.005c0,1.665,1.348,3.02,3.005,3.02l2.804-0.004c0.188,0,0.341-0.152,0.341-0.341l0-6.98'+
                        'c0-1.315,1.071-2.387,2.387-2.387c0.807,0,1.554,0.403,1.998,1.079l3.277,5.143c0.02,0.029,0.051,0.046,0.084,0.046'+
                        'c0.01,0,0.02-0.001,0.028-0.004c0.043-0.012,0.072-0.051,0.072-0.096l0.006-3.781c0-1.315,1.071-2.387,2.387-2.387'+
                        'c0.808,0,1.554,0.403,1.997,1.079l3.277,5.143c0.02,0.029,0.051,0.046,0.085,0.046c0.009,0,0.019-0.001,0.028-0.004'+
                        'c0.043-0.012,0.072-0.051,0.072-0.096V9.054h1.504L32.86,20.05c0,0.11-0.09,0.2-0.199,0.2c-0.064,0-0.122-0.029-0.16-0.081'+
                        'l-5.858-9.227c-0.169-0.249-0.445-0.396-0.742-0.396c-0.493,0-0.894,0.4-0.894,0.893l0.002,8.61c0,0.11-0.09,0.2-0.2,0.2'+
                        'c-0.063,0-0.122-0.029-0.159-0.081l-5.859-9.227c-0.167-0.249-0.444-0.396-0.742-0.396c-0.493,0-0.894,0.4-0.894,0.893l0.004,8.678'+
                        'c0,0.078-0.063,0.143-0.141,0.143l0,0L12.516,20.258z');
                    return div;
                case 'windowsupdate':
                    em
                        .append('polygon')
                        .style('fill', '#29ABE2')
                        .attr('points', '22.263,8.218 22.263,3.622 20.269,3.622 20.269,8.276 17.658,6.717 17.658,8.974 21.217,11.1 24.776,8.974 24.776,6.717 ');
                    em
                        .append('polygon')
                        .style('fill', '#29ABE2')
                        .attr('points', '20.824,19.116 20.824,13.749 28.4,12.644 28.4,19.116 ');
                    em
                        .append('polygon')
                        .style('fill', '#29ABE2')
                        .attr('points', '14.311,19.116 14.311,14.7 19.648,13.92 19.648,19.116' );
                    em
                        .append('polygon')
                        .style('fill', '#29ABE2')
                        .attr('points', '14.311,24.771 14.311,20.291 19.648,20.291 19.648,25.559 ');
                    em
                        .append('polygon')
                        .style('fill', '#29ABE2')
                        .attr('points', '20.824,25.732 20.824,20.291 28.4,20.291 28.4,26.85');
                    return div;
                case 'msn':
                    em
                        .append('path')
                        .style('fill', '#1A9FDA')
                        .attr('d', 'M10.416,9.304c-0.364,0.211-0.276,0.898,0.125,1.796'+
                        'c1.406,3.142,3.354,5.711,5.837,7.645c-0.252-1.248-0.172-2.277,0.263-3.182c0.423-0.893,1.201-1.499,2.323-1.797l-0.138-0.858'+
                        'c-1.934-1.762-4.149-3.109-6.648-3.775C11.638,8.988,11.002,8.962,10.416,9.304L10.416,9.304z');
                    em
                        .append('path')
                        .style('fill', '#F3A656')
                        .attr('d', 'M20.165,13.331c0.893,1.511,1.499,2.918,1.842,4.303l0.046,0.252'+
                        'l0.081,0.264c1.121,0.469,2.276,0.686,3.479,0.549c1.247-0.172,2.151-0.687,2.7-1.579l0.652-1.511'+
                        'c-0.824-1.499-2.197-2.448-4.12-2.792C23.208,12.564,21.664,12.736,20.165,13.331L20.165,13.331z');
                    em
                        .append('path')
                        .style('fill', '#055DA7')
                        .attr('d', 'M22.006,17.634c-0.343-1.385-0.949-2.792-1.842-4.303l-0.092-0.125'+
                        'l-0.469-0.733c-0.218-0.297-0.366-0.363-0.561-0.277c-0.204,0.09-0.298,0.243-0.218,0.587v0.125l0.138,0.858l0.034,0.298'+
                        'l1.545,4.257l0.171,0.344c0.516,0.812,1.076,1.499,1.637,2.014l-0.217-2.403l-0.081-0.389L22.006,17.634L22.006,17.634z');
                    em
                        .append('path')
                        .style('fill', '#EB5B2F')
                        .attr('d', 'M20.165,13.331c1.499-0.595,3.044-0.767,4.68-0.515'+
                        'c1.923,0.344,3.296,1.293,4.12,2.792c1.235-3.307,1.421-6.099,0.297-8.285c-0.198-0.387-0.509-0.723-0.857-0.983'+
                        'c-0.682-0.511-1.493-0.423-2.357,0c-3.438,1.683-5.539,3.776-6.271,6.305l0.297,0.562L20.165,13.331L20.165,13.331z');
                    em
                        .append('path')
                        .style('fill', '#08A84E')
                        .attr('d', 'M18.998,14.063l-0.034-0.298c-1.122,0.298-1.9,0.904-2.323,1.797'+
                        'c-0.435,0.904-0.515,1.934-0.263,3.182l0.903,0.606c0.905,0.275,1.802,0.425,2.667,0.126l0.766-0.812l-0.171-0.344L18.998,14.063'+
                        'L18.998,14.063z');
                    em
                        .append('path')
                        .style('fill', '#70BF54')
                        .attr('d', 'M17.281,19.351l-0.903-0.606c0.903,2.323,2.221,4.103,4.13,5.023'+
                        'c0.282,0.137,0.641,0.141,0.938,0.046c0.193-0.062,0.303-0.286,0.39-0.47c0.298-0.632,0.423-1.51,0.515-2.666'+
                        'c-0.561-0.515-1.121-1.201-1.637-2.014l-0.766,0.812C19.131,19.785,18.22,19.616,17.281,19.351L17.281,19.351z');
                    em
                        .append('path')
                        .style('fill', '#FFCB24')
                        .attr('d', 'M25.703,22.863c0.342,0.037,0.621-0.148,0.858-0.344'+
                        'c0.965-0.79,1.691-1.754,2.141-2.963c0.489-1.32,0.56-2.609,0.263-3.948l-0.652,1.511c-0.549,0.893-1.453,1.407-2.7,1.579'+
                        'c-1.202,0.137-2.357-0.08-3.479-0.549v0.125l0.217,2.403c0.767,0.812,1.706,1.522,2.792,2.014'+
                        'C25.321,22.772,25.508,22.843,25.703,22.863L25.703,22.863z');
                    return div;
                case 'flash':
                    em
                        .append('path')
                        .style('fill', '#D91F26')
                        .attr('d', 'M27.738,6.285l-0.121,3.553c0,0-4.175,0.83-4.295,3.904h2.383l0.125,3.551l-4.178-0.117'+
                        'c0,0-1.792,7.338-8.477,7.221l-0.119-3.312c0,0,3.581,0.234,5.492-6.158C18.548,14.926,20.573,6.406,27.738,6.285z');
                    return div;
                case 'stun':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 7.8 20.5)')
                        .style('fill', '#EFAA86')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 13)
                        .text('stun');
                    return div;
                case 'rtmp':
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 8 20.5)')
                        .style('fill', '#AE6498')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 12)
                        .text('rtmp');
                    return div;
                default:

                    return div;
            }
        }
        return appIcon;
    }
]);

angular.module('mean.pages').factory('mimeIcon', [
    function() {
        var mimeIcon = function(mime) {
            // only run if mime contains a / (otherwise it'll break trying to match nothing)
            var mime = mime.toLowerCase();
            // create an empty div
            var div = $('<div></div>');
            // split mime into array
            var match = mime.match(/(\w+)\/(.*)/);
            // append base svg
            var elm = d3.select(div[0])
                .append('svg')
                .attr('x',0)
                .attr('y',0)
                .attr('width','42.795px')
                .attr('height','42.795px')
                .attr('viewBox','0 0 42.795 42.795')
                .attr('enable-background','new 0 0 42.795 42.795')
                .attr('xml:space','preserve');

            var tip = d3.tip()
                .attr('class', 't-tip')
                .offset([-30, 0])
                .html(function(d) {
                    return mime;
                });
            elm.call(tip);
            elm
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            var em = elm.append('g');
            var bg = em.append('circle').attr('cx', 21.398).attr('cy', 21.398).attr('r', 21.398);

            if (mime.search('/') !== -1){
                // make input lowercase
                if (!match) return mimeIcon;
                if (match[1] == 'application') {
                    // background color generated here
                    bg.style('fill', '#989898');
                    em
                        .append('path')
                        .style('fill', '#BDCE80')
                        .attr('d', 'M18.515,6.498h5.769c0.482,0,0.876-0.401,0.876-0.89V0.351C23.936,0.133,22.684,0,21.398,0'+
                        'c-1.286,0-2.539,0.133-3.762,0.351v5.258C17.637,6.097,18.033,6.498,18.515,6.498z'+
                        'M27.857,15.981h5.767c0.481,0,0.876-0.401,0.876-0.892V9.245c0-0.487-0.395-0.888-0.876-0.888h-5.767'+
                        'c-0.484,0-0.877,0.401-0.877,0.888v5.844C26.98,15.58,27.373,15.981,27.857,15.981z'+
                        'M9.172,6.498h5.768c0.483,0,0.879-0.401,0.879-0.89V0.761c-2.772,0.748-5.318,2.032-7.523,3.745v1.103'+
                        'C8.295,6.097,8.691,6.498,9.172,6.498z'+
                        'M9.172,15.981h5.768c0.483,0,0.879-0.401,0.879-0.892V9.245c0-0.487-0.396-0.888-0.879-0.888H9.172'+
                        'c-0.48,0-0.876,0.401-0.876,0.888v5.844C8.295,15.58,8.691,15.981,9.172,15.981z'+
                        'M26.98,0.761v4.847c0,0.489,0.393,0.89,0.877,0.89h5.767c0.481,0,0.876-0.401,0.876-0.89V4.506'+
                        'C32.296,2.793,29.751,1.509,26.98,0.761z'+
                        'M25.159,15.089V9.245c0-0.487-0.394-0.888-0.876-0.888h-5.769c-0.481,0-0.878,0.401-0.878,0.888v5.844'+
                        'c0,0.49,0.396,0.892,0.878,0.892h5.769C24.766,15.981,25.159,15.58,25.159,15.089z');
                    // switch between text
                    switch(match[2]) {
                        case 'x-bzip2':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 9.2139 33)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 14)
                                .text('BZ2');
                            return div;
                        case 'octet-stream':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 9 29)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 8)
                                .text('01001');
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 9 37)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 8)
                                .text('10011');
                            return div;
                        case 'xml':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 8 33)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 13)
                                .text('XML');
                            return div;
                        case 'x-gzip':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 10 34)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 15)
                                .text('GZ');
                            return div;
                        case 'x-shockwave-flash':
                            em
                                .append('path')
                                .style('fill', '#c3c3c3')
                                .attr('d', 'M28.614,21.494l-0.121,3.552c0,0-4.175,0.83-4.295,3.904h2.383l0.125,3.551l-4.178-0.117'+
                                    'c0,0-1.792,7.338-8.477,7.221l-0.119-3.312c0,0,3.581,0.234,5.492-6.158C19.425,30.134,21.449,21.615,28.614,21.494z');
                            return div;
                        case 'pdf':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 9.4 33)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 14)
                                .text('PDF');
                            return div;
                        case 'rpm':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 5.2 31.6)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 12)
                                .text('x-rpm');
                            return div;
                        case 'pgp-signature':
                            em
                                .append('path')
                                .style('fill', '#c3c3c3')
                                .attr('d', 'M26.946,29.114V27.06l0,0c0-0.002,0-0.004,0-0.007'+
                                    'c0-3.123-2.514-5.655-5.617-5.655c-3.102,0-5.615,2.532-5.615,5.655c0,0.003,0,0.005,0,0.007v2.055h-1.15v9.037h13.574v-9.037'+
                                    'H26.946z M24.966,27.262v1.853h-7.174v-1.853c0-0.003,0-0.005,0-0.007c0-1.994,1.121-3.817,3.559-3.817'+
                                    'c2.389,0,3.615,1.823,3.615,3.817C24.966,27.257,24.966,27.259,24.966,27.262z');
                            em
                                .append('path')
                                .style('fill', '#c3c3c3')
                                .attr('d', 'M40.007,18.596l-0.76-2.507l-2.023-1.661l-2.605-0.257l-2.31,1.234'+
                                    'l-1.234,2.311l0.21,2.897l1.773,1.253l-1.381,7.327l1.922,2.132l1.729-8.689l2.096,8.806l1.93-2.054l-1.364-7.604l1.259-0.682'+
                                    'L40.007,18.596z');
                            return div;
                        case 'postscript':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 8.95 34.57)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 15)
                                .text('P.S.');
                            return div;
                        case 'ttf':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 10.6 35.39)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 15)
                                .text('TTF');
                            return div;
                        case 'x-dosexec':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 8.8 34.54)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 12)
                                .text('>_');
                            em
                                .append('path')
                                .style('fill', '#c3c3c3')
                                .attr('d', 'M32.643,27.167l1.274-1.784l-1.396-1.396l-1.784,1.274l-1.058-0.438l-0.36-2.162h-1.975l-0.36,2.162'+
                                    'l-1.059,0.438l-1.783-1.274l-1.396,1.396l1.274,1.784l-0.438,1.058l-2.162,0.36v1.975l2.162,0.36l0.438,1.058l-1.274,1.784'+
                                    'l1.396,1.396l1.783-1.274l1.059,0.438l0.36,2.162h1.975l0.36-2.162l1.058-0.438l1.784,1.274l1.396-1.396l-1.274-1.784l0.438-1.058'+
                                    'l2.162-0.36v-1.975l-2.162-0.36L32.643,27.167L32.643,27.167z M28.331,31.547l-1.975-1.975l1.975-1.975l1.975,1.975L28.331,31.547'+
                                    'L28.331,31.547z');
                            return div;
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 8.79 34.54)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 12)
                                .text('>_');
                            return div;
                        case 'x-elc':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 10 34)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 15)
                                .text('elc');
                            return div;
                        case 'ogg':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 6 31)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 14)
                                .text('ogg');
                            return div;
                        case 'zip':
                            em
                                .append('polygon')
                                .style('fill', '#c3c3c3')
                                .attr('points', '29.796,38.05 29.796,37.1 26.946,37.1 25.996,36.15 '+
                                    '25.996,34.25 27.896,34.25 27.896,31.4 25.996,31.4 25.996,26.275 27.896,26.275 27.896,23.9 25.521,23.9 22.671,22 16.021,22 '+
                                    '14.121,23.9 21.721,23.9 24.096,26.275 24.096,31.4 21.721,33.775 14.121,33.775 15.546,35.675 22.196,35.675 24.096,34.25 '+
                                    '24.096,36.15 23.146,37.1 20.296,37.1 20.296,38.05 23.146,38.05 24.096,39 25.996,39 26.946,38.05');
                            em
                                .append('polygon')
                                .style('fill', '#c3c3c3')
                                .attr('points', '20.296,32.825 21.721,31.4 21.721,24.85 13.171,24.85 11.746,26.275 11.746,32.825 ');
                            return div;
                        case 'x-bittorrent':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 7 32)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 14)
                                .text('BiTor');
                            return div;
                        case 'x-123':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 8.5 33)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 14)
                                .text('123');
                            return div;
                        case 'x-debian-package':
                            em
                                .append('polygon') 
                                .style('fill', '#c3c3c3')
                                .attr('points', '10.467,25.523 10.769,37.056 21.318,40.852 33.12,36.923 33.501,26.235 21.446,28.821 ');
                            em
                                .append('polygon')
                                .style('fill', '#c3c3c3')
                                .attr('points', '21.243,27.438 20.304,24.354 8.904,21.212 10.184,24.305 ');
                            em
                                .append('polygon')
                                .style('fill', '#c3c3c3')
                                .attr('points', '23.912,18.623 21.368,22.557 33.308,25.523 35.929,21.412 ');
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 11.5 36.7)')
                                .style('fill', '#989898')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 10)
                                .text('deb');
                            return div;
                        case 'x-tar':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 9 33)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 14)
                                .text('TAR');
                            return div;
                        case 'vnd.ms-cab-compressed':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 14 33.6)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 12)
                                .text('cab');
                            em
                                .append('polygon')
                                .style('fill', '#c3c3c3')
                                .attr('points', '6.887,20.771 6.887,21.721 9.736,21.721 10.687,22.67 '+
                                '10.687,24.57 8.786,24.57 8.786,27.42 10.687,27.42 10.687,32.545 8.786,32.545 8.786,34.92 11.161,34.92 14.012,36.82 '+
                                '20.661,36.82 22.562,34.92 14.962,34.92 12.587,32.545 12.587,27.42 14.962,25.045 22.562,25.045 21.137,23.146 14.486,23.146 '+
                                '12.587,24.57 12.587,22.67 13.536,21.721 16.387,21.721 16.387,20.771 13.536,20.771 12.587,19.82 10.687,19.82 9.736,20.771 ');
                            return div;
                        case 'vnd.ms-fontobject':
                            em
                                .append('path')
                                .style('fill', '#c3c3c3')
                                .attr('d', 'M13.984,21.387c0-0.504,0-0.61-0.504-0.61h-1.303c-1.535,0-1.977,0.842-2.608,2.377'+
                                'c-0.251,0.125-0.65,0.084-0.777-0.189c0.442-1.45,0.547-2.754,0.694-3.575c0.083-0.062,0.189-0.104,0.294-0.104'+
                                'c0.106,0,0.211,0.021,0.295,0.084c0.105,0.358,0.167,0.441,1.766,0.441h7.82c1.389,0,1.703-0.021,1.893-0.462'+
                                'c0.084-0.042,0.146-0.063,0.273-0.063c0.125,0,0.273,0.084,0.314,0.147c-0.21,0.715-0.356,2.418-0.314,3.616'+
                                'c-0.104,0.189-0.673,0.23-0.777,0.062c-0.358-1.345-0.652-2.334-2.229-2.334H17.56c-0.506,0-0.568,0.064-0.568,0.61v9.271'+
                                'c0,1.955,0.127,2.123,1.073,2.249l0.84,0.105c0.147,0.127,0.147,0.609,0,0.735c-1.366-0.042-2.418-0.062-3.363-0.062'+
                                'c-1.009,0-2.103,0.021-3.574,0.062c-0.168-0.126-0.168-0.608,0-0.735l0.946-0.105c0.946-0.104,1.071-0.294,1.071-2.249V21.387z');
                            em
                                .append('path')
                                .style('fill', '#c3c3c3')
                                .attr('d', 'M24.675,26.729c0-0.504,0-0.61-0.504-0.61h-1.303c-1.535,0-1.977,0.842-2.608,2.377'+
                                'c-0.251,0.125-0.65,0.084-0.777-0.189c0.442-1.45,0.547-2.754,0.694-3.575c0.083-0.062,0.189-0.104,0.294-0.104'+
                                'c0.106,0,0.211,0.021,0.295,0.084c0.105,0.358,0.167,0.441,1.766,0.441h7.82c1.389,0,1.703-0.021,1.893-0.462'+
                                'c0.084-0.042,0.146-0.063,0.273-0.063c0.125,0,0.273,0.084,0.314,0.147c-0.21,0.715-0.356,2.418-0.314,3.616'+
                                'c-0.104,0.189-0.673,0.23-0.777,0.062c-0.358-1.345-0.652-2.334-2.229-2.334H28.25c-0.506,0-0.568,0.064-0.568,0.61v9.271'+
                                'c0,1.955,0.127,2.123,1.073,2.249l0.84,0.105c0.147,0.127,0.147,0.609,0,0.735c-1.366-0.042-2.418-0.062-3.363-0.062'+
                                'c-1.009,0-2.103,0.021-3.574,0.062c-0.168-0.126-0.168-0.608,0-0.735l0.946-0.105c0.946-0.104,1.071-0.294,1.071-2.249V26.729z');
                            return div;
                        case 'x-tex-tfm':
                            em
                                .append('path')
                                .style('fill', '#c3c3c3')
                                .attr('d', 'M13.984,21.387c0-0.504,0-0.61-0.504-0.61h-1.303c-1.535,0-1.977,0.842-2.608,2.377'+
                                'c-0.251,0.125-0.65,0.084-0.777-0.189c0.442-1.45,0.547-2.754,0.694-3.575c0.083-0.062,0.189-0.104,0.294-0.104'+
                                'c0.106,0,0.211,0.021,0.295,0.084c0.105,0.358,0.167,0.441,1.766,0.441h7.82c1.389,0,1.703-0.021,1.893-0.462'+
                                'c0.084-0.042,0.146-0.063,0.273-0.063c0.125,0,0.273,0.084,0.314,0.147c-0.21,0.715-0.356,2.418-0.314,3.616'+
                                'c-0.104,0.189-0.673,0.23-0.777,0.062c-0.358-1.345-0.652-2.334-2.229-2.334H17.56c-0.506,0-0.568,0.064-0.568,0.61v9.271'+
                                'c0,1.955,0.127,2.123,1.073,2.249l0.84,0.105c0.147,0.127,0.147,0.609,0,0.735c-1.366-0.042-2.418-0.062-3.363-0.062'+
                                'c-1.009,0-2.103,0.021-3.574,0.062c-0.168-0.126-0.168-0.608,0-0.735l0.946-0.105c0.946-0.104,1.071-0.294,1.071-2.249V21.387z');
                            em
                                .append('path')
                                .style('fill', '#c3c3c3')
                                .attr('d', 'M24.675,26.729c0-0.504,0-0.61-0.504-0.61h-1.303c-1.535,0-1.977,0.842-2.608,2.377'+
                                'c-0.251,0.125-0.65,0.084-0.777-0.189c0.442-1.45,0.547-2.754,0.694-3.575c0.083-0.062,0.189-0.104,0.294-0.104'+
                                'c0.106,0,0.211,0.021,0.295,0.084c0.105,0.358,0.167,0.441,1.766,0.441h7.82c1.389,0,1.703-0.021,1.893-0.462'+
                                'c0.084-0.042,0.146-0.063,0.273-0.063c0.125,0,0.273,0.084,0.314,0.147c-0.21,0.715-0.356,2.418-0.314,3.616'+
                                'c-0.104,0.189-0.673,0.23-0.777,0.062c-0.358-1.345-0.652-2.334-2.229-2.334H28.25c-0.506,0-0.568,0.064-0.568,0.61v9.271'+
                                'c0,1.955,0.127,2.123,1.073,2.249l0.84,0.105c0.147,0.127,0.147,0.609,0,0.735c-1.366-0.042-2.418-0.062-3.363-0.062'+
                                'c-1.009,0-2.103,0.021-3.574,0.062c-0.168-0.126-0.168-0.608,0-0.735l0.946-0.105c0.946-0.104,1.071-0.294,1.071-2.249V26.729z');
                            return div;
                        case 'x-font-sfn':
                            em
                                .append('path')
                                .style('fill', '#c3c3c3')
                                .attr('d', 'M13.984,21.387c0-0.504,0-0.61-0.504-0.61h-1.303c-1.535,0-1.977,0.842-2.608,2.377'+
                                'c-0.251,0.125-0.65,0.084-0.777-0.189c0.442-1.45,0.547-2.754,0.694-3.575c0.083-0.062,0.189-0.104,0.294-0.104'+
                                'c0.106,0,0.211,0.021,0.295,0.084c0.105,0.358,0.167,0.441,1.766,0.441h7.82c1.389,0,1.703-0.021,1.893-0.462'+
                                'c0.084-0.042,0.146-0.063,0.273-0.063c0.125,0,0.273,0.084,0.314,0.147c-0.21,0.715-0.356,2.418-0.314,3.616'+
                                'c-0.104,0.189-0.673,0.23-0.777,0.062c-0.358-1.345-0.652-2.334-2.229-2.334H17.56c-0.506,0-0.568,0.064-0.568,0.61v9.271'+
                                'c0,1.955,0.127,2.123,1.073,2.249l0.84,0.105c0.147,0.127,0.147,0.609,0,0.735c-1.366-0.042-2.418-0.062-3.363-0.062'+
                                'c-1.009,0-2.103,0.021-3.574,0.062c-0.168-0.126-0.168-0.608,0-0.735l0.946-0.105c0.946-0.104,1.071-0.294,1.071-2.249V21.387z');
                            em
                                .append('path')
                                .style('fill', '#c3c3c3')
                                .attr('d', 'M24.675,26.729c0-0.504,0-0.61-0.504-0.61h-1.303c-1.535,0-1.977,0.842-2.608,2.377'+
                                'c-0.251,0.125-0.65,0.084-0.777-0.189c0.442-1.45,0.547-2.754,0.694-3.575c0.083-0.062,0.189-0.104,0.294-0.104'+
                                'c0.106,0,0.211,0.021,0.295,0.084c0.105,0.358,0.167,0.441,1.766,0.441h7.82c1.389,0,1.703-0.021,1.893-0.462'+
                                'c0.084-0.042,0.146-0.063,0.273-0.063c0.125,0,0.273,0.084,0.314,0.147c-0.21,0.715-0.356,2.418-0.314,3.616'+
                                'c-0.104,0.189-0.673,0.23-0.777,0.062c-0.358-1.345-0.652-2.334-2.229-2.334H28.25c-0.506,0-0.568,0.064-0.568,0.61v9.271'+
                                'c0,1.955,0.127,2.123,1.073,2.249l0.84,0.105c0.147,0.127,0.147,0.609,0,0.735c-1.366-0.042-2.418-0.062-3.363-0.062'+
                                'c-1.009,0-2.103,0.021-3.574,0.062c-0.168-0.126-0.168-0.608,0-0.735l0.946-0.105c0.946-0.104,1.071-0.294,1.071-2.249V26.729z');
                            return div;
                        case 'vnd.ms-opentype':
                            em
                                .append('path')
                                .style('fill', '#c3c3c3')
                                .attr('d', 'M13.984,21.387c0-0.504,0-0.61-0.504-0.61h-1.303c-1.535,0-1.977,0.842-2.608,2.377'+
                                'c-0.251,0.125-0.65,0.084-0.777-0.189c0.442-1.45,0.547-2.754,0.694-3.575c0.083-0.062,0.189-0.104,0.294-0.104'+
                                'c0.106,0,0.211,0.021,0.295,0.084c0.105,0.358,0.167,0.441,1.766,0.441h7.82c1.389,0,1.703-0.021,1.893-0.462'+
                                'c0.084-0.042,0.146-0.063,0.273-0.063c0.125,0,0.273,0.084,0.314,0.147c-0.21,0.715-0.356,2.418-0.314,3.616'+
                                'c-0.104,0.189-0.673,0.23-0.777,0.062c-0.358-1.345-0.652-2.334-2.229-2.334H17.56c-0.506,0-0.568,0.064-0.568,0.61v9.271'+
                                'c0,1.955,0.127,2.123,1.073,2.249l0.84,0.105c0.147,0.127,0.147,0.609,0,0.735c-1.366-0.042-2.418-0.062-3.363-0.062'+
                                'c-1.009,0-2.103,0.021-3.574,0.062c-0.168-0.126-0.168-0.608,0-0.735l0.946-0.105c0.946-0.104,1.071-0.294,1.071-2.249V21.387z');
                            em
                                .append('path')
                                .style('fill', '#c3c3c3')
                                .attr('d', 'M24.675,26.729c0-0.504,0-0.61-0.504-0.61h-1.303c-1.535,0-1.977,0.842-2.608,2.377'+
                                'c-0.251,0.125-0.65,0.084-0.777-0.189c0.442-1.45,0.547-2.754,0.694-3.575c0.083-0.062,0.189-0.104,0.294-0.104'+
                                'c0.106,0,0.211,0.021,0.295,0.084c0.105,0.358,0.167,0.441,1.766,0.441h7.82c1.389,0,1.703-0.021,1.893-0.462'+
                                'c0.084-0.042,0.146-0.063,0.273-0.063c0.125,0,0.273,0.084,0.314,0.147c-0.21,0.715-0.356,2.418-0.314,3.616'+
                                'c-0.104,0.189-0.673,0.23-0.777,0.062c-0.358-1.345-0.652-2.334-2.229-2.334H28.25c-0.506,0-0.568,0.064-0.568,0.61v9.271'+
                                'c0,1.955,0.127,2.123,1.073,2.249l0.84,0.105c0.147,0.127,0.147,0.609,0,0.735c-1.366-0.042-2.418-0.062-3.363-0.062'+
                                'c-1.009,0-2.103,0.021-3.574,0.062c-0.168-0.126-0.168-0.608,0-0.735l0.946-0.105c0.946-0.104,1.071-0.294,1.071-2.249V26.729z');
                            return div;
                        case 'x-font-ttf':
                            em
                                .append('path')
                                .style('fill', '#c3c3c3')
                                .attr('d', 'M13.984,21.387c0-0.504,0-0.61-0.504-0.61h-1.303c-1.535,0-1.977,0.842-2.608,2.377'+
                                'c-0.251,0.125-0.65,0.084-0.777-0.189c0.442-1.45,0.547-2.754,0.694-3.575c0.083-0.062,0.189-0.104,0.294-0.104'+
                                'c0.106,0,0.211,0.021,0.295,0.084c0.105,0.358,0.167,0.441,1.766,0.441h7.82c1.389,0,1.703-0.021,1.893-0.462'+
                                'c0.084-0.042,0.146-0.063,0.273-0.063c0.125,0,0.273,0.084,0.314,0.147c-0.21,0.715-0.356,2.418-0.314,3.616'+
                                'c-0.104,0.189-0.673,0.23-0.777,0.062c-0.358-1.345-0.652-2.334-2.229-2.334H17.56c-0.506,0-0.568,0.064-0.568,0.61v9.271'+
                                'c0,1.955,0.127,2.123,1.073,2.249l0.84,0.105c0.147,0.127,0.147,0.609,0,0.735c-1.366-0.042-2.418-0.062-3.363-0.062'+
                                'c-1.009,0-2.103,0.021-3.574,0.062c-0.168-0.126-0.168-0.608,0-0.735l0.946-0.105c0.946-0.104,1.071-0.294,1.071-2.249V21.387z');
                            em
                                .append('path')
                                .style('fill', '#c3c3c3')
                                .attr('d', 'M24.675,26.729c0-0.504,0-0.61-0.504-0.61h-1.303c-1.535,0-1.977,0.842-2.608,2.377'+
                                'c-0.251,0.125-0.65,0.084-0.777-0.189c0.442-1.45,0.547-2.754,0.694-3.575c0.083-0.062,0.189-0.104,0.294-0.104'+
                                'c0.106,0,0.211,0.021,0.295,0.084c0.105,0.358,0.167,0.441,1.766,0.441h7.82c1.389,0,1.703-0.021,1.893-0.462'+
                                'c0.084-0.042,0.146-0.063,0.273-0.063c0.125,0,0.273,0.084,0.314,0.147c-0.21,0.715-0.356,2.418-0.314,3.616'+
                                'c-0.104,0.189-0.673,0.23-0.777,0.062c-0.358-1.345-0.652-2.334-2.229-2.334H28.25c-0.506,0-0.568,0.064-0.568,0.61v9.271'+
                                'c0,1.955,0.127,2.123,1.073,2.249l0.84,0.105c0.147,0.127,0.147,0.609,0,0.735c-1.366-0.042-2.418-0.062-3.363-0.062'+
                                'c-1.009,0-2.103,0.021-3.574,0.062c-0.168-0.126-0.168-0.608,0-0.735l0.946-0.105c0.946-0.104,1.071-0.294,1.071-2.249V26.729z');
                            return div;
                        case 'jar':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 9 33)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 13)
                                .text('JAR');
                            return div;
                        case 'x-rpm':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 9 33)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 13)
                                .text('RPM');
                            return div;
                        default:

                            return div;
                    }
                }
                if (match[1] == 'text') {
                    // background color generated here
                    bg.style('fill', '#989898');
                    em
                        .append('path')
                        .style('fill', '#D0C7FF')
                        .attr('d', 'M9.228,16.602h3.212V6.845h2.465V4.023H9.053C8.24,4.608,7.468,5.244,6.746,5.934v0.911h2.482V16.602z');
                    em
                        .append('polygon')
                        .style('fill', '#D0C7FF')
                        .attr('points', '27.774,16.602 23.422,9.973 27.263,4.023 23.643,4.023 21.552,7.61 19.394,4.023 15.756,4.023 '+ 
                        '19.648,9.905 15.246,16.602 18.833,16.602 21.417,12.148 24.136,16.602 ');
                    em
                        .append('path')
                        .style('fill', '#D0C7FF')
                        .attr('d', 'M33.969,4.023h-5.837v2.822h2.481v9.757h3.212V6.845h2.465V5.948C35.564,5.252,34.788,4.611,33.969,4.023z');
                    // switch between text
                    switch(match[2]) {
                        case 'plain':
                            return div;
                        case 'pgp':
                            em
                                .append('path')
                                .style('fill', '#c3c3c3')
                                .attr('d', 'M27.17,29.272v-2.055l0,0c0-0.003,0-0.005,0-0.007'+
                                    'c0-3.123-2.514-5.655-5.617-5.655c-3.102,0-5.615,2.532-5.615,5.655c0,0.002,0,0.004,0,0.007v2.055h-1.15v9.036h13.574v-9.036H27.17'+
                                    'z M25.189,27.42v1.853h-7.174V27.42c0-0.003,0-0.005,0-0.008c0-1.994,1.121-3.816,3.559-3.816c2.389,0,3.615,1.822,3.615,3.816'+
                                    'C25.189,27.415,25.189,27.417,25.189,27.42z');
                            return div;
                        case 'html':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 9.3936 34.5557)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 14)
                                .text('</>');
                            return div;
                        case 'x-shellscript':
                            em
                                .append('path')
                                .style('fill', '#c3c3c3')
                                .attr('d', 'M31.665,28.999l-3.078,2.764l2.616-3.812l-1.848-3.234l-3,4.674'+
                                    'l2.261-5.285l-2.771-2.01l-1.979,6.074l0.871-6.336l-3.325-0.612l-0.277,6.502l-0.462-6.415l-3.416,0.699l1.043,6.115l-1.874-5.854'+
                                    'l-2.957,2.186l2.013,4.537l-2.659-4.1l-1.661,3.496l2.982,3.938l-3.445-2.978l-0.461,2.797l5.265,3.408v2.973l5.877,0.861'+
                                    'l5.574-1.037l0.093-2.797l4.987-3.496L31.665,28.999z M21.218,32.666l-4.573,1.927v-1.576l3.061-1.053l-3.061-1.035v-1.576'+
                                    'l4.573,1.928V32.666z M26.042,35.376h-4.501v-0.45h4.501V35.376z');
                            return div;
                        case 'x-c++':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 6.9932 33.5557)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 14)
                                .text('C++');
                            return div;
                        case 'x-c':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 15 35)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 15)
                                .text('C');
                            return div;
                        case 'fortran':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 8.0713 34.5557)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 14)
                                .text('Fortran');
                            return div;
                        case 'x-asm':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 7.3218 32.9746)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 14)
                                .text('asm');
                            return div;                 
                        case 'troff':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 7.8828 34)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 14)
                                .text('troff');
                        return div;
                        case 'x-pascal':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 8.8 34)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 14)
                                .text('Pas');
                        return div;
                        case 'x-diff':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 9 34)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 14)
                                .text('diff');
                        return div;
                        default:

                            return div;
                    }
                }
                if (match[1] == 'image') {
                    // background color generated here
                    bg.style('fill', '#989898');
                    em
                        .append('path')
                        .style('fill', '#93CDE8')
                        .attr('d', 'M42.078,15.98C39.676,6.792,31.342,0,21.398,0C10.924,0,2.221,7.534,0.376,17.474l11.757-7.152l9.506,5.928'+
                        'l-2.232-2.265l9.326-6.869L42.078,15.98z'+
                        'M16.02,8.862c-1.439,0-2.605-1.167-2.605-2.605s1.166-2.604,2.605-2.604'+
                        'c1.438,0,2.604,1.165,2.604,2.604S17.458,8.862,16.02,8.862z')
                    // switch between text
                    switch(match[2]) {
                        case 'jpeg':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 6.5 33)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 13)
                                .text('JPEG');
                            return div;
                        case 'png':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 8 33)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 13)
                                .text('PNG');
                            return div;
                        case 'gif':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 11 33)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 13)
                                .text('GIF');
                            return div;
                        case 'x-icon':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 6 31)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 12)
                                .text('X-ICO');
                            return div;
                        case 'svg+xml':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 6 30)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 12)
                                .text('S+xml');
                            return div;
                        case 'x-ms-bmp':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 8 32)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 13)
                                .text('BMP');
                            return div;
                        default:

                            return div;
                    }
                }
                if (match[1] == 'audio') {
                    // background color generated here
                    bg.style('fill', '#989898');
                    em
                        .append('path')
                        .style('fill', '#64D698')
                        .attr('fill-rule', 'evenodd')
                        .attr('clip-rule', 'evenodd')
                        .attr('d', 'M37.457,7.287c-0.062,1.312-0.03,2.372-0.443,0.528'+
                        'c-0.537-2.393-0.858-1.329-1.073,1.118c-0.213,2.446-0.322,1.808-0.697,0c-0.375-1.809-0.215-1.118-0.643,0.16'+
                        'c-0.43,1.275-0.484,3.882-0.807,2.499c-0.32-1.383-0.482,1.276-1.234-1.17c-0.75-2.447-0.482,1.648-1.18-2.553'+
                        'c-0.697-4.204-0.643-1.703-1.18,0.158C29.663,9.892,29.556,9.2,29.341,7.87s-0.59-1.011-0.805,0.105'+
                        'c-0.215,1.118-0.162,4.788-0.322,3.777c-0.16-1.012-0.482-1.33-0.645-0.054c-0.16,1.276-0.16-1.063-0.215-2.074'+
                        'c-0.053-1.011-0.375-0.904-0.428,0c-0.055,0.904-0.484,2.926-0.592,2.233c-0.107-0.691-0.479-0.095-0.547,0.112l-0.002-0.006'+
                        'c0,0,0.127-1.097-0.381-0.386c-0.117-0.617-0.291-1.061-0.465-0.412c-0.215,0.798-0.643,0.105-0.752-0.638'+
                        'c-0.105-0.746-0.588-0.852-0.697-1.649C23.39,8.128,22.89,8.613,22.46,9.039c-0.482,0.479-1.127,2.926-1.502-0.585'+
                        'c-0.377-3.511-0.752-2.499-1.234-1.223c-0.484,1.275-0.537,2.552-0.967-1.437s-0.805-1.542-0.857-0.106'+
                        'c-0.055,1.437,0.32,7.555-0.592-0.585c-0.912-8.138-0.857-0.585-1.072,1.011s0,4.096-0.537,1.701'+
                        'c-0.537-2.393-0.859-1.329-1.074,1.118c-0.213,2.446-0.32,1.808-0.697,0c-0.375-1.809-0.215-1.118-0.643,0.16'+
                        'c-0.43,1.275-0.484,3.882-0.807,2.499c-0.32-1.383-0.482,1.276-1.232-1.17c-0.752-2.447-0.482,1.648-1.182-2.553'+
                        'c-0.697-4.204-0.643-1.703-1.18,0.158C8.347,9.892,8.238,9.2,8.023,7.87s-0.59-1.011-0.805,0.105'+
                        'c-0.213,1.118-0.162,4.788-0.322,3.777c-0.16-1.012-0.482-1.33-0.645-0.054c-0.16,1.276-0.16-1.063-0.215-2.074'+
                        'c-0.053-1.011-0.375-0.904-0.428,0c-0.055,0.904-0.484,2.926-0.59,2.233c-0.109-0.691-0.27-1.011-0.377-0.531'+
                        'c-0.105,0.479-0.375,1.489-0.482,0.692c-0.107-0.799-0.322-1.65-0.537-0.853c-0.2,0.745-0.584,0.188-0.722-0.494'+
                        'c-0.632,1.088-1.165,2.236-1.6,3.435c0.126,0.575,0.266,1.292,0.39,2.117c0.23,1.534,0.375,1.012,0.482,0.213'+
                        'c0.107-0.798,0.592-0.904,0.699-1.65c0.107-0.745,0.535-1.438,0.75-0.639s0.43-0.054,0.537-0.853s0.377,0.213,0.482,0.691'+
                        'c0.107,0.48,0.268,0.161,0.377-0.532c0.105-0.691,0.535,1.332,0.59,2.236c0.053,0.906,0.375,1.013,0.428,0'+
                        'c0.055-1.012,0.055-3.354,0.215-2.075c0.162,1.277,0.484,0.958,0.645-0.054s0.109,2.662,0.322,3.782'+
                        'c0.215,1.117,0.59,1.436,0.805,0.104s0.323-2.023,0.86-0.159s0.482,4.368,1.18,0.159c0.699-4.206,0.43-0.104,1.182-2.556'+
                        'c0.75-2.45,0.912,0.214,1.232-1.172c0.322-1.385,0.377,1.226,0.807,2.503c0.428,1.277,0.268,1.97,0.643,0.16'+
                        'c0.377-1.811,0.484-2.45,0.697,0c0.215,2.45,0.537,3.516,1.074,1.117c0.537-2.395,0.322,0.108,0.537,1.705'+
                        'c0.215,1.598,0.16,9.159,1.072,1.012s0.537-2.024,0.592-0.585c0.053,1.437,0.428,3.888,0.857-0.107'+
                        'c0.43-3.993,0.482-2.716,0.967-1.438c0.482,1.278,0.857,2.29,1.234-1.225c0.375-3.515,1.02-1.064,1.502-0.586'+
                        'c0.43,0.427,0.93,0.912,1.031,0.159c0.109-0.798,0.592-0.904,0.697-1.65c0.109-0.745,0.537-1.438,0.752-0.639'+
                        'c0.174,0.648,0.348,0.204,0.465-0.413c0.508,0.711,0.381-0.386,0.381-0.386l0.002-0.005c0.068,0.206,0.439,0.804,0.547,0.11'+
                        'c0.107-0.691,0.537,1.332,0.592,2.236c0.053,0.906,0.375,1.013,0.428,0c0.055-1.012,0.055-3.354,0.215-2.075'+
                        'c0.162,1.277,0.484,0.958,0.645-0.054s0.107,2.662,0.322,3.782c0.215,1.117,0.59,1.436,0.805,0.104s0.322-2.023,0.859-0.159'+
                        's0.482,4.368,1.18,0.159c0.697-4.206,0.43-0.104,1.18-2.556c0.752-2.45,0.914,0.214,1.234-1.172'+
                        'c0.322-1.385,0.377,1.226,0.807,2.503c0.428,1.277,0.268,1.97,0.643,0.16c0.375-1.811,0.484-2.45,0.697,0'+
                        'c0.215,2.45,0.536,3.516,1.073,1.117c0.537-2.395,0.322,0.108,0.537,1.705c0.213,1.598,0.16,9.159,1.072,1.012'+
                        's0.537-2.024,0.592-0.585c0.053,1.437,0.428,3.888,0.857-0.107c0.43-3.993,0.482-2.716,0.967-1.438'+
                        'c0.48,1.278,0.857,2.29,1.234-1.225c0.003-0.031,0.007-0.054,0.011-0.084C41.493,13.191,39.8,9.951,37.457,7.287zw')
                    // switch between text
                    switch(match[2]) {
                        case 'mpeg':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 6 34)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 11)
                                .text('MPEG');
                            return div;
                        case 'mp4':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 9 34)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 12)
                                .text('mp4');
                            return div;
                        default:

                            return div;
                    }
                }
                if (match[1] == 'video') {
                    // background color generated here
                    bg.style('fill', '#989898');
                    em
                        .append('path')
                        .style('fill', '#CFBD63')
                        .attr('fill-rule', 'evenodd')
                        .attr('clip-rule', 'evenodd')
                        .attr('d', 'M16.346,16.707c0,0.229,0.182,0.414,0.412,0.414h1.122c0.226,0,0.412-0.185,0.412-0.414v-1.95'+
                        'c0-0.229-0.187-0.415-0.412-0.415h-1.122c-0.23,0-0.412,0.186-0.412,0.415V16.707z'+
                        'M12.152,14.342c-0.228,0-0.416,0.186-0.416,0.415v1.95c0,0.229,0.188,0.414,0.416,0.414h1.122'+
                        'c0.23,0,0.412-0.185,0.412-0.414v-1.95c0-0.229-0.182-0.415-0.412-0.415H12.152z'+
                        'M7.549,17.121h1.116c0.23,0,0.418-0.185,0.418-0.414v-1.95c0-0.229-0.188-0.415-0.418-0.415H7.549'+
                        'c-0.229,0-0.417,0.186-0.417,0.415v1.95C7.132,16.937,7.32,17.121,7.549,17.121z'+
                        'M14.329,1.221C8.886,3.128,4.458,7.165,2.032,12.341h12.297V1.221z'+
                        'M36.919,16.707v-1.95c0-0.229-0.19-0.415-0.418-0.415h-1.116c-0.229,0-0.419,0.186-0.419,0.415v1.95'+
                        'c0,0.228,0.189,0.414,0.419,0.414h1.116C36.729,17.121,36.919,16.935,36.919,16.707z'+
                        'M21.399,0c-1.434,0-2.833,0.147-4.188,0.416v11.925h23.554C37.353,5.057,29.976,0,21.399,0z'+
                        'M41.108,14.342h-1.121c-0.228,0-0.416,0.186-0.416,0.415v1.95c0,0.228,0.188,0.414,0.416,0.414h1.121'+
                        'c0.229,0,0.412-0.187,0.412-0.414v-1.95C41.521,14.527,41.338,14.342,41.108,14.342z'+
                        'M27.168,17.121c0.228,0,0.415-0.187,0.415-0.414v-1.95c0-0.229-0.188-0.415-0.415-0.415h-1.123'+
                        'c-0.226,0-0.412,0.186-0.412,0.415v1.95c0,0.228,0.187,0.414,0.412,0.414H27.168z'+
                        'M22.896,16.707v-1.95c0-0.229-0.185-0.415-0.418-0.415h-1.119c-0.227,0-0.416,0.186-0.416,0.415v1.95'+
                        'c0,0.228,0.189,0.414,0.416,0.414h1.119C22.711,17.121,22.896,16.935,22.896,16.707z'+
                        'M31.774,17.121c0.228,0,0.412-0.187,0.412-0.414v-1.95c0-0.229-0.185-0.415-0.412-0.415H30.65'+
                        'c-0.229,0-0.415,0.186-0.415,0.415v1.95c0,0.228,0.186,0.414,0.415,0.414H31.774z'+
                        'M4.649,14.342H3.525c-0.23,0-0.416,0.186-0.416,0.415v1.95c0,0.229,0.186,0.414,0.416,0.414h1.124'+
                        'c0.228,0,0.411-0.185,0.411-0.414v-1.95C5.061,14.527,4.877,14.342,4.649,14.342z');
                    // switch between text
                    switch(match[2]) {
                        case 'mp4':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 7 33)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 13)
                                .text('mp4');
                            return div;
                        case 'x-flv':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 7.7 34)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 12)
                                .text('Flash');
                            return div;
                        case 'webm':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 3.2 31)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 12)
                                .text('webm');
                            return div;
                        case 'mp2t':
                            em
                                .append('text')
                                .attr('transform', 'matrix(1 0 0 1 6.2 32.5)')
                                .style('fill', '#c3c3c3')
                                .attr('font-family', 'ITCAvantGardeStd-Bk')
                                .attr('font-size', 12)
                                .text('mp2t');
                            return div;
                        default:

                            return div;
                    }
                }
            } else {
                bg.style('fill', '#919191');
                    em
                        .append('path')
                        .style('fill', '#c3c3c3')
                        .attr('d', 'M0,21.397c0,5.32,1.953,10.176,5.166,13.919h32.466c3.213-3.743,5.165-8.599,5.165-13.919'+
                        'c0-5.398-2.015-10.316-5.313-14.081H5.314C2.016,11.081,0,15.999,0,21.397z');
                    em
                        .append('text')
                        .attr('transform', 'matrix(1 0 0 1 6.2 26)')
                        .style('fill', '#919191')
                        .attr('font-family', 'ITCAvantGardeStd-Bk')
                        .attr('font-size', 16)
                        .text('n/a');
                return div;
            }
        }
        return mimeIcon;
    }
]);
