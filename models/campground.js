const mongoose = require('mongoose');

const { cloudinary } = require('../cloudinary');

const Review = require('./review');

const Schema = mongoose.Schema;

const opts = { toJSON: {virtuals: true} };

// created a separate schema for image so that we can create virtual prop
const imageSchema = new Schema ({
    url: String,
    filename: String
});

// virtual
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_150,h_100');
});

const CampgroundSchema = new Schema({
    title: String,
    images: [imageSchema], // embeded image schema
    geometry: {
        type: {
            type: String,
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review' //model name
        }
    ]   
}, opts);

CampgroundSchema.virtual('properties.popupMarkup').get(function () {
    return  `<strong><a href=\\"/campgrounds/${this._id}\\">${this.title}</a></strong><p>${this.description.substring(0, 25)}...</p>`;
})

CampgroundSchema.post('findOneAndDelete', async function(doc) {
    // if a campground is deleted
    if(doc){
        await Review.deleteMany({
            // delete reviews where review _id is in the deleted campground's reviews array
            _id: {
                $in: doc.reviews
            }
        });

        for (const image of doc.images) {
            cloudinary.uploader.destroy(image.filename);
        }
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);