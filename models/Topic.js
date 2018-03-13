var mongoose = require('mongoose');


var TopicSchema = mongoose.Schema({
	_subject:[{type: mongoose.Schema.Types.ObjectId, ref:'Subject', required:true}],
	_class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    topicname :{type:String, required:true},
    description:{type:String},
    created_at:{type:Date, default:Date.now}
});



module.exports = mongoose.model('Topic', TopicSchema);
