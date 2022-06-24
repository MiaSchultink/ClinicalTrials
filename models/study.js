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
    phase:{
        type: String
    },
    status:{
        type:String,
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
    participants:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Participants'
    },
    method:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Method'
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    isFDAreg:{
        type: Boolean
    },
    creators:{
        type:String
    },
    purpose:{
        type:String
    },
    results:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resutls'
    }
})

module.exports = mongoose.model('Study', studySchema)
