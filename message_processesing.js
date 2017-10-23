const request = require('request');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

module.exports.handleMessage = function(sender_psid, received_message) {
  let response;
  console.log("message received.");

  if (received_message.quick_reply) {
    if (received_message.quick_reply.payload === "yes") {
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
                  "payload": "concert",
                },
                {
                  "type": "postback",
                  "title": "Random Event!",
                  "payload": "random",
                }
              ],
            }]
          }
        }
      }
    } else {
      response = { "text": "How may I help you" };
    }
  } else if (received_message.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    response = {
      "text": 'Would you like to create a plan?',
      "quick_replies":[
      {
        "content_type":"text",
        "title":"Yes",
        "payload":"yes"
      },
      {
        "content_type":"text",
        "title":"No",
        "payload":"no"
      }]
    }
  }
  
  // Send the response message
  callSendAPI(sender_psid, response);    
}

module.exports.handlePostback = function(sender_psid, received_postback) {
  console.log("Postback received");
  let response, req_url;
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
        console.log("Number of Events: " + events["_embedded"]["events"].length);
        if (events["_embedded"]["events"].length > 0) {
          console.log('ticketmaster requested!');
          let event_num = Math.floor(Math.random()*events["_embedded"]["events"].length)
          let event = events["_embedded"]["events"][event_num];
          response = generateTMEventTemplate(event, payload);
        } else {
          response = { "text": "Sorry we couldnt find any events within the week" };
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

function generateTMEventTemplate(event, payload) {
  // Generates a Generic Template for a TicketMaster Event
  return {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": event["name"],
          "subtitle": "How is this event?",
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
              "title": "This is great"
            },
            {
              "type": "postback",
              "title": "Try another",
              "payload": payload
            }
          ],
        }]
      }
    }
  }
}