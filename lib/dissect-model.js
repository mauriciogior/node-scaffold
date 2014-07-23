'use strict';

(function()
{
	var fs = require('fs')
	  , ct = require('./constants')
	  , inflection = require('inflection');

	var DissectModel = function(scaffold)
	{
		this.scaffold = scaffold;

		this.fields;

		this.nameSingular;
		this.nameSingularCap;
		this.namePlural;
		this.namePluralCap;
	}

	DissectModel.prototype =
	{
		dissect : function(model)
		{
			this.nameSingular = inflection.singularize(model.name.toLowerCase());
			this.namePlural = inflection.pluralize(model.name.toLowerCase());
			this.nameSingularCap = inflection.camelize(this.nameSingular);
			this.namePluralCap = inflection.camelize(this.namePlural);

			this.fields = model.fields;

			var path = "./models/" + this.nameSingular + ".js";

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('Model \'' + this.nameSingularCap + '\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
			}
			else
			{
				var buf;

				switch(this.scaffold.config.database.framework)
				{
				case ct.DF_MONGOOSE:
					buf = this.bufferForMongoose();
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
						that.scaffold.message('Model \'' + that.nameSingularCap + '\' created!', ct.MSG_SUCCESS);
					}
				});
			}
		},

		bufferForMongoose : function()
		{
			var buf = "";

			buf += "var mongoose = require('mongoose')\n";
			buf += "\t, Schema = mongoose.Schema;\n\n";

			buf += "var " + this.nameSingularCap + "Schema = mongoose.Schema({\n";

			for(var i=0; i<this.fields.length; i++)
			{
				if(this.fields[i].type == "Json")
				{
					buf += "\t" + inflection.pluralize(this.fields[i].name) + ": [{\n";

					for(var j=0; j<this.fields[i].content.length; j++)
					{
						buf += "\t\t" + this.fields[i].content[j].name + ": " + this.fields[i].content[j].type + ((j+1 < this.fields[i].content.length) ? ",\n" : "\n");
					}

					buf += "\t}]" + ((i+1 < this.fields.length) ? ",\n" : "\n");
				}
				else
				{
					buf += "\t" + this.fields[i].name + ": " + this.fields[i].type + ((i+1 < this.fields.length) ? ",\n" : "\n");
				}
			}

			buf += "});\n\n";

			buf += "var " + this.nameSingularCap + " = mongoose.model('" + this.nameSingularCap + "', " + this.nameSingularCap + "Schema);\n\n";
			buf += "exports.get" + this.nameSingularCap + " = function()\n{\n";
			buf += "\treturn " + this.nameSingularCap + ";\n}\n";

			return buf;
		}
	}

	exports.dissect = function(scaffold, model)
	{
		new DissectModel(scaffold).dissect(model);
	}
})();
