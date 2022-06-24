const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const participantsSchema= new Schema({

    minAge:{
        type:Number
    },
    maxAge:{
        type:Number
    },
    gender:{
        type:String
    }
   
})

module.exports = mongoose.model('Participants', participantsSchema);