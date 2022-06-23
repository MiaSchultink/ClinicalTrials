const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const studySchema = new Schema({

    rank: {
        type: Number,
        required: true
    },
    NCTID: {
        type: String,
        required: true,
        unique: true
    },
    officialTitle: {
        type: String
    },
    briefSumarry: {
        type: String
    },
    detailedDescription: {
        type: String
    },
    enrollment: {
        type: Number,
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    }
})

module.exports = mongoose.model('Study', studySchema)
