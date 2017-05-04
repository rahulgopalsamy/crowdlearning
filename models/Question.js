var mongoose = require("mongoose");

var QuestionSchema = mongoose.Schema ({
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    _lead:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    _wingmen:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    _brick : {type: mongoose.Schema.Types.ObjectId, ref:'Brick', required:true},
    question : {type : String, required:true},
    options : [{type:String, required:true}],
    correctanswer:{type:String, required:true},
    explanation : {type: String, required:true},
    status:{type: String, enum:['Approved','Edit','Not Approved'], required:true, default:"Not Approved"},
    _evaluate:[{type:mongoose.Schema.Types.ObjectId, ref:'Evaluate'}],
    created_at:{type:Date, default:Date.now},
    updated_at: Date
});

QuestionSchema.pre('save', function(next) {
  var currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at)
  this.created_at = currentDate;
  next();
});


module.exports = mongoose.model('Question', QuestionSchema);