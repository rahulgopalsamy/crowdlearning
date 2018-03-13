var mongoose = require('mongoose');

var SubjectSchema = mongoose.Schema({
	subjectname:{type:String, unique:true, required:true},
	description:{type:String},
    accesstoken:{type:Number,unique:true,required:true},
    created_at:{type:Date, default:Date.now}
});


module.exports = mongoose.model('Subject',SubjectSchema);
