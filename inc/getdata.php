<?php
include "class.database.php";
$database = new Database("rapidPHIRE_DB");
$group = null;
$query = null;
$limit = null;
$start = null;
$end   = null;
// Grab get parameters
if (isset($_GET['group'])) { $group = $_GET['group']; }
if (isset($_GET['query'])) { $query = $_GET['query']; }
if (isset($_GET['limit'])) { $limit = $_GET['limit']; }
if (isset($_GET['start'])) { $start = $_GET['start']; }
if (isset($_GET['end']))   { $end   = $_GET['end']; }
if (isset($_GET['type']))  { 
	$type = $_GET['type'];	
	fetch($database, $type, $query, $start, $end, $group);
}
// Checkpoint function (notifications)
if (isset($_GET['checkpoint'])) {
	if ($_GET['checkpoint']=='true') {
		session_start();
		include("class.user.php");
		$system = new System();
		$system->registerConfirm = true;
		$session = $system->session;
		$id = $session['id'];
		$database->query("SELECT * FROM `user` WHERE `id` = '$id'");
		while ($row = $database->fetchrow()) {
			echo $row['checkpoint'];
		}
		$u_time = time();
		$database->query("UPDATE `user` SET `checkpoint`= $u_time WHERE `id` = '$id'");
	} 
}
// Trash & delete functions switch
if (isset($_GET['archive'])) {
	if($_GET['archive'] == 'true') {
		$query = $_GET['query'];
		list($lan_ip, $wan_ip, $remote_ip, $ioc) = split(',', $query);
		$database->query("UPDATE `conn_ioc` SET `trash` = UNIX_TIMESTAMP(NOW()) WHERE `lan_ip`='$lan_ip' AND `wan_ip`='$wan_ip' AND `remote_ip`='$remote_ip' AND ioc='$ioc'");
	}
}
if (isset($_GET['restore'])) {
	if($_GET['restore'] == 'true') {
		$id = $_GET['id'];
		$database->query("UPDATE `alert` SET `trash` = null WHERE `id` = '$id'");
	}
}
if (isset($_GET['trash_all'])) {
	if($_GET['trash_all'] == 'true') {
		$database->query("UPDATE `alert` SET `trash` = UNIX_TIMESTAMP(NOW()) WHERE `trash` is null");
	}
}
if (isset($_GET['clear_trash'])) {
	if($_GET['clear_trash'] == 'true') {
		$database->query("DELETE FROM `alert` WHERE `trash` != 'null'");
	}
}
if (isset($_GET['get_report'])) {
	if($_GET['get_report'] == 'true') {
		$database->query("SELECT * FROM `alert` WHERE `trash` is null");
		while ($row = $database->fetchRow())
			{
				$response['Added'] = $row['added'];
				$response['Local IP'] = $row['local_ip'];
				$response['Remote IP'] = $row['remote_ip'];
				$response['Comment'] = $row['ioc'];
				$return[] = $response;
			}
		echo json_encode( $return );
	}
}
// User management functions
if (isset($_GET['delete_user'])) {
	if($_GET['delete_user']=='true') {
	    $id = $_GET['id'];
		if ($session['id'] != $id) {
			$database->query("DELETE FROM `user` WHERE `id` = '$id'");
		}
	}
}
if (isset($_GET['create_user'])) {
	if($_GET['create_user']=='true') {
	    create_user(''.mysql_real_escape_string($_GET['username']).'',''.$_GET['password'].'');
	}
}
if (isset($_GET['uname_update'])) {
	if($_GET['uname_update']=='true') {
	    $id = $_GET['uid'];
	    $username = $_GET['string'];
		$database->query("UPDATE `user` SET `username`='$username' WHERE `id`=$id");
		//$database->update('users', 'username', '$username', 'id', $id);
	}
}
if (isset($_GET['email_update'])) {
	if($_GET['email_update']=='true') {
	    $id = $_GET['uid'];
	    $email = $_GET['string'];
		$database->query("UPDATE `user` SET `email`='$email' WHERE `id`=$id");
	}
}
// Severity Level Counts
if (isset($_GET['severity_levels'])) {
	// TODO // add switch to make query specific to drilldowns
	$sth = mysql_query("SELECT count(*) AS count, ioc_severity FROM conn_ioc WHERE (time between '$start' AND '$end') AND ioc_count > 0 AND trash is null GROUP BY ioc_severity");
	$rows = array();
	while ($r = mysql_fetch_assoc($sth)) {
    	$rows[] = $r;
	}
	echo json_encode($rows);
}
// Report management functions
if (isset($_GET['cron_gen'])) {
	if($_GET['cron_gen']=='true') {
		$string = $_GET['string'];  
		session_start();
			include("class.user.php");
			$system = new System();
			$system->registerConfirm = true;
			$session = $system->session;
			$uid = $session['id'];
		$report_type = $_GET['report_type'];
		$human_date = $_GET['human_date'];
		$database->query("INSERT INTO user_cron(`uid`,`cron_val`,`report_type`,`human_date`) VALUES('$uid','$string','$report_type','$human_date')");
	}
}
if (isset($_GET['delete_cron'])) {
	if($_GET['delete_cron']=='true') {
		$database = new Database("user_DB"); 
	    $id = $_GET['id'];
	    $database->query("DELETE FROM `user_cron` WHERE `id` = '$id'");
	}
}
$database->disconnect();

