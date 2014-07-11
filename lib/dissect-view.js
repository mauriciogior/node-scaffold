(function()
{
	var fs = require('fs');
	var ct = require('./constants');

	var DissectView = function(scaffold)
	{
		this.scaffold = scaffold;

		this.name;
		this.nameCap;
		this.fields;
	}

	DissectView.prototype =
	{
		header : function()
		{
			var buf = "";

			buf += "doctype html\n";
			buf += "html\n";
			buf += "	head\n";
			buf += "		title " + this.nameCap + " model\n";
			buf += "		meta(charset='utf-8')\n";
			buf += "		meta(name='viewport', content='width=device-width, initial-scale=1.0')\n";
			buf += "		style.\n";
			buf += "			table { margin: 10px 0; }\n";
			buf += "			td { padding: 5px; }\n";
			buf += "	body\n";

			return buf;
		},

		dissect : function(model)
		{
			this.name = model.name.charAt(0).toLowerCase() + model.name.slice(1);
			this.nameCap = this.name.charAt(0).toUpperCase() + this.name.slice(1);

			this.fields = model.fields;
			var path = "./views/" + this.name + "/create." + ct.TE_JADE;

			if(!fs.existsSync('./views/'+ this.name))
			{
				fs.mkdirSync('./views/'+ this.name);
			}

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'' + this.name + '/create\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
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

			path = "./views/" + this.name + "/get-single." + ct.TE_JADE;

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'' + this.name + '/get-single\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
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

			path = "./views/" + this.name + "/get-all." + ct.TE_JADE;

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'' + this.name + '/get-all\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
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

			path = "./views/" + this.name + "/update." + ct.TE_JADE;

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'' + this.name + '/update\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
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

			path = "./views/" + this.name + "/delete." + ct.TE_JADE;

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'' + this.name + '/delete\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
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

			path = "./views/" + this.name + "/not-found." + ct.TE_JADE;

			if(fs.existsSync(path) && !this.scaffold.config.overwrite)
			{
				this.scaffold.message('View \'' + this.name + '/not-found\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
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
					path = "./views/" + this.name + "/create-" + this.fields[i].name + "." + ct.TE_JADE;

					if(fs.existsSync(path) && !this.scaffold.config.overwrite)
					{
						this.scaffold.message('View \'' + this.name + '/create-' + this.fields[i].name + '\' already exists! Use --force-overwrite or -F', ct.MSG_FAILED);
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

			buf += "		h1 All entries for " + this.nameCap + "\n";
			buf += "		p <b>Path:</b> /" + this.name + "\n";
			buf += "		table(border='1', cellspacing='0')\n";
			buf += "			thead\n";

			for(var i=0; i<this.fields.length; i++)
			{
				buf += "				td " + this.fields[i].name + "\n";
			}

			buf += "				td\n";

			buf += "			tbody\n";
			buf += "				-for(var i=0; i<" + this.name + "s.length; i++)\n";
			buf += "					tr\n";

			for(var i=0; i<this.fields.length; i++)
			{
				buf += "						td=" + this.name + "s[i]." + this.fields[i].name + "\n";
			}
			
			buf += "						td\n";
			buf += "							a(href='/"+ this.name + "/'+"+ this.name +"s[i]._id) View\n";

			buf += "\n		a(href='/"+ this.name + "/new') Add new entry\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'' + that.name + '/get-all\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		getSingle : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 Single entry for " + this.nameCap + "\n";
			buf += "		p <b>Path:</b> /\n";
			buf += "			a(href='/" + this.name + "') " + this.name + "\n";
			buf += "			='/'+" + this.name + "._id\n";
			buf += "		ul\n";

			for(var i=0; i<this.fields.length; i++)
			{
				if(this.fields[i].type != 'Json')
				{
					buf += "			li\n";
					buf += "				b " + this.fields[i].name + ": \n";
					buf += "				= " + this.name + "." + this.fields[i].name + " \n";
				}
				else
				{
					buf += "			li\n";
					buf += "				b " + this.fields[i].name + ": \n";
					buf += "				a(href='/" + this.name + "/'+" + this.name + "._id+'/" + this.fields[i].name + "/new') Add new " + this.fields[i].name + "\n";
					buf += "				table(border='1', cellspacing='0')\n";
					buf += "					thead\n";

					for(var j=0; j<this.fields[i].content.length; j++)
					{
						buf += "						td " + this.fields[i].content[j].name + "\n";
					}

					buf += "						td\n";

					buf += "					tbody\n";
					buf += "						-for(i=0; i<" + this.name + "." + this.fields[i].name + ".length; i++)\n";
					buf += "							tr\n";

					for(var j=0; j<this.fields[i].content.length; j++)
					{
						buf += "								td=" + this.name + "." + this.fields[i].name + "[i]." + this.fields[i].content[j].name + "\n";
					}

					buf += "								td\n";
					buf += "									a(href='/"+ this.name + "/'+"+ this.name +"._id +'/" + this.fields[i].name + "/delete') Delete\n";
				}
			}

			buf += "\n";
			buf += "		p\n";
			buf += "			a(href='/"+ this.name + "/'+"+ this.name +"._id +'/edit') Edit\n";
			buf += "			|   |   \n";
			buf += "			a(href='/"+ this.name + "/'+"+ this.name +"._id +'/delete') Delete\n";
			buf += "		p\n";
			buf += "			a(href='/"+ this.name + "') "+ this.nameCap +" home\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'' + that.name + '/get-single\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		create : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 New entry for " + this.nameCap + "\n";
			buf += "		p <b>Path:</b> /\n";
			buf += "			a(href='/" + this.name + "') " + this.name + "\n";
			buf += "			| /new\n";
			buf += "		form(action='/" + this.name + "', method='POST')\n";

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
			buf += "				a(href='/" + this.name + "')\n";
			buf += "					button(type='button') Cancel\n";

			buf += "			-if(error !== undefined)\n";
			buf += "				p Please fill all fields! Remember to validate the type of the fields!\n";

			buf += "		p\n";
			buf += "			a(href='/"+ this.name + "') "+ this.nameCap +" home\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'' + that.name + '/create\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		createIntern : function(path, field)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 New entry for " + this.nameCap + " - " + field.name + "\n";
			buf += "		p <b>Path:</b> /\n";
			buf += "			a(href='/" + this.name + "') " + this.name + "\n";
			buf += "			='/'\n";
			buf += "			a(href='/" + this.name + "/'+" + this.name + "._id)=" + this.name + "._id\n";
			buf += "			='/" + field.name + "/new'\n";
			buf += "		form(action='/" + this.name + "/'+" + this.name + "._id+'/" + field.name + "', method='POST')\n";

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
			buf += "				a(href='/" + this.name + "')\n";
			buf += "					button(type='button') Cancel\n";

			buf += "			-if(error !== undefined)\n";
			buf += "				p Please fill all fields! Remember to validate the type of the fields!\n";

			buf += "		p\n";
			buf += "			a(href='/"+ this.name + "') "+ this.nameCap +" home\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'' + that.name + '/create-' + field.name + '\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		update : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 Edit entry for " + this.nameCap + "\n";
			buf += "		p <b>Path:</b> /\n";
			buf += "			a(href='/" + this.name + "') " + this.name + "\n";
			buf += "			='/'\n";
			buf += "			a(href='/" + this.name + "/'+" + this.name + "._id)=" + this.name + "._id\n";
			buf += "			='/edit'\n";
			buf += "		form(action='/" + this.name + "/'+ " + this.name + "._id, method='POST')\n";
			buf += "			input(type='hidden', name='_method', value='PUT')\n\n";

			for(var i=0; i<this.fields.length; i++)
			{
				if(this.fields[i].type != "Json")
				{
					buf += "			fieldset\n";
					buf += "				label " + this.fields[i].name + "\n";
					buf += "				input(name='" + this.fields[i].name + "', value=" + this.name + "." + this.fields[i].name + ")\n";
				}
			}

			buf += "			fieldset\n";
			buf += "				button(action='submit') Update\n";
			buf += "				a(href='/" + this.name + "/'+" + this.name + "._id)\n";
			buf += "					button(type='button') Cancel\n";

			buf += "		p\n";
			buf += "			a(href='/"+ this.name + "') "+ this.nameCap +" home\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'' + that.name + '/update\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		delete : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 Deleted entry for " + this.nameCap + "!\n";

			buf += "		p\n";
			buf += "			a(href='/"+ this.name + "') "+ this.nameCap +" home\n";
			
			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'' + that.name + '/delete\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		notFound : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 Entry not found!\n";

			buf += "		p\n";
			buf += "			a(href='/"+ this.name + "') "+ this.nameCap +" home\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'' + that.name + '/not-found\' created!', ct.MSG_SUCCESS);
				}
			});
		}
	}

	exports.dissect = function(scaffold, model)
	{
		new DissectView(scaffold).dissect(model);
	}
})();
