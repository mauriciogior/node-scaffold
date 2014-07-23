/*
 * EXTENSIONS
 */
var jade = require('jade')
	, async = require('async')
	, personModel = require('../models/person.js');

/*
 * MODELS
 */
var Person = personModel.getPerson();

/*
 * [GET] FORM CREATE AN ENTRY FOR Person
 *
 *
 * @return Person person
 */
exports.getNewPersonForm = function(req, res)
{
	res.status(200).render('person/create');
};

/*
 * [POST] CREATE AN ENTRY FOR Person
 *
 * @param String name
 * @param String username
 * @param String email
 * @param String password
 * @param Number age
 *
 * @return Person person
 */
exports.postPerson = function(req, res)
{
	var data = req.body;

	var status = 200;
	var format = 'html';

	var person = null;

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
				if(req.query.format != null && req.query.format == 'json')
					format = req.query.format;
				callback();
			}
		},
		function(callback)
		{
			Person
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
			person = new Person({
				name : data.name,
				username : data.username,
				email : data.email,
				password : data.password,
				age : data.age,
			});

			person.save(function(err, retData)
			{
				person = retData;

				if(err != null)
				{
					status = 400;
					callback(true);
				}

				callback();
			});
		}
	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send(person);
		else
		{
			if(status != 200)
				res.status(200).render('person/create', { error : true });
			else
				res.status(status).render('person/get-single', { person : person });
		}
	});
};

/*
 * [GET] FORM CREATE AN ENTRY OF OCTOPUS FOR Person
 *
 *
 * @return Person person
 */
exports.getNewInternOctopusForm = function(req, res)
{
	var id = req.params.id;

	Person
	.findOne({ _id : id })
	.exec(function(err, retData)
	{
		if(retData == null)
			res.status(404).render('person/not-found');
		else
			res.status(200).render('person/create-octopus', { person : retData });
	});
};

/*
 * [POST] CREATE AN ENTRY OF OCTOPUS FOR Person
 *
 * @param String model
 * @param Number color
 *
 * @return Person person
 */
exports.postNewInternOctopusForm = function(req, res)
{
	var id = req.params.id;
	var data = req.body;

	var status = 200;
	var format = 'html';

	var person = null;

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
			Person
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
					person = retData;

					callback();
				}
			});
		},
		function(callback)
		{
			var octopus = {};

			octopus.model = data.model;
			octopus.color = data.color;

			if(person.octopi === undefined)
				person.octopi = [];

			person.octopi.push(octopus);

			callback();
		},
		function(callback)
		{
			person.save(function(err, retData)
			{
				person = retData;

				callback();
			});
		}
	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send(person);
		else
			res.redirect('/person/'+person._id);
	});
};

/*
 * [GET] GET SINGLE ENTRY FOR Person
 *
 * @return Person person
 */
exports.getPerson = function(req, res)
{
	var id = req.params.id;
	var status = 200;
	var format = 'html';

	var person = null;

	async.series([

		function(callback)
		{
			if(req.query.format != null && req.query.format == 'json')
				format = req.query.format;
			callback();
		},
		function(callback)
		{
			Person
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
					person = retData;

					callback();
				}
			});
		}

	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send(person);
		else
		{
			if(invalid)
				res.status(status).render('person/not-found');
			else
				res.status(status).render('person/get-single', { person : person });
		}
	});
};

/*
 * [GET] GET ALL ENTRIES FOR Person
 *
 * @return Person person
 */
exports.getPeople = function(req, res)
{
	var status = 200;
	var format = 'html';

	var people = null;

	async.series([

		function(callback)
		{
			if(req.query.format != null && req.query.format == 'json')
				format = req.query.format;
			callback();
		},
		function(callback)
		{
			Person
			.find()
			.exec(function(err, retData)
			{
				people = retData;

				callback()
			});
		}

	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send(people);
		else
			res.status(status).render('person/get-all', { people : people });
	});
};

/*
 * [GET] FORM EDIT AN ENTRY FOR Person
 *
 *
 * @return View
 */
exports.getEditPersonForm = function(req, res)
{
	var id = req.params.id;

	Person
	.findOne({ _id : id })
	.exec(function(err, retData)
	{
		if(retData == null)
			res.status(404).render('person/not-found');
		else
			res.status(200).render('person/update', { person : retData });
	});
};

/*
 * [PUT] EDIT AN ENTRY FOR Person
 *
 * @param [opt] String name
 * @param [opt] String username
 * @param [opt] String email
 * @param [opt] String password
 * @param [opt] Number age
 *
 * @return Person person
 */
exports.putPerson = function(req, res)
{
	var id = req.params.id;
	var data = req.body;

	var status = 200;
	var format = 'html';

	var person = null;

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
			Person
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
					person = retData;

					callback();
				}
			});
		},
		function(callback)
		{
			if(data.name !== undefined)
			{
				person.name = data.name;
			}
			if(data.username !== undefined)
			{
				person.username = data.username;
			}
			if(data.email !== undefined)
			{
				person.email = data.email;
			}
			if(data.password !== undefined)
			{
				person.password = data.password;
			}
			if(data.age !== undefined)
			{
				person.age = data.age;
			}

			callback();
		},
		function(callback)
		{
			Person
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
					if(!retData._id.equals(person._id))
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
			person.save(function(err, retData)
			{
				person = retData;

				callback();
			});
		}
	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send(person);
		else
			res.status(status).render('person/get-single', { person : person });
	});
};

/*
 * [DELETE] DELETE AN ENTRY FOR Person
 *
 * @return null
 */
exports.deletePerson = function(req, res)
{
	var id = req.params.id;
	var status = 200;
	var format = 'html';

	var person = null;

	async.series([

		function(callback)
		{
			if(req.query.format != null && req.query.format == 'json')
				format = req.query.format;
			callback();
		},
		function(callback)
		{
			Person
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
					person = retData;

					callback();
				}
			});
		},
		function(callback)
		{
			person.remove(function(err, retData)
			{
				callback();
			});
		}
	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send('');
		else
			res.status(status).render('person/delete');
	});
};

/*
 * [DELETE] DELETE AN ENTRY OF OCTOPUS FOR Person
 *
 *
 * @return Person person
 */
exports.deleteInternOctopus = function(req, res)
{
	var id = req.params.id;
	var index = req.params.index;
	var status = 200;
	var format = 'html';

	var person = null;

	async.series([

		function(callback)
		{
			if(req.query.format != null && req.query.format == 'json')
				format = req.query.format;
			callback();
		},
		function(callback)
		{
			Person
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
					person = retData;

					callback();
				}
			});
		},
		function(callback)
		{
			person.octopus.splice(index, 1);

			person.save(function(err, retData)
			{
				person = retData;

				callback();
			});
		}
	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send(person);
		else
			res.redirect('/person/'+person._id);
	});
};

