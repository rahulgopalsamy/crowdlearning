

var express = require('express');
var router = express.Router();


//Database connections
var QuestionArchive = require('../models/QuestionArchive');
var QuestionTable = require('../models/QuestionTable');
var QuestionCollaborate = require('../models/QuestionCollaborate');
var QuestionBank = require('../models/QuestionBank');
var Class = require('../models/Class');
var User = require('../models/User');
var Topic = require('../models/Topic');
var Subject = require('../models/Subject')
var Team = require('../models/Team')

//middleware Connections
var isLoggedIn = require('./middleware/isLoggedIn');
var isInstructor = require('./middleware/isInstructor')


//landing page for the instructor
//can create a new class or choose form exsisting class
router.get('/home', isInstructor, function(req, res){
    Class.find({"_instructor":req.session.userId}).exec(function(err, myclass){
        if(err) throw err;
        res.render('instructor_landing',{data:myclass, link:"instructor"});
    })
});

router.route('/Subject')
      .get(isInstructor, function(req, res){
        res.render('instructor_add_subject', {name:"Instructor", link:"instructor"});
      })
      .post(isInstructor, function(req, res){
        var mysubject = new Subject();
        mysubject.subjectname = req.body.subjectname;
        mysubject.accesstoken = Math.floor(Math.random() * 1000000);
        mysubject.save(function(err, mysubject){
          if(err)throw err;
          res.send("Subject is created Successfully");
        })
      })

router.route('/class')
        .get(isInstructor,function(req,res){
          Subject.find({}).exec(function(err, mysubject){
              if(err) throw err;
                res.render('instructor_add_class', { data: mysubject, name:"Instructor", link:"instructor"})
              })
            })
         .post(function(req,res){
            var myclass = new Class();
            myclass._subject = req.body.subject;
            myclass._instructor = req.session.userId;
            myclass.classname = req.body.classname;
            myclass.description = req.body.description;
            myclass.year = req.body.year;
            myclass.term = req.body.term;
            myclass.accesstoken = Math.floor(Math.random() * 1000000);
            myclass.save(function(err, myclass){
                if(err) throw err;
                User.findById(req.session.userId).exec(function(err, myuser){
                  if(err) throw err;
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
            var topics = [];
            Class.findOne({classname:req.params.classname}).populate('_topic', 'topicname').exec(function(err, myclass){
                if(err) res.send(err);
                if(myclass._topic) topics = myclass._topic;
                req.session.classId = myclass._id;
                req.session.classname = myclass.classname;
                req.session.subjectId = myclass._subject;

                return res.render('instructor_add_topic',{link:"instructor", token:myclass.accesstoken ,classname:myclass.classname, data:topics});
            })
        })
        .post(function(req, res){
            var newtopic = new Topic();
            newtopic.topicname = req.body.topicname;
            newtopic.description = req.body.description;
            newtopic._class = req.session.classId;
            newtopic._subject = req.session.subjectId;
            newtopic.save(function(err, mytopic){
                if(err) throw err;
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
                if(err) res.send(err);
                req.session.classId = myclass._id;
                req.session.classname = myclass.classname;
                req.session.subjectId = myclass._subject;
                res.render('instructor_coursepage',{link:"instructor", classname:myclass.classname});
            })
        });

router.route('/:classname/createquestion')
        .get(isInstructor,function(req, res){
          var topics=[];
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
               qb.options = req.body.options;
               qb.correctanswer = req.body.correctanswer;
               qb.explanation = req.body.explanation;
               qb.save(function(err, myquestion){
                if(err) throw err;
                  res.redirect('/instructor/'+req.params.classname+'/createquestion')
               })
             }
              else res.send("draft")
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
              if(err) throw err;
              res.render('instructor_approval_list' ,{data: mytable, classname: req.params.classname, link:"instructor"});
            });
        });

 router.route('/:classname/approvalist/:id')
        .get(isInstructor, function(req, res){
         QuestionArchive.findById(req.params.id).populate('_creator').exec(function(err, submittedquestion){
              if(err) throw err;
                  req.session.creatorId = submittedquestion._creator;
                  req.session.correctanswer = submittedquestion.correctanswer;
                  req.session.topic = submittedquestion._topic;
                  req.session.questionId = submittedquestion._questionid;
                  QuestionArchive.find({_questionid:submittedquestion._questionid}).sort({created_at:1}).exec(function(err, otherarchive){
                    if(err) throw err;
                    res.render('instructor_approval_question_view', {data: otherarchive, current: submittedquestion, link: "instructor", classname: req.params.classname, qid: req.params.id})
                 })
            })
        })
        .post(isInstructor, function(req, res){
           if(req.body.submission == "approve"){
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
                if(err) throw err;
                  QuestionArchive.findByIdAndUpdate(req.params.id, {$set:{
                    isapprovedversion: true,
                    status: "Approved",
                    comment: req.body.comment
                  }}, function(err, updatedarchive){
                    if(err) throw err;
                     QuestionTable.findByIdAndUpdate(updatedarchive._questionid,{$set:{
                            reviewedby: req.session.userId,
                            comment: req.body.comment,
                            isapproved: true,
                            status:"Approved"
                     }}, function(err, updatedqt){
                        if(err) throw err;
                        res.redirect('/instructor/' + req.params.classname + '/approvalist')
                     })
                  })
               })
          } else if(req.body.submission == "revision"){
                var archive = QuestionArchive();
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
     })

router.route('/:classname/questionbank/:id')
      .get(isInstructor, function(req, res){
        QuestionBank.findById(req.params.id).exec(function(err, myquestion){
          if (err) throw err;
          res.render('instructor_questionbank_view', {current: myquestion, link:"instructor", classname:req.params.classname})
        })
      })



router.route('/:classname/teams')
  .get(isInstructor, function(req, res){
    User.find({"role":"Student"}).populate('_currentteam').exec(function(err, myuser){
      res.render("instructor_team_view",{data:myuser, classname: req.params.classname} );
    })
  })


module.exports = router;
