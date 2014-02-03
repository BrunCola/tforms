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
        <ul class="nav nav-tabs">
            <li class="active"><a href="#home" data-toggle="tab">Profile</a></li>
            <?php /*?><li><a href="#profile" data-toggle="tab">Password</a></li><?php */ ?>
        </ul>
        <div id="myTabContent" class="tab-content">
            <div class="tab-pane active in" id="home">
                <span id="tab">
                    <label>Username</label>
                    <input id="username" type="text" value="<?php $var = $system->userInfo($id); echo $var[1]['username']; ?>" class="input-xlarge">
                    <label>Email</label>
                    <input id="email" type="text" value="<?php $var = $system->userInfo($id); echo $var[1]['email']; ?>" class="input-xlarge">
                    <div>
                        <button onClick="info_update();" class="btn btn-primary">Update</button>
                    </div>
            	</span>
            </div>
        </div>
    </div>
</body>
</html>
<?php } ?>

<script type="text/javascript">
function info_update() {
	var uname = $('#username').val();
	var email = $('#email').val();
	var uid = '<?php $var = $system->userInfo($id); echo $var[1]['id']; ?>';
	$.get('inc/getdata.php?email_update=true&string='+email+'&uid='+uid);
	$.get('inc/getdata.php?uname_update=true&string='+uname+'&uid='+uid, function() {
		page('null','manage_users','User Mangement', null, null, null);
		$('#welcome').html('Welcome, '+uname);
		$.colorbox.close();	
	});
}
</script>