const facebook = require('./apis/facebook.js');
const ticketmaster = require('./apis/ticketmaster.js');
const yelp = require('./apis/yelp.js');
const Plan = require('./models/plan.js');


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
    Plan.create(sender_psid, received_message.attachments[0].payload.coordinates.lat, received_message.attachments[0].payload.coordinates.lat, (plan) => {
      facebook.callSendAPI(sender_psid, createResponse(plan._id))
    });
    // NOTE: We might want to be doing these calls later on
    // facebook.callSendAPI(sender_psid, {"text": "Finding Events and Restaurants!"});
    yelp.createRestaurantList(facebook, sender_psid, received_message);
    // ticketmaster.createEventList(facebook, sender_psid, received_message);
  } else {
    console.log("Unknown message type, message: " + received_message);
  }
}

function createResponse(id) {

  return {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Share",
            "subtitle": "Share the plan with your group",
            "buttons": [
              {
                "type": "web_url",
                "title": "Share",
                "url": "https://35dc912e.ngrok.io/plan/"+id,
                "webview_height_ratio": 'tall',
                "messenger_extensions": true
              }
            ],
          }]
        }
      }}
}

module.exports.handlePostback = function(sender_psid, received_postback) {
  console.log("Postback received");
  let response;
  let payload = received_postback.payload;
}