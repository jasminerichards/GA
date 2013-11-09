$(
  function(event) {
  	//Start to type below here. Make sure not to delete any "{}" braces. 

var favouriteColor = prompt("What is your favourite colour?");
console.log(favouriteColor);

if (
	(favouriteColor === "blue") ||
	(favouriteColor === "red") ||
	(favouriteColor === "yellow") ||
	(favouriteColor === "green")

	) {
		 $('body').css('background-color', favouriteColor); 

	} else { 
	$('h2').text("We don't have that color")
	}

}
);