var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 9;
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = mongoose.Schema({
    firstname:{type:String, required:true},
    lastname:{type:String, required:true},
    email:{type: String, required:true, unique:true},
    role:{type: String, enum:['Student','Instructor','Web Admin'], required:true},
    username: {type:String, required:true, unique:true, lowercase:true},
    password:{type: String,required:true},
    ub_number:{type:Number, required:true},
    created_at:{type:Date, default:Date.now},
    updated_at:Date,
    _class:[{type:mongoose.Schema.Types.ObjectId, ref:'Class',unique:true}],
    _questions:[{type:mongoose.Schema.Types.ObjectId, ref:'Question'}],
    _solved:[{type:mongoose.Schema.Types.ObjectId, ref:'QuestionBank', unique:true}],
});


userSchema.pre('save', function(next) {
  var currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at)
  this.created_at = currentDate;
  next();
});


userSchema.methods.createUser = function(newUser, callback){
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        console.log(salt);
        bcrypt.hash(newUser.password, salt, function(err, hash){
            newUser.password = hash;
                    console.log(newUser.password);

            newUser.save(callback);
        });
    });
}

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);