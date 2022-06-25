const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const compYearSchema= new Schema({

  year:{
    type:String,
    unique:true
  }
})

module.exports = mongoose.model('CompYear', compYearSchema);