const mongoose = require('mongoose');

const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
.then(() => console.log('Database connected')).catch(e => console.log(e));

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);

        const price = Math.floor(Math.random() * 20) + 10;

        const camp = new Campground({
            title: `${sample(descriptors)}, ${sample(places)}`,
            geometry: { type: "Point", coordinates: [ cities[random1000].longitude, cities[random1000].latitude ] },
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio, impedit aspernatur incidunt recusandae illum magnam, inventore magni quos tenetur repellendus nobis fuga maxime eius at? Sit fugit nam incidunt cumque?',
            author: '65e977fe5de17e173dcfa2aa',
            price,
            images: [
                {
                  url: 'https://res.cloudinary.com/dpz4hzxnc/image/upload/v1709831414/YelpCamp/pogagl3fgh6nxffk68tg.jpg',
                  filename: 'YelpCamp/pogagl3fgh6nxffk68tg',
                },
                {
                  url: 'https://res.cloudinary.com/dpz4hzxnc/image/upload/v1709909056/YelpCamp/hiyull9cuf9pq9deczun.jpg',
                  filename: 'YelpCamp/xjifgavbcpc6p3ousaoz',
                }
              ]
        })

        await camp.save();
    }
}

seedDB().then(() => mongoose.connection.close());