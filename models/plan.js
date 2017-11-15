const db = require('../db/db.js').db;
const Plan = require('../db/db.js').Plan;

var create = function(ownerId, lat, lng, callBack) {
	var plan = new Plan({
		ownerId: ownerId,
		lat: lat,
		lng: lng,
		collabIds: []
	})

	plan.save(function(err) {
		if (err) {
			console.log(err)
		} else {
			console.log("Success")
			callBack(plan)
		}
	})
}

var find = function(id) {
	Plan.findOne({'_id' : id}, function(err, plan) {
		if(err) { 
			console.log(err)
		} else {
			return plan
		}
	})
}

module.exports.create = create
module.exports.find = find