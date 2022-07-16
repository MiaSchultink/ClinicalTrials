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
    type:{
        type:String
    },
    phase: {
        type: [String]
    },
    status: {
        type: String,
    },
    officialTitle: {
        type: String
    },
    briefTitle: {
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

    //participants and participanet fields
    participants: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participants'
    },
    minAge: {
        type: Number
    },
    maxAge: {
        type: Number
    },
    gender: {
        type: String
    },
    //method and method fields
    method: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Method'
    },
    allocation: {
        type: String
    },
    interventionType: {
        type: String
    },
    interventionName: {
        type: String
    },
    interventionDescription: {
        type: String,
    },
    interventionModel: {
        type: String
    },
    interventionModelDescription: {
        type: String
    },

    primaryOutcomeMeasure: {
        type: String
    },
    secondaryOutcomeMeasure: {
        type: String,
    },
    outcomeMeasureDescription: {
        type: String
    },
    masking:{
        type:String
    }, 
    acceptsHealthy:{
        type:Boolean
    },
    //location and location fields
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    country: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    studyFacility: {
        type: String,
        //unique:true
    },

    isFDAreg: {
        type: Boolean
    },
    collaborators: {
        type: String
    },
    leadSponsor: {
        type: String
    },
    purpose: {
        type: String
    },
    //date information
    strSDate: {
        type: String,
    },
    startDate: {
        type: Date
    },
    startYear: {
        type: Number
    },
    startMonth: {
        type: String
    },
    startDay: {
        type: Number
    },
    compDay: {
        type: Number
    },
    strCDate: {
        type: String
    },
    compDate: {
        type: Date
    },
    compYear: {
        type: Number,
    },
    compMonth: {
        type: String
    },
    compDay: {
        type: Number
    },
    //resutls and resutls data
    results: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resutls'
    },
    primaryOutcomeDescription: {
        type: String
    },
    secondaryOutComesDescription: {
        type: String,
    },
    otherOutcomesDescription: {
        type: String
    },
    hasResults: {
        type: Boolean
    },
    dateRetultsPosted: {
        type: String
    },
    whyStopped: {
        type: String
    },
    url: {
        type: String,
    },
})

module.exports = mongoose.model('Study', studySchema)
