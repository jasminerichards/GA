/**
 * Welcome to Mouse Events Exercise
 * A couple of thing we want to do:
 * 
 * 1) When a user clicks the mousebox, turn it red by adding the "clicked" css class 
 *    to it. When the user clicks it again, remove the "clicked" class and turn it blue 
 *    again.
 *
 * 2) Use the mouseMove event to show the current position of the mouse using the HTML snippet provided
 */

$(document).ready(function () {
	$('#mouseBox').on( "mousedown mouseup", function (event) {
		$(this).toggleClass('clicked');
		console.log(event.pageX);
		$('#xLocation').text(event.pageX);
		console.log(event.pageY);
		$('#yLocation').text(event.pageY);
	});
});