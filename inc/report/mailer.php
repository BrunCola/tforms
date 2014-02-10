<?php

require '../PHPMailerAutoload.php';

$version = '1.0.1';

$email = explode(',', $_GET['email']);
$client = $_GET['client'];
$report_type = explode(',', $_GET['report_type']);
$output = explode(',', $_GET['output']);
$timespan = $_GET['timespan'];

$mail = new PHPMailer;
$mail->isSMTP();                                      // Set mailer to use SMTP
$mail->Host = 'smtp.emailsrvr.com;smtp.emailsrvr.com';  // Specify main and backup server
$mail->SMTPAuth = true;    
$mail->Port = '465';                           // Enable SMTP authentication
$mail->Username = 'notice@rapidphire.com';                // SMTP username
$mail->Password = 'r@p1dph1r3';                           // SMTP password
$mail->SMTPSecure = 'ssl';                            // Enable encryption, 'ssl' also accepted
$mail->From = 'notice@rapidphire.com';
if (count($output) == 1) {
	$mail->FromName = 'rapidPHIRE Blacklist Report';
} 
else {
	$mail->FromName = 'rapidPHIRE Blacklist Reports';
}
for ($e = 0; $e < count($email); $e++) {
	$mail->addAddress($email[$e]);  // Add a recipient
}
$mail->addReplyTo('notice@rapidphire.com', 'Information');
$mail->WordWrap = 50; // Set word wrap to 50 characters
for ($i = 0; $i < count($output); $i++) {
	$mail->addAttachment($output[$i]); // Add attachments
}
// $mail->addAttachment('/tmp/image.jpg', 'new.jpg'); // Optional name
$mail->isHTML(true); // Set email format to HTML
if (count($output) == 1) {
	$mail->Subject = 'rapidPHIRE '.$report_type.' Report for '.$client;
	$mail->Body    = 'Attached is a report, generated by the rapidPHIRE reporting bot, displaying IOC Hit Summaries detected within the last '.$timespan.'.';
	$mail->AltBody = 'Attached is a report, generated by the rapidPHIRE reporting bot, displaying IOC Hit Summaries detected within the last '.$timespan.'.'; //plain text for non-HTML mail clients
} 
else {
	$mail->Subject = 'rapidPHIRE Reports for '.$client;
	$mail->Body    = 'Attached are reports generated by the rapidPHIRE reporting bot displaying summaries of events within the last '.$timespan.'.';
	$mail->AltBody    = 'Attached are reports generated by the rapidPHIRE reporting bot displaying summaries of events within the last '.$timespan.'.';
}
if (!$mail->send()) {
   echo 'Message could not be sent.';
   echo 'Mailer Error: ' . $mail->ErrorInfo;
   exit;
}
echo 'Message has been sent';

//this below when uncommented will delete all pdfs generated after the email is sent
// for ($d = 0; $d < count($output); $d++) {
// 	unlink($output[$d]);
// }

?>