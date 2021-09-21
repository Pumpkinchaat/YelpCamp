const mongoose = require('mongoose');
const Review = require("./reviews");
const User = require("../models/users");
const {cloudinary} = require("../cloudinary_config");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    url : String,
    filename : String
});

imageSchema.virtual("indexCard").get(function() {
    return this.url.replace("/upload/" , "/upload/w_450,h_300,c_fill/");
})

imageSchema.virtual("thumbnail").get(function() {
    return this.url.replace("/upload/" , "/upload/w_150,h_150,c_fill/");
})

imageSchema.virtual("showcase").get(function() {
    return this.url.replace("/upload/" , "/upload/w_1000,h_800,c_fill/");
})

const CampgroundSchema = new Schema({
    title: String,
    image: [imageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review"
        }
    ]
});

CampgroundSchema.virtual("descp").get(function() {
    return `${this.description.substring(0 , 20)}....`;
})

CampgroundSchema.post("findOneAndDelete" , async function (campground) {
    for (let reviewId of campground.reviews) {
        await Review.findByIdAndDelete(reviewId);
    }
    for (let img_obj of campground.image) {
        const filename = img_obj.filename;
        await cloudinary.uploader.destroy(filename);
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);