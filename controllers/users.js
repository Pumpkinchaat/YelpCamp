const {User} = require("../models/users");

module.exports.renderRegisterForm = (req , res) => {
    res.render("users/register");
};

module.exports.postRegisterForm = async (req , res) => {
    try {
        const {email , username , password} = req.body;
        const user = new User({email , username});
        const newUser = await User.register(user , password);
        await req.login(newUser , function(err) {
            if (err) return next(err);
            else {
                req.flash("success" , "Welcome to the YelpCamp")
                res.redirect("/campgrounds");
            }
        })
    } catch (err) {
        req.flash('fail' , err.message);
        res.redirect("/register");
    }
};

module.exports.renderLoginForm = (req , res) => {
    res.render("users/login");
};

module.exports.loginRedirect = (req , res) => {
    const redirect = req.session.redirect || "/campgrounds";
    req.session.redirect = null;
    res.redirect(redirect);
};

module.exports.logout = (req , res) => {
    req.logout();
    req.flash("success" , "GoodBye! Hope to see ya soon!");
    res.redirect("/campgrounds");
};