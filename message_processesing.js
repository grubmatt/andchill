const request = require('request');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

module.exports.handleMessage = function(sender_psid, received_message) {
  let response = "Error";
  console.log("message received.");
  console.log(received_message);
  console.log(received_message.text);

  if (received_message.text) {
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "What would you like to do?",
            "subtitle": "Select an Option",
            "buttons": [
              {
                "type": "postback",
                "title": "See a Movie!",
                "payload": "movie",
              },
              {
                "type": "postback",
                "title": "Go to a Concert!",
                "payload": "concert"
              },
              {
                "type": "web_url",
                "title": "Random Event!",
                "url": "https://xandchill.herokuapp.com/random.html",
                "webview_height_ratio": 'tall',
                "messenger_extensions": true
              }
            ],
          }]
        }
      }
    }
  }
  
  // Send the response message
  callSendAPI(sender_psid, response);    
}

module.exports.handlePostback = function(sender_psid, received_postback) {
  console.log("Postback received");
  let response;
  // Get the payload for the postback
  let payload = received_postback.payload,
      apikey = process.env.TICKETMASTER_APIKEY,
      req_url = "https://app.ticketmaster.com/discovery/v2/events.json?postalCode=15222&apikey="+apikey;

  // Set the request url based on the postback payload
  // API Ref: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
  if (payload === "concert") {
    req_url += "classificationName=music";
  } else if (payload === "movie") {
    req_url += "classificationName=film";
  } else if (payload === "random") {
    // Start Date    End Date    
    //requrl == "startDateTime=2017-10-23T12:00:00Z&endDateTime=2017-10-31T23:00:00Z"
  }

  request({
      url: req_url,
      method: "GET"
    }, (err, res, body) => {
      if (!err) {
        var events = JSON.parse(body);
        if (events["_embedded"] && events["_embedded"]["events"].length > 0) {
          console.log('ticketmaster requested!');
          response = generateTMEventTemplate(events["_embedded"]["events"], payload);
        } else {
          response = { "text": "Sorry we couldnt find any events" };
        }
        callSendAPI(sender_psid, response);
      } else {
        console.error("Unable to send message:" + err);
      }
    });
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

function generateTMEventTemplate(events, payload) {
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