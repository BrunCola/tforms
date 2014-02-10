<?php
include("config.php");
if(isset($_GET['code']) && isset($_GET['reset'])){
	if($_POST['password'] == $_POST['cpassword']){
		$check = $system->userPasswordResetCheck($_GET['code']);
		if($check[0]){
			$change = $system->userPasswordChange($check[1],$_POST['password']);
		}
	}
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Reset Password | Advanced User System</title>
	<link rel="stylesheet" href="style.css" type="text/css" />
</head>
<body>
	<div id="bar-top">
		<div id="navigation">
			<ul>
				<li><a href="index.php">Home</a></li>
<?php
if($session['id']){
?>
				<li><a href="friends.php">Friends<?php if($system->friendRequestNum()){ echo("<a class=\"message-num\">".$system->friendRequestNum()."</a>"); } ?></a></li>
				<li><a href="messages.php">Messages<?php if($system->messageUnreadNum()){ echo("<a class=\"message-num\">".$system->messageUnreadNum()."</a>"); } ?></a></li>
<?php
}
?>
				<li><input type="text" id="search-bar" value="Search for user" />&nbsp;<a href="#" onclick="document.getElementById('search-bar-value').value = document.getElementById('search-bar').value; document.getElementById('search-bar-form').submit();">Search</a>
					<form action="search.php?search" method="post" id="search-bar-form"><input type="text" id="search-bar-value" name="search" /></form>
				</li>
			</ul>
		</div>
		<div id="welcome">
<?php
if($session['id']) {
?>
			Welcome <?php echo($session['username']); ?><br />
			<span class="small"><?php if($session['level'] == 10){?><a href="panel.php">Admin Panel</a> | <?php } ?><a href="profile.php">Profile</a> | <a href="index.php?logout">Logout</a></span>
<?php
}
else {
?>
			<form action="index.php?login" method="post">
				<input type="text" name="username" />
				<input type="password" name="password" />
				<input type="checkbox" name="remember" />
				<input type="submit" value="Login" />
			</form>
			<span class="small"><a href="register.php">Register</a> | <a href="resetpassword.php">Forgot your password?</a></span>
<?php
}
?>
		</div>
	</div>
	<div id="content">
		<div id="container">
			<h1>Reset Password</h1>
<?php
if(isset($_GET['code'])){
	if(isset($_GET['reset'])){
		if($_POST['password'] == $_POST['cpassword']){
			if($check[0]){
				if($change[1]){
					echo($change[1]);
				}
				else{
					echo($change[1]);
				}
			}
			else{
				echo($check[1]);
			}
		}
		else{
			echo("Passwords do not match.");
		}
	}
?>
			<form action="?reset&code=<?=$_GET['code']?>" method="post">
				Password: <input type="password" name="password" /><br />
				Password again:<input type="password" name="cpassword" />
				<input type="submit" value="Change" />
			</form>
<?php
}
else{
	if(isset($_GET['send'])){
		$send = $system->userPasswordReset($_POST['email']);
		if($send[0]){
			echo($send[1]);
		}
		else{
			echo($send[1]);
		}
	}
?>
			<form action="?send" method="post">
				Email: <input type="text" name="email" />
<input type="submit" value="Reset" />
			</form>
<?php
}
?>
</body>
</html>
