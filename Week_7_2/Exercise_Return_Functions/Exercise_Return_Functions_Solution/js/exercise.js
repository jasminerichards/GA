/**
 * Javascript Exercise: Functions and Return Value
   Complete the following questions and print the returned value to the console. 
 */

/**
 * Question 1:
 * Modify the "booleanValue" function so that it returns "true" when it's called.
 */
function booleanValue() {
  return true;
}	

console.log("Question 1: "+ booleanValue());

/**
 * Question 2:
 * Modify the "helloWorld" function so it returs the string "Hello World!". 
 * Notice that the function is being executed and the result is stored in the variable "q2"
 */
function helloWorld() {
  return "Hello World!";
}
var q2 = helloWorld();

console.log("Question 2: "+ q2);

/**
 * Question 3:
 * Modify the function "join" so that it concatenates the two string arguments together. 
 * Notice that the result of that function is being stored in q3
 */
function join(left, right) {
  return left + right;
}
var q3 = join("1 + 1 = ", "2");
console.log("Question 3: "+ q3);


/**
 * Question 4:
 * You're on your own this time! First, write a function called "multiply" which takes 
 * two numbers, multiplies them, and returns the result. Next call your new function 
 * with the number 42 and 3257 and store the result in variable "q4".
 */
function multiply(num1, num2) {
  return num1 * num2;
}
var q4 = multiply(42, 3257);
console.log("Question 4: "+ q4);


/**
 * Question 5:
 * Write a function named "smallNumber" that compares two numbers and returns the smaller one. 
 */
function smallNumber(num1, num2) {
  if(num1 < num2) {
    return num1;
  }
  return num2;
}

console.log("Question 5: " + smallNumber(5, 10));

/**
 * Question 6:
 * Similar to question 5, write a function called "bigNumber" which returns the larger of the
 * two numbers passed in as arguments
 */
function bigNumber(num1, num2) {
  if(num1 > num2) {
    return num1;
  }
  return num2;
}

console.log("Question 6: " + bigNumber(5, 10));


/**
 * Question 7:
 * Write a function named "sumArray" that takes an array as its only argument
 * and finds the sum of all the numbers in an array. 
 * There is an array provided below to test with.
 * Hint: Use for loops!
 */
var testArray = [1, 5, 4, 3, 2, 9, 8, 7, 6, 10];
function addArray(a) {
  var sum = 0;
  for(var i = 0; i < a.length; i ++) {
    sum += a[i];
  }
  return sum;
}

console.log("Question 7: " + addArray(11));


/**
 * Question 8:
 * Now that you're a function writing master, write a function named "theBigOne" that finds the 
 * largest number in an array and returns it
 * Hint: You'll need to keep track of the largest number you found so far as 
 *       you step through the array
 */
function theBigOne(arr) {
  var big = arr[0]; // gotta start somewhere!
  
  for(var i = 1; i < arr.length; i ++) {
    if(arr[i] > big) { // is it bigger?
      big = arr[i]; // if so, we want to compare against that one.
    }
  }
  
  return big;
}

console.log("Question 8: " + theBigOne([1,2,3,4,6]));