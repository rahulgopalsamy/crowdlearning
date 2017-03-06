module.exports = function isInstructor(req, res, next) {
    if(req.session.instructor){
        return next();
    }
    res.redirect('/user/login');
}

