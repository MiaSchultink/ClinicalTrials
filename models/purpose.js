const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const purposeScheam= new Schema({

  purpose:{
    type:String,
    unique: true
  }
})

module.exports = mongoose.model('Purpose', purposeScheam);
