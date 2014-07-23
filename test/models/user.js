var mongoose = require('mongoose')
	, Schema = mongoose.Schema;

var UserSchema = mongoose.Schema({
	name: String,
	username: String,
	password: String,
	age: Number,
	device: [{
		model: String,
		color: Number
	}],
	cars: [{ type: Schema.Types.ObjectId, ref: 'Car' }]
});

var User = mongoose.model('User', UserSchema);

exports.getUser = function()
{
	return User;
}
