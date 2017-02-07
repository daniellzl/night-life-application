/***********
DEPENDENCIES
***********/

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Yelp = require('yelp');
var expressSanitizer = require('express-sanitizer');
var Venue = require('./models/venue.js');
require('dotenv').config();

/*****
SET-UP
*****/
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

/*******
DATABASE
*******/

var connectionString = process.env.MONGO_DB;
mongoose.connect(connectionString);
var db = mongoose.connection;
db.on('error', function(){
    console.log('There was an error connecting to the database');
});
db.once('open', function() {
    console.log('Successfully connected to database');
});

/*****
ROUTES
*****/

var indexRoutes = require('./routes/index');
var searchRoutes = require('./routes/search');
var updateRoutes = require('./routes/update');
app.use('/', indexRoutes);
app.use('/search', searchRoutes);
app.use('/update', updateRoutes);

var port = process.env.PORT || 8080;
app.listen(port, function(req, res) {
  console.log('Listening on port ' + port);
});
