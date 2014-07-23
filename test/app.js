/* Extensions */
var express = require('express')
	, mongo = require('mongodb')
	, mongoose = require('mongoose');

/* Controllers */
var personController = require('./controllers/person.js');

/* Database setup */
var mongoUri = process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	'mongodb://localhost/myapp';

mongoose.connect(mongoUri);

var db = mongoose.connection;
db.on('error', console.error.bind(console, '\n[ERROR!] Do you started mongod?\nTry this: $ mongod --dbpath ~/mongo\n\nError description:'));

db.once('open', function callback () {
	console.log('Mongoose loaded!');
});

/* Application */
var app = express();

/* Configure views */
app.set('/views', express.static(__dirname + '/views'));
app.set('view engine', 'jade');

/* Declare a static folder for assets */
app.use(express.static(__dirname + '/public'));

/* Use developer logger and body parser (do not use multipart/form-data for simple post requests) */
app.configure(function () {
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
});

/* Welcome view */
app.get('/', function(req, res) { res.send('<h1>Working!</h1>'); });

/* Views for person */
app.get('/person', personController.getPersons); // list all entries
app.get('/person/new', personController.getNewPersonForm); // create new entry form
app.get('/person/:id', personController.getPerson); // get single entry
app.get('/person/:id/edit', personController.getEditPersonForm); // edit single entry form
app.get('/person/:id/octopus/new', personController.getNewInternOctopusForm); // new octopus intern form

/* Actions for person */
app.post('/person/:id/octopus', personController.postNewInternOctopusForm); // new octopus intern
app.delete('/person/:id/octopus/:index', personController.deleteInternOctopus); // delete octopus intern

app.post('/person', personController.postPerson); // create new entry
app.put('/person/:id', personController.putPerson); // edit single entry
app.delete('/person/:id', personController.deletePerson); // delete single entry

/* Run the application */
var port = 3000;
app.listen(port, '0.0.0.0');
console.log('Listening on port '+port+ '...');
