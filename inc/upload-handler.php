<?php
$uploaddir = 'uploads/';
$uploadfile = $uploaddir . basename($_FILES['userfile']['name']);
echo "<p>";
if (move_uploaded_file($_FILES['userfile']['tmp_name'], $uploadfile)) {
?>
<script> alert('File Upload Successful'); 
location = "../index.php";
</script>
<?php
} else {
?>
<script> alert('Upload Failed');  
location = "../index.php";
</script>
<?php
}
echo "</p>";

?> 
