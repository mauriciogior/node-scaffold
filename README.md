# Node Scaffold
Quick scaffolding on several frameworks!

### Installation

```shell
$ npm install node-scaffold -g
```

### Description

v0.1.1
Now it is only working with Express + MongoDB + Mongoose.

I'll add another more options later!

Working:
* ✓ ~~Generate models~~
* ✓ ~~Generate controllers~~
* ✓ ~~Generate views~~
* ✓ ~~Generate application~~
* ✓ ~~Inflection working (in English)~~

## Quick Usage

You will need to create a file to place your scaffold (shell also in future).

Here is a sample of this file:

**scaffold.json**
```json
/* SAMPLE */

{
	"models": [
		{
			"name": "Person", // always singular!
			"crud": true,
			"fields": [
				{ "name": "name", "type": "String" },
				{ "name": "username", "type": "String", "unique": true },
				{ "name": "password", "type": "String" },
				{ "name": "age", "type": "Number" },
				{
					"name": "Car", // always singular!
					"type": "Json",
					"content": [
						{ "name": "model", "type": "String" },
						{ "name": "color", "type": "Number" }
					]
				}
			]
		}
	]
}

```

After that, you need to create a file where you want to scaffold:

**scaffold.js**
```javascript
require('node-scaffold').exec();
```

Now, just execute it!
```shell
$ node scaffold.js --file /path/to/scaffold.json
```

Remeber to install all dependencies!
```shell
$ sudo npm install
```

Now you just need to test your routes! In this example:
```shell
node app.js

curl http://localhost:3000/user
curl http://localhost:3000/car
```

To see other usage options (very limited at the moment), just
```shell
$ node scaffold.js --help

Usage: node xx.js [options argument]

Options:
  -h,  --http-framework name  Http framework to use (default: express).
  -de, --db-engine name       DB engine to use (default: mongodb).
  -df, --db-framework name    DB framework to use (default: mongoose).
  -f,  --file filepath        File to read (required).
  -F,  --force-overwrite      Force overwrite of existing files.

Example:
  node scaffold.js --file data.json

Documentation can be found at http://github.com/mauriciogior/node-scaffold
```

### Having problems?

*If you have problems like "cannot find module 'node-scaffold'", probably your NODE_PATH is wrong!*

*In mac:*
```shell
$ export NODE_PATH=/usr/local/lib/node_modules
```

*In linux: you can handle it :)*

## TODO List
* Add relationships between models
* Use EJS for templating (intern)
* Accept other http frameworks (besides express)
* Accept other db engines (besides mongodb)
* Accept other db frameworks (besides mongoose)
* Accept other layout engine (besides jade)
* Allow shell scaffolding