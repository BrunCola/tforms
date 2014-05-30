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
		if (app.search('/') === -1) return;
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
				bg.style('fill', '#BBBBBB');
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
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Md')
							.attr('font-size', 14)
							.text('BZ2');
						return div;
					case 'octet-stream':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 9 29)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Md')
							.attr('font-size', 8)
							.text('01001');
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 9 37)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Md')
							.attr('font-size', 8)
							.text('10011');
						return div;
					case 'xml':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 9.2 35)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Md')
							.attr('font-size', 13)
							.text('XML');
						return div;
					case 'x-gzip':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 9.8 35)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Md')
							.attr('font-size', 16)
							.text('GZ');
						return div;
					case 'flash':
						em
							.append('path')
							.style('fill', '#7F7F7F')
							.attr('d', 'M28.614,21.494l-0.121,3.552c0,0-4.175,0.83-4.295,3.904h2.383l0.125,3.551l-4.178-0.117'+
								'c0,0-1.792,7.338-8.477,7.221l-0.119-3.312c0,0,3.581,0.234,5.492-6.158C19.425,30.134,21.449,21.615,28.614,21.494z');
						return div;
					case 'pdf':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 9.4 34.6)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Md')
							.attr('font-size', 14)
							.text('PDF');
						return div;
					case 'rpm':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 5.2 31.6)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 12)
							.text('x-rpm');
						return div;
					case 'pgp-signature':
						em
							.append('path')
							.attr('fill-rule', 'evenodd')
							.attr('clip-rule', 'evenodd') 
							.style('fill', '#7F7F7F')
							.attr('d', 'M26.946,29.114V27.06l0,0c0-0.002,0-0.004,0-0.007'+
								'c0-3.123-2.514-5.655-5.617-5.655c-3.102,0-5.615,2.532-5.615,5.655c0,0.003,0,0.005,0,0.007v2.055h-1.15v9.037h13.574v-9.037'+
								'H26.946z M24.966,27.262v1.853h-7.174v-1.853c0-0.003,0-0.005,0-0.007c0-1.994,1.121-3.817,3.559-3.817'+
								'c2.389,0,3.615,1.823,3.615,3.817C24.966,27.257,24.966,27.259,24.966,27.262z');
						em
							.append('path')
							.attr('fill-rule', 'evenodd')
							.attr('clip-rule', 'evenodd') 
							.style('fill', '#7F7F7F')
							.attr('d', 'M40.007,18.596l-0.76-2.507l-2.023-1.661l-2.605-0.257l-2.31,1.234'+
								'l-1.234,2.311l0.21,2.897l1.773,1.253l-1.381,7.327l1.922,2.132l1.729-8.689l2.096,8.806l1.93-2.054l-1.364-7.604l1.259-0.682'+
								'L40.007,18.596z');
						return div;
					case 'postscript':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 8.95 34.57)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Md')
							.attr('font-size', 15)
							.text('P.S.');
						return div;
					case 'ttf':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 10.6 35.39)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Md')
							.attr('font-size', 15)
							.text('TTF');
						return div;
					case 'x-dosexec':
						em
							.append('path')
							.style('fill', '#7F7F7F')
							.attr('d', 'M32.643,27.167l1.274-1.784l-1.396-1.396l-1.784,1.274l-1.058-0.438l-0.36-2.162h-1.975l-0.36,2.162'+
								'l-1.059,0.438l-1.783-1.274l-1.396,1.396l1.274,1.784l-0.438,1.058l-2.162,0.36v1.975l2.162,0.36l0.438,1.058l-1.274,1.784'+
								'l1.396,1.396l1.783-1.274l1.059,0.438l0.36,2.162h1.975l0.36-2.162l1.058-0.438l1.784,1.274l1.396-1.396l-1.274-1.784l0.438-1.058'+
								'l2.162-0.36v-1.975l-2.162-0.36L32.643,27.167L32.643,27.167z M28.331,31.547l-1.975-1.975l1.975-1.975l1.975,1.975L28.331,31.547'+
								'L28.331,31.547z');
						return div;
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 8.79 34.54)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Bold')
							.attr('font-size', 12)
							.text('>_');
						return div;
					case 'x-elc':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 9.384 36)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Md')
							.attr('font-size', 15)
							.text('elc');
						return div;
					case 'ogg':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 5.825 33)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Md')
							.attr('font-size', 14)
							.text('ogg');
						return div;
					case 'zip':
						em
							.append('polygon')
							.attr('fill-rule', 'evenodd')
							.attr('clip-rule', 'evenodd') 
							.style('fill', '#7F7F7F')
							.attr('points', '29.796,38.05 29.796,37.1 26.946,37.1 25.996,36.15 '+
								'25.996,34.25 27.896,34.25 27.896,31.4 25.996,31.4 25.996,26.275 27.896,26.275 27.896,23.9 25.521,23.9 22.671,22 16.021,22 '+
								'14.121,23.9 21.721,23.9 24.096,26.275 24.096,31.4 21.721,33.775 14.121,33.775 15.546,35.675 22.196,35.675 24.096,34.25 '+
								'24.096,36.15 23.146,37.1 20.296,37.1 20.296,38.05 23.146,38.05 24.096,39 25.996,39 26.946,38.05');
						em
							.append('polygon')
							.attr('fill-rule', 'evenodd')
							.attr('clip-rule', 'evenodd') 
							.style('fill', '#7F7F7F')
							.attr('points', '20.296,32.825 21.721,31.4 21.721,24.85 13.171,24.85 11.746,26.275 11.746,32.825 ');
						return div;
				}
			}
			if (match[1] == 'text') {
				// background color generated here
				bg.style('fill', '#BBBBBB');
				em
					.append('path')
					.style('fill', '#727272')
					.attr('d', 'M0.104,19.335h42.589c-0.562-5.875-3.5-11.051-7.842-14.567H7.945C3.604,8.284,0.667,13.46,0.104,19.335z');
				em
					.append('text')
					.attr('transform', 'matrix(1 0 0 1 11.4263 16.5557)')
					.style('fill', '#A5A5A5')
					.attr('font-family', 'ITCAvantGardeStd-Md')
					.attr('font-size', 11)
					.text('txt')
				// switch between text
				switch(match[2]) {
					case 'plain':
						em
							.append('path')
							.style('fill', '#727272')
							.attr('d', 'M0.104,19.335h42.589c-0.562-5.875-3.5-11.051-7.842-14.567H7.945C3.604,8.284,0.667,13.46,0.104,19.335z');
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 11.4263 16.5557)')
							.style('fill', '#A5A5A5')
							.attr('font-family', 'ITCAvantGardeStd-Md')
							.attr('font-size', 11)
							.text('txt')
						return div;
					case 'pgp':
						em
							.append('path')
							.attr('fill-rule', 'evenodd')
							.attr('clip-rule', 'evenodd') 
							.style('fill', '#7F7F7F')
							.attr('d', 'M27.17,29.272v-2.055l0,0c0-0.003,0-0.005,0-0.007'+
								'c0-3.123-2.514-5.655-5.617-5.655c-3.102,0-5.615,2.532-5.615,5.655c0,0.002,0,0.004,0,0.007v2.055h-1.15v9.036h13.574v-9.036H27.17'+
								'z M25.189,27.42v1.853h-7.174V27.42c0-0.003,0-0.005,0-0.008c0-1.994,1.121-3.816,3.559-3.816c2.389,0,3.615,1.822,3.615,3.816'+
								'C25.189,27.415,25.189,27.417,25.189,27.42z');
						return div;
					case 'html':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 9.3936 34.5557)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Md')
							.attr('font-size', 14)
							.text('</>');
						return div;
					case 'x-shellscript':
						em
							.append('path')
							.attr('fill-rule', 'evenodd')
							.attr('clip-rule', 'evenodd') 
							.style('fill', '#7F7F7F')
							.attr('d', 'M31.665,28.999l-3.078,2.764l2.616-3.812l-1.848-3.234l-3,4.674'+
								'l2.261-5.285l-2.771-2.01l-1.979,6.074l0.871-6.336l-3.325-0.612l-0.277,6.502l-0.462-6.415l-3.416,0.699l1.043,6.115l-1.874-5.854'+
								'l-2.957,2.186l2.013,4.537l-2.659-4.1l-1.661,3.496l2.982,3.938l-3.445-2.978l-0.461,2.797l5.265,3.408v2.973l5.877,0.861'+
								'l5.574-1.037l0.093-2.797l4.987-3.496L31.665,28.999z M21.218,32.666l-4.573,1.927v-1.576l3.061-1.053l-3.061-1.035v-1.576'+
								'l4.573,1.928V32.666z M26.042,35.376h-4.501v-0.45h4.501V35.376z');
						return div;
					case 'c++':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 6.9932 33.5557)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 14)
							.text('C++');
						return div;
					case 'fortran':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 8.0713 34.5557)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 14)
							.text('Fortran');
						return div;
					case 'asm':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 7.3218 32.9746)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 14)
							.text('Fortran');
						return div;					
					case 'troff':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 7.8828 34)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 14)
							.text('TROFF');
					return div;
				}
			}
		}
		return mimeIcon;
	}
]);