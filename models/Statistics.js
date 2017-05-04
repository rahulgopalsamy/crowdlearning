var mongoose = require("mongoose");


var StatSchema = mongoose.Schema({
    quizId:{type:mongoose.Schema.Types.ObjectId, ref:'Quiz'},
    userId:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    score:{type:Number},
    created_at:{type:Date, default:Date.now},
     });


module.exports = mongoose.model('Statistics', StatSchema);