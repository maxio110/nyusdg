var mongoose = require('mongoose');


var userSchema = new mongoose.Schema({
    username: String,
    salt: String,
    hash: String
}, {collection: "users"});


var dataSchema = new mongoose.Schema({
    category: String,
    name: String,
    created: {type: Date, default: Date.now},
    discount: String,// default
    requirement: String,
    info: String,
    web: String,
    logo: String,
    lat: String,
    lng: String,
    location: String,
    phone: String
}, {collection: "data"});

exports.User = mongoose.model("users", userSchema);
exports.Data = mongoose.model("data", dataSchema);