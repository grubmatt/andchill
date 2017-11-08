const request = require('request');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

module.exports.handleMessage = function(sender_psid, received_message) {
  if (received_message.text) {
    console.log("Text Message received.");
    let response = {
      "text": "Please share your location",
      "quick_replies":[
        {
          "content_type":"location"
        }
      ]
    }
    // Send the response message
    callSendAPI(sender_psid, response);
  } else if (received_message.attachments) {
    console.log("Location Quick Reply received.");
    createEventList(sender_psid, received_message);
  } else {
    console.log("Unknown message type, message: " + received_message);
  }
}

module.exports.handlePostback = function(sender_psid, received_postback) {
  console.log("Postback received");
  let response;
  // Get the payload for the postback
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
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

function createEventList(sender_psid, message) {
  lat = message.attachments[0].payload.coordinates.lat
  lng = message.attachments[0].payload.coordinates.long

  let params = "radius=25&units=miles&latlong="+lat+","+lng+"&apikey="+process.env.TICKETMASTER_APIKEY;
  let req_url = "https://app.ticketmaster.com/discovery/v2/events.json?"+params;
  console.log(req_url);

  // API Ref: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
  // https://developer.ticketmaster.com/api-explorer/v2/
  request({
      url: req_url,
      method: "GET"
    }, (err, res, body) => {
      if (!err) {
        var events = JSON.parse(body);
        if (events["_embedded"] && events["_embedded"]["events"].length > 0) {
          console.log('ticketmaster requested!');
          let event_num = Math.floor(Math.random()*events["_embedded"]["events"].length)
          let event = events["_embedded"]["events"][event_num];
          response = generateTMEventTemplate(events["_embedded"]["events"]);
        } else {
          response = { "text": "Sorry we couldnt find any events" };
        }
        callSendAPI(sender_psid, response);
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

function generateTMEventTemplate(events) {
  // Generates a Generic Template for a TicketMaster Event
  elements = generateElementsJSON(events);
  return {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": elements
      }
    }
  }
}

function generateElementsJSON(events){
  let elements = [];
  let maxEvents = 5;
  if (events.length < 5) {
    maxEvents = events.length;
  }

  for (var i = 0; i < maxEvents; i++) {
    let event  = events[i];
    elements.push({
      "title": event["name"],
      "subtitle": "Click the picture to learn more!",
      "image_url": event["images"][0]["url"],
      "default_action": {
        "type": "web_url",
        "url": event["url"],
        "messenger_extensions": false,
        "webview_height_ratio": "compact"
      },
      "buttons": [
        {
          "type":"web_url",
          "url": event["url"],
          "title": "Get Tickets"
        }
      ],
    })
  }

  return elements
}