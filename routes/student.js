var express = require('express');
var router = express.Router();

//models connection
var Question = require('../models/Question');
var Class = require('../models/Class');
var User = require('../models/User');
var Brick = require('../models/Brick');
var Evaluate = require('../models/Evaluate');
var Statistics = require('../models/Statistics');
var QuestionBank = require('../models/QuestionBank');
var Quiz = require('../models/Quiz');
var UserEvaluate = require('../models/UserEvaluate');
//middleware
var isLoggedIn = require('./middleware/isLoggedIn');



router.get('/home', isLoggedIn, function(req, res){
    User.findById(req.session.userId).populate('_class', 'classname').exec(function(err, user){
        if(err) return res.send(err);
    res.render('student_landing',{data:user._class});
    })
});

router.get('/:classname/coursepage',isLoggedIn, function(req, res){
    var myquestions = 0;
            Class.findOne({classname:req.params.classname}).populate('_bricks', 'brickname').exec(function(err, myclass){
                if(err) res.send(err);
                req.session.classname = myclass.classname;
                req.session.classId = myclass._id;
                User.findById(req.session.userId, function(err, myuser){
                    if(myuser._questions) myquestions = myuser._questions.length;
                    console.log(myuser);
                    console.log(myquestions);
                    res.render('student_coursepage',{name:req.session.student, link:"student",classname:myclass.classname, data:myclass, myquestions:myquestions});
                })
            })
         }); 


router.route('/:classname/createquestion')
        .get(isLoggedIn,function(req, res){
            var bricks=[];
            Class.findById(req.session.classId).populate('_bricks').exec(function(err, myclass){
                if(err) return res.send(err);
                if(myclass._bricks) bricks = myclass._bricks;
                res.render('common_create',{name:req.session.student, link:"student", data:bricks, classname:req.session.classname})
            })
        })
        .post(function(req,res){
             var question = new Question();
            question._class = req.session.classId;
            question._lead = req.session.userId;
            question._brick = req.body.brickId;
            question.question = req.body.question;
            question.options = req.body.options;
            question.correctanswer = req.body.correctanswer;
            question.explanation = req.body.explanation;
  
            question.save(function(err, myquestion){
                 if(err) res.send(err); 
                 User.findById(req.session.userId, function(err, myuser){
                     myuser._questions.push(myquestion);
                     myuser.save();
                 });
                 Class.findById(req.session.classId, function(err, myclass){
                     myclass._questions.push(myquestion);
                     myclass.save();
                 });
                 Brick.findById(req.body.brickId, function(err, mybrick){
                     mybrick._questions.push(myquestion);
                     mybrick.save();
                 });
                res.redirect("/student/"+ req.session.classname +"/coursepage");
   });
});


router.route('/:classname/myquestions')
                    .get(isLoggedIn, function(req, res){
                        var myquestion = [];
                        var questionbank = [];
                        User.findById(req.session.userId).populate({path:'_questions', populate:{path:'_brick', model:'Brick'}}).populate({path:'_solved', populate:{path:'_brick', model:'Brick'}}).exec(function(err, myquestions){
                            if(err) return res.render("error", {error:err});
                            if(myquestions._questions) myquestion = myquestions._questions;
                            if(myquestions._solved) questionbank = myquestions._solved;
                            res.render("student_myquestion",{data:myquestion, classname: req.params.classname,questionbank:questionbank,link:"student"});
                        })
                    }) 
router.route('/:classname/edit/:questionId')                 
        .get(isLoggedIn, function(req, res){
            var myevaluate = []
                Question.findById(req.params.questionId).populate("_evaluate _brick").exec(function(err, myquestion){
                        if(myquestion._evaluate) myevaluate = myquestion._evaluate
                    res.render('student_edit',{ link:"student", classname:req.params.classname, data:myquestion, evaluate:myevaluate })
                })
            })
          .post(isLoggedIn, function(req, res){
                Question.findByIdAndUpdate(req.params.questionId,{$set:req.body}, function(err, myquestion){
                        if(err) throw err;
                   res.redirect('/student/'+req.params.classname+'/myquestions');
                    });
            })

router.route('/:classname/solve')
        .get(isLoggedIn, function(req, res){
            Class.findById(req.session.classId).populate('_questionBank').exec(function(err, myclass){ 
                var i = Math.floor(Math.random()*myclass._questionBank.length);       
                req.session.qbId = myclass._questionBank[i]._id;  
                req.session.correctanswer = myclass._questionBank[i].correctanswer;
                return res.render('student_solve',{classname:req.params.classname, link:"student", data:myclass._questionBank[i]});
            })
        })

        .post(isLoggedIn, function(req, res){
            if(req.body.answer ==req.session.correctanswer){
                req.session.correctanswer = null;
                    QuestionBank.findByIdAndUpdate(req.session.qbId, {$inc:{right:1}}, function(err, myqb){
                        myqb._attempt.push(req.session.userId);
                        myqb.save();
                         User.findById(req.session.userId, function(err, myuser){
                             myuser._solved.push(myqb._id);
                             myuser.save();
                             })
                        res.render('student_solve_submit',{classname:req.params.classname, link:"student", data:myqb, answer:"You have answered it right", color:"green"});
                    })    
        } else {
             req.session.correctanswer = null;
                QuestionBank.findByIdAndUpdate(req.session.qbId, {$inc:{wrong:1}}, function(err, myqb){
                        myqb._attempt.push(req.session.userId);
                        myqb.save();
                        res.render('student_solve_submit',{ classname:req.params.classname, link:"student", data:myqb,answer:"Wrong answer", color:"red"});
            })
            }
        })


