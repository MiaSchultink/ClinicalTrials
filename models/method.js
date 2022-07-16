const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const methodSchema= new Schema({

    allocation:{
        type:String
    },
    interventionType:{
        type:String
    },
    interventionName:{
        type:String
    },
    interventionDescription:{
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
    secondaryOutcomeMeasure:{
        type:String
    },
    outcomeMeasureDescription:{
        type:String
    },
    masking:{
        type:String
    },
    
   
})

module.exports = mongoose.model('Method', methodSchema);
