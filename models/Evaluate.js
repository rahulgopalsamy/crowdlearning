var mongoose = require('mongoose');

var EvaluateSchema = mongoose.Schema({
    _question : {type:mongoose.Schema.Types.ObjectId, ref:'Questions'}, 
    _evaluatedBy:{type:mongoose.Schema.Types.ObjectId, ref:'User'}, 
    stem :{type:String, required:true},
    clarity_lan:{type:String, required:true},
    question_setup:{type: String, required:true},
    predicted:{type:String, required:true},
    comments:{type:String},
    created_at:{type:Date, default:Date.now}
});



module.exports = mongoose.model('Evaluate', EvaluateSchema);