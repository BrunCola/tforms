<?php
session_start();
include ("inc/class.user.php");
$system = new System();
$system->registerConfirm = true;
$session = $system->session;
if (isset($_GET['login'])) {
	$login = $system->userLogin($_POST['username'],$_POST['password'],$_POST['remember']);
	header("Location: index.php");
}
if (isset($_GET['register'])) {
	$register = $system->userRegister($_POST['username'],$_POST['password'],$_POST['cpassword'],$_POST['email'],$_POST['captcha']);
}
if (isset($_GET['logout'])) {
	$system->userLogout();
	header("Location: ".$_SERVER['HTTP_REFERER']);
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
		<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
		<meta content="" name="rapidPHIRE"/>
		<meta content="" name="Phirelight Security Solutions"/>
		<meta content="" name="version 1.0"/>
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
		<link href="assets/css/flags32.css" rel="stylesheet" type="text/css"/>
		<!-- <link href="assets/css/flags16.css" rel="stylesheet" type="text/css"/> currently not being used -->
		<!-- <link rel="stylesheet" type="text/css" href="assets/css/parallel.css"/> -->
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
		<script type="text/javascript" src="inc/timeline.js"></script>
		<!-- <script type="text/javascript" src="assets/lib/d3.layout.cloud.js"/> REPLACED BY cloud.dc.js-->
		<!-- <script type="text/javascript" src="inc/email.js"> -->
		<script type="text/javascript" src="assets/scripts/app.js"></script>
<?php if ($session['id']) { ?>
		<script type="text/javascript" src="inc/template.js"></script>
	</head>
	<body class="page-header-fixed">
		<!-- HEADER -->
		<div class="header navbar navbar-inverse navbar-fixed-top">
			<!-- TOP NAVIGATION BAR -->
			<div class="navbar-inner">
				<div style="background-color: #000;" class="container-fluid">
					<a href="index.php">
						<img class="logo" src="assets/img/logo.png" alt=""/>
					</a>
					<a href="javascript:;" class="btn-navbar collapsed" data-toggle="collapse" data-target=".nav-collapse">
						<img src="assets/img/menu-toggler.png" alt=""/>
					</a>
					<ul class="nav pull-right">
						<!-- NOTIFICATION DROPDOWN -->
						<li class="dropdown" id="header_notification_bar">
							<a href="#" class="dropdown-toggle" data-toggle="dropdown">
								<i class="fa fa-warning"></i>
								<span class="badge"></span>
							</a>
							<ul class="dropdown-menu extended notification">
								<li>
									<span class="more"></span>
								</li>
								<div id="notifications"></div>
								<li class="external">
									<a href="javascript:void(0);" onclick="javascript:page('null','ioc_hits', null, null, null);">See all notifications<i class="m-icon-swapright"></i></a>
								</li>
							</ul>
						</li>
						<li class="dropdown"><a href="#" id="welcome" class="dropdown-toggle" data-toggle="dropdown">Welcome, <?php echo($session['username']); ?> <b class="caret"></b></a>
							<ul class="dropdown-menu">
								<li><a href="javascript:void(0);" onclick="$.colorbox({href:'assets/modals/user.params.php?id=<?php echo($session['id']); ?>'});"><i class="fa fa-cog"></i> My Preferences</a></li>
								<!-- <li><a href="javascript:void(0);" onclick="javascript:page('null','get_cron', null, null, null);"><i class="icon-envelope"></i> Manage Reports</a></li> -->
								<li><a href="javascript:void(0);" onclick="javascript:page('null','manage_users', null, null, null);"><i class="fa fa-user"></i> Manage Users</a></li>
								<li class="divider"></li>
								<li><a href="index.php?logout"><i class="fa fa-power-off"></i> Logout</a></li>
							</ul>
						</li>
					</ul>
				</div>
			</div>
		</div>
		<!-- BODY -->
		<div class="page-container">
			<!-- SIDEBAR -->
			<div class="page-sidebar nav-collapse collapse">
				<?php require_once('inc/sidebar.php'); ?>
			</div>
			<!-- CONTENT -->
			<div class="page-content">
				<div class="container-fluid">
					<!-- PAGE HEADER -->
					<div class="row-fluid">
						<div class="span12">
							<div style="margin-top:30px"  class="btn-group pull-right">
								<div id="head-right"></div>
							</div>
							<!-- PAGE TITLE & BREADCRUMB-->
							<h3 class="page-title">
								<div id="graph_title"></div>
								<small id="sub_heading"></small>
								<div id="severity"></div>
							</h3>
							<div class="breadcrumb">
								<div class="pull-right no-text-shadow">
									<div id="dashboard-report-range" class="dashboard-date-range tooltips no-tooltip-on-touch-device responsive" data-tablet="" data-desktop="tooltips" data-placement="top" data-original-title="Change dashboard date range">
										<i style="color:#fff" class="fa fa-calendar"></i>
										<span></span>
										<i style="color:#fff" class="fa fa-angle-down"></i>
									</div>
								</div>
								<div class="pull-left no-text-shadow">
									<i class="fa fa-home"></i>
									<span id="home"></span>
								</div>
								<ul id="breadhome"></ul>
							</div>
						</div>
					</div>
					<div id="page"><!-- SORTABLE DIVs--></div>
					<div id="d3Div"></div>
				</div>
			</div>
		</div>
		<!-- FOOTER -->
		<div class='footer'>
			<div class='footer-inner'>
				<img src='assets/img/rapid.png' id='footimg' class='hidden-phone hidden-tablet' alt=''/>
				<?php
					$f = fopen('VERSION', 'r');
					$line = fgets($f);
					fclose($f);
					echo '&copy; '.date("Y").' Phirelight Security Solutions - rapidPHIRE version: '.$line;
				?>
			</div>

			<div class="footer-tools">
				<span class="go-top">
					<i class="fa fa-angle-up"></i>
				</span>
			</div>
		</div>
	</body>
</html>
<?php } else { ?>
		<link href="assets/css/pages/login.css" rel="stylesheet" type="text/css"/>
	</head>
	<body class="login">
		<!-- LOGO -->
		<div class="logo">
			<img src="assets/img/rapid.png" alt=""/>
		</div>
		<div class="content">
			<!-- LOGIN FORM -->
			<h1>Login</h1>
			<div id="login_form_body">
				<form action="?login" method="post">
					<div class="control-group">
						<label class="control-label visible-ie8 visible-ie9">Username</label>
						<div class="controls">
							<div class="input-icon left">
								<i class="fa fa-user"></i>
								<input type="text" name="username" id="username" class="m-wrap placeholder-no-fix"/>
							</div>
						</div>
					</div>
					<div class="control-group">
						<label class="control-label visible-ie8 visible-ie9">Password</label>
						<div class="controls">
							<div class="input-icon left">
								<i class="fa fa-lock"></i>
								<input type="password" name="password" id="text_password" class="m-wrap placeholder-no-fix"/>
							</div>
						</div>
					</div>
					<?php /*?> <input type="checkbox" name="remember" /><?php */ ?>
					<div class="form-actions">
						<input class="btn red pull-right" type="submit" name="action" value="Login" id="login_button" />
					</div>
				</form>
			</div>
			<div class="copyright">
				<?php
					$f = fopen('VERSION', 'r');
					$line = fgets($f);
					fclose($f);
					echo '&copy; '.date("Y").' Phirelight Security Solutions - rapidPHIRE version: '.$line;
				?>
			</div>
			<div class="create-account">
				<p>
					<span class="small"><a href="register.php">Register</a> | <a href="resetpassword.php">Forgot your password?</a></span>
				</p>
			</div>
		</div>
	</body>
</html>

<?php } ?>
