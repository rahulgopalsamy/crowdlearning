var mongoose = require('mongoose');

var ClassSchema = mongoose.Schema({
    classtoken:{type:Number,unique:true,required:true},
    classname :{type:String,unique:true, required:true},
    _instructor:[{type: mongoose.Schema.Types.ObjectId, ref:'User', required:true}],
    _students :[{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
    _bricks:[{type:mongoose.Schema.Types.ObjectId, ref:'Brick'}],
    _questions:[{type: mongoose.Schema.Types.ObjectId, ref:'Question'}],
    _questionBank:[{type:mongoose.Schema.Types.ObjectId, ref:'QuestionBank'}],
    _quizzes:[{type:mongoose.Schema.Types.ObjectId, ref:'Quiz'}],
    created_at:{type:Date, default:Date.now}
});


module.exports = mongoose.model('Class',ClassSchema);
