const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const {Schema , model} = mongoose;

const userSchema = new Schema({
    email : {
        type : String,
        required : [true , "There should be an email"],
        unique : true
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports.User = model("User" , userSchema);