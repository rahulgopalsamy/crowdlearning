var mongoose = require("mongoose");

var QuestionTableSchema = mongoose.Schema ({
	_subject:{type: mongoose.Schema.Types.ObjectId, ref:'Subject', required:true},
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    _topic : {type: mongoose.Schema.Types.ObjectId, ref:'Topic', required:true},
    _creator:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    _forked:{type:mongoose.Schema.Types.ObjectId, ref:'QuestionArchive'},
    question : {type : String, required:true},
    _team:{type: mongoose.Schema.Types.ObjectId, ref:'Team'},
    _latestcopy : {type: mongoose.Schema.ObjectId, ref:'QuestionArchive'},
    issubmitted:{type:Boolean, default:false},
    status:{type: String, enum:['Approved','Working','Under Review','Rejected','Needs Revision'], required:true, default:"Working"},
    ownership:{type:String, enum:['Creator', 'Collaborator', 'Editor'], default:'Creator'},
    reviewedby:{type:mongoose.Schema.ObjectId, ref:'User'},
    comment:{type:String},
    isapproved:{type:Boolean, default:false},
    created_at:{type:Date, default:Date.now}
});


module.exports = mongoose.model('QuestionTable', QuestionTableSchema);
