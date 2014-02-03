<?php 
$id = $_GET['id'];
session_start();
include("../../inc/class.user.php");
$system = new System();
$system->registerConfirm = true;
$session = $system->session;
if($session['id']){
?>
<body>  		
	<!-- HEADER -->
    <div class="well">
        <div id="myTabContent" class="tab-content">
            <div class="tab-pane active in" id="home">
                <span id="tab">
              		<form action="?register" method="post">
                    <label>Username:</label> <input type="text" name="username" class="input-xlarge"/><br />
                   	<label>Password:</label> <input type="password" name="password" class="input-xlarge"/><br />
                    <label>Confirm Password:</label> <input type="password" name="cpassword" class="input-xlarge"/><br />
                    <label>Email:</label> <input type="text" name="email" class="input-xlarge"/><br />
                    <div>
                        <button type="submit" value="Register" class="btn btn-primary">Submit</button>
                    </div>
                    </form>
            	</span>
            </div>
        </div>
    </div>
</body>
</html>
<?php } ?>
