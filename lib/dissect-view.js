'use strict';

(function()
{
	var fs = require('fs')
	  , ct = require('./constants')
	  , inflection = require('inflection');

	var DissectView = function(scaffold)
	{
		this.scaffold = scaffold;

		this.fields;

		this.nameSingular;
		this.nameSingularCap;
		this.namePlural;
		this.namePluralCap;
	}

	DissectView.prototype =
	{
		header : function()
		{
			var buf = "";

			buf += "doctype html\n";
			buf += "html\n";
			buf += "	head\n";
			buf += "		title " + this.nameSingularCap + " model\n";
			buf += "		meta(charset='utf-8')\n";
			buf += "		meta(name='viewport', content='width=device-width, initial-scale=1.0')\n";
			buf += "		style.\n";
			buf += "			table { margin: 10px 0; }\n";
			buf += "			td { padding: 5px; }\n";
			buf += "			p table { display: inline-block; }\n";
			buf += "	body\n";

			return buf;
		},

		dissect : function(model)
		{
			this.nameSingular = model.name;
			this.namePlural = inflection.pluralize(model.name);
			this.nameSingularCap = inflection.camelize(this.nameSingular);
			this.namePluralCap = inflection.camelize(this.namePlural);

			this.fields = model.fields;

			var path = "./views/" + this.nameSingular + "/create." + ct.TE_JADE;

			if(!fs.existsSync('./views/'+ this.nameSingular))
			{
				fs.mkdirSync('./views/'+ this.nameSingular);
			}

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'' + this.nameSingular + '/create\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
			}
			else
			{
				switch(this.scaffold.config.templateEngine)
				{
				case ct.TE_JADE:
					this.create(path);
					break;
				}
			}

			path = "./views/" + this.nameSingular + "/get-single." + ct.TE_JADE;

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'' + this.nameSingular + '/get-single\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
			}
			else
			{
				switch(this.scaffold.config.templateEngine)
				{
				case ct.TE_JADE:
					this.getSingle(path);
					break;
				}
			}

			path = "./views/" + this.nameSingular + "/get-all." + ct.TE_JADE;

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'' + this.nameSingular + '/get-all\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
			}
			else
			{
				switch(this.scaffold.config.templateEngine)
				{
				case ct.TE_JADE:
					this.getAll(path);
					break;
				}
			}

			path = "./views/" + this.nameSingular + "/update." + ct.TE_JADE;

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'' + this.nameSingular + '/update\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
			}
			else
			{
				switch(this.scaffold.config.templateEngine)
				{
				case ct.TE_JADE:
					this.update(path);
					break;
				}
			}

			path = "./views/" + this.nameSingular + "/delete." + ct.TE_JADE;

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'' + this.nameSingular + '/delete\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
			}
			else
			{
				switch(this.scaffold.config.templateEngine)
				{
				case ct.TE_JADE:
					this.delete(path);
					break;
				}
			}

			path = "./views/" + this.nameSingular + "/not-found." + ct.TE_JADE;

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'' + this.nameSingular + '/not-found\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
			}
			else
			{
				switch(this.scaffold.config.templateEngine)
				{
				case ct.TE_JADE:
					this.notFound(path);
					break;
				}
			}

			for(var i in this.fields)
			{
				if(this.fields[i].type == 'Json')
				{
					path = "./views/" + this.nameSingular + "/create-" + this.fields[i].name.toLowerCase() + "." + ct.TE_JADE;

					if(fs.existsSync(path) && !this.scaffold.config.overwrite)
					{
						this.scaffold.message('View \'' + this.nameSingular + '/create-' + this.fields[i].name.toLowerCase() + '\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
					}
					else
					{
						switch(this.scaffold.config.templateEngine)
						{
						case ct.TE_JADE:
							this.createIntern(path, this.fields[i]);
							break;
						}
					}
				}
			}
		},

		getAll : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 All entries for " + this.nameSingularCap + "\n";
			buf += "		p <b>Path:</b> /" + this.nameSingular + "\n";
			buf += "		table(border='1', cellspacing='0')\n";
			buf += "			thead\n";

			for(var i=0; i<this.fields.length; i++)
			{
				buf += "				td " + this.fields[i].name + "\n";
			}

			buf += "				td\n";

			buf += "			tbody\n";
			buf += "				-for(var i=0; i<" + this.namePlural + ".length; i++)\n";
			buf += "					tr\n";

			for(var i=0; i<this.fields.length; i++)
			{
				if(this.fields[i].type == 'Json')
				{
					buf += "						td='[Object '+" + this.namePlural + "[i]." + this.fields[i].name + ".length+']'\n";
				}
				else
				{
					buf += "						td=" + this.namePlural + "[i]." + this.fields[i].name + "\n";
				}
			}
			
			buf += "						td\n";
			buf += "							a(href='/"+ this.nameSingular + "/'+"+ this.namePlural +"[i]._id) View\n";

			buf += "\n		a(href='/"+ this.nameSingular + "/new') Add new entry\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'' + that.nameSingular + '/get-all\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		getSingle : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 Single entry for " + this.nameSingularCap + "\n";
			buf += "		p <b>Path:</b> /\n";
			buf += "			a(href='/" + this.nameSingular + "') " + this.nameSingular + "\n";
			buf += "			='/'+" + this.nameSingular + "._id\n";
			buf += "		ul\n";

			for(var i=0; i<this.fields.length; i++)
			{
				if(this.fields[i].type != 'Json')
				{
					buf += "			li\n";
					buf += "				b " + this.fields[i].name + ": \n";
					buf += "				= " + this.nameSingular + "." + this.fields[i].name + " \n";
				}
				else
				{
					buf += "			li\n";
					buf += "				b " + inflection.pluralize(this.fields[i].name) + ": \n";
					buf += "				a(href='/" + this.nameSingular + "/'+" + this.nameSingular + "._id+'/" + this.fields[i].name + "/new') Add new " + this.fields[i].name + "\n";
					buf += "				table(border='1', cellspacing='0')\n";
					buf += "					thead\n";

					for(var j=0; j<this.fields[i].content.length; j++)
					{
						buf += "						td " + this.fields[i].content[j].name + "\n";
					}

					buf += "						td\n";

					buf += "					tbody\n";
					buf += "						-for(i=0; i<" + this.nameSingular + "." + this.fields[i].name + ".length; i++)\n";
					buf += "							tr\n";

					for(var j=0; j<this.fields[i].content.length; j++)
					{
						buf += "								td=" + this.nameSingular + "." + this.fields[i].name + "[i]." + this.fields[i].content[j].name + "\n";
					}

					buf += "								td\n";
					buf += "									form(action='/"+ this.nameSingular + "/'+"+ this.nameSingular +"._id +'/" + this.fields[i].name + "/'+i, method='POST')\n";
					buf += "										input(type='hidden', name='_method', value='DELETE')\n";
					buf += "										button Delete\n";
				}
			}

			buf += "\n";
			buf += "		form(action='/" + this.nameSingular + "/'+" + this.nameSingular + "._id, method='POST')\n";
			buf += "			input(type='hidden', name='_method', value='DELETE')\n";
			buf += "			a(href='/"+ this.nameSingular + "/'+"+ this.nameSingular +"._id +'/edit')\n";
			buf += "				button(type='button') Edit\n";
			buf += "			button Delete\n";
			buf += "		p\n";
			buf += "			a(href='/"+ this.nameSingular + "') "+ this.nameSingularCap +" home\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'' + that.nameSingular + '/get-single\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		create : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 New entry for " + this.nameSingularCap + "\n";
			buf += "		p <b>Path:</b> /\n";
			buf += "			a(href='/" + this.nameSingular + "') " + this.nameSingular + "\n";
			buf += "			| /new\n";
			buf += "		form(action='/" + this.nameSingular + "', method='POST')\n";

			for(var i=0; i<this.fields.length; i++)
			{
				if(this.fields[i].type != "Json")
				{
					buf += "			fieldset\n";
					buf += "				label " + this.fields[i].name + "\n";

					if(this.fields[i].type == "Number")
						buf += "				input(name='" + this.fields[i].name + "', type='number')\n";
					else
						buf += "				input(name='" + this.fields[i].name + "', type='text')\n";
				}
			}

			buf += "			fieldset\n";
			buf += "				button(action='submit') Create\n\n";
			buf += "				a(href='/" + this.nameSingular + "')\n";
			buf += "					button(type='button') Cancel\n";

			buf += "			-if(error !== undefined)\n";
			buf += "				p Please fill all fields! Remember to validate the type of the fields!\n";

			buf += "		p\n";
			buf += "			a(href='/"+ this.nameSingular + "') "+ this.nameSingularCap +" home\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'' + that.nameSingular + '/create\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		createIntern : function(path, field)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 New entry for " + this.nameSingularCap + " - " + inflection.camelize(inflection.pluralize(field.name)) + "\n";
			buf += "		p <b>Path:</b> /\n";
			buf += "			a(href='/" + this.nameSingular + "') " + this.nameSingular + "\n";
			buf += "			='/'\n";
			buf += "			a(href='/" + this.nameSingular + "/'+" + this.nameSingular + "._id)=" + this.nameSingular + "._id\n";
			buf += "			='/" + field.name + "/new'\n";
			buf += "		form(action='/" + this.nameSingular + "/'+" + this.nameSingular + "._id+'/" + field.name + "', method='POST')\n";

			for(var i=0; i<field.content.length; i++)
			{
				buf += "			fieldset\n";
				buf += "				label " + field.content[i].name + "\n";

				if(field.content[i].type == "Number")
					buf += "				input(name='" + field.content[i].name + "', type='number')\n";
				else
					buf += "				input(name='" + field.content[i].name + "', type='text')\n";
			}

			buf += "			fieldset\n";
			buf += "				button(action='submit') Create\n\n";
			buf += "				a(href='/" + this.nameSingular + "')\n";
			buf += "					button(type='button') Cancel\n";

			buf += "			-if(error !== undefined)\n";
			buf += "				p Please fill all fields! Remember to validate the type of the fields!\n";

			buf += "		p\n";
			buf += "			a(href='/"+ this.nameSingular + "') "+ this.nameSingularCap +" home\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'' + that.nameSingular + '/create-' + field.name + '\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		update : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 Edit entry for " + this.nameSingularCap + "\n";
			buf += "		p <b>Path:</b> /\n";
			buf += "			a(href='/" + this.nameSingular + "') " + this.nameSingular + "\n";
			buf += "			='/'\n";
			buf += "			a(href='/" + this.nameSingular + "/'+" + this.nameSingular + "._id)=" + this.nameSingular + "._id\n";
			buf += "			='/edit'\n";
			buf += "		form(action='/" + this.nameSingular + "/'+ " + this.nameSingular + "._id, method='POST')\n";
			buf += "			input(type='hidden', name='_method', value='PUT')\n\n";

			for(var i=0; i<this.fields.length; i++)
			{
				if(this.fields[i].type != "Json")
				{
					buf += "			fieldset\n";
					buf += "				label " + this.fields[i].name + "\n";
					buf += "				input(name='" + this.fields[i].name + "', value=" + this.nameSingular + "." + this.fields[i].name + ")\n";
				}
			}

			buf += "			fieldset\n";
			buf += "				button(action='submit') Update\n";
			buf += "				a(href='/" + this.nameSingular + "/'+" + this.nameSingular + "._id)\n";
			buf += "					button(type='button') Cancel\n";

			buf += "		p\n";
			buf += "			a(href='/"+ this.nameSingular + "') "+ this.nameSingularCap +" home\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'' + that.nameSingular + '/update\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		delete : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 Deleted entry for " + this.nameSingularCap + "!\n";

			buf += "		p\n";
			buf += "			a(href='/"+ this.nameSingular + "') "+ this.nameSingularCap +" home\n";
			
			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'' + that.nameSingular + '/delete\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		notFound : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 Entry not found!\n";

			buf += "		p\n";
			buf += "			a(href='/"+ this.nameSingular + "') "+ this.nameSingularCap +" home\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'' + that.nameSingular + '/not-found\' created!', ct.MSG_SUCCESS);
				}
			});
		}
	}

	exports.dissect = function(scaffold, model)
	{
		new DissectView(scaffold).dissect(model);
	}
})();
