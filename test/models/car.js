var mongoose = require('mongoose')
	, Schema = mongoose.Schema;

var CarSchema = mongoose.Schema({
	name: String,
	model: String,
	owners: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

var Car = mongoose.model('Car', CarSchema);

exports.getCar = function()
{
	return Car;
}
