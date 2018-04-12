

const express = require('express'),
      router = express.Router();


//Database connections
const QuestionArchive = require('../models/QuestionArchive'),
   QuestionTable = require('../models/QuestionTable'),
   QuestionCollaborate = require('../models/QuestionCollaborate'),
   QuestionBank = require('../models/QuestionBank'),
   Class = require('../models/Class'),
   User = require('../models/User'),
   Topic = require('../models/Topic'),
   Subject = require('../models/Subject'),
   Quiz = require('../models/Quiz'),
   Interaction = require('../models/Interaction'),
   Team = require('../models/Team');
let ObjectId = require('mongodb').ObjectID;

//middleware Connections
  const isLoggedIn = require('./middleware/isLoggedIn'),
   isInstructor = require('./middleware/isInstructor');

const _ = require('lodash');

//landing page for the instructor
//can create a new class or choose form exsisting class
router.get('/home', isInstructor, function(req, res){
    Class.find({"_instructor":req.session.userId}).exec(function(err, myclass){
        if(err) return res.render("error",{error:err});
        res.render('instructor_landing',{data:myclass, link:"instructor"});
    })
});

router.route('/Subject')
      .get(isInstructor, function(req, res){
        res.render('instructor_add_subject', {name:"Instructor", link:"instructor"});
      })
      .post(isInstructor, function(req, res){
        let mysubject = new Subject();
        mysubject.subjectname = req.body.subjectname;
        mysubject.accesstoken = Math.floor(Math.random() * 1000000);
        mysubject.save(function(err, mysubject){
        if(err) return res.render("error",{error:err});
          res.send("Subject is created Successfully");
        })
      })

router.route('/class')
        .get(isInstructor,function(req,res){
          Subject.find({}).exec(function(err, mysubject){
                if(err) return res.render("error",{error:err});
                res.render('instructor_add_class', { data: mysubject, name:"Instructor", link:"instructor"})
              })
            })
         .post(function(req,res){
            let myclass = new Class();
            myclass._subject = req.body.subject;
            myclass._instructor = req.session.userId;
            myclass.classname = req.body.classname;
            myclass.description = req.body.description;
            myclass.year = req.body.year;
            myclass.term = req.body.term;
            myclass.accesstoken = Math.floor(Math.random() * 1000000);
            myclass.save(function(err, myclass){
                if(err) return res.render("error",{error:err});
                User.findById(req.session.userId).exec(function(err, myuser){
                  if(err) return res.render("error",{error:err});
                  myuser._class.push(myclass);
                  req.session.subjectId = myclass._subject;
                  req.session.classId = myclass.id;
                  req.session.classname = myclass.classname;
                  res.redirect('/instructor/'+ myclass.classname+'/addtopic');
                })
              })
            });

router.route('/:classname/addtopic')
        .get(isInstructor, function(req, res){
            let topics = [];
            Class.findOne({classname:req.params.classname}).populate('_topic', 'topicname').exec(function(err, myclass){
                if(err) return res.render("error",{error:err});
                if(myclass._topic) topics = myclass._topic;
                req.session.classId = myclass._id;
                req.session.classname = myclass.classname;
                req.session.subjectId = myclass._subject;

                return res.render('instructor_add_topic',{link:"instructor", token:myclass.accesstoken ,classname:myclass.classname, data:topics});
            })
        })
        .post(function(req, res){
            let newtopic = new Topic();
            newtopic.topicname = req.body.topicname;
            newtopic.description = req.body.description;
            newtopic._class = req.session.classId;
            newtopic._subject = req.session.subjectId;
            newtopic.save(function(err, mytopic){
                if(err) return res.render("error",{error:err});
                    Class.findById(req.session.classId, function(err, myclass){
                        if (err) return res.send(err);
                        classname = myclass.classname;
                        myclass._topic.push(mytopic);
                        myclass.save();
                         res.redirect('/instructor/'+myclass.classname +'/addtopic')
                    })
            })
        });

//course homepage
router.route('/:classname/coursepage')
        .get(isInstructor,function(req,res){
            Class.findOne({classname:req.params.classname}).exec(function(err, myclass){
                if(err) return res.render("error",{error:err});
                req.session.classId = myclass._id;
                req.session.classname = myclass.classname;
                req.session.subjectId = myclass._subject;
                res.render('instructor_coursepage',{link:"instructor", classname:myclass.classname});
            })
        });

