var FIZZBUZZ = {
	isFizz: function(number) {
		if ((number % 3) === 0) {
			return true;
		} else {
			return false;
		}
	},
	isBuzz: function(number) {
		if ((number % 5) === 0) {
			return true;
		} else {
			return false;
		}
	}
}

$(document).ready(function() {
	// -save chosenNumber
	var currentNumber = prompt('what number would you like to start with?');
	currentNumber = parseInt(currentNumber);
	// - start 	a loop (for 100)
	for (var i = 0; i < 100; i++) {
		console.log(currentNumber);
		// 	- take current number
		// 	- isFizz? 
		// 		log fizz
		// 		isFizz = true
		// 	- isBuzz?
		// 		log buzz
		// 		isBuzz = true
		var isFizz = FIZZBUZZ.isFizz(currentNumber);
		var isBuzz = FIZZBUZZ.isBuzz(currentNumber);

		if (isFizz && isBuzz) {
			$('#fizzbuzz').append('<span class="fizzbuzz">'+currentNumber+'</span>');
		}
		else if (isFizz) {
			$('#fizzbuzz').append('<span class="fizz">'+currentNumber+'</span>')
		}
		else if (isBuzz) {
			$('#fizzbuzz').append('<span class="buzz">'+currentNumber+'</span>')
		}
		else {
			$('#fizzbuzz').append('<span>'+currentNumber+'</span>')
		}

	currentNumber = currentNumber + 1;
	};
});