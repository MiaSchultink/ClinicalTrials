const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const statusSchema= new Schema({

  status:{
    type:String,
    unique:true
  }
})

module.exports = mongoose.model('Status', statusSchema);
