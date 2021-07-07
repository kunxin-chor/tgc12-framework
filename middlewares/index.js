const checkIfAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        req.flash("error_messages", "You need to sign in to access this page");
        res.redirect('/users/login')
    }
}

module.exports = {
    checkIfAuthenticated
}