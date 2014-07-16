/*
 * EXTENSIONS
 */
var jade = require('jade')
	, async = require('async')
	, carModel = require('../models/car.js');

/*
 * MODELS
 */
var Car = carModel.getCar();

/*
 * [GET] FORM CREATE AN ENTRY FOR Car
 *
 *
 * @return Car car
 */
exports.getNewCarForm = function(req, res)
{
	res.status(200).render('car/create');
};

/*
 * [POST] CREATE AN ENTRY FOR Car
 *
 * @param String name
 * @param String model
 *
 * @return Car car
 */
exports.postCar = function(req, res)
{
	var data = req.body;

	var status = 200;
	var format = 'html';

	var car = null;

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
			else if(data.model === undefined)
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
			car = new Car({
				name : data.name,
				model : data.model,
				owner : data.owner,
			});

			car.save(function(err, retData)
			{
				car = retData;

				if(err != null)
				{
					status = 400;
					callback(true);
				}

				else
				{
					callback();
				}
			});
		}
	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send(car);
		else
		{
			if(status != 200)
				res.status(200).render('car/create', { error : true });
			else
				res.status(status).render('car/get-single', { car : car });
		}
	});
};

/*
 * [GET] GET SINGLE ENTRY FOR Car
 *
 * @return Car car
 */
exports.getCar = function(req, res)
{
	var id = req.params.id;
	var status = 200;
	var format = 'html';

	var car = null;

	async.series([

		function(callback)
		{
			if(req.query.format != null && req.query.format == 'json')
				format = req.query.format;
			callback();
		},
		function(callback)
		{
			Car
			.findOne({ _id : id })
			.populate('owners')
			.exec(function(err, retData)
			{
				if(retData == null)
				{
					status = 400;
					callback(true);
				}
				else
				{
					car = retData;

					callback();
				}
			});
		}

	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send(car);
		else
		{
			if(invalid)
				res.status(status).render('car/not-found');
			else
				res.status(status).render('car/get-single', { car : car });
		}
	});
};

/*
 * [GET] GET ALL ENTRIES FOR Car
 *
 * @return Car car
 */
exports.getCars = function(req, res)
{
	var status = 200;
	var format = 'html';

	var cars = null;

	async.series([

		function(callback)
		{
			if(req.query.format != null && req.query.format == 'json')
				format = req.query.format;
			callback();
		},
		function(callback)
		{
			Car
			.find()
			.populate('owners')
			.exec(function(err, retData)
			{
				cars = retData;

				callback()
			});
		}

	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send(cars);
		else
			res.status(status).render('car/get-all', { cars : cars });
	});
};

/*
 * [GET] FORM EDIT AN ENTRY FOR Car
 *
 *
 * @return View
 */
exports.getEditCarForm = function(req, res)
{
	var id = req.params.id;

	Car
	.findOne({ _id : id })
	.exec(function(err, retData)
	{
		if(retData == null)
			res.status(404).render('car/not-found');
		else
			res.status(200).render('car/update', { car : retData });
	});
};

/*
 * [PUT] EDIT AN ENTRY FOR Car
 *
 * @param [opt] String name
 * @param [opt] String model
 * @param [opt] [{Ref}] owner
 *
 * @return Car car
 */
exports.putCar = function(req, res)
{
	var id = req.params.id;
	var data = req.body;

	var status = 200;
	var format = 'html';

	var car = null;

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
			Car
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
					car = retData;

					callback();
				}
			});
		},
		function(callback)
		{
			if(data.name !== undefined)
			{
				car.name = data.name;
			}
			if(data.model !== undefined)
			{
				car.model = data.model;
			}
			if(data.owner !== undefined)
			{
				car.owner = data.owner;
			}

			callback();
		},
		function(callback)
		{
			car.save(function(err, retData)
			{
				car = retData;

				callback();
			});
		}
	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send(car);
		else
			res.status(status).render('car/get-single', { car : car });
	});
};

/*
 * [DELETE] DELETE AN ENTRY FOR Car
 *
 * @return null
 */
exports.deleteCar = function(req, res)
{
	var id = req.params.id;
	var status = 200;
	var format = 'html';

	var car = null;

	async.series([

		function(callback)
		{
			if(req.query.format != null && req.query.format == 'json')
				format = req.query.format;
			callback();
		},
		function(callback)
		{
			Car
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
					car = retData;

					callback();
				}
			});
		},
		function(callback)
		{
			car.remove(function(err, retData)
			{
				callback();
			});
		}
	], function(invalid)
	{
		if(format == 'json')
			res.status(status).send('');
		else
			res.status(status).render('car/delete');
	});
};

