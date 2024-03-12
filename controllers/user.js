const User = require('../models/user');

module.exports.registerForm = (req, res) => {
    res.render('users/register');
}

module.exports.registerCreate = async (req, res) => {
    try {
        const {username, email, password} = req.body;
    
        const user = new User({username, email});
        const regUser = await User.register(user, password);
        
        req.login(regUser, function(err) {
            if (err) { return next(err); }
            req.flash('success', 'Welcome to my world!');
            res.redirect('/campgrounds');
        });
        
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.loginForm = (req, res) => {
    res.render('users/login');
}

module.exports.login = async (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}