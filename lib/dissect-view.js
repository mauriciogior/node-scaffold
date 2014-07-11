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

			buf += "!!!\n";
			buf += "html\n";
			buf += "	head\n";
			buf += "		title " + this.nameCap + " model\n";
			buf += "		meta(charset='utf-8')\n";
			buf += "		meta(name='viewport', content='width=device-width, initial-scale=1.0')\n";
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
				this.scaffold.message('View \'create' + this.nameCap + '\' already exists! Use --force-overwrite or -F', ct.MSG_WARNING);
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
				this.scaffold.message('View \'get' + this.nameCap + '\' already exists! Use --force-overwrite or -F', ct.MSG_WARNING);
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
				this.scaffold.message('View \'get' + this.nameCap + 's\' already exists! Use --force-overwrite or -F', ct.MSG_WARNING);
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
				this.scaffold.message('View \'update' + this.nameCap + '\' already exists! Use --force-overwrite or -F', ct.MSG_WARNING);
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
				this.scaffold.message('View \'delete' + this.nameCap + '\' already exists! Use --force-overwrite or -F', ct.MSG_WARNING);
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
		},

		getAll : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 All entries for " + this.nameCap + "\n";
			buf += "		table\n";
			buf += "			thead\n";

			for(var i=0; i<this.fields.length; i++)
			{
				buf += "				td " + this.fields[i].name + "\n";
			}

			buf += "				td Edit\n";
			buf += "				td Delete\n";

			buf += "			tbody\n";
			buf += "				-for(var i=0; i<" + this.name + "s.length; i++)\n";
			buf += "					tr\n";

			for(var i=0; i<this.fields.length; i++)
			{
				buf += "						td " + this.name + "s[i]." + this.fields[i].name + "\n";
			}
			
			buf += "						td\n";
			buf += "							a(href='/"+ this.name + "/'+="+ this.name +"s[i]._id) Edit\n";

			buf += "						td\n";
			buf += "							a(href='/"+ this.name + "/'+="+ this.name +"s[i]._id +'/delete') Delete\n";
			
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
					that.scaffold.message('View \'get' + that.nameCap + 's\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		getSingle : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 Single entry for " + this.nameCap + "\n";
			buf += "		ul\n";

			for(var i=0; i<this.fields.length; i++)
			{
				buf += "			li= '<b>" + this.fields[i].name + ": </b>' + " + this.name + "." + this.fields[i].name + " \n";
			}

			buf += "		a(href='/"+ this.name + "/'+="+ this.name +"._id) Edit\n";

			buf += "		a(href='/"+ this.name + "/'+="+ this.name +"._id +'/delete') Delete\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'get' + that.nameCap + '\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		create : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 New entry for " + this.nameCap + "\n";
			buf += "		form(action='/" + this.name + "', method='POST')\n";

			for(var i=0; i<this.fields.length; i++)
			{
				if(this.fields[i].type != "Json")
				{
					buf += "			fieldset\n";
					buf += "				label " + this.fields[i].name + "\n";
					buf += "				input(name='" + this.fields[i].name + "')\n";
				}
			}

			buf += "			fieldset\n";
			buf += "				button(action='submit') Create\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'create' + that.nameCap + '\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		update : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 Edit entry for " + this.nameCap + "\n";
			buf += "		form(action='/" + this.name + "', method='POST')\n";
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

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'update' + that.nameCap + '\' created!', ct.MSG_SUCCESS);
				}
			});
		},

		delete : function(path)
		{
			var buf = "";

			buf += this.header();

			buf += "		h1 Deleted entry for " + this.nameCap + "!\n";
			buf += "		a(href='/') Go back\n";

			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'update' + that.nameCap + '\' created!', ct.MSG_SUCCESS);
				}
			});
			
			var that = this;

			fs.writeFile(path, buf, function(err,data)
			{
				if(err)
				{
					that.scaffold.message('Error writing file (Skipping): ' + err, ct.MSG_ERROR);
				}
				else
				{
					that.scaffold.message('View \'delete' + that.nameCap + '\' created!', ct.MSG_SUCCESS);
				}
			});
		}
	}

	exports.dissect = function(scaffold, model)
	{
		new DissectView(scaffold).dissect(model);
	}
})();
