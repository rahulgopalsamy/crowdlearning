var mongoose = require('mongoose');


var InteractionSchema = mongoose.Schema({
	_subject:[{type: mongoose.Schema.Types.ObjectId, ref:'Subject', required:true}],
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    _questionid:{type: mongoose.Schema.Types.ObjectId, ref:'QuestionBank', required:true},
    _user:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    interactiontype:{type: String, enum:['solve','crowdway','quiz'], required:true, default:"solve"},
    outcome:{type:Number, required:true},
    like:{type:Boolean, default:false},
    created_at:{type:Date, default:Date.now}
});



module.exports = mongoose.model('Interaction', InteractionSchema);
