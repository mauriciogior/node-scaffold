/* Extensions */
var express = require('express')
	, mongo = require('mongodb')
	, mongoose = require('mongoose');

/* Controllers */
var userController = require('./controllers/user.js');

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

/* Views for user */
app.get('/user', userController.getUsers); // list all entries
app.get('/user/new', userController.getNewUserForm); // create new entry form
app.get('/user/:id', userController.getUser); // get single entry
app.get('/user/:id/edit', userController.getEditUserForm); // edit single entry form
app.get('/user/:id/devices/new', userController.getNewInternDevicesForm); // new devices intern form

/* Actions for user */
app.post('/user/:id/devices', userController.postNewInternDevicesForm); // new devices intern
app.delete('/user/:id/devices/:index', userController.deleteInternDevices); // delete devices intern

app.post('/user', userController.postUser); // create new entry
app.put('/user/:id', userController.putUser); // edit single entry
app.delete('/user/:id', userController.deleteUser); // delete single entry

/* Run the application */
var port = 3000;
app.listen(port, '0.0.0.0');
console.log('Listening on port '+port+ '...');