router.route('/:classname/createquestion')
        .get(isInstructor,function(req, res){
          let topics=[];
            Class.findById(req.session.classId).populate('_topic').exec(function(err, myclass){
                if(err) return res.send(err);
                if(myclass._topic) topics = myclass._topic;
                res.render('common_create',{name:"Instructor", link:"instructor", data:topics, classname:req.session.classname})
            })
         })
        .post(isInstructor, function(req,res){
             if (req.body.submission === "final") {
              var qb = new QuestionBank()
               qb._subject = req.session.subjectId;
               qb._class = req.session.classId;
               qb._creator = req.session.userId;
               qb.question = req.body.question;
               qb._topic = req.body.topic;
               qb.isinstructorcreated = true;
               qb.options = _.compact(req.body.options);
               qb.correctanswer = req.body.correctanswer;
               qb.explanation = req.body.explanation;
               qb.save(function(err, myquestion){
                if(err) return res.render("error",{error:err});
                  res.redirect('/instructor/'+req.params.classname+'/createquestion')
               })
             }
              else {
                res.send("This feature is not implemented for instructors yet!");
              }
              });


router.route('/joinclass')
        .get(isLoggedIn, isInstructor, function(req,res){
          res.render('common_join_class', {link:"instructor"})
            })
         .post(function(req,res){
             Class.findOne({accesstoken:req.body.accesstoken}, function(err, myclass){
                         if(err) return res.send(err);
                         if(!myclass){
                                    return res.render("error",{ error:"Sorry the class you searched for is not available in crowdlearning! :("});
                                  }

                                    User.findById(req.session.userId, function(err, myuser){
                                        if(err) return res.send(err);
                                        myuser._class.push(myclass);
                                        myuser.save();
                                        myclass._instructor.push(myuser);
                                        myclass.save();
                                    req.session.subjectId = myclass._subject;
                                    req.session.classId = myclass.id;
                                    req.session.classname = myclass.classname;
                                 res.redirect('/instructor/'+ myclass.classname+'/coursepage');

             });
            });
         });

//still work has to be done
router.route('/:classname/approvalist')
        .get(isInstructor, function(req, res){
          QuestionTable.find({issubmitted:true},{_topic:1 ,question:1, status:1, _latestcopy:1, _creator:1, reviewedby:1}).populate('_creator', 'firstname lastname')
          .populate('reviewedby', 'firstname').populate('_topic', 'topicname').exec(function(err, mytable){
              if(err) return res.render("error",{error:err});
              res.render('instructor_approval_list' ,{data: mytable, classname: req.params.classname, link:"instructor"});
            });
        });

 router.route('/:classname/approvalist/:id')
        .get(isInstructor, function(req, res){
         QuestionArchive.findById(req.params.id).populate('_creator').exec(function(err, submittedquestion){
              if(err) return res.render("error",{error:err});
                  req.session.creatorId = submittedquestion._creator;
                  req.session.correctanswer = submittedquestion.correctanswer;
                  req.session.topic = submittedquestion._topic;
                  req.session.questionId = submittedquestion._questionid;
                  QuestionArchive.find({_questionid:submittedquestion._questionid}).sort({created_at:1}).exec(function(err, otherarchive){
                    if(err) return res.render("error",{error:err});
                    res.render('instructor_approval_question_view', {data: otherarchive, current: submittedquestion, link: "instructor", classname: req.params.classname, qid: req.params.id})
                 })
            })
        })
        .post(isInstructor, function(req, res){
           if(req.body.submission === "approve"){
               var qb = new QuestionBank();
               qb._subject = req.session.subjectId;
               qb._class = req.session.classId;
               qb._questionarchiveid = req.params.id;
               qb._creator = req.session.creatorId;
               qb.question = req.body.question;
               qb._topic = req.session.topic;
               qb.options = req.body.options;
               if(req.body.correctanswer) {qb.correctanswer = req.body.correctanswer;}
               else {qb.correctanswer = req.session.correctanswer;}
               qb.explanation = req.body.explanation;
               qb.save(function(err, myqb){
                if(err) return res.render("error",{error:err});
                  QuestionArchive.findByIdAndUpdate(req.params.id, {$set:{
                    isapprovedversion: true,
                    status: "Approved",
                    comment: req.body.comment
                  }}, function(err, updatedarchive){
                    if(err) return res.render("error",{error:err});
                     QuestionTable.findByIdAndUpdate(updatedarchive._questionid,{$set:{
                            reviewedby: req.session.userId,
                            comment: req.body.comment,
                            isapproved: true,
                            status:"Approved"
                     }}, function(err, updatedqt){
                        if(err) return res.render("error",{error:err});
                        res.redirect('/instructor/' + req.params.classname + '/approvalist')
                     })
                  })
               })
          } else if(req.body.submission == "revision"){
                let archive = QuestionArchive();
                  archive._subject = req.session.subjectId;
                  archive._class = req.session.classId;
                  archive._creator = req.session.userId;
                  archive._topic = req.session.topic;
                  archive._editor = req.session.userId;
                  archive._questionid = req.session.questionId;
                  archive.question = req.body.question;
                  archive.options = req.body.options;
                  if(req.body.correctanswer){archive.correctanswer = req.body.correctanswer;}
                  else{archive.correctanswer = req.session.correctanswer;}
                  archive.explanation = req.body.explanation;
                  archive.isinstructoredit = true;
                  archive.comment = req.body.comment;
                  archive.save(function(err, myarchive){
                    QuestionTable.findById(req.session.questionId).exec(function(err, myqt){
                        myqt.reviewedby = req.session.userId;
                        myqt.comment = req.body.comment;
                        myqt.status = "Needs Revision";
                        myqt._latestcopy = myarchive.id;
                        myqt.save();
                        res.redirect('/instructor/' + req.params.classname + '/approvalist')
                    })
                  })
          } else {
                QuestionTable.findById(req.session.questionId).exec(function(err, myqt){
                        myqt.reviewedby = req.session.userId;
                        myqt.comment = req.body.comment;
                        myqt.status = "Rejected"
                        myqt.save();
                        res.redirect('/instructor/' + req.params.classname + '/approvalist')
                    })
          }
        })


