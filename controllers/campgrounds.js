const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const {cloudinary} = require("../cloudinary_config");
const Campground = require('../models/campground');

module.exports.campgroundsIndex = async (req, res) => {
    const campgrounds = await Campground.find({});
    // console.log(campgrounds);
    res.render('campgrounds/index', { campgrounds , accessToken : process.env.MAPBOX_TOKEN })
};

module.exports.renderCampgroundNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.postCampgroundNewForm = async (req, res, next) => {
    const {title , price , description , location} = req.body.campground;
    const geoData = await geocoder.forwardGeocode({
        query: location,
        limit: 1
    }).send();
    const image = req.files.map(img_obj => ({url: img_obj.path , filename: img_obj.filename}));
    const author = res.locals.user._id;
    const campground = new Campground({title , image , price , description , location , author , image , geometry: geoData.body.features[0].geometry});
    await campground.save();
    req.flash("success" , "A New Campground was added successfully");
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.getCampground = async (req, res,) => {
    const authBool = req.isAuthenticated();
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    .populate("image");
    if (!campground) {
        req.flash("fail" , "The campground was not found");
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/show', { campground , authBool , accessToken : process.env.MAPBOX_TOKEN });
};

module.exports.renderCampgroundEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash("fail" , "The campground was not found");
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/edit', { campground });
};

module.exports.putCampgroundEditForm = async (req, res) => {
    const deleteimages = req.body.deleteimages;
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const image = req.files.map(img_obj => ({url: img_obj.path , filename: img_obj.filename}));
    if (image) {
        campground.image.push(...image);
        await campground.save();
    }
    if (deleteimages) {
        await Campground.findByIdAndUpdate(id , {$pull: {image: {filename: {$in: [...deleteimages]}}}});
        for (let filename of deleteimages) {
            await cloudinary.uploader.destroy(filename);
        }
    }
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const geometry = geoData.body.features[0].geometry;
    await Campground.findByIdAndUpdate(id , {...req.body.campground , geometry});
    req.flash("success" , `${campground.title} was updated successfully`);
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success" , "The Campground was deleted successfully");
    res.redirect('/campgrounds');
};