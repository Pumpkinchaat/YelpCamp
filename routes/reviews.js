const express = require("express");
const Router = express.Router({mergeParams : true});
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn , validateReview , reviewsAuthorise} = require("../middleware");
const review = require("../controllers/reviews");

Router.post("/" , isLoggedIn , validateReview , catchAsync(review.postReview));

Router.delete("/:reviewId" , isLoggedIn , reviewsAuthorise , catchAsync(review.deleteReview));

module.exports = Router;