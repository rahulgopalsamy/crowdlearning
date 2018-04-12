const mongoose = require('mongoose'),
      bcrypt = require('bcrypt'),
      SALT_WORK_FACTOR = 9;

const userSchema = mongoose.Schema({
    firstname:{type:String, required:true, trim:true},
    lastname:{type:String, required:true, trim:true},
    email:{type: String, required:true, unique:true, trim:true},
    role:{type: String, enum:['Student','Instructor','Web Admin'], required:true},
    username: {type:String, required:true, unique:true, lowercase:true, trim:true},
    _currentteam:{type:mongoose.Schema.Types.ObjectId, ref:'Team'},
    _teams:[{type:mongoose.Schema.Types.ObjectId, ref:'Team'}],
    password:{type: String,required:true},
    resetPasswordToken:String,
    resetPasswordExpires: Date,
    created_at:{type:Date, default:Date.now},
    updated_at:Date,
    lastaccessedclass:String,
    _class:[{type:mongoose.Schema.Types.ObjectId, ref:'Class'}]
  });


userSchema.pre('save', function(next) {
  let currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at)
  this.created_at = currentDate;
  next();
});


userSchema.methods.createUser = function(newUser, callback){
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        bcrypt.hash(newUser.password, salt, function(err, hash){
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

userSchema.index({email:1});

module.exports = mongoose.model('User', userSchema);
