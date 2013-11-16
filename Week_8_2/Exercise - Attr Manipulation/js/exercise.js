/**
 * Javascript Exercise: Attribute Manipulation!
 */

/**
 * Question 1:
 * Find the img src for the img in figure #fig1
 * Store the result in a variable named "q1"
 * Print q1 to the console.
 */

 var q1;

 $(document).ready(function() {
 	q1 = $('#fig1 img').attr('src');
	console.log(q1)
 });


/**
 * Question 2:
 * Now change the src of that image to this url:
 * "http://placekitten.com/500/200"
 */

 
 $(document).ready(function() {
 	$('#fig1 img').attr('src',"http://placekitten.com/500/200");
 });


/**
 * Question 3:
 * Find the 'role' of the header on index.html
 * Store the result in a variable named "q3"
 * Print q3 variable to the console.
 */

 var q3;

 $(document).ready(function() {
 	q3 = $('header').attr('role');
	console.log(q3)
 });


/**
 * Question 4:
 * Add the "success" class to each of "the-facts" list items
 */

 $(document).ready(function() {
 	$('#the-facts li').addClass('success');
 });

/**
 * Question 5:
 * Check if the figure with id "fig2" has the class "awesome". If not, apply it
 */

 $(document).ready(function() {
 	if ($('#fig2').hasClass('awesome')) {
 		console.log('has the class');
 	} else {
 		$('#fig2').addClass('awesome');
 	}
 });


/**
 * Question 6:
 * That paragraph with the "warn" class looks super intimidating. Remove the warn class.
 */

$(document).ready(function() {
 	$('p.warn').removeClass('warn');
 });


/**
 * Question 7:
 * Remove the "success" class from the first h2 and add it to the other h2s
 * with just one line of jQuery.
 */

$(document).ready(function() {
 	$('h2').toggleClass('success');
 });
