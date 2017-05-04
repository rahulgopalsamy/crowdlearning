var mongoose = require('mongoose');

var EvaluateSchema = mongoose.Schema({
    _question : {type:mongoose.Schema.Types.ObjectId, ref:'Questions'}, 
    _evaluatedBy:{type:mongoose.Schema.Types.ObjectId, ref:'User'}, 
    clarity:{type:String, required:true},
    difficulty:{type: String, required:true},
    creativity:{type:String, required:true},
    time:{type:String, required:true},
    comments:{type:String},
    created_at:{type:Date, default:Date.now}
});



module.exports = mongoose.model('Evaluate', EvaluateSchema);