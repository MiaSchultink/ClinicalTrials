const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const maxAgeSchema= new Schema({

   maxAge:{
    type:Number,
    unique:true
   }
})

module.exports = mongoose.model('MaxAge', maxAgeSchema );
