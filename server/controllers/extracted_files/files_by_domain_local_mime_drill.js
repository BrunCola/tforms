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
                            '`time`,'+
                            '`lan_stealth`,'+
                            '`lan_zone`,'+
                            '`lan_machine`,'+
                            '`lan_user`,'+
                            '`lan_ip`,'+
                            '`lan_port`,'+
                            '`remote_ip`,'+
                            '`remote_port`,'+
                            '`remote_asn`,'+
                            '`remote_asn_name`,'+
                            '`remote_country`,'+
                            '`remote_cc`,'+
                            '`proto`,'+
                            '`http_host`,'+
                            '`mime`,'+
                            '`name`,'+
                            '(`size` / 1024) AS `size`, '+    
                            '`md5`,'+
                            '`sha1`,'+
                            '`ioc`,'+
                            '`ioc_rule`,'+
                            '`ioc_typeIndicator`,'+
                            '`ioc_typeInfection` '+
                        'FROM '+ 
                            '`file` '+
                        'WHERE '+
                            '`time` BETWEEN ? AND ? '+
                            'AND `lan_zone` = ? '+
                            'AND `lan_ip` = ? '+
                            'AND `mime` = ? '+
                            'AND `http_host` = ?',
                insert: [req.query.start, req.query.end, req.query.lan_zone, req.query.lan_ip, req.query.mime, req.query.http_host],
                params: [
                    { title: 'Last Seen', select: 'time' },
                    { title: 'File Type', select: 'mime' },
                    { title: 'Name', select: 'name', sClass:'file'},
                    { title: 'Size (KB)', select: 'size' },
                    { title: 'Stealth', select: 'lan_stealth', hide_stealth: [1] },
                    { title: 'Zone', select: 'lan_zone' },
                    { title: 'Local Machine', select: 'lan_machine' },
                    { title: 'Local User', select: 'lan_user' },
                    { title: 'Local IP', select: 'lan_ip' },
                    { title: 'Local Port', select: 'lan_port' },
                    { title: 'Remote IP', select: 'remote_ip' },
                    { title: 'Remote Port', select: 'remote_port' },
                    { title: 'Remote Country', select: 'remote_country' },
                    { title: 'Flag', select: 'remote_cc' },
                    { title: 'ASN', select: 'remote_asn' },
                    { title: 'ASN Name', select: 'remote_asn_name' },
                    { title: 'Protocol', select: 'proto' },
                    { title: 'Domain', select: 'http_host' },
                    { title: 'IOC', select: 'ioc' },
                    { title: 'IOC Type', select: 'ioc_typeIndicator' },
                    { title: 'IOC Stage', select: 'ioc_typeInfection' },
                    { title: 'IOC Rule', select: 'ioc_rule' },
                    { title: 'MD5', select: 'md5' },
                    { title: 'SHA1', select: 'sha1' }
                ],
                settings: {
                    sort: [[1, 'desc']],
                    div: 'table',
                    title: 'Extracted Files by Local IP, Domain, Type',
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