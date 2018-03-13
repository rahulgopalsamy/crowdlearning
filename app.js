
//Basic functionalities
var express = require('express');
var morgan = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressValidator = require('express-validator');
var session = require('express-session');

//Database connections
var MongoDBStore = require('connect-mongodb-session')(session);
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dbConfig = require('./db.js');
mongoose.Promise = global.Promise;

//User Authentication
var nodemailer = require('nodemailer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');

//Image upload
var fs = require('fs');
var multer = require('multer');
require('events').EventEmitter.prototype._maxListeners = 100;

//Add on modules
var assert = require('assert');
var logger = require('winston');

//data model for passport module
User = require("./models/User");

//database connection
mongoose.connect(dbConfig.url)

//Routes 
var routes = require('./routes/index');
var user = require('./routes/user');
var student = require('./routes/student');
var instructor = require('./routes/instructor');

//App Starting point
var app = express();


app.set('view engine', 'ejs');
var port = process.env.PORT || 3000;
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
app.use(cookieParser());
app.use(session({secret: 'session secret key'}))
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


app.use(multer({ 
    dest: './uploads/',
    rename: function (fieldname, filename) {
        return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
    }
}).single('file'));


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