// Graphing functions (from switch)
function fetch($database, $type, $query, $start, $end, $group) {
	$html = null;
	$notime = null;
	switch ($type) {
		case 'blacklist':
			// set mysql query parameters
			$database = new Database("rapidPHIRE_DB");
			switch ($start) {
				case 'null':
					$sql_select = "SELECT alert.added, conn_ioc.ioc FROM alert, conn_ioc ";
					$sql_where = "WHERE alert.conn_uids = conn_ioc.conn_uids AND alert.username = 'rapidPHIRE' AND alert.trash is null";
					$sql_limit = "ORDER BY alert.added DESC LIMIT 5";
					break;
				default:
					$sql_select = "SELECT alert.added, conn_ioc.ioc FROM alert, conn_ioc ";
					$sql_where = "WHERE alert.conn_uids = conn_ioc.conn_uids AND alert.username = 'rapidPHIRE' AND alert.added >= $start";
					$sql_limit = "ORDER BY alert.added";
					break;
			}
			$remote_result = mysql_query("$sql_select $sql_where $sql_limit") or die(mysql_error());  
			$return = null;
			while ($row = mysql_fetch_assoc($remote_result)) {
				foreach($row as $out=>$in) {
					$response[$out] = $in;
				}
				$return[] = $response;
			}
			echo json_encode($return);
			die;
			break;	
		case 'ioc_hits_report':
			$page = array(
				'title' => '&nbsp;',
				'header' => 'drilldown',
				'vDiv' => array(
					array('html', '25,25,25,25'),
					// array('head', '33.33,43.33,23.34'),

					array('head', '60,20,20'),
					array('crossfilter', '30,70'),
					array('t1', '100'),	
					array('t2', '100')	
				),
				'sidebar' => 'notifications'
			);
			if (isset($_GET['getInfo'])) {
				// CUSTOM QUERIES
				$sev = mysql_query
				("	SELECT count(*) AS count, ioc_severity 
					FROM conn_ioc
					WHERE (time between '$start' AND '$end') 
					AND ioc_count > 0 
					AND trash is null 
					GROUP BY ioc_severity
				") or die (mysql_error());
				$rows = array();
				$sev1 = '0';
				$sev2 = '0';
				$sev3 = '0';
				$sev4 = '0';
				while ($r = mysql_fetch_assoc($sev)) {
					if ($r['ioc_severity'] == 1) {
						$sev1 = $r['count'];
					}
					if ($r['ioc_severity'] == 2) {
						$sev2 = $r['count'];
					}
					if ($r['ioc_severity'] == 3) {
						$sev3 = $r['count'];
					}
					if ($r['ioc_severity'] == 4) {
						$sev4 = $r['count'];
					}
				}

				// IOC HITS
				$qIOCh = mysql_query("SELECT count(*) FROM conn_ioc WHERE (time between $start AND $end) AND ioc_count > 0 AND trash IS NULL") or die (mysql_error());
				$IOCh = mysql_result($qIOCh,0);

				$qIOCg = mysql_query("SELECT SQL_CALC_FOUND_ROWS ioc FROM conn_ioc WHERE (time between $start AND $end) AND ioc_count > 0 AND trash IS NULL GROUP BY ioc") or die (mysql_error());
				$IOCg = mysql_num_rows($qIOCg);

				$qlIP = mysql_query("SELECT SQL_CALC_FOUND_ROWS lan_ip,wan_ip FROM conn_ioc WHERE (time between $start AND $end) AND ioc_count > 0 AND trash IS NULL GROUP BY lan_ip,wan_ip") or die (mysql_error());
				$lIP = mysql_num_rows($qlIP);

				$qrIP = mysql_query("SELECT SQL_CALC_FOUND_ROWS remote_ip FROM conn_ioc WHERE (time between $start AND $end) AND ioc_count > 0 AND trash IS NULL GROUP BY remote_ip") or die (mysql_error());
				$rIP = mysql_num_rows($qrIP);

				$qRC = mysql_query("SELECT SQL_CALC_FOUND_ROWS remote_country FROM conn_ioc WHERE (time between $start AND $end) AND ioc_count > 0 AND trash IS NULL GROUP BY remote_country") or die (mysql_error());
				$RC = mysql_num_rows($qRC);

				$qIOCdns = mysql_query("SELECT SQL_CALC_FOUND_ROWS query FROM dns_ioc WHERE (time between $start AND $end) GROUP BY query") or die (mysql_error());
				$aIOCdns = mysql_num_rows($qIOCdns);

				$qIOChttp = mysql_query("SELECT SQL_CALC_FOUND_ROWS host FROM http_ioc WHERE (time between $start AND $end) GROUP BY host") or die (mysql_error());
				$aIOChttp = mysql_num_rows($qIOChttp);

				$qIOCssl = mysql_query("SELECT SQL_CALC_FOUND_ROWS remote_ip FROM ssl_ioc WHERE (time between $start AND $end) GROUP BY remote_ip") or die (mysql_error());
				$aIOCssl = mysql_num_rows($qIOCssl);

				$qIOCfile = mysql_query("SELECT SQL_CALC_FOUND_ROWS name FROM file_ioc WHERE (time between $start AND $end) GROUP BY name") or die (mysql_error());
				$aIOCfile = mysql_num_rows($qIOCfile);

				$qIOCl7 = mysql_query("SELECT SQL_CALC_FOUND_ROWS `l7_proto` FROM `conn_ioc` WHERE (time between $start AND $end) AND ioc_count > 0 AND trash IS NULL GROUP BY `l7_proto`") or die (mysql_error());
				$aIOCl7 = mysql_num_rows($qIOCl7);

				// NETWORK
				$qNlIP = mysql_query("SELECT SQL_CALC_FOUND_ROWS * FROM conn_meta WHERE (time between $start AND $end) GROUP BY lan_ip,wan_ip") or die (mysql_error());
				$NlIP = mysql_num_rows($qNlIP);

				$qNrIP = mysql_query("SELECT SQL_CALC_FOUND_ROWS remote_ip FROM conn_meta WHERE (time between $start AND $end) GROUP BY remote_ip") or die (mysql_error());
				$NrIP = mysql_num_rows($qNrIP);

				$qNRC = mysql_query("SELECT SQL_CALC_FOUND_ROWS remote_country FROM conn_meta WHERE (time between $start AND $end) GROUP BY remote_country") or die (mysql_error());
				$NRC = mysql_num_rows($qNRC);

				$qInBand = mysql_query("SELECT ROUND(((sum(in_bytes) / 1048576) / ($end - $start)) * 8000,2)  as bandwidth FROM conn_meta WHERE time between $start AND $end") or die (mysql_error());
				$aInBand = mysql_result($qInBand,0);

				$qOutBand = mysql_query("SELECT ROUND(((sum(out_bytes) / 1048576) / ($end - $start)) * 8000,2) as bandwidth FROM conn_meta WHERE time between $start AND $end") or die (mysql_error());
				$aOutBand = mysql_result($qOutBand,0);

				$qNewIP = mysql_query("SELECT SQL_CALC_FOUND_ROWS remote_ip FROM conn_remote_ip WHERE (time between $start AND $end) GROUP BY remote_ip") or die (mysql_error());
				$aNewIP = mysql_num_rows($qNewIP);

				$qNewDNS = mysql_query("SELECT SQL_CALC_FOUND_ROWS query FROM dns_query WHERE (time between $start AND $end) GROUP BY query") or die (mysql_error());
				$aNewDNS = mysql_num_rows($qNewDNS);

				$qNewHTTP = mysql_query("SELECT SQL_CALC_FOUND_ROWS `host` FROM `http_host` WHERE (time between $start AND $end) GROUP BY `host`") or die (mysql_error());
				$aNewHTTP = mysql_num_rows($qNewHTTP);

				$qNewSSL = mysql_query("SELECT SQL_CALC_FOUND_ROWS `remote_ip` FROM `ssl_remote_ip` WHERE (time between $start AND $end) GROUP BY `remote_ip`") or die (mysql_error());
				$aNewSSL = mysql_num_rows($qNewSSL);

				$qL7 = mysql_query("SELECT SQL_CALC_FOUND_ROWS `l7_proto` FROM `conn_l7` WHERE (time between $start AND $end) GROUP BY `l7_proto`") or die (mysql_error());
				$aL7 = mysql_num_rows($qL7);

				$html= array(
					array(
						'pID' => 'html',
						'dID' => 'col1',
						'bgColor' => '#377FC7',
						'heading' => '',
						'data' => '<span style="position:absolute;margin-top:-7px;margin-left:-2px;color:#F4F4F4 !important;font-size:12px">GUARDED</span><div style="font-size:37px;color:#F4F4F4 !important;text-align:center;font-weight:bold"><i style="margin-right:10px; color:#F4F4F4 !important;" class="fa fa-flag"></i>'.$sev1.'</div>'
					),
					array(
						'pID' => 'html',
						'dID' => 'col2',
						'bgColor' => '#F5D800',
						'heading' => '',
						'data' => '<span style="position:absolute;margin-top:-7px;margin-left:-2px;color:#383E4B !important;font-size:12px">ELEVATED</span><div style="font-size:37px;color:#383E4B !important;text-align:center;font-weight:bold"><i style="margin-right:10px; color:#383E4B !important;" class="fa fa-bullhorn"></i>'.$sev2.'</div>'
					),
					array(
						'pID' => 'html',
						'dID' => 'col3',
						'bgColor' => '#F88B12',
						'heading' => '',
						'data' => '<span style="position:absolute;margin-top:-7px;margin-left:-2px;color:#383E4B !important;font-size:12px">HIGH</span><div style="font-size:37px;color:#383E4B !important;text-align:center;font-weight:bold"><i style="margin-right:10px; color:#383E4B !important;" class="fa fa-bell"></i>'.$sev3.'</div>'
					),			
					array(	
						'pID' => 'html',
						'dID' => 'col4',
						'bgColor' => '#DD122A',
						'heading' => '',
						'data' => '<span style="position:absolute;margin-top:-7px;margin-left:-2px;color:#F4F4F4 !important;font-size:12px">SEVERE</span><div style="font-size:37px;color:#F4F4F4 !important;text-align:center;font-weight:bold"><i style="margin-right:10px; color:#F4F4F4 !important;" class="fa fa-exclamation"></i>'.$sev4.'</div>'
					),
					array(
						'pID' => 'head',
						'dID' => 'ioc_info',
						'heading' => 'IOC Summary',
						'bgColor' => ' ',
						'data' => '
							<div style="font-size:12px !important;line-height:21px; padding:10px 0 10px 10px !important;background-color:#f0f0f0 !important;border-radius: 5px !important;">
								<span style="font-weight:bold !important;">Local IPs:</span> '.$lIP.'<br />
								<span style="font-weight:bold !important;">Remote IPs:</span> '.$rIP.'<br />
								<span style="font-weight:bold !important;">Remote Countries:</span> '.$RC.'<br />
								<span style="font-weight:bold !important;">IOC Notifications:</span> '.$IOCh.'<br />
								<span style="font-weight:bold !important;">IOC Groups:</span> '.$IOCg.'<br /> 
								<span style="font-weight:bold !important;">IOC File Names:</span> '.$aIOCfile.'<br />
								<span style="font-weight:bold !important;">IOC DNS queries:</span> '.$aIOCdns.'<br />
								<span style="font-weight:bold !important;">IOC HTTP Hosts:</span> '.$aIOChttp.'<br />
								<span style="font-weight:bold !important;">IOC SSL Hosts:</span> '.$aIOCssl.'<br />
								<span style="font-weight:bold !important;">IOC L7 Protocols:</span> '.$aIOCl7.'<br />
							</div>',
					),
					array(
						'pID' => 'head',
						'dID' => 'net_info',
						// 'heading' => 'Network Summary',
						'heading' => 'Network Summary',
						'bgColor' => ' ',
						'data' => '
							<div style="font-size:12px !important;line-height:21px; padding:10px 0 10px 10px !important;background-color:#f0f0f0 !important;border-radius: 5px !important;">
								<span style="font-weight:bold !important;">Local IPs:</span> '.$NlIP.'<br />
								<span style="font-weight:bold !important;">Remote IPs:</span> '.$NrIP.'<br />
								<span style="font-weight:bold !important;">Remote Countries:</span> '.$NRC.'<br />
								<span style="font-weight:bold !important;">Avg B/w In:</span> '.$aOutBand.' (Kb/s)<br />
								<span style="font-weight:bold !important;">Avg B/w Out:</span> '.$aInBand.' (Kb/s)<br />
								<span style="font-weight:bold !important;">New Remote IP:</span> '.$aNewIP.'<br />
								<span style="font-weight:bold !important;">New DNS Query:</span> '.$aNewDNS.'<br />
								<span style="font-weight:bold !important;">New HTTP Hosts:</span> '.$aNewHTTP.'<br />
								<span style="font-weight:bold !important;">New SSL Hosts:</span> '.$aNewSSL.'<br />
								<span style="font-weight:bold !important;">L7 Protocols Detected:</span> '.$aL7.'<br />
							</div>',
						// <span style="text-decoration:underline !important;font-size:23px !important; line-height: 35px !important; font-weight:bold">Network</span><br />
					)
				);
			}	
			$viz = array(
				'crossfilter' => array(
					'select' => array(
						array('from_unixtime(time) as time'), 
						array('ioc_severity'),
						array('remote_country'),
						array('ioc'),
						array('count(*) AS count'), 
					),
					'from' => 'conn_ioc',
					'where' => '`ioc_count` > 0, `trash` IS NULL',
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), remote_country, ioc_severity, ioc',
					'struct' => array(
						array(
							'dim' => array('hour'),
							'grp' => array('count')
						),
						array(
							'dim' => array('ioc'),
							'grp' => array('count')
						),
						array(
							'dim' => array('remote_country'),
							'grp' => array('count')
						)
					),
					'disp' => array(
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'severitybar', 
							'height' => '240',
							'heading' => 'IOC Notifications Per Hour',
							'xAxis' => '',
							'yAxis' => '# IOC / Hour',
							'dim' => 'hour',
							'grp' => 'count'
						),
						array(
							'dView' => 'true', 
							'pID' => 'head',
							'dID' => 'row', 
							'type' => 'row', 
							'heading' => 'IOC Classes (Quantity of IOC Hits)',
							'dim' => 'ioc',
							'grp' => 'count'
						),
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'geo', 
							'type' => 'geo', 
							'heading' => 'IOC Source Countries',
							'dim' => 'remote_country',
							'grp' => 'count'
						)					
					)		
				),
			);	
			$table = array(
				array(
					'pID' => 't1',
					'dID' => 'table1',
					'heading' => 'Top 10 Highest Severity IOC Notifications',
					'tClass' => 'condensed', //not required
					'sSort' => '[ 1, "desc" ],[ 2, "desc" ]', // Default column to sort on
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('max(from_unixtime(time)) AS time','Last Seen','true'), 
						array('ioc_severity', ' ', 'true'),
						array('count(*) AS count','IOC Hits','true'), 
						array('ioc','IOC','true'),
						array('ioc_type', 'IOC Type', 'true'),
						array('remote_ip','Remote IP','true'),
						array('remote_country','Remote Country','true'),
						array('remote_cc',' ','true'),
						array('sum(`in_bytes`) AS icon_in_bytes','Up / Down','true'), 
						array('sum(`out_bytes`) AS icon_out_bytes')
					),
					'from' => 'conn_ioc',
					'where' => '`ioc_count` > 0, `trash` IS NULL',
					'group' => 'ioc_type, ioc, ioc_group',
					'limit' => '10',
					'order' => 'ioc_severity DESC, count DESC'
				),
				array(
					'pID' => 't2',
					'dID' => 'table2',
					'tClass' => 'condensed', //not required
					'pagebreak' => 'true',
					'sSort' => '[ 1, "desc" ],[ 2, "desc" ]', // REQUIRED FOR ALL REPORTS
					'heading' => 'Local End Point IP Addresses Triggering IOC Notifications',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('max(from_unixtime(time)) as time','Last Seen','true'), 				
						array('ioc_severity',' ','true'),
						array('count(*) AS count','IOC Hits','true'), 					
						array('ioc','IOC','true'),
						array('ioc_type', 'IOC Type', 'true'),
						array('lan_zone','Lan Zone','true'),
						array('lan_ip','LAN IP','true'),
						array('machine','Machine Name','true'),
						array('wan_ip','WAN IP','false'),
						array('sum(`in_bytes`) as icon_in_bytes','Up / Down','true'), 
						array('sum(`out_bytes`) as icon_out_bytes')
					),
					'from' => 'conn_ioc',
					'where' => '`ioc_count` > 0, `trash` IS NULL',
					'group' => 'ioc_type, ioc, lan_ip, wan_ip',
					'order' => 'ioc_severity DESC, count DESC'
				),
			);	
			break;	
		case 'ioc_hits':
			$page = array(
				'title' => 'IOC Notifications',
				'header' => 'drilldown',
				'vDiv' => array(
					array('head', '50,25,25'),
					array('crossfilter', '30,70'),
					array('tables', '100')	
				),
				'sidebar' => 'notifications',
				'severity' => 'true'
			);
			if (isset($_GET['getInfo'])) {
				// CUSTOM QUERIES
				$sev = mysql_query
				("	SELECT count(*) AS count, ioc_severity 
					FROM conn_ioc
					WHERE (time between '$start' AND '$end') 
					AND ioc_count > 0 
					AND trash is null 
					GROUP BY ioc_severity
				") or die (mysql_error());
				$rows = array();
				$sev1 = '0';
				$sev2 = '0';
				$sev3 = '0';
				$sev4 = '0';
				while ($r = mysql_fetch_assoc($sev)) {
					if ($r['ioc_severity'] == 1) {
						$sev1 = $r['count'];
					}
					if ($r['ioc_severity'] == 2) {
						$sev2 = $r['count'];
					}
					if ($r['ioc_severity'] == 3) {
						$sev3 = $r['count'];
					}
					if ($r['ioc_severity'] == 4) {
						$sev4 = $r['count'];
					}
				}

				// IOC HITS
				$qIOCh = mysql_query("SELECT count(*) FROM conn_ioc WHERE (time between $start AND $end) AND ioc_count > 0 AND trash IS NULL") or die (mysql_error());
				$IOCh = mysql_result($qIOCh,0);

				$qIOCg = mysql_query("SELECT SQL_CALC_FOUND_ROWS ioc FROM conn_ioc WHERE (time between $start AND $end) AND ioc_count > 0 AND trash IS NULL GROUP BY ioc") or die (mysql_error());
				$IOCg = mysql_num_rows($qIOCg);

				$qlIP = mysql_query("SELECT SQL_CALC_FOUND_ROWS lan_ip,wan_ip FROM conn_ioc WHERE (time between $start AND $end) AND ioc_count > 0 AND trash IS NULL GROUP BY lan_ip,wan_ip") or die (mysql_error());
				$lIP = mysql_num_rows($qlIP);

				$qrIP = mysql_query("SELECT SQL_CALC_FOUND_ROWS remote_ip FROM conn_ioc WHERE (time between $start AND $end) AND ioc_count > 0 AND trash IS NULL GROUP BY remote_ip") or die (mysql_error());
				$rIP = mysql_num_rows($qrIP);

				$qRC = mysql_query("SELECT SQL_CALC_FOUND_ROWS remote_country FROM conn_ioc WHERE (time between $start AND $end) AND ioc_count > 0 AND trash IS NULL GROUP BY remote_country") or die (mysql_error());
				$RC = mysql_num_rows($qRC);

				$qIOCdns = mysql_query("SELECT SQL_CALC_FOUND_ROWS query FROM dns_ioc WHERE (time between $start AND $end) GROUP BY query") or die (mysql_error());
				$aIOCdns = mysql_num_rows($qIOCdns);

				$qIOChttp = mysql_query("SELECT SQL_CALC_FOUND_ROWS host FROM http_ioc WHERE (time between $start AND $end) GROUP BY host") or die (mysql_error());
				$aIOChttp = mysql_num_rows($qIOChttp);

				$qIOCssl = mysql_query("SELECT SQL_CALC_FOUND_ROWS remote_ip FROM ssl_ioc WHERE (time between $start AND $end) GROUP BY remote_ip") or die (mysql_error());
				$aIOCssl = mysql_num_rows($qIOCssl);

				$qIOCfile = mysql_query("SELECT SQL_CALC_FOUND_ROWS name FROM file_ioc WHERE (time between $start AND $end) GROUP BY name") or die (mysql_error());
				$aIOCfile = mysql_num_rows($qIOCfile);

				$qIOCl7 = mysql_query("SELECT SQL_CALC_FOUND_ROWS `l7_proto` FROM `conn_ioc` WHERE (time between $start AND $end) AND ioc_count > 0 AND trash IS NULL GROUP BY `l7_proto`") or die (mysql_error());
				$aIOCl7 = mysql_num_rows($qIOCl7);

				// NETWORK
				$qNlIP = mysql_query("SELECT SQL_CALC_FOUND_ROWS * FROM conn_meta WHERE (time between $start AND $end) GROUP BY lan_ip,wan_ip") or die (mysql_error());
				$NlIP = mysql_num_rows($qNlIP);

				$qNrIP = mysql_query("SELECT SQL_CALC_FOUND_ROWS remote_ip FROM conn_meta WHERE (time between $start AND $end) GROUP BY remote_ip") or die (mysql_error());
				$NrIP = mysql_num_rows($qNrIP);

				$qNRC = mysql_query("SELECT SQL_CALC_FOUND_ROWS remote_country FROM conn_meta WHERE (time between $start AND $end) GROUP BY remote_country") or die (mysql_error());
				$NRC = mysql_num_rows($qNRC);

				$qInBand = mysql_query("SELECT ROUND(((sum(in_bytes) / 1048576) / ($end - $start)) * 8000,2)  as bandwidth FROM conn_meta WHERE time between $start AND $end") or die (mysql_error());
				$aInBand = mysql_result($qInBand,0);

				$qOutBand = mysql_query("SELECT ROUND(((sum(out_bytes) / 1048576) / ($end - $start)) * 8000,2) as bandwidth FROM conn_meta WHERE time between $start AND $end") or die (mysql_error());
				$aOutBand = mysql_result($qOutBand,0);

				$qNewIP = mysql_query("SELECT SQL_CALC_FOUND_ROWS remote_ip FROM conn_remote_ip WHERE (time between $start AND $end) GROUP BY remote_ip") or die (mysql_error());
				$aNewIP = mysql_num_rows($qNewIP);

				$qNewDNS = mysql_query("SELECT SQL_CALC_FOUND_ROWS query FROM dns_query WHERE (time between $start AND $end) GROUP BY query") or die (mysql_error());
				$aNewDNS = mysql_num_rows($qNewDNS);

				$qNewHTTP = mysql_query("SELECT SQL_CALC_FOUND_ROWS `host` FROM `http_host` WHERE (time between $start AND $end) GROUP BY `host`") or die (mysql_error());
				$aNewHTTP = mysql_num_rows($qNewHTTP);

				$qNewSSL = mysql_query("SELECT SQL_CALC_FOUND_ROWS `remote_ip` FROM `ssl_remote_ip` WHERE (time between $start AND $end) GROUP BY `remote_ip`") or die (mysql_error());
				$aNewSSL = mysql_num_rows($qNewSSL);

				$qL7 = mysql_query("SELECT SQL_CALC_FOUND_ROWS `l7_proto` FROM `conn_l7` WHERE (time between $start AND $end) GROUP BY `l7_proto`") or die (mysql_error());
				$aL7 = mysql_num_rows($qL7);

				$html= array(
					array(
						'pID' => 'head',
						'dID' => 'ioc_info',
						'heading' => 'IOC Summary',
						'bgColor' => ' ',
						'data' => '
							<div style="font-size:12px !important;line-height:21px; padding:10px 0 10px 10px !important;background-color:#f0f0f0 !important;border-radius: 5px !important;">
								<span style="font-weight:bold !important;">Local IPs:</span> '.$lIP.'<br />
								<span style="font-weight:bold !important;">Remote IPs:</span> '.$rIP.'<br />
								<span style="font-weight:bold !important;">Remote Countries:</span> '.$RC.'<br />
								<span style="font-weight:bold !important;">IOC Notifications:</span> '.$IOCh.'<br />
								<span style="font-weight:bold !important;">IOC Groups:</span> '.$IOCg.'<br /> 								
								<span style="font-weight:bold !important;">IOC File Names:</span> '.$aIOCfile.'<br />
								<span style="font-weight:bold !important;">IOC DNS queries:</span> '.$aIOCdns.'<br />
								<span style="font-weight:bold !important;">IOC HTTP Hosts:</span> '.$aIOChttp.'<br />
								<span style="font-weight:bold !important;">IOC SSL Hosts:</span> '.$aIOCssl.'<br />
								<span style="font-weight:bold !important;">IOC L7 Protocols:</span> '.$aIOCl7.'<br />
							</div>',
					),
					array(
						'pID' => 'head',
						'dID' => 'net_info',
						// 'heading' => 'Network Summary',
						'heading' => 'Network Summary',
						'bgColor' => ' ',
						'data' => '
							<div style="font-size:12px !important;line-height:21px; padding:10px 0 10px 10px !important;background-color:#f0f0f0 !important;border-radius: 5px !important;">
								<span style="font-weight:bold !important;">Local IPs:</span> '.$NlIP.'<br />
								<span style="font-weight:bold !important;">Remote IPs:</span> '.$NrIP.'<br />
								<span style="font-weight:bold !important;">Remote Countries:</span> '.$NRC.'<br />
								<span style="font-weight:bold !important;">Avg B/w In:</span> '.$aOutBand.' (Kb/s)<br />
								<span style="font-weight:bold !important;">Avg B/w Out:</span> '.$aInBand.' (Kb/s)<br />
								<span style="font-weight:bold !important;">New Remote IP:</span> '.$aNewIP.'<br />
								<span style="font-weight:bold !important;">New DNS Query:</span> '.$aNewDNS.'<br />
								<span style="font-weight:bold !important;">New HTTP Hosts:</span> '.$aNewHTTP.'<br />
								<span style="font-weight:bold !important;">New SSL Hosts:</span> '.$aNewSSL.'<br />
								<span style="font-weight:bold !important;">L7 Protocols Detected:</span> '.$aL7.'<br />
							</div>',
						// <span style="text-decoration:underline !important;font-size:23px !important; line-height: 35px !important; font-weight:bold">Network</span><br />
					)
				);
			}	
			$viz = array(

				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('remote_country'),
							'grp' => array('count')
						),
						array(
							'dim' => array('hour'),
							'grp' => array('count')
						),
						array(
							'dim' => array('ioc'),
							'grp' => array('count')
						),
					),
					'select' => array(
						array('from_unixtime(time) AS time'), 
						array('remote_country'),
						array('ioc_severity'),
						array('count(*) AS count'), 
						array('ioc') 
					),
					'from' => 'conn_ioc',
					'where' => '`ioc_count` > 0, `trash` IS NULL',
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), remote_country, ioc_severity',
					'disp' => array(
						array(
							'dView' => 'true', 
							'pID' => 'head',
							'dID' => 'row', 
							'type' => 'row', 
							'heading' => 'IOC Classes (Quantity of IOC Notifications)',
							'dim' => 'ioc',
							'grp' => 'count'
						),
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'sBar', 
							'type' => 'severitybar', 
							'heading' => 'IOC Notifications Per Hour',
							'xAxis' => '',
							'yAxis' => '# IOC / Hour',
							'dim' => 'hour',
							'grp' => 'count'
						),
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'geo', 
							'type' => 'geo', 
							'heading' => 'IOC Source Countries',
							'dim' => 'remote_country',
							'grp' => 'count'
						)
					)		
				),
			);	
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'Indicators of Compromise (IOC) Notifications',
					'select' => array(
						// array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, rowsquery value, breadcrumb clear(boolean)
						array('max(from_unixtime(time)) AS time','Last Seen','true','ioc_drill','lan_ip,wan_ip,remote_ip,ioc','false'), 
						array('ioc_severity','Severity','true'), 
						array('count(*) AS count','IOC Hits','true'), 
						array('ioc','IOC','true'),
						array('ioc_type', 'IOC Type', 'true'),
						array('lan_zone','LAN Zone','true'),
						array('lan_ip','LAN IP','true'),
						array('machine','Machine Name','true'),
						array('wan_ip','WAN IP','false'),
						array('remote_ip','Remote IP','true'),
						array('remote_asn','Remote ASN','true'),
						array('remote_asn_name','Remote ASN Name','true'),
						array('remote_country','Remote Country','true'),
						array('remote_cc',' ','true'),
						array('sum(in_packets) AS in_packets','Packets to Remote','true'), 
						array('sum(out_packets) AS out_packets','Packets from Remote','true'), 
						array('sum(`in_bytes`) AS in_bytes','Bytes to Remote','false'), 
						array('sum(`out_bytes`) AS out_bytes','Bytes from Remote','false'), 
					),
					'from' => 'conn_ioc',
					'where' => '`ioc_count` > 0, `trash` IS NULL',
					'group' => 'lan_ip, wan_ip, remote_ip, ioc'
				),
			);	
			break;	
		case 'ioc_drill':
			list($lan_ip, $wan_ip, $remote_ip, $ioc) = split(',', $query);
			//set mysql query parameters
			$page = array(
				'title' => 'IOC Notifications',
				'header' => 'drilldown',
				'vDiv' => array(			
					array('info', '33.33,33.33,33.33'),			
					array('crossfilter', '100'),
					array('tables', '100')
				),
				'sidebar' => 'notifications'
			);		
			if (isset($_GET['getInfo'])) {
				$info = mysql_query ("	
					SELECT 
						max(from_unixtime(time)) as last, 
						min(from_unixtime(time)) as first, 
						sum(in_packets) as in_packets, 
						sum(out_packets) as out_packets, 
						sum(in_bytes) as in_bytes, 
						sum(out_bytes) as out_bytes, 
						machine,
						lan_zone, 
						lan_port, 
						wan_port, 
						remote_port, 
						remote_cc, 
						remote_country,
						remote_asn,
						remote_asn_name, 
						l7_proto, 
						ioc_type
					FROM `conn_ioc` 
					WHERE 
						lan_ip = '$lan_ip' AND
						wan_ip = '$wan_ip' AND
						remote_ip = '$remote_ip' AND
						ioc = '$ioc' 
					LIMIT 1
				") or die (mysql_error());
				$info2 = mysql_query ("	
					SELECT 
						description
					FROM `ioc_group` 
					WHERE 
						ioc_group = '$ioc'
					LIMIT 1
				") or die (mysql_error());

				$html = array(
					array(
						'pID' => 'info',
						'dID' => 'local',
						'heading' => 'Local IP',
						'data' =>
							'<ul class="feeds f32">
								<li> 
									<div style="float:left;width:50%">						
										<div style="float:left;"><strong>Country: </strong>Canada</div>
										<div style="float:left;margin-left: 10px;">
											<div style="position:absolute;margin-top:-7px;"><span class="flag ca"></span></div>
										</div>
									</div>
									<div style="float:left;width:50%">	
										<div style="float:left;"><img style="position:absolute" src="assets/img/userplaceholder.jpg"></img><div>
									</div>
								</li>
								<li>
									<div style="float:left;width:50%"><strong>Lan Zone:</strong> '.mysql_result($info, 0, 'lan_zone').'</div>
								</li>
								<li>
									<div style="float:left;width:50%"><strong>Lan IP:</strong> <a href="javascript:void(0);" onclick="javascript:page(\''.$lan_ip.','.$wan_ip.'\',\'ioc_local\',null,null,true);">'.$lan_ip.'</a></div>
									<div style="float:right;width:50%"><strong>Lan Port:</strong> '.mysql_result($info, 0, 'lan_port').'</div>
								</li>
								<li>
									<div style="float:left"><strong>Machine Name:</strong> '.mysql_result($info, 0, 'machine').'</div>
								</li>
								<li>
									<div style="float:left;width:50%"><strong>Packets received:</strong> '.mysql_result($info, 0, 'out_packets').'</div>
									<div style="float:right;width:50%"><strong>Bytes received:</strong> '.mysql_result($info, 0, 'out_bytes').'</div>
								</li>
							</ul>'
						),
								// <li>
								// 	<div style="float:left;width:50%"><strong>Wan IP:</strong> <a href="javascript:void(0);" onclick="javascript:page(\''.$lan_ip.','.$wan_ip.'\',\'ioc_local\',null,null,true);">'.$wan_ip.'</a></div>
								// 	<div style="float:right;width:50%"><strong>Wan Port:</strong> '.mysql_result($info, 0, 'wan_port').'</div>
								// </li>
					array(
						'pID' => 'info',
						'dID' => 'remote_ip',
						'heading' => 'Remote IP',
						'data' =>
							'<ul class="feeds f32">
								<li> 
									<div style="float:left;"><strong>Country:</strong> '.mysql_result($info, 0, 'remote_country').'</div>
									<div style="float:left; margin-left: 10px;"><div style="position:absolute;margin-top:-7px;"><span class="flag '.strtolower(mysql_result($info, 0, 'remote_cc')).'"></span></div></div>
								</li>
								<li>
									<strong>Remote IP:</strong> <a href="javascript:void(0);" onclick="javascript:page(\''.$remote_ip.'\',\'ioc_remote\',null,null,true);">'.$remote_ip.'</a>
								</li>						
								<li>
									<div style="float:left;width:50%"><strong>Remote Port:</strong> '.mysql_result($info, 0, 'remote_port').'</div>
									<div style="float:right;width:50%"><strong>Layer 7 Protocol:</strong> '.mysql_result($info, 0, 'l7_proto').'</div>
								</li>
								<li>
									<div style="float:left;width:50%"><strong>Packets received:</strong> '.mysql_result($info, 0, 'in_packets').'</div>
									<div style="float:right;width:50%"><strong>Remote ASN:</strong> '.mysql_result($info, 0, 'remote_asn').'</div>
								</li>
								<li>
									<div style="float:left;width:50%"><strong>Bytes received:</strong> '.mysql_result($info, 0, 'in_bytes').'</div>
									<div style="float:right;width:50%"><strong>Remote ASN Name:</strong> '.mysql_result($info, 0, 'remote_asn_name').'</div>
								</li>
								<li>
									<div style="float:left;width:50%"><strong>First IOC Hit:</strong> '.mysql_result($info, 0, 'first').'</div>
									<div style="float:right;width:50%"><strong>Last IOC Hit:</strong> '.mysql_result($info, 0, 'last').'</div>
								</li>
							</ul>'
						),
					array(
						'pID' => 'info',
						'dID' => 'ioc',
						'heading' => 'IOC information',
						'data' =>
							'<ul class="feeds">
								<li><strong>IOC:</strong> <a href="javascript:void(0);" onclick="javascript:page(\''.$ioc.'\',\'ioc_impact\',null,null,true);">'.$ioc.'</a></li>
								<li><strong>IOC Type:</strong> '.mysql_result($info, 0, 'ioc_type').'</li>
								<li><strong>IOC Info:</strong><span class="description"> '.mysql_result($info2, 0, 'description').'</span></li>
							</ul>'
					)					
				);
			};
			$viz = array(
				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('hour'),
							'grp' => array('count')
						),
					),
					'select' => array(
						array('from_unixtime(time) as time'), 
						array('count(*) AS count'), 
						array('ioc_severity'),
						array('ioc'), 
					),
					'from' => 'conn_ioc',
					'where' => "`lan_ip` = '$lan_ip', `wan_ip` = '$wan_ip', `remote_ip` = '$remote_ip', `ioc` = '$ioc'",
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), ioc_severity',
					'disp' => array(
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'severitybar', 
							'heading' => 'IOC Notifications Per Hour',
							'xAxis' => '',
							'yAxis' => '# IOC / Hour',
							'dim' => 'hour',
							'grp' => 'count'
						)
					)		
				)
			);				
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'Indicators of Compromise (IOC) Notifications',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('from_unixtime(`time`) AS time','Time','true','ioc_event','conn_uids','false'), 
						array('lan_port','LAN Port','true'),
						array('wan_port','WAN Port','true'),
						array('remote_port','Remote Port','true'),
						array('in_packets','Packets to Remote','true'), 
						array('out_packets','Packets from Remote','true'), 
						array('in_bytes','Bytes to Remote','true'), 
						array('out_bytes','Bytes from Remote','true'), 
						array('file','Files Extracted','true'), 
						array('http','HTTP Links','true'), 
						array('dns','DNS Query','true'), 
						array('ssl','SSL Query','true'), 
						array('conn_uids','ID','false') 
					),
					'from' => 'conn_ioc',
					'where' => "`lan_ip`='$lan_ip', `wan_ip`='$wan_ip', `remote_ip`='$remote_ip', `ioc`='$ioc'",
				)
			);	
			break;	
		case 'ioc_event':
			//set mysql query parameters
			$page = array(
				'title' => 'IOC Notifications',
				'header' => 'drilldown',
				'sidebar' => 'notifications',
				'vDiv' => array(
					array('info', '33.33,33.33,33.33'),
					array('crossfilter', '100'),
					array('tables', '100')	
				)
			);		
			if (isset($_GET['getInfo'])) {
				$info1 = mysql_query	("	
					SELECT 
						from_unixtime(time) as time,
						sum(in_packets) as in_packets, 
						sum(out_packets) as out_packets, 
						sum(in_bytes) as in_bytes, 
						sum(out_bytes) as out_bytes, 
						machine,
						lan_zone, 
						lan_ip, 
						lan_port, 
						wan_ip, 
						wan_port, 
						remote_port, 
						l7_proto, 
						remote_ip, 
						remote_country, 
						remote_cc,
						remote_asn,
						remote_asn_name, 
						ioc_type, 
						ioc
					FROM `conn_ioc` 
					WHERE conn_uids = '$query' 
					LIMIT 1
				") or die (mysql_error());
				$info2 = mysql_query ("	
					SELECT 
						i.description
					FROM ioc_group i JOIN conn_ioc c ON (i.ioc_group=c.ioc)
					WHERE 
						c.conn_uids = '$query' 
					LIMIT 1
				") or die (mysql_error());

				$html = array(				
					array(
						'pID' => 'info',
						'dID' => 'col1',
						'heading' => 'Local IP',
						'data' =>
						'<ul class="feeds f32">
							<li> 
									<div style="float:left;width:50%">						
										<div style="float:left;"><strong>Country: </strong>Canada</div>
										<div style="float:left;margin-left: 10px;">
											<div style="position:absolute;margin-top:-7px;"><span class="flag ca"></span></div>
										</div>
									</div>
									<div style="float:left;width:50%">	
										<div style="float:left;"><img style="position:absolute" src="assets/img/userplaceholder.jpg"></img><div>
									</div>								
				
							</li>
							<li>
								<div style="float:left;"><strong>Lan Zone:</strong> '.mysql_result($info1, 0, 'lan_zone').'
							</li>
							<li>
								<div style="float:left;width:50%"><strong>Lan IP:</strong> <a href="javascript:void(0);" onclick="javascript:page(\''.mysql_result($info1, 0, 'lan_ip').','.mysql_result($info1, 0, 'wan_ip').'\',\'ioc_local\',null,null,true);">'.mysql_result($info1, 0, 'lan_ip').'</a></div>
								<div style="float:right;width:50%"><strong>Lan Port:</strong> '.mysql_result($info1, 0, 'lan_port').'</div>
							</li>
							<li>
								<div style="float:left;width:50%"><strong>Machine Name:</strong> '.mysql_result($info1, 0, 'machine').' </div>
							</li>
							<li>
								<div style="float:left;width:50%"><strong>Packets received:</strong> '.mysql_result($info1, 0, 'out_packets').'</div>
								<div style="float:right;width:50%"><strong>Bytes received:</strong> '.mysql_result($info1, 0, 'out_bytes').'</div>
							</li>
						</ul>'
					),
							// <li>
							// 	<div style="float:left;width:50%"><strong>Wan IP:</strong> <a href="javascript:void(0);" onclick="javascript:page(\''.mysql_result($info1, 0, 'lan_ip').','.mysql_result($info1, 0, 'wan_ip').'\',\'ioc_local\',null,null,true);">'.mysql_result($info1, 0, 'wan_ip').'</a></div>
							// 	<div style="float:right;width:50%"><strong>Wan Port:</strong> '.mysql_result($info1, 0, 'wan_port').'</div>
							// </li>
					array(
						'pID' => 'info',
						'dID' => 'col2',
						'heading' => 'Remote IP',
						'data' =>
						'<ul class="feeds f32">
							<li> 								
								<div style="float:left;"><strong>Country:</strong> '.mysql_result($info1, 0, 'remote_country').'</div>
								<div style="float:left; margin-left: 10px;"><div style="position:absolute;margin-top:-7px;"><span class="flag '.strtolower(mysql_result($info1, 0, 'remote_cc')).'"></span></div></div>
							</li>
							<li>
								<div style="float:left;width:50%"><strong>Remote IP:</strong> <a href="javascript:void(0);" onclick="javascript:page(\''.mysql_result($info1, 0, 'remote_ip').'\',\'ioc_remote\',null,null,true);">'.mysql_result($info1, 0, 'remote_ip').'</a></div>
								<div style="float:right;width:50%"><strong>Time:</strong> '.mysql_result($info1, 0, 'time').'</div>
							</li>
							<li>
								<div style="float:left;width:50%"><strong>Remote Port:</strong> '.mysql_result($info1, 0, 'remote_port').'</div>
								<div style="float:right;width:50%"><strong>Layer 7 Protocol:</strong> '.mysql_result($info1, 0, 'l7_proto').'</div>
							</li>
							<li>
								<div style="float:left;width:50%"><strong>Bytes received:</strong> '.mysql_result($info1, 0, 'in_bytes').'</div>
								<div style="float:right;width:50%"><strong>Remote ASN:</strong> '.mysql_result($info1, 0, 'remote_asn').'</div>
							</li>
							<li>
								<div style="float:left;width:50%"><strong>Packets received:</strong> '.mysql_result($info1, 0, 'in_packets').'</div>
								<div style="float:right;width:50%"><strong>Remote ASN Name:</strong> '.mysql_result($info1, 0, 'remote_asn_name').'</div>
							</li>
						</ul>'
					),
					array(
						'pID' => 'info',
						'dID' => 'col3',
						'heading' => 'IOC Information',
						'data' =>
						'<ul class="feeds">
							<li><strong>IOC:</strong> <a href="javascript:void(0);" onclick="javascript:page(\''.mysql_result($info1, 0, 'ioc').'\',\'ioc_impact\',null,null,true);">'.mysql_result($info1, 0, 'ioc').'</a></li>
							<li><strong>IOC Type:</strong> '.mysql_result($info1, 0, 'ioc_type').'</li>
							<li><strong>IOC Info:</strong><span class="description"> '.mysql_result($info2, 0, 'description').'</span></li>
						</ul>',
					)
				);
			};
			$viz = array();
			$table = array(
				array(
					'sDom' => 'false',
					'pID' => 'tables',
					'dID' => 'ssl',
					'heading' => 'SSL',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('version','Version','true'),
						array('cipher','cipher','true'),
						array('server_name','Server Name','true'),
						array('subject','Subject','true'),
						array('issuer_subject','Issuer Subject','true'),
						array('from_unixtime(not_valid_before) AS not_valid_before','Not Valid Before','true'),
						array('from_unixtime(not_valid_after) AS not_valid_after','Not Valid After','true'),
					),
					'from' => 'ssl_ioc',
					'where' => "`conn_uids`='$query'",
				),
				array(
					'sDom' => 'false',
					'pID' => 'tables',
					'dID' => 'dns',
					'heading' => 'DNS',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('qclass_name','Query Class','true'),
						array('qtype_name','Query Type','true'),
						array('query','Query','true'),
						array('answers','Answers','true'),
						array('TTLs','TTLs','true'),
					),
					'from' => 'dns_ioc',
					'where' => "`conn_uids`='$query'",
				),
				array(
					'sDom' => 'false',
					'pID' => 'tables',
					'dID' => 'http',
					'heading' => 'HTTP',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('host','Domain','true'),
						array('uri','URI','true'),
						array('referrer','Referrer','true'),
						array('user_agent','User Agent','true'),
						array('ioc','IOC','true'),
						array('ioc_type','IOC Type','true'),
					),
					'from' => 'http_ioc',
					'where' => "`conn_uids`='$query'",
				),
				array(
					'sDom' => 'false',
					'pID' => 'tables',
					'dID' => 'files',
					'heading' => 'Files',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('mime','MIME Type','true'),
						array('name','File Name','true'),
						array('size','File Size','true'),
						array('md5','MD5','true'),
						array('sha1','SHA1','true'),
						array('ioc','IOC','true'),
						array('ioc_type','IOC Type','true'),
					),
					'from' => 'file_ioc',
					'where' => "`conn_uids`='$query'",
				)
			);	
			break;			
		case 'ioc_local':
			list($lan_ip, $wan_ip) = split(',', $query);
			//set mysql query parameters
			$page = array(
				'title' => 'IOC Notifications',
				'header' => 'drilldown',
				'vDiv' => array(
					array('crossfilter', '100'),
					array('tables', '100')	
				),
				'sidebar' => 'notifications'
			);
			$viz = array(
				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('remote_country'),
							'grp' => array('count')
						),
						array(
							'dim' => array('hour'),
							'grp' => array('count')
						),
						array(
							'dim' => array('ioc'),
							'grp' => array('count')
						)
					),
					'select' => array(
						array('from_unixtime(time) AS time'), 
						array('remote_country'),
						array('count(*) AS count'), 
						array('ioc'), 
						array('ioc_severity'),
					),
					'from' => 'conn_ioc',
					'where' => "`ioc_count` > 0, `trash` IS NULL, `lan_ip` = '$lan_ip', `wan_ip` = '$wan_ip'",
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), remote_country, ioc_severity',
					'disp' => array(
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'severitybar', 
							'heading' => 'IOC Notifications Per Hour',
							'xAxis' => '',
							'yAxis' => '# IOC / Hour',
							'dim' => 'hour',
							'grp' => 'count'
						)
					)		
				)
			);	
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'Indicators of Compromise (IOC) Notifications',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('max(from_unixtime(time)) as time','Last Seen','true','ioc_drill','lan_ip,wan_ip,remote_ip,ioc','false'), 
						array('ioc_severity','Severity','true'), 
						array('count(*) AS count','IOC Hits','true'), 
						array('ioc','IOC','true'),
						array('ioc_type', 'IOC Type', 'true'),
						array('lan_zone','LAN Zone','true'),
						array('lan_ip','LAN IP','true'),
						array('machine','Machine Name','true'),
						array('wan_ip','WAN IP','false'),
						array('remote_ip','Remote IP','true'),
						array('remote_asn','Remote ASN','true'),
						array('remote_asn_name','Remote ASN Name','true'),
						array('remote_country','Remote Country','true'),
						array('remote_cc',' ','true'),
						array('sum(in_packets) as in_packets','Packets to Remote','true'), 
						array('sum(out_packets) as out_packets','Packets from Remote','true'), 
						array('sum(`in_bytes`) as in_bytes','Bytes to Remote','false'), 
						array('sum(`out_bytes`) as out_bytes','Bytes from Remote','false'), 
					),
					'from' => 'conn_ioc',
					'where' => "`ioc_count` > 0,`trash` IS NULL,`lan_ip` = '$lan_ip',`wan_ip` = '$wan_ip'",
					'group' => 'lan_ip, wan_ip, remote_ip, ioc'
				),
			);	
			break;	
		case 'ioc_remote':
			//set mysql query parameters
			$page = array(
				'title' => 'IOC Notifications',
				'header' => 'drilldown',
				'sidebar' => 'notifications',
				'vDiv' => array(
					array('crossfilter', '100'),
					array('tables', '100')	
				),
			);
			$viz = array(
				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('remote_country'),
							'grp' => array('count')
						),
						array(
							'dim' => array('hour'),
							'grp' => array('count')
						),
						array(
							'dim' => array('ioc'),
							'grp' => array('count')
						)
					),
					'select' => array(
						array('from_unixtime(time) as time'), 
						array('remote_country'),
						array('count(*) AS count'), 
						array('ioc'), 
						array('ioc_severity'), 
					),
					'from' => 'conn_ioc',
					'where' => "`ioc_count` > 0, `trash` IS NULL, `remote_ip` = '$query'",
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), remote_country, ioc_severity',
					'disp' => array(
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'severitybar', 
							'heading' => 'IOC Hits Per Hour',
							'xAxis' => '',
							'yAxis' => '# IOC Hits / Hour',
							'dim' => 'hour',
							'grp' => 'count'
						)
					)		
				)
			);	
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'Indicators of Compromise (IOC) Notifications',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('max(from_unixtime(time)) as time','Last Seen','true','ioc_drill','lan_ip,wan_ip,remote_ip,ioc','false'), 
						array('ioc_severity','Severity','true'),
						array('count(*) AS count','IOC Hits','true'), 
						array('ioc','IOC','true'),
						array('ioc_type', 'IOC Type', 'true'),
						array('lan_zone','LAN Zone','true'),
						array('lan_ip','LAN IP','true'),
						array('machine','Machine Name','true'),
						array('wan_ip','WAN IP','false'),
						array('remote_ip','Remote IP','true'),
						array('remote_asn','Remote ASN','true'),
						array('remote_asn_name','Remote ASN Name', 'true'),
						array('remote_country','Remote Country','true'),
						array('remote_cc',' ','true'),
						array('sum(in_packets) as in_packets','Packets to Remote','true'), 
						array('sum(out_packets) as out_packets','Packets from Remote','true'), 
						array('sum(`in_bytes`) as in_bytes','Bytes to Remote','false'), 
						array('sum(`out_bytes`) as out_bytes','Bytes from Remote','false'), 
					),
					'from' => 'conn_ioc',
					'where' => "`ioc_count` > 0, `trash` IS NULL, `remote_ip` = '$query'",
					'group' => 'lan_ip, wan_ip, remote_ip, ioc'
				),
			);	
			break;	
		case 'ioc_impact':
			//set mysql query parameters
			$page = array(
				'title' => 'IOC Notifications',
				'header' => 'drilldown',
				'vDiv' => array(
					array('crossfilter', '100'),
					array('tables', '100')	
				),
				'subheading' => '',
				// 'severity' => 'true',
				'sidebar' => 'notifications'
			);
			$viz = array(
				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('remote_country'),
							'grp' => array('count')
						),
						array(
							'dim' => array('hour'),
							'grp' => array('count')
						)
					),
					'select' => array(
						array('from_unixtime(time) as time'), 
						array('remote_country'),
						array('count(*) AS count'),
						array('ioc_severity') 
					),
					'from' => 'conn_ioc',
					'where' => "`ioc_count` > 0, `trash` IS NULL, `ioc` = '$query'",
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), remote_country, ioc_severity',
					'disp' => array(
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'severitybar', 
							'heading' => 'IOC Notifications Per Hour',
							'xAxis' => '',
							'yAxis' => '# IOC / Hour',
							'dim' => 'hour',
							'grp' => 'count'
						)
					)		
				)
			);	
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'Indicators of Compromise (IOC) Hits',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('max(from_unixtime(time)) as time','Last Seen','true','ioc_drill','lan_ip,wan_ip,remote_ip,ioc','false'), 
						array('ioc_severity','Severity','true'),
						array('count(*) AS count','IOC Hits','true'), 
						array('ioc','IOC','true'),
						array('ioc_type', 'IOC Type', 'true'),
						array('lan_zone','LAN Zone','true'),
						array('lan_ip','LAN IP','true'),
						array('machine','Machine Name','true'),
						array('wan_ip','WAN IP','false'),
						array('remote_ip','Remote IP','true'),
						array('remote_asn','Remote ASN','true'),
						array('remote_asn_name','Remote ASN Name','true'),
						array('remote_country','Remote Country','true'),
						array('remote_cc',' ','true'),
						array('sum(in_packets) as in_packets','Packets to Remote','true'), 
						array('sum(out_packets) as out_packets','Packets from Remote','true'), 
						array('sum(`in_bytes`) as in_bytes','Bytes to Remote','false'), 
						array('sum(`out_bytes`) as out_bytes','Bytes from Remote','false'), 
					),
					'from' => 'conn_ioc',
					'where' => "`ioc_count` > 0, `trash` IS NULL, `ioc` = '$query'",
					'group' => 'lan_ip, wan_ip, remote_ip, ioc'
				),
			);	
			break;	
		case 'ioc_top_remote':
			//set mysql query parameters
			$page = array(
				'title' => 'IOC Notifications',
				'header' => 'drilldown',
				'vDiv' => array(
					array('tables', '100')	
				),
				'subheading' => '',
				'severity' => 'true',
				'sidebar' => 'ioc_top_remote'
			);
			$viz = array();
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'Indicators of Compromise (IOC) Notifications',
					'sSort' => '[ 2, "desc" ]',
					'select' => array(
						// array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, rowsquery value, breadcrumb clear(boolean)
						array('max(from_unixtime(time)) AS time','Last Seen','true','ioc_top_remote2local','remote_ip,ioc','false'), 
						array('ioc_severity','Severity','true'), 
						array('count(*) AS count','IOC Hits','true'), 
						array('ioc','IOC','true'),
						array('ioc_type', 'IOC Type', 'true'),
						array('remote_ip','Remote IP','true'),
						array('remote_asn','Remote ASN','true'),
						array('remote_asn_name','Remote ASN Name','true'),
						array('remote_country','Remote Country','true'),
						array('remote_cc',' ','true'),
						array('sum(in_packets) AS in_packets','Packets to Remote','true'), 
						array('sum(out_packets) AS out_packets','Packets from Remote','true'), 
						array('sum(`in_bytes`) AS in_bytes','Bytes to Remote','false'), 
						array('sum(`out_bytes`) AS out_bytes','Bytes from Remote','false'), 
					),
					'from' => 'conn_ioc',
					'where' => '`ioc_count` > 0, `trash` IS NULL',
					'group' => 'remote_ip, ioc'
				),
			);	
			break;	
		case 'ioc_top_remote2local':
			list($remote_ip, $ioc) = split(',', $query);
			//set mysql query parameters
			$page = array(
				'title' => 'IOC Notifications',
				'header' => 'drilldown',
				'vDiv' => array(
					array('tables', '100')	
				),
				'subheading' => '',
				'sidebar' => 'ioc_top_remote'
			);
			$viz = array();
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'Indicators of Compromise (IOC) Notifications',
					'select' => array(
						// array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, rowsquery value, breadcrumb clear(boolean)
						array('max(from_unixtime(time)) AS time','Last Seen','true','ioc_drill','lan_ip,wan_ip,remote_ip,ioc','false'), 
						array('ioc_severity','Severity','true'), 
						array('count(*) AS count','IOC Hits','true'), 
						array('ioc','IOC','true'),
						array('ioc_type', 'IOC Type', 'true'),
						array('lan_zone','LAN Zone','true'),
						array('lan_ip','LAN IP','true'),
						array('machine','Machine Name','true'),
						array('wan_ip','WAN IP','false'),
						array('remote_ip','Remote IP','true'),
						array('remote_asn','Remote ASN','true'),
						array('remote_asn_name','Remote ASN Name','true'),
						array('remote_country','Remote Country','true'),
						array('remote_cc',' ','true'),
						array('sum(in_packets) AS in_packets','Packets to Remote','true'), 
						array('sum(out_packets) AS out_packets','Packets from Remote','true'), 
						array('sum(`in_bytes`) AS in_bytes','Bytes to Remote','false'), 
						array('sum(`out_bytes`) AS out_bytes','Bytes from Remote','false'), 
					),
					'from' => 'conn_ioc',
					'where' => "remote_ip='$remote_ip', ioc='$ioc', `ioc_count` > 0, `trash` IS NULL",
					'group' => 'remote_ip, ioc'
				),
			);	
			break;	
		case 'new_remote_ip':
			//set mysql query parameters
			$page = array(
				'title' => 'New Remote IPs',
				'header' => 'drilldown',
				'vDiv' => array(
					array('crossfilter', '100'),
					array('tables', '100')	
				),
				'sidebar' => 'new_remote_ip'
			);
			$viz = array(
				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('hour'),
							'grp' => array('count')
						)
					),
					'select' => array(
						array('from_unixtime(time) AS time'), 
						array('remote_ip'),
						array('count(*) AS count'), 
					),
					'from' => 'conn_remote_ip',
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time))',
					'disp' => array(
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'bar', 
							'heading' => 'New Remote IP Addresses Detected Per Hour',
							'xAxis' => '',
							'yAxis' => '# New IP / Hour',
							'dim' => 'hour',
							'grp' => 'count'
						)
					)		
				)
			);		
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'New Remote IP Addresses Detected',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('from_unixtime(time) AS time','First Seen','true'), 
						array('remote_ip','Remote IP','true'), 
						array('remote_asn','Remote ASN','true'),  
						array('remote_asn_name','Remote ASN Name','true'),
						array('remote_country','Remote Country','true'), 
						array('remote_cc','Flag','true'),
						array('lan_zone','LAN Zone','true'), 
						array('lan_ip','LAN IP','true'), 
						array('machine','Machine Name','true'),
						array('wan_ip','WAN IP','false') 
					),
					'from' => 'conn_remote_ip',
					'group' => 'remote_ip'
				),
			);	
			break;	
		case 'new_dns_query':
			//set mysql query parameters
			$page = array(
				'title' => 'New DNS Requests',
				'header' => 'drilldown',
				'vDiv' => array(
					array('crossfilter', '100'),
					array('tables', '100')	
				),
				'subheading' => '',
				'sidebar' => 'new_dns_query'
			);
			$html= array();
			$viz = array(
				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('hour'),
							'grp' => array('count')
						)
					),
					'select' => array(
						array('from_unixtime(time) as time'), 
						array('query'),
						array('count(*) AS count'), 
					),
					'from' => 'dns_query',
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time))',
					'disp' => array(
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'bar', 
							'heading' => 'New DNS Queries Detected Per Hour',
							'xAxis' => '',
							'yAxis' => '# New Query / Hour',
							'dim' => 'hour',
							'grp' => 'count'
						)
					)		
				)
			);		
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'New DNS Queries Detected',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('from_unixtime(time) AS time','First Seen','true'), 
						array('remote_ip','Remote IP','true'), 
						array('remote_port','Remote Port','true'), 
						array('proto','Protocol','true'), 						
						array('remote_asn_name','Remote ASN','true'), 
						array('remote_country','Remote Country','true'), 
						array('remote_cc','Flag','true'),
						array('lan_zone','LAN ZONE','true'), 
						array('lan_ip','LAN IP','true'),
						array('machine','Machine Name','true'), 
						array('wan_ip','WAN IP','false'), 
						array('qtype','Query Type','true'), 
						array('qclass','Query Class','false'), 
						array('rcode','Response Code','false'),
						array('query','DNS Query','true')
					),
					'from' => 'dns_query',
					'group' => 'query'
				),
			);	
			break;	
		case 'new_http_host':
			//set mysql query parameters
			$page = array(
				'title' => 'New HTTP Domains Detected',
				'header' => 'drilldown',
				'vDiv' => array(
					array('crossfilter', '100'),
					array('tables', '100')	
				),
				'subheading' => '',
				'sidebar' => 'new_http_host'
			);
			$html= array();
			$viz = array(
				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('hour'),
							'grp' => array('count')
						)
					),
					'select' => array(
						array('from_unixtime(time) as time'), 
						array('host'),
						array('count(*) AS count'), 
					),
					'from' => 'http_host',
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time))',
					'disp' => array(
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'bar', 
							'heading' => 'New HTTP Domains Detected Per Hour',
							'xAxis' => '',
							'yAxis' => '# New Domains / Hour',
							'dim' => 'hour',
							'grp' => 'count'
						)
					)		
				)
			);		
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'New HTTP Domains Detected',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('from_unixtime(time) AS time','First Seen','true'), 
						array('host','HTTP Domains','true'),
						array('remote_ip','Remote IP','true'), 
						array('remote_asn','Remote ASN','true'),  
						array('remote_asn_name','Remote ASN Name','true'),
						array('remote_country','Remote Country','true'), 
						array('remote_cc','Flag','true'),
						array('lan_zone','LAN Zone','true'), 
						array('lan_ip','LAN IP','true'),
						array('machine','Machine Name','true'),
						array('wan_ip','WAN IP','false')
					),
					'from' => 'http_host',
					'group' => 'host'
				),
			);	
			break;	
		case 'new_ssl_host':
			//set mysql query parameters
			$page = array(
				'title' => 'New Remote IP Detected Serving SSL Traffic',
				'header' => 'drilldown',
				'vDiv' => array(
					array('crossfilter', '100'),
					array('tables', '100')	
				),
				'subheading' => '',
				'sidebar' => 'new_ssl_host'
			);
			$html= array();
			$viz = array(
				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('hour'),
							'grp' => array('count')
						)
					),
					'select' => array(
						array('from_unixtime(time) as time'), 
						array('remote_ip'),
						array('count(*) AS count'), 
					),
					'from' => 'ssl_remote_ip',
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time))',
					'disp' => array(
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'bar', 
							'heading' => 'New SSL Remote IP Detected Per Hour',
							'xAxis' => '',
							'yAxis' => '# New IP / Hour',
							'dim' => 'hour',
							'grp' => 'count'
						)
					)		
				)
			);		
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'New SSL Remote IP Addresses Detected',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('from_unixtime(time) AS time','First Seen','true'), 
						array('server_name','Server Name','true'),
						array('remote_ip','Remote IP','true'), 
						array('remote_asn','Remote ASN','true'),  
						array('remote_asn_name','Remote ASN Name','true'),
						array('remote_country','Remote Country','true'), 
						array('remote_cc','Flag','true'),
						array('lan_zone','LAN Zone','true'), 
						array('lan_ip','LAN IP','true'),
						array('machine','Machine Name','true'), 
						array('wan_ip','WAN IP','false'), 
					),
					'from' => 'ssl_remote_ip',
					'group' => 'remote_ip'
				),
			);	
			break;	
		case 'l7':
			//set mysql query parameters
			$page = array(
				'title' => 'Bandwidth Usage of Layer 7 Protocols',
				'header' => 'drilldown',
				'vDiv' => array(
					array('crossfilter', '100'),
					array('tables', '100')	
				),
				'subheading' => '',
				'sidebar' => 'l7'
			);
			$viz = array(
				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('hour'),
							'grp' => array('bandwidth')
						)
					),
					'select' => array(
						array('from_unixtime(time) as time'), 
						array('(sum(in_bytes + out_bytes) / 1048576) as bandwidth'), // 1073741824 -> convert bytes to GB
					),
					'from' => 'conn_l7',
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time))',
					'disp' => array(
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'bar', 
							'heading' => 'Bandwidth per Hour',
							'xAxis' => '',
							'yAxis' => 'MB / Hour',
							'dim' => 'hour',
							'grp' => 'bandwidth'
						)
					)		
				)
			);		
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'Layer 7 Protocol Bandwidth Usage',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('max(from_unixtime(time)) AS time','Last Seen','true','l7_drill','l7_proto','true'), 
						array('l7_proto','Layer 7 Protocol','true'),
						array('(sum(in_bytes) / 1048576) AS in_bytes','MB to Remote','true'),
						array('(sum(out_bytes) / 1048576) AS out_bytes','MB from Remote','true'),
						array('sum(in_packets) AS in_packets','Packets to Remote','true'),
						array('sum(out_packets) AS out_packets','Packets from Remote','true'),
					),
					'from' => 'conn_l7',
					'where' => "l7_proto !='-'",
					'group' => 'l7_proto'
				),
			);	
			break;	
		case 'l7_drill':
			//set mysql query parameters
			$page = array(
				'title' => 'Bandwidth Usage of Layer 7 Protocols',
				'header' => 'drilldown',
				'vDiv' => array(
					array('crossfilter', '100'),
					array('tables', '100')	
				),
				'subheading' => '',
				'sidebar' => 'l7'
			);
			$viz = array(
				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('hour'),
							'grp' => array('bandwidth')
						)
					),
					'select' => array(
						array('from_unixtime(time) as time'), 
						array('(sum(in_bytes + out_bytes) / 1048576) as bandwidth'), 
					),
					'from' => 'conn_l7',
					'where' => "`l7_proto` = '$query'",
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time))',
					'disp' => array(
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'bar', 
							'heading' => 'Bandwidth Per Hour',
							'xAxis' => '',
							'yAxis' => 'MB / Hour',
							'dim' => 'hour',
							'grp' => 'bandwidth'
						)
					)		
				)
			);		
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'Layer 7 Protocol Bandwidth Usage',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('max(from_unixtime(time)) AS time','Last Seen','true','l7_local','lan_ip,wan_ip','false'), 
						array('l7_proto','Layer 7 Protocol','true'),
						array('lan_zone','Lan Zone','true'),
						array('lan_ip','Lan IP','true'),
						array('machine','Machine Name','true'),
						array('wan_ip','Wan_IP','false'),
						array('(sum(in_bytes) / 1048576) AS in_bytes','MB to Remote','true'),
						array('(sum(out_bytes) / 1048576) AS out_bytes','MB from Remote','true'),
						array('sum(in_packets) AS in_packets','Packets to Remote','false'),
						array('sum(out_packets) AS out_packets','Packets from Remote','false'),
					),
					'from' => 'conn_l7',
					'where' => "l7_proto='$query'",
					'group' => 'lan_ip, wan_ip'
				),
			);	
			break;	
		case 'l7_local':
			list($lan_ip, $wan_ip) = split(',', $query);
			//set mysql query parameters
			$page = array(
				'title' => 'Bandwidth Usage of Layer 7 Protocols',
				'header' => 'drilldown',
				'vDiv' => array(
					array('crossfilter', '100'),
					array('tables', '100')	
				),
				'subheading' => '',
				'sidebar' => 'l7'
			);
			$viz = array(
				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('hour'),
							'grp' => array('bandwidth')
						)
					),
					'select' => array(
						array('from_unixtime(time) as time'), 
						array('(sum(in_bytes + out_bytes) / 1048576) as bandwidth'), 
					),
					'from' => 'conn_l7',
					'where' => "`lan_ip` = '$lan_ip', `wan_ip` = '$wan_ip'",
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time))',
					'disp' => array(
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'bar', 
							'heading' => 'Bandwidth Per Hour',
							'xAxis' => '',
							'yAxis' => 'MB / Hour',
							'dim' => 'hour',
							'grp' => 'bandwidth'
						)
					)		
				)
			);		
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'Layer 7 Protocol Bandwidth Usage',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('max(from_unixtime(time)) AS time','Last Seen','true','l7_drill','l7_proto','true'), 
						array('l7_proto','Layer 7 Protocol','true'),
						array('lan_zone','Lan Zone','true'),
						array('lan_ip','Lan IP','true'),
						array('machine','Machine Name','true'),
						array('wan_ip','Wan_IP','false'),
						array('(sum(in_bytes) / 1048576) AS in_bytes','MB to Remote','true'),
						array('(sum(out_bytes) / 1048576) AS out_bytes','MB from Remote','true'),
						array('sum(in_packets) AS in_packets','Packets to Remote','false'),
						array('sum(out_packets) AS out_packets','Packets from Remote','false'),
					),
					'from' => 'conn_l7',
					'where' => "lan_ip='$lan_ip', wan_ip='$wan_ip', l7_proto !='-'",
					'group' => 'l7_proto'
				),
			);	
			break;		
		case 'top_local':
			//set mysql query parameters
			$page = array(
				'title' => 'Bandwidth Usage of Local IP Addresses',
				'header' => 'drilldown',
				'vDiv' => array(
					array('crossfilter', '100'),
					array('tables', '100')	
				),
				'subheading' => '',
				'sidebar' => 'top_local'
			);
			$html= array();
			$viz = array(
				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('hour'),
							'grp' => array('bandwidth')
						)
					),
					'select' => array(
						array('from_unixtime(time) as time'), 
						array('remote_country'),
						array('(sum(in_bytes + out_bytes) / 1048576) as bandwidth'), 
					),
					'from' => 'conn_meta',
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), remote_country',
					'disp' => array(
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'bar', 
							'heading' => 'Bandwidth Per Hour',
							'xAxis' => '',
							'yAxis' => 'MB / Hour',
							'dim' => 'hour',
							'grp' => 'bandwidth'
						)
					)		
				)
			);	
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'Local IP Traffic',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('max(from_unixtime(time)) AS time','Last Seen','true','top_local2remote','lan_ip,wan_ip','false'), 
						array('lan_zone','LAN Zone','true'),
						array('lan_ip','LAN IP','true'),
						array('machine','Machine Name','true'),
						array('wan_ip','WAN IP','false'),
						array('(sum(`in_bytes`) / 1048576) AS in_bytes','MB to Remote','true'), 
						array('(sum(`out_bytes`) / 1048576) AS out_bytes','MB from Remote','true'), 
						array('sum(in_packets) AS in_packets','Packets to Remote','false'), 
						array('sum(out_packets) AS out_packets','Packets from Remote','false')
					),
					'from' => 'conn_meta',
					'group' => 'lan_ip, wan_ip'
				),
			);	
			break;	
		case 'top_local2remote':
			list($lan_ip, $wan_ip) = split(',', $query);
			//set mysql query parameters
			$page = array(
				'title' => 'Bandwidth Usage Between Local and Remote IP Addresses',
				'header' => 'drilldown',
				'vDiv' => array(
					array('crossfilter', '100'),
					array('tables', '100')	
				),
				'subheading' => '',
				'sidebar' => 'top_local'
			);
			$viz = array(
				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('hour'),
							'grp' => array('bandwidth')
						)
					),
					'select' => array(
						array('from_unixtime(time) as time'), 
						array('(sum(in_bytes + out_bytes) / 1048576) as bandwidth'), 
					),
					'from' => 'conn_meta',
					'where' => "`lan_ip` = '$lan_ip', `wan_ip` = '$wan_ip'",
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time))',
					'disp' => array(
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'bar', 
							'heading' => 'Bandwidth Per Hour',
							'xAxis' => '',
							'yAxis' => 'MB / Hour',
							'dim' => 'hour',
							'grp' => 'bandwidth'
						)
					)		
				)
			);	
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'Local IP Traffic',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('max(from_unixtime(time)) AS time','Last Seen','true'), 
						array('lan_zone','LAN Zone','true'),
						array('lan_ip','LAN IP','true'),
						array('machine','Machine Name','true'),
						array('wan_ip','WAN IP','false'),
						array('remote_ip','Remote IP','true'), 
						array('remote_asn','Remote ASN','true'),  
						array('remote_asn_name','Remote ASN Name','true'),						
						array('remote_country','Remote Country','true'), 
						array('remote_cc','Flag','true'),
						array('(sum(`in_bytes`) / 1048576) AS in_bytes','MB to Remote','true'), 
						array('(sum(`out_bytes`) / 1048576) AS out_bytes','MB from Remote','true'), 
						array('sum(in_packets) AS in_packets','Packets to Remote','false'), 
						array('sum(out_packets) AS out_packets','Packets from Remote','false')
					),
					'from' => 'conn_meta',
					'where' => "`lan_ip`='$lan_ip', `wan_ip`='$wan_ip'",
					'group' => 'remote_ip'
				),
			);	
			break;				
		case 'top_remote':
			//set mysql query parameters
			$page = array(
				'title' => 'Bandwidth Usage of Remote IP Addresses',
				'header' => 'drilldown',
				'vDiv' => array(
					array('crossfilter', '100'),
					array('tables', '100')	
				),
				'subheading' => '',
				'sidebar' => 'top_remote'
			);
			$viz = array(
				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('remote_country'),
							'grp' => array('bandwidth')
						),
						array(
							'dim' => array('hour'),
							'grp' => array('bandwidth')
						)
					),
					'select' => array(
						array('from_unixtime(time) as time'), 
						array('remote_country'),
						array('(sum(in_bytes + out_bytes) / 1048576) as bandwidth'), 
					),
					'from' => 'conn_meta',
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), remote_country',
					'disp' => array(
						// array(
						// 	'dView' => 'false', 
						// 	'pID' => 'crossfilter',
						// 	'dID' => 'geo', 
						// 	'type' => 'geo', 
						// 	'heading' => 'Remote Country Origin of IOC Hits',
						// 	'dim' => 'remote_country',
						// 	'grp' => 'bandwidth'
						// ),
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'bar', 
							'heading' => 'Bandwidth Per Hour',
							'xAxis' => '',
							'yAxis' => 'MB / Hour',
							'dim' => 'hour',
							'grp' => 'bandwidth'
						)
					)		
				)
			);	
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'Remote IP Traffic',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('max(from_unixtime(time)) AS time','Last Seen','true','top_remote2local','remote_ip','false'), 
						array('remote_ip','Remote IP','true'), 
						array('remote_asn','Remote ASN','true'),  
						array('remote_asn_name','Remote ASN Name','true'),		
						array('remote_country','Remote Country','true'), 
						array('remote_cc','Flag','true'),
						array('(sum(`in_bytes`) / 1048576) AS in_bytes','MB to Remote','true'), 
						array('(sum(`out_bytes`) / 1048576) AS out_bytes','MB from Remote','true'), 
						array('sum(in_packets) AS in_packets','Packets to Remote','false'), 
						array('sum(out_packets) AS out_packets','Packets from Remote','false')
					),
					'from' => 'conn_meta',
					'group' => 'remote_ip'
				),
			);	
			break;	
		case 'top_remote2local':
			//set mysql query parameters
			$page = array(
				'title' => 'Bandwidth Usage Between Local and Remote IP Addresses',
				'header' => 'drilldown',
				'vDiv' => array(
					array('crossfilter', '100'),
					array('tables', '100')	
				),
				'subheading' => '',
				'sidebar' => 'top_remote'
			);
			$viz = array(
				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('hour'),
							'grp' => array('bandwidth')
						)
					),
					'select' => array(
						array('from_unixtime(time) as time'), 
						array('(sum(in_bytes + out_bytes) / 1048576) as bandwidth'), 
					),
					'from' => 'conn_meta',
					'where' => "`remote_ip` = '$query'",
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time))',
					'disp' => array(
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'bar', 
							'heading' => 'Bandwidth Per Hour',
							'xAxis' => '',
							'yAxis' => 'MB / Hour',
							'dim' => 'hour',
							'grp' => 'bandwidth'
						)
					)		
				)
			);	
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'Local IP Traffic',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('max(from_unixtime(time)) AS time','Last Seen','true'), 
						array('lan_zone','LAN Zone','true'),
						array('lan_ip','LAN IP','true'),
						array('machine','Machine Name','true'),
						array('wan_ip','WAN IP','false'),
						array('remote_ip','Remote IP','true'), 
						array('remote_asn','Remote ASN','true'),  
						array('remote_asn_name','Remote ASN Name','true'),				
						array('remote_country','Remote Country','true'), 
						array('remote_cc','Flag','true'),
						array('(sum(`in_bytes`) / 1048576) AS in_bytes','MB to Remote','true'), 
						array('(sum(`out_bytes`) / 1048576) AS out_bytes','MB from Remote','true'), 
						array('sum(in_packets) AS in_packets','Packets to Remote','false'), 
						array('sum(out_packets) AS out_packets','Packets from Remote','false')
					),
					'from' => 'conn_meta',
					'where' => "`remote_ip` = '$query'",
					'group' => 'lan_ip, wan_ip'
				),
			);	
			break;	
		case 'stealth':
			//set mysql query parameters
			$page = array(
				'title' => 'IOC Hits',
				'header' => 'drilldown',
				'iCol' => '30,30,30',
				'vCol' => '100',
				'tCol' => '100',
				'subheading' => '',
				'sidebar' => 'stealth'
			);
			$viz = array(
				'd3stealth' => array(
					'RETURN1' => array(
						'select' => array(
							array('lan_ip'),
							array('grp_local as lan_zone'), 
						),
						'from' => '`conn-2013-12-17`',
						'where' => "stealth = '1'",
						'group' => 'lan_ip',
					),
					'RETURN2' => array(
						'select' => array(
							array('remote_ip'),
							array('grp_remote as lan_zone'), 
						),
						'from' => '`conn-2013-12-17`',
						'where' => "stealth = '1'",
						'group' => 'remote_ip',
					)
				)
			);
			$table = array();
			break;	
		case 'archive':
			//set mysql query parameters
			$page = array(
				'title' => 'Archived IOC Notifications',
				'header' => 'drilldown',
				'vDiv' => array(
					array('crossfilter', '100'),
					array('tables', '100')	
				),
				'subheading' => '',
				'sidebar' => 'archive'
			);
			$viz = array(
				'crossfilter' => array(
					'struct' => array(
						array(
							'dim' => array('remote_country'),
							'grp' => array('count')
						),
						array(
							'dim' => array('hour'),
							'grp' => array('count')
						),
						array(
							'dim' => array('ioc'),
							'grp' => array('count')
						),
					),
					'select' => array(
						array('from_unixtime(time) as time'), 
						array('remote_country'),
						array('count(*) AS count'), 
						array('ioc'), 
						array('ioc_severity'), 
					),
					'from' => 'conn_ioc',
					'where' => '`ioc_count` > 0, `trash` IS NOT NULL',
					'group' => 'month(from_unixtime(time)), day(from_unixtime(time)), hour(from_unixtime(time)), remote_country, ioc_severity',
					'disp' => array(
						array(
							'dView' => 'false', 
							'pID' => 'crossfilter',
							'dID' => 'geo', 
							'type' => 'geo', 
							'heading' => 'Remote Source Countries of IOC Notifications',
							'dim' => 'remote_country',
							'grp' => 'count'
						),
						array(
							'dView' => 'true', 
							'pID' => 'crossfilter',
							'dID' => 'bar', 
							'type' => 'severitybar', 
							'heading' => 'IOC Notifications Per Hour',
							'xAxis' => '',
							'yAxis' => '# IOC / Hour',
							'dim' => 'hour',
							'grp' => 'count'
						)
					)		
				)
			);	
			$table = array(
				array(
					'pID' => 'tables',
					'dID' => 'table1',
					'heading' => 'Indicators of Compromise (IOC) Notifications',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('max(from_unixtime(time)) AS time','Last Seen','true','ioc_drill','lan_ip,wan_ip,remote_ip,ioc','false'), 
						array('count(*) AS count','IOC Hits','true'), 
						array('ioc','IOC','true'),
						array('ioc_type', 'IOC Type', 'true'),
						array('lan_zone','LAN Zone','true'),
						array('lan_ip','LAN IP','true'),
						array('machine','Machine Name','true'),
						array('wan_ip','WAN IP','false'),
						array('remote_ip','Remote IP','true'),
						array('remote_asn','Remote ASN','true'),
						array('remote_asn_name','Remote ASN Name','true'),
						array('remote_country','Remote Country','true'),
						array('remote_cc','Flag','true'),
						array('sum(in_packets) AS in_packets','Packets to Remote','true'), 
						array('sum(out_packets) AS out_packets','Packets from Remote','true'), 
						array('sum(`in_bytes`) AS in_bytes','Bytes to Remote','false'), 
						array('sum(`out_bytes`) AS out_bytes','Bytes from Remote','false'), 
					),
					'from' => 'conn_ioc',
					'where' => '`ioc_count` > 0, `trash` IS NOT NULL',
					'group' => 'lan_ip, wan_ip, remote_ip, ioc'
				),
			);	
			break;	
		case 'manage_users':
			//$database = new Database("user_DB");   
			$page = array(
				'title' => 'User Mangement',
				'header' => 'users',
				'vDiv' => array(
					array('crossfilter', '100'),
					array('tables', '100')	
				),
				'subheading' => '',
				'sidebar' => ''
			);
			$viz = array();
			$table = array(
				array(
					'sDom' => 'false',
					'pID' => 'tables',
					'dID' => 'table1',
					'sDom' => 'false',
					'heading' => 'rapidPHIRE users',
					'select' => array(
						//array(select, column title, default view(boolean), [OPTIONAL HYPERLINKING =>] row query type, row query value, breadcrumb clear(boolean)
						array('username','User Name','true'), 
						array('id','User ID','true')
					),
					'from' => 'user',
				)
			);	
			$notime = true;
			break;	
	}
	if (isset($_GET['getInfo'])) {
		$return = getInfo($page, $viz, $table, $html);
		echo json_encode($return);
	} 
	elseif (isset($_GET['getViz'])) {
		$return = getViz($database, $viz, $start, $end, $notime);
		echo json_encode($return);
	}
	elseif (isset($_GET['getTable'])) {
		$return = getTable($database, $table, $start, $end, $notime, $_GET['dID']);
		echo json_encode($return);
	} 
}

