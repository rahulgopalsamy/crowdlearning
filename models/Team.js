var mongoose = require("mongoose");


var TeamSchema = mongoose.Schema({
    _subject:{type: mongoose.Schema.Types.ObjectId, ref:'Subject', required:true},
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    _creator:{type: mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    teamname: {type:String, required:true},
    token:{type:Number, required:true},
    _members:[{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true}],
    created_at:{type:Date, default:Date.now}
     });


module.exports = mongoose.model('Team', TeamSchema);
