const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const participantsSchema= new Schema({

    minAge:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'MinAge'
    },
    maxAge:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'MaxAge'
    },
    gender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Gender'
    }
   
})

module.exports = mongoose.model('Participants', participantsSchema);
