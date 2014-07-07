var mongoose = require('mongoose')
	, Schema = mongoose.Schema;

var CarSchema = mongoose.Schema({
	name: String,
	username: String,
	password: String,
	age: Number,
	devices: [{
		model: String,
		color: Number
	}]
});

var Car = mongoose.model('Car', CarSchema);

exports.getCar = function()
{
	return Car;
}
