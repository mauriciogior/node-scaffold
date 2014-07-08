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

			// CRUD BEGIN
			// GET
			buf += "/*\n * [GET] GET ALL ENTRIES FOR " + this.nameCap + "\n *\n";
			buf += " * @return " + this.nameCap + " " + this.name + "\n */\n";

			buf += "exports.get" + this.nameCap + "s = function(req, res)\n{\n";
			buf += "\tvar data = req.body;\n\n";
			buf += "\tvar status = 200;\n";
			buf += "\tvar format = 'html';\n\n";
			buf += "\tvar " + this.name + "s;\n\n";

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
		}
	}

	exports.dissect = function(scaffold, model)
	{
		new DissectController(scaffold).dissect(model);
	}
})();
