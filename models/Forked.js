var mongoose = require("mongoose");

var ForkSchema = mongoose.Schema ({
    _question:{type:mongoose.Schema.Types.ObjectId, ref:'Questions'},
    question : {type : String},
    option1 : {type:String},
    option2 : {type:String},
    option3 : {type:String},
    option4 : {type:String},
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

module.exports = mongoose.model('Fork', DraftSchema);