var mongoose = require("mongoose");

var QuestionArchiveSchema = mongoose.Schema ({
    _subject:{type: mongoose.Schema.Types.ObjectId, ref:'Subject', required:true},
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    _questionid:{type: mongoose.Schema.Types.ObjectId, ref:'QuestionTable', required:true},
    _team:{type: mongoose.Schema.Types.ObjectId, ref:'Team', required:true},
    _creator:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    _editor:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    _topic : {type: mongoose.Schema.Types.ObjectId, ref:'Topic', required:true},
    question : {type : String, required:true},
    options : [
                {type:String}
              ],
    correctanswer:{type:String},
    explanation : {type: String},
    changedescription:{type:String},
    img: {data:Buffer, contentType:String},
    comment:{type:String}, // shows instructor comment
    submitted:  {type: Boolean, default:false},
    isnewquestion:{type:Boolean, default:false},// _creator & isnewquestion will return first copy of question
    isnewversion:{type:Boolean, default:false}, //Indicates forking of question _editor & isnewversion will return first copy of forked question
    isfinalversion: {type:Boolean, default:false}, //True - if the question was submitted, False if it is saved as draft
    isapprovedversion:{type:Boolean, default:false},
    iscollaborate:{type:Boolean, default:false}, //  True- if the creator and editor are different person
    isrevised:{type:Boolean, default:false}, // True - if the the question needed revision after submission to the instructor
    isinstructoredit:{type:Boolean, default:false},
    status:{type: String, enum:['Approved','Working','Under Review','Rejected','Needs Revision'], required:true, default:"Working"},
    ownership:{type:String, enum:['Creator', 'Collaborator', 'Editor'], default:'Creator'},// True - if the instructor edited the question
    created_at:{type:Date, default:Date.now}
});



module.exports = mongoose.model('QuestionArchive', QuestionArchiveSchema);
