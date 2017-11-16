var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');    

var uri = 'mongodb://admin:andChillAdmin@ds259305.mlab.com:59305/and_chill';

mongoose.Promise = global.Promise

mongoose.connect(uri);

var db = mongoose.connection;

autoIncrement.initialize(db);

db.on('error', console.error.bind(console, 'connection error:'));


// Create Plan schema
var planSchema = mongoose.Schema({
ownerId: String,
lat: String,
lng: String,
collabIds: [String]
});

var eventSchema = mongoose.Schema({
	title: String,
	planId: Number,
	image_url: String,
	url: String
})

eventSchema.plugin(autoIncrement.plugin, 'Event');
var Event = mongoose.model('Event', eventSchema);

planSchema.plugin(autoIncrement.plugin, 'Plan');
var Plan = mongoose.model('Plan', planSchema);

module.exports.db = db;
module.exports.Plan = Plan;
module.exports.Event = Event;