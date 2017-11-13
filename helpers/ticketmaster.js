// API Ref: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
// https://developer.ticketmaster.com/api-explorer/v2/

var ticketmaster = {
  str: "",
  generateEventListTemplate: function(events) {
    return { 
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "list",
          "top_element_style": "compact",
          "elements": generateElements(events),
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