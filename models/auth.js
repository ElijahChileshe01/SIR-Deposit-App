module.exports = {
    ensureAuthenticated: function(req, res, next) {
         if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'you are not logged in');
        res.redirect('login');
    }
}