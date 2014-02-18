<?php
include "class.database.php";
$database = new Database("email_DB");   
$query = ($_GET['parallel']);
	switch($query) {		
		case 'ALLDB':
			$database->query("SELECT day(time), hour(time), minute(time), dst_email, src_email, message_subject, sector, bytes, direction FROM email"); 
			break;
		default:
			$database->query("SELECT day(time), hour(time), minute(time), dst_email, src_email, message_subject, sector, bytes, direction FROM email
				WHERE message_subject REGEXP '$query'"); 
			break; 
	}
	
	echo "name,group,day,hour,minute,bytes,direction (send=0; receive=1),impact (high=1; normal=0)";
	while($row = $database->fetchRow()){
		if($row['direction'] == "receive"){
			$event_id = "1";
		}else{
			$event_id = "0";
		}

		if($row['sector'] == ""){
			$sect = "UNK";
		}else{
			$sect = $row['sector'];
			$sect = preg_replace('/\s/','', $sect);
		}
		if($sect == 'Dept_1'){$sect = 'Dept_01';}
		if($sect == 'Dept_2'){$sect = 'Dept_02';}
		if($sect == 'Dept_3'){$sect = 'Dept_03';}
		if($sect == 'Dept_4'){$sect = 'Dept_04';}
		if($sect == 'Dept_5'){$sect = 'Dept_05';}
		if($sect == 'Dept_6'){$sect = 'Dept_06';}
		if($sect == 'Dept_7'){$sect = 'Dept_07';}
		if($sect == 'Dept_8'){$sect = 'Dept_08';}
		if($sect == 'Dept_9'){$sect = 'Dept_09';}
		if(	$row['sector'] == "Dept_01" || 
				$row['sector'] == "Dept_05" || 
				$row['sector'] == "Dept_06" || 
				$row['sector'] == "Dept_15" ||
				$row['sector'] == "Dept_20" ||
				$row['sector'] == "Dept_21" ){
			$impact = "1";
		}else{
			$impact = "0";
		}
		$email = $row['dst_email'];
		$email = preg_replace('/\'/','', $email);
		$email = preg_replace('/"/','', $email);
		echo 
		"\n".$email.
		",".$sect.
		",".$row['day(time)'].
		",".$row['hour(time)'].
		",".$row['minute(time)'].
		",".$row['bytes'].
		",".$event_id.
		",".$impact;
	}
?>