const mongoose = require("mongoose");
const {Schema , model} = mongoose;
const User = require("./users");

const reviewSchema = new Schema({
    body : {
        type : String,
        required : [true , "The body of the review is required"]
    },
    rating : {
        type : Number,
        required : [true , "The rating is required"],
        min : [1 , "The minimum review should be positive 1"],
        max : [5, "The maximum review should be 5"]
    },
    campground : {
        type : Schema.Types.ObjectId,
        ref : "Campground"
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }
});

const Review = model("Review" , reviewSchema);
module.exports = Review;