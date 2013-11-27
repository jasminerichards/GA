$(document).ready(function(){
	$("#add_user_data").validate({
		rules: {
		    user_name: {
		      required: true,
		      minlength: 3
		    },
		    user_email: {
		    	required: true,
		    	number: true
		    	minlength: 3
		    },
	        user_enquiry: {
		      required: true,
		    }
		}
	});	

	$('button').click(function(){
    window.location.href = 'womens.html'
});

});

