var mongoose = require("mongoose");

var QuestionCollaborateSchema = mongoose.Schema ({
    _creator:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    _collaborator:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    _questionid:{type: mongoose.Schema.Types.ObjectId, ref:'QuestionTable', required:true},
    time:{type:Date, default:Date.now}    
});


module.exports = mongoose.model('QuestionCollaborate', QuestionCollaborateSchema);