if (process.env.NODE_ENV != 'production') {
    require("dotenv").config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const campgroundRoute = require("./routes/campground");
const reviewRoute = require("./routes/reviews");
const usersRoute = require("./routes/users");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const {User} = require("./models/users");
const Campground = require('./models/campground');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

mongoose.connect((process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'), {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const DBoptions = {
    mongoUrl : process.env.DB_URL,
    touchAfter: 24 * 3600,
    secret: process.env.SECRET,
}

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

mongoose.set('useFindAndModify', false);

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname , "/public")));
app.use(session({
    secret: process.env.SECRET || 'thisshouldbeasecretlmao',
    store: MongoStore.create(DBoptions),
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(
    helmet({
      contentSecurityPolicy: false,
    })
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(User.createStrategy());

app.use((req , res , next) => {
    res.locals.mode = process.env.NODE_ENV;
    res.locals.path = req.path;
    res.locals.user = req.user;
    res.locals.success = req.flash("success");
    res.locals.fail = req.flash("fail");
    next();
})

app.get('/', (req, res) => {
    res.render("home");
});

app.get("/internalApi" , async (req , res) => {
    const data = (await Campground.find({})).map(function(cg) {
        return {
            type: "Feature",
            geometry: cg.geometry,
            properties: {
                title: cg.title,
                location: cg.location,
                id: cg._id
            }
        }
    });
    const responseBody = { features: [...data] };
    res.json(responseBody);
})

app.use("/" , usersRoute);
app.use("/campgrounds" , campgroundRoute);
app.use("/campgrounds/:id/review" , reviewRoute);

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen((process.env.PORT || 3000), () => {
    console.log(`Serving on port ${(process.env.PORT || 3000)}`);
})