function getInfo($page, $viz, $table, $html) {
	$output = array(
		"columns" => array(),
		"page" => $page,
		"table" => $table,
		"html" => $html,
		"viz" => $viz,
	);  
    for ($j = 0; $j < count($table); $j++) { 
		for ($i = 0; $i < count($table[$j]['select']); $i++) {
			if (preg_match('/^.*as (.*)/i', $table[$j]['select'][$i][0], $match)) { // check if using a SQL alias in the select statement
				$out = $match[1];
			} 
			else {
				$out = $table[$j]['select'][$i][0];
			}
			$output['columns'][$j][$i] = array($out, $table[$j]['select'][$i][1], $table[$j]['select'][$i][2]);
		}
	}
    return $output;
}

function getViz($database, $viz, $start, $end, $notime) {
 	foreach ($viz as $n => $value) {
 		if ($_GET['vizType'] == 'crossfilter') {
			$aColumns = array();
			for	($m = 0; $m < count($viz[$n]['select']); $m++) {
				if (preg_match('/^(.*)\) AS (.*)/i', $viz[$n]['select'][$m][0], $match)) { // if using a SQL function ( eg sum() ) don't do anything. 
					$aColumns[] = $viz[$n]['select'][$m][0]; 
				}
				elseif (preg_match('/^(.*) AS (.*)/i', $viz[$n]['select'][$m][0], $match)) { // escape column names and rebuild alias statement 
					$aColumns[] = "`".$match[1]."` AS " . $match[2]; 
				}
				else {
					$aColumns[] = "`".$viz[$n]['select'][$m][0]."`"; // escape column name
				}	
			};
		    $sTable = $viz[$n]['from'];
			$sWhere = null;
			if (isset($viz[$n]['where'])) {
				$sWhere = explode(',',$viz[$n]['where']);
				$sWhere = ' AND '.implode(' AND ', $sWhere).' ';
			}
			$sGroup = null;
			if (isset($viz[$n]['group'])) {
				$sGroup = str_replace(' ', '', $viz[$n]['group']); // strip any white space characters
				$aGroup = explode(',',$sGroup);
				$eGroup = array();
				for ($i = 0; $i < count($aGroup); $i++) {
					if (preg_match('/^.*\)/i', $aGroup[$i])) { // if using a SQL function ( eg day() ) don't do anything. 
						$eGroup[] = $aGroup[$i]; 
					}
					else {
						$eGroup[] = "`".$aGroup[$i]."`"; // escape column name
					}	
				}
				$sGroup = " GROUP BY ".implode(',',$eGroup);
			}
		    $sLimit = null;
		    if (isset($_GET['iDisplayStart'] ) && $_GET['iDisplayLength'] != '-1') {
		        $sLimit = "LIMIT ".mysql_real_escape_string( $_GET['iDisplayStart'] ).", ".
		        mysql_real_escape_string( $_GET['iDisplayLength'] );
		    }
			if ($notime != true) { 
				$database->query("
					SELECT SQL_CALC_FOUND_ROWS ".implode(", ", $aColumns)."
					FROM $sTable
					WHERE time BETWEEN ".$start." AND ".$end." ".$sWhere."  
					$sGroup  
					$sLimit
				");
			} 
			else {
				$sWhere = substr_replace($sWhere, "", 4);
				$database->query ("
					SELECT SQL_CALC_FOUND_ROWS ".implode(", ", $aColumns)."
					FROM $sTable
					$sWhere 
					$sGroup
					$sLimit
				");						
			}   
			// Data set length after filtering 
			$sQuery2 = "SELECT FOUND_ROWS()";
			$rResultFilterTotal = mysql_query($sQuery2) or die (mysql_error());
			$aResultFilterTotal = mysql_fetch_array($rResultFilterTotal);
			$iFilteredTotal = $aResultFilterTotal[0];
		    // Output structure
		    $output = array(
		        "aaData" => array(),
				"struct" => $viz[$n]['struct'],
				"viz" => $viz[$n]['disp'],
				"iTotalDisplayRecords" => $iFilteredTotal,
		    );   
			while ($row = $database->fetchrow()) {
				$output['aaData'][] = $row;
			}   
		    return $output;
		}
		if ($_GET['vizType'] == 'd3') {
			for($d3 = 0; $d3 < count($viz[$n]); $d3++) {
				if ($viz[$n][$d3]['disp']['dID'] === $_GET['dID']) {
					$aColumns = array();
					for	($m = 0; $m < count($viz[$n][$d3]['select']); $m++) {
						if (preg_match('/^(.*)\) AS (.*)/i', $viz[$n][$d3]['select'][$m][0], $match)) { // if using a SQL function ( eg sum() ) don't do anything. 
							$aColumns[] = $viz[$n][$d3]['select'][$m][0]; 
						}
						elseif (preg_match('/^(.*) AS (.*)/i', $viz[$n][$d3]['select'][$m][0], $match)) { // escape column names and rebuild alias statement 
							$aColumns[] = "`".$match[1]."` AS " . $match[2]; 
						}
						else {
							$aColumns[] = "`".$viz[$n][$d3]['select'][$m][0]."`"; // escape column name
						}	
					};
				    $sTable = $viz[$n][$d3]['from'];
					$sWhere = null;
					if (isset($viz[$n][$d3]['where'])) {
						$sWhere = explode(',',$viz[$n][$d3]['where']);
						$sWhere = ' AND '.implode(' AND ', $sWhere).' ';
					}
					$sGroup = null;
					if (isset($viz[$n][$d3]['group'])) {
						$sGroup = "GROUP BY ".$viz[$n][$d3]['group']." "; 
					}					
				    $sLimit = null;
				    if (isset($_GET['iDisplayStart'] ) && $_GET['iDisplayLength'] != '-1') {
				        $sLimit = "LIMIT ".mysql_real_escape_string( $_GET['iDisplayStart'] ).", ".
				        mysql_real_escape_string( $_GET['iDisplayLength'] );
			    	}
					if ($notime != true) { 
						$database->query("
							SELECT SQL_CALC_FOUND_ROWS ".implode(", ", $aColumns)."
							FROM $sTable
							WHERE time BETWEEN ".$start." AND ".$end." ".$sWhere." 
							$sGroup
							$sOrder
							$sLimit
						");
					} 
					else {
						$sWhere = substr_replace($sWhere, "", 4);
						$database->query ("
							SELECT SQL_CALC_FOUND_ROWS ".implode(", ", $aColumns)."
							FROM $sTable
							$sWhere
							$sGroup
							$sOrder
							$sLimit
						");						
					}   
					/* Data set length after filtering */
					$sQuery2 = "
						SELECT FOUND_ROWS()
					";
					$rResultFilterTotal = mysql_query( $sQuery2 ) or die(mysql_error());
					$aResultFilterTotal = mysql_fetch_array($rResultFilterTotal);
					$iFilteredTotal = $aResultFilterTotal[0];
				    // Output structure
				    $output = array(
				        "aaData" => array(),
						"viz" => $viz[$n][$d3],
						"iTotalDisplayRecords" => $iFilteredTotal,
				    );   
					while ($row = $database->fetchrow()) {
						$output['aaData'][] = $row;
					}   
				    return  $output;
				}
			}
		}
		if ($_GET['vizType'] == 'd3swimChart') {
			for($d3 = 0; $d3 < count($viz[$n]); $d3++) {
				if ($viz[$n][$d3]['disp']['dID'] === $_GET['dID']) {	
					$swimArray = array();
					$count = 0;
					for ($sw = 0; $sw < count($viz[$n][$d3]['query']); $sw++) {
						$aColumns = array();
						for	($m = 0; $m < count($viz[$n][$d3]['query'][$sw]['select']); $m++) {
							if (preg_match('/^(.*)\) AS (.*)/i', $viz[$n][$d3]['query'][$sw]['select'][$m][0], $match)) { // if using a SQL function ( eg sum() ) don't do anything. 
								$aColumns[] = $viz[$n][$d3]['query'][$sw]['select'][$m][0]; 
							}
							elseif (preg_match('/^(.*) AS (.*)/i', $viz[$n][$d3]['query'][$sw]['select'][$m][0], $match)) { // escape column names and rebuild alias statement 
								$aColumns[] = "`".$match[1]."` AS " . $match[2]; 
							}
							else {
								$aColumns[] = "`".$viz[$n][$d3]['query'][$sw]['select'][$m][0]."`"; // escape column name
							}	
						};
					    $sTable = $viz[$n][$d3]['query'][$sw]['from'];
						$sWhere = null;
						if (isset($viz[$n][$d3]['query'][$sw]['where'])) {
							$sWhere = explode(',',$viz[$n][$d3]['query'][$sw]['where']);
							$sWhere = ' AND '.implode(' AND ', $sWhere).' ';
						}
						$sGroup = null;
						if (isset($viz[$n][$d3]['query'][$sw]['group'])) {
							$sGroup = "GROUP BY ".$viz[$n][$d3]['query'][$sw]['group']." "; 
						}					
					    $sLimit = null;
					    if (isset($_GET['iDisplayStart'] ) && $_GET['iDisplayLength'] != '-1') {
					        $sLimit = "LIMIT ".mysql_real_escape_string( $_GET['iDisplayStart'] ).", ".
					        mysql_real_escape_string( $_GET['iDisplayLength'] );
				    	}
						if ($notime != true) { 
							$database->query("
								SELECT SQL_CALC_FOUND_ROWS ".implode(", ", $aColumns)."
								FROM $sTable
								WHERE time BETWEEN ".$start." AND ".$end." ".$sWhere." 
								$sGroup
								$sOrder
								$sLimit
							");
						} 
						else {
							$sWhere = substr_replace($sWhere, "", 4);
							$database->query ("
								SELECT SQL_CALC_FOUND_ROWS ".implode(", ", $aColumns)."
								FROM $sTable
								$sWhere
								$sGroup
								$sOrder
								$sLimit
							");						
						}   
						/* Data set length after filtering */
						$sQuery2 = "
							SELECT FOUND_ROWS()
						";
						$rResultFilterTotal = mysql_query( $sQuery2 ) or die(mysql_error());
						$aResultFilterTotal = mysql_fetch_array($rResultFilterTotal);
						$iFilteredTotal = $aResultFilterTotal[0];
					    // Output structure
					    $output = array(
					        "aaData" => array(),
							"viz" => $viz[$n][$d3]['query'][$sw],
							"iTotalDisplayRecords" => $iFilteredTotal,
					    );

					    //Other swimChart while
						// while ($row = $database->fetchrow()) {
						// 	$row['lane'] = $viz[$n][$d3]['query'][$sw]['lane'];
						// 	$row['id'] = $count+=1;
						// 	$row['start'] = $row['time'];
						// 	if ($row['end'] == '') {
						// 		$row['end'] = $row['time']+5000;
						// 		$row['class'] = 'range';
						// 		//$row['class'] = 'point'; //default
						// 	} else {
						// 		$row['end'] = $row['end'];
						// 		$row['class'] = 'range';
						// 	}
						// 	$swimArray['items'][] = $row;
						// }
						// if(array_key_exists('id', $swimArray['lanes']) != true) {
						// 	$roo['id'] = $viz[$n][$d3]['query'][$sw]['lane'];
						// 	$roo['label'] = $viz[$n][$d3]['query'][$sw]['label'];							
						// 	$swimArray['lanes'][] = $roo;
						// }

						while ($row = $database->fetchrow()) {
							$row['lane'] = $viz[$n][$d3]['query'][$sw]['lane'];
							$row['class'] = $viz[$n][$d3]['query'][$sw]['class'];
							$row['id'] = $count+=1;
							$row['start'] = $row['time'];
							$row['label'] = $row['name'];
							if ($row['end'] == '') {
								$row['end'] =  '';
							} else {
								$row['end'] = $row['end'];
							}
							$swimArray[] = $row;
						}
					}
					//for ()
					return $swimArray;
				}
			}
		}
		if ($_GET['vizType'] == 'd3stealth') {
			foreach ($viz[$n] as $d3 => $value) {
				$aColumns = array();
				for	($m = 0; $m < count($viz[$n][$d3]['select']); $m++) {
					$aColumns[] = $viz[$n][$d3]['select'][$m][0];
				};
			    $sTable = $viz[$n][$d3]['from'];
				$sWhere = null;
				if (isset($viz[$n]['where'])) {
					$sWhere = explode(',',$viz[$n]['where']);
					$sWhere = ' AND '.implode(' AND ', $sWhere).' ';
				}
				$sGroup = null;
				if (isset($viz[$n]['group'])) {
					$sGroup = "GROUP BY ".$viz[$n]['group']." "; 
				}			
				$database->query("
					SELECT ".implode(", ", $aColumns)."
					FROM $sTable
					$sWhere WHERE time BETWEEN ".$start." AND ".$end." ".$sWhere." 
					$sGroup
					$sOrder
				");	
				/* Data set length after filtering */	   	
				while ($row = $database->fetchRow()) {	
					if ($row['remote_ip']) {
						$ip = $row['remote_ip'];
					}
					if ($row['lan_ip']) {
						$ip = $row['lan_ip'];
					}
					$response['name'] = $ip;
					$response['group'] = $row['lan_zone'];
					$output[] = $response;
				}	   
			} 
			for ($ip = 0; $ip < count($output); $ip++) {
				$nodereturn['name'] = $output[$ip]['name'];
				$nodereturn['group'] = $output[$ip]['group'];
				$nReturn['node'][] = $nodereturn;
				$position[$output[$ip]['name']] = $ip;
			}			
			$database->query("
				SELECT lan_ip,remote_ip,sum(in_bytes + out_bytes) as bandwidth
				FROM $sTable
				$sWhere WHERE time BETWEEN ".$start." AND ".$end." AND stealth = '1' GROUP BY lan_ip, remote_ip 
				$sOrder
			");
			while ($row = $database->fetchRow()) {	
				$src = $position[$row['lan_ip']];
				$des = $position[$row['remote_ip']];
				$linkreturn['source'] = $src;
				$linkreturn['target'] = $des;
				$linkreturn['value'] = $row['remote_ip'];
				$lReturn[] = $linkreturn;
			}
			return array('nodes' => $output, 'links' => $lReturn);
		}
	}
}

function getTable($database, $table, $start, $end, $notime, $dID) {
	for ($t = 0; $t < count($table); $t++) {
		if ($table[$t]['dID'] === $dID) {
			$aColumns = array();
			for	($m = 0; $m < count($table[$t]['select']); $m++) {
				if (preg_match('/^(.*)\) AS (.*)/i', $table[$t]['select'][$m][0], $match)) { // if using a SQL function ( eg sum() ) don't do anything. 
					$aColumns[] = $table[$t]['select'][$m][0]; 
				}
				elseif (preg_match('/^(.*) AS (.*)/i', $table[$t]['select'][$m][0], $match)) { // escape column names and rebuild alias statement 
					$aColumns[] = "`".$match[1]."` AS " . $match[2]; 
				}
				else {
					$aColumns[] = "`".$table[$t]['select'][$m][0]."`"; // escape column name
				}
			};
			$sTable = $table[$t]['from'];
			$aWhere = null;
			if (isset($table[$t]['where'])) {
				$aWhere = explode(',',$table[$t]['where']);
				$aWhere = ' AND '.implode(' AND ', $aWhere).' ';
			}
			$sGroup = null;
			if (isset($table[$t]['group'])) {
				$sGroup = str_replace(' ', '', $table[$t]['group']); // strip any white space characters
				$aGroup = explode(',',$sGroup);
				$eGroup = array();
				for ($i = 0; $i < count($aGroup); $i++) {
					if (preg_match('/^.*\)/i', $aGroup[$i])) { // if using a SQL function ( eg day() ) don't do anything. 
						$eGroup[] = $aGroup[$i]; 
					}
					else {
						$eGroup[] = "`".$aGroup[$i]."`"; // escape column name
					}	
				}
				$sGroup = " GROUP BY ".implode(',',$eGroup);
			}
			$sOrder = " ";
			if (isset($_GET['iSortCol_0']))	{
				$sOrder = " ORDER BY ";
				for ($i=0; $i<intval( $_GET['iSortingCols'] ); $i++) {
					if ($_GET[ 'bSortable_'.intval($_GET['iSortCol_'.$i]) ] == "true") {
						if (preg_match('/^.* AS (.*)/i', $aColumns[ intval( $_GET['iSortCol_'.$i] ) ], $match)) {
							$sOrder .= $match[1]." ".
							($_GET['sSortDir_'.$i]==='asc' ? 'asc' : 'desc') .", ";
						} 
						else {
							$sOrder .= $aColumns[ intval( $_GET['iSortCol_'.$i] ) ]." ".
							($_GET['sSortDir_'.$i]==='asc' ? 'asc' : 'desc') .", ";
						}
					}
				}
				$sOrder = substr_replace( $sOrder, "", -2 );
				if ($sOrder == " ORDER BY ") {
					$sOrder = "";
				}
			} 
			if (isset($table[$t]['order'])) {
				$sOrder = " ORDER BY " . $table[$t]['order'];
			}
			$sLimit = "";
			if (isset($_GET['iDisplayStart']) && $_GET['iDisplayLength'] != '-1') {
				$sLimit = " LIMIT ".mysql_real_escape_string( $_GET['iDisplayStart'] ).", ".
				mysql_real_escape_string( $_GET['iDisplayLength'] );
			};
			if (isset($table[$t]['limit'])) {
				$sLimit = " LIMIT " . $table[$t]['limit'];
			}
			$sWhere = null;
			if ($notime != true) { // time required
				if (isset($_GET['sSearch'])) {
					if (preg_match('/^.*severity:(.*)/i', strtolower($_GET['sSearch']), $search)) {
						$database->query("
							SELECT SQL_CALC_FOUND_ROWS ".implode(", ", $aColumns)."
							FROM $sTable
							$sWhere WHERE time BETWEEN ".$start." AND ".$end." AND ioc_severity = '".trim($search[1])."' ".$aWhere."
							$sGroup
							$sOrder
							$sLimit
						");
					} 
					else {
						$sWhere = "WHERE (";
						for ($i=0 ; $i<count($aColumns) ; $i++) {	
							if ($aColumns[$i]!=('count(*) AS count')) {
								if (preg_match('/^.* AS (.*)/i', $aColumns[$i], $match)) {
									$sWhere .= $match[1]." LIKE '%".mysql_real_escape_string($_GET['sSearch'])."%' OR ";
								} 
								else {
									$sWhere .= $aColumns[$i]." LIKE '%".mysql_real_escape_string($_GET['sSearch'])."%' OR ";
								}
							}
						}
						$sWhere = substr_replace($sWhere, "", -3); // strip trailing ' OR'
						$sWhere .= ') AND time BETWEEN '.$start.' AND '.$end.' '.$aWhere;
						$database->query ("
							SELECT SQL_CALC_FOUND_ROWS ".implode(", ", $aColumns)."
							FROM $sTable
							$sWhere
							$sGroup
							$sOrder
							$sLimit
						");
					}
				}
				else {
					$database->query ("
						SELECT SQL_CALC_FOUND_ROWS ".implode(", ", $aColumns)."
						FROM $sTable
						WHERE time BETWEEN ".$start." AND ".$end." ".$aWhere."
						$sGroup  
						$sOrder
						$sLimit
					");
				}		
			} 
			else { // time restriction not required
				if (isset($_GET['sSearch'])) { // for the notification default display
					$sWhere = "WHERE (";
					for ($i=0 ; $i<count($aColumns) ; $i++) {	
						if ($aColumns[$i]!=('count(*) AS count')) {
							if (preg_match('/^.* AS (.*)/i', $aColumns[$i], $match)) {
								$sWhere .= $match[1]." LIKE '%".mysql_real_escape_string($_GET['sSearch'])."%' OR ";
							} 
							else {
								$sWhere .= $aColumns[$i]." LIKE '%".mysql_real_escape_string($_GET['sSearch'])."%' OR ";
							}
						}
					}
					$sWhere = substr_replace($sWhere, "", -3);
					$sWhere .= ') '.$aWhere;
					$database->query ("
						SELECT SQL_CALC_FOUND_ROWS ".implode(", ", $aColumns)."
						FROM $sTable
						$sWhere
						$sGroup
						$sOrder
						$sLimit
					");
				}
				else {
					$aWhere = substr_replace($aWhere, '', 4); // strip leading 'AND '
					$sWhere = "WHERE ".$aWhere." ";
					$database->query ("
						SELECT SQL_CALC_FOUND_ROWS ".implode(", ", $aColumns)."
						FROM $sTable
						$sWhere
						$sGroup
						$sOrder
						$sLimit
					");	
				}
			}
			// Data set length after filtering 
			$sQuery2 = "SELECT FOUND_ROWS()";
			$rResultFilterTotal = mysql_query( $sQuery2 ) or die (mysql_error());
			$aResultFilterTotal = mysql_fetch_array($rResultFilterTotal);
			$iFilteredTotal = $aResultFilterTotal[0];
			// Output structure
			$output = array(
				"sEcho" => intval($_GET['sEcho']),
				"iTotalRecords" => $iFilteredTotal,
				"iTotalDisplayRecords" => $iFilteredTotal,
				"aaData" => array(),
			);
			$row = null;
			$col = null;
			while ($row = $database->fetchRow()) {
				for ($i=0; $i < count($table[$t]['select']); $i++) {
					$sel = $table[$t]['select'][$i][0];
					preg_match('/^.* AS (.*)/i', $sel, $reduced);
					$cQuery = null; // clear $cQuery value for next row (otherwise the values will stack)
					if (isset($table[$t]['select'][$i][4])) {
						$col = explode(',',$table[$t]['select'][$i][4]); // checks to see if column links have multiple values then splites to col[$j]
						for ($j = 0; $j < count($col); $j++) {
							$cQuery .= $row[$col[$j]].','; // $row query each value and append returns to $cQuery
						}
					}
					if ($sel == 'remote_cc') {
						if ($row[$sel] == 'LOCAL_IP_RETURN') { /// REPLACE LOCAL_IP_RETURN with a flag *******
							$response[$sel] = '<div class="f32"><img src="assets/img/localip.png" /></span></div>';
						} 
						else {
							$response[$sel] = '<div class="f32"><span class="flag '.strtolower($row[$sel]).'"></span></div>';
						}
					}
					elseif ($sel == 'stealth') { 
						if ($row[$sel] == '1') {
							$response[$sel] = '<span class=" fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-shield fa-stack-1x fa-inverse"></i></span>';
						} 
						else {
							$response[$sel] = '';
						}
					} 
					elseif ($reduced[1] == 'icon_in_bytes') { 	
						if (($row['icon_in_bytes'] != '0') && ($row['icon_out_bytes'] != '0')) { 	
							$response[$reduced[1]] = '<i style="font-size:16px !important" class="fa fa-arrow-up"></i><i style="font-size:16px !important" class="fa fa-arrow-down"></i>';
						} elseif (($row['icon_in_bytes'] == '0') && ($row['icon_out_bytes'] != '0')) { 	
							$response[$reduced[1]] = '<i style="opacity:0.25 !important;font-size:16px !important" class="fa fa-arrow-up"></i><i style="font-size:16px !important" class="fa fa-arrow-down"></i>';
						} elseif (($row['icon_in_bytes'] != '0') && ($row['icon_out_bytes'] == '0')) { 	
							$response[$reduced[1]] = '<i style="font-size:16px !important" class="fa fa-arrow-up"></i><i style="opacity:0.25 !important;font-size:16px !important" class="fa fa-arrow-down"></i>';
						} else { 	
							$response[$reduced[1]] = '<i style="opacity:0.25 !important;font-size:16px !important" class="fa fa-arrow-up"></i><i style="opacity:0.25 !important;font-size:16px !important" class="fa fa-arrow-down"></i>';
						}
					}
					elseif ($sel == 'ioc_severity') {
						switch ($row[$sel]) {
							case '1':
								$response[$sel] = '<span class=" aTable'.$row[$sel].' fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-flag fa-stack-1x fa-inverse"></i></span>';
								break;
							case '2':
								$response[$sel] = '<span class=" aTable'.$row[$sel].' fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-bullhorn fa-stack-1x fa-inverse"></i></span>';
								break;
							case '3':
								$response[$sel] = '<span class=" aTable'.$row[$sel].' fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-bell fa-stack-1x fa-inverse"></i></span>';
								break;
							case '4':
								$response[$sel] = '<span class=" aTable'.$row[$sel].' fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-exclamation-circle fa-stack-1x fa-inverse"></i></span>';
								break;
							default:
								$response[$sel] = null;
								break;
						}
					} 
					else {
						if (isset($table[$t]['select'][$i][3]) && $reduced[1]) { // begin link generating functions
							$response[$reduced[1]] = '<a href="javascript:void(0);" onclick="javascript:page(\''.rtrim($cQuery, ',').'\', \''.$table[$t]['select'][$i][3].'\', null, null, '.$table[$t]['select'][$i][5].');">'.$row[$reduced[1]].'</a>';
						} 
						elseif (isset($table[$t]['select'][$i][3])) {
							$response[$sel] = '<a href="javascript:void(0);" onclick="javascript:page(\''.rtrim($cQuery, ',').'\', \''.$table[$t]['select'][$i][3].'\', null, null, '.$table[$t]['select'][$i][5].');">'.$row[$sel].'</a>';
						} 
						elseif ($reduced[1]) { 
							$response[$reduced[1]] = $row[$reduced[1]];
						} 
						else {
							$response[$sel] = $row[$sel];
						}
					}
				}
				$output['aaData'][] = $response;
			}
		    return $output;
		}
	}
}
?>