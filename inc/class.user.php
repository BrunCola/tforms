<?php
class System {
	public $registerConfirm;
	public $session;
	public function __construct(){
		$this->connect(); //Connect to the MySQL database
		$this->sessionCreate(); //Create a session for the user
		$this->stateOnline(); //Make the user appear online
	}
	public function connect(){ //Open the database information and connect to the database, else return an error
		require_once("class.database.php");
		$connect = new Database("user_DB"); 
	}
	public function currentDIR(){ //Returns the current full URL of your current directory (on most servers)
		$url = 'http';
		if($_SERVER["HTTPS"] == "on"){
			$url .= "s";
		}
		$url .= "://";
		if($_SERVER["SERVER_PORT"] != "80"){
			$url .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];
		}
		else{
			$url .= $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];
		}
		return dirname($url);
	}
	public function currentURL(){ //Returns the current full URL of the current URL (on most servers)
		$url = 'http';
		if($_SERVER["HTTPS"] == "on"){
			$url .= "s";
		}
		$url .= "://";
		if($_SERVER["SERVER_PORT"] != "80"){
			$url .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];
		}
		else{
			$url .= $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];
		}
		return $url;
	}
	public function secure($input){ //Function to sanitize any user entries that come in contact with a MySQL query
		$secure = strip_tags(mysql_real_escape_string($input));
		return $secure;
	}
	public function sendMail($email,$mail_subject,$mail_message){ //Sends an email to a user's email
		$email = $this->secure($email);
		$select = mysql_query("SELECT `id` FROM `user` WHERE `email` = '$email' LIMIT 1");
		$check = mysql_num_rows($select);
		if($check > 0){
			$mail_domain = $_SERVER['HTTP_HOST'];
			$mail_headers = "Content-type: text/html; charset=iso-8859-1\r\nFrom: no-reply@".$mail_domain."\r\nReply-To: no-reply@".$mail_domain.".com\r\nX-Mailer: PHP/".phpversion(); //Set the email headers so the mail will send correctly
			mail($email,$mail_subject,$mail_message,$mail_headers);
			return array(true,"An email has been sent to ".$email."."); //Return a message on success
		}
		else{
			return array(false,"Error sending email."); //Return a message on error
		}
	}
	public function sessionCreate(){ //Create the user session, set the id and password into the session, and create a cookie if requested
		if(isset($_COOKIE['id']) && isset($_COOKIE['password'])){
			$_SESSION['id'] = $_COOKIE['id'];
			$_SESSION['password'] = $_COOKIE['password'];
		}
		if(isset($_SESSION['id']) && isset($_SESSION['password'])){
			$id = $this->secure($_SESSION['id']);
			$password = $this->secure($_SESSION['password']);
			$select = mysql_query("SELECT * FROM `user` WHERE `id` = '$id' AND `password` = '$password' LIMIT 1");
			$this->session = mysql_fetch_array($select);
		}
	}
	public function stateOffline(){ //Set the user's online appearance to 'offline' (so that they will instantly appear offline when they sign offline, instead of having a 10 minute delay)
		$time = time();
		$offline = $time - 600;
		if($this->session['id']){
			mysql_query("UPDATE `user` SET `online` = '$offline' WHERE `id` = '".$this->session['id']."' LIMIT 1");
		}
	}
	public function stateOnline(){ //Set the user's online appearance to 'online' (so that other users can tell as soon as this user logs in)
		$time = time();
		if($this->session['id']){
			mysql_query("UPDATE `user` SET `online` = '$time' WHERE `id` = '".$this->session['id']."' LIMIT 1");
		}
	}
	public function userChangeLevel($id,$new_level){ //Premote or demote a user's rank/level (useful for premoting them to VIP/moderator/administrator status
		$id = $this->secure($id);
		$new_level = $this->secure($new_level);
		if(is_int($new_level)){
			$select = mysql_query("SELECT `level` FROM `user` WHERE `id` = '$id' LIMIT 1");
			$check = mysql_num_rows($select);
			if($check > 0){
				$level = mysql_fetch_array($select);
				$level = $level['level'];
				if($level == $new_level){
					return array(false,"User is already this level."); //Return a warning if the user is already this level
				}
				else{
					$query = mysql_query("UPDATE `user` SET `level` = '$new_level' WHERE `id` = '$id' LIMIT 1");
					return array(true,"User level successfully changed."); //Return a message on success
				}
			}
			else{
				return array(false,"Invalid user id."); //Return a message on ID failure
			}
		}
		else{
			return array(false,"Invalid level input."); //Return a message on level input failure
		}
	}
	public function userChangeUsername($id,$new_username){ //Change a user's username
		$id = $this->secure($id);
		$new_username = $this->secure($new_username);
		$select = mysql_query("SELECT `username` FROM `user` WHERE `id` = '$id' LIMIT 1");
		$check = mysql_num_rows($select);
		if($check > 0){
			$username = mysql_fetch_array($select);
			$username = $username['username'];
			if($username == $new_username){
				return array(false,"User already has this username."); //Return a warning telling the user that they already have this username
			}
			else{
				mysql_query("UPDATE `user` SET `username` = '$new_username' WHERE `id` = '$id' LIMIT 1"); //Update the user's username
				return array(true,"Username successfully changed."); //Return a message on success
			}
		}
		else{
			return array(false,"Invalid user id."); //Return a message on error
		}
	}
	public function userDelete($id){ //Delete a user from the database, more extreme than plain banning
		$id = $this->secure($id);
		$select = mysql_query("SELECT `id` FROM `user` WHERE `id` = '$id' LIMIT 1");
		$check = mysql_num_rows($select);
		if($check > 0){
			mysql_query("DELETE FROM `user` WHERE `id` = '$id' LIMIT 1");
			return array(true,"User successfully removed."); //Return a message on success
		}
		else{
			return array(false,"Invalid user id."); //Return a message on error
		}
	}
	public function userID($input){ //Returns a user's ID corresponding to either their username or email
		$input = $this->secure($input);
		if(strpos($input,"@")){
			$select = mysql_query("SELECT `id` FROM `user` WHERE `email` = '$input' LIMIT 1");
		}
		else{
			$select = mysql_query("SELECT `id` FROM `user` WHERE `username` = '$input' LIMIT 1");
		}
		$check = mysql_num_rows($select);
		$id = mysql_fetch_array($select);
		if($check > 0){
			return array(true,$id[0]); //Return the id of the user on success
		}
		else{
			return array(false,"Invalid email or username."); //Return a message on error
		}
	}
	public function userInfo($uid){ //Returns information about a user from the given ID
		$uid = $this->secure($uid);
		$select = mysql_query("SELECT * FROM `user` WHERE `id` = '$uid' LIMIT 1");
		$check = mysql_num_rows($select);
		$info = mysql_fetch_array($select);
		if($check > 0){
			return array(true,$info); //Returns an array of the information on success
		}
		else{
			return array(false,"Could not retrieve user information."); //Returns a message on failure
		}
	}
	public function userLogin($username,$password,$remember){ //Logs the user into the database
		$username = $this->secure($username);
		$password = md5($this->secure($password)); //MD5 their password for security
		$remember = $this->secure($remember);
		$select = mysql_query("SELECT * FROM `user` WHERE `username` = '$username' LIMIT 1") or die(mysql_error());
		$login = mysql_fetch_array($select);
		$exists = mysql_num_rows($select);
		if($login['password'] == $password){ //Check to make sure the inputted password for the username matches what is in the database
			if($this->accountConfirm){ //If you have accountConfirm enabled, the user will need to confirm their account through email before being able to use the site
				$select_confirm = mysql_query("SELECT `id` FROM `confirm_account` WHERE `uid` = '$login[id]' LIMIT 1");
				$confirm_check = mysql_num_rows($select_confirm);
				if($confirm_check > 0){
					return array(false,"You must confirm your account, please check your email for confirmation instructions."); //Returns a warning if the user has not confirmed their account
				}
				else{ //Store the ID and password in the session if the account has been confirmed
					$_SESSION['id'] = $login['id'];
					$_SESSION['password'] = $login['password'];
					if($remember == true){
						setcookie("id",$_SESSION['id']);
						setcookie("password",$_SESSION['password']);
					}
				}
			}
			else{ //Store the ID and password if accountConfirm is disabled
				$_SESSION['id'] = $login[id];
				$_SESSION['password'] = $login[password];
				if($remember == true){
					setcookie("id",$_SESSION['id']);
					setcookie("password",$_SESSION['password']);
				}
			}
		}
		elseif($exists == 0){
			return array(false,"Could not find user."); //Returns a message on error
		}
		else{
			return array(false,"Incorrect username or password."); //Returns a message on error
		}
	}
	public function userLogout(){ //Ends the session for the user, as well as removes the cookies
		$this->stateOffline(); //Set the user's state to offline
		setcookie("id","",1);
		setcookie("password","",1);
		unset($_SESSION['id']);
		unset($_SESSION['password']);
	}
	public function userOnline($uid){ //Check the user's online status, can return 'offline', 'away' or 'online' in an integer form
		$uid = $this->secure($uid);
		$select = mysql_query("SELECT * FROM `user` WHERE `id` = '$uid' LIMIT 1");
		$check = mysql_num_rows($select);
		if($check > 0){
			$details = mysql_fetch_array($select);
			$time = time();
			$timestamp = $details['online'];
			$away = $time - 300;
			$offline = $time - 600;
			if($timestamp<$offline){
				return array(true,0); //Offline
			}
			if($timestamp<$away){
				return array(true,2); //Away
			}
			else{
				return array(true,1); //Online
			}
		}
		else{
			return array(false,"Invald user."); //Returns a message on error
		}
	}
	public function userOnlineCount(){ //Count all the users that show up as 'online' in the database
		$time = time();
		$offline = $time - 600;
		$select = mysql_query("SELECT * FROM `user` WHERE `online` >= $offline");
		$count = mysql_num_rows($select);
		return $count;
	}
	public function userPasswordChange($id,$password){ //Change a user's password by ID
		$id = $this->secure($id);
		$password = $this->secure($password);
		$password = md5($password);
		$select = mysql_query("SELECT id FROM `user` WHERE id = '$id' LIMIT 1");
		$check = mysql_num_rows($select);
		if($check > 0){
			mysql_query("UPDATE `user` SET `password` = '$password' WHERE `id` = '$id' LIMIT 1"); //Find the user's ID in the database, and update the corresponding password
			return array(true,"Password successfully changed."); //Return a message on success
		}
		else{
			return array(false,"Could not find user."); //Return a message on error
		}
	}
	public function userPasswordReset($email){ //Resets the user's password, and emails them a new one
		$email = $this->secure($email);
		$select = mysql_query("SELECT `id` FROM `user` WHERE `email` = '$email' LIMIT 1");
		$check = mysql_num_rows($select);
		if($check > 0){
			$chars = "abcdefghijklmnopqrstuvwxyz123456789"; //Create a password reset string
			for($i = 0;$i < 16;$i++){
				$pos = rand(1,strlen($chars));
				$code .= $chars{$pos};
			}
			$user = mysql_fetch_array($select);
			$uid = $user['id'];
			mysql_query("INSERT INTO `pw_reset` (`uid`,`code`) VALUES('$uid','$code')"); //Inserts the password reset data into the database
			$mail_domain = $_SERVER['HTTP_HOST'];
			$mail_reset_path = $this->currentDIR()."/resetpassword.php?code=".$code; //Creates the password reset URL to be emailed to the user
			$mail_subject = "Password reset from ".$mail_domain; //Sets the email subject/title
			$mail_message = "Please click the following link to reset your password on ".$mail_domain.": <a href=\"".$mail_reset_path."\">".$mail_reset_path."</a>"; //Sets the email message
			$send = $this->sendMail($email,$mail_subject,$mail_message,$mail_headers); //Send the email with all the above information
			if($send[0]){
				return array(true,$send[1]); //Return a message from the sendMail function on success
			}
			else{
				return array(false,$send[1]); //Return a message from the sendMail function on failure
			}
		}
		else{
			return array(false,"Email not found."); //Returns a message on error
		}
	}
	public function userPasswordResetCheck($code){ //Checks the reset code with the database
		$code = $this->secure($code);
		$select = mysql_query("SELECT `uid` FROM `pw_reset` WHERE `code` = '$code' LIMIT 1"); //Find the code in the database
		$check = mysql_num_rows($select);
		if($check > 0){ //If the code exists, get the user's ID from corresponding reset code in the database
			$row = mysql_fetch_array($select);
			$uid = $row['uid'];
			mysql_query("DELETE FROM `pw_reset` WHERE `code` = '$code' LIMIT 1"); //Delete the reset code so that someone else cannot reset the password again with the same link
			return array(true,$uid); //Return the user's ID on success
		}
		else{
			return array(false,"Invalid code."); //Return a message on error
		}
	}
	public function userProfile($pid){ //Given a PID, the user's profile information is returned (this allows for much easier expanding of what a user can modify and add without having to edit the generated user details)
		$pid = $this->secure($pid);
		$select = mysql_query("SELECT * FROM `user_profiles` WHERE `id` = '$pid' LIMIT 1"); //Select the profile information from the database given the corresponding PID from the user's information
		$check = mysql_num_rows($select);
		if($check > 0){
			$profile = mysql_fetch_array($select);
			return array(true,$profile); //Return the information from the profile in an array on success
		}
		else{
			return array(false,"Invalid profile id."); //Returns a message on error
		}
	}
	public function userRegister($username,$password,$cpassword,$email){ //Register the user to the database
		$username = $this->secure($username);
		$password = $this->secure($password);
		$cpassword = $this->secure($cpassword);
		$email = $this->secure($email);
		if($username == "" || $password == "" || $cpassword == "" || $email == ""){
			return array(false,"A field was left blank."); //Returns a warning message
		}
		else{
			if($password == $cpassword){
				if(preg_match("/[^a-zA-Z0-9_]/",$username)){
					return array(false,"Disallowed character(s) in username."); //Returns a warning if a user uses disallowed characters
				}
				else{
					$password = md5($password);
					$select_username = mysql_query("SELECT * FROM `user` WHERE `username` = '$username' LIMIT 1");
					$username_check = mysql_num_rows($select_username);
					if($username_check > 0){
						return array(false,"Username already in use."); //Returns a warning if the username is already in use
					}
					else{
						if(preg_match("/[^a-zA-Z0-9_@.-]/",$email)){
							return array(false,"Disallowed character(s) in email."); //Returns a warning if the user's email contains disallowed characters
						}
						else{
							$joined = date("F j, Y");
							$select_email = mysql_query("SELECT * FROM `user` WHERE `email` = '$email' LIMIT 1");
							$email_check = mysql_num_rows($select_email);
							if($email_check > 0){
								return array(false,"Email already in use."); // Returns a warning if the email is already in use
							}
							else{
								if(eregi('^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.([a-zA-Z]{2,4})$',$email)){ //Verify the email input
										mysql_query("INSERT INTO `user_profiles` (`id`) VALUES(null)");
										$pid = mysql_insert_id();
										mysql_query("INSERT INTO `user` (`username`,`password`,`email`,`joined`,`pid`) VALUES('$username','$password','$email','$joined','$pid')");
										$id = mysql_insert_id();
										mysql_query("UPDATE `user_profiles` SET `uid` = '$id' WHERE `id` = '$pid'"); //Register all user information, and assign a profile ID for the user
										if($this->accountConfirm){ //If accountConfirm is enabled, send a confirmation email to the user
											$chars = "abcdefghijklmnopqrstuvwxyz123456789";
											for($i = 0;$i < 16;$i++){
												$pos = rand(1,strlen($chars));
												$code .= $chars{$pos};
											}
											mysql_query("INSERT INTO `confirm_account` (`uid`,`code`) VALUES('$id','$code')");
											$subject = "Confirm account for ".$_SERVER['HTTP_HOST']; //Set the email subject/title
											$mail_confirm_path = $this->currentDIR()."/register.php?confirm=".$code; //Create the confirmation URL
											$message = "Please click the following link to confirm your account: <a href=\"".$mail_confirm_path."\">".$mail_confirm_path."?confirm=".$code."</a>"; //Set the email message
											$send = $this->sendMail($email,$subject,$message);
											if($send[0]){
												return array(true,$send[1]); //Return a message from the sendMail function on success
											}
											else{
												return array(false,$send[1]); //Return a message from the sendMail function on failure
											}
										}
										else{
											$_SESSION['id'] = $id;
											$_SESSION['password'] = $password;
											header("Location: index.php"); //Redirect the user on registration
										}
								}
								else{
									return array(false,"Email is invalid."); //Return a message on error
								}
							}
						}
					}
				}
			}
			else{
				return array(false,"Passwords do not match."); //Return a message on error
			}
		}
	}
}
?>