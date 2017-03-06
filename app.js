var express = require('express');
var morgan = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MongoDBStore = require('connect-mongodb-session')(session);
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dbConfig = require('./db.js');
var assert = require('assert');
require('events').EventEmitter.prototype._maxListeners = 100;
mongoose.Promise = global.Promise;
//data model for passport module
User = require("./models/User");

//database connection
mongoose.connect(dbConfig.url)

var routes = require('./routes/index');
var user = require('./routes/user');
var student = require('./routes/student');
var instructor = require('./routes/instructor');

var app = express();


app.set('view engine', 'ejs');
var port = process.env.PORT || 80;
// setting store for saving session
var store = new MongoDBStore(
      {
        uri: 'mongodb://test:test@ds019936.mlab.com:19936/crowdlearning',
        collection: 'mysessions'
      });
    store.on('error', function(error) {
      assert.ifError(error);
      assert.ok(false);
    });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));

//The ORDER of middleware used is important
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(require('express-session')({
      secret: 'This is a secret',
      cookie: {
        maxAge: 1000 * 60 * 60 * 20 
      },
      store: store,
      resave: true,
      saveUninitialized: true
    }));

//middleware supporting PASSPORT module
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware for routes conncetion
app.use('/', routes);
app.use('/user', user);
app.use('/student', student);
app.use('/instructor', instructor);

mongoose.set('debug', true);
app.listen(port);

console.log('The app is running on port ' + port);
