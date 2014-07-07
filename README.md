# Node Scaffold
Quick scaffolding on several frameworks!

### Installation

```shell
$ npm install node-scaffold -g
```

## Quick Usage

You will need to create a file to place your scaffold (shell also in future).

Here is a sample of this file:

**scaffold.json**
```json
/* SAMPLE */

{
	"models": [
		{
			"name": "User", // always singular!
			"crud": true,
			"fields": [
				{ "name": "name", "type": "String" },
				{ "name": "username", "type": "String", "unique": true },
				{ "name": "password", "type": "String" },
				{ "name": "age", "type": "Number" },
				{
					"name": "devices",
					"type": "Json",
					"content": [
						{ "name": "model", "type": "String" },
						{ "name": "color", "type": "Number" }
					]
				}
			]
		},
		{
			"name": "Car", // always singular!
			"crud": true,
			"fields": [
				{ "name": "name", "type": "String" },
				{ "name": "username", "type": "String", "unique": true },
				{ "name": "password", "type": "String" },
				{ "name": "age", "type": "Number" },
				{
					"name": "devices",
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
require('../index.js').exec();
```

Now, just execute it!
```shell
$ node scaffold.js --file /path/to/scaffold.json
```

To see other usage options, just
```shell
$ node scaffold.js --help
```

## TODO List
* ✓ ~~Generate models~~
* Generate controllers
* Generate views
* Accept other http frameworks (besides express)
* Accept other db engines (besides mongodb)
* Accept other db frameworks (besides mongoose)
* Accept other layout engine (besides jade)
* Allow shell scaffolding