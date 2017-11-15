const db = require('../db/db.js').db;
const Plan = require('../db/db.js').Plan;

var create = function(ownerId, lat, lng) {
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
		}
	})
}

module.exports.create = create