var mongoose = require("mongoose");


var QuizSchema = mongoose.Schema({
    _subject:{type: mongoose.Schema.Types.ObjectId, ref:'Subject', required:true},
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    quizname:{type:String, required:true},
    _questions: [{type:mongoose.Schema.Types.ObjectId, ref:'QuestionBank'}],
    _creator:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    deadline:{type:Date},
    created_at:{type:Date, default:Date.now}
     });

module.exports = mongoose.model('Quiz', QuizSchema);
