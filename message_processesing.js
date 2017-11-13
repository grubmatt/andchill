const request = require('request');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
var ticketmaster = require('helpers/ticketmaster.js');

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
    callSendAPI(sender_psid, response);
  } else if (received_message.attachments[0].type=='location') {
    console.log("Location Quick Reply received.");
    console.log(received_message.attachments);
    callSendAPI(sender_psid, {"text": "Finding Events!"});
    ticketmaster.createEventList(request, sender_psid, received_message);
  } else {
    console.log("Unknown message type, message: " + received_message);
  }
}

module.exports.handlePostback = function(sender_psid, received_postback) {
  console.log("Postback received");
  let response;
  let payload = received_postback.payload;

}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN,
            "whitelisted_domains":[
              "https://xandchill.herokuapp.com"
            ]
          },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}