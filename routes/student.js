var express = require('express');
var router = express.Router();
var fs = require('fs');


//models connection
var QuestionArchive = require('../models/QuestionArchive');
var QuestionTable = require('../models/QuestionTable');
var Class = require('../models/Class');
var User = require('../models/User');
var Topic = require('../models/Topic');
var Team = require('../models/Team');



//middleware
var isLoggedIn = require('./middleware/isLoggedIn');


router.get('/home', isLoggedIn, function(req, res){
    User.findById(req.session.userId).populate('_class', 'classname').exec(function(err, myuser){
        if(err) return res.send(err);
        res.render('student_landing',{data:myuser._class})
    })
});

router.get('/course', isLoggedIn, function(req, res){
       User.findById(req.session.userId).populate('_class', 'classname').exec(function(err, myuser){
        if(err) return res.send(err);
        if(myuser.lastaccessedclass) { res.redirect('/student/'+myuser.lastaccessedclass+'/coursepage')}
        else {res.render('student_landing',{data:myuser._class})}
    })
})

router.route('/joinclass')
        .get(isLoggedIn, function(req,res){
          res.render('common_join_class', {link:"student"})
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
                                        myuser.lastaccessedclass = myclass.classname;
                                        myuser.save();
                                        myclass._student.push(myuser);
                                        myclass.save();
                                    req.session.subjectId = myclass._subject;
                                    req.session.classId = myclass._id;
                                    req.session.classname = myclass.classname;
                                 res.redirect('/student/'+ myclass.classname+'/coursepage');

             });
            });
         })

 router.route('/:classname/myteam')
        .get(isLoggedIn, function(req, res){
          team = {}
          User.findById(req.session.userId).populate('_currentteam').exec(function(err, myuser){
             console.log(myuser)
            if(myuser._currentteam) team = myuser._currentteam
             res.render('myteam', {name:myuser.firstname, data:team, link:"student", classname:req.params.classname})
          })
        })


router.route('/:classname/newteam')
        .get(isLoggedIn, function(req, res){
          res.render('createteam',{classname: req.params.classname})
        })
        .post(isLoggedIn, function(req, res){
            var newteam = new Team();
            newteam._subject = req.session.subjectId;
            newteam._class = req.session.classId;
            newteam.teamname = req.body.teamname;
            newteam._creator = req.session.userId;
            newteam._members = req.session.userId;
            newteam.token = Math.floor(Math.random() * 100000);
            newteam.save(function(err,myteam){
              if (err) throw err;
              req.session.teamId = myteam.id
              User.findById(req.session.userId).exec(function(err, myuser){
                myuser._currentteam = myteam.id
                myuser._teams.push(myteam)
                myuser.save();
                res.redirect('/student/'+req.params.classname + '/myteam');
              })
            })
        })

router.route('/:classname/jointeam')
      .get(isLoggedIn, function(req, res){
        res.render('jointeam',{classname: req.params.classname})
      })
      .post(isLoggedIn, function(req, res){
        Team.findOne({token:req.body.token}, function(err, myteam){
          if(err) return res.send(err);
                         if(!myteam){
                                    return res.render("error",{ error:"Invalid team token"});
                                  }
            req.session.teamId = myteam.id
            myteam._members.push(req.session.userId)
            myteam.save()
           User.findById(req.session.userId).exec(function(err, myuser){
            myuser._currentteam = myteam.id
            myuser._teams.push(myteam.id)
            myuser.save()
            res.redirect('/student/'+req.params.classname + '/myteam')
           })
        })
      })


/*
router.get('/:classname/coursepage',isLoggedIn, function(req, res){
             Class.findOne({classname:req.params.classname}).exec(function(err, myclass){
                if(err) res.send(err);
                User.findById(req.session.userId, function(err, myuser){
                  if(err) throw (err);
                  myuser.lastaccessedclass = req.params.classname;
                  myuser.save();
                   req.session.subjectId = myclass._subject;
                   req.session.classname = myclass.classname;
                   req.session.classId = myclass._id;
                   res.render("student_coursepage", {link:"student", classname:req.params.classname});
                })
              })
           });
*/

router.get('/:classname/coursepage', isLoggedIn, function(req, res){
          Class.findOne({classname:req.params.classname}).exec(function(err, myclass){
                if(err) res.send(err);
                User.findById(req.session.userId, function(err, myuser){
                  if(err) throw (err);
                  myuser.lastaccessedclass = req.params.classname;
                  myuser.save();
                   req.session.subjectId = myclass._subject;
                   req.session.classname = myclass.classname;
                   req.session.classId = myclass._id;
                   res.redirect('/student/'+req.params.classname + '/myquestions');
                })
              })
})

