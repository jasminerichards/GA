// Runner for the exercises

function check(num, answer) {
  if(answer) {
    document.write("<p>Question " + num + ": Correct!</p>");
  } else {
    document.write("<p style=\"color:red;\">Question " + num + ": Try Again.</p>");
  }
  document.write("<p>- - - - - - - - - - - - - - - - - - - - - -</p>");
}

function is_empty(obj) {
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  if (obj.length && obj.length > 0)    return false;
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key))    return false;
  }
  return true;
}

check("1", "q1" in window && typeof q1 == "function");
check("2", "q2" in window && "excitement" in window && typeof excitement == "function" && q2 == "Happy!");
check("3", "multiply" in window && typeof multiply == "function" && multiply.length == 3);
console.log("Quiz Checking Complete!");