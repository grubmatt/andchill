const db = require('../db/db.js').db;
const Plan = require('../db/db.js').Plan;
const Yelp = require('../apis/yelp.js');
const TM = require('../apis/ticketmaster.js');

var create = function(ownerId, lat, lng, price, rating, date, callBack) {
	var plan = new Plan({
		ownerId: ownerId,
		lat: lat,
		lng: lng,		
		price: price,
		rating: rating, 
		date: date,
		collabIds: []
	})

	plan.save(function(err) {
		if (err) {
			console.log(err)
		} else {
			console.log("Success")
			Yelp.makeYelpCall(plan._id, lat, lng, price, "restaurants");
			Yelp.makeYelpCall(plan._id, lat, lng, price, "bars");
			TM.makeTMCall(plan._id, lat, lng, price, "sports");
			TM.makeTMCall(plan._id, lat, lng, price, "concert");
			callBack(plan)
		}
	})
}

var find = function(id, callback) {
	Plan.findOne({'_id' : id}, function(err, plan) {
		if(err) { 
			console.log(err)
		} else {
			callback(plan)
		}
	})
}

module.exports.create = create
module.exports.find = find