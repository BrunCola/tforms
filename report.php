<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
		<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
		<meta content="" name="rapidPHIRE"/>
		<meta content="" name="Phirelight Security Solutions"/>
		<title>rapidPHIRE | fight fire with PHIRE |</title>
		<link rel="shortcut icon" href="assets/favicon.ico"/>
		<link href="assets/lib/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css"/>
		<link href="assets/lib/bootstrap/css/bootstrap-responsive.min.css" rel="stylesheet" type="text/css"/>
		<link href="assets/lib/font-awesome/css/font-awesome.css" rel="stylesheet" type="text/css"/>
		<link href="assets/css/style-metro.css" rel="stylesheet" type="text/css"/>
		<link href="assets/css/style.css" rel="stylesheet" type="text/css"/>
		<link href="assets/css/dc.css" rel="stylesheet" type="text/css"/>
		<link href="assets/css/style-responsive.css" rel="stylesheet" type="text/css"/>
		<link href="assets/css/themes/default.css" rel="stylesheet" type="text/css"/>
		<link href="assets/lib/uniform/css/uniform.default.css" rel="stylesheet" type="text/css"/>
		<link href="assets/lib/bootstrap-daterangepicker/daterangepicker.css" rel="stylesheet" type="text/css"/>
		<link href="assets/css/jquery.dataTables.css" rel="stylesheet" type="text/css"/>
		<link href="assets/css/jdashboard.css" rel="stylesheet" type="text/css"/>
		<link href="assets/css/ColVis.css" rel="stylesheet" type="text/css"/>
		<!-- <link href="assets/css/flags16.css" rel="stylesheet" type="text/css"/> currently not being used -->
		<link href="assets/css/flags32.css" rel="stylesheet" type="text/css"/>
		<!-- <link rel="stylesheet" type="text/css" href="assets/css/parallel.css"> -->
		<link href="assets/css/TableTools.css" rel="stylesheet" type="text/css"/>
		<link href="assets/css/colorbox.css" rel="stylesheet" type="text/css"/>
		<script type="text/javascript" src="assets/lib/jquery-1.10.2.min.js"></script>
		<script type="text/javascript" src="assets/lib/noty/jquery.noty.js"></script>
		<script type="text/javascript" src="assets/lib/noty/layouts/top.js"></script>
		<script type="text/javascript" src="assets/lib/noty/themes/default.js"></script>
		<script type="text/javascript" src="assets/lib/noty/layouts/bottomLeft.js"></script>
		<script type="text/javascript" src="assets/lib/jquery-ui/jquery-ui-1.10.1.custom.min.js"></script>
		<script type="text/javascript" src="assets/lib/moment.js"></script>
		<script type="text/javascript" src="assets/lib/queue.min.js"></script>
		<script type="text/javascript" src="assets/lib/d3.v3.min.js"></script>
		<script type="text/javascript" src="assets/lib/dc.js"></script>
		<script type="text/javascript" src="assets/lib/crossfilter.js"></script>
		<!-- <script type="text/javascript" src="assets/lib/underscore.js"></script> USED FOR EMAIL-->
		<script type="text/javascript" src="assets/lib/cloud.dc.js"></script>
		<script type="text/javascript" src="assets/lib/tip.d3.min.js"></script>
		<script type="text/javascript" src="assets/lib/bootstrap/js/bootstrap.min.js"></script>
		<script type="text/javascript" src="assets/lib/jdashboard.js"></script>
		<script type="text/javascript" src="assets/lib/jquery.activity-indicator-1.0.0.min.js"></script>
		<script type="text/javascript" src="assets/lib/jquery-slimscroll/jquery.slimscroll.min.js"></script>
		<script type="text/javascript" src="assets/lib/jquery.blockui.min.js"></script>
		<script type="text/javascript" src="assets/lib/jquery.cookie.min.js"></script>
		<script type="text/javascript" src="assets/lib/jquery.dataTables.js"></script>
		<script type="text/javascript" src="assets/lib/ColVis.js"></script>
		<script type="text/javascript" src="assets/lib/TableTools.min.js"></script>
		<script type="text/javascript" src="assets/lib/jquery.colorbox.js"></script>
		<script type="text/javascript" src="assets/lib/livestamp.min.js"></script>
		<script type="text/javascript" src="assets/lib/uniform/jquery.uniform.min.js"></script>
		<script type="text/javascript" src="assets/lib/bootstrap-daterangepicker/date.js"></script>
		<script type="text/javascript" src="assets/lib/bootstrap-daterangepicker/daterangepicker.js"></script>
		<script type="text/javascript" src="assets/lib/rainbowvis.js"></script>
		<!-- <script type="text/javascript" src="assets/lib/d3.layout.cloud.js"></script> REPLACED BY cloud.dc.js-->
		<script type="text/javascript" src="assets/scripts/app.js"></script>
		<!-- <script type="text/javascript" src="inc/email.js"></script> -->
		<script type="text/javascript" src="inc/template.js"></script>
		<script type="text/javascript" src="inc/glossary.js"></script>
		<style>
			@media print {
				#table1 {
					page-break-before: always !important;
				}
				table tr td, table.print-friendly tr th {
					page-break-inside: avoid;
				}
			}
		</style>
	</head>
	<body style="background-color:#ebeaeb;width:1056px !important;" class="page-header">  		
		<!-- HEADER -->
		<div class="header navbar navbar-inverse navbar-top">
			<div class="navbar-inner">
				<div style="background-color: #000;" class="container-report-fluid">
					<a href="#">
						<img class="logo" src="assets/img/logo.png" alt=""/>
					</a>
					<div style="padding-top:10px;position:relative;color:#fff;">
						<span id="graph_title" style="color:#fff !important;margin-left:7px;font-size:14px;"></span>
					</div>
					<div class="nav pull-right" id="dashboard-report-range" style="width:500px;float:right;position:relative;color:#fff !important;margin-top:-20px;margin-right:10px;text-align:right">
						<span style="color:#fff !important;margin-left:7px;font-size:12pt;"></span>
					</div>
				</div>
			</div>
		</div>
		<!-- BODY -->
		<div class="page-container">
			<div class="page-content-report">
				<div class="container-report-fluid"> 
					<div style="display:none" class="breadcrumb">	
						<span id="breadhome"></span>
					</div>
					<div style="font-size:12px"></div>
					<div style="margin-top:10px" id="severity"></div>
					<div id="page"></div>  
					<div id="d3Div"></div>  
					<div style="page-break-before: always;" id="glossary"></div>
				</div>
			</div>
		</div>
		<!-- FOOTER -->
		<div class="footer"></div>
	</body>
</html>