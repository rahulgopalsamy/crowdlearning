var mongoose = require("mongoose");


var QuestionBankSchema = mongoose.Schema({
    _subject:{type: mongoose.Schema.Types.ObjectId, ref:'Subject', required:true},
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    _team:{type: mongoose.Schema.Types.ObjectId, ref:'Team', required:true},
    _questionarchiveid: {type:mongoose.Schema.Types.ObjectId, ref:'QuestionArchive'},
    _creator:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    _topic : {type: mongoose.Schema.Types.ObjectId, ref:'Topic', required:true},
    question : {type : String, required:true},
    options : [{type:String}],
    isinstructorcreated: {type:Boolean, default:false},
    correctanswer:{type:String, required:true},
    explanation : {type: String, required:true},
    likes: {type:Number, default:0},
    right:{type:Number, default:0},
    wrong:{type:Number, default:0},
    created_at:{type:Date, default:Date.now}
     });

module.exports = mongoose.model('QuestionBank', QuestionBankSchema);