router.get('/:classname/evaluat/', isLoggedIn, function(req, res){
                Class.findById(req.session.classId).populate({path:'_questions', match :{ "_lead":{$ne:req.session.userId}}}).exec(function(err, myclass){
                req.session.myquestions = [];
                for ( var i = 0; i< myclass._questions.length; i++){
                    req.session.myquestions[i] = myclass._questions[i]._id;
                }
                req.session.itr = 0;
                return res.render('student_evaluate_guide', {link:"student", classname:req.params.classname});
                })
})
        
router.route('/:classname/evaluate')
        .get(isLoggedIn, function(req,res){
            if(req.session.itr < 9){
                req.session.myclassname = req.params.classname;
                req.session.itr++;
                console.log("session" + req.session.myquestions);
                Question.findById(req.session.myquestions[req.session.itr - 1]).exec(function(err, myquestion){
                    console.log(myquestion);
                 return res.render('student_evaluation', {link:"student", data:myquestion, classname:req.params.classname})       
                })
            } else{
                req.session.myquestions = null;
                return res.render('session_end',{link:"student", classname:req.params.classname});}
            })
        .post(function(req,res){
            var evaluate = new Evaluate();
            evaluate._question = req.session.myquestions[req.session.itr - 1];
            evaluate._evaluatedBy = req.session.userId;      
            evaluate.clarity = req.body.clarity;
            evaluate.difficulty = req.body.difficulty;
            evaluate.creativity = req.body.creativity;
            evaluate.time= req.body.time;
            evaluate.comments = req.body.comments;
            evaluate.save(function(err, myevaluation){
                if(err) return res.send(err);
                Question.findById(req.session.myquestions[req.session.itr - 1], function(err, myquestion){
                    myquestion._evaluate.push(myevaluation);
                    myquestion.save();
                    res.redirect('/student/'+req.session.myclassname+'/evaluate');
                })
            })
        })

router.route('/joinclass')
        .get(isLoggedIn, function(req,res){
          res.render('common_join_class', {link:"student"})  
            })
         .post(function(req,res){
             Class.findOne({classtoken:req.body.classtoken}, function(err, myclass){
                         if(err) return res.send(err);
                         if(!myclass){
                                    return res.render("error",{ error:"Sorry the class you searched for is not available in crowdlearning! :("});
                                  }        
                        
                                    User.findById(req.session.userId, function(err, myuser){
                                        if(err) return res.send(err);
                                        myuser._class.push(myclass);
                                        myuser.save();   
                                        myclass._students.push(myuser);
                                        myclass.save();
                                 
                                    req.session.classId = myclass._id;
                                    req.session.classname = myclass.classname;
                                 res.redirect('/student/'+ myclass.classname+'/coursepage');
                        
             });   
            });
         });



router.route('/:classname/show/:questionId')
            .get(isLoggedIn, function(req, res){
                QuestionBank.findById(req.params.questionId).exec(function(err, myquestion){
                    res.render('common_display',{ link2:"myquestions" ,link:"student", classname:req.params.classname, data:myquestion})
                })
            })


router.get("/:classname/quiz", isLoggedIn, function(req,res){
                    req.session.score = 0;
                    req.session.number = 0;
                    req.session.itr = 0;
                
                    Class.findById(req.session.classId).populate('_quizzes').exec(function(err, myclass){
                        if(myclass._quizzes){
                            Quiz.findById(myclass._quizzes[2].id).exec(function(err, myquiz){
                                myquiz._attempt.push(req.session.userId);
                                myquiz.save();
                            })
                        }
                        req.session.quizId = myclass._quizzes[2].id;
                            res.render("student_quiz", {link:"student", classname:req.params.classname, id:myclass._quizzes[2].id});
                    })                 
            })

router.route('/:classname/quiz/:quizId')
                .get(isLoggedIn, function(req, res){
                    Quiz.findById(req.params.quizId).populate("_questions").exec(function(err, myquiz){
                        console.log(myquiz);
                        if(req.session.itr < myquiz._questions.length){
                            ++req.session.number;
                            req.session.qbId = myquiz._questions[req.session.itr]._id;  
                            req.session.correctanswer = myquiz._questions[req.session.itr].correctanswer;
                            req.session.itr++;
                            return res.render('student_quiz_solve',{classname:req.params.classname, link:"student", data:myquiz._questions[req.session.itr -1], id:req.params.quizId, number: req.session.number});
                        }
                          var stat = new Statistics();
                          stat.userId = req.session.userId;
                          stat.score = req.session.score;
                          stat.save();  
                        return res.render("student_quiz_end",{link:"student", score: req.session.score, number: req.session.number, classname: req.params.classname})
                    })
                })
                .post(isLoggedIn, function(req, res){
                     if(req.body.answer ==req.session.correctanswer){
                         req.session.correctanswer = null;
                         ++req.session.score;
                         QuestionBank.findById(req.session.qbId, function(err, myqb){
                            res.render('student_quiz_solve_submit',{classname:req.params.classname, link:"student", data:myqb, answer:"You have answered it right", color:"green", id:req.session.quizId, score:req.session.score, number: req.session.number});   
                         })
                     } else {
                         req.session.correctanswer = null;
                         QuestionBank.findById(req.session.qbId, function(err, myqb){
                        res.render('student_quiz_solve_submit',{ classname:req.params.classname, link:"student", data:myqb,answer:"Wrong answer", color:"red", score:req.session.score, id:req.session.quizId, number: req.session.number});
                         })
            }
        })



module.exports = router;
