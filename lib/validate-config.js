'use strict';

(function()
{
	var ct = require('./constants');

	exports.isValid = function(scaffold)
	{
		if(!~ct.HTTP_FRAMEWORK.indexOf(scaffold.config.httpFramework))
		{
			scaffold.message('\'' + scaffold.config.httpFramework +'\' isn\'t a valid http framework!', ct.MSG_ERROR);
		}
		else if(!~ct.DATABASE_FRAMEWORK.indexOf(scaffold.config.database.framework))
		{
			scaffold.message('\'' + scaffold.config.database.framework +'\' isn\'t a valid database framework!', ct.MSG_ERROR);
		}
		else if(!~ct.DATABASE_ENGINE.indexOf(scaffold.config.database.engine))
		{
			scaffold.message('\'' + scaffold.config.database.engine +'\' isn\'t a valid database engine!', ct.MSG_ERROR);
		}
		else
		{
			return true;
		}

		return false;
	}
})();
