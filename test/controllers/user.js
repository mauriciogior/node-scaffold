/*
 * EXTENSIONS
 */
var jade = require('jade')
  , async = require('async')
  , userModel = require('../models/user.js');

/*
 * MODELS
 */
var User = userModel.getUser();

/*
 * [GET] FORM CREATE AN ENTRY FOR User
 *
 *
 * @return User user
 */
exports.getNewUserForm = function(req, res)
{
	res.status(200).render('user/create');
};

/*
 * [POST] CREATE AN ENTRY FOR User
 *
 * @param String name
 * @param String username
 * @param String password
 * @param Number age
 * @param Car car
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
			else if(data.car === undefined)
			{
				status = 400;
				callback(true);
			}
			else 
			{
				if(req.query.format != null && req.query.format == 'json')
					format = req.query.format;
				callback();
			}
		},
		function(callback)
		{
			User
			.findOne({
				$or : [
					{ username : data.username }
				]
			})
			.exec(function(err, retData)
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
				name : data.name,
				username : data.username,
				password : data.password,
				age : data.age,
				car : data.car,
			});

			user.save(function(err, retData)
			{
				user = retData;

				if(err != null)
				{
					status = 400;
					callback(true);
				}

				else
				{
					var options = [{
						path: 'car',
						model: 'Car',
					}]

					User
					.populate(user, options, function(err, retData)
					{
						user = retData;

						callback();
					});
				}
			});
		}
	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send(user);
		else
		{
			if(status != 200)
				res.status(200).render('user/create', { error : true });
			else
				res.status(status).render('user/get-single', { user : user });
		}
	});
};

/*
 * [GET] FORM CREATE AN ENTRY OF DEVICES FOR User
 *
 *
 * @return User user
 */
exports.getNewInternDevicesForm = function(req, res)
{
	var id = req.params.id;

	User
	.findOne({ _id : id })
	.exec(function(err, retData)
	{
		if(retData == null)
			res.status(404).render('user/not-found');
		else
			res.status(200).render('user/create-devices', { user : retData });
	});
};

/*
 * [POST] CREATE AN ENTRY OF DEVICES FOR User
 *
 * @param String model
 * @param Number color
 *
 * @return User user
 */
exports.postNewInternDevicesForm = function(req, res)
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
			else if(data.model === undefined)
			{
				status = 400;
				callback(true);
			}
			else if(data.color === undefined)
			{
				status = 400;
				callback(true);
			}
			else
			{
				if(req.query.format != null && req.query.format == 'json')
					format = req.query.format;
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
			var devices = {};

			devices.model = data.model;
			devices.color = data.color;

			if(user.devices === undefined)
				user.devices = [];

			user.devices.push(devices);

			callback();
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
			res.redirect('/user/'+user._id);
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
	var status = 200;
	var format = 'html';

	var user = null;

	async.series([

		function(callback)
		{
			if(req.query.format != null && req.query.format == 'json')
				format = req.query.format;
			callback();
		},
		function(callback)
		{
			User
			.findOne({ _id : id })
			.populate('car')
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
		}

	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send(user);
		else
		{
			if(invalid)
				res.status(status).render('user/not-found');
			else
				res.status(status).render('user/get-single', { user : user });
		}
	});
};

/*
 * [GET] GET ALL ENTRIES FOR User
 *
 * @return User user
 */
exports.getUsers = function(req, res)
{
	var status = 200;
	var format = 'html';

	var users = null;

	async.series([

		function(callback)
		{
			if(req.query.format != null && req.query.format == 'json')
				format = req.query.format;
			callback();
		},
		function(callback)
		{
			User
			.find()
			.populate('car')
			.exec(function(err, retData)
			{
				users = retData;

				callback()
			});
		}

	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send(users);
		else
			res.status(status).render('user/get-all', { users : users });
	});
};

/*
 * [GET] FORM EDIT AN ENTRY FOR User
 *
 *
 * @return View
 */
exports.getEditUserForm = function(req, res)
{
	var id = req.params.id;

	User
	.findOne({ _id : id })
	.exec(function(err, retData)
	{
		if(retData == null)
			res.status(404).render('user/not-found');
		else
			res.status(200).render('user/update', { user : retData });
	});
};

/*
 * [PUT] EDIT AN ENTRY FOR User
 *
 * @param [opt] String name
 * @param [opt] String username
 * @param [opt] String password
 * @param [opt] Number age
 * @param [opt] {Ref} car
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
				if(req.query.format != null && req.query.format == 'json')
					format = req.query.format;
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
				user.name = data.name;
			}
			if(data.username !== undefined)
			{
				user.username = data.username;
			}
			if(data.password !== undefined)
			{
				user.password = data.password;
			}
			if(data.age !== undefined)
			{
				user.age = data.age;
			}
			if(data.car !== undefined)
			{
				user.car = data.car;
			}

			callback();
		},
		function(callback)
		{
			User
			.findOne({
				$or : [
					{ username : data.username }
				]
			})
			.exec(function(err, retData)
			{
				if(retData != null)
				{
					if(!retData._id.equals(user._id))
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
			res.status(status).render('user/get-single', { user : user });
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
			if(req.query.format != null && req.query.format == 'json')
				format = req.query.format;
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
			res.status(status).render('user/delete');
	});
};

/*
 * [DELETE] DELETE AN ENTRY OF DEVICES FOR User
 *
 *
 * @return User user
 */
exports.deleteInternDevices = function(req, res)
{
	var id = req.params.id;
	var index = req.params.index;
	var status = 200;
	var format = 'html';

	var user = null;

	async.series([

		function(callback)
		{
			if(req.query.format != null && req.query.format == 'json')
				format = req.query.format;
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
			user.devices.splice(index, 1);

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
			res.redirect('/user/'+user._id);
	});
};

