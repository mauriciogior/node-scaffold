(function()
{
	var fs = require('fs');
	var ct = require('./constants');

	var DissectController = function(scaffold)
	{
		this.scaffold = scaffold;

		this.name;
		this.nameCap;
		this.fields;
	}

	DissectController.prototype =
	{
		getCap : function(s)
		{
			return s.charAt(0).toUpperCase() + s.slice(1);
		},

		dissect : function(model)
		{
			this.name = model.name.charAt(0).toLowerCase() + model.name.slice(1);
			this.nameCap = this.name.charAt(0).toUpperCase() + this.name.slice(1);

			this.fields = model.fields;
			var path = "./controllers/" + this.name + ".js";

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('Controller \'' + this.nameCap + '\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
			}
			else
			{
				var buf;

				switch(this.scaffold.config.httpFramework)
				{
				case ct.HF_EXPRESS:
					buf = this.bufferForExpress();
					break;
				}

				var that = this;

				fs.writeFile(path, buf, function(err,data)
				{
					if(err)
					{
						that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
					}
					else
					{
						that.scaffold.message('Controller \'' + that.nameCap + '\' created!', ct.MSG_SUCCESS);
					}
				});
			}
		},

		bufferForExpress : function()
		{
			var buf = "";

			buf += "/*\n * EXTENSIONS\n */\n";

			buf += "var jade = require('jade')\n";
			buf += "	, async = require('async')\n";
			buf += "	, " + this.name + "Model = require('../models/" + this.name + ".js');\n\n";

			buf += "/*\n * MODELS\n */\n";

			buf += "var " + this.nameCap + " = " + this.name + "Model.get" + this.nameCap + "();\n\n";

			buf += this.dissectMethods();

			return buf;
		},

		dissectMethods : function()
		{
			var buf = "";

			buf += this.createForm();
			buf += this.create();
			buf += this.createInternForm();
			buf += this.createIntern();
			buf += this.getSingle();
			buf += this.getAll();
			buf += this.updateForm();
			buf += this.update();
			buf += this.delete();

			return buf;
		},

		getAll : function()
		{
			var buf = "";

			// GET ALL
			buf += "/*\n * [GET] GET ALL ENTRIES FOR " + this.nameCap + "\n *\n";
			buf += " * @return " + this.nameCap + " " + this.name + "\n */\n";

			buf += "exports.get" + this.nameCap + "s = function(req, res)\n";
			buf += "{\n";
			buf += "	var data = req.body;\n\n";
			buf += "	var status = 200;\n";
			buf += "	var format = 'html';\n\n";
			buf += "	var " + this.name + "s = null;\n\n";

			buf += "	async.series([\n\n";

			// VERIFY GIVEN DATA
			buf += "		function(callback)\n";
			buf += "		{\n";
			buf += "			if(data != null && data.format == 'json')\n";
			buf += "				format = data.format;\n";
			buf += "			callback();\n";
			buf += "		},\n";

			// LOAD FROM DATABASE
			buf += "		function(callback)\n";
			buf += "		{\n";
			buf += "			" + this.nameCap + "\n";
			buf += "			.find()\n";
			buf += "			.exec(function(err, retData)\n";
			buf += "			{\n";
			buf += "				" + this.name + "s = retData;\n\n";
			buf += "				callback()\n";
			buf += "			});\n";
			buf += "		}\n\n";
			buf += "	], function(invalid)\n";
			buf += "	{\n";
			buf += "		if(format == 'json')\n";
			buf += "			res.status(status).send(" + this.name + "s);\n";
			buf += "		else\n";
			buf += "			res.status(status).render('" + this.name + "/get-all', { " + this.name + "s : " + this.name + "s });\n";
			buf += "	});\n";
			buf += "};\n\n";

			return buf;
		},

		getSingle : function()
		{
			var buf = "";

			// GET SINGLE
			buf += "/*\n * [GET] GET SINGLE ENTRY FOR " + this.nameCap + "\n *\n";
			buf += " * @return " + this.nameCap + " " + this.name + "\n */\n";

			buf += "exports.get" + this.nameCap + " = function(req, res)\n";
			buf += "{\n";
			buf += "	var id = req.params.id;\n";
			buf += "	var data = req.body;\n\n";
			buf += "	var status = 200;\n";
			buf += "	var format = 'html';\n\n";
			buf += "	var " + this.name + " = null;\n\n";

			buf += "	async.series([\n\n";

			// VERIFY GIVEN DATA
			buf += "		function(callback)\n";
			buf += "		{\n";
			buf += "			if(data != null && data.format == 'json')\n";
			buf += "				format = data.format;\n";
			buf += "			callback();\n";
			buf += "		},\n";

			// LOAD FROM DATABASE
			buf += "		function(callback)\n";
			buf += "		{\n";
			buf += "			" + this.nameCap + "\n";
			buf += "			.findOne({ _id : id })\n";
			buf += "			.exec(function(err, retData)\n";
			buf += "			{\n";
			buf += "				" + this.name + " = retData;\n\n";
			buf += "				callback();\n";
			buf += "			});\n";
			buf += "		}\n\n";
			buf += "	], function(invalid)\n";
			buf += "	{\n";
			buf += "		if(format == 'json')\n";
			buf += "			res.status(status).send(" + this.name + ");\n";
			buf += "		else\n";
			buf += "			res.status(status).render('" + this.name + "/get-single', { " + this.name + " : " + this.name + " });\n";
			buf += "	});\n";
			buf += "};\n\n";

			return buf;
		},

		createForm : function()
		{
			var buf = "";

			// GET
			buf += "/*\n * [GET] FORM CREATE AN ENTRY FOR " + this.nameCap + "\n *\n";
			buf += " *\n * @return " + this.nameCap + " " + this.name + "\n */\n";

			buf += "exports.getNew" + this.nameCap + "Form = function(req, res)\n";
			buf += "{\n";
			buf += "	res.status(200).render('" + this.name + "/create');\n";
			buf += "};\n\n";

			return buf;
		},

		createInternForm : function()
		{
			var buf = "";

			for(var i=0; i<this.fields.length; i++)
			{
				if(this.fields[i].type == 'Json')
				{
					// GET
					buf += "/*\n * [GET] FORM CREATE AN ENTRY OF " + this.fields[i].name.toUpperCase() + " FOR " + this.nameCap + "\n *\n";
					buf += " *\n * @return " + this.nameCap + " " + this.name + "\n */\n";

					buf += "exports.getNewIntern" + this.getCap(this.fields[i].name) + "Form = function(req, res)\n";
					buf += "{\n";
					buf += "	var id = req.params.id;\n\n";
					buf += "	" + this.nameCap + "\n";
					buf += "	.findOne({ _id : id })\n";
					buf += "	.exec(function(err, retData)\n";
					buf += "	{\n";
					buf += "		if(retData == null)\n";
					buf += "			res.status(404).render('" + this.name + "/not-found');\n";
					buf += "		else\n";
					buf += "			res.status(200).render('" + this.name + "/create-" + this.fields[i].name + "', { " + this.name + " : retData });\n";
					buf += "	});\n";
					buf += "};\n\n";
				}
			}

			return buf;
		},

		create : function()
		{
			var buf = "";

			// POST
			buf += "/*\n * [POST] CREATE AN ENTRY FOR " + this.nameCap + "\n *\n";

			for(var i in this.fields)
			{
				if(this.fields[i].type != "Json")
				{
					buf += " * @param " + this.fields[i].type + " " + this.fields[i].name + "\n";
				}
			}

			buf += " *\n * @return " + this.nameCap + " " + this.name + "\n */\n";

			buf += "exports.post" + this.nameCap + " = function(req, res)\n";
			buf += "{\n";
			buf += "	var data = req.body;\n\n";
			buf += "	var status = 200;\n";
			buf += "	var format = 'html';\n\n";
			buf += "	var " + this.name + " = null;\n\n";

			buf += "	async.series([\n\n";

			// VERIFY GIVEN DATA
			buf += "		function(callback)\n";
			buf += "		{\n";
			buf += "			if(data == null)\n";
			buf += "			{\n";
			buf += "				status = 400;\n";
			buf += "				callback(true);\n";
			buf += "			}\n";

			for(var i in this.fields)
			{
				if(this.fields[i].type != "Json")
				{
					buf += "			else if(data." + this.fields[i].name + " === undefined)\n";
					buf += "			{\n";
					buf += "				status = 400;\n";
					buf += "				callback(true);\n";
					buf += "			}\n";
				}
			}

			buf += "			else \n";
			buf += "			{\n";
			buf += "				if(data.format == 'json')\n";
			buf += "					format = data.format;\n";
			buf += "				callback();\n";
			buf += "			}\n";
			buf += "		},\n";

			// HAS UNIQUE?
			var hasUnique = 0;

			for(var i in this.fields)
			{
				if(this.fields[i].unique !== undefined)
				{
					hasUnique++;
				}
			}

			if(hasUnique > 0)
			{
				buf += "		function(callback)\n";
				buf += "		{\n";
				buf += "			" + this.nameCap + "\n";
				buf += "			.findOne({\n";
				buf += "				$or : [\n";

				var gone = 0;

				for(var i in this.fields)
				{
					if(this.fields[i].unique !== undefined)
					{
						buf += "					{ " + this.fields[i].name + " : data." + this.fields[i].name + " }";

						gone++;

						if(hasUnique > gone)
						{
							buf += ",\n";
						}
						else
						{
							buf += "\n";
						}
					}
				}

				buf += "				]\n";
				buf += "			})\n";
				buf += "			.exec(function(err, retData)\n";
				buf += "			{\n";
				buf += "				if(retData != null)\n";
				buf += "				{\n";
				buf += "					status = 400;\n";
				buf += "					callback(true);\n";
				buf += "				}\n";
				buf += "				else\n";
				buf += "				{\n";
				buf += "					callback();\n";
				buf += "				}\n";
				buf += "			});\n";
				buf += "		},\n";
			}

			buf += "		function(callback)\n";
			buf += "		{\n";
			buf += "			" + this.name + " = new " + this.nameCap + "({\n";

			for(var i=0; i<this.fields.length; i++)
			{
				if(this.fields[i].type != "Json")
				{
					buf += "				" + this.fields[i].name + " : data." + this.fields[i].name + ",\n";
				}
			}

			buf += "			});\n\n";
			buf += "			" + this.name + ".save(function(err, retData)\n";
			buf += "			{\n";
			buf += "				" + this.name + " = retData;\n\n";
			buf += "				if(err != null)\n";
			buf += "				{\n";
			buf += "					status = 400;\n";
			buf += "					callback(true);\n";
			buf += "				}\n\n";
			buf += "				callback();\n";
			buf += "			});\n";
			buf += "		}\n";
			buf += "	], function(invalid)\n";
			buf += "	{\n";
			buf += "		if(format == 'json')\n";
			buf += "			res.status(status).send(" + this.name + ");\n";
			buf += "		else\n";
			buf += "		{\n";
			buf += "			if(status != 200)\n";
			buf += "				res.status(200).render('" + this.name + "/create', { error : true });\n";
			buf += "			else\n";
			buf += "				res.status(status).render('" + this.name + "/get-single', { " + this.name + " : " + this.name + " });\n";
			buf += "		}\n";
			buf += "	});\n";
			buf += "};\n\n";

			return buf;
		},

		createIntern : function()
		{
			var buf = "";

			for(var i=0; i<this.fields.length; i++)
			{
				var field = this.fields[i];

				if(field.type == 'Json')
				{
					// POST
					buf += "/*\n * [POST] CREATE AN ENTRY OF " + field.name.toUpperCase() + " FOR " + this.nameCap + "\n *\n";

					for(var j in field.content)
					{
						buf += " * @param " + field.content[j].type + " " + field.content[j].name + "\n";
					}

					buf += " *\n * @return " + this.nameCap + " " + this.name + "\n */\n";

					buf += "exports.postNewIntern" + this.getCap(field.name) + "Form = function(req, res)\n";
					buf += "{\n";
					buf += "	var id = req.params.id;\n";
					buf += "	var data = req.body;\n\n";
					buf += "	var status = 200;\n";
					buf += "	var format = 'html';\n\n";
					buf += "	var " + this.name + " = null;\n\n";

					buf += "	async.series([\n\n";

					// VERIFY GIVEN DATA
					buf += "		function(callback)\n";
					buf += "		{\n";
					buf += "			if(data == null)\n";
					buf += "			{\n";
					buf += "				status = 400;\n";
					buf += "				callback(true);\n";
					buf += "			}\n";

					for(var j in field.content)
					{
						buf += "			else if(data."+ field.content[j].name +" === undefined)\n";
						buf += "			{\n";
						buf += "				status = 400;\n";
						buf += "				callback(true);\n";
						buf += "			}\n";
					}

					buf += "			else\n";
					buf += "			{\n";
					buf += "				if(data.format == 'json')\n";
					buf += "					format = data.format;\n";
					buf += "				callback();\n";
					buf += "			}\n";
					buf += "		},\n";

					// GET ENTRY
					buf += "		function(callback)\n";
					buf += "		{\n";
					buf += "			" + this.nameCap + "\n";
					buf += "			.findOne({ _id : id })\n";
					buf += "			.exec(function(err, retData)\n";
					buf += "			{\n";
					buf += "				if(retData == null)\n";
					buf += "				{\n";
					buf += "					status = 400;\n";
					buf += "					callback(true);\n";
					buf += "				}\n";
					buf += "				else\n";
					buf += "				{\n";
					buf += "					" + this.name + " = retData;\n\n";
					buf += "					callback();\n";
					buf += "				}\n";
					buf += "			});\n";
					buf += "		},\n";

					// ADD CHANGES
					buf += "		function(callback)\n";
					buf += "		{\n";
					buf += "			var " + field.name + " = {};\n\n";

					for(var j in field.content)
					{
						buf += "			" + field.name + "."+ field.content[j].name +" = data."+ field.content[j].name +";\n";
					}

					buf += "\n";

					buf += "			if(" + this.name + "." + field.name + " === undefined)\n";
					buf += "				" + this.name + "." + field.name + " = [];\n\n";

					buf += "			" + this.name + "." + field.name + ".push(" + field.name + ");\n";

					buf += "\n";
					buf += "			callback();\n";
					buf += "		},\n";
					
					// SAVE CHANGES
					buf += "		function(callback)\n";
					buf += "		{\n";
					buf += "			" + this.name + ".save(function(err, retData)\n";
					buf += "			{\n";
					buf += "				" + this.name + " = retData;\n\n";
					buf += "				callback();\n";
					buf += "			});\n";
					buf += "		}\n";
					buf += "	], function(invalid)\n";
					buf += "	{\n";
					buf += "		if(format == 'json')\n";
					buf += "			res.status(status).send(" + this.name + ");\n";
					buf += "		else\n";
					buf += "			res.status(status).render('" + this.name + "/get-single', { " + this.name + " : " + this.name + " });\n";
					buf += "	});\n";
					buf += "};\n\n";
				}
			}

			return buf;
		},

		updateForm : function()
		{
			var buf = "";

			// GET
			buf += "/*\n * [GET] FORM EDIT AN ENTRY FOR " + this.nameCap + "\n *\n";
			buf += " *\n * @return View\n */\n";

			buf += "exports.getEdit" + this.nameCap + "Form = function(req, res)\n";
			buf += "{\n";
			buf += "	var id = req.params.id;\n\n";
			buf += "	" + this.nameCap + "\n";
			buf += "	.findOne({ _id : id })\n";
			buf += "	.exec(function(err, retData)\n";
			buf += "	{\n";
			buf += "		if(retData == null)\n";
			buf += "			res.status(404).render('" + this.name + "/not-found');\n";
			buf += "		else\n";
			buf += "			res.status(200).render('" + this.name + "/update', { " + this.name + " : retData });\n";
			buf += "	});\n";
			buf += "};\n\n";
			
			return buf;
		},

		update : function()
		{
			var buf = "";

			// PUT
			buf += "/*\n * [PUT] EDIT AN ENTRY FOR " + this.nameCap + "\n *\n";

			for(var i in this.fields)
			{
				if(this.fields[i].type != "Json")
				{
					buf += " * @param [opt] " + this.fields[i].type + " " + this.fields[i].name + "\n";
				}
			}

			buf += " *\n * @return " + this.nameCap + " " + this.name + "\n */\n";

			buf += "exports.put" + this.nameCap + " = function(req, res)\n";
			buf += "{\n";
			buf += "	var id = req.params.id;\n";
			buf += "	var data = req.body;\n\n";
			buf += "	var status = 200;\n";
			buf += "	var format = 'html';\n\n";
			buf += "	var " + this.name + " = null;\n\n";

			buf += "	async.series([\n\n";

			// VERIFY GIVEN DATA
			buf += "		function(callback)\n";
			buf += "		{\n";
			buf += "			if(data == null)\n";
			buf += "			{\n";
			buf += "				status = 400;\n";
			buf += "				callback(true);\n";
			buf += "			}\n";
			buf += "			else\n";
			buf += "			{\n";
			buf += "				if(data.format == 'json')\n";
			buf += "					format = data.format;\n";
			buf += "				callback();\n";
			buf += "			}\n";
			buf += "		},\n";

			// GET ENTRY
			buf += "		function(callback)\n";
			buf += "		{\n";
			buf += "			" + this.nameCap + "\n";
			buf += "			.findOne({ _id : id })\n";
			buf += "			.exec(function(err, retData)\n";
			buf += "			{\n";
			buf += "				if(retData == null)\n";
			buf += "				{\n";
			buf += "					status = 400;\n";
			buf += "					callback(true);\n";
			buf += "				}\n";
			buf += "				else\n";
			buf += "				{\n";
			buf += "					" + this.name + " = retData;\n\n";
			buf += "					callback();\n";
			buf += "				}\n";
			buf += "			});\n";
			buf += "		},\n";

			// ADD CHANGES
			buf += "		function(callback)\n";
			buf += "		{\n";

			for(var i in this.fields)
			{
				if(this.fields[i].type != 'Json')
				{
					buf += "			if(data." + this.fields[i].name + " !== undefined)\n";
					buf += "			{\n";
					buf += "				" + this.name + "." + this.fields[i].name + " = data." + this.fields[i].name + ";\n";
					buf += "			}\n";
				}
			}

			buf += "\n";
			buf += "			callback();\n";
			buf += "		},\n";
			
			// HAS UNIQUE?
			var hasUnique = 0;

			for(var i in this.fields)
			{
				if(this.fields[i].unique !== undefined)
				{
					hasUnique++;
				}
			}

			if(hasUnique > 0)
			{
				buf += "		function(callback)\n";
				buf += "		{\n";
				buf += "			" + this.nameCap + "\n";
				buf += "			.findOne({\n";
				buf += "				$or : [\n";

				var gone = 0;

				for(var i in this.fields)
				{
					if(this.fields[i].unique !== undefined)
					{
						buf += "					{ " + this.fields[i].name + " : data." + this.fields[i].name + " }";

						gone++;

						if(hasUnique > gone)
						{
							buf += ",\n";
						}
						else
						{
							buf += "\n";
						}
					}
				}

				buf += "				]\n";
				buf += "			})\n";
				buf += "			.exec(function(err, retData)\n";
				buf += "			{\n";
				buf += "				if(retData != null)\n";
				buf += "				{\n";
				buf += "					if(!retData._id.equals(" + this.name + "._id))\n";
				buf += "					{\n";
				buf += "						status = 400;\n";
				buf += "						callback(true);\n";
				buf += "					}\n";
				buf += "					else\n";
				buf += "					{\n";
				buf += "						callback();\n";
				buf += "					}\n";
				buf += "				}\n";
				buf += "				else\n";
				buf += "				{\n";
				buf += "					callback();\n";
				buf += "				}\n";
				buf += "			});\n";
				buf += "		},\n";
			}

			buf += "		function(callback)\n";
			buf += "		{\n";
			buf += "			" + this.name + ".save(function(err, retData)\n";
			buf += "			{\n";
			buf += "				" + this.name + " = retData;\n\n";
			buf += "				callback();\n";
			buf += "			});\n";
			buf += "		}\n";
			buf += "	], function(invalid)\n";
			buf += "	{\n";
			buf += "		if(format == 'json')\n";
			buf += "			res.status(status).send(" + this.name + ");\n";
			buf += "		else\n";
			buf += "			res.status(status).render('" + this.name + "/get-single', { " + this.name + " : " + this.name + " });\n";
			buf += "	});\n";
			buf += "};\n\n";
			
			return buf;
		},

		delete : function()
		{
			var buf = "";

			// DELETE
			buf += "/*\n * [DELETE] DELETE AN ENTRY FOR " + this.nameCap + "\n *\n";
			buf += " * @return null\n */\n";

			buf += "exports.delete" + this.nameCap + " = function(req, res)\n";
			buf += "{\n";
			buf += "	var id = req.params.id;\n\n";
			buf += "	var status = 200;\n";
			buf += "	var format = 'html';\n\n";
			buf += "	var " + this.name + " = null;\n\n";

			buf += "	async.series([\n\n";

			// VERIFY GIVEN DATA
			buf += "		function(callback)\n";
			buf += "		{\n";
			buf += "			if(data != null && data.format == 'json')\n";
			buf += "				format = data.format;\n";
			buf += "			callback();\n";
			buf += "		},\n";

			// GET ENTRY
			buf += "		function(callback)\n";
			buf += "		{\n";
			buf += "			" + this.nameCap + "\n";
			buf += "			.findOne({ _id : id })\n";
			buf += "			.exec(function(err, retData)\n";
			buf += "			{\n";
			buf += "				if(retData == null)\n";
			buf += "				{\n";
			buf += "					status = 400;\n";
			buf += "					callback(true);\n";
			buf += "				}\n";
			buf += "				else\n";
			buf += "				{\n";
			buf += "					" + this.name + " = retData;\n\n";
			buf += "					callback();\n";
			buf += "				}\n";
			buf += "			});\n";
			buf += "		},\n";

			// DELETE ENTRY
			buf += "		function(callback)\n";
			buf += "		{\n";
			buf += "			" + this.name + ".remove(function(err, retData)\n";
			buf += "			{\n";
			buf += "				callback();\n";
			buf += "			});\n";
			buf += "		}\n";
			buf += "	], function(invalid)\n";
			buf += "	{\n";
			buf += "		if(format == 'json')\n";
			buf += "			res.status(status).send('');\n";
			buf += "		else\n";
			buf += "			res.status(status).render('" + this.name + "/delete');\n";
			buf += "	});\n";
			buf += "};\n\n";
			
			return buf;
		}
	}

	exports.dissect = function(scaffold, model)
	{
		new DissectController(scaffold).dissect(model);
	}
})();
