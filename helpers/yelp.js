var yelp = {
  getRestaurants: function(request, sender_psid, message) {
    lat = message.attachments[0].payload.coordinates.lat;
    lng = message.attachments[0].payload.coordinates.long;

    let params = "latitude="+lat+"&longitude="+lng+"&categories=restaurants";
    let req_url = "https://api.yelp.com/v3/businesses/search?"+params;
    console.log(req_url);

    request({
        url: req_url,
        method: "GET"
      }, (err, res, body) => {
        if (!err) {
          var restaurants = JSON.parse(body);
          console.log(restaurants);
        } else {
          console.error("Unable to send message:" + err);
        }
      }
    );
  },
};

module.exports = yelp;