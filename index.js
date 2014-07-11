(function()
{
	// Extensions
	var fs = require('fs');
	var arg = require('./lib/argument-parser');
	var JSONcleaner = require('./lib/comment-cut-out');

	// Constants
	var ct = require('./lib/constants');

	var Scaffold = function()
	{
		this.init();

		this.config;
	}

	Scaffold.prototype =
	{
		init : function()
		{
			this.parse();
		},

		parse : function()
		{
			// Configuration
			var config = arg.parse(process.argv);

			if(config.help)
			{
				this.help();
			}
			else if(config.file == null)
			{
				this.shell();
			}
			else
			{
				var err = false;
				var file;

				try
				{
					file = fs.readFileSync(config.file, 'utf8');
				}
				catch(e)
				{
					err = true;
					console.log('Couldn\'t access \''+config.file+'\'!');
				}

				if(!err)
				{
					this.config = config;

					this.validate(file);
				}
			}
		},

		validate : function(file)
		{
			var validateConfig = require('./lib/validate-config');
			
			if(validateConfig.isValid(this))
			{
				this.job(file);
			}
		},

		job : function(file)
		{
			var json = JSON.parse(JSONcleaner.clean(file));
			
			if(!fs.existsSync('./models'))
			{
				fs.mkdirSync('./models');
			}

			if(!fs.existsSync('./controllers'))
			{
				fs.mkdirSync('./controllers');
			}

			if(!fs.existsSync('./views'))
			{
				fs.mkdirSync('./views');
			}

			var dissectModel = require('./lib/dissect-model');
			var dissectController = require('./lib/dissect-controller');
			var dissectView = require('./lib/dissect-view');
			var dissectServer = require('./lib/dissect-server');
			
			dissectServer.dissect(this, json.models);

			for(var index in json.models)
			{
				dissectModel.dissect(this, json.models[index]);
				dissectController.dissect(this, json.models[index]);
				dissectView.dissect(this, json.models[index]);
			}
		},

		help : function()
		{
			console.log('Usage: node xx.js [options argument]\n');
			console.log('Options:');

			console.log('  -h, --http-framework name\tHttp framework to use (default: express).');
			console.log('  -de, --db-engine name\t\tDB engine to use (default: mongodb).');
			console.log('  -df, --db-framework name\tDB framework to use (default: mongoose).');
			console.log('  -f, --file filepath\t\tFile to read (required).');
			console.log('  -F, --force-overwrite\t\tForce overwrite of existing files.');

			console.log('\nExample:');
			console.log('  node scaffold.js --file data.json --http-framework koa -de mysql -F');

			console.log('\nDocumentation can be found at http://github.com/mauriciogior/node-scaffold');
		},

		shell : function()
		{
			this.message('Please give me a file through -file! (ie. -file data.json)', ct.MSG_ERROR);
		},

		message : function(message, type)
		{
			if(type == ct.MSG_ERROR)
			{
				console.log('\x1b[1;97;101m%s\x1b[0m %s', '!ERROR!', message);
			}
			else if(type == ct.MSG_WARNING)
			{
				console.log('\x1b[1;41;103m%s\x1b[0m %s', '!WARNING!', message);
			}
			else if(type == ct.MSG_SUCCESS)
			{
				console.log('\x1b[1;97;42m%s\x1b[0m %s', ' SUCCESS ', message);
			}
			else if(type == ct.MSG_FAILED)
			{
				console.log('\x1b[1;97;101m%s\x1b[0m %s', '!FAIL!', message);
			}
		},

		finalize : function()
		{
			this.message('Finished scaffolding!', ct.MSG_SUCCESS);
		}
	}

	exports.exec = function()
	{
		new Scaffold();
	}
})();