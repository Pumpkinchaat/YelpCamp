require("dotenv").config();

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 20; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const geoData = await geocoder.forwardGeocode({
            query: `${cities[random1000].city}, ${cities[random1000].state}`,
            limit: 1
        }).send();
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: geoData.body.features[0].geometry,
            image: [
                {
                  url: 'https://res.cloudinary.com/dug6rssoa/image/upload/v1632054262/Yelp-Camp/vexcy9yzasgmsurxuo0f.jpg',
                  filename: 'Yelp-Camp/vexcy9yzasgmsurxuo0f'
                },
                {
                  url: 'https://res.cloudinary.com/dug6rssoa/image/upload/v1632054261/Yelp-Camp/yeistwdclsowm6ebkfba.jpg',
                  filename: 'Yelp-Camp/yeistwdclsowm6ebkfba'
                }
            ],
            author: '61335ea7855c8811648cd53c', //this is the admin author {test1}
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})