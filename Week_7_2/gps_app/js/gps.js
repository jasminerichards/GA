$(document).ready(function() {

  var watchID;
  var geoLoc;

  getLocationUpdate();

});


function showLocation(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  $('p#info').html("OK, we've got you");
  $('span#latitude').html("Latitude: "+latitude);
  $('span#longitude').html("Longitude: "+longitude);
  console.log("Latitude : " + latitude + " Longitude: " + longitude);
}

function errorHandler(err) {
  if(err.code == 1) {
    $('p#error').html("Error: Access is denied!");
  }else if( err.code == 2) {
    $('p#error').html("Error: Position is unavailable!");
  }
}
function getLocationUpdate(){

   if(navigator.geolocation){
      // timeout at 60000 milliseconds (60 seconds)
      var options = {timeout:60000};
      geoLoc = navigator.geolocation;
      watchID = geoLoc.watchPosition(showLocation, 
                                     errorHandler,
                                     options);
   }else{
      $('p#error').html("Sorry, browser does not support geolocation!");
   }
}
