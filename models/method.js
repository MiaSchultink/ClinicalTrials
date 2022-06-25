const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const methodSchema= new Schema({

    allocation:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Allocation'
    },
    interventionModel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'IntervenModel'
    },
    inverventionModelDescription:{
        type:String
    },
    primaryOutcomeMeasure:{
        type:String
    },
    outcomeMeasureDescription:{
        type:String
    }
   
})

module.exports = mongoose.model('Method', methodSchema);
