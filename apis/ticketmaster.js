// API Ref: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
// https://developer.ticketmaster.com/api-explorer/v2/
const request = require('request');

var ticketmaster = {
  createEventList: function(facebook, sender_psid, message) {
    lat = message.attachments[0].payload.coordinates.lat;
    lng = message.attachments[0].payload.coordinates.long;

    let params = "radius=25&units=miles&latlong="+lat+","+lng+"&apikey="+process.env.TICKETMASTER_APIKEY;
    let req_url = "https://app.ticketmaster.com/discovery/v2/events.json?"+params;
    console.log(req_url);

    request({
        url: req_url,
        method: "GET"
      }, (err, res, body) => {
        if (!err) {
          var events = JSON.parse(body);
          // Guards against no events being returned
          if (events["_embedded"] && events["_embedded"]["events"].length > 0) {
            console.log('ticketmaster requested!');
            response = this.generateEventListTemplate(events["_embedded"]["events"]);
            console.log(response);
          } else {
            response = { "text": "Sorry we couldnt find any events" };
          }
          facebook.callSendAPI(sender_psid, response);
        } else {
          console.error("Unable to send message:" + err);
        }
      }
    );
  },
  generateEventListTemplate: function(events) {
    return { 
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "list",
          "top_element_style": "compact",
          "elements": this.generateElements(events),
          "buttons": [
            {
              "type": "web_url",
              "title": "Refine Search",
              "url": "https://xandchill.herokuapp.com/refine.html",
              "webview_height_ratio": "tall",
              "messenger_extensions": true
            }
          ]  
        }
      }
    }
  },
  generateElements: function (events){
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
        "image_url": event["images"][0]["url"],
        "default_action": {
          "type": "web_url",
          "url": event["url"],
          "messenger_extensions": false,
          "webview_height_ratio": "compact"
        }
      })
    }
    return elements;
  },
}

module.exports = ticketmaster;