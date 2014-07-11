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
db.on('error', console.error.bind(console, 'Do you started mongod?\nTry this: $ mongod --dbpath ~/mongo\n\n connection error:'));

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
});

/* Views for user */
app.get('/users', user.getUsers); // list all entries
app.get('/user/new', user.getNewUserForm); // create new entry form
app.get('/user/:id', user.getUser); // get single entry
app.get('/user/:id/edit', user.getEditUserForm); // edit single entry form

/* Actions for user */
app.post('/user', user.postUser); // create new entry
app.put('/user/:id', user.editUser); // edit single entry
app.delete('/user/:id', user.deleteUser); // delete single entry

/* Run the application */
var port = 3000;
app.listen(port, '0.0.0.0');
console.log('Listening on port '+port+ '...');
