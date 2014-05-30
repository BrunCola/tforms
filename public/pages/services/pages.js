'use strict';

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

// angular.module('mean.pages').factory('appIcon', [
// 	function() {
// 		var appIcon = function(app) {
// 			var app = app.toLowerCase();
// 			switch(app) {
// 				case 'http':
// 					return '<svg version="1.1" id="Layer_1" x="0px" y="0px" width="42.794px" height="42.795px" viewBox="0 0 42.794 42.795" enable-background="new 0 0 42.794 42.795" xml:space="preserve"> <g> <g> <defs> <circle id="SVGID_1_" cx="21.397" cy="21.398" r="21.397"/> </defs> <use xlink:href="#SVGID_1_"  overflow="visible" fill="#BBBDBF"/> <clipPath id="SVGID_2_"> <use xlink:href="#SVGID_1_"  overflow="visible"/> </clipPath> </g> <g> <g> <path fill-rule="evenodd" clip-rule="evenodd" fill="#F3BD5D" d="M16.223,4.356h-4c-0.333,0-0.607,0.278-0.607,0.617v4.056 c0,0.339,0.274,0.615,0.607,0.615h4c0.335,0,0.609-0.276,0.609-0.615V4.974C16.832,4.635,16.558,4.356,16.223,4.356z M23.398,4.356h-4.001c-0.334,0-0.607,0.278-0.607,0.617v4.056c0,0.339,0.273,0.615,0.607,0.615h4.001 c0.334,0,0.607-0.276,0.607-0.615V4.974C24.005,4.635,23.732,4.356,23.398,4.356z M30.572,4.356h-4 c-0.336,0-0.609,0.278-0.609,0.617v4.056c0,0.339,0.273,0.615,0.609,0.615h4c0.334,0,0.607-0.276,0.607-0.615V4.974 C31.179,4.635,30.906,4.356,30.572,4.356z M16.223,33.629h-4c-0.333,0-0.607,0.277-0.607,0.617v4.053 c0,0.34,0.274,0.618,0.607,0.618h4c0.335,0,0.609-0.278,0.609-0.618v-4.053C16.832,33.906,16.558,33.629,16.223,33.629z M23.398,33.629h-4.001c-0.334,0-0.607,0.277-0.607,0.617v4.053c0,0.34,0.273,0.618,0.607,0.618h4.001 c0.334,0,0.607-0.278,0.607-0.618v-4.053C24.005,33.906,23.732,33.629,23.398,33.629z M30.572,33.629h-4 c-0.336,0-0.609,0.277-0.609,0.617v4.053c0,0.34,0.273,0.618,0.609,0.618h4c0.334,0,0.607-0.278,0.607-0.618v-4.053 C31.179,33.906,30.906,33.629,30.572,33.629z"/> </g> </g> <text transform="matrix(1 0 0 1 7.4443 26.3291)" fill="#939393" font-family="ITCAvantGardeStd-Bk" font-size="14">http</text> </g> </svg>';
// 			}
// 		}
// 		return appIcon;
// 	}
// ]);
// 

angular.module('mean.pages').factory('appIcon', [
	function() {
		var appIcon = function(app) {
if (mime.search('/') === -1) return;
			// make input lowercase
			var app = app.toLowerCase();
			// create an empty div
			var div = $('<div></div>');
			// split app into array
			var match = app.match(/(\w+)\/(.*)/);
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

			if (!match) return appIcon;
			if (match[1] == 'CHANGE THIS') {
				// background color generated here
				bg.style('fill', '#BBBDBF');
				em
					.append('path')
					.style('fill', '#CHANGE THIS')
					.attr('d', 'CHANGE THIS');
				// switch between text
				switch(match[2]) {
					case 'CHANGE THIS':
						em
							.append('CHANGE THIS')
						return div;
				}
			}
		}
		return appIcon;
	}
]);

angular.module('mean.pages').factory('mimeIcon', [
	function() {
		var mimeIcon = function(mime) {
			// only run if mime contains a / (otherwise it'll break trying to match nothing)
			if (mime.search('/') === -1) return;
			// make input lowercase
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

			if (!match) return mimeIcon;
			if (match[1] == 'application') {
				// background color generated here
				bg.style('fill', '#BBBDBF');
				em
					.append('path')
					.style('fill', '#F68D55')
					.attr('d', 'M33.923,4.074H8.874c-5.032,3.644-8.402,9.414-8.807,16h42.663C42.325,13.488,38.954,7.718,33.923,4.074z'+
						'M17.822,16.487c0,0.267-0.215,0.484-0.478,0.484h-3.134c-0.261,0-0.477-0.218-0.477-0.484v-3.176c0-0.265,0.216-0.482,0.477-0.482'+
						'h3.134c0.263,0,0.478,0.218,0.478,0.482V16.487z M17.822,10.792c0,0.266-0.215,0.483-0.478,0.483h-3.134'+
						'c-0.261,0-0.477-0.218-0.477-0.483V7.616c0-0.266,0.216-0.483,0.477-0.483h3.134c0.263,0,0.478,0.218,0.478,0.483V10.792z'+
						'M23.441,16.487c0,0.267-0.214,0.484-0.477,0.484H19.83c-0.261,0-0.476-0.218-0.476-0.484v-3.176c0-0.265,0.215-0.482,0.476-0.482'+
						'h3.135c0.263,0,0.477,0.218,0.477,0.482V16.487z M23.441,10.792c0,0.266-0.214,0.483-0.477,0.483H19.83'+
						'c-0.261,0-0.476-0.218-0.476-0.483V7.616c0-0.266,0.215-0.483,0.476-0.483h3.135c0.263,0,0.477,0.218,0.477,0.483V10.792z'+
						'M29.061,16.487c0,0.267-0.215,0.484-0.477,0.484h-3.133c-0.264,0-0.478-0.218-0.478-0.484v-3.176c0-0.265,0.214-0.482,0.478-0.482'+
						'h3.133c0.262,0,0.477,0.218,0.477,0.482V16.487z M29.061,10.792c0,0.266-0.215,0.483-0.477,0.483h-3.133'+
						'c-0.264,0-0.478-0.218-0.478-0.483V7.616c0-0.266,0.214-0.483,0.478-0.483h3.133c0.262,0,0.477,0.218,0.477,0.483V10.792z');
				// switch between text
				switch(match[2]) {
					case 'x-bzip2':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 9.2139 34.9146)')
							.style('fill', '#7A7A7A')
							.attr('font-family', 'ITCAvantGardeStd-Md')
							.attr('font-size', 14)
							.text('BZ2');
						return div;
				}
			}
		}
		return mimeIcon;
	}
]);