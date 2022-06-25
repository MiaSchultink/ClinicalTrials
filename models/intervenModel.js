const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const intervenModelSchema= new Schema({

   interventionModel:{
    type:String,
    unique: true
   }
})

module.exports = mongoose.model('IntervenModel', intervenModelSchema);