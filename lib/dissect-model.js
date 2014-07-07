(function()
{
	var fs = require('fs');
	var ct = require('./constants');

	var DissectModel = function(scaffold)
	{
		this.scaffold = scaffold;
	}

	DissectModel.prototype =
	{
		dissect : function(model)
		{
			var name = model.name.toLowerCase();
			var nameCap = name.charAt(0).toUpperCase() + name.slice(1);

			var fields = model.fields;
			var path = "./models/" + name + ".js";

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('Model \'' + nameCap + '\' already exists! Use --force-overwrite or -F', ct.MSG_WARNING);
			}
			else
			{
				var buf;

				switch(this.scaffold.config.database.framework)
				{
				case ct.DF_MONGOOSE:
					buf = this.bufferForMongoose(nameCap, fields);
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
						that.scaffold.message('Model \'' + nameCap + '\' created!', ct.MSG_SUCCESS);
					}
				});
			}
		},

		bufferForMongoose : function(nameCap, fields)
		{
			var buf = "";

			buf += "var mongoose = require('mongoose')\n";
			buf += "\t, Schema = mongoose.Schema;\n\n";

			buf += "var " + nameCap + "Schema = mongoose.Schema({\n";

			for(var i=0; i<fields.length; i++)
			{
				if(fields[i].type == "Json")
				{
					buf += "\t" + fields[i].name + ": [{\n";

					for(var j=0; j<fields[i].content.length; j++)
					{
						buf += "\t\t" + fields[i].content[j].name + ": " + fields[i].content[j].type + ((j+1 < fields[i].content.length) ? ",\n" : "\n");
					}

					buf += "\t}]" + ((i+1 < fields.length) ? ",\n" : "\n");
				}
				else
				{
					buf += "\t" + fields[i].name + ": " + fields[i].type + ((i+1 < fields.length) ? ",\n" : "\n");
				}
			}

			buf += "});\n\n";

			buf += "var " + nameCap + " = mongoose.model('" + nameCap + "', " + nameCap + "Schema);\n\n";
			buf += "exports.get" + nameCap + " = function()\n{\n";
			buf += "\treturn " + nameCap + ";\n}\n";

			return buf;
		}
	}

	exports.dissect = function(scaffold, model)
	{
		new DissectModel(scaffold).dissect(model);
	}
})();
