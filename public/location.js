var lat = 0;
var lng = 0;
var curLat = 0;
var curLng = 0;
var ownerId = 0;
var placesAutocomplete;


$( document ).ready(function() {

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(setUpPlaces);
        } else {
          var placesAutocomplete = places({
            container: document.querySelector('#address-input')
          });

          placesAutocomplete.on('change', handleChange);
        }


       $( function() {
          $( "#datepicker" ).datepicker();
        } );

      (function(d, s, id){
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) {return;}
          js = d.createElement(s); js.id = id;
          js.src = "//connect.facebook.com/en_US/messenger.Extensions.js";
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'Messenger'));


      window.extAsyncInit = function() {
        // the Messenger Extensions JS SDK is done loading 
        MessengerExtensions.getContext('1764115690549821', 
          function success(thread_context){
           ownerId = thread_context.psid
          },
          function error(err){
            // error
            console.log("Error")
            console.log(err)
          }
        );
      };

      

 });


function setUpPlaces(position) {
  placesAutocomplete = places({
    container: document.querySelector('#address-input'),
    aroundLatLng: position.coords.latitude + "," + position.coords.longitude
  });
  curLat = position.coords.latitude
  curLng = position.coords.longitude
  placesAutocomplete.setVal("Current Location")
  placesAutocomplete.on('change', handleChange);
}

function createPlan() {
  console.log()
  if($('#address-input').val() == "Current Location") {
    lat = curLat
    lng = curLng
  }
  $.ajax({
        url: 'new/plan/'+ownerId+"/"+lat+"/"+lng,
        type: 'PUT',
        success: function(result) {
          console.log(result)
          beginShare(result._id)
            // $("#result").html(JSON.stringify(result))
          }
      });
}


function handleChange(e) {
  lat = e.suggestion.latlng.lat
  lng = e.suggestion.latlng.lng
}

function beginShare(id){
        var message = {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: [{
                title: "title",
                subtitle: 'A shared Plan',
                default_action: {
                  type: 'web_url',
                  url: "https://b9cdd51b.ngrok.io/plan/"+id,
                  messenger_extensions: true,
                },
                buttons: [
              {
                "type": "web_url",
                "title": "View Events",
                "url": "https://b9cdd51b.ngrok.io/plan/"+id,
                "webview_height_ratio": 'tall',
                "messenger_extensions": true
              }
            ],
              }],
            },
          },
        };

        MessengerExtensions.beginShareFlow(function(share_response) {
          // User dismissed without error, but did they share the message?
          if(share_response.is_sent){
            // The user actually did share. 
            // Perhaps close the window w/ requestCloseBrowser().
            console.log("hjasdfasdf")
          }
        }, 
        function(errorCode, errorMessage) {      
        // An error occurred in the process
        console.log(errorMessage);

        },
        message,
        "current_thread");
      }