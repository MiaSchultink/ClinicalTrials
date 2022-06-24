const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const methodSchema= new Schema({

    allocation:{
        type:String,
    },
    interventionModel:{
        type:String
    },
    inverventionModelDescription:{
        type:String
    },
    primaryPurpous:{
        type:String
    }

   
})

module.exports = mongoose.model('Method', methodSchema);
