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
		dissect : function(model)
		{
			this.name = model.name.charAt(0).toLowerCase() + model.name.slice(1);
			this.nameCap = this.name.charAt(0).toUpperCase() + this.name.slice(1);

			this.fields = model.fields;
			var path = "./controllers/" + this.name + ".js";

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('Controller \'' + this.nameCap + '\' already exists! Use --force-overwrite or -F', ct.MSG_WARNING);
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

			buf += "var async = require('async')\n";
			buf += "\t, " + this.name + "Model = require('../models/" + this.name + ".js');\n\n";

			buf += "/*\n * MODELS\n */\n";

			buf += "var " + this.nameCap + " = " + this.name + "Model.get" + this.nameCap + "();\n\n";

			buf += this.dissectMethods();

			return buf;
		},

		dissectMethods : function()
		{
			var buf = "";

			buf += this.create();
			buf += this.getSingle();
			buf += this.getAll();
			buf += this.update();

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
			buf += "\tvar data = req.body;\n\n";
			buf += "\tvar status = 200;\n";
			buf += "\tvar format = 'html';\n\n";
			buf += "\tvar " + this.name + "s = null;\n\n";

			buf += "\tasync.series([\n\n";

			// VERIFY GIVEN DATA
			buf += "\t\tfunction(callback)\n";
			buf += "\t\t{\n";
			buf += "\t\t\tif(data != null && data.format == 'json')\n";
			buf += "\t\t\t\tformat = data.format;\n";
			buf += "\t\t\tcallback();\n";
			buf += "\t\t},\n";

			// LOAD FROM DATABASE
			buf += "\t\tfunction(callback)\n";
			buf += "\t\t{\n";
			buf += "\t\t\t" + this.nameCap + "\n";
			buf += "\t\t\t.find()\n";
			buf += "\t\t\t.exec(function(err, retData))\n";
			buf += "\t\t\t{\n";
			buf += "\t\t\t\t" + this.name + "s = retData;\n\n";
			buf += "\t\t\t\tcallback()\n";
			buf += "\t\t\t}\n";
			buf += "\t\t}\n\n";
			buf += "\t], function(invalid)\n";
			buf += "\t{\n";
			buf += "\t\tif(format == 'json')\n";
			buf += "\t\t\tres.status(status).send(" + this.name + "s);\n";
			buf += "\t\telse\n";
			buf += "\t\t\tres.render('get" + this.nameCap + "s', { data : " + this.name + "s });\n";
			buf += "\t});\n";
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
			buf += "\tvar id = req.params.id;\n";
			buf += "\tvar data = req.body;\n\n";
			buf += "\tvar status = 200;\n";
			buf += "\tvar format = 'html';\n\n";
			buf += "\tvar " + this.name + " = null;\n\n";

			buf += "\tasync.series([\n\n";

			// VERIFY GIVEN DATA
			buf += "\t\tfunction(callback)\n";
			buf += "\t\t{\n";
			buf += "\t\t\tif(data != null && data.format == 'json')\n";
			buf += "\t\t\t\tformat = data.format;\n";
			buf += "\t\t\tcallback();\n";
			buf += "\t\t},\n";

			// LOAD FROM DATABASE
			buf += "\t\tfunction(callback)\n";
			buf += "\t\t{\n";
			buf += "\t\t\t" + this.nameCap + "\n";
			buf += "\t\t\t.findOne({ _id : id })\n";
			buf += "\t\t\t.exec(function(err, retData))\n";
			buf += "\t\t\t{\n";
			buf += "\t\t\t\t" + this.name + " = retData;\n\n";
			buf += "\t\t\t\tcallback()\n";
			buf += "\t\t\t}\n";
			buf += "\t\t}\n\n";
			buf += "\t], function(invalid)\n";
			buf += "\t{\n";
			buf += "\t\tif(format == 'json')\n";
			buf += "\t\t\tres.status(status).send(" + this.name + ");\n";
			buf += "\t\telse\n";
			buf += "\t\t\tres.render('get" + this.nameCap + "', { data : " + this.name + " });\n";
			buf += "\t});\n";
			buf += "};\n\n";

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
			buf += "\tvar data = req.body;\n\n";
			buf += "\tvar status = 200;\n";
			buf += "\tvar format = 'html';\n\n";
			buf += "\tvar " + this.name + " = null;\n\n";

			buf += "\tasync.series([\n\n";

			// VERIFY GIVEN DATA
			buf += "\t\tfunction(callback)\n";
			buf += "\t\t{\n";
			buf += "\t\t\tif(data == null)\n";
			buf += "\t\t\t{\n";
			buf += "\t\t\t\tstatus = 400;\n";
			buf += "\t\t\t\tcallback(true);\n";
			buf += "\t\t\t}\n";

			for(var i in this.fields)
			{
				if(this.fields[i].type != "Json")
				{
			buf += "\t\t\telse if(data." + this.fields[i].name + " === undefined)\n";
			buf += "\t\t\t{\n";
			buf += "\t\t\t\tstatus = 400;\n";
			buf += "\t\t\t\tcallback(true);\n";
			buf += "\t\t\t}\n";
				}
			}
			buf += "\t\t\telse \n";
			buf += "\t\t\t{\n";
			buf += "\t\t\t\tif(data.format == 'json')\n";
			buf += "\t\t\t\t\tformat = data.format;\n";
			buf += "\t\t\t\tcallback();\n";
			buf += "\t\t\t}\n";
			buf += "\t\t},\n";

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
				buf += "\t\tfunction(callback)\n";
				buf += "\t\t{\n";
				buf += "\t\t\t" + this.nameCap + "\n";
				buf += "\t\t\t.findOne({\n";

				var gone = 0;

				for(var i in this.fields)
				{
					if(this.fields[i].unique !== undefined)
					{
						buf += "\t\t\t\t" + this.fields[i].name + " : data." + this.fields[i].name;

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

				buf += "\t\t\t})\n";
				buf += "\t\t\t.exec(function(err, retData))\n";
				buf += "\t\t\t{\n";
				buf += "\t\t\t\tif(retData != null)\n";
				buf += "\t\t\t\t{\n";
				buf += "\t\t\t\t\tstatus = 400;\n";
				buf += "\t\t\t\t\tcallback(true);\n";
				buf += "\t\t\t\t}\n";
				buf += "\t\t\t\telse\n";
				buf += "\t\t\t\t{\n";
				buf += "\t\t\t\t\tcallback();\n";
				buf += "\t\t\t\t}\n";
				buf += "\t\t\t});\n";
				buf += "\t\t},\n";
			}

			buf += "\t\tfunction(callback)\n";
			buf += "\t\t{\n";
			buf += "\t\t\t" + this.name + " = new " + this.nameCap + "({\n";

			for(var i=0; i<this.fields.length; i++)
			{
				if(this.fields[i].type != "Json")
				{
					buf += "\t\t\t\t" + this.fields[i].name + " = data." + this.fields[i].name + ",\n";
				}
			}

			buf += "\t\t\t});\n\n";
			buf += "\t\t\t" + this.name + ".save(function(err, retData)\n";
			buf += "\t\t\t{\n";
			buf += "\t\t\t\t" + this.name + " = retData;\n\n";
			buf += "\t\t\t\tcallback();\n";
			buf += "\t\t\t});\n";
			buf += "\t\t}\n";
			buf += "\t], function(invalid)\n";
			buf += "\t{\n";
			buf += "\t\tif(format == 'json')\n";
			buf += "\t\t\tres.status(status).send(" + this.name + ");\n";
			buf += "\t\telse\n";
			buf += "\t\t\tres.render('get" + this.nameCap + "', { data : " + this.name + " });\n";
			buf += "\t});\n";
			buf += "};\n\n";

			return buf;
		},

		update : function()
		{
			var buf = "";

			return buf;
		},
	}

	exports.dissect = function(scaffold, model)
	{
		new DissectController(scaffold).dissect(model);
	}
})();
