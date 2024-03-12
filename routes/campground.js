const express = require('express');
const multer  = require('multer')

const campgroundController = require('../controllers/campground');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const { storage } = require('../cloudinary'); //no need to include /index -- node is automatically looking for index.js file

const router = express.Router();
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(campgroundController.index))
    .post(isLoggedIn, upload.array('images'), validateCampground, catchAsync(campgroundController.create));

router.get('/new', isLoggedIn, campgroundController.new);

router.route('/:id')
    .get(catchAsync(campgroundController.show))
    .put(isLoggedIn, isAuthor, upload.array('images'), validateCampground, catchAsync(campgroundController.update))
    .delete(isLoggedIn, isAuthor, catchAsync(campgroundController.delete))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgroundController.edit))

module.exports = router;