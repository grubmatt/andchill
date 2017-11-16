//API Ref: https://www.yelp.com/developers/documentation/v3/
const request = require('request');
const ENV = require('../env.js')
const Event = require('../models/event.js')

var yelp = {
  createRestaurantList: function(facebook, sender_psid, message, planId) {
    lat = message.attachments[0].payload.coordinates.lat;
    lng = message.attachments[0].payload.coordinates.long;

    let params = "latitude="+lat+"&longitude="+lng+"&categories=restaurants";
    let req_url = "https://api.yelp.com/v3/businesses/search?"+params;
    console.log(req_url);

    request({
        url: req_url,
        method: "GET",
        "auth": {
          "bearer": ENV.YELP_ACCESS_KEY
        }
      }, (err, res, body) => {
        if (!err) {
          var restaurants = JSON.parse(body);
          // console.log(restaurants);
          // Guards against no restaurants being returned
          if (restaurants["businesses"].length > 0) {
            console.log('yelp requested!');
            response = this.generateEventListTemplate(restaurants["businesses"], planId);
            // console.log(response);
          } else {
            response = { "text": "Sorry we couldnt find any restaurants!" };
          }
          facebook.callSendAPI(sender_psid, response);
        } else {
          console.error("Unable to send message:" + err);
        }
      }
    );
  },
  generateEventListTemplate: function(restaurants, planId) {
    var elements = this.generateElements(restaurants, planId)
    var url = "https://35dc912e.ngrok.io/restaurants/"+planId
    return { 
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "list",
          "top_element_style": "compact",
          "elements": elements,
          "buttons": [
            {
              "type": "web_url",
              "title": "Refine Search",
              "url": url,
              "webview_height_ratio": "tall",
              "messenger_extensions": true
            }
          ]  
        }
      }
    }
  },
  generateElements: function (restaurants, planId){
    let elements = [],
        chosenRestaurants = [];

    for (var i = 0; i < 4; i++) {
      let randomRestaurantNum = Math.floor(Math.random()*restaurants.length);
      while(chosenRestaurants.includes(randomRestaurantNum)){
        randomRestaurantNum = Math.floor(Math.random()*restaurants.length);
      }
      chosenRestaurants.push(randomRestaurantNum);
      let restaurant = restaurants[randomRestaurantNum];
      Event.create(restaurant, planId);
      elements.push({
        "title": restaurant["name"],
        "image_url": restaurant["image_url"],
        "default_action": {
          "type": "web_url",
          "url": restaurant["url"],
          "messenger_extensions": false,
          "webview_height_ratio": "compact"
        }
      })
    }
    return elements;
  }
};

function buildUrl(elements) {
  var url = "https://35dc912e.ngrok.io/restaurants?array="
  for(var i = 0; i < elements.length; i++) {
    url = url + "|" +JSON.stringify(elements[i])
  }
  console.log(url)
  return url
}

module.exports = yelp;