const db = require('../db/db.js').db;
const Event = require('../db/db.js').Event;

var create = function(restaurant, planId) {
	var event = new Event({
		title: restaurant["name"],
		image_url: restaurant["image_url"],
		url: restaurant["url"],
		planId: planId
	})

	event.save(function(err) {
		if (err) {
			console.log(err)
		} else {
			console.log("Success")
		}
	})
}

var find = function(id, callback) {
	Event.find({'planId' : id}, function(err, events) {
		if(err) { 
			console.log(err)
		} else {
			callback(events)
		}
	})
}

module.exports.create = create
module.exports.find = find