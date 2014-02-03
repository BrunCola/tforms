<?php 
$id = $_GET['id'];
session_start();
include("../../inc/class.user.php");
$system = new System();
$system->registerConfirm = true;
$session = $system->session;
if($session['id']){
?>
<body style="width:500px;height:500px;">  
	<!-- HEADER -->
<div class="well">
<!-- Form Name -->
<legend>Form Name</legend>

<!-- Select Basic -->
<div class="control-group">
  <label class="control-label" for="report_type">Report Type</label>
  <div class="controls">
    <select id="report_type" name="report_type" class="input-xlarge">
      <option value="Netflow">Netflow</option>
      <option value="Web">Web</option>
      <option value="Layer 7">Layer 7</option>
    </select>
  </div>
</div>

<!-- Select Basic -->
<div class="control-group">
  <label class="control-label" for="frequency">Report Frequency</label>
  <div class="controls">
    <select id="frequency" name="frequency" class="input-xlarge">
      <option>Daily</option>
      <option>Weekly</option>
      <option>Monthly</option>
    </select>
  </div>
</div>

<!-- Select Basic -->
<div class="control-group" id="timepick">
  <label class="control-label" for="timepick">Select a Time</label>
  <div class="controls">
    <select id="timepick" name="timepick" class="input-xlarge">
      <option value="0">00:00</option>
      <option value="1">01:00</option>
      <option value="2">02:00</option>
      <option value="3">03:00</option>
      <option value="4">04:00</option>
      <option value="5">05:00</option>
      <option value="6">06:00</option>
      <option value="7">07:00</option>
      <option value="8">08:00</option>
      <option value="9">09:00</option>
      <option value="10">10:00</option>
      <option value="11">11:00</option>
      <option value="12">12:00</option>
      <option value="13">13:00</option>
      <option value="14">14:00</option>
      <option value="15">15:00</option>
      <option value="16">16:00</option>
      <option value="17">17:00</option>
      <option value="18">18:00</option>
      <option value="19">19:00</option>
      <option value="20">20:00</option>
      <option value="21">21:00</option>
      <option value="22">22:00</option>
      <option value="23">23:00</option>
    </select>
  </div>
</div>

<!-- Multiple Checkboxes -->
<div class="control-group" id="daypicker">
  <label class="control-label" for="daypicker">Select a Day</label>
  <div class="controls">
    <label class="checkbox" for="daypicker-0">
      <input name="daypicker" id="daypicker-0" value="1" type="checkbox">
      Monday
    </label>
    <label class="checkbox" for="daypicker-1">
      <input name="daypicker" id="daypicker-1" value="2" type="checkbox">
      Tuesday
    </label>
    <label class="checkbox" for="daypicker-2">
      <input name="daypicker" id="daypicker-2" value="3" type="checkbox">
      Wednesday
    </label>
    <label class="checkbox" for="daypicker-3">
      <input name="daypicker" id="daypicker-3" value="4" type="checkbox">
      Thursday
    </label>
    <label class="checkbox" for="daypicker-4">
      <input name="daypicker" id="daypicker-4" value="5" type="checkbox">
      Friday
    </label>
    <label class="checkbox" for="daypicker-5">
      <input name="daypicker" id="daypicker-5" value="6" type="checkbox">
      Saturday
    </label>
    <label class="checkbox" for="daypicker-6">
      <input name="daypicker" id="daypicker-6" value="7" type="checkbox">
      Sunday
    </label>
  </div>
</div>

<!-- Select Basic -->
<!-- Multiple Checkboxes -->
<div class="control-group" id="monthselect">
  <label class="control-label" for="monthselect">Select a Month</label>
  <div class="controls">
    <label class="checkbox" for="monthselect-0">
      <input name="monthselect" id="monthselect-0" value="1" type="checkbox">
      January
    </label>
    <label class="checkbox" for="monthselect-1">
      <input name="monthselect" id="monthselect-1" value="2" type="checkbox">
      February
    </label>
    <label class="checkbox" for="monthselect-2">
      <input name="monthselect" id="monthselect-2" value="3" type="checkbox">
      March
    </label>
    <label class="checkbox" for="monthselect-3">
      <input name="monthselect" id="monthselect-3" value="4" type="checkbox">
      April
    </label>
    <label class="checkbox" for="monthselect-4">
      <input name="monthselect" id="monthselect-4" value="5" type="checkbox">
      May
    </label>
    <label class="checkbox" for="monthselect-5">
      <input name="monthselect" id="monthselect-5" value="6" type="checkbox">
      June
    </label>
    <label class="checkbox" for="monthselect-6">
      <input name="monthselect" id="monthselect-6" value="7" type="checkbox">
      July
    </label>
    <label class="checkbox" for="monthselect-7">
      <input name="monthselect" id="monthselect-7" value="8" type="checkbox">
      August
    </label>
    <label class="checkbox" for="monthselect-8">
      <input name="monthselect" id="monthselect-8" value="9" type="checkbox">
      September
    </label>
    <label class="checkbox" for="monthselect-9">
      <input name="monthselect" id="monthselect-9" value="10" type="checkbox">
      October
    </label>
    <label class="checkbox" for="monthselect-10">
      <input name="monthselect" id="monthselect-10" value="11" type="checkbox">
      November
    </label>
    <label class="checkbox" for="monthselect-11">
      <input name="monthselect" id="monthselect-11" value="12" type="checkbox">
      December
    </label>
  </div>
</div>
<button onClick="cron_val();" class="btn btn-primary">Create</button>
</div>
</body>

<script type="text/javascript">
$('#frequency').on('change',function(){
var selection = $(this).val();
switch($('#frequency').val())
   {
       case 'Daily':
           $('#timepick').show();
           $('#daypicker').hide();
		   $('#monthselect').hide();
           break;
       case 'Weekly':
           $('#timepick').show();
           $('#daypicker').show();
		   $('#monthselect').hide();
           break;
       case 'Monthly':
           $('#timepick').show();
           $('#daypicker').show();
		   $('#monthselect').show();
           break;
       default:
	   	$('#timepick').hide();
           $('#daypicker').hide();
		   $('#monthselect').hide();
           break;
	}
});
$('#daypicker').hide();
$('#monthselect').hide();
function cron_val() {
	var hour = $('#timepick option:selected').val();
	if (hour.length == 1) {
		var hour_txt = '0'+hour+'00';
	}
	if (hour.length == 2) {
		var hour_txt = hour+'00';
	}
	
	var day_val = $("#daypicker :checkbox:checked").map(function() {
		return this.value;
	}).get();
	if (day_val == '') {
		var day = '*';
	} else {
		var day = day_val;
	};

	var day_name = $("#daypicker :checkbox:checked").map(function() {
		switch (this.value) {
			case '0':
				return 'Sunday';
				break;
			case '1':
			 	return 'Monday';
				break;
			case '2':
			 	return 'Tuesday';
				break;
			case '3':
			 	return 'Wednesday';
				break;
			case '4':
			 	return 'Thursday';
				break;
			case '5':
			 	return 'Friday';
				break;
			case '6':
			 	return 'Saturday';
				break;
		}
	}).get();
	if (day_name == '') {
		var day_name = 'day';
	}
	
	var month_val = $("#monthselect :checkbox:checked").map(function() {
		return this.value;
	}).get();
	if (month_val == '') {
		var month = '*';
	} else {
		var month = month_val;
	}
	
	var month_name = $("#monthselect :checkbox:checked").map(function() {
		switch (this.value) {
			case '1':
			 	return 'January';
				break;
			case '2':
			 	return 'February';
				break;
			case '3':
			 	return 'March';
				break;
			case '4':
			 	return 'April';
				break;
			case '5':
			 	return 'May';
				break;
			case '6':
			 	return 'June';
				break;
			case '7':
			 	return 'July';
				break;
			case '8':
			 	return 'August';
				break;
			case '9':
			 	return 'September';
				break;
			case '10':
			 	return 'October';
				break;
			case '11':
			 	return 'November';
				break;
			case '12':
			 	return 'December';
				break;
		}
	}).get();
	if (month_name == '') {
		var month_name = 'month';
	}
	
	var human_date = 'Every '+day_name+' at '+hour_txt+', every '+month_name;
	var username = '<?php echo($session['username']); ?>';
	var report_type = $('#report_type option:selected').val();
	//var command = '<some command here username: '+username+'>';
	var result = '0 '+hour+' * '+month+' '+day;
	//var result = 'boo';
	$.get('inc/getdata.php?cron_gen=true&string='+result+'&report_type='+report_type+'&human_date='+human_date, function () {
		page('null','get_cron','Report Management', null, null, null);
		$.colorbox.close();
	});
}
</script>

<?php } ?>