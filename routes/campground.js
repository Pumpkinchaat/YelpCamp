const express = require("express");
const Router = express.Router();
const multer = require("multer");
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn , validateCampground , campgroundAuthorise} = require("../middleware");
const campgrounds = require("../controllers/campgrounds");

const {storage} = require("../cloudinary_config");
const upload = multer({ storage });

Router.route("/")
    .get(catchAsync(campgrounds.campgroundsIndex))
    .post(isLoggedIn ,upload.array("image") , validateCampground, catchAsync(campgrounds.postCampgroundNewForm))

Router.get('/new', isLoggedIn , campgrounds.renderCampgroundNewForm);

Router.route("/:id")
    .get(catchAsync(campgrounds.getCampground))
    .put(isLoggedIn ,upload.array("image") , validateCampground, campgroundAuthorise , catchAsync(campgrounds.putCampgroundEditForm))
    .delete(isLoggedIn , campgroundAuthorise , catchAsync(campgrounds.deleteCampground))

Router.get('/:id/edit', isLoggedIn , campgroundAuthorise , catchAsync(campgrounds.renderCampgroundEditForm));

module.exports = Router;