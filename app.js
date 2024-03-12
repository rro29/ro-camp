if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override')
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/user');

const User = require('./models/user');

// const dbUrl = process.env.DB_URL;

const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp';

mongoose.connect(dbUrl)
.then(() => console.log('Database connected')).catch(e => console.log(e));

const app = express();

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(mongoSanitize());

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: 'singwhileyoutakeapeeinyourneighborsbathroom',
    touchAfter: 24 * 3600,
    ttl: 14 * 24 * 60 * 60, // = 14 days
    autoRemove: 'native',
    autoRemoveInterval: 10 // In minutes.
});

store.on('error', function(e){
    console.log('Session Error!', e);
})

const sessionConfig = {
    store,
    name: 'session',
    secret: 'singwhileyoutakeapeeinyourneighborsbathroom',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

// passport middleware
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

const scriptSrcUrls = [
    'https://api.mapbox.com/',
    'https://cdn.jsdelivr.net/',

];

const styleSrcUrls = [
    'https://cdn.jsdelivr.net/',
    'https://api.mapbox.com/',
];

const connectSrcUrls = [
    'https://api.mapbox.com/',
    'https://events.mapbox.com/',
];

const fontSrcUrls = [

];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'unsafe-inline'", "'self'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:",],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/",
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls]
        }
    })
);

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

// middleware for 404
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found!', 404));
});

// middleware for encountered errors
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    
    if(!err.message) err.message = 'Something went wrong...';

    res.status(statusCode).render('error', {err});
});


app.listen(3000, () => {
    console.log('Listening on port 3000');
})