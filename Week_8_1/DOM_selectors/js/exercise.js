/**
 * Javascript Exercise: DOM and jQuery!
 */

/**
 * Question 1:
 * Select all paragraphs on the page with jQuery. Store the results in q1.
 */
var q1 = $('p');



/**
 * Question 2:
 * Select all items on this page that have the class "title". Store that in q2.
 */

var q2 = $('.title');

/**
 * Question 3:
 * Select all img tags that are inside a figure tag. Store that in q3.
 */

var q3 = $('.wrapper figure img');


/**
 * Question 4: 
 * Select all list items that are in an order list that have the class "falseFact"
 */

var q4 = $('ol li.falseFact');

/**
 * Question 5:
 * Using jQuery, change the text in the header's h1 tag to "My Page"
 */

var q5 = $('header h1').html('My Page');

/**
 * Question 6:
 * Using jQuery, change the html content of all "blockquotes" to be "<span>no quote</span>"
 */

var q6 = $('blockquote').html('<span>no quote</span>');

/**
 * Question 7:
 * Using jQuery, change the color of all h2's to "green"
 */

var q7 = $('h2').css('color', 'green');

/**
 * Question 8:
 * Using jQuery, change the background color of the whole page to "pink"
 */

var q8 = $('body').css('background-color', 'pink');

/**
 * Question 9:
 * Using jQuery, select all paragraphs and change their color to blue and font to Georgia.
 * Try to do this with only one jQuery call. 
 */

var q9 = $('p').css({'color':'blue','font-family':'Georgia'}); 
