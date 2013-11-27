$(document).ready(function(){
	$("#add_user_data").validate({
		rules: {
		    user_name: {
		      required: true,
		      minlength: 3
		    },
		    user_age: {
		    	required: true,
		    	number: true
		    },
	        user_ph: {
		      phoneUS: true
		    }
		}
	});		
});