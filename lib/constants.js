'use strict';

(function()
{
	function define(name, value)
	{
		Object.defineProperty(exports, name,
		{
			value: value,
			enumerable: true
		});
	}

	// Constants
	define('MSG_ERROR', 0);
	define('MSG_WARNING', 1);
	define('MSG_SUCCESS', 2);
	define('MSG_FAILED', 3);

	define('HF_EXPRESS', 'express');
	define('HF_KOA', 'koa');
	define('TE_JADE', 'jade');
	define('DE_MONGODB', 'mongodb');
	define('DF_MONGOOSE', 'mongoose');

	// Validation
	define('HTTP_FRAMEWORK', ['express', 'koa']);
	define('TEMPLATE_ENGINE', ['jade', 'ejs']);
	define('DATABASE_ENGINE', ['mongodb']);
	define('DATABASE_FRAMEWORK', ['mongoose']);
})();
