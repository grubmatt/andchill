const db = require('../db/db.js').db;
const Event = require('../db/db.js').Event;

var create = function(event) {
	var event = new Event(event);

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