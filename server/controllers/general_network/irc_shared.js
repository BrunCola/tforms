'use strict';

var dataTable = require('../constructors/datatable'),
	config = require('../../config/config'),
	async = require('async'),
	query = require('../constructors/query');

module.exports = function(pool) {
	return {
        //////////////////////
        /////   TABLE   //////
        //////////////////////
        table: function(req, res){
            var table = {
                query: 'SELECT ' +
						'irc.time as `time`,'+
						'`lan_stealth`,'+
						'`lan_zone`,'+
						'`lan_machine`,'+
						'`lan_user`,'+
						'`lan_ip`,'+
						'`lan_port`,'+
						'`remote_ip`,'+
						'`remote_port`,'+
						'`remote_cc`,'+
						'`remote_country`,'+
						'`remote_asn_name`,'+
						'`nick`,'+
						'irc.user AS irc_user,'+
						'`command`,'+
						'`value`,'+
						'`addl`,'+
						'`dcc_file_name`,'+
						'`dcc_file_size`,'+
						'`dcc_mime_type`,'+
						'`fuid` '+
					'FROM ' +
						'`irc` ' +
					'WHERE '+
						'irc.time BETWEEN ? AND ? ' +
						'AND `lan_zone` = ? '+
						'AND irc.lan_ip = ? ' +
						'AND `remote_ip` = ? ',
				insert: [req.query.start, req.query.end, req.query.lan_zone, req.query.lan_ip, req.query.remote_ip],
				params: [
					{
						title: 'Time',
						select: 'time'
					},
					{ title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
					{ title: 'Zone', select: 'lan_zone' },
					{ title: 'Local Machine', select: 'lan_machine' },
					{ title: 'Local User', select: 'lan_user' },
					{ title: 'Local IP', select: 'lan_ip' },
					{ title: 'Local Port', select: 'lan_port' },
					{ title: 'Remote IP', select: 'remote_ip'},
					{ title: 'Remote Port', select: 'remote_port' },
					{ title: 'Flag', select: 'remote_cc' },
					{ title: 'Remote Country', select: 'remote_country' },
					{ title: 'Remote ASN Name', select: 'remote_asn_name' },
					{ title: 'Nick', select: 'nick' },
					{ title: 'IRC User', select: 'irc_user' },
					{ title: 'Command', select: 'command' },
					{ title: 'Value', select: 'value'},
					{ title: 'Addl', select: 'addl' },
					{ title: 'DCC File Name', select: 'dcc_file_name' },
					{ title: 'DCC File Size', select: 'dcc_file_size' },
					{ title: 'DCC File Type', select: 'dcc_mime_type' },
					{ title: 'FUID', select: 'fuid' }
				],
				settings: {
					sort: [[0, 'desc']],
					div: 'table',
					title: 'Common IRC Connections between Remote and Local Host',
					hide_stealth: req.user.hide_stealth
				}
            }
            new dataTable(table, {database: req.user.database, pool: pool}, function(err,data){
                if (err) { res.status(500).end(); return }
                res.json({table: data});
            });
        }
	}
};