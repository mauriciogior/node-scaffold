var mongoose = require('mongoose')
	, Schema = mongoose.Schema;

var UserSchema = mongoose.Schema({
	name: String,
	username: String,
	password: String,
	age: Number,
	devices: [{
		model: String,
		color: Number
	}]
});

var User = mongoose.model('User', UserSchema);

exports.getUser = function()
{
	return User;
}
