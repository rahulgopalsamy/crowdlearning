var mongoose = require("mongoose");

var SubmissionSchema = mongoose.Schema ({
	_subject:[{type: mongoose.Schema.Types.ObjectId, ref:'Subject', required:true}],
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    _topic : {type: mongoose.Schema.Types.ObjectId, ref:'Topic', required:true},
    _creator:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    _submittedby:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    _questionarchiveid: {type:mongoose.Schema.Types.ObjectId, ref:'QuestionArchive', required:true},
    _instructor:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    status:{type: String, enum:['Approved','Needs Revision','Not Approved'], required:true, default:"Not Approved"},
    created_at:{type:Date, default:Date.now}    
});


module.exports = mongoose.model('Submission', SubmissionSchema);