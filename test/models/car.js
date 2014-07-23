var mongoose = require('mongoose')
	, Schema = mongoose.Schema;

var CarSchema = mongoose.Schema({
	name: String,
	model: String,
	owner: { type: Schema.Types.ObjectId, ref: 'User' }
});

var Car = mongoose.model('Car', CarSchema);

exports.getCar = function()
{
	return Car;
}
