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

	define('HF_EXPRESS', 'express');
	define('HF_KOA', 'koa');
	define('DE_MONGODB', 'mongodb');
	define('DF_MONGOOSE', 'mongoose');

	// Validation
	define('HTTP_FRAMEWORK', ['express', 'koa']);
	define('DATABASE_ENGINE', ['mongodb']);
	define('DATABASE_FRAMEWORK', ['mongoose']);
})();
