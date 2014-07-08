/*
 * EXTENSIONS
 */
var async = require('async')
	, userModel = require('../models/user.js');

/*
 * MODELS
 */
var User = userModel.getUser();

/*
 * [GET] GET ALL ENTRIES FOR User
 *
 * @return User user
 */
exports.getUsers = function(req, res)
{
	var data = req.body;

	var status = 200;
	var format = 'html';

	var users;

	async.series([

		function(callback)
		{
			if(data != null && data.format == 'json')
				format = data.format;
			callback();
		},
		function(callback)
		{
			User
			.find()
			.exec(function(err, retData))
			{
				users = retData;

				callback()
			}
		}

	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send(users);
		else
			res.render('getUsers', { data : users });
	});
};

