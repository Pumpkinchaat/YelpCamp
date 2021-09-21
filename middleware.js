const express = require("express");
const { campgroundSchema , reviewSchema } = require('./schemas.js');
const Campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');
const Review = require("./models/reviews");

module.exports.isLoggedIn = (req , res , next) => {
    if (req.isAuthenticated()) next();
    else {
        req.session.redirect = req.originalUrl;
        req.flash("fail" , "You need to login first");
        return res.redirect("/login");
    }
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.campgroundAuthorise = async (req , res , next) => { 
    const {id} = req.params;
    if (id) {
        const campground = await Campground.findById(id).populate("author");
        if (res.locals.user && campground.author._id.equals(res.locals.user._id)) next();
        else {
            req.flash("fail" , "You are not authorised to make changes");
            res.redirect(`/campgrounds/${id}`);
        }
    }
}

module.exports.validateReview = (req , res , next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.reviewsAuthorise = async (req , res , next) => {
    const {id , reviewId} = req.params;
    const review = await Review.findById(reviewId).populate("author");
    if (review.author._id.equals(res.locals.user._id)) next();
    else {
        req.flash("fail" , "You are not authorised to do this");
        res.redirect(`/campgrounds/${id}`);
    }
}