var mongoose = require("mongoose");


var QuestionSchema = mongoose.Schema ({
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    _lead:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    _wingmen:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    _brick : {type: mongoose.Schema.Types.ObjectId, ref:'Brick'},
    question : {type : String},
    options : [{type:String}],
    correctanswer:{type:String},
    explanation : {type: String},
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