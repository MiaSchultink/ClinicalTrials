const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const allocationSchema= new Schema({

  allocation:{
    type:String,
    unique:true
  }
})

module.exports = mongoose.model('Allocaiton', allocationSchema );