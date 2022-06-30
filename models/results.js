const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const resultsSchema = new Schema({

    hasResults:{
        type:Boolean
    },
    resultsFirstPostedDate:{
        type:String
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
    }

})

module.exports = mongoose.model('Results', resultsSchema);
