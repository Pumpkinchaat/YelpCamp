const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const users = require("../controllers/users");

router.route("/register")
    .get(users.renderRegisterForm)
    .post(catchAsync(users.postRegisterForm))

router.route("/login")
    .get(users.renderLoginForm)
    .post(passport.authenticate("local" , {failureFlash : true , successFlash : "Welcome Back!" , failureRedirect : "/login"}),
    users.loginRedirect);

router.get("/logout" , users.logout);

module.exports = router;