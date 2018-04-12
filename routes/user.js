var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var passport = require ('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');

// database connection to this route
var User = require ('../models/User');
var isLoggedIn = require('./middleware/isLoggedIn');


//rendering Registration Form for the user
router.get('/signup', function(req, res){
    res.render('signup');
});

//Registering user into crowdlearning application

router.post('/signup', function(req,res){
    if (req.body.role == "Instructor"){
        if(req.body.passcode != "cl2017an") return res.render("error",{error:"Sorry the passcode is wrong, please go back and try again"});
    }
     var newUser = new User({
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        role:req.body.role,
        username:req.body.username,
        ub_number:req.body.ubnumber,
        password:req.body.password
    })
    newUser.createUser(newUser, function(err, user){
        if (err){
            if(err.name ==='MongoError' && err.code ===11000){
                return res.render('error',{error:"Username already exist, please try registering with another username"});
            }
            res.send(err);
        } else {
            req.login(user, function(err){
                if(err){
                    res.send(err);
                }
             res.redirect("/user/login");
            });
        }
    });
});


router.get('/login', function(req, res){
    res.render('login');
});


router.post('/login', function(req, res, done){
        User.findOne({username:req.body.username}).exec(function(err, user){
                if (err){res.send(err);}
        if(!user){
           return res.render("error", {error:"Sorry you have not registered in crowdlearning! :("});
        }

        if(!bcrypt.compareSync(req.body.password, user.password)){
            return res.render("error", {error:"Sorry you have entered the wrong password! Please go back and try again :)"})
        } else {
            if(user.role=="Student"){
            req.session.student = user.firstname;
            req.session.userId = user._id;
            req.session.teamId = user._currentteam;
            res.redirect('/student/course');
            return done(null,user);
            }else {
             req.session.instructor = user.firstname;
             req.session.userId = user._id;

             res.redirect('/instructor/home');
             return done(null,user);
            }
        }
            });
});


router.get("/logout", function(req, res) {
        req.session.destroy();
         res.redirect("/");
});


 module.exports = router;




