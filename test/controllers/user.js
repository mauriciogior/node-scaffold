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
				if(data.format == 'json')
					format = data.format;
				callback();
			}
		},
		function(callback)
		{
			User
			.findOne({
				$or : [
					{ username : data.username },
					{ email : data.email }
				]
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
			res.render('getUser', { data : user });
	});
};

/*
 * [GET] GET SINGLE ENTRY FOR User
 *
 * @return User user
 */
exports.getUser = function(req, res)
{
	var id = req.params.id;
	var data = req.body;

	var status = 200;
	var format = 'html';

	var user = null;

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
			.findOne({ _id : id })
			.exec(function(err, retData))
			{
				user = retData;

				callback()
			}
		}

	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send(user);
		else
			res.render('getUser', { data : user });
	});
};

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
 * [PUT] EDIT AN ENTRY FOR User
 *
 * @param [opt] String name
 * @param [opt] String username
 * @param [opt] String email
 * @param [opt] String password
 * @param [opt] Number age
 *
 * @return User user
 */
exports.putUser = function(req, res)
{
	var id = req.params.id;
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
			else
			{
				if(data.format == 'json')
					format = data.format;
				callback();
			}
		},
		function(callback)
		{
			User
			.findOne({ _id : id })
			.exec(function(err, retData)
			{
				if(retData == null)
				{
					status = 400;
					callback(true);
				}
				else
				{
					user = retData;

					callback();
				}
			});
		},
		function(callback)
		{
			if(data.name !== undefined)
			{
				user.name = name;
			}
			if(data.username !== undefined)
			{
				user.username = username;
			}
			if(data.email !== undefined)
			{
				user.email = email;
			}
			if(data.password !== undefined)
			{
				user.password = password;
			}
			if(data.age !== undefined)
			{
				user.age = age;
			}
		},
		function(callback)
		{
			User
			.findOne({
				$or : [
					{ username : data.username },
					{ email : data.email }
				]
			})
			.exec(function(err, retData)
			{
				if(retData != null)
				{
					if(retData._id != user._id)
					{
						status = 400;
						callback(true);
					}
					else
					{
						callback();
					}
				}
				else
				{
					callback();
				}
			});
		},
		function(callback)
		{
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
			res.render('getUser', { data : user });
	});
};

/*
 * [DELETE] DELETE AN ENTRY FOR User
 *
 * @return null
 */
exports.deleteUser = function(req, res)
{
	var id = req.params.id;

	var status = 200;
	var format = 'html';

	var user = null;

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
			.findOne({ _id : id })
			.exec(function(err, retData)
			{
				if(retData == null)
				{
					status = 400;
					callback(true);
				}
				else
				{
					user = retData;

					callback();
				}
			});
		},
		function(callback)
		{
			user.remove(function(err, retData)
			{
				callback();
			});
		}
	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send('');
		else
			res.render('deleteUser', { data : user });
	});
};

