var mongoose = require("mongoose");


var PollSchema = mongoose.Schema({
    _subject:{type: mongoose.Schema.Types.ObjectId, ref:'Subject', required:true},
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    question : {type : String, required:true},
    options : [{type:String}],
    created_at:{type:Date, default:Date.now}
     });

module.exports = mongoose.model('PollSchema', PollSchema);
