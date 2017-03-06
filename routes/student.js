var express = require('express');
var router = express.Router();

//models connection
var Question = require('../models/Question');
var Class = require('../models/Class');
var User = require('../models/User');
var Brick = require('../models/Brick');
var Evaluate = require('../models/Evaluate');
var QuestionBank = require('../models/QuestionBank')
//middleware
var isLoggedIn = require('./middleware/isLoggedIn');



router.get('/home', isLoggedIn, function(req, res){
    User.findById(req.session.userId).populate('_class', 'classname').exec(function(err, user){
        if(err) return res.send(err);
    res.render('student_landing',{data:user._class});
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


router.route('/class')
        .get(isLoggedIn, function(req,res){
          res.render('student_join_class', {name:req.session.student, link:"student"})  
            })
         .post(function(req,res){
             Class.findOne({classname:req.body.classname}, function(err, myclass){
                         if(err) return res.send(err);
                         if(!myclass){
                                    return res.send("Sorry the class you searched for is not available in crowdlearning! :(");
                                  }
                         if(myclass.classtoken!=req.body.classtoken){
                                    return res.send("Sorry the classtoken doesn't match! :(");
                         }         
                        if(myclass.classtoken == req.body.classtoken){
                                    User.findById(req.session.userId, function(err, myuser){
                                        if(err) return res.send(err);
                                        myuser._class.push(myclass);
                                        myuser.save();   
                                        myclass._students.push(myuser);
                                        myclass.save();
                                 })
                                    req.session.classId = myclass._id;
                                    req.session.classname = myclass.classname;
                                 res.redirect('/student/'+ myclass.classname+'/coursepage');
                        }
             })   
            });


router.get('/:classname/coursepage',isLoggedIn, function(req, res){
            Class.findOne({classname:req.params.classname}).populate('_bricks', 'brickname').exec(function(err, myclass){
                if(err) res.send(err);
                req.session.classname = myclass.classname;
                req.session.classId = myclass._id;
                res.render('student_coursepage',{name:req.session.student, link:"student",classname:myclass.classname});
            })
        });


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


        
router.route('/:classname/evaluate')
        .get(isLoggedIn, function(req,res){
            Class.findById(req.session.classId).populate({path:'_questions', match :{ "_lead":{$ne:req.session.userId}}})
            .exec(function(err, myclass){
                if(err) return res.send(err);
                if(myclass._questions.length == 0) return res.render("error",{error:"No questions to Evaluate at this moment, please come back later :)"});
                var i = Math.floor(Math.random()*myclass._questions.length); 
                console.log(i);
                console.log(myclass);
                Brick.findById(myclass._questions[i]._brick, function(err, mybrick){
                        if(err) return res.send("Something wrong with the question");
                        req.session.questionId = myclass._questions[i]._id;
                     res.render('student_evaluation',{ link:"student", data:myclass._questions[i], brick:mybrick.brickname, classname:req.params.classname});

                })
            })

        })
        .post(function(req,res){
            console.log(req.body);
            var evaluate = new Evaluate();
            evaluate._question = req.session.questionId;
            evaluate.stem = req.body.stem;
            evaluate.clarity_lan = req.body.clarity_lan;
            evaluate.question_setup = req.body.question_setup;
            evaluate.predicted= req.body.predicted;
            evaluate.comments = req.body.comments;

            evaluate.save(function(err, myevaluation){
                if(err) return res.send(err);
                console.log(myevaluation);
                Question.findById(req.session.questionId, function(err, myquestion){
                    myquestion._evaluate.push(myevaluation);
                    myquestion.save();
                })
                res.redirect("/student/"+req.session.classname +"/evaluate")
            })

        })


router.post('/:classname/statistics', isLoggedIn, function(req, res){
    console.log("the request of the body" + req.body.answer);
        console.log("the request of the query" + req.query.answer);

    res.send("Great");
})



module.exports = router;
