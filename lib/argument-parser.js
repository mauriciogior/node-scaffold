(function()
{
	var HTTP_FRAMEWORK = '--http-framework';
	var DATABASE_ENGINE = '--db-engine';
	var DATABASE_FRAMEWORK = '--db-framework';
	var OVERWRITE = '--force-overwrite';
	var FILE = '--file';
	var HELP = '--help';

	var config = {
		httpFramework: 'express',
		templateEngine: 'jade',
		database:
		{
			engine: 'mongodb',
			framework: 'mongoose'
		},
		file : null,
		overwrite : false,
		help : false
	};

	var next = null;

	exports.parse = function(argv)
	{
		argv.forEach(function (val, index, array)
		{
			if(index >= 2)
			{
				if(next != null)
				{
					switch(next)
					{
					case HTTP_FRAMEWORK:
						config.httpFramework = val;
						break;

					case DATABASE_ENGINE:
						config.database.engine = val;
						break;

					case DATABASE_FRAMEWORK:
						config.database.framework = val;
						break;

					case FILE:
						config.file = val;
						break;
					}

					next = null;
				}

				if(val == HTTP_FRAMEWORK || val == '-h')
				{
					next = HTTP_FRAMEWORK;
				}
				else if(val == DATABASE_ENGINE || val == '-de')
				{
					next = DATABASE_ENGINE;
				}
				else if(val == DATABASE_FRAMEWORK || val == '-df')
				{
					next = DATABASE_FRAMEWORK;
				}
				else if(val == FILE || val == '-f')
				{
					next = FILE;
				}
				else if(val == OVERWRITE || val == '-F')
				{
					config.overwrite = true;
				}
				else if(val == HELP)
				{
					config.help = true;
				}
			}
		});

		return config;
	}
})();
