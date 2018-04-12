const mongoose = require('mongoose');

const ClassSchema = mongoose.Schema({
	_subject:{type: mongoose.Schema.Types.ObjectId, ref:'Subject', required:true},
    classname :{type:String, unique:true, required:true},
	_instructor:[{type: mongoose.Schema.Types.ObjectId, ref:'User', required:true}],
	_student: [{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
	description:{type:String},
    accesstoken:{type:Number,unique:true,required:true},
    term:{type:String, required:true},
    year:{type:Number, required:true},
    _topic:[{type:mongoose.Schema.Types.ObjectId, ref:'Topic'}],
    created_at:{type:Date, default:Date.now}
});

ClassSchema.index({classname:1, _instructor:1});

module.exports = mongoose.model('Class',ClassSchema);
