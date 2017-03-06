/**
 * Configuration.
 */
/*
//Module dependencies.
var path = require('path'),
    logger = require('winston');

var config = {};

//Logging configuration.
config.LOG_FILENAME = './logs/thequiz_log_';
logger.add(logger.transports.DailyRotateFile, {
    filename: config.LOG_FILENAME,
    datePattern: 'dd-MM-yyyy.txt',
    handleExceptions: true,
    exitOnError: false,
    json: false,
    colorize: false,
    timestamp: true
});
config.logger = logger;
/*
//App configuration.
config.APP_TITLE = 'Crowdlearning';
config.APP_PORT = 3000;
config.APP_BASE_PATH = process.env.PWD;

//Mail configuration.
config.MAIL_SERVER_NOAUTH = false; //Set to true if you're using plain localhost mail.
config.MAIL_DEBUG = false;
config.MAIL_HOST = 'smtp.example.com'; //SMTP mail server
config.MAIL_PORT = 587; //SMTP port
config.MAIL_SECURE = false; //SSL
config.MAIL_USE_TLS = true; //TLS
config.MAIL_USERNAME = 'username@example.com';
config.MAIL_PASSWORD = '******';
config.MAIL_SENDER = 'Quiz Master <quiz@example.com>'; //From address
config.MAIL_USER_DOMAIN = '@gmail.com'; //Auto-appended to username
config.MAIL_TEMPLATE = path.join(config.APP_BASE_PATH, './views/mailer.html');
config.MAIL_LOGO = path.join(config.APP_BASE_PATH, './public/images/logo.png');

//Error messages.
config.ERR_AUTH_FAILED = 'Authentication failed, please check your username and password.';
config.ERR_AUTH_LDAP_ERROR = 'Could not authenticate properly with LDAP server. Ask your administrator to check the LDAP configuration!';
config.ERR_AUTH_LDAP_SERVER_DOWN = 'Could not connect to the authentication server!';
config.ERR_AUTH_INVALID_USERNAME = 'Username is invalid!';
config.ERR_AUTH_INVALID_PASSWORD = 'Invalid password!';
config.ERR_AUTH_NOT_LOGGED_IN = 'You must be logged in to view that page!';
config.ERR_AUTH_ACTIVATION_PENDING = 'You still haven\'t activated this account. Please check your mail!';
config.ERR_SIGNUP_ALREADY_EXISTS = 'Username already exists!';
config.ERR_SIGNUP_DATA_MISSING = 'One or more of the fields are empty.';
config.ERR_SIGNUP_PASSWORD_MISMATCH = 'Your passwords do not match.';
config.ERR_ACTIVATION_INVALID_KEY = 'Username mapped to activation key is invalid!';
config.ERR_RESET_INVALID_DETAILS = 'One of the values entered is incorrect!';
config.ERR_RESET_INVALID_USERNAME = 'Username not valid. Looks like you forgot your username as well!';
config.ERR_QUIZ_NOQUIZTODAY = 'No quiz found in database';
config.ERR_ADMIN_NOQUESTIONFOUND = 'This question no longer exists in the database.';

//Crypto configuration.
config.MASTER_SALT = 'cycle_la_illayam_kaathu_ernakulathula_illayam_vaathu';
config.RESET_PASSWORD_SALT = 'loln00b';

//Miscellaneous configuration.
config.COMPANY_SHORT_NAME = 'CIA';
config.COMPANY_LONG_NAME = 'Central Investigation Agency';
config.RESET_VALIDITY = 3; //Hours
config.SECURITY_QUESTIONS = [
    'What is your mother\'s maiden name?',
    'What is the name of your first pet?',
    'What is the name of your first boyfriend/girlfriend?',
    'What is the meaning of life?',
    'What is the average velocity of an unladen swallow?',
    'Who let the dogs out?'
]; //Make sure you don't remove any item after deployment.

// Internet Explorer 9+ Pinned sites configuration.
config.IE_START_URL = 'http://quiz_homepage.com';
config.IE_FAVICON_URL = 'http://quiz_homepage.com/images/favicon.ico';
config.IE_FAQ_URL = config.IE_START_URL + config.URL.FAQ;

//Uploads configuration.
config.UPLOAD_DIR = '/uploads/'; //Ensure this directory is inside app_dir/public/

//Overrides.
if (config.AUTH_USE_LDAP) {
    config.TEMPL_LOGIN = 'login_ldap.html'
}
*/

module.exports = config;