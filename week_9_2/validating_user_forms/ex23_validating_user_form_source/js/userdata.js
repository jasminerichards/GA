// $(document).ready(function(){

	//CREATE OBJECT (using Literal Notation)
	
		
	//DOM SEL VARS
	
	
	//INITIALLY HIDE ERRORS	


	//DISPLAY LIST FUNCTION
	
	
	//ADD_USER FORM SUBMIT EVENT FUNCTION
	
	///^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/
	
	//CLEAR BUTTON FUNCTION
	
		
// });




$(document).ready(function(){

	 var user_name = $('#user_name');
	 var user_age = $('#user_age');
	 var user_ph = $('#user_ph');
	 var user_email = $('#user_email');

	 var validEmail = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/;
	

	 $('.error').hide();

$("form").submit(function(event) {
 

  if (user_name.val().length < 4) {
  	$('#user_name_error').show();
  	 event.preventDefault();

  }

  if (isNaN(user_age.val()) ||
  	$('#user_age_error').trim()=="") {
  	$('#user_age_error').show(); 
   event.preventDefault();

  }

  if ()

  if (validEmail.test(user_email.val()) == false) {
	$('#user_email_error').show();
	 event.preventDefault();
}
  
});

// clear / refresh !

});