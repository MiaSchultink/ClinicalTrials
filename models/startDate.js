const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const startDateSchema= new Schema({

  day:{
    type:String
  },
  month:{
    type:String
  },
  year:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StartYear',
    unique:true
  }
})

module.exports = mongoose.model('StartDate', startDateSchema);