//Allows Students to create new question.
router.route('/:classname/createquestion')
        .get(isLoggedIn,function(req, res){
          var topics=[];
            Class.findById(req.session.classId).populate('_topic').exec(function(err, myclass){
                if(err) return res.send(err);
                if(myclass._topic) topics = myclass._topic;
                res.render('common_create',{name:req.session.student, link:"student",data:topics, classname:req.session.classname})
            })
        })
        .post(isLoggedIn, function(req,res){
              var questionTable = new QuestionTable();
              questionTable._subject = req.session.subjectId;
              questionTable._class = req.session.classId;
              questionTable._creator = req.session.userId;
              questionTable._topic = req.body.topic;
              questionTable._team = req.session.teamId;
              questionTable.question = req.body.question;
              if(req.body.submission == "final") {
                  questionTable.status = "Under Review"
                  questionTable.issubmitted = true;
            }
              questionTable.save(function(err,question){

                  if(err) throw err;

                  var archive = new QuestionArchive();
                    archive._subject = req.session.subjectId;
                    archive._class = req.session.classId;
                    archive._creator = req.session.userId;
                    archive._topic = req.body.topic;
                    archive._editor = req.session.userId;
                    archive._questionid = question.id;
                    archive._team = req.session.teamId;
                    archive.question = req.body.question;
                    archive.options = req.body.options;
                    archive.correctanswer = req.body.correctanswer;
                    archive.explanation = req.body.explanation;
                    archive.isnewquestion = true;
                    if(req.body.submission == "final") {
                      archive.isfinalversion = true;
                      archive.submitted = true;
                      archive.status = "Under Review";
                    }
                  archive.save(function(err,archive_entry){
                      if(err) throw err;
                      question._latestcopy = archive_entry.id;
                      question.save();
                      res.redirect('/student/' + req.params.classname+'/myquestions');
                      })
                  })
              });

//
router.route('/:classname/myquestions')
        .get(isLoggedIn, function(req, res){
                    QuestionTable.find({_team:req.session.teamId},{question:1, _latestcopy:1, issubmitted:1, status:1, _topic:1, created_at:1}).populate('_topic', 'topicname').exec(function(err, myquestions){
                        if(err) throw err;
                        res.render('student_myquestion', {data:myquestions, link:"student", classname: req.params.classname});
                    })
                })

//Displays an question with all previously created versions
//The id param used here is from QuestionArchive table
router.route('/:classname/myquestions/:id')
      .get(isLoggedIn, function(req,res){
            QuestionArchive.findById(req.params.id).exec(function(err, myquestion){
              if(err) throw err;
              if(myquestion.status == "Under Review"){
                  QuestionArchive.find({_questionid:myquestion._questionid}).sort({created_at:1}).exec(function(err, myarchive){
                    if(err) throw err;
                    res.render('student_edit_nochange', {data: myarchive, current: myquestion, link: "student", classname: req.params.classname, qid: req.params.id})
                 })
              }
              else {
                 req.session.topicId = myquestion._topic;
                 req.session.questionId = myquestion._questionid;
                 QuestionArchive.find({_questionid:myquestion._questionid}).populate('_editor', 'firstname lastname').sort({created_at:1}).exec(function(err, myarchive){
                    if(err) throw err;
                    console.log(myarchive);
                    req.session.creator = myarchive[0]._creator
                    res.render('student_edit', {data: myarchive, current: myquestion, link: "student", classname: req.params.classname, qid: req.params.id})
                 })
              }
            })
         })
      .post(isLoggedIn, function(req,res){
                 var archive = new QuestionArchive();
                  archive._subject = req.session.subjectId;
                  archive._class = req.session.classId;
                  archive._creator = req.session.creator;
                  archive._topic = req.session.topicId;
                  archive._editor = req.session.userId;
                  archive._questionid =  req.session.questionId;
                  archive.question = req.body.question;
                  archive.options = req.body.options;
                  archive._team = req.session.teamId;
                  archive.correctanswer = req.body.correctanswer;
                  archive.explanation = req.body.explanation;
                  if(req.body.submission == "final") {
                    archive.isfinalversion = true;
                    archive.submitted = true;
                    archibe.status = "Under Review";
                  }
                  archive.changedescription = req.body.changedescription;
                  archive.save(function(err, archive_entry){
                    if (err) throw err;
                    QuestionTable.findById(req.session.questionId).exec(function(err, myqtable){
                      myqtable._latestcopy = archive_entry.id;
                      myqtable.question = archive_entry.question;
                      if(req.body.submission == "final") {myqtable.status = "Under Review"
                        questionTable.issubmitted = true;
                    }
                      myqtable.save();
                      req.session.topicId = null;
                      req.session.questionId = null;
                      res.redirect("/student/"+req.params.classname +"/myquestions");
                    })
                  })
      });





module.exports = router;
