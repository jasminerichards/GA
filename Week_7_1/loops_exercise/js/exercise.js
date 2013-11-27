/**
 * Javascript Exercise: Loops and Arrays.
 * Most of your answers should be stored in variables called q1, q2 etc..
 Print the variables q1, q1 etc to the console. 
 */

/**
 * Question 1
 * Create a 'for' loop that populates an array with the numbers 1 through 10 
 */
   var myArray = [];

	for (var i = 0; i < 10; i++) {
		q1 = console.log(myArray.push(i+1)); 
	}

/**
 * Question 2
 * Using a while loop subtract the numbers 1 through 10 from 100
 * Store the sum in the "sub" variable and print the sub and start to the console after each iteration.
 */
var sub = 100;
var start = 1;

while (start <= 10) {
	sub = sub - start;
	console.log(sub);
	start++;
}

/**
 * Question 3
 * Using a for loop programatically find the largest number in the array.
 * Store the largest number in a variable called "largest_num"
 */
var someNums = [3, 1, 88, -1, 33, 96, 35, 12, 72];
var largest_num = someNums[0];

for( i=0; i<someNums.length; i++) {
	if(someNums[i] > largest_num) {
		largest_num = someNums[i]

	}
	console.log(largest_num);

}


/**
 * Question 4
 * Using a for loop programatically find the smallest number in the "someNums" array.
 * Store that number in "small"
 */
var small = someNums[0];
for( i=0; i<someNums.length; i++) {
	if(someNums[i] < small) {
		small = someNums[i]
	}
	console.log(small);

/**
 * Question 5
 * Count how many elements appear in BOTH arrays. Store the number of duplicates in the 
 * variable "totalDuplicates". 
 * Hint: You will need to do a loop inside of another loop
 */
var firstArray = ['peaches', 'apples', 'pears', 'oranges', 'plums', 'water melon', 'strawberries'];
var secondArray = ['blueberries', 'water melon', 'tomatoes', 'apples', 'plums', 'oranges', 'cantaloupe'];
var totalDuplicates = 0;


for( i=0; i<firstArray.length; i++) {
	console.log(firstArray[i]);
	for( j=0; j<secondArray.length; j++) {
		if(firstArray[i] === secondArray[j]) {
			totalDuplicates++;
		}
	}
	}

/**
 * Question 6 - ******BONUS******
 * Count the number of unique elements are in the array. In other words, in the 
 * array [1, 2, 1] there are two unique numbers: 1 and 2.
 * Store the number of uniques in "totalUniques"
 */

var numbers = [3, 7, 1, 3, 23, 7, 98, 26, 1];
var uniques = [];

for( i=0; i<numbers.length; i++) {
	if (uniques.indexOf(numbers[i]) === -1) {
		uniques.push(numbers[i]);
	}
}
var totalUniques = uniques.length; 
