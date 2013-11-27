	// this is a single line comment
	/*
	 * this is a multi-line comment
	 */

	 //Prompt the user for their name and last name. 

	 var firstName = prompt("What is your name?");
	 console.log(firstName);
	 var surname = prompt("What is your last name?");
	 console.log(surname);

	//Create a new variable called full name and store the users full name.
	
	var fullName=(firstName+" "+surname);

	//Print the full name to the console.
	console.log(fullName);

	//Prompt the user for their age.
	var age=prompt("How old are you?");
	console.log(age);


	//Add 10 to the age and print the output to the console.
	 
	var newAge=parseInt(age)+10;
	console.log(newAge);
	
	
	//Verify that the user is over 18 and print if they are a minor or adult to the console.
	if (age>=18) {console.log ("adult")}
	else {console.log ("minor")};

	
	//Verify if the first name is "General" and the last name is NOT "Assembly"

	if (firstName=="General" && surname!=="Assembly") {console.log ("true")};


