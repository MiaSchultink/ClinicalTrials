const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const resultsSchema = new Schema({

    primaryOutcomeDescription: {
        type: String
    },
    whyStopped: {
        type: String
    }

})

module.exports = mongoose.model('Results', resultsSchema);
