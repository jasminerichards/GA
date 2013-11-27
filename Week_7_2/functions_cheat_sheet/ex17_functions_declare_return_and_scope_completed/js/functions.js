/*========== FUNCTIONS ==========*/

//Functions are very useful for setting aside a set of actions that we would like to run multiple times and at specific moments. They will only run when we ask them.

//declare a function
function takeOutTrash(){
	//do something here...
	garbage = 'empty';
	//Things in here will not run until we call the function by name.
	console.log(garbage);
}

//notice there is no need for a semi-colon after a functions curly braces.

//call the function
takeOutTrash();

//functions can be stored inside of variables.
var x = function(){

	console.log('Hello there!');
};

x();

//sometimes functions do not have names, such as the one inside of the var x in the example above, these are called an anonymous functions.

//You can pass values into a function using parameters
function doMath(x,y){

	var z = x + y;
	console.log(z);

}

doMath(4,5); //This will print 9

//parameters can accept boolean, numbers, or strings, however be careful. You can get unexpected results if you pass strings into the doMath function...

doMath('Hello','Bob'); // This prints HelloBob

//or worse yet if we send it types that can't be operated on in the way we are asking..

doMath(true,'Bob'); // instead of the value true it stringified to 'true'

doMath('14',3); //here 3 became a string '3'. So.. Javascript tries to fix it for us, but does not always give us what we want.

//Values created inside the function can't be used unless we return the value outside the function.

function doMoreMath(x,y){

	var z = x / y;

}

doMoreMath(4,2);
//console.log(z); //see console error then comment this out.

//now lets return the value of z inside the function.

function doEvenMoreMath(x,y){

	var z = x * y;
	return z;

}

console.log(doEvenMoreMath(5,3)); //prints 15.

//The variables declared inside of functions are called local varibales because they only have 'local' scope meaning they can't be seen outside the function unless we return them as in the example above. One good thing about this is that it protects variables so we can't overight them accidentally outside the function.


function milkTheCow(){
	//local var
	var bessyCow = 'milked';
	return bessyCow;
}

//console.log(bessyCow); //see error the comment out. then add return.

//pass returned local var into a global var outside the function for later use.
var globalBessy = milkTheCow();

console.log(globalBessy); //prints milked.

//global vars can be understood and used inside of fucntions, but local vars can't be seen outside of functions.

//declare global var outside a function.
var teethClean = false;

function dentist(){
	teethClean = true;
	return teethClean;
}

dentist();
console.log(teethClean); //prints true.


//try to figure out this functions result:

var tiger = 2,
	lion = 3;
function countAnimals(giraffe) {
	tiger = tiger - 1;
	total = lion + tiger + giraffe;
	return total;
}

countAnimals(3);
//what will the total be.
console.log(total);

//what if I nest functions inside of other functions.. oh my!

var donuts = 1,
    people = 2;
function feedPeople(friend){

	people = people + friend;
	function makeMore(){
		donuts += people;
		return donuts;
	}
	if (donuts <= people) {
		makeMore();
	}

	var fullBelly = donuts / people;
	return fullBelly;

}

//what will this print ?
console.log(feedPeople(3));