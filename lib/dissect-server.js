(function()
{
	var fs = require('fs');
	var ct = require('./constants');

	var DissectServer = function(scaffold)
	{
		this.scaffold = scaffold;

		this.name;
		this.nameCap;
		this.fields;
	}

	DissectServer.prototype =
	{
		getName : function(model)
		{
			return model.name.charAt(0).toLowerCase() + model.name.slice(1);
		},

		getNameCap : function(model)
		{
			var name = this.getName(model);

			return name.charAt(0).toUpperCase() + name.slice(1);
		},

		dissect : function(models)
		{
			var path = "./app.js";

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('Server \'app.js\' already exists! Use --force-overwrite or -F', ct.MSG_WARNING);
			}
			else
			{
				var buf;

				switch(this.scaffold.config.httpFramework)
				{
				case ct.HF_EXPRESS:
					buf = this.bufferForExpress(models);
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
						that.scaffold.message('Server \'app.js\' created!', ct.MSG_SUCCESS);
					}
				});
			}
		},

		elaborateControllers : function(models)
		{
			var buf = "";

			for(var i=0; i<models.length; i++)
			{
				var name = this.getName(models[i]);

				if(i == 0)
				{
					buf += "var " + name + "Controller = require('./controllers/" + name + ".js')";
				}
				else
				{
					buf += "	, " + name + "Controller = require('./controllers/" + name + ".js')";
				}

				if(i+1 == models.length)
				{
					buf += ';';
				}
				
				buf += '\n';
			}

			buf += '\n';

			return buf;
		},

		bufferForExpress : function(models)
		{
			var buf = "";

			buf += "/* Extensions */\n";
			buf += "var express = require('express')\n";
			buf += "	, mongo = require('mongodb')\n"
			buf += "	, mongoose = require('mongoose');\n\n";

			buf += "/* Controllers */\n";
			buf += this.elaborateControllers(models);

			buf += "/* Database setup */\n";
			buf += "var mongoUri = process.env.MONGOLAB_URI ||\n";
			buf += "	process.env.MONGOHQ_URL ||\n";
			buf += "	'mongodb://localhost/myapp';\n\n";

			buf += "mongoose.connect(mongoUri);\n\n";
			buf += "var db = mongoose.connection;\n";
			buf += "db.on('error', console.error.bind(console, 'Do you started mongod?\\nTry this: $ mongod --dbpath ~/mongo\\n\\n connection error:'));\n\n";

			buf += "db.once('open', function callback () {\n";
			buf += "	console.log('Mongoose loaded!');\n";
			buf += "});\n\n";

			buf += "/* Application */\n";
			buf += "var app = express();\n\n";

			buf += "/* Configure views */\n";
			buf += "app.set('/views', express.static(__dirname + '/views'));\n";
			buf += "app.set('view engine', 'jade');\n\n";

			buf += "/* Declare a static folder for assets */\n";
			buf += "app.use(express.static(__dirname + '/public'));\n\n";

			buf += "/* Use developer logger and body parser (do not use multipart/form-data for simple post requests) */\n";
			buf += "app.configure(function () {\n"
			buf += "	app.use(express.logger('dev'));\n";
			buf += "	app.use(express.bodyParser());\n";
			buf += "});\n\n";

			for(var i in models)
			{
				var name = this.getName(models[i]);
				var nameCap = this.getNameCap(models[i]);

				buf += "/* Views for " + name + " */\n";
				buf += "app.get('/" + name + "s', " + name + ".get" + nameCap + "s); // list all entries\n";
				buf += "app.get('/" + name + "/new', " + name + ".getNew" + nameCap + "Form); // create new entry form\n";
				buf += "app.get('/" + name + "/:id', " + name + ".get" + nameCap + "); // get single entry\n";
				buf += "app.get('/" + name + "/:id/edit', " + name + ".getEdit" + nameCap + "Form); // edit single entry form\n\n";

				buf += "/* Actions for " + name + " */\n";
				buf += "app.post('/" + name + "', " + name + ".post" + nameCap + "); // create new entry\n";
				buf += "app.put('/" + name + "/:id', " + name + ".edit" + nameCap + "); // edit single entry\n";
				buf += "app.delete('/" + name + "/:id', " + name + ".delete" + nameCap + "); // delete single entry\n";
			}

			buf += "\n/* Run the application */\n";
			buf += "var port = 3000;\n";
			buf += "app.listen(port, '0.0.0.0');\n";
			buf += "console.log('Listening on port '+port+ '...');\n";

			return buf;
		}
	}

	exports.dissect = function(scaffold, models)
	{
		new DissectServer(scaffold).dissect(models);
	}
})();
