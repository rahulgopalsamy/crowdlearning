var mongoose = require("mongoose");


var AnnoucementSchema = mongoose.Schema({
    _subject:{type: mongoose.Schema.Types.ObjectId, ref:'Subject', required:true},
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    _creator:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    _lable : {type: mongoose.Schema.Types.ObjectId, ref:'Lable', required:true},
    annoucement : {type : String, required:true},
    expiry:{type:Date},
    created_at:{type:Date, default:Date.now}
     });

module.exports = mongoose.model('AnnoucementSchema', AnnoucementSchema);
