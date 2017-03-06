module.exports = function isLoggedIn(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect("/user/login");
}

