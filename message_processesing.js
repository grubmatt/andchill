const facebook = require('./helpers/facebook.js');
const ticketmaster = require('./helpers/ticketmaster.js');
const yelp = require('./helpers/yelp.js');

module.exports.handleMessage = function(sender_psid, received_message) {
  if (received_message.text) {
    console.log("Text Message received.");
    let response = {
      "text": "Would you like to share your location?",
      "quick_replies":[
        {
          "content_type":"location"
        }
      ]
    }
    // Send the response message
    facebook.callSendAPI(sender_psid, response);
  } else if (received_message.attachments[0].type=='location') {
    console.log("Location Quick Reply received.");
    console.log(received_message.attachments);

    facebook.callSendAPI(sender_psid, {"text": "Finding Events!"});
    yelp.getRetaurants(sender_psid, received_message);
    //ticketmaster.createEventList(facebook, sender_psid, received_message);
  } else {
    console.log("Unknown message type, message: " + received_message);
  }
}

module.exports.handlePostback = function(sender_psid, received_postback) {
  console.log("Postback received");
  let response;
  let payload = received_postback.payload;
}