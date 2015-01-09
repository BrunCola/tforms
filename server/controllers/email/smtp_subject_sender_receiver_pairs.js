'use strict';

var dataTable = require('../constructors/datatable');

module.exports = function(pool) {
	return {
        //////////////////////
        /////   TABLE   //////
        //////////////////////
        table: function(req, res){
            var table = {
                query: 'SELECT '+
							'count(*) AS count, ' +
							'max(smtp.time) as `time`, '+ // Last Seen
							'`lan_stealth`,'+
							'`lan_zone`,'+
							'`lan_machine`,'+
							'`lan_user`,'+
							'`lan_ip`,'+
							'`lan_port`,'+
							'`remote_ip`,'+
							'`remote_port`,'+
							'`remote_country`,'+
							'`remote_cc`,'+
							'`remote_asn_name`,'+
							'`mailfrom`,'+
							'`receiptto`,'+
							'`reply_to`,'+
							'`in_reply_to`,'+
							'`subject`,'+
							'`user_agent`,'+
							'`fuids`,'+
							'`ioc`,'+
							'`ioc_severity`,'+
							'`ioc_typeInfection`,'+
							'`ioc_typeIndicator`,'+
							'`ioc_rule`,'+
							'`ioc_count` '+
						'FROM '+
							'`smtp` '+
						'WHERE ' +
							'smtp.time BETWEEN ? AND ? '+
							'AND `subject` = ? '+
						'GROUP BY '+
							'`receiptto`, ' +
							'`mailfrom`',
				insert: [req.query.start, req.query.end, req.query.subject],
				params: [
					{
						title: 'Last Seen',
						select: 'time',
						link: {
							type: 'smtp_from_sender_by_subject',
							val: ['mailfrom','receiptto','subject'],
							crumb: false
						}
					},
					{ title: 'Connections', select: 'count' },
					{ title: 'From', select: 'mailfrom' },
					{ title: 'To', select: 'receiptto' },
					{ title: 'Reply To', select: 'reply_to' },
					{ title: 'In Reply To', select: 'in_reply_to' },
					{ title: 'Subject', select: 'subject' },
					{ title: 'User Agent', select: 'user_agent' },
					{ title: 'FUIDS', select: 'fuids' },
					{ title: 'IOC', select: 'ioc' },
					{ title: 'IOC Severity', select: 'ioc_severity' },
					{ title: 'Infection Stage', select: 'ioc_typeInfection' },
					{ title: 'Indicator Type', select: 'ioc_typeIndicator' },
					{ title: 'IOC Rule', select: 'ioc_rule' },
					{ title: 'IOC Count', select: 'ioc_count' },
					{ title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
					{ title: 'Zone', select: 'lan_zone' },
					{ title: 'Local Machine', select: 'lan_machine' },
					{ title: 'Local User', select: 'lan_user' },
					{ title: 'Local IP', select: 'lan_ip' },
					{ title: 'Local port', select: 'lan_port' },
					{ title: 'Remote IP', select: 'remote_ip' },
					{ title: 'Remote port', select: 'remote_port' },
					{ title: 'Remote Country', select: 'remote_country' },
					{ title: 'Flag', select: 'remote_cc' },
					{ title: 'Remote ASN Name', select: 'remote_asn_name' },
				],
				settings: {
					sort: [[1, 'desc']],
					div: 'table',
					title: 'Sender/Receiver SMTP',
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