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
					case 'x-shockwave-flash':
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
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 8.8 34.54)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Md')
							.attr('font-size', 12)
							.text('>_');
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
					case 'x-asm':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 7.3218 32.9746)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 14)
							.text('asm');
						return div;					
					case 'troff':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 7.8828 34)')
							.style('fill', '#7F7F7F')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 14)
							.text('troff');
					return div;
				}
			}
			if (match[1] == 'image') {
				// background color generated here
				bg.style('fill', '#bababa');
				em
					.append('path')
					.style('fill', '#6f8ebc')
					.attr('d', 'M21.398,0C9.892,0,0.533,9.091,0.047,20.477L13.552,8.381l14.223,14.436l-3.466-5.684l6.782-5.225'+
					'l11.646,10.668c0.021-0.392,0.06-0.78,0.06-1.178C42.797,9.582,33.217,0,21.398,0z M21.768,8.562c-1.462,0-2.646-1.186-2.646-2.646'+
					's1.185-2.645,2.646-2.645c1.461,0,2.645,1.184,2.645,2.645S23.229,8.562,21.768,8.562z')
				// switch between text
				switch(match[2]) {
					case 'jpeg':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 7 34)')
							.style('fill', '#6f8ebc')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 12)
							.text('JPEG');
						return div;
					case 'png':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 8 35)')
							.style('fill', '#6f8ebc')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 12)
							.text('PNG');
						return div;
					case 'gif':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 11 36)')
							.style('fill', '#6f8ebc')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 12)
							.text('GIF');
						return div;
					case 'x-icon':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 6.5 33)')
							.style('fill', '#6f8ebc')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 11)
							.text('X-ICO');
						return div;
					case 'svg+xml':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 6 32)')
							.style('fill', '#6f8ebc')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 11)
							.text('S-XML');
						return div;
				}
			}
			if (match[1] == 'audio') {
				// background color generated here
				bg.style('fill', '#919191');
				em
					.append('path')
					.style('fill', '#6FBF9B')
					.attr('fill-rule', 'evenodd')
					.attr('clip-rule', 'evenodd')
					.attr('d', 'M37.457,7.287c-0.062,1.312-0.03,2.372-0.443,0.528'+
					'c-0.537-2.393-0.858-1.329-1.073,1.118c-0.213,2.446-0.322,1.808-0.697,0c-0.375-1.809-0.215-1.118-0.643,0.16'+
					'c-0.43,1.275-0.484,3.882-0.807,2.499c-0.32-1.383-0.482,1.276-1.234-1.17c-0.75-2.447-0.482,1.648-1.18-2.553'+
					'c-0.697-4.204-0.643-1.703-1.18,0.158C29.663,9.892,29.556,9.2,29.341,7.87s-0.59-1.011-0.805,0.105'+
					'c-0.215,1.118-0.162,4.788-0.322,3.777c-0.16-1.012-0.482-1.33-0.645-0.054c-0.16,1.276-0.16-1.063-0.215-2.074'+
					'c-0.053-1.011-0.375-0.904-0.428,0c-0.055,0.904-0.484,2.926-0.592,2.233c-0.107-0.691-0.268-1.011-0.375-0.531'+
					'c-0.039,0.18-0.104,0.437-0.172,0.644l-0.002-0.006c0,0,0.127-1.097-0.381-0.386c-0.117-0.617-0.291-1.061-0.465-0.412'+
					'c-0.215,0.798-0.643,0.105-0.752-0.638c-0.105-0.746-0.588-0.852-0.697-1.649c-0.102-0.752-0.236-1.256-0.443-0.031'+
					'c-0.365-1.118-0.158-0.235-0.588,0.19c-0.482,0.479-1.127,2.926-1.502-0.585c-0.377-3.511-0.752-2.499-1.234-1.223'+
					'c-0.484,1.275-0.537,2.552-0.967-1.437s-0.805-1.542-0.857-0.106c-0.055,1.437,0.32,7.555-0.592-0.585'+
					'c-0.912-8.138-0.857-0.585-1.072,1.011s0,4.096-0.537,1.701c-0.537-2.393-0.859-1.329-1.074,1.118c-0.213,2.446-0.32,1.808-0.697,0'+
					'c-0.375-1.809-0.215-1.118-0.643,0.16c-0.43,1.275-0.484,3.882-0.807,2.499c-0.32-1.383-0.482,1.276-1.232-1.17'+
					'c-0.752-2.447-0.482,1.648-1.182-2.553c-0.697-4.204-0.643-1.703-1.18,0.158C8.347,9.892,8.238,9.2,8.023,7.87'+
					's-0.59-1.011-0.805,0.105c-0.213,1.118-0.162,4.788-0.322,3.777c-0.16-1.012-0.482-1.33-0.645-0.054'+
					'c-0.16,1.276-0.16-1.063-0.215-2.074c-0.053-1.011-0.375-0.904-0.428,0c-0.055,0.904-0.484,2.926-0.59,2.233'+
					'c-0.109-0.691-0.27-1.011-0.377-0.531c-0.105,0.479-0.375,1.489-0.482,0.692c-0.107-0.799-0.322-1.65-0.537-0.853'+
					'c-0.2,0.745-0.584,0.188-0.722-0.494c-0.632,1.088-1.165,2.236-1.6,3.435c0.126,0.575,0.266,1.292,0.39,2.117'+
					'c0.23,1.534,0.375,1.012,0.482,0.213c0.107-0.798,0.592-0.904,0.699-1.65c0.107-0.745,0.535-1.438,0.75-0.639'+
					's0.43-0.054,0.537-0.853s0.377,0.213,0.482,0.691c0.107,0.48,0.268,0.161,0.377-0.532c0.105-0.691,0.535,1.332,0.59,2.236'+
					'c0.053,0.906,0.375,1.013,0.428,0c0.055-1.012,0.055-3.354,0.215-2.075c0.162,1.277,0.484,0.958,0.645-0.054'+
					's0.109,2.662,0.322,3.782c0.215,1.117,0.59,1.436,0.805,0.104s0.323-2.023,0.86-0.159s0.482,4.368,1.18,0.159'+
					'c0.699-4.206,0.43-0.104,1.182-2.556c0.75-2.45,0.912,0.214,1.232-1.172c0.322-1.385,0.377,1.226,0.807,2.503'+
					'c0.428,1.277,0.268,1.97,0.643,0.16c0.377-1.811,0.484-2.45,0.697,0c0.215,2.45,0.537,3.516,1.074,1.117'+
					'c0.537-2.395,0.322,0.108,0.537,1.705c0.215,1.598,0.16,9.159,1.072,1.012s0.537-2.024,0.592-0.585'+
					'c0.053,1.437,0.428,3.888,0.857-0.107c0.43-3.993,0.482-2.716,0.967-1.438c0.482,1.278,0.857,2.29,1.234-1.225'+
					'c0.375-3.515,1.02-1.064,1.502-0.586c0.43,0.427,0.223,1.312,0.588,0.19c0.207,1.228,0.342,0.722,0.443-0.031'+
					'c0.109-0.798,0.592-0.904,0.697-1.65c0.109-0.745,0.537-1.438,0.752-0.639c0.174,0.648,0.348,0.204,0.465-0.413'+
					'c0.508,0.711,0.381-0.386,0.381-0.386l0.002-0.005c0.068,0.206,0.133,0.463,0.172,0.643c0.107,0.48,0.268,0.161,0.375-0.532'+
					'c0.107-0.691,0.537,1.332,0.592,2.236c0.053,0.906,0.375,1.013,0.428,0c0.055-1.012,0.055-3.354,0.215-2.075'+
					'c0.162,1.277,0.484,0.958,0.645-0.054s0.107,2.662,0.322,3.782c0.215,1.117,0.59,1.436,0.805,0.104s0.322-2.023,0.859-0.159'+
					's0.482,4.368,1.18,0.159c0.697-4.206,0.43-0.104,1.18-2.556c0.752-2.45,0.914,0.214,1.234-1.172'+
					'c0.322-1.385,0.377,1.226,0.807,2.503c0.428,1.277,0.268,1.97,0.643,0.16c0.375-1.811,0.484-2.45,0.697,0'+
					'c0.215,2.45,0.536,3.516,1.073,1.117c0.537-2.395,0.322,0.108,0.537,1.705c0.213,1.598,0.16,9.159,1.072,1.012'+
					's0.537-2.024,0.592-0.585c0.053,1.437,0.428,3.888,0.857-0.107c0.43-3.993,0.482-2.716,0.967-1.438'+
					'c0.48,1.278,0.857,2.29,1.234-1.225c0.003-0.031,0.007-0.054,0.011-0.084C41.493,13.191,39.8,9.951,37.457,7.287z')
				// switch between text
				switch(match[2]) {
					case 'mpeg':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 6 34)')
							.style('fill', '#6FBF9B')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 11)
							.text('MPEG');
						return div;
					case 'mp4':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 9 34)')
							.style('fill', '#6FBF9B')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 11)
							.text('mp4');
						return div;
				}
			}
			if (match[1] == 'video') {
				// background color generated here
				bg.style('fill', '#bababa');
				em
					.append('path')
					.style('fill', '#d97373')
					.attr('fill-rule', 'evenodd')
					.attr('clip-rule', 'evenodd')
					.attr('d', 'M9.474,21.308c0.142,0,0.256-0.115,0.256-0.258v-1.211c0-0.143-0.114-0.258-0.256-0.258H8.775'+
					'c-0.143,0-0.258,0.115-0.258,0.258v1.211c0,0.143,0.115,0.258,0.258,0.258H9.474z'+
					'M12.41,21.308c0.143,0,0.259-0.115,0.259-0.258v-1.211c0-0.143-0.116-0.258-0.259-0.258h-0.694'+
					'c-0.143,0-0.26,0.115-0.26,0.258v1.211c0,0.143,0.117,0.258,0.26,0.258H12.41z'+
					'M15.272,21.308c0.143,0,0.257-0.115,0.257-0.258v-1.211c0-0.143-0.114-0.258-0.257-0.258h-0.696'+
					'c-0.142,0-0.258,0.115-0.258,0.258v1.211c0,0.143,0.116,0.258,0.258,0.258H15.272z'+
					'M0.863,21.308c0.141,0,0.257-0.115,0.257-0.258v-1.211c0-0.143-0.116-0.258-0.257-0.258H0.167'+
					'c-0.03,0-0.05,0.022-0.077,0.032c-0.044,0.539-0.078,1.08-0.082,1.629c0.045,0.036,0.098,0.065,0.159,0.065H0.863z'+
					'M6.869,21.05v-1.211c0-0.143-0.115-0.258-0.259-0.258H5.914c-0.142,0-0.257,0.115-0.257,0.258v1.211'+
					'c0,0.143,0.115,0.258,0.257,0.258H6.61C6.754,21.308,6.869,21.192,6.869,21.05z'+
					'M3.697,21.308c0.144,0,0.259-0.115,0.259-0.258v-1.211c0-0.143-0.115-0.258-0.259-0.258H3.002'+
					'c-0.142,0-0.258,0.115-0.258,0.258v1.211c0,0.143,0.116,0.258,0.258,0.258H3.697z'+
					'M7.83,4.854c-4.256,3.494-7.14,8.596-7.721,14.379h18.845h0.104V4.854h-0.104H7.83z'+
					'M8.775,4.404h0.698c0.142,0,0.256-0.116,0.256-0.257V3.476c-0.396,0.258-0.774,0.536-1.15,0.819'+
					'C8.626,4.357,8.69,4.404,8.775,4.404z'+
					'M18.134,4.404c0.141,0,0.257-0.116,0.257-0.257V2.935c0-0.142-0.116-0.257-0.257-0.257h-0.696'+
					'c-0.144,0-0.257,0.115-0.257,0.257v1.213c0,0.141,0.113,0.257,0.257,0.257H18.134z'+
					'M12.41,4.404c0.143,0,0.259-0.116,0.259-0.257V2.935c0-0.142-0.116-0.257-0.259-0.257h-0.694'+
					'c-0.143,0-0.26,0.115-0.26,0.257v1.213c0,0.141,0.117,0.257,0.26,0.257H12.41z'+
					'M18.134,21.308c0.141,0,0.257-0.115,0.257-0.258v-1.211c0-0.143-0.116-0.258-0.257-0.258h-0.696'+
					'c-0.144,0-0.257,0.115-0.257,0.258v1.211c0,0.143,0.113,0.258,0.257,0.258H18.134z'+
					'M15.272,4.404c0.143,0,0.257-0.116,0.257-0.257V2.935c0-0.142-0.114-0.257-0.257-0.257h-0.696'+
					'c-0.142,0-0.258,0.115-0.258,0.257v1.213c0,0.141,0.116,0.257,0.258,0.257H15.272z'+
					'M32.512,21.308c0.142,0,0.257-0.115,0.257-0.258v-1.211c0-0.143-0.115-0.258-0.257-0.258h-0.695'+
					'c-0.143,0-0.26,0.115-0.26,0.258v1.211c0,0.143,0.117,0.258,0.26,0.258H32.512z'+
					'M42.097,19.233v-3.185c-1.149-4.457-3.676-8.359-7.128-11.194H20.101h-0.104v14.379h0.104h21.895H42.097z'+
					'M35.449,19.581h-0.695c-0.142,0-0.258,0.115-0.258,0.258v1.211c0,0.143,0.116,0.258,0.258,0.258h0.695'+
					'c0.143,0,0.26-0.115,0.26-0.258v-1.211C35.709,19.696,35.592,19.581,35.449,19.581z'+
					'M20.989,19.581h-0.696c-0.143,0-0.257,0.115-0.257,0.258v1.211c0,0.143,0.114,0.258,0.257,0.258h0.696'+
					'c0.143,0,0.257-0.115,0.257-0.258v-1.211C21.246,19.696,21.132,19.581,20.989,19.581z'+
					'M23.901,21.308c0.142,0,0.258-0.115,0.258-0.258v-1.211c0-0.143-0.116-0.258-0.258-0.258h-0.694'+
					'c-0.144,0-0.259,0.115-0.259,0.258v1.211c0,0.143,0.115,0.258,0.259,0.258H23.901z'+
					'M26.736,21.308c0.144,0,0.258-0.115,0.258-0.258v-1.211c0-0.143-0.114-0.258-0.258-0.258H26.04'+
					'c-0.141,0-0.256,0.115-0.256,0.258v1.211c0,0.143,0.115,0.258,0.256,0.258H26.736z'+
					'M29.65,21.308c0.142,0,0.257-0.115,0.257-0.258v-1.211c0-0.143-0.115-0.258-0.257-0.258h-0.696'+
					'c-0.143,0-0.257,0.115-0.257,0.258v1.211c0,0.143,0.114,0.258,0.257,0.258H29.65z'+
					'M20.293,2.678c-0.143,0-0.257,0.115-0.257,0.257v1.213c0,0.141,0.114,0.257,0.257,0.257h0.696'+
					'c0.143,0,0.257-0.116,0.257-0.257V2.935c0-0.142-0.114-0.257-0.257-0.257H20.293z'+
					'M23.207,4.404h0.694c0.142,0,0.258-0.116,0.258-0.257V2.935c0-0.142-0.116-0.257-0.258-0.257h-0.694'+
					'c-0.144,0-0.259,0.115-0.259,0.257v1.213C22.948,4.288,23.063,4.404,23.207,4.404z'+
					'M37.615,21.308h0.696c0.143,0,0.257-0.115,0.257-0.258v-1.211c0-0.143-0.114-0.258-0.257-0.258h-0.696'+
					'c-0.142,0-0.257,0.115-0.257,0.258v1.211C37.358,21.192,37.474,21.308,37.615,21.308z'+
					'M40.477,19.581c-0.143,0-0.258,0.115-0.258,0.258v1.211c0,0.143,0.115,0.258,0.258,0.258h0.697'+
					'c0.142,0,0.256-0.115,0.256-0.258v-1.211c0-0.143-0.114-0.258-0.256-0.258H40.477z'+
					'M31.557,4.147c0,0.141,0.117,0.257,0.26,0.257h0.695c0.142,0,0.257-0.116,0.257-0.257V3.293'+
					'c-0.326-0.205-0.65-0.413-0.988-0.601c-0.123,0.02-0.224,0.114-0.224,0.242V4.147z'+
					'M28.954,2.678c-0.143,0-0.257,0.115-0.257,0.257v1.213c0,0.141,0.114,0.257,0.257,0.257h0.696'+
					'c0.142,0,0.257-0.116,0.257-0.257V2.935c0-0.142-0.115-0.257-0.257-0.257H28.954z'+
					'M26.04,2.678c-0.141,0-0.256,0.115-0.256,0.257v1.213c0,0.141,0.115,0.257,0.256,0.257h0.696'+
					'c0.144,0,0.258-0.116,0.258-0.257V2.935c0-0.142-0.114-0.257-0.258-0.257H26.04z');
				// switch between text
				switch(match[2]) {
					case 'mp4':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 9 34)')
							.style('fill', '#d97373')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 11)
							.text('mp4');
						return div;
					case 'x-flv':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 7.7866 35.7271)')
							.style('fill', '#d97373')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 11)
							.text('Flash');
						return div;
					case 'webm':
						em
							.append('text')
							.attr('transform', 'matrix(1 0 0 1 6 33)')
							.style('fill', '#d97373')
							.attr('font-family', 'ITCAvantGardeStd-Bk')
							.attr('font-size', 10)
							.text('webm');
						return div;
				}
			}
		}
		return mimeIcon;
	}
]);