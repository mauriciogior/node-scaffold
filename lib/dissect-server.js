'use strict';

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

		getCap : function(s)
		{
			return s.charAt(0).toUpperCase() + s.slice(1);
		},

		dissect : function(models)
		{
			var path = "./app.js";
			var pathPackage = "./package.json";

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('Server \'app.js\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
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

				buf = this.bufferForPackage();

				fs.writeFile(pathPackage, buf, function(err,data)
				{
					if(err)
					{
						that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
					}
					else
					{
						that.scaffold.message('Package file \'package.json\' created!', ct.MSG_SUCCESS);
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
			buf += "db.on('error', console.error.bind(console, '\\n[ERROR!] Do you started mongod?\\nTry this: $ mongod --dbpath ~/mongo\\n\\nError description:'));\n\n";

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
			buf += "	app.use(express.methodOverride());\n";
			buf += "});\n\n";

			buf += "/* Welcome view */\n";
			buf += "app.get('/', function(req, res) { res.send('<h1>Working!</h1>'); });\n\n";
			for(var i in models)
			{
				var name = this.getName(models[i]);
				var nameCap = this.getNameCap(models[i]);

				buf += "/* Views for " + name + " */\n";
				buf += "app.get('/" + name + "', " + name + "Controller.get" + nameCap + "s); // list all entries\n";
				buf += "app.get('/" + name + "/new', " + name + "Controller.getNew" + nameCap + "Form); // create new entry form\n";
				buf += "app.get('/" + name + "/:id', " + name + "Controller.get" + nameCap + "); // get single entry\n";
				buf += "app.get('/" + name + "/:id/edit', " + name + "Controller.getEdit" + nameCap + "Form); // edit single entry form\n";

				for(var j=0; j<models[i].fields.length; j++)
				{
					if(models[i].fields[j].type == 'Json')
					{
						buf += "app.get('/" + name + "/:id/" + models[i].fields[j].name + "/new', " + name + "Controller.getNewIntern" + this.getCap(models[i].fields[j].name) + "Form); // new " + models[i].fields[j].name + " intern form\n";
					}
				}

				buf += "\n";
				buf += "/* Actions for " + name + " */\n";

				for(var j=0; j<models[i].fields.length; j++)
				{
					if(models[i].fields[j].type == 'Json')
					{
						buf += "app.post('/" + name + "/:id/" + models[i].fields[j].name + "', " + name + "Controller.postNewIntern" + this.getCap(models[i].fields[j].name) + "Form); // new " + models[i].fields[j].name + " intern\n";
						buf += "app.delete('/" + name + "/:id/" + models[i].fields[j].name + "/:index', " + name + "Controller.deleteIntern" + this.getCap(models[i].fields[j].name) + "); // delete " + models[i].fields[j].name + " intern\n";

						buf += "\n";
					}
				}

				buf += "app.post('/" + name + "', " + name + "Controller.post" + nameCap + "); // create new entry\n";
				buf += "app.put('/" + name + "/:id', " + name + "Controller.put" + nameCap + "); // edit single entry\n";
				buf += "app.delete('/" + name + "/:id', " + name + "Controller.delete" + nameCap + "); // delete single entry\n";

			}

			buf += "\n/* Run the application */\n";
			buf += "var port = 3000;\n";
			buf += "app.listen(port, '0.0.0.0');\n";
			buf += "console.log('Listening on port '+port+ '...');\n";

			return buf;
		},

		bufferForPackage : function()
		{
			var buf = "";

			buf += '{\n';
			buf += '	"name": "scaffolded",\n';
			buf += '	"description": "My Application",\n';
			buf += '	"version": "0.0.1",\n';
			buf += '	"private": true,\n';
			buf += '	"dependencies": {\n';
			buf += '		"express": "3.x",\n';
			buf += '		"mongodb": "1.2.x",\n';
			buf += '		"mongoose": "latest",\n';
			buf += '		"async": "latest",\n';
			buf += '		"jade": "latest"\n';
			buf += '	}\n';
			buf += '}\n';

			return buf;
		}
	}

	exports.dissect = function(scaffold, models)
	{
		new DissectServer(scaffold).dissect(models);
	}
})();
