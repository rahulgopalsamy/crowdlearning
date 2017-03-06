var mongoose = require("mongoose");


var QuestionBankSchema = mongoose.Schema({
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    _lead:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    _wingmen:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    _brick : {type: mongoose.Schema.Types.ObjectId, ref:'Brick', required:true},
     question : {type : String, required:true},
    options : [{type:String, required:true}],
    correctanswer:{type:String, required:true},
    explanation : {type: String, required:true},
    likes: {type:Number, default:0},
    right:{type:Number, default:0},
    wrong:{type:Number, default:0},
    _attempt:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    created_at:{type:Date, default:Date.now},
    updated_at:Date
     });

QuestionBankSchema.pre('save', function(next) {
  var currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at)
    this.created_at = currentDate;
  next();
});


module.exports = mongoose.model('QuestionBank', QuestionBankSchema);