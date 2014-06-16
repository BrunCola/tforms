'use strict';

var query = require('../constructors/query'),
config = require('../../config/config'),
async = require('async');

exports.render = function(req, res) {
	var database = req.session.passport.user.database;
	// var database = null;
	var start = Math.round(new Date().getTime() / 1000)-((3600*24)*config.defaultDateRange);
	var end = Math.round(new Date().getTime() / 1000);
	if (req.query.start && req.query.end) {
		start = req.query.start;
		end = req.query.end;
	}
	//var results = [];
	var tables = [];
	var info = [];
	var table1SQL = 'SELECT * FROM process_health b ' + 
                'INNER JOIN (SELECT client, zone, process_name, MAX(timestamp) ' + 
                'AS maxtimestamp FROM process_health ' + 
                'GROUP BY client, zone, process_name) a ' +
                'ON a.zone = b.zone AND a.maxtimestamp = b.timestamp AND a.process_name = b.process_name AND a.client = b.client ' + 
                'GROUP BY a.client, a.zone, a.process_name ORDER BY a.process_name';
	var table1Params = [
		{
			title: 'Last Seen',
			select: 'timestamp',
			//  link: {
			//  	type: 'http_local_by_domain', 
			//  	// val: the pre-evaluated values from the query above
			//  	val: ['lan_ip', 'lan_zone'],
			//  	crumb: false
			// },
		},
		{ title: 'Client', select: 'client' },
		{ title: 'Zone', select: 'zone' },
		{ title: 'Bro', select: 'bro' },
		{ title: 'Clamscan', select: 'clamscan' },
		{ title: 'Node', select: 'node' },
		{ title: 'Nprobe', select: 'nprobe' }
	];
	var table1Settings = {
		sort: [[1, 'desc']],
		div: 'table',
		title: 'RapidPHIRE Health'
	}
	async.parallel([
		// Table function(s)
		function(callback) {
			new query(table1SQL, 'rp_health', function(err,data){
				tables.push(data);
				callback();
			});
		},
	], function(err) { //This function gets called after the two tasks have called their "task callbacks"
		if (err) throw console.log(err);
		
		var zones = [];
		var arr = [];
		var proc_obj = [];
		var final_arr = [];
		//isolate unique zones
		tables.forEach(function(d){
			for(var i = 0; i<d.length; i++) {				
				if (zones.indexOf(d[i].zone) === -1) {
					zones.push(d[i].zone);
					arr.push({
						zone: d[i].zone,
						client: d[i].client,
						timestamp: d[i].timestamp
					});
				}
			}
		})
		//TODO make the process names dynamic???????
		//TODO css class highlighting
		//iterate over unique zones
		arr.forEach(function(d) {
			var broStatus = "Not Installed";
            var clamscanStatus = "Not Installed";
            var nodeStatus = "Not Installed";
            var nprobeStatus = "Not Installed";
            //populate process status
            tables.forEach(function(t){
            	for(var i = 0; i<t.length; i++) {	

	                if (t[i].zone == d.zone) {

	                    switch (t[i].process_name) {
	                        case "bro":
	                            broStatus = t[i].status;
	                            break;
	                        case "clamscan":
	                            clamscanStatus = t[i].status;
	                            break;
	                        case "node":
	                            nodeStatus = t[i].status;
	                            break;
	                        case "nprobe":
	                            nprobeStatus = t[i].status;
	                            break;
	                    }
	                }
            	}
            })
            //create object to push to view
            proc_obj.push({
                client: d.client,
                zone: d.zone,
                timestamp: d.timestamp,
                bro: broStatus,
                clamscan: clamscanStatus,
                node: nodeStatus,
                nprobe: nprobeStatus
                //timeSinceUpdate: clientsZones[i].timeSinceUpdate
            });	


		})

        
        for (var d in table1Params) {
			if (table1Params[d].dView === undefined) {
				table1Params[d].dView = true;
			}
			if (table1Params[d].select === 'Archive') {
				table1Params[d].select = null;
			}
			if (!table1Params[d].sClass) {
				table1Params[d].sClass = null;
			}

			final_arr.push({
				'sTitle': table1Params[d].title,
				'mData': table1Params[d].select,
				'sType': table1Params[d].dType,
				'bVisible': table1Params[d].dView,
				'link': table1Params[d].link,
				'sClass': table1Params[d].sClass
			});
		}
		

		//console.log(final_arr);
		var results = {
			info: info,
			tables: [{
				"aaData": proc_obj, 
				"params": final_arr,
				"sort": table1Settings.sort,
				"div": table1Settings.div,
				"title": table1Settings.title,
				"pagebreakBefore": table1Settings.pagebreakBefore
			}]
		};
		//console.log(results);
		res.json(results);
	});

};