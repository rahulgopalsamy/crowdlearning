const mongoose = require("mongoose");

const QuestionArchiveSchema = mongoose.Schema ({
    _subject:{type: mongoose.Schema.Types.ObjectId, ref:'Subject', required:true},
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    _questionid:{type: mongoose.Schema.Types.ObjectId, ref:'QuestionTable', required:true},
    _currentauthor:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    _creator:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    _topic : {type: mongoose.Schema.Types.ObjectId, ref:'Topic'},
    _team:{type: mongoose.Schema.Types.ObjectId, ref:'Team'},

    //Question body
    question : {type : String, required:true},
    options : [
                {type:String}
              ],
    correctanswer:{type:String},
    explanation : {type: String},
    img_explanation: {data:Buffer, contentType:String},
    img_question: {data:Buffer, contentType:String},

    //Comments from Instructor and Author
    changedescription:{type:String},
    comment:{type:String},

    status:{type: String, enum:['Approved','Working','Under Review','Rejected','Needs Revision'], required:true, default:"Working"},
    //Boolean variables
    issubmitted:  {type: Boolean, default:false},
    isnewquestion:{type:Boolean, default:false},// _creator & isnewquestion will return first copy of question
    isnewversion:{type:Boolean, default:false}, //Indicates forking of question _editor & isnewversion will return first copy of forked question
    isfinalversion: {type:Boolean, default:false}, //True - if the question was submitted, False if it is saved as draft
    isapprovedversion:{type:Boolean, default:false},
    iscollaborate:{type:Boolean, default:false}, //  True- if the creator and editor are different person
    isrevised:{type:Boolean, default:false}, // True - if the the question needed revision after submission to the instructor
    isinstructoredit:{type:Boolean, default:false},
// True - if the instructor edited the question
    created_at:{type:Date, default:Date.now}
});

QuestionArchiveSchema.index({_questionid:1, _author:1});

module.exports = mongoose.model('QuestionArchive', QuestionArchiveSchema);
