const request = require('request');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

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
  } else if (received_message.attachments) {
    console.log("Location Quick Reply received.");
    console.log(received_message.attachments);
    callSendAPI(sender_psid, {"text": "Finding Events!"});
    createEventList(sender_psid, received_message);
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
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

function createEventList(sender_psid, message) {
  lat = message.attachments[0].payload.coordinates.lat;
  lng = message.attachments[0].payload.coordinates.long;

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
          response = generateTMEventTemplate(events["_embedded"]["events"]);
          console.log(response);
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
        "template_type": "list",
        "top_element_style": "LARGE",
        "elements": elements
      }
    }
  }
}

function generateElementsJSON(events){
  let elements = [],
      chosenEvents = [];

  for (var i = 0; i < 4; i++) {
    let randomEventNum = Math.floor(Math.random()*events.length);
    while(chosenEvents.includes(randomEventNum)){
      randomEventNum = Math.floor(Math.random()*events.length);
    }
    chosenEvents.push(randomEventNum);
    let event = events[randomEventNum];
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
          "title": "Book Event"
        },
        {
          "type": "web_url",
          "title": "Refine Search",
          "url": "https://xandchill.herokuapp.com/refine.html",
          "webview_height_ratio": "tall",
          "messenger_extensions": true
        }
      ],
    })
  }
  console.log(chosenEvents);

  return elements
}