var mongoose = require("mongoose");


var QuizSchema = mongoose.Schema({
    quiz_name:{type:String, required:true},
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    _questions:[{type: mongoose.Schema.Types.ObjectId, ref:'QuestionBank'}], 
   _attempt:[
       {
            person:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
            score:{type:Number}
        },
       ],

    created_at:{type:Date, default:Date.now},
     });



module.exports = mongoose.model('Quiz', QuizSchema);