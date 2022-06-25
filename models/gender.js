const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const genderSchema= new Schema({

  gender:{
    type:String,
    unique:true
  }
})

module.exports = mongoose.model('Gender', genderSchema);
