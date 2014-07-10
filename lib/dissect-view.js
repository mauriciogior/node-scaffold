(function()
{
	var fs = require('fs');
	var ct = require('./constants');

	var DissectView = function(scaffold)
	{
		this.scaffold = scaffold;

		this.name;
		this.nameCap;
		this.fields;
	}

	DissectView.prototype =
	{
		header : function()
		{
			var buf = "";

			buf += "doctype html\n";
			buf += "html\n";
			buf += "	head\n";
			buf += "		title " + this.nameCap + " model\n";
			buf += "		meta(charset='utf-8')\n";
			buf += "		meta(name='viewport', content='width=device-width, initial-scale=1.0')\n";
			buf += "	body\n";

			return buf;
		},

		dissect : function(model)
		{
			this.name = model.name.charAt(0).toLowerCase() + model.name.slice(1);
			this.nameCap = this.name.charAt(0).toUpperCase() + this.name.slice(1);

			this.fields = model.fields;
			var path = "./views/" + this.name + "/create." + ct.TE_JADE;

			if(!fs.existsSync('./views/'+ this.name))
			{
				fs.mkdirSync('./views/'+ this.name);
			}

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'create' + this.nameCap + '\' already exists! Use --force-overwrite or -F', ct.MSG_WARNING);
			}
			else
			{
				switch(this.scaffold.config.templateEngine)
				{
				case ct.TE_JADE:
					this.create(path);
					break;
				}
			}

			path = "./views/" + this.name + "/get-single." + ct.TE_JADE;

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'get' + this.nameCap + '\' already exists! Use --force-overwrite or -F', ct.MSG_WARNING);
			}
			else
			{
				switch(this.scaffold.config.templateEngine)
				{
				case ct.TE_JADE:
					this.getSingle(path);
					break;
				}
			}

			path = "./views/" + this.name + "/get-all." + ct.TE_JADE;

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'get' + this.nameCap + 's\' already exists! Use --force-overwrite or -F', ct.MSG_WARNING);
			}
			else
			{
				switch(this.scaffold.config.templateEngine)
				{
				case ct.TE_JADE:
					this.getAll(path);
					break;
				}
			}

			path = "./views/" + this.name + "/update." + ct.TE_JADE;

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'update' + this.nameCap + '\' already exists! Use --force-overwrite or -F', ct.MSG_WARNING);
			}
			else
			{
				switch(this.scaffold.config.templateEngine)
				{
				case ct.TE_JADE:
					this.update(path);
					break;
				}
			}

			path = "./views/" + this.name + "/delete." + ct.TE_JADE;

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'delete' + this.nameCap + '\' already exists! Use --force-overwrite or -F', ct.MSG_WARNING);
			}
			else
			{
				switch(this.scaffold.config.templateEngine)
				{
				case ct.TE_JADE:
					this.delete(path);
					break;
				}
			}
		},

		getAll : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 All entries for " + this.nameCap + "\n";
			buf += "		table\n";
			buf += "			thead\n";

			for(var i=0; i<this.fields.length; i++)
			{
				buf += "				td " + this.fields[i].name + "\n";
			}

			buf += "				td Edit\n";
			buf += "				td Delete\n";

			buf += "			tbody\n";
			buf += "				-for(var i=0; i<" + this.name + "s.length; i++)\n";
			buf += "					tr\n";

			for(var i=0; i<this.fields.length; i++)
			{
				buf += "						td " + this.name + "s[i]." + this.fields[i].name + "\n";
			}
			
			buf += "						td\n";
			buf += "							a(href='/"+ this.name + "/'+="+ this.name +"s[i]._id) Edit\n";

			buf += "						td\n";
			buf += "							a(href='/"+ this.name + "/'+="+ this.name +"s[i]._id +'/delete') Delete\n";
			
			buf += "\n		a(href='/"+ this.name + "/new') Add new entry\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'get' + that.nameCap + 's\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		getSingle : function(path)
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
			buf += "			.exec(function(err, retData))\n";
			buf += "			{\n";
			buf += "				" + this.name + " = retData;\n\n";
			buf += "				callback()\n";
			buf += "			}\n";
			buf += "		}\n\n";
			buf += "	], function(invalid)\n";
			buf += "	{\n";
			buf += "		if(format == 'json')\n";
			buf += "			res.status(status).send(" + this.name + ");\n";
			buf += "		else\n";
			buf += "			res.render('get" + this.nameCap + "', { data : " + this.name + " });\n";
			buf += "	});\n";
			buf += "};\n\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'get' + that.nameCap + '\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		create : function(path)
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
				buf += "			.exec(function(err, retData))\n";
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
					buf += "				" + this.fields[i].name + " = data." + this.fields[i].name + ",\n";
				}
			}

			buf += "			});\n\n";
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
			buf += "			res.render('get" + this.nameCap + "', { data : " + this.name + " });\n";
			buf += "	});\n";
			buf += "};\n\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'create' + that.nameCap + '\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		update : function(path)
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
					buf += "				" + this.name + "." + this.fields[i].name + " = " + this.fields[i].name + ";\n";
					buf += "			}\n";
				}
			}

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
				buf += "					if(retData._id != " + this.name + "._id)\n";
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
			buf += "			res.render('get" + this.nameCap + "', { data : " + this.name + " });\n";
			buf += "	});\n";
			buf += "};\n\n";
			
			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'update' + that.nameCap + '\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		delete : function(path)
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
			buf += "			res.render('delete" + this.nameCap + "', { data : " + this.name + " });\n";
			buf += "	});\n";
			buf += "};\n\n";
			
			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'delete' + that.nameCap + '\' created!', ct.MSG_SUCCESS);
				}
			});
		}
	}

	exports.dissect = function(scaffold, model)
	{
		new DissectView(scaffold).dissect(model);
	}
})();
