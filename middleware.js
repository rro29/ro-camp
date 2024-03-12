const { campgroundValidationSchema, reviewValidationSchema } = require('./validationSchemas');
const Campground = require('./models/campground');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError')

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in.')
        return res.redirect('/login');
    }

    next()
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const {error} = campgroundValidationSchema.validate(req.body);
    
    if(error){
        const msg = error.details.map(e => e.message).join(',')
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    
    if(!campground.author._id.equals(req.user._id)) {
        req.flash('error', 'You don\'t have permission to update this campground.');
        return res.redirect(`/campgrounds/${id}`);
    }

    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId, id } = req.params;
    const review = await Review.findById(reviewId);
    
    if(!review.author._id.equals(req.user._id)) {
        req.flash('error', 'You don\'t have permission to update this review.');
        return res.redirect(`/campgrounds/${id}`);
    }

    next();
};

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewValidationSchema.validate(req.body);

    if(error){
        const msg = error.details.map(e => e.message).join(',')
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
}