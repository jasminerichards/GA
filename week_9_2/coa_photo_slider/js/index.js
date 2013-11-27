$(document).ready(function()  {
  var theImage = $('ul li img');
  console.log(theImage);
  var theWidth = theImage.width();
  var currMarg = 0;
  var newMarg;

  //get total of image sizes and set as width for ul 
  var totalWidth = theImage.length * theWidth;
  $('ul.gallery').css('width', theImage);

  $('.next').click(function(){
    if(currMarg - theWidth != -totalWidth) {
      newMarg = currMarg - theWidth;
    } else {
      newMarg = 0;
    }
    updatePosition();
  });
  $('.prev').click(function(){
    if(currMarg !== 0) {
      newMarg = currMarg + theWidth;
    } else {
      newMarg = -totalWidth + theWidth;
    }
    updatePosition();
  });
  var updatePosition = function() {
    $('ul.gallery').animate({ "margin-left": (newMarg)	 }, 300);
    currMarg = newMarg;
  }
});