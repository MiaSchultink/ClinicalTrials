const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const minAgeSchema= new Schema({

   minAge: {
    type:Number,
    unique:true
   }
   
})

module.exports = mongoose.model('MinAge', minAgeSchema);
