const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const compDateSchema= new Schema({

  day:{
    type:String
  },
  month:{
    type:String
  },
  year:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'CompYear',
    unique:true
  }
})

module.exports = mongoose.model('CompDate', compDateSchema);