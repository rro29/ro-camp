const express = require('express');

const reviewController = require('../controllers/review');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware')

const router = express.Router({mergeParams: true});

router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.create));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.delete));

module.exports = router;