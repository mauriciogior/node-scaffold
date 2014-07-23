'use strict';

var inflection = require('inflection');

exports.do = function(model)
{
	model.name = inflection.singularize(model.name.toLowerCase());

	for(var i=0; i<model.fields.length; i++)
	{
		if(model.fields[i].type == 'Json')
		{
			model.fields[i].name = inflection.singularize(model.fields[i].name.toLowerCase());
		}
	}

	return model;
}