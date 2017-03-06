var express = require('express');
var router = express.Router();


//Database connections
var User = require('../models/User'); 
var Question = require('../models/Question');
var Class = require('../models/Class');
var Brick = require('../models/Brick');
var QuestionBank = require('../models/QuestionBank');
var Quiz = require('../models/Quiz');

//middleware Connections
var isLoggedIn = require('./middleware/isLoggedIn');
var isInstructor = require('./middleware/isInstructor')


//landing page for the instructor
//can create a new class or choose form exsisting class
router.get('/home', function(req, res){
    User.findById(req.session.userId).populate('_class', 'classname classtoken').exec(function(err, user){
    res.render('instructor_landing',{data:user._class, link:"instructor"});
    })
});

//course homepage
router.route('/:classname/coursepage')
        .get(isInstructor,function(req,res){
            var bricks;
            Class.findOne({classname:req.params.classname}).populate('_bricks _students').exec(function(err, myclass){
                if(err) res.send(err);
                if(myclass._bricks) {bricks = myclass._bricks; } 
                else{
                    bricks =[];
                } 
                req.session.classId = myclass._id;
                req.session.classname = myclass.classname;
                res.render('instructor_coursepage',{link:"instructor", data:myclass._bricks, classname:myclass.classname});
            })
        });

//page for creating a new class
//reached from home
router.route('/class')
        .get(isInstructor,function(req,res){
          res.render('instructor_add_class', {name:"Instructor", link:"instructor"})  
            })
         .post(function(req,res){
            var token = Math.floor(Math.random() * 1000000);
            var myclass = new Class();
            myclass.classtoken = token;
            myclass.classname = req.body.classname;
            myclass._instructor = req.session.userId;
            myclass.save(function(err, myclass){
                if(err) {
                    res.send(err);
                } else {
                    req.session.classname = req.body.classname;
                    User.findById(req.session.userId, function(err,user){
                         if (err) return res.send(err);
                         user._class.push(myclass);
                         user.save();
                    })
                    req.session.classId = myclass._id;
                    req.session.classname = myclass.classname;
                    req.session.save();
                    res.redirect('/instructor/'+ myclass.classname+'/addbrick');
                }
                })
            });


//creating question
router.route('/:classname/createquestion')
        .get(isInstructor, function(req, res){
            var bricks=[];
            Class.findById(req.session.classId).populate('_bricks').exec(function(err, myclass){
                if(err) return res.send(err);
                if(myclass._bricks) bricks = myclass._bricks;
                res.render('common_create',{name:"Instructor", link:"instructor", classname:myclass.classname, data:bricks})
            })
        })
        .post(function(req,res){
            console.log(req.body);
          var question = new QuestionBank();
            question._class = req.session.classId;
            question._lead = req.session.userId;
            question._brick = req.body.brickId;
            question.question = req.body.question;
            question.options = req.body.options;
            question.correctanswer = req.body.correctanswer;
            question.explanation = req.body.explanation;
  
            question.save(function(err, myquestion){
                 if(err) return res.send(err); 
                 User.findById(req.session.userId, function(err, myuser){
                    if(err) return res.send(err); 
                     myuser._questions.push(myquestion);
                     myuser.save();
                 });
                 Class.findById(req.session.classId, function(err, myclass){
                    if(err) return res.send(err); 
                     myclass._questionBank.push(myquestion);
                     myclass.save();
                 });
                 Brick.findById(req.body.brickId, function(err, mybrick){
                    if(err) return res.send(err); 
                     mybrick._questions.push(myquestion);
                     mybrick.save();
                 });
                 
                res.redirect("/instructor/"+ req.session.classname +"/coursepage");
   });
});

//adding bricks to the class
router.route('/:classname/addbrick')
        .get(isInstructor, function(req, res){
            var bricks =[];
            Class.findOne({classname:req.params.classname}).populate('_bricks', 'brickname').exec(function(err, myclass){
                if(err) res.send(err);
                if(myclass._bricks) bricks = myclass._bricks;  
                req.session.classId = myclass._id;
                req.session.classname = myclass.classname;
                return res.render('instructor_add_bricks',{link:"instructor", token:myclass.classtoken ,classname:myclass.classname, data:bricks});  
            })
        })
        .post(function(req, res){
            var newbrick = new Brick();
            newbrick.brickname = req.body.brickname;
            newbrick.description = req.body.description;
            newbrick._class = req.session.classId;
            newbrick.save(function(err, brick){
                if(err){
                    res.send(err);
                } else {
                    Class.findById(req.session.classId, function(err, myclass){
                        if (err) return res.send(err);
                        classname = myclass.classname;
                        myclass._bricks.push(brick);
                        myclass.save();
                         res.redirect('/instructor/'+myclass.classname +'/addbrick')
                    }) 
                }
        })
        });


//Displaying all the questions in the class
router.route('/:classname/questions')
        .get(isInstructor, function(req, res){
            var evaluation = [];
            Class.findById(req.session.classId).populate('_questions').exec(function(err, myevaluation){
               if(err) res.send(err);
               if(myevaluation._questions) evaluation = myevaluation._questions;
                res.render('instructor_approval', {name:"Instructor", link:"instructor", classname:req.params.classname, data:evaluation});
            })
        })
      

router.route('/:classname/edit/:questionId')
            .get(isInstructor, function(req, res){
                Question.findById(req.params.questionId).populate("_evaluate _brick _lead").exec(function(err, myquestion){
                    res.render('instructor_edit',{name:"Instructor", link:"instructor", classname:req.params.classname, data:myquestion})
                })
            })
          .post(isInstructor, function(req, res){
              console.log(req.body);
              
                var qb = new QuestionBank;
                Question.findById(req.params.questionId, function(err, myquestion){
                    qb._class = myquestion._class;
                    qb._lead = myquestion._lead;
                    qb._brick = myquestion._brick;
                    qb.options = req.body.options;
                    if(req.body.correctanswer){
                        qb.correctanswer = req.body.correctanswer;
                    } else {
                        qb.correctanswer = myquestion.correctanswer;
                    }
                    qb.explanation = req.body.explanation;
                    qb.question = req.body.question;
                    qb.save(function(err, qb){
                        if(err) throw err;
                    User.findByIdAndUpdate(qb._lead,{$pull:{_questions:req.params.questionId}}, function(err, myuser){
                    if(err) return res.send(err); 
                     myuser._questions.push(qb);
                     myuser.save();
                         });
                     Class.findById(qb._class, function(err, myclass){
                    if(err) return res.send(err); 
                     myclass._questionBank.push(qb);
                     myclass.save();
                         });
                     Brick.findById(qb._brick, function(err, mybrick){
                    if(err) return res.send(err); 
                     mybrick._questions.push(qb);
                     mybrick.save();
                         });
                    });
                })
                Question.findByIdAndRemove(req.params.questionId, function(err){
                    if(err) throw err;
                })
                
                res.redirect('/instructor/'+req.params.classname+'/questions');
            })


router.route("/:classname/quiz")
        .get(isInstructor, function(req, res){
            var evaluation = [];
            Class.findById(req.session.classId).populate('_questionBank _questionBank._brick').exec(function(err, myevaluation){
               if(err) res.send(err);
               if(myevaluation._questions) evaluation = myevaluation._questionBank;
                res.render('instructor_quiz', {link:"instructor", classname:req.params.classname, data:evaluation});
             })
        })
        .post(isInstructor, function(req, res){
            var questions;
            console.log(req.body);
            var quiz = new Quiz;
            quiz._class = req.session.classId;
            quiz.quiz_name = req.body.quiz_name;
            for (questions of req.body.questionId) {
                       quiz._questions.push(questions);
                    }
                    console.log(quiz._questions);
            quiz.save(function(err, myquiz){
                if(err) return res.send(err);
                console.log(myquiz);
                Class.findById(req.session.classId, function(err, myclass){
                    if (err) res.send("Some error occured while saving");
                myclass._quizzes.push(myquiz);
                myclass.save();
            })    
                res.redirect("/instructor/"+req.params.classname+"/quiz/performance");
            })   
             
        })


router.get("/:classname/quiz/performance", isInstructor, function(req, res){
        Class.findById(req.session.classId).populate('_quizzes').exec(function(err, myclass){
            console.log(myclass);
            res.render("instructor_quiz_performance",{link:"instructor", classname:req.params.classname, data:myclass});
        })
})

router.route("/:classname/quizperformance")
        .get(isInstructor, function(req, res){
           Class.findById(req.session.classId).populate("_quizzes").exec(function(err, myclass){
               console.log(myclass);
               res.send("done");
           })
        })



router.get("/:classname/quiz/performance", isInstructor, function(req, res){



})




module.exports = router;
