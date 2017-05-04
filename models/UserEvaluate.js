var mongoose = require('mongoose');

var UserEvaluateSchema = mongoose.Schema({
    _userId:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    _questions : [{type:mongoose.Schema.Types.ObjectId, ref:'Questions'}], 
    created_at:{type:Date, default:Date.now}
});


module.exports = mongoose.model('UserEvaluate', UserEvaluateSchema);