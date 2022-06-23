const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const locationSchema = new Schema({

    country: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    facility: {
        type: String
    }


})

module.exports = mongoose.model('Location', locationSchema);
