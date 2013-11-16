$(
	function(){
		var firstName = prompt('What is your name?');
		$("h1").html('Welcome ' + firstName);
		var myH2 = $("h2").text();
		console.log(myH2);
		$("h2").append(" don't belong in the head.");
		myH2 = $("h2").text();
		console.log(myH2);
}
);
