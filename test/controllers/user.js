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

	var users = null;

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

/*
 * [POST] CREATE AN ENTRY FOR User
 *
 * @param String name
 * @param String username
 * @param String email
 * @param String password
 * @param Number age
 *
 * @return User user
 */
exports.postUser = function(req, res)
{
	var data = req.body;

	var status = 200;
	var format = 'html';

	var user = null;

	async.series([

		function(callback)
		{
			if(data == null)
			{
				status = 400;
				callback(true);
			}
			else if(data.name === undefined)
			{
				status = 400;
				callback(true);
			}
			else if(data.username === undefined)
			{
				status = 400;
				callback(true);
			}
			else if(data.email === undefined)
			{
				status = 400;
				callback(true);
			}
			else if(data.password === undefined)
			{
				status = 400;
				callback(true);
			}
			else if(data.age === undefined)
			{
				status = 400;
				callback(true);
			}
			else 
			{
				callback();
			}
		},
		function(callback)
		{
			User
			.findOne({
				username : data.username,
				email : data.email
			})
			.exec(function(err, retData))
			{
				if(retData != null)
				{
					status = 400;
					callback(true);
				}
				else
				{
					callback();
				}
			});
		},
		function(callback)
		{
			user = new User({
				name = data.name,
				username = data.username,
				email = data.email,
				password = data.password,
				age = data.age,
			});

			user.save(function(err, retData)
			{
				user = retData;

				callback();
			});
		}
	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send(user);
		else
			res.render('postUser', { data : user });
	});
};

