const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const startYearSchema= new Schema({

  year:{
    type:String,
    unique:true
  }
})

module.exports = mongoose.model('StartYear', startYearSchema);