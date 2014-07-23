var mongoose = require('mongoose')
	, Schema = mongoose.Schema;

var PersonSchema = mongoose.Schema({
	name: String,
	username: String,
	email: String,
	password: String,
	age: Number,
	octopi: [{
		model: String,
		color: Number
	}]
});

var Person = mongoose.model('Person', PersonSchema);

exports.getPerson = function()
{
	return Person;
}