//should create pages for this
router.route('/:classname/questionbank')
     .get(isInstructor, function(req, res){
        QuestionBank.find({}).populate('_creator', 'firstname lastname').populate('_topic', 'topicname').sort({created_at:1}).exec(function(err, qb){
            if (err) throw err;
            res.render("instructor_questionbank_list", {data: qb, link:"instructor", classname:req.params.classname})
        })
     });

router.route('/:classname/questionbank/:id')
      .get(isInstructor, function(req, res){
        QuestionBank.findById(req.params.id).exec(function(err, myquestion){
          if (err) throw err;
          res.render('instructor_questionbank_view', {current: myquestion, link:"instructor", classname:req.params.classname})
        })
      });



router.route('/:classname/teams')
  .get(isInstructor, function(req, res){
    User.find({"role":"Student"}).populate('_currentteam').exec(function(err, myuser){
      res.render("instructor_team_view",{data:myuser, classname: req.params.classname} );
    })
  });


router.route('/:classname/quiz/create')
  .get(isInstructor, function(req, res){
    QuestionBank.find({}).populate('_topic', 'topicname').sort({created_at:1}).exec(function(err, qb){
            if (err) throw err;
            res.render("instructor_quiz_list", {data: qb, link:"instructor", classname:req.params.classname});
        })
  })
  .post(isInstructor, function(req, res){
    let myquiz = Quiz()
    myquiz._subject = req.session.subjectId;
    myquiz._class = req.session.classId;
    myquiz.quizname = req.body.quizname;
    myquiz._questions = req.body.questions;
    myquiz._creator = req.session.userId;
    myquiz.save(function(err, quiz){
      res.redirect('/instructor/'+req.params.classname+'/coursepage');
    });
  });

  router.route('/:classname/quiz/performance')
    .get(isInstructor, function(req, res){
        Quiz.find({_class:req.session.classId}).exec(function(err, myquiz){
          if(err) throw err;
          res.render('instructor_previous_quiz',{classname:req.params.classname, link:'instructor', data:myquiz});
        })
    });

router.get('/:classname/quiz/view/:id', isInstructor, function(req, res){
    Interaction.aggregate([
            { $match : { _quiz: ObjectId(req.params.id) } },
            { $group: { "_id":"$_user", Right:{$sum: "$outcome"}, Total:{$sum:1} }},
            { $lookup:{ from:"users", localField:"_id", foreignField:"_id", as:"user_doc" }}
          ], function(err, myinteraction) {
            if(err) throw err;
            res.render('instructor_quiz_report',{data:myinteraction, classname: req.params.classname, link:'instructor'});
            });
});








module.exports = router;
