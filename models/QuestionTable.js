var mongoose = require("mongoose");

var QuestionTableSchema = mongoose.Schema ({
	_subject:{type: mongoose.Schema.Types.ObjectId, ref:'Subject', required:true},
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    _creator:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    _topic : {type: mongoose.Schema.Types.ObjectId, ref:'Topic'},
       _team:{type: mongoose.Schema.Types.ObjectId, ref:'Team'},
    question : {type : String, required:true},
    _latestcopy : {type: mongoose.Schema.ObjectId, ref:'QuestionArchive'},
    issubmitted:{type:Boolean, default:false},
    status:{type: String, enum:['Approved','Working','Under Review','Rejected','Needs Revision'], required:true, default:"Working"},
    reviewedby:{type:mongoose.Schema.ObjectId, ref:'User'},
    comment:{type:String},
    isapproved:{type:Boolean, default:false},
    created_at:{type:Date, default:Date.now}
});


module.exports = mongoose.model('QuestionTable', QuestionTableSchema);
