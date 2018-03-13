var mongoose = require('mongoose');


var UserQuestionSchema = mongoose.Schema({
	_subject:[{type: mongoose.Schema.Types.ObjectId, ref:'Subject', required:true}],
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    _questionid:{type:mongoose.Schema.Types.ObjectId, ref:'QuestionTable', required:true},
    _questionarchiveid:{type: mongoose.Schema.Types.ObjectId, ref:'QuestionArchive', required:true},
    _user:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    interactiontype:{type: String, enum:['creator','editor','collaborator'], required:true, default:"solve"},
    outcome:{type:Number, required:true}
    created_at:{type:Date, default:Date.now}
});



module.exports = mongoose.model('UserQuestion', UserQuestionSchema);
