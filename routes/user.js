const express = require('express');
const passport = require('passport');

const userController = require('../controllers/user');
const catchAsync = require('../utils/catchAsync');
const { storeReturnTo } = require('../middleware');

const router = express.Router();

router.route('/register')
    .get(userController.registerForm)
    .post(catchAsync(userController.registerCreate));


router.route('/login')
    .get(userController.loginForm)
    .post(
        storeReturnTo,
        passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'}),
        catchAsync(userController.login)
    );

router.get('/logout', userController.logout); 

module.exports = router;