const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

const mapboxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({accessToken: mapboxToken});

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}

module.exports.new = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.create = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({query: req.body.campground.location, limit: 1}).send();
    
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground)
    req.flash('success', 'Successfully added the new campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.show = async (req, res) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
        .populate({path: 'reviews', populate: {path: 'author'}})
        .populate('author');

    if(!campground) {
        req.flash('error', 'The Campground you\'re looking for does not exist.');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/show', {campground});
}

module.exports.edit = async (req, res) => {
    const {id} = req.params
    const campground = await Campground.findById(id);

    if(!campground) {
        req.flash('error', 'The Campground you\'re looking for does not exist.');
        return res.redirect('/campgrounds');
    }
    
    res.render('campgrounds/edit', {campground});
}

module.exports.update = async (req, res) => {
    const {id} = req.params
    const updatedCampground = await Campground.findByIdAndUpdate(id, req.body.campground, {new: true, runValidators: true});
    const newImages = req.files.map(f => ({url: f.path, filename: f.filename}));
    updatedCampground.images.push(...newImages);
    await updatedCampground.save();
    if (req.body.deleteImages) {
        for (const filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename);
        }
        await updatedCampground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
        console.log(updatedCampground);
    }
    req.flash('success', 'Campground successfully updated!')
    res.redirect(`/campgrounds/${updatedCampground._id}`);
}

module.exports.delete = async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
}