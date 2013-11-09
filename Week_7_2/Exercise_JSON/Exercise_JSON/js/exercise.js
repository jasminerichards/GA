/**
 * Javascript Exercise: JSON
 * Most of your answers should be stored in variables called q1, q2 etc..
 * Print the values of your variables to the console.
 */


/**
 * Question 1:
 * Define an object called "lunch" and store the following attributes in it:
 * - sandwich: "Peanut Butter"
 * - drink: "Apple Juice"
 * - price: 3.50
 */

var lunch = {
  sandwich: "Peanut Butter",
  drink: "Apple Juice",
  price: 3.50
};

console.log(lunch);
/**
 * Question 2
 * Convert lunch to JSON and store it in the variable 'q2'
 */
var q2 = JSON.stringify(lunch);
console.log(q2);
/**
 * Question 3
 * Using the methods dicussed in class, convert the JSON string stored in q2 
 * back into an object. Store it in 'q3'
 */
var q3 = JSON.parse(q2);
console.log(q3);
