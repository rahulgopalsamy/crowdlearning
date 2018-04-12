var mongoose = require('mongoose');


var InteractionSchema = mongoose.Schema({
	_subject:[{type: mongoose.Schema.Types.ObjectId, ref:'Subject', required:true}],
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    _quiz:{type:mongoose.Schema.Types.ObjectId, ref:'Quiz'},
    _questionid:{type: mongoose.Schema.Types.ObjectId, ref:'QuestionBank', required:true},
    _user:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    interactiontype:{type: String, enum:['solve','crowdway','quiz'], default:"quiz"},
    outcome:{type:Number,default:0 },
    like:{type:Boolean, default:false},
    interacted_at:{type:Date, default:Date.now}
});

InteractionSchema.index({_user:1, _questionid:1});
module.exports = mongoose.model('Interaction', InteractionSchema);
