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
        type: [String]
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

    //participants and participanet fields
    participants:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Participants'
    },
    minAge:{
        type:Number
    },
    maxAge:{
        type:Number
    },
    gender:{
        type:String
    },
    //method and method fields
    method:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Method'
    },
    allocation:{
        type:String
    },
    interventionModel:{
        type:String
     },
     inverventionModelDescription:{
         type:String
     },
     primaryOutcomeMeasure:{
         type:String
     },
     outcomeMeasureDescription:{
         type:String
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

    isFDAreg:{
        type: Boolean
    },
    creators:{
        type:String
    },
    purpose:{
        type:String
    },
    startDate:{
        type: Date
    },
    startYear:{
        type:String,
    },
    startMonth:{
        type:String,
    },
    startDay:{
        type:String
    },
    compDay:{
        type:String,
    },
    compDate:{
        type: Date
    },
    compYear:{
        type:String,
    },
    compMonth:{
        type:String
    },
    compDay:{
        type:String
    },
    //resutls and resutls data
    results:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resutls'
    },
    primaryOutcomeDescription: {
        type: String
    },
    secondaryOutComesDescription:{
        type:String,
    },
    otherOutcomesDescription:{
        type:String
    },
    whyStopped: {
        type: String
    },
    url:{
        type:String,
    },
})

module.exports = mongoose.model('Study', studySchema)
