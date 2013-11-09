/**
 * Javascript Exercise: Objects
 Answer the following questions and print the variable (q1, q2 etc to the console).
 */

/**
 * Question 1:
 * In variable named 'q1' create and store an empty object.
 * Store it in a variable named 'q1'.
 */
var q1 = {};
console.log('Question 1: ' + q1);

/**
 * Question 2:
 * In variable named 'q2', create an object with a signle attribute called 'pages' whose value is 215
 * Store the object in a variable named 'q2'.
 */
var q2 = {
  pages: 215
};
console.log('Question 2: ' + q2);
/**
 * Question 3:
 * Create and object with two attributes: pages = 256 and title = "Javascript is Cool, bro"
 * Store it in a variable named 'q3'.
 */
var q3 = {
  pages: 256,
  title: "Javascript is Cool, bro"
};
console.log('Question 3: ' + 3);
/**
 * Question 4:
 * Below you will find an object named "car". Store the color of the car in the variable 'q4'
 */
var car = {
  color: "red",
  model: "sedan",
  year: 1999
};
var q4 = car.color;
console.log('Question 4: ' + q4);

/**
 * Question 5:
 * Now, change the color of the car to "Racing Green" and then store that value in the variable 'q5'
 */
car.color = "Racing Green";
var q5 = car.color;
console.log('Question 5: ' + q5);

/**
 * Question 6:
 * Store the name of the 'user' in a variable named 'q6'
 */
var user = {
  'user-name': 'Marc Jacobs',
  'age': 30
};
var q6 = user['user-name'];
console.log('Question 6: ' + q6);

/**
 * Question 7
 * Assing the 'user' object to a new attribute in the 'car' called 'passenger'. As in "a car has a passenger"
 * Store the age of the passenger in the variable 'q7'
 */
car.passenger = user;
var q7 = car.passenger.age;
console.log('Question 7: ' + q